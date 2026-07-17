import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

export interface UserMenuOption {
  label: string;
  icon?: string;
  onPress: () => void;
  danger?: boolean;
}

export interface UserMenuProps {
  /** Extra items shown above the default logout option */
  extraOptions?: UserMenuOption[];
  /** Accent colour for the online dot and badge border. Defaults to green. */
  accentColor?: string;
  /** Height in px — match your nav icon size. Defaults to 32. */
  height?: number;
  /** Called after successful sign-out */
  onSignOut?: () => void;
}

export function UserMenu({ extraOptions, accentColor = '#22c55e', height = 32, onSignOut }: UserMenuProps) {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const triggerRef = useRef<View>(null);

  if (!user) return null;

  const name = user.displayName?.split(' ')[0] ?? user.email?.split('@')[0] ?? 'User';

  const handleSignOut = async () => {
    setOpen(false);
    try {
      await signOut();
      onSignOut?.();
    } catch (_) {
      // ignore
    }
  };

  const openMenu = () => {
    if (Platform.OS === 'web' && triggerRef.current) {
      // @ts-ignore — web only
      const rect = (triggerRef.current as any).getBoundingClientRect?.();
      if (rect) {
        setMenuPos({
          top: rect.bottom + window.scrollY + 6,
          right: window.innerWidth - rect.right,
        });
      }
    }
    setOpen(true);
  };

  const allOptions: UserMenuOption[] = [
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

  return (
    <>
      <Pressable
        ref={triggerRef}
        onPress={openMenu}
        style={({ pressed }) => [
          styles.trigger,
          { backgroundColor: badgeBg, borderColor: badgeBorder, height, borderRadius: height / 2 },
          pressed && styles.triggerPressed,
        ]}
      >
        {/* Online dot */}
        <View style={[styles.dot, { backgroundColor: accentColor }]} />
        {/* Person icon */}
        <Ionicons name="person-circle-outline" size={15} color={textColor} style={styles.icon} />
        {/* Name */}
        <Text style={[styles.name, { color: textColor }]}>{name}</Text>
        {/* Chevron */}
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={11}
          color={textColor}
          style={styles.chevron}
        />
      </Pressable>

      {open && (
        <Modal transparent animationType="none" onRequestClose={() => setOpen(false)}>
          {/* Backdrop */}
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={() => setOpen(false)}
          />

          {/* Dropdown */}
          <View
            style={[
              styles.dropdown,
              Platform.OS === 'web'
                ? ({ position: 'fixed', top: menuPos.top, right: menuPos.right } as any)
                : styles.dropdownNative,
            ]}
          >
            {/* Header */}
            <View style={styles.menuHeader}>
              <View style={[styles.dot, { backgroundColor: accentColor, marginRight: 6 }]} />
              <Text style={styles.menuEmail} numberOfLines={1}>
                {user.email}
              </Text>
            </View>
            <View style={styles.divider} />

            {/* Options */}
            {allOptions.map((opt, i) => (
              <Pressable
                key={i}
                onPress={opt.onPress}
                style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
              >
                {opt.icon && (
                  <Ionicons
                    name={opt.icon as any}
                    size={15}
                    color={opt.danger ? '#ef4444' : '#374151'}
                    style={styles.menuItemIcon}
                  />
                )}
                <Text style={[styles.menuItemLabel, opt.danger && styles.menuItemDanger]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderWidth: 1,
    gap: 4,
    cursor: 'pointer',
  } as any,
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
  } as any,
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
  } as any,
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
