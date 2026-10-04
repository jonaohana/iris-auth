# Native social sign-in (iOS / Android) — setup

On **web** the social buttons use Firebase popups and need nothing beyond the
Firebase console. On **native** (`src/services/authService.native.ts`):

| Provider | Library | Flow | Firebase credential |
|---|---|---|---|
| Google | `expo-auth-session` | auth-code + PKCE against the **iOS / Android** OAuth client, code exchanged for `id_token` | `GoogleAuthProvider.credential(idToken, accessToken)` |
| Facebook | `expo-auth-session` | implicit (`response_type=token`) | `FacebookAuthProvider.credential(accessToken)` |
| Apple | `expo-apple-authentication` | system sheet, SHA-256 nonce | `OAuthProvider('apple.com').credential({ idToken, rawNonce })` |

Host app config (`<AuthProvider config={…}>`):

```ts
googleIosClientId:      process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
googleAndroidClientId:  process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
facebookAppId:          process.env.EXPO_PUBLIC_FACEBOOK_APP_ID,
```

A missing value gives a clear "X is not configured" error on tap instead of
breaking the other providers.

---

## Google

1. Firebase console → Authentication → Sign-in method → **Google** enabled.
2. Google Cloud console (the Firebase project) → APIs & Services → Credentials
   → **Create OAuth client ID**:
   - **iOS** client: bundle ID = the app's `ios.bundleIdentifier`
     (ForSparta: `com.forsparta.app`; the dev variant `com.forsparta.app.dev`
     needs its own iOS client).
   - **Android** client: package name + the signing SHA-1
     (`cd android && ./gradlew signingReport`, or EAS: `eas credentials`).
3. Put the IDs in `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` / `_ANDROID_CLIENT_ID`.

Redirect URI is `<bundleId|package>:/oauthredirect` (the bundle id / package is
already a registered URL scheme after `expo prebuild`) — nothing to add in
`app.config.js`. Override with `googleRedirectUri` if you ever need the reversed
client-ID form (`com.googleusercontent.apps.<id>:/oauthredirect`), in which
case add that scheme to `scheme` too.

Common errors
- `invalid_request / redirect_uri_mismatch` → the client is a *Web* client, or
  the bundle id / package on the client doesn't match the build.
- `Google did not return an ID token` → same cause (web client).
- Firebase `auth/invalid-credential` → the client ID's project isn't the
  Firebase project (or Google isn't enabled in Firebase).

## Facebook

1. Firebase console → Authentication → Sign-in method → **Facebook** enabled
   (App ID + App Secret from the Facebook app).
2. developers.facebook.com → your app → **Settings → Basic → Add platform**:
   - iOS: Bundle ID = `com.forsparta.app` (and `.dev`), "Single Sign On" on.
   - Android: package name + key hashes.
3. **Use cases / Facebook Login → Settings**: "Client OAuth login" and
   "Embedded browser OAuth login" ON.
4. `EXPO_PUBLIC_FACEBOOK_APP_ID=<app id>` — then **rebuild the native app**:
   ForSparta's `app.config.js` adds `fb<APP_ID>` to `scheme` from that env var,
   and the redirect `fb<APP_ID>://authorize` only works once the scheme is in
   the binary (`npx expo prebuild -p ios && npx expo run:ios`).

The app secret is never needed on the client — Firebase holds it.

## Apple (iOS only)

1. In the host app: `npx expo install expo-apple-authentication`.
   ForSparta's `app.config.js` picks it up automatically (adds the plugin +
   `ios.usesAppleSignIn: true`), then `npx expo prebuild -p ios` and rebuild.
2. developer.apple.com → Identifiers → the App ID → enable **Sign in with Apple**
   (then regenerate the provisioning profile if you manage it by hand).
3. Firebase console → Authentication → Sign-in method → **Apple** enabled.
   (Services ID / key only matter for the *web* flow.)
4. Test on a real device signed into iCloud; the simulator is flaky.

Apple sends the user's name only on the **first** authorization — the service
saves it to the Firebase profile then. To test again: Settings → Apple ID →
Sign in with Apple → the app → *Stop using Apple ID*.

Android: the button is hidden (`LoginScreen` → `Platform.OS !== 'android'`).
Apple on Android needs the web flow with an https return URL handled by a
backend — not wired up.

## Rebuild checklist (ForSparta)

```bash
npx expo install expo-apple-authentication   # once
# set EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID / EXPO_PUBLIC_FACEBOOK_APP_ID in env/.env.development
npm run start:dev                            # copies env/.env.development → env/.env
npx expo prebuild -p ios                     # syncs scheme (fb…), Apple entitlement, plugin
npx expo run:ios --device                    # new dev-client build
```

Expo Go can't do any of these (custom schemes + native Apple module) — use the
dev-client build.
