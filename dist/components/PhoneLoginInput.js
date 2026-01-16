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
exports.PhoneLoginInput = void 0;
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const auth_1 = require("firebase/auth");
const hooks_1 = require("../hooks");
const AuthButton_1 = require("./AuthButton");
const theme_1 = require("../theme");
const PhoneLoginInput = ({ onSuccess }) => {
    const { signInWithPhone, verifyPhoneCode } = (0, hooks_1.useAuth)();
    const [phoneNumber, setPhoneNumber] = (0, react_1.useState)('');
    const [verificationCode, setVerificationCode] = (0, react_1.useState)('');
    const [verificationId, setVerificationId] = (0, react_1.useState)('');
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const [codeSent, setCodeSent] = (0, react_1.useState)(false);
    const recaptchaVerifierRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        // Setup reCAPTCHA verifier for web
        if (react_native_1.Platform.OS === 'web' && !recaptchaVerifierRef.current) {
            try {
                // Create a container for reCAPTCHA
                const recaptchaContainer = document.getElementById('recaptcha-container');
                if (recaptchaContainer) {
                    const { auth } = require('../config/firebase.web');
                    recaptchaVerifierRef.current = new auth_1.RecaptchaVerifier(auth, 'recaptcha-container', {
                        size: 'invisible',
                        callback: () => {
                            console.log('reCAPTCHA verified');
                        },
                        'expired-callback': () => {
                            setError('reCAPTCHA expired. Please try again.');
                        }
                    });
                }
            }
            catch (err) {
                console.error('Error setting up reCAPTCHA:', err);
            }
        }
        return () => {
            if (recaptchaVerifierRef.current) {
                recaptchaVerifierRef.current.clear();
                recaptchaVerifierRef.current = null;
            }
        };
    }, []);
    const handleSendCode = async () => {
        if (!phoneNumber) {
            setError('Please enter a phone number');
            return;
        }
        if (!recaptchaVerifierRef.current) {
            setError('reCAPTCHA not initialized');
            return;
        }
        // Auto-correct phone number format
        let formattedPhone = phoneNumber.trim();
        // Remove all non-digit characters except +
        formattedPhone = formattedPhone.replace(/[^\d+]/g, '');
        // If doesn't start with +, assume US and add +1
        if (!formattedPhone.startsWith('+')) {
            // Remove leading 1 if present (user typed 1 instead of +1)
            if (formattedPhone.startsWith('1') && formattedPhone.length === 11) {
                formattedPhone = '+' + formattedPhone;
            }
            else {
                formattedPhone = '+1' + formattedPhone;
            }
        }
        // Validate length (rough check - should be at least country code + number)
        if (formattedPhone.length < 10) {
            setError('Phone number is too short');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const confirmationResult = await signInWithPhone(formattedPhone, recaptchaVerifierRef.current);
            setVerificationId(confirmationResult.verificationId);
            setCodeSent(true);
        }
        catch (err) {
            setError(err.message || 'Failed to send verification code');
            console.error('Phone auth error:', err);
        }
        finally {
            setLoading(false);
        }
    };
    const handleVerifyCode = async () => {
        if (!verificationCode) {
            setError('Please enter the verification code');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await verifyPhoneCode(verificationId, verificationCode);
            onSuccess?.();
        }
        catch (err) {
            setError(err.message || 'Invalid verification code');
            console.error('Verification error:', err);
        }
        finally {
            setLoading(false);
        }
    };
    return (react_1.default.createElement(react_native_1.View, { style: styles.container },
        error && (react_1.default.createElement(react_native_1.View, { style: styles.errorContainer },
            react_1.default.createElement(react_native_1.Text, { style: styles.errorText }, error))),
        !codeSent ? (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(react_native_1.Text, { style: styles.hintText }, "Enter your phone number (we'll add +1 if needed)"),
            react_1.default.createElement(react_native_1.TextInput, { style: styles.input, placeholder: "310-555-1234 or +13105551234", placeholderTextColor: theme_1.theme.colors.textSecondary, value: phoneNumber, onChangeText: setPhoneNumber, keyboardType: "phone-pad", autoComplete: "tel", editable: !loading }),
            react_1.default.createElement(AuthButton_1.AuthButton, { provider: "phone", title: "Send Verification Code", onPress: handleSendCode, loading: loading, disabled: !phoneNumber || loading }))) : (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(react_native_1.Text, { style: styles.sentText },
                "Verification code sent to ",
                phoneNumber),
            react_1.default.createElement(react_native_1.TextInput, { style: styles.input, placeholder: "Verification Code", placeholderTextColor: theme_1.theme.colors.textSecondary, value: verificationCode, onChangeText: setVerificationCode, keyboardType: "number-pad", autoComplete: "sms-otp", editable: !loading }),
            react_1.default.createElement(AuthButton_1.AuthButton, { provider: "phone", title: "Verify Code", onPress: handleVerifyCode, loading: loading, disabled: !verificationCode || loading }),
            react_1.default.createElement(react_native_1.Pressable, { onPress: () => {
                    setCodeSent(false);
                    setVerificationCode('');
                    setError(null);
                }, style: styles.backButton },
                react_1.default.createElement(react_native_1.Text, { style: styles.backText }, "Change phone number")))),
        react_native_1.Platform.OS === 'web' && react_1.default.createElement("div", { id: "recaptcha-container" })));
};
exports.PhoneLoginInput = PhoneLoginInput;
const styles = react_native_1.StyleSheet.create({
    container: {
        width: '100%',
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
    sentText: {
        ...theme_1.theme.typography.body,
        color: theme_1.theme.colors.text,
        marginBottom: theme_1.theme.spacing.md,
        textAlign: 'center',
    },
    hintText: {
        ...theme_1.theme.typography.bodySmall,
        color: theme_1.theme.colors.textSecondary,
        marginBottom: theme_1.theme.spacing.sm,
        textAlign: 'center',
    },
    backButton: {
        marginTop: theme_1.theme.spacing.sm,
        alignItems: 'center',
    },
    backText: {
        color: theme_1.theme.colors.primary,
        ...theme_1.theme.typography.bodySmall,
        ...react_native_1.Platform.select({
            web: {
                cursor: 'pointer',
            },
        }),
    },
});
