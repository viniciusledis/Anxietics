import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import { Icon, IconName } from './Icon';
import { colors, radius, space, type } from './theme';

type Props = {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  hint?: string;
  icon?: IconName;
  destructive?: boolean;
  compact?: boolean;
};
export function Button({
  label,
  onPress,
  secondary,
  disabled,
  loading,
  style,
  hint,
  icon,
  destructive,
  compact,
}: Props) {
  const inactive = !!(disabled || loading);
  const foreground = inactive
    ? colors.disabledText
    : destructive
      ? colors.error
      : secondary
        ? colors.greenDark
        : colors.paper;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={{ disabled: inactive, busy: !!loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.secondary,
        destructive && styles.destructive,
        compact && styles.compact,
        inactive && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={foreground} size="small" />
      ) : icon ? (
        <Icon name={icon} size={20} color={foreground} />
      ) : null}
      <Text style={[styles.label, { color: foreground }]}>{label}</Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    paddingVertical: space.md,
    paddingHorizontal: space.xl,
    backgroundColor: colors.green,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderBottomWidth: 4,
    borderColor: colors.greenDark,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: space.sm,
  },
  secondary: {
    backgroundColor: colors.paper,
    borderColor: colors.line,
    borderBottomWidth: 3,
  },
  destructive: { backgroundColor: colors.lightError, borderColor: '#E8B8AF' },
  compact: {
    minHeight: 44,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
  },
  disabled: { backgroundColor: colors.disabled, borderColor: '#CDD4C6' },
  pressed: {
    transform: [{ translateY: 2 }, { scale: 0.98 }],
    borderBottomWidth: 2,
  },
  label: { ...type.label, textAlign: 'center', flexShrink: 1 },
});
