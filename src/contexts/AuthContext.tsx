// Platform-agnostic AuthContext
// React Native bundler will resolve this to AuthContext.native.tsx
// Web bundler will use AuthContext.web.tsx
// Default fallback for TypeScript is web
export * from './AuthContext.web';
