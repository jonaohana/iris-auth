import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  Platform,
  GestureResponderEvent,
} from 'react-native';
import { theme } from '../theme';

interface HelloBearButtonProps {
  onPress?: (event: GestureResponderEvent) => void;
  title?: string;
}

/**
 * A simple shared "Hello Bear" button.
 * Lives in @iris/auth so every consuming app (ganjahub, forsparta, iris, ...)
 * picks it up from the same source.
 */
export const HelloBearButton: React.FC<HelloBearButtonProps> = ({
  onPress,
  title = 'Hello Bear',
}) => {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={styles.content}>
        <Text style={styles.emoji}>🐻</Text>
        <Text style={styles.text}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary,
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
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 18,
    marginRight: theme.spacing.sm,
  },
  text: {
    color: theme.colors.textLight,
    fontSize: theme.typography.button.fontSize,
    fontWeight: theme.typography.button.fontWeight,
  },
});
