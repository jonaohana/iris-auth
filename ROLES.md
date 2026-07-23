# Roles & Permissions in `@iris/auth`

`@iris/auth` supports authorization via **Firebase custom claims**. A user's
`role` (and optional granular `permissions`) is set server-side with the
Firebase Admin SDK, baked into the signed ID token, and read on the client. This
is the secure, Firebase-native approach: the role is part of the cryptographically
signed token, so it can be trusted by your backend and enforced in Firestore /
Storage security rules — not just hidden in the UI.

There are two halves:

- **Client** (`@iris/auth`) — reads the claims and exposes them through `useAuth()`, hooks, and a `<RoleGate>` component. Works on web and native.
- **Server** (`@iris/auth/admin`) — sets the claims. Import this ONLY from server code (Cloud Functions or a Node backend); it depends on `firebase-admin` and must never be bundled into a client app.

---

## The claim shape

```jsonc
{
  "role": "admin",                         // primary role (string)
  "permissions": ["billing.read", "posts.publish"]  // optional, granular
}
```

`role` covers the "mostly simple" case (admin vs user). `permissions` is there
for when a single role isn't fine-grained enough. By default, any user whose
`role` is a **super role** (`['admin']`) passes every `hasPermission` check
without needing the permission listed explicitly — configurable, see below.

---

## Client usage

### Reading the current user's role

```tsx
import { useAuth } from '@iris/auth';

function Example() {
  const { user, hasRole, hasPermission } = useAuth();

  user?.role;         // 'admin' | 'user' | ... | null
  user?.permissions;  // string[]
  user?.claims;       // full raw claims object

  if (hasRole('admin')) { /* ... */ }
  if (hasRole(['admin', 'editor'])) { /* one of */ }
  if (hasPermission('posts.publish')) { /* ... */ }
  if (hasPermission(['posts.publish', 'posts.delete'])) { /* ALL of */ }
}
```

### Hooks

```tsx
import { useHasRole, useHasPermission, useRole, usePermissions } from '@iris/auth';

const isAdmin = useHasRole('admin');
const canPublish = useHasPermission('posts.publish');
const role = useRole();            // string | null
const perms = usePermissions();    // string[]
```

### `<RoleGate>` — conditional rendering

```tsx
import { RoleGate } from '@iris/auth';

<RoleGate role="admin" fallback={<p>Admins only.</p>}>
  <AdminPanel />
</RoleGate>

<RoleGate permission={['billing.read', 'billing.write']}>
  <BillingSettings />
</RoleGate>

// Require role AND permission (default). requireAll={false} => either.
<RoleGate role="editor" permission="posts.publish">
  <PublishButton />
</RoleGate>
```

> `RoleGate` only controls rendering. It is **not** a security boundary — always
> enforce authorization on the server and in security rules too.

### Configuring the admin bypass

```tsx
<AuthProvider
  auth={auth}
  config={{
    emailPasswordEnabled: true,
    superRoles: ['admin', 'owner'], // these roles pass all hasPermission checks
    // superRoles: []               // disable the bypass entirely
  }}
>
  {children}
</AuthProvider>
```

### Picking up a role change without re-login

Custom claims only refresh when the ID token refreshes (automatically ~hourly,
or on sign-in). After your backend changes a role, force it immediately:

```tsx
const { refreshUser } = useAuth();
await refreshUser(); // force-refreshes the token and re-reads claims into `user`
```

---

## Server setup

Install `firebase-admin` in the package that runs server-side (e.g. your Cloud
Functions project — it's an optional peer dependency of `@iris/auth`):

```bash
npm install firebase-admin
```

### `RoleAdmin`

```ts
import { RoleAdmin } from '@iris/auth/admin';

const roles = new RoleAdmin(); // uses the initialized default admin app

await roles.setRole(uid, 'admin');
await roles.setRoleByEmail('jona@example.com', 'admin');
await roles.setPermissions(uid, ['posts.publish']);
await roles.addPermissions(uid, 'posts.delete');
await roles.removePermissions(uid, 'posts.delete');
await roles.grant(uid, { role: 'editor', permissions: ['posts.publish'] });
await roles.clear(uid); // remove role + permission claims
```

Every mutation merges into the user's existing claims, so it never clobbers
unrelated ones.

### A callable to let admins manage roles

`makeSetRoleCallable()` builds a handler that checks the *caller* is an admin
before letting them set someone else's role. Wire it into your own function
definition (this package deliberately doesn't depend on `firebase-functions`):

**2nd-gen (`firebase-functions/v2`):**

```ts
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { makeSetRoleCallable, RoleAuthError } from '@iris/auth/admin';

initializeApp();
const handler = makeSetRoleCallable({ adminRoles: ['admin'] });

export const setRole = onCall(async (req) => {
  try {
    return await handler(
      req.data,
      req.auth ? { uid: req.auth.uid, token: req.auth.token } : undefined,
    );
  } catch (e) {
    if (e instanceof RoleAuthError) throw new HttpsError(e.code, e.message);
    throw e;
  }
});
```

**1st-gen (`firebase-functions`):**

```ts
import * as functions from 'firebase-functions';
import { initializeApp } from 'firebase-admin/app';
import { makeSetRoleCallable, RoleAuthError } from '@iris/auth/admin';

initializeApp();
const handler = makeSetRoleCallable({ adminRoles: ['admin'] });

export const setRole = functions.https.onCall(async (data, context) => {
  try {
    return await handler(
      data,
      context.auth ? { uid: context.auth.uid, token: context.auth.token } : undefined,
    );
  } catch (e: any) {
    if (e instanceof RoleAuthError) throw new functions.https.HttpsError(e.code, e.message);
    throw e;
  }
});
```

Call it from the client:

```ts
import { getFunctions, httpsCallable } from 'firebase/functions';

const setRole = httpsCallable(getFunctions(), 'setRole');
await setRole({ email: 'newadmin@example.com', role: 'admin' });
// then, for the affected user: await refreshUser();
```

### Default role for new users

```ts
import * as functions from 'firebase-functions';
import { makeAssignDefaultRoleTrigger } from '@iris/auth/admin';

export const onUserCreate = functions.auth
  .user()
  .onCreate(makeAssignDefaultRoleTrigger({ defaultRole: 'user' }));
```

---

## Bootstrapping the first admin

The `setRole` callable requires an existing admin — so it can't mint the very
first one. Use the bundled script with a service-account key:

```bash
# Download a service account key from Firebase console → Project settings →
# Service accounts → Generate new private key.

GOOGLE_APPLICATION_CREDENTIALS=./service-account.json \
  node scripts/set-role.js --email you@example.com --role admin

# or
node scripts/set-role.js --key ./service-account.json --uid <uid> \
  --role editor --permissions posts.publish,posts.delete
```

Then have that user call `refreshUser()` (or sign out and back in).

---

## Enforcing roles in security rules

Claims are available in rules as `request.auth.token.<claim>`.

**Firestore:**

```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    function isAdmin() {
      return request.auth != null && request.auth.token.role == 'admin';
    }
    function hasPermission(p) {
      return request.auth != null &&
        (request.auth.token.role == 'admin' ||
         (request.auth.token.permissions != null &&
          p in request.auth.token.permissions));
    }

    match /posts/{id} {
      allow read: if true;
      allow write: if hasPermission('posts.publish');
    }
    match /adminOnly/{id} {
      allow read, write: if isAdmin();
    }
  }
}
```

**Storage:**

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /admin/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.token.role == 'admin';
    }
  }
}
```

---

## Gotchas

- **Token propagation.** A role change is not instant on existing sessions — the ID token refreshes ~hourly, on sign-in, or when you call `refreshUser()`. Security rules and backend token verification see the change on the next token refresh; call `refreshUser()` to force it.
- **Claim size limit.** All custom claims together must stay under **1000 bytes**. `role` + a modest `permissions` list is fine; don't store large data here.
- **Server is the source of truth.** The client claims can't be forged (they're signed), but `<RoleGate>`/`hasRole` are UX only. Always also enforce on the server and in security rules.
- **Never import `@iris/auth/admin` from client code.** It pulls in `firebase-admin` and a service-account credential.
