import React, { useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet, Platform } from 'react-native';
import { useAuth } from '../hooks';
import { UserBadgeColors } from '../types';

/** Props for the mobile, picture-only auth button. Reuses UserBadgeColors. */
export interface MobileUserBadgeProps {
  /** Circle diameter in px. Default 36 */
  size?: number;
  /**
   * When provided, the button renders a generic avatar while logged out and
   * pressing it calls this (e.g. navigate to your Login screen). When omitted,
   * the button renders nothing while logged out.
   */
  onLogin?: () => void;
  /** Called after a successful sign-out from the popover */
  onSignOut?: () => void;
  /** Overrides the built-in popover: pressing the avatar calls this instead */
  onPress?: () => void;
  /**
   * Overrides the avatar image. When set, this wins over the auth provider's
   * photoURL — use it to show the app's own uploaded profile photo.
   */
  avatarUrl?: string | null;
  /** Show the little online status dot on the avatar. Default true */
  showStatusDot?: boolean;
  /** Theme colors so the button matches the host app (incl. dark mode) */
  colors?: UserBadgeColors;
  /** Extra style for the outer container */
  style?: any;
}

const DEFAULT_COLORS: Required<
  Pick<
    UserBadgeColors,
    | 'border'
    | 'dot'
    | 'avatarBackground'
    | 'avatarText'
    | 'menuBackground'
    | 'menuBorder'
    | 'menuText'
    | 'menuSecondaryText'
    | 'menuHover'
    | 'logoutText'
  >
> = {
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
const PersonGlyph: React.FC<{ d: number; color: string; bg: string }> = ({ d, color, bg }) => (
  <View
    style={{
      width: d,
      height: d,
      borderRadius: d / 2,
      backgroundColor: bg,
      overflow: 'hidden',
      alignItems: 'center',
    }}
  >
    {/* head */}
    <View
      style={{
        position: 'absolute',
        top: d * 0.18,
        width: d * 0.34,
        height: d * 0.34,
        borderRadius: (d * 0.34) / 2,
        backgroundColor: color,
      }}
    />
    {/* shoulders */}
    <View
      style={{
        position: 'absolute',
        bottom: -d * 0.04,
        width: d * 0.62,
        height: d * 0.44,
        borderRadius: (d * 0.62) / 2,
        backgroundColor: color,
      }}
    />
  </View>
);

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
export const MobileUserBadge: React.FC<MobileUserBadgeProps> = ({
  size = 36,
  onLogin,
  onSignOut,
  onPress,
  showStatusDot = true,
  avatarUrl,
  colors,
  style,
}) => {
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const c = { ...DEFAULT_COLORS, ...(colors ?? {}) };

  // Logged out — generic avatar that triggers login.
  if (!user) {
    if (!onLogin) return null;
    return (
      <View style={[styles.wrapper, style]}>
        <Pressable
          onPress={onLogin}
          accessibilityRole="button"
          accessibilityLabel="Log in"
          style={({ hovered, pressed }: any) => [
            styles.button,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderColor: c.border,
              opacity: hovered || pressed ? 0.85 : 1,
            },
          ]}
        >
          <PersonGlyph d={size} color={c.avatarText} bg={c.avatarBackground} />
        </Pressable>
      </View>
    );
  }

  const firstName =
    user.displayName?.split(' ')[0] || user.email?.split('@')[0] || 'Account';
  const initial = (user.displayName || user.email || '?').charAt(0).toUpperCase();

  const handlePress = () => {
    if (onPress) onPress();
    else setMenuOpen((open) => !open);
  };

  const handleLogout = async () => {
    setMenuOpen(false);
    try {
      await signOut();
      onSignOut?.();
    } catch (err) {
      console.error('[MobileUserBadge] Sign-out failed:', err);
    }
  };

  return (
    <View style={[styles.wrapper, style]}>
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel="Account menu"
        style={({ hovered, pressed }: any) => [
          styles.button,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: c.border,
            opacity: hovered || pressed ? 0.85 : 1,
          },
        ]}
      >
        {(avatarUrl ?? user.photoURL) ? (
          <Image
            source={{ uri: (avatarUrl ?? user.photoURL) as string }}
            style={{ width: size, height: size, borderRadius: size / 2 }}
          />
        ) : (
          <View
            style={[
              styles.avatar,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: c.avatarBackground,
              },
            ]}
          >
            <Text
              style={[
                styles.avatarText,
                { color: c.avatarText, fontSize: Math.max(size * 0.42, 11) },
              ]}
            >
              {initial}
            </Text>
          </View>
        )}
        {showStatusDot && (
          <View
            style={[
              styles.statusDot,
              {
                width: Math.max(size * 0.28, 9),
                height: Math.max(size * 0.28, 9),
                borderRadius: Math.max(size * 0.28, 9) / 2,
                backgroundColor: c.dot,
                borderColor: c.menuBackground,
              },
            ]}
          />
        )}
      </Pressable>

      {menuOpen && (
        <>
          {/* Click-away layer */}
          <Pressable style={styles.menuOverlay} onPress={() => setMenuOpen(false)} />

          {/* Popover — opens UPWARD so it clears a bottom bar */}
          <View
            style={[
              styles.menu,
              { bottom: size + 10, backgroundColor: c.menuBackground, borderColor: c.menuBorder },
            ]}
          >
            <View style={[styles.menuHeader, { borderBottomColor: c.menuBorder }]}>
              <Text style={[styles.menuName, { color: c.menuText }]} numberOfLines={1}>
                {user.displayName || firstName}
              </Text>
              {user.email ? (
                <Text style={[styles.menuEmail, { color: c.menuSecondaryText }]} numberOfLines={1}>
                  {user.email}
                </Text>
              ) : null}
            </View>
            <Pressable
              onPress={handleLogout}
              style={({ hovered, pressed }: any) => [
                styles.menuItem,
                (hovered || pressed) && { backgroundColor: c.menuHover },
              ]}
            >
              <Text style={[styles.menuItemText, { color: c.logoutText }]}>Log out</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative' as any,
    alignSelf: 'center',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    overflow: 'visible',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'opacity 0.15s ease',
      } as any,
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
    position: 'absolute' as any,
    right: -1,
    bottom: -1,
    borderWidth: 2,
  },
  menuOverlay: {
    ...Platform.select({
      web: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        cursor: 'default',
      } as any,
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
    position: 'absolute' as any,
    right: 0,
    minWidth: 210,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 4,
    zIndex: 3000,
    ...Platform.select({
      web: {
        boxShadow: '0 -10px 30px rgba(0,0,0,0.18)',
      } as any,
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
    ...Platform.select({
      web: { cursor: 'pointer' } as any,
    }),
  },
  menuItemText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
