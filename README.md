# Firebase Auth UI

Cross-platform Firebase authentication component for React Native and Web.

## Features

- ✅ Google Sign-In (iOS, Android, Web)
- ✅ Apple Sign-In (iOS)
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
        googleIosClientId: 'YOUR_IOS_CLIENT_ID',
        googleAndroidClientId: 'YOUR_ANDROID_CLIENT_ID',
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
