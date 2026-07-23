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
exports.MobileUserBadge = void 0;
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const hooks_1 = require("../hooks");
const DEFAULT_COLORS = {
    border: '#bbf7d0',
    dot: '#22c55e',
    avatarBackground: '#16a34a',
    avatarText: '#ffffff',
    menuBackground: '#ffffff',
    menuBorder: '#e5e7eb',
    menuText: '#111827',
    menuSecondaryText: '#6b7280',
    menuHover: '#f3f4f6',
    logoutText: '#ef4444',
};
/** Simple person silhouette drawn with Views — no icon-font dependency. */
const PersonGlyph = ({ d, color, bg }) => (react_1.default.createElement(react_native_1.View, { style: {
        width: d,
        height: d,
        borderRadius: d / 2,
        backgroundColor: bg,
        overflow: 'hidden',
        alignItems: 'center',
    } },
    react_1.default.createElement(react_native_1.View, { style: {
            position: 'absolute',
            top: d * 0.18,
            width: d * 0.34,
            height: d * 0.34,
            borderRadius: (d * 0.34) / 2,
            backgroundColor: color,
        } }),
    react_1.default.createElement(react_native_1.View, { style: {
            position: 'absolute',
            bottom: -d * 0.04,
            width: d * 0.62,
            height: d * 0.44,
            borderRadius: (d * 0.62) / 2,
            backgroundColor: color,
        } })));
/**
 * MobileUserBadge — a compact, picture-only login/logout button for mobile
 * bottom bars.
 *
 * Renders just the circular avatar (photo, initial, or a generic person glyph
 * while logged out). Logged in, tapping it opens a small popover that opens
 * UPWARD (so it isn't clipped by the bottom of the screen) with the account
 * identity and a Log out action. Logged out, tapping it calls `onLogin`.
 *
 * This is the mobile counterpart to `UserBadge` (which is a full pill with the
 * user's name + chevron, designed for a top header). Same `colors` palette, so
 * both stay visually consistent across breakpoints.
 */
const MobileUserBadge = ({ size = 36, onLogin, onSignOut, onPress, showStatusDot = true, colors, style, }) => {
    const { user, signOut } = (0, hooks_1.useAuth)();
    const [menuOpen, setMenuOpen] = (0, react_1.useState)(false);
    const c = { ...DEFAULT_COLORS, ...(colors ?? {}) };
    // Logged out — generic avatar that triggers login.
    if (!user) {
        if (!onLogin)
            return null;
        return (react_1.default.createElement(react_native_1.View, { style: [styles.wrapper, style] },
            react_1.default.createElement(react_native_1.Pressable, { onPress: onLogin, accessibilityRole: "button", accessibilityLabel: "Log in", style: ({ hovered, pressed }) => [
                    styles.button,
                    {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        borderColor: c.border,
                        opacity: hovered || pressed ? 0.85 : 1,
                    },
                ] },
                react_1.default.createElement(PersonGlyph, { d: size, color: c.avatarText, bg: c.avatarBackground }))));
    }
    const firstName = user.displayName?.split(' ')[0] || user.email?.split('@')[0] || 'Account';
    const initial = (user.displayName || user.email || '?').charAt(0).toUpperCase();
    const handlePress = () => {
        if (onPress)
            onPress();
        else
            setMenuOpen((open) => !open);
    };
    const handleLogout = async () => {
        setMenuOpen(false);
        try {
            await signOut();
            onSignOut?.();
        }
        catch (err) {
            console.error('[MobileUserBadge] Sign-out failed:', err);
        }
    };
    return (react_1.default.createElement(react_native_1.View, { style: [styles.wrapper, style] },
        react_1.default.createElement(react_native_1.Pressable, { onPress: handlePress, accessibilityRole: "button", accessibilityLabel: "Account menu", style: ({ hovered, pressed }) => [
                styles.button,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    borderColor: c.border,
                    opacity: hovered || pressed ? 0.85 : 1,
                },
            ] },
            user.photoURL ? (react_1.default.createElement(react_native_1.Image, { source: { uri: user.photoURL }, style: { width: size, height: size, borderRadius: size / 2 } })) : (react_1.default.createElement(react_native_1.View, { style: [
                    styles.avatar,
                    {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        backgroundColor: c.avatarBackground,
                    },
                ] },
                react_1.default.createElement(react_native_1.Text, { style: [
                        styles.avatarText,
                        { color: c.avatarText, fontSize: Math.max(size * 0.42, 11) },
                    ] }, initial))),
            showStatusDot && (react_1.default.createElement(react_native_1.View, { style: [
                    styles.statusDot,
                    {
                        width: Math.max(size * 0.28, 9),
                        height: Math.max(size * 0.28, 9),
                        borderRadius: Math.max(size * 0.28, 9) / 2,
                        backgroundColor: c.dot,
                        borderColor: c.menuBackground,
                    },
                ] }))),
        menuOpen && (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(react_native_1.Pressable, { style: styles.menuOverlay, onPress: () => setMenuOpen(false) }),
            react_1.default.createElement(react_native_1.View, { style: [
                    styles.menu,
                    { bottom: size + 10, backgroundColor: c.menuBackground, borderColor: c.menuBorder },
                ] },
                react_1.default.createElement(react_native_1.View, { style: [styles.menuHeader, { borderBottomColor: c.menuBorder }] },
                    react_1.default.createElement(react_native_1.Text, { style: [styles.menuName, { color: c.menuText }], numberOfLines: 1 }, user.displayName || firstName),
                    user.email ? (react_1.default.createElement(react_native_1.Text, { style: [styles.menuEmail, { color: c.menuSecondaryText }], numberOfLines: 1 }, user.email)) : null),
                react_1.default.createElement(react_native_1.Pressable, { onPress: handleLogout, style: ({ hovered, pressed }) => [
                        styles.menuItem,
                        (hovered || pressed) && { backgroundColor: c.menuHover },
                    ] },
                    react_1.default.createElement(react_native_1.Text, { style: [styles.menuItemText, { color: c.logoutText }] }, "Log out")))))));
};
exports.MobileUserBadge = MobileUserBadge;
const styles = react_native_1.StyleSheet.create({
    wrapper: {
        position: 'relative',
        alignSelf: 'center',
    },
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        overflow: 'visible',
        ...react_native_1.Platform.select({
            web: {
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'opacity 0.15s ease',
            },
        }),
    },
    avatar: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontWeight: '700',
    },
    statusDot: {
        position: 'absolute',
        right: -1,
        bottom: -1,
        borderWidth: 2,
    },
    menuOverlay: {
        ...react_native_1.Platform.select({
            web: {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                cursor: 'default',
            },
            default: {
                position: 'absolute',
                top: -1000,
                left: -1000,
                right: -1000,
                bottom: -1000,
            },
        }),
        zIndex: 2999,
    },
    menu: {
        position: 'absolute',
        right: 0,
        minWidth: 210,
        borderRadius: 12,
        borderWidth: 1,
        paddingVertical: 4,
        zIndex: 3000,
        ...react_native_1.Platform.select({
            web: {
                boxShadow: '0 -10px 30px rgba(0,0,0,0.18)',
            },
            default: {
                elevation: 8,
            },
        }),
    },
    menuHeader: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderBottomWidth: 1,
        marginBottom: 4,
    },
    menuName: {
        fontSize: 13,
        fontWeight: '700',
        marginBottom: 1,
    },
    menuEmail: {
        fontSize: 11,
    },
    menuItem: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 8,
        marginHorizontal: 4,
        ...react_native_1.Platform.select({
            web: { cursor: 'pointer' },
        }),
    },
    menuItemText: {
        fontSize: 13,
        fontWeight: '600',
    },
});
