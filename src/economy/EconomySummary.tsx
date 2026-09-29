import { StyleSheet, Text, View } from 'react-native';
import { Progress } from '../domain/progress';
import { ECONOMY, levelFor, levelProgress } from './config';
import { CurrencyIndicator, ProgressBar } from '../ui/primitives';
import { Icon } from '../ui/Icon';
import { colors, space, type } from '../ui/theme';
export function EconomySummary({
  progress,
  compact = false,
}: {
  progress: Progress;
  compact?: boolean;
}) {
  const { seeds, xp } = progress.economy;
  return (
    <View style={styles.summary}>
      <View testID="economy-balance" style={styles.row}>
        <View style={styles.level}>
          <Icon name="sprout" size={22} />
          <Text style={styles.title}>Nível {levelFor(xp)}</Text>
        </View>
        <CurrencyIndicator value={seeds} />
      </View>
      {!compact && (
        <>
          <ProgressBar
            label="Progresso do nível"
            value={levelProgress(xp)}
            max={ECONOMY.xpPerLevel}
          />
          <View style={styles.row}>
            <Text style={styles.caption}>
              {levelProgress(xp)}/{ECONOMY.xpPerLevel} XP para crescer
            </Text>
            <Text style={styles.caption}>{xp} XP total</Text>
          </View>
        </>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  summary: { gap: space.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.sm,
    flexWrap: 'wrap',
  },
  level: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  title: { ...type.label, color: colors.ink },
  caption: { ...type.caption, color: colors.muted },
});
