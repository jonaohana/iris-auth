import React, { useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet, Platform } from 'react-native';
import { useAuth } from '../hooks';
import { UserBadgeColors, UserBadgeProps } from '../types';

const DEFAULT_COLORS: Required<UserBadgeColors> = {
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
export const UserBadge: React.FC<UserBadgeProps> = ({
  size = 34,
  showName = true,
  showChevron = true,
  onPress,
  onSignOut,
  onLogin,
  loginLabel = 'Log in',
  avatarUrl,
  colors,
  style,
}) => {
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const c = { ...DEFAULT_COLORS, ...(colors ?? {}) };

  if (!user) {
    if (!onLogin) return null;
    // Logged out — same pill silhouette, muted dot, "Log in" call to action.
    return (
      <View style={[styles.wrapper, style]}>
        <Pressable
          onPress={onLogin}
          style={({ hovered, pressed }: any) => [
            styles.pill,
            {
              height: size,
              borderRadius: size / 2,
              backgroundColor: hovered || pressed ? c.backgroundActive : c.background,
              borderColor: c.border,
            },
          ]}
        >
          <View style={[styles.onlineDot, { backgroundColor: c.loginDot }]} />
          {showName && (
            <Text style={[styles.name, { color: c.name }]} numberOfLines={1}>
              {loginLabel}
            </Text>
          )}
          {showChevron && <Text style={[styles.chevron, { color: c.chevron }]}>›</Text>}
        </Pressable>
      </View>
    );
  }

  const firstName =
    user.displayName?.split(' ')[0] || user.email?.split('@')[0] || 'Account';
  const initial = (user.displayName || user.email || '?').charAt(0).toUpperCase();
  const avatarSize = Math.max(size - 12, 16);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      setMenuOpen((open) => !open);
    }
  };

  const handleLogout = async () => {
    setMenuOpen(false);
    try {
      await signOut();
      onSignOut?.();
    } catch (err) {
      console.error('[UserBadge] Sign-out failed:', err);
    }
  };

  return (
    <View style={[styles.wrapper, style]}>
      <Pressable
        onPress={handlePress}
        style={({ hovered, pressed }: any) => [
          styles.pill,
          {
            height: size,
            borderRadius: size / 2,
            backgroundColor: hovered || pressed ? c.backgroundActive : c.background,
            borderColor: c.border,
          },
        ]}
      >
        <View style={[styles.onlineDot, { backgroundColor: c.dot }]} />
        {(avatarUrl ?? user.photoURL) ? (
          <Image
            source={{ uri: (avatarUrl ?? user.photoURL) as string }}
            style={{ width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }}
          />
        ) : (
          <View
            style={[
              styles.avatar,
              {
                width: avatarSize,
                height: avatarSize,
                borderRadius: avatarSize / 2,
                backgroundColor: c.avatarBackground,
              },
            ]}
          >
            <Text
              style={[
                styles.avatarText,
                { color: c.avatarText, fontSize: Math.max(avatarSize * 0.5, 9) },
              ]}
            >
              {initial}
            </Text>
          </View>
        )}
        {showName && (
          <Text style={[styles.name, { color: c.name }]} numberOfLines={1}>
            {firstName}
          </Text>
        )}
        {showChevron && (
          <Text style={[styles.chevron, { color: c.chevron }]}>{menuOpen ? '▴' : '▾'}</Text>
        )}
      </Pressable>

      {menuOpen && (
        <>
          {/* Click-away layer */}
          <Pressable style={styles.menuOverlay} onPress={() => setMenuOpen(false)} />

          {/* Dropdown */}
          <View
            style={[
              styles.menu,
              { top: size + 8, backgroundColor: c.menuBackground, borderColor: c.menuBorder },
            ]}
          >
            <View style={[styles.menuHeader, { borderBottomColor: c.menuBorder }]}>
              <Text style={[styles.menuName, { color: c.menuText }]} numberOfLines={1}>
                {user.displayName || firstName}
              </Text>
              {user.email ? (
                <Text
                  style={[styles.menuEmail, { color: c.menuSecondaryText }]}
                  numberOfLines={1}
                >
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
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'background-color 0.15s ease, border-color 0.15s ease',
      } as any,
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
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
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
