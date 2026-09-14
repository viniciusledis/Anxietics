import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { colors } from './theme';

type Props = {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  hint?: string;
};

export function Button({
  label,
  onPress,
  secondary,
  disabled,
  style,
  hint,
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint={hint}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.secondary,
        pressed && styles.pressed,
        disabled && { opacity: 0.5 },
        style,
      ]}
    >
      <Text style={[styles.label, secondary && { color: colors.green }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: colors.green,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondary: { backgroundColor: colors.lightGreen },
  pressed: { opacity: 0.75 },
  label: {
    color: colors.paper,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
