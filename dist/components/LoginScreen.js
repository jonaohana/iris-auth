"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginScreen = void 0;
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const hooks_1 = require("../hooks");
const AuthButton_1 = require("./AuthButton");
const PhoneLoginInput_1 = require("./PhoneLoginInput");
const VantaBackground_1 = require("./VantaBackground");
const theme_1 = require("../theme");
const LoginScreen = ({ onLoginSuccess, showSignUp = true, vanta, backgroundImage, modalOpacity = 0.93, headerTextColor, footerTextColor, appName = 'the Hub', }) => {
    const { signInWithGoogle, signInWithApple, signInWithFacebook, signInWithEmail, signUpWithEmail, error, loading, user, signOut } = (0, hooks_1.useAuth)();
    const [email, setEmail] = (0, react_1.useState)('');
    const [password, setPassword] = (0, react_1.useState)('');
    const [isSignUp, setIsSignUp] = (0, react_1.useState)(false);
    const [usePhoneAuth, setUsePhoneAuth] = (0, react_1.useState)(false);
    const [localLoading, setLocalLoading] = (0, react_1.useState)(false);
    const handleEmailAuth = async () => {
        if (!email || !password) {
            return;
        }
        setLocalLoading(true);
        try {
            if (isSignUp) {
                await signUpWithEmail(email, password);
            }
            else {
                await signInWithEmail(email, password);
            }
            onLoginSuccess?.();
        }
        catch (err) {
            console.error('Email auth error:', err);
        }
        finally {
            setLocalLoading(false);
        }
    };
    const handleGoogleSignIn = async () => {
        setLocalLoading(true);
        try {
            await signInWithGoogle();
            onLoginSuccess?.();
        }
        catch (err) {
            console.error('Google sign-in error:', err);
        }
        finally {
            setLocalLoading(false);
        }
    };
    const handleFacebookSignIn = async () => {
        setLocalLoading(true);
        try {
            await signInWithFacebook();
            onLoginSuccess?.();
        }
        catch (err) {
            console.error('Facebook sign-in error:', err);
        }
        finally {
            setLocalLoading(false);
        }
    };
    const handleAppleSignIn = async () => {
        setLocalLoading(true);
        try {
            await signInWithApple();
            onLoginSuccess?.();
        }
        catch (err) {
            console.error('Apple sign-in error:', err);
        }
        finally {
            setLocalLoading(false);
        }
    };
    const handleSignOut = async () => {
        setLocalLoading(true);
        try {
            await signOut();
        }
        catch (err) {
            console.error('Sign-out error:', err);
        }
        finally {
            setLocalLoading(false);
        }
    };
    const Container = react_native_1.Platform.OS === 'web' ? react_native_1.View : react_native_1.KeyboardAvoidingView;
    const containerProps = react_native_1.Platform.OS === 'web' ? {} : { behavior: 'padding' };
    const formContent = (react_1.default.createElement(react_native_1.View, { style: [
            styles.content,
            vanta && react_native_1.Platform.OS === 'web' ? [
                styles.contentCard,
                { backgroundColor: `rgba(255,255,255,${modalOpacity})` }
            ] : null
        ] },
        react_1.default.createElement(react_native_1.View, { style: styles.header },
            react_1.default.createElement(react_native_1.Text, { style: [styles.title, headerTextColor && { color: headerTextColor }] },
                "Welcome to ",
                appName),
            react_1.default.createElement(react_native_1.Text, { style: [styles.subtitle, headerTextColor && { color: headerTextColor }] }, "Sign in to continue")),
        error && (react_1.default.createElement(react_native_1.View, { style: styles.errorContainer },
            react_1.default.createElement(react_native_1.Text, { style: styles.errorText }, error))),
        react_1.default.createElement(react_native_1.View, { style: styles.socialButtons },
            react_1.default.createElement(AuthButton_1.AuthButton, { provider: "google", title: "Continue with Google", onPress: handleGoogleSignIn, loading: localLoading && !email, disabled: localLoading, icon: react_1.default.createElement(react_native_1.Text, { style: styles.googleIcon }, "G") }),
            react_1.default.createElement(AuthButton_1.AuthButton, { provider: "facebook", title: "Continue with Facebook", onPress: handleFacebookSignIn, loading: localLoading && !email, disabled: localLoading, icon: react_1.default.createElement(react_native_1.Text, { style: styles.facebookIcon }, "f") }),
            react_1.default.createElement(AuthButton_1.AuthButton, { provider: "apple", title: "Continue with Apple", onPress: handleAppleSignIn, loading: localLoading && !email, disabled: localLoading, icon: react_1.default.createElement(react_native_1.Text, { style: styles.appleIcon }) })),
        react_1.default.createElement(react_native_1.View, { style: styles.divider },
            react_1.default.createElement(react_native_1.View, { style: styles.dividerLine }),
            react_1.default.createElement(react_native_1.Text, { style: styles.dividerText }, "or"),
            react_1.default.createElement(react_native_1.View, { style: styles.dividerLine })),
        react_1.default.createElement(react_native_1.View, { style: styles.emailForm },
            usePhoneAuth ? (react_1.default.createElement(PhoneLoginInput_1.PhoneLoginInput, { onSuccess: onLoginSuccess })) : (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement(react_native_1.TextInput, { style: styles.input, placeholder: "Email", placeholderTextColor: theme_1.theme.colors.textSecondary, value: email, onChangeText: setEmail, keyboardType: "email-address", autoCapitalize: "none", autoComplete: "email", editable: !localLoading }),
                react_1.default.createElement(react_native_1.TextInput, { style: styles.input, placeholder: "Password", placeholderTextColor: theme_1.theme.colors.textSecondary, value: password, onChangeText: setPassword, secureTextEntry: true, autoCapitalize: "none", autoComplete: "password", editable: !localLoading }),
                react_1.default.createElement(AuthButton_1.AuthButton, { provider: "email", title: isSignUp ? 'Sign Up' : 'Sign In', onPress: handleEmailAuth, loading: localLoading && !!email, disabled: !email || !password || localLoading }),
                showSignUp && (react_1.default.createElement(react_native_1.Pressable, { onPress: () => setIsSignUp(!isSignUp), disabled: localLoading, style: styles.toggleButton },
                    react_1.default.createElement(react_native_1.Text, { style: [styles.toggleText, footerTextColor && { color: footerTextColor }] }, isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"))))),
            react_1.default.createElement(react_native_1.Pressable, { onPress: () => setUsePhoneAuth(!usePhoneAuth), disabled: localLoading, style: styles.toggleButton },
                react_1.default.createElement(react_native_1.Text, { style: [styles.toggleText, footerTextColor && { color: footerTextColor }] }, usePhoneAuth ? 'Use email instead' : 'Use phone number instead')))));
    const signedInLabel = user?.displayName || user?.email || user?.phoneNumber || 'your account';
    // Logged-in state — shown when returning to /login while already authenticated.
    const loggedInContent = (react_1.default.createElement(react_native_1.View, { style: [
            styles.content,
            vanta && react_native_1.Platform.OS === 'web' ? [
                styles.contentCard,
                { backgroundColor: `rgba(255,255,255,${modalOpacity})` }
            ] : null
        ] },
        react_1.default.createElement(react_native_1.View, { style: styles.header },
            react_1.default.createElement(react_native_1.View, { style: styles.onlineBadge },
                react_1.default.createElement(react_native_1.View, { style: styles.onlineDot }),
                react_1.default.createElement(react_native_1.Text, { style: styles.onlineText }, "Online")),
            react_1.default.createElement(react_native_1.Text, { style: [styles.title, headerTextColor && { color: headerTextColor }] }, "You're logged in"),
            react_1.default.createElement(react_native_1.Text, { style: [styles.subtitle, headerTextColor && { color: headerTextColor }] },
                "Signed in as ",
                signedInLabel),
            user?.displayName && user?.email ? (react_1.default.createElement(react_native_1.Text, { style: [styles.subtitle, headerTextColor && { color: headerTextColor }] }, user.email)) : null),
        error && (react_1.default.createElement(react_native_1.View, { style: styles.errorContainer },
            react_1.default.createElement(react_native_1.Text, { style: styles.errorText }, error))),
        react_1.default.createElement(AuthButton_1.AuthButton, { provider: "email", title: "Log Out", onPress: handleSignOut, loading: localLoading, disabled: localLoading }),
        react_1.default.createElement(react_native_1.Pressable, { onPress: handleSignOut, disabled: localLoading, style: styles.toggleButton },
            react_1.default.createElement(react_native_1.Text, { style: [styles.toggleText, footerTextColor && { color: footerTextColor }] }, "Not you? Log out to switch accounts"))));
    const screenContent = user ? loggedInContent : formContent;
    if (vanta && react_native_1.Platform.OS === 'web') {
        return react_1.default.createElement(VantaBackground_1.VantaBackground, { vanta: vanta, backgroundImage: backgroundImage }, screenContent);
    }
    const containerStyle = backgroundImage && react_native_1.Platform.OS === 'web'
        ? [styles.container, { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }]
        : styles.container;
    return (react_1.default.createElement(Container, { style: containerStyle, ...containerProps }, screenContent));
};
exports.LoginScreen = LoginScreen;
const styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme_1.theme.colors.background,
        ...react_native_1.Platform.select({
            web: {
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            },
        }),
    },
    content: {
        ...react_native_1.Platform.select({
            web: {
                width: '100%',
                maxWidth: 400,
                padding: theme_1.theme.spacing.xl,
            },
            default: {
                flex: 1,
                justifyContent: 'center',
                paddingHorizontal: theme_1.theme.spacing.xl,
            },
        }),
    },
    contentCard: {
        ...react_native_1.Platform.select({
            web: {
                borderRadius: 20,
                boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
                backdropFilter: 'blur(8px)',
            },
        }),
    },
    header: {
        marginBottom: theme_1.theme.spacing.xl,
        alignItems: 'center',
    },
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
        marginBottom: theme_1.theme.spacing.md,
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
        ...theme_1.theme.typography.h1,
        color: theme_1.theme.colors.text,
        marginBottom: theme_1.theme.spacing.sm,
        textAlign: 'center',
    },
    subtitle: {
        ...theme_1.theme.typography.body,
        color: theme_1.theme.colors.textSecondary,
        textAlign: 'center',
    },
    errorContainer: {
        backgroundColor: '#FFEBEE',
        padding: theme_1.theme.spacing.md,
        borderRadius: theme_1.theme.borderRadius.md,
        marginBottom: theme_1.theme.spacing.md,
        borderLeftWidth: 4,
        borderLeftColor: theme_1.theme.colors.error,
    },
    errorText: {
        color: theme_1.theme.colors.error,
        ...theme_1.theme.typography.bodySmall,
    },
    socialButtons: {
        marginBottom: theme_1.theme.spacing.md,
    },
    googleIcon: {
        fontSize: 20,
        fontWeight: '700',
        color: theme_1.theme.colors.primary,
    },
    facebookIcon: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1877F2',
    },
    appleIcon: {
        fontSize: 20,
        color: theme_1.theme.colors.textLight,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: theme_1.theme.spacing.lg,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: theme_1.theme.colors.border,
    },
    dividerText: {
        marginHorizontal: theme_1.theme.spacing.md,
        color: theme_1.theme.colors.textSecondary,
        ...theme_1.theme.typography.bodySmall,
    },
    emailForm: {
        marginBottom: theme_1.theme.spacing.xl,
    },
    input: {
        height: 48,
        borderWidth: 1,
        borderColor: theme_1.theme.colors.border,
        borderRadius: theme_1.theme.borderRadius.md,
        paddingHorizontal: theme_1.theme.spacing.md,
        marginBottom: theme_1.theme.spacing.md,
        fontSize: theme_1.theme.typography.body.fontSize,
        color: theme_1.theme.colors.text,
        backgroundColor: theme_1.theme.colors.background,
        ...react_native_1.Platform.select({
            web: {
                outlineStyle: 'none',
            },
        }),
    },
    toggleButton: {
        marginTop: theme_1.theme.spacing.md,
        alignItems: 'center',
    },
    toggleText: {
        color: theme_1.theme.colors.primary,
        ...theme_1.theme.typography.bodySmall,
        ...react_native_1.Platform.select({
            web: {
                cursor: 'pointer',
            },
        }),
    },
});
