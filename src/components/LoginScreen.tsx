import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../hooks';
import { AuthButton } from './AuthButton';
import { PhoneLoginInput } from './PhoneLoginInput';
import { theme } from '../theme';
import { LoginScreenProps } from '../types';

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  showSignUp = true,
}) => {
  const { signInWithGoogle, signInWithApple, signInWithFacebook, signInWithEmail, signUpWithEmail, error, loading } =
    useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [usePhoneAuth, setUsePhoneAuth] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);

  const handleEmailAuth = async () => {
    if (!email || !password) {
      return;
    }

    setLocalLoading(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
      onLoginSuccess?.();
    } catch (err) {
      console.error('Email auth error:', err);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLocalLoading(true);
    try {
      await signInWithGoogle();
      onLoginSuccess?.();
    } catch (err) {
      console.error('Google sign-in error:', err);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    setLocalLoading(true);
    try {
      await signInWithFacebook();
      onLoginSuccess?.();
    } catch (err) {
      console.error('Facebook sign-in error:', err);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setLocalLoading(true);
    try {
      await signInWithApple();
      onLoginSuccess?.();
    } catch (err) {
      console.error('Apple sign-in error:', err);
    } finally {
      setLocalLoading(false);
    }
  };

  const Container = Platform.OS === 'web' ? View : KeyboardAvoidingView;
  const containerProps = Platform.OS === 'web' ? {} : { behavior: 'padding' as const };

  return (
    <Container style={styles.container} {...containerProps}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to Iris</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.socialButtons}>
          <AuthButton
            provider="google"
            title="Continue with Google"
            onPress={handleGoogleSignIn}
            loading={localLoading && !email}
            disabled={localLoading}
            icon={<Text style={styles.googleIcon}>G</Text>}
          />

          <AuthButton
            provider="facebook"
            title="Continue with Facebook"
            onPress={handleFacebookSignIn}
            loading={localLoading && !email}
            disabled={localLoading}
            icon={<Text style={styles.facebookIcon}>f</Text>}
          />

          <AuthButton
            provider="apple"
            title="Continue with Apple"
            onPress={handleAppleSignIn}
            loading={localLoading && !email}
            disabled={localLoading}
            icon={<Text style={styles.appleIcon}></Text>}
          />
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.emailForm}>
          {usePhoneAuth ? (
            <PhoneLoginInput onSuccess={onLoginSuccess} />
          ) : (
            <>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={theme.colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!localLoading}
              />

              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={theme.colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
                editable={!localLoading}
              />

              <AuthButton
                provider="email"
                title={isSignUp ? 'Sign Up' : 'Sign In'}
                onPress={handleEmailAuth}
                loading={localLoading && !!email}
                disabled={!email || !password || localLoading}
              />

              {showSignUp && (
                <Pressable
                  onPress={() => setIsSignUp(!isSignUp)}
                  disabled={localLoading}
                  style={styles.toggleButton}
                >
                  <Text style={styles.toggleText}>
                    {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                  </Text>
                </Pressable>
              )}
            </>
          )}

          <Pressable
            onPress={() => setUsePhoneAuth(!usePhoneAuth)}
            disabled={localLoading}
            style={styles.toggleButton}
          >
            <Text style={styles.toggleText}>
              {usePhoneAuth ? 'Use email instead' : 'Use phone number instead'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    ...Platform.select({
      web: {
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      } as any,
    }),
  },
  content: {
    ...Platform.select({
      web: {
        width: '100%',
        maxWidth: 400,
        padding: theme.spacing.xl,
      },
      default: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: theme.spacing.xl,
      },
    }),
  },
  header: {
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error,
  },
  errorText: {
    color: theme.colors.error,
    ...theme.typography.bodySmall,
  },
  socialButtons: {
    marginBottom: theme.spacing.md,
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  facebookIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1877F2',
  },
  appleIcon: {
    fontSize: 20,
    color: theme.colors.textLight,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    marginHorizontal: theme.spacing.md,
    color: theme.colors.textSecondary,
    ...theme.typography.bodySmall,
  },
  emailForm: {
    marginBottom: theme.spacing.xl,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      } as any,
    }),
  },
  toggleButton: {
    marginTop: theme.spacing.md,
    alignItems: 'center',
  },
  toggleText: {
    color: theme.colors.primary,
    ...theme.typography.bodySmall,
    ...Platform.select({
      web: {
        cursor: 'pointer',
      } as any,
    }),
  },
});
