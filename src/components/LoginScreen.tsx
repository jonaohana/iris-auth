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
import { VantaBackground } from './VantaBackground';
import { theme } from '../theme';
import { LoginScreenProps } from '../types';

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  showSignUp = true,
  vanta,
  backgroundImage,
  modalOpacity = 0.93,
  headerTextColor,
  footerTextColor,
  appName = 'the Hub',
  background,
  aboveCard,
  fillAboveCard,
  bottomInset,
  cardColor,
  textBackdropColor,
  textShadowColor,
}) => {
  const { signInWithGoogle, signInWithApple, signInWithFacebook, signInWithEmail, signUpWithEmail, error, loading, user, signOut } =
    useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [usePhoneAuth, setUsePhoneAuth] = useState(false);
  // The email/password (and phone) form stays collapsed behind one button so the
  // social buttons + that button fit without scrolling; tap it to expand.
  const [showEmailForm, setShowEmailForm] = useState(false);
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

  const handleSignOut = async () => {
    setLocalLoading(true);
    try {
      await signOut();
    } catch (err) {
      console.error('Sign-out error:', err);
    } finally {
      setLocalLoading(false);
    }
  };

  // Optional translucent box behind text that sits directly on the card/background (title, "or", links).
  const textBox: any = textBackdropColor
    ? { backgroundColor: textBackdropColor, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, overflow: 'hidden' }
    : null;

  // Optional soft dark glow on text that sits directly on the card/background — lighter-looking than a box.
  const textGlow: any = textShadowColor
    ? Platform.OS === 'web'
      ? { textShadow: `0 1px 2px ${textShadowColor}, 0 0 14px ${textShadowColor}` }
      : { textShadowColor, textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 6 }
    : null;

  // Native + fillAboveCard: the hero takes every pixel above the card and the card goes compact.
  const compact = Platform.OS !== 'web' && !!fillAboveCard;

  const Container = Platform.OS === 'web' ? View : KeyboardAvoidingView;
  const containerProps = Platform.OS === 'web' ? {} : { behavior: 'padding' as const };

  const formContent = (
    <View style={[
      styles.content,
      (vanta || background) && Platform.OS === 'web' ? [
        styles.contentCard,
        { backgroundColor: cardColor ?? `rgba(255,255,255,${modalOpacity})` } as any
      ] : null,
      background && Platform.OS !== 'web' ? [
        styles.contentCardNative,
        { backgroundColor: cardColor ?? `rgba(255,255,255,${modalOpacity})` },
        compact && styles.contentCardCompact,
        compact && bottomInset != null && { marginBottom: bottomInset },
      ] : null,
    ]}>
      <View style={[styles.header, compact && styles.headerCompact, textBox && { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, backgroundColor: textBackdropColor } as any]}>
          <Text style={[styles.title, compact && styles.titleCompact, headerTextColor && { color: headerTextColor } as any, textGlow]}>Welcome to {appName}</Text>
          <Text style={[styles.subtitle, compact && styles.subtitleCompact, headerTextColor && { color: headerTextColor } as any, textGlow]}>Sign in to continue</Text>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* One or the other: social buttons, or the email / phone form — never both (saves space). */}
        {!showEmailForm && (
          <>
            <View style={[styles.socialButtons, compact && { marginBottom: 0, flexDirection: 'row' }]}>
              <AuthButton
                provider="google"
                compact={compact}
                iconOnly={compact}
                title="Continue with Google"
                onPress={handleGoogleSignIn}
                loading={localLoading && !email}
                disabled={localLoading}
                icon={<Text style={styles.googleIcon}>G</Text>}
              />

              <AuthButton
                provider="facebook"
                compact={compact}
                iconOnly={compact}
                title="Continue with Facebook"
                onPress={handleFacebookSignIn}
                loading={localLoading && !email}
                disabled={localLoading}
                icon={<Text style={styles.facebookIcon}>f</Text>}
              />

              {/* Apple: system sheet on iOS, Firebase popup on web. On Android Apple
                  needs a web flow with an https return URL (backend) — not wired up. */}
              {Platform.OS !== 'android' && (
                <AuthButton
                  provider="apple"
                  compact={compact}
                  iconOnly={compact}
                  title="Continue with Apple"
                  onPress={handleAppleSignIn}
                  loading={localLoading && !email}
                  disabled={localLoading}
                  // U+F8FF is the Apple logo on Apple platforms (tofu elsewhere).
                  icon={<Text style={styles.appleIcon}>{Platform.OS === 'ios' ? '\uF8FF' : ''}</Text>}
                />
              )}
            </View>

            <View style={[styles.divider, compact && styles.dividerCompact]}>
              <View style={styles.dividerLine} />
              <Text style={[styles.dividerText, textBox, textGlow]}>or</Text>
              <View style={styles.dividerLine} />
            </View>
          </>
        )}

        {!showEmailForm ? (
          <AuthButton
            provider="email"
            compact={compact}
            title="Log in with email / password"
            onPress={() => setShowEmailForm(true)}
            disabled={localLoading}
            icon={<Text style={styles.emailIcon}>✉</Text>}
          />
        ) : (
          <View style={[styles.emailForm, compact && { marginBottom: 0 }]}>
            {usePhoneAuth ? (
              <PhoneLoginInput onSuccess={onLoginSuccess} />
            ) : (
              <>
                <TextInput
                  style={[styles.input, compact && styles.inputCompact]}
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
                  style={[styles.input, compact && styles.inputCompact]}
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
                  compact={compact}
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
                    <Text style={[styles.toggleText, footerTextColor && { color: footerTextColor } as any, textBox, textGlow]}>
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
              <Text style={[styles.toggleText, footerTextColor && { color: footerTextColor } as any, textBox, textGlow]}>
                {usePhoneAuth ? 'Use email instead' : 'Use phone number instead'}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => { setShowEmailForm(false); setUsePhoneAuth(false); }}
              disabled={localLoading}
              style={styles.toggleButton}
            >
              <Text style={[styles.toggleText, footerTextColor && { color: footerTextColor } as any, textBox, textGlow]}>
                Back to all sign-in options
              </Text>
            </Pressable>
          </View>
        )}
    </View>
  );

  const signedInLabel = user?.displayName || user?.email || user?.phoneNumber || 'your account';

  // Logged-in state — shown when returning to /login while already authenticated.
  const loggedInContent = (
    <View style={[
      styles.content,
      (vanta || background) && Platform.OS === 'web' ? [
        styles.contentCard,
        { backgroundColor: cardColor ?? `rgba(255,255,255,${modalOpacity})` } as any
      ] : null,
      background && Platform.OS !== 'web' ? [
        styles.contentCardNative,
        { backgroundColor: cardColor ?? `rgba(255,255,255,${modalOpacity})` },
      ] : null,
    ]}>
      <View style={[styles.header, textBox && { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, backgroundColor: textBackdropColor } as any]}>
        <View style={styles.onlineBadge}>
          <View style={styles.onlineDot} />
          <Text style={styles.onlineText}>Online</Text>
        </View>
        <Text style={[styles.title, headerTextColor && { color: headerTextColor } as any, textGlow]}>You're logged in</Text>
        <Text style={[styles.subtitle, headerTextColor && { color: headerTextColor } as any, textGlow]}>
          Signed in as {signedInLabel}
        </Text>
        {user?.displayName && user?.email ? (
          <Text style={[styles.subtitle, headerTextColor && { color: headerTextColor } as any, textGlow]}>{user.email}</Text>
        ) : null}
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <AuthButton
        provider="email"
        title="Log Out"
        onPress={handleSignOut}
        loading={localLoading}
        disabled={localLoading}
      />

      <Pressable onPress={handleSignOut} disabled={localLoading} style={styles.toggleButton}>
        <Text style={[styles.toggleText, footerTextColor && { color: footerTextColor } as any, textBox, textGlow]}>
          Not you? Log out to switch accounts
        </Text>
      </Pressable>
    </View>
  );

  const screenContent = user ? loggedInContent : formContent;

  if (background) {
    return (
      <Container style={[styles.container, styles.containerCustomBg]} {...containerProps}>
        {background}
        {aboveCard}
        {compact && !user ? <View style={styles.fillSlot}>{fillAboveCard}</View> : null}
        {screenContent}
      </Container>
    );
  }

  if (vanta && Platform.OS === 'web') {
    return <VantaBackground vanta={vanta} backgroundImage={backgroundImage}>{screenContent}</VantaBackground>;
  }

  const containerStyle = backgroundImage && Platform.OS === 'web'
    ? [styles.container, { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } as any]
    : styles.container;

  return (
    <Container style={containerStyle} {...containerProps}>
      {screenContent}
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
  contentCard: {
    ...Platform.select({
      web: {
        borderRadius: 20,
        boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
        backdropFilter: 'blur(8px)',
      } as any,
    }),
  },
  containerCustomBg: {
    backgroundColor: 'transparent',
    ...Platform.select({
      web: { flexDirection: 'column', paddingVertical: 24, paddingHorizontal: 16 } as any,
      default: { justifyContent: 'center' },
    }),
  },
  contentCardNative: {
    flex: 0,
    marginHorizontal: 20,
    paddingVertical: theme.spacing.xl,
    borderRadius: 20,
  },
  contentCardCompact: {
    marginHorizontal: 14,
    marginBottom: 20,
    paddingVertical: 10,
  },
  fillSlot: {
    flex: 1,
    minHeight: 0,
  },
  header: {
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
  },
  headerCompact: { marginBottom: theme.spacing.sm },
  titleCompact: { fontSize: 22, lineHeight: 28, marginBottom: 2 },
  subtitleCompact: { fontSize: 13, lineHeight: 17 },
  dividerCompact: { marginVertical: 4 },
  inputCompact: { height: 44, marginBottom: 8 },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    marginBottom: theme.spacing.md,
  },
  onlineDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#22c55e',
  },
  onlineText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803d',
    letterSpacing: 0.3,
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
  emailIcon: {
    fontSize: 18,
    color: theme.colors.textLight,
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
