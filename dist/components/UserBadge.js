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
exports.UserBadge = void 0;
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const hooks_1 = require("../hooks");
const DEFAULT_COLORS = {
    background: '#f0fdf4',
    backgroundActive: '#dcfce7',
    border: '#bbf7d0',
    dot: '#22c55e',
    name: '#16a34a',
    chevron: '#16a34a',
    avatarBackground: '#16a34a',
    avatarText: '#ffffff',
    menuBackground: '#ffffff',
    menuBorder: '#e5e7eb',
    menuText: '#111827',
    menuSecondaryText: '#6b7280',
    menuHover: '#f3f4f6',
    logoutText: '#ef4444',
    loginDot: '#9ca3af',
};
/**
 * UserBadge — the logged-in indicator pill for app headers.
 *
 * Renders an "online" pill with a status dot, the user's avatar (photo or
 * initial), their first name and a chevron. Clicking it opens a dropdown
 * with the account identity and a Log out action. Renders nothing when
 * logged out, so it can be dropped into any header unconditionally.
 *
 * - `size` — pill height in px; set to the same size as the neighbouring
 *   header icon buttons so it stretches to match (contents scale to fit).
 * - `colors` — partial palette merged over the green defaults, so the pill
 *   and dropdown can match the host app's theme (incl. dark mode).
 * - `onPress` — overrides the built-in dropdown toggle entirely.
 * - `onSignOut` — called after a successful sign-out from the dropdown.
 * - `onLogin` — when provided, the badge renders a "Log in" pill while logged
 *   out (pressing it calls this — e.g. navigate to your Login screen). When
 *   omitted, the badge renders nothing while logged out (legacy behaviour).
 */
const UserBadge = ({ size = 34, showName = true, showChevron = true, onPress, onSignOut, onLogin, loginLabel = 'Log in', avatarUrl, colors, style, }) => {
    const { user, signOut } = (0, hooks_1.useAuth)();
    const [menuOpen, setMenuOpen] = (0, react_1.useState)(false);
    const c = { ...DEFAULT_COLORS, ...(colors ?? {}) };
    if (!user) {
        if (!onLogin)
            return null;
        // Logged out — same pill silhouette, muted dot, "Log in" call to action.
        return (react_1.default.createElement(react_native_1.View, { style: [styles.wrapper, style] },
            react_1.default.createElement(react_native_1.Pressable, { onPress: onLogin, style: ({ hovered, pressed }) => [
                    styles.pill,
                    {
                        height: size,
                        borderRadius: size / 2,
                        backgroundColor: hovered || pressed ? c.backgroundActive : c.background,
                        borderColor: c.border,
                    },
                ] },
                react_1.default.createElement(react_native_1.View, { style: [styles.onlineDot, { backgroundColor: c.loginDot }] }),
                showName && (react_1.default.createElement(react_native_1.Text, { style: [styles.name, { color: c.name }], numberOfLines: 1 }, loginLabel)),
                showChevron && react_1.default.createElement(react_native_1.Text, { style: [styles.chevron, { color: c.chevron }] }, "\u203A"))));
    }
    const firstName = user.displayName?.split(' ')[0] || user.email?.split('@')[0] || 'Account';
    const initial = (user.displayName || user.email || '?').charAt(0).toUpperCase();
    const avatarSize = Math.max(size - 12, 16);
    const handlePress = () => {
        if (onPress) {
            onPress();
        }
        else {
            setMenuOpen((open) => !open);
        }
    };
    const handleLogout = async () => {
        setMenuOpen(false);
        try {
            await signOut();
            onSignOut?.();
        }
        catch (err) {
            console.error('[UserBadge] Sign-out failed:', err);
        }
    };
    return (react_1.default.createElement(react_native_1.View, { style: [styles.wrapper, style] },
        react_1.default.createElement(react_native_1.Pressable, { onPress: handlePress, style: ({ hovered, pressed }) => [
                styles.pill,
                {
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: hovered || pressed ? c.backgroundActive : c.background,
                    borderColor: c.border,
                },
            ] },
            react_1.default.createElement(react_native_1.View, { style: [styles.onlineDot, { backgroundColor: c.dot }] }),
            (avatarUrl ?? user.photoURL) ? (react_1.default.createElement(react_native_1.Image, { source: { uri: (avatarUrl ?? user.photoURL) }, style: { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 } })) : (react_1.default.createElement(react_native_1.View, { style: [
                    styles.avatar,
                    {
                        width: avatarSize,
                        height: avatarSize,
                        borderRadius: avatarSize / 2,
                        backgroundColor: c.avatarBackground,
                    },
                ] },
                react_1.default.createElement(react_native_1.Text, { style: [
                        styles.avatarText,
                        { color: c.avatarText, fontSize: Math.max(avatarSize * 0.5, 9) },
                    ] }, initial))),
            showName && (react_1.default.createElement(react_native_1.Text, { style: [styles.name, { color: c.name }], numberOfLines: 1 }, firstName)),
            showChevron && (react_1.default.createElement(react_native_1.Text, { style: [styles.chevron, { color: c.chevron }] }, menuOpen ? '▴' : '▾'))),
        menuOpen && (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(react_native_1.Pressable, { style: styles.menuOverlay, onPress: () => setMenuOpen(false) }),
            react_1.default.createElement(react_native_1.View, { style: [
                    styles.menu,
                    { top: size + 8, backgroundColor: c.menuBackground, borderColor: c.menuBorder },
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
exports.UserBadge = UserBadge;
const styles = react_native_1.StyleSheet.create({
    wrapper: {
        position: 'relative',
        alignSelf: 'center',
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        borderWidth: 1,
        ...react_native_1.Platform.select({
            web: {
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'background-color 0.15s ease, border-color 0.15s ease',
            },
        }),
    },
    onlineDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        flexShrink: 0,
    },
    avatar: {
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    avatarText: {
        fontWeight: '700',
    },
    name: {
        fontSize: 13,
        fontWeight: '700',
        maxWidth: 110,
    },
    chevron: {
        fontSize: 11,
        marginTop: 1,
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
                boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
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
