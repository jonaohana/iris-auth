"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthButton = void 0;
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const theme_1 = require("../theme");
const AuthButton = ({ onPress, title, provider, loading = false, disabled = false, icon, }) => {
    const buttonStyle = [
        styles.button,
        provider === 'google' && styles.googleButton,
        provider === 'apple' && styles.appleButton,
        provider === 'facebook' && styles.facebookButton,
        provider === 'email' && styles.emailButton,
        provider === 'phone' && styles.phoneButton,
        disabled && styles.buttonDisabled,
    ];
    const textStyle = [
        styles.buttonText,
        provider === 'google' && styles.googleText,
        provider === 'apple' && styles.appleText,
        provider === 'facebook' && styles.facebookText,
        provider === 'email' && styles.emailText,
        provider === 'phone' && styles.phoneText,
    ];
    return (react_1.default.createElement(react_native_1.TouchableOpacity, { style: buttonStyle, onPress: onPress, disabled: disabled || loading, activeOpacity: 0.8 }, loading ? (react_1.default.createElement(react_native_1.ActivityIndicator, { color: provider === 'google' ? theme_1.theme.colors.text : theme_1.theme.colors.textLight })) : (react_1.default.createElement(react_native_1.View, { style: styles.buttonContent },
        icon && react_1.default.createElement(react_native_1.View, { style: styles.iconContainer }, icon),
        react_1.default.createElement(react_native_1.Text, { style: textStyle }, title)))));
};
exports.AuthButton = AuthButton;
const styles = react_native_1.StyleSheet.create({
    button: {
        height: 48,
        borderRadius: theme_1.theme.borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: theme_1.theme.spacing.sm,
        ...react_native_1.Platform.select({
            web: {
                cursor: 'pointer',
                transition: 'all 0.2s ease',
            },
            default: theme_1.theme.shadows.small,
        }),
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        marginRight: theme_1.theme.spacing.sm,
    },
    googleButton: {
        backgroundColor: theme_1.theme.colors.background,
        borderWidth: 1,
        borderColor: theme_1.theme.colors.border,
        ...react_native_1.Platform.select({
            web: {
                ':hover': {
                    backgroundColor: theme_1.theme.colors.surfaceHover,
                },
            },
        }),
    },
    appleButton: {
        backgroundColor: theme_1.theme.colors.apple,
    },
    facebookButton: {
        backgroundColor: '#1877F2',
    },
    emailButton: {
        backgroundColor: theme_1.theme.colors.primary,
        ...react_native_1.Platform.select({
            web: {
                ':hover': {
                    backgroundColor: theme_1.theme.colors.primaryDark,
                },
            },
        }),
    },
    phoneButton: {
        backgroundColor: theme_1.theme.colors.primary,
        ...react_native_1.Platform.select({
            web: {
                ':hover': {
                    backgroundColor: theme_1.theme.colors.primaryDark,
                },
            },
        }),
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        fontSize: theme_1.theme.typography.button.fontSize,
        fontWeight: theme_1.theme.typography.button.fontWeight,
    },
    googleText: {
        color: theme_1.theme.colors.text,
    },
    appleText: {
        color: theme_1.theme.colors.textLight,
    },
    facebookText: {
        color: theme_1.theme.colors.textLight,
    },
    emailText: {
        color: theme_1.theme.colors.textLight,
    },
    phoneText: {
        color: theme_1.theme.colors.textLight,
    },
});
