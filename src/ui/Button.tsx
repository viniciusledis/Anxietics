import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import { colors } from './theme';

type Props = {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  hint?: string;
};

export function Button({
  label,
  onPress,
  secondary,
  disabled,
  loading,
  style,
  hint,
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint={hint}
      accessibilityState={{
        disabled: !!(disabled || loading),
        busy: !!loading,
      }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.secondary,
        pressed && styles.pressed,
        (disabled || loading) && { opacity: 0.5 },
        style,
      ]}
    >
      {loading && (
        <ActivityIndicator
          color={secondary ? colors.green : colors.paper}
          size="small"
        />
      )}
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
    flexDirection: 'row',
    gap: 9,
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
