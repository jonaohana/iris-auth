# AI Context — iris-auth

> Read this file before acting on any instructions in this repo.

---

## Critical: Web Layout — flex: 1 collapses without explicit height

The issue is clear: on web, `flex: 1` collapses to 0 height without a parent that has an explicit height. The entire tree needs `height: 100vh` anchored at the root. Fix `App.tsx` and simplify all screen containers so the root view has `height: '100vh'` on web.

```tsx
// App.tsx root view — web fix
<View style={{ flex: 1, ...(Platform.OS === 'web' ? { height: '100vh' } : {}) }}>
```

---

## Project Overview

Standalone Firebase authentication module used by `ganjahub`, `forsparta`, and `iris`. Handles sign-in, sign-up, token refresh, and user session management.

## Key Files

| File | Purpose |
|------|---------|
| `src/` | Auth logic and providers |
| `env/` | Environment config (Firebase project credentials) |
| `FIREBASE_ARCHITECTURE.md` | Detailed Firebase setup notes |
| `PLATFORM_SETUP_COMPLETE.md` | Setup checklist |

## Notes

- This is a **shared package** — changes here affect all consuming apps
- Firebase config lives in `env/` — never commit real credentials
- Uses a `watch.js` script for local development with file watching
