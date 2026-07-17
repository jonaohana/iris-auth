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
exports.UserMenu = UserMenu;
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const vector_icons_1 = require("@expo/vector-icons");
const AuthContext_1 = require("../contexts/AuthContext");
function UserMenu({ extraOptions, accentColor = '#22c55e', height = 32, onSignOut }) {
    const { user, signOut } = (0, AuthContext_1.useAuth)();
    const [open, setOpen] = (0, react_1.useState)(false);
    const [menuPos, setMenuPos] = (0, react_1.useState)({ top: 0, right: 0 });
    const triggerRef = (0, react_1.useRef)(null);
    if (!user)
        return null;
    const name = user.displayName?.split(' ')[0] ?? user.email?.split('@')[0] ?? 'User';
    const handleSignOut = async () => {
        setOpen(false);
        try {
            await signOut();
            onSignOut?.();
        }
        catch (_) {
            // ignore
        }
    };
    const openMenu = () => {
        if (react_native_1.Platform.OS === 'web' && triggerRef.current) {
            // @ts-ignore — web only
            const rect = triggerRef.current.getBoundingClientRect?.();
            if (rect) {
                setMenuPos({
                    top: rect.bottom + window.scrollY + 6,
                    right: window.innerWidth - rect.right,
                });
            }
        }
        setOpen(true);
    };
    const allOptions = [
        ...(extraOptions ?? []),
        {
            label: 'Sign out',
            icon: 'log-out-outline',
            danger: true,
            onPress: handleSignOut,
        },
    ];
    const badgeBg = accentColor === '#22c55e' ? '#f0fdf4' : '#eff6ff';
    const badgeBorder = accentColor === '#22c55e' ? '#bbf7d0' : '#bfdbfe';
    const textColor = accentColor === '#22c55e' ? '#15803d' : '#1d4ed8';
    return (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_native_1.Pressable, { ref: triggerRef, onPress: openMenu, style: ({ pressed }) => [
                styles.trigger,
                { backgroundColor: badgeBg, borderColor: badgeBorder, height, borderRadius: height / 2 },
                pressed && styles.triggerPressed,
            ] },
            react_1.default.createElement(react_native_1.View, { style: [styles.dot, { backgroundColor: accentColor }] }),
            react_1.default.createElement(vector_icons_1.Ionicons, { name: "person-circle-outline", size: 15, color: textColor, style: styles.icon }),
            react_1.default.createElement(react_native_1.Text, { style: [styles.name, { color: textColor }] }, name),
            react_1.default.createElement(vector_icons_1.Ionicons, { name: open ? 'chevron-up' : 'chevron-down', size: 11, color: textColor, style: styles.chevron })),
        open && (react_1.default.createElement(react_native_1.Modal, { transparent: true, animationType: "none", onRequestClose: () => setOpen(false) },
            react_1.default.createElement(react_native_1.TouchableOpacity, { style: styles.backdrop, activeOpacity: 1, onPress: () => setOpen(false) }),
            react_1.default.createElement(react_native_1.View, { style: [
                    styles.dropdown,
                    react_native_1.Platform.OS === 'web'
                        ? { position: 'fixed', top: menuPos.top, right: menuPos.right }
                        : styles.dropdownNative,
                ] },
                react_1.default.createElement(react_native_1.View, { style: styles.menuHeader },
                    react_1.default.createElement(react_native_1.View, { style: [styles.dot, { backgroundColor: accentColor, marginRight: 6 }] }),
                    react_1.default.createElement(react_native_1.Text, { style: styles.menuEmail, numberOfLines: 1 }, user.email)),
                react_1.default.createElement(react_native_1.View, { style: styles.divider }),
                allOptions.map((opt, i) => (react_1.default.createElement(react_native_1.Pressable, { key: i, onPress: opt.onPress, style: ({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed] },
                    opt.icon && (react_1.default.createElement(vector_icons_1.Ionicons, { name: opt.icon, size: 15, color: opt.danger ? '#ef4444' : '#374151', style: styles.menuItemIcon })),
                    react_1.default.createElement(react_native_1.Text, { style: [styles.menuItemLabel, opt.danger && styles.menuItemDanger] }, opt.label)))))))));
}
const styles = react_native_1.StyleSheet.create({
    trigger: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        borderWidth: 1,
        gap: 4,
        cursor: 'pointer',
    },
    triggerPressed: {
        opacity: 0.8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    icon: {
        marginHorizontal: 1,
    },
    name: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.2,
    },
    chevron: {
        marginLeft: 1,
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    dropdown: {
        backgroundColor: '#ffffff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        minWidth: 200,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 8,
        overflow: 'hidden',
    },
    dropdownNative: {
        position: 'absolute',
        top: 60,
        right: 16,
    },
    menuHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    menuEmail: {
        fontSize: 12,
        color: '#6b7280',
        flex: 1,
    },
    divider: {
        height: 1,
        backgroundColor: '#f3f4f6',
        marginHorizontal: 0,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    menuItemPressed: {
        backgroundColor: '#f9fafb',
    },
    menuItemIcon: {
        marginRight: 8,
    },
    menuItemLabel: {
        fontSize: 13,
        color: '#374151',
        fontWeight: '500',
    },
    menuItemDanger: {
        color: '#ef4444',
    },
});
