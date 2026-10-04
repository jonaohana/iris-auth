# Firebase Auth UI

Cross-platform Firebase authentication component for React Native and Web.

## Features

- ✅ Google Sign-In (iOS, Android, Web)
- ✅ Facebook Login (iOS, Android, Web)
- ✅ Apple Sign-In (iOS, Web)
- ✅ Email/Password authentication
- ✅ Web-optimized layouts
- ✅ Beautiful UI with platform-specific patterns
- ✅ TypeScript support

## Installation

```bash
npm install @iris/auth
```

## Usage

```typescript
import { AuthProvider, LoginScreen, useAuth } from '@iris/auth';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseApp = initializeApp({
  // Your Firebase config
});

const auth = getAuth(firebaseApp);

function App() {
  return (
    <AuthProvider 
      auth={auth}
      config={{
        googleWebClientId: 'YOUR_WEB_CLIENT_ID',
        // Native: iOS / Android OAuth client IDs (Google Cloud → Credentials)
        googleIosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
        googleAndroidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
        // Native: Facebook App ID (also register the `fb<APP_ID>` URL scheme)
        facebookAppId: 'YOUR_FACEBOOK_APP_ID',
        appleEnabled: true,
        emailPasswordEnabled: true,
      }}
    >
      <LoginScreen />
    </AuthProvider>
  );
}
```

## API

### `useAuth()`

Hook to access authentication state and methods.

```typescript
const { user, loading, signInWithGoogle, signOut } = useAuth();
```

## Native (iOS / Android) social sign-in

On web the social buttons use Firebase popups. On native they go through
`expo-auth-session` (Google, Facebook) and `expo-apple-authentication` (Apple)
and hand Firebase a credential. Each provider needs a one-time console + app
config setup — see [`NATIVE_SOCIAL_SIGNIN.md`](./NATIVE_SOCIAL_SIGNIN.md).

Host-app peer dependencies for native: `expo-auth-session`, `expo-web-browser`,
`expo-application`, `expo-crypto`, and (iOS, optional) `expo-apple-authentication`.
