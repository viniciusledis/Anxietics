import { ReactNode } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Icon, IconName } from './Icon';
import { colors, common, radius, space, type } from './theme';

export function Brand() {
  return (
    <View style={common.row}>
      <Icon name="sprout" size={28} />
      <Text style={styles.brand}>anxietics</Text>
    </View>
  );
}
export function IconButton({
  icon,
  label,
  onPress,
  disabled = false,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        disabled && { opacity: 0.5 },
        pressed && {
          backgroundColor: colors.lightGreen,
          transform: [{ scale: 0.97 }],
        },
      ]}
    >
      <Icon name={icon} color={colors.ink} />
    </Pressable>
  );
}
export function TopBar({
  title,
  onBack,
  backLabel = 'Voltar à trilha',
  disabled = false,
  trailing,
}: {
  title: string;
  onBack: () => void;
  backLabel?: string;
  disabled?: boolean;
  trailing?: ReactNode;
}) {
  return (
    <View style={styles.topBar}>
      <IconButton
        icon="back"
        label={backLabel}
        onPress={onBack}
        disabled={disabled}
      />
      <Text accessibilityRole="header" style={styles.topTitle}>
        {title}
      </Text>
      {trailing ?? <View style={styles.topSpacer} />}
    </View>
  );
}
export function SectionHeader({
  title,
  detail,
}: {
  title: string;
  detail?: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text accessibilityRole="header" style={common.section}>
        {title}
      </Text>
      {detail && <Text style={common.caption}>{detail}</Text>}
    </View>
  );
}
export function ProgressBar({
  value,
  max = 100,
  label,
  tone = 'green',
}: {
  value: number;
  max?: number;
  label: string;
  tone?: 'green' | 'gold' | 'blue';
}) {
  const percent = Math.max(0, Math.min(100, (value / Math.max(max, 1)) * 100));
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max, now: value }}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      style={styles.track}
    >
      <View
        style={[
          styles.fill,
          {
            width: `${percent}%`,
            backgroundColor:
              tone === 'gold'
                ? colors.yellow
                : tone === 'blue'
                  ? colors.blue
                  : colors.green,
          },
        ]}
      />
    </View>
  );
}
export function Badge({
  label,
  tone = 'green',
  icon,
}: {
  label: string;
  tone?: 'green' | 'gold' | 'neutral' | 'blue';
  icon?: IconName;
}) {
  const color =
    tone === 'gold'
      ? colors.gold
      : tone === 'blue'
        ? colors.blue
        : tone === 'neutral'
          ? colors.muted
          : colors.greenDark;
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor:
            tone === 'gold'
              ? colors.lightYellow
              : tone === 'blue'
                ? colors.lightBlue
                : tone === 'neutral'
                  ? colors.disabled
                  : colors.lightGreen,
        },
      ]}
    >
      {icon && <Icon name={icon} size={16} color={color} />}
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}
export function CurrencyIndicator({ value }: { value: number }) {
  return (
    <View
      style={styles.currency}
      accessible
      accessibilityLabel={`${value} sementes`}
    >
      <Icon name="seed" size={23} color={colors.gold} />
      <Text style={styles.currencyText}>{value}</Text>
    </View>
  );
}
export function SproutArt({ size = 120 }: { size?: number }) {
  return (
    <Image
      accessible={false}
      accessibilityIgnoresInvertColors
      source={require('../../assets/illustrations/sprout.png')}
      resizeMode="contain"
      style={{ width: size, height: size, alignSelf: 'center' }}
    />
  );
}
export function EmptyState({
  title,
  message,
  children,
}: {
  title: string;
  message: string;
  children?: ReactNode;
}) {
  return (
    <View style={styles.empty}>
      <SproutArt />
      <Text accessibilityRole="header" style={styles.emptyTitle}>
        {title}
      </Text>
      <Text style={styles.emptyMessage}>{message}</Text>
      {children}
    </View>
  );
}
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <View style={styles.segments}>
      {options.map((option) => (
        <Pressable
          key={option.id}
          accessibilityRole="tab"
          accessibilityState={{ selected: value === option.id }}
          onPress={() => onChange(option.id)}
          style={({ pressed }) => [
            styles.segment,
            value === option.id && styles.segmentSelected,
            pressed && { opacity: 0.75 },
          ]}
        >
          <Text
            style={[
              styles.segmentText,
              value === option.id && { color: colors.greenDark },
            ]}
          >
            {option.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
export function FilterChips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly { id: T; name: string }[];
  value: T;
  onChange: (id: T) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chips}
    >
      {options.map((option) => (
        <Pressable
          key={option.id}
          accessibilityRole="button"
          accessibilityState={{ selected: value === option.id }}
          onPress={() => onChange(option.id)}
          style={[styles.chip, value === option.id && styles.chipSelected]}
        >
          <Text
            style={[
              styles.chipText,
              value === option.id && { color: colors.paper },
            ]}
          >
            {option.name}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  brand: { ...type.title, color: colors.ink, letterSpacing: -1 },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    minHeight: 52,
  },
  topTitle: {
    ...type.section,
    color: colors.ink,
    flex: 1,
    textAlign: 'center',
  },
  topSpacer: { width: 48 },
  sectionHeader: { gap: space.xs },
  track: {
    height: 10,
    borderRadius: radius.round,
    backgroundColor: colors.line,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radius.round },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    paddingVertical: space.xs,
    paddingHorizontal: space.sm,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
  badgeText: { ...type.small, flexShrink: 1 },
  currency: {
    flexDirection: 'row',
    gap: space.xs,
    alignItems: 'center',
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    backgroundColor: colors.lightYellow,
    borderRadius: radius.md,
  },
  currencyText: {
    ...type.label,
    color: colors.gold,
    fontVariant: ['tabular-nums'],
  },
  empty: { alignItems: 'center', paddingVertical: space.xxl, gap: space.sm },
  emptyTitle: { ...type.section, color: colors.ink, textAlign: 'center' },
  emptyMessage: {
    ...type.body,
    color: colors.muted,
    textAlign: 'center',
    maxWidth: 320,
  },
  segments: {
    flexDirection: 'row',
    padding: space.xs,
    gap: space.xs,
    backgroundColor: colors.lightGreen,
    borderRadius: radius.lg,
  },
  segment: {
    flex: 1,
    minHeight: 44,
    paddingVertical: space.md,
    paddingHorizontal: space.xs,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  segmentSelected: { backgroundColor: colors.paper },
  segmentText: { ...type.label, color: colors.muted, textAlign: 'center' },
  chips: { gap: space.sm },
  chip: {
    minHeight: 44,
    paddingHorizontal: space.lg,
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.lightGreen,
  },
  chipSelected: { backgroundColor: colors.green },
  chipText: { ...type.caption, fontWeight: '700', color: colors.greenDark },
});
