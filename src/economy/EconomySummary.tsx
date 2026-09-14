import { Text, View } from 'react-native';
import { Progress } from '../domain/progress';
import { ECONOMY, levelFor, levelProgress } from './config';
import { colors, common } from '../ui/theme';
export function EconomySummary({
  progress,
  compact = false,
}: {
  progress: Progress;
  compact?: boolean;
}) {
  const { seeds, xp } = progress.economy;
  return (
    <View
      style={{
        backgroundColor: colors.lightGreen,
        padding: 16,
        borderRadius: 18,
        gap: 8,
      }}
    >
      <Text
        testID="economy-balance"
        style={{ color: colors.ink, fontSize: 17, fontWeight: '600' }}
      >
        {seeds} sementes · Nível {levelFor(xp)}
      </Text>
      {!compact && (
        <>
          <Text style={common.body}>
            {levelProgress(xp)}/{ECONOMY.xpPerLevel} XP até o próximo nível ·{' '}
            {xp} XP total
          </Text>
          <View
            accessibilityRole="progressbar"
            accessibilityLabel="Progresso do nível"
            aria-valuemin={0}
            aria-valuemax={ECONOMY.xpPerLevel}
            aria-valuenow={levelProgress(xp)}
            style={{ height: 5, backgroundColor: '#CCD8C0', borderRadius: 4 }}
          >
            <View
              style={{
                height: 5,
                borderRadius: 4,
                backgroundColor: colors.green,
                width: `${(levelProgress(xp) / ECONOMY.xpPerLevel) * 100}%`,
              }}
            />
          </View>
          <Text style={{ color: colors.muted, fontSize: 12 }}>
            XP representa seu progresso no aplicativo.
          </Text>
        </>
      )}
    </View>
  );
}
