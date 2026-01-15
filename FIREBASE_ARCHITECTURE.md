# Firebase Configuration Architecture

This package uses platform-specific Firebase initialization to ensure proper setup for both web and React Native platforms.

## File Structure

```
src/
├── config/
│   ├── firebase.ts          # Platform-agnostic export (defaults to web)
│   ├── firebase.web.ts      # Web-specific Firebase initialization
│   └── firebase.native.ts   # React Native-specific Firebase initialization
├── contexts/
│   ├── AuthContext.tsx      # Platform-agnostic export (defaults to web)
│   ├── AuthContext.web.tsx  # Web-specific Auth Context
│   └── AuthContext.native.tsx # React Native-specific Auth Context
└── services/
    ├── authService.ts       # Platform-agnostic export (defaults to web)
    ├── authService.web.ts   # Web-specific Auth Service
    └── authService.native.ts # React Native-specific Auth Service
```

## How It Works

### Platform Resolution

React Native's Metro bundler and web bundlers (Webpack, Vite) automatically resolve `.native.ts` and `.web.ts` extensions:

- **React Native**: Imports from `firebase.ts` → resolves to `firebase.native.ts`
- **Web**: Imports from `firebase.ts` → resolves to `firebase.web.ts`
- **TypeScript**: Uses `firebase.ts` which re-exports from `firebase.web.ts`

### Web Configuration (`firebase.web.ts`)

Uses the standard Firebase JS SDK:
- `initializeApp()` for initialization
- `getAuth()` for authentication
- Standard browser-based auth methods

### Native Configuration (`firebase.native.ts`)

Uses Firebase JS SDK with React Native optimizations:
- `initializeApp()` for initialization
- `initializeAuth()` with AsyncStorage persistence
- React Native-specific auth methods (Apple Sign-In, Expo Auth Session for Google)

## Key Differences

| Feature | Web | React Native |
|---------|-----|--------------|
| SDK | `firebase/auth` | `firebase/auth` with RN persistence |
| Persistence | Browser storage | AsyncStorage |
| Google Sign-In | `signInWithPopup()` | expo-auth-session |
| Apple Sign-In | `signInWithPopup()` | expo-apple-authentication |
| Initialization | `getAuth()` | `initializeAuth()` with persistence config |

## Dependencies

### Peer Dependencies
- `firebase`: Firebase JS SDK
- `@react-native-async-storage/async-storage`: For React Native persistence
- `expo-apple-authentication`: For Apple Sign-In on native
- `expo-auth-session`: For Google Sign-In on native
- `expo-web-browser`: For OAuth flows on native

## Usage

Simply import from the base files - the bundler handles platform resolution:

```typescript
// This works on both web and native
import { auth } from '../config/firebase';
import { AuthProvider } from '../contexts/AuthContext';
import { AuthService } from '../services/authService';
```

## Benefits

1. **Single Import**: No need to manually handle platform checks
2. **Type Safety**: TypeScript sees the correct types for both platforms
3. **Automatic Resolution**: Bundlers handle file selection
4. **Maintainability**: Mirror APIs across platforms make it easy to keep them in sync
5. **No Runtime Overhead**: Resolution happens at build time
