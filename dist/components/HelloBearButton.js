"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelloBearButton = void 0;
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const theme_1 = require("../theme");
/**
 * A simple shared "Hello Bear" button.
 * Lives in @iris/auth so every consuming app (ganjahub, forsparta, iris, ...)
 * picks it up from the same source.
 */
const HelloBearButton = ({ onPress, title = 'Hello Bear', }) => {
    return (react_1.default.createElement(react_native_1.TouchableOpacity, { style: styles.button, onPress: onPress, activeOpacity: 0.8, accessibilityRole: "button", accessibilityLabel: title },
        react_1.default.createElement(react_native_1.View, { style: styles.content },
            react_1.default.createElement(react_native_1.Text, { style: styles.emoji }, "\uD83D\uDC3B"),
            react_1.default.createElement(react_native_1.Text, { style: styles.text }, title))));
};
exports.HelloBearButton = HelloBearButton;
const styles = react_native_1.StyleSheet.create({
    button: {
        height: 48,
        paddingHorizontal: theme_1.theme.spacing.lg,
        borderRadius: theme_1.theme.borderRadius.md,
        backgroundColor: theme_1.theme.colors.primary,
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
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    emoji: {
        fontSize: 18,
        marginRight: theme_1.theme.spacing.sm,
    },
    text: {
        color: theme_1.theme.colors.textLight,
        fontSize: theme_1.theme.typography.button.fontSize,
        fontWeight: theme_1.theme.typography.button.fontWeight,
    },
});
