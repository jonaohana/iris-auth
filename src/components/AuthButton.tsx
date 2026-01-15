import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  Platform,
} from 'react-native';
import { theme } from '../theme';

interface AuthButtonProps {
  onPress: () => void;
  title: string;
  provider: 'google' | 'apple' | 'facebook' | 'email' | 'phone';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export const AuthButton: React.FC<AuthButtonProps> = ({
  onPress,
  title,
  provider,
  loading = false,
  disabled = false,
  icon,
}) => {
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

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={provider === 'google' ? theme.colors.text : theme.colors.textLight}
        />
      ) : (
        <View style={styles.buttonContent}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={textStyle}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: theme.spacing.sm,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      } as any,
      default: theme.shadows.small,
    }),
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: theme.spacing.sm,
  },
  googleButton: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...Platform.select({
      web: {
        ':hover': {
          backgroundColor: theme.colors.surfaceHover,
        },
      } as any,
    }),
  },
  appleButton: {
    backgroundColor: theme.colors.apple,
  },
  facebookButton: {
    backgroundColor: '#1877F2',
  },
  emailButton: {
    backgroundColor: theme.colors.primary,
    ...Platform.select({
      web: {
        ':hover': {
          backgroundColor: theme.colors.primaryDark,
        },
      } as any,
    }),
  },
  phoneButton: {
    backgroundColor: theme.colors.primary,
    ...Platform.select({
      web: {
        ':hover': {
          backgroundColor: theme.colors.primaryDark,
        },
      } as any,
    }),
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: theme.typography.button.fontSize,
    fontWeight: theme.typography.button.fontWeight,
  },
  googleText: {
    color: theme.colors.text,
  },
  appleText: {
    color: theme.colors.textLight,
  },
  facebookText: {
    color: theme.colors.textLight,
  },
  emailText: {
    color: theme.colors.textLight,
  },
  phoneText: {
    color: theme.colors.textLight,
  },
});
