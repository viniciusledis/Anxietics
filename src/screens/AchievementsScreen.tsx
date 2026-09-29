import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Progress } from '../domain/progress';
import { ACHIEVEMENTS, achievementProgress } from '../economy/rules';
import { ECONOMY } from '../economy/config';
import { EconomySummary } from '../economy/EconomySummary';
import { Icon, IconName } from '../ui/Icon';
import {
  Badge,
  ProgressBar,
  SectionHeader,
  SproutArt,
  TopBar,
} from '../ui/primitives';
import { colors, common, radius, space, type } from '../ui/theme';
const achievementIcons: Record<string, IconName> = {
  'first-step': 'sprout',
  explorer: 'flower',
  'my-corner': 'tree',
};
export function AchievementsScreen({
  progress,
  onExit,
}: {
  progress: Progress;
  onExit: () => void;
}) {
  return (
    <ScrollView style={common.screen} contentContainerStyle={common.content}>
      <TopBar title="Conquistas" onBack={onExit} />
      <View style={styles.intro}>
        <View style={{ flex: 1, gap: space.sm }}>
          <Text style={common.eyebrow}>PEQUENAS CONQUISTAS</Text>
          <Text accessibilityRole="header" style={common.title}>
            Seu cuidado floresce.
          </Text>
        </View>
        <SproutArt size={108} />
      </View>
      <EconomySummary progress={progress} />
      <SectionHeader
        title="Marcos do caminho"
        detail="Cada descoberta tem seu tempo. Sem prazo ou obrigação."
      />
      <View>
        {ACHIEVEMENTS.map((a) => {
          const earned = progress.economy.achievementIds.includes(a.id);
          const value = achievementProgress(progress, a.id);
          return (
            <View key={a.id} style={styles.achievement}>
              <View style={[styles.medal, earned && styles.earned]}>
                <Icon
                  name={achievementIcons[a.id] ?? 'sprout'}
                  size={36}
                  color={earned ? colors.gold : colors.green}
                />
                {earned && (
                  <View style={styles.check}>
                    <Icon name="check" size={14} color={colors.paper} />
                  </View>
                )}
              </View>
              <View style={styles.copy}>
                <Text style={styles.title}>{a.name}</Text>
                <Text style={common.caption}>{a.description}</Text>
                <ProgressBar
                  label={`Progresso de ${a.name}`}
                  value={value}
                  max={a.target}
                  tone={earned ? 'gold' : 'green'}
                />
                <View style={styles.status}>
                  <Text style={common.caption}>
                    {value}/{a.target} ·{' '}
                    {earned ? 'Conquistada' : 'Em andamento'}
                  </Text>
                  <Badge
                    tone="gold"
                    icon="seed"
                    label={`${ECONOMY.achievements[a.id]}`}
                  />
                </View>
              </View>
            </View>
          );
        })}
      </View>
      <Text style={common.caption}>
        Cada recompensa é concedida uma vez. Marcos já alcançados antes da
        ativação da economia são preservados como conquistados, sem pagamento
        retroativo.
      </Text>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  intro: { flexDirection: 'row', alignItems: 'center' },
  achievement: {
    flexDirection: 'row',
    gap: space.lg,
    paddingVertical: space.xxl,
    borderBottomWidth: 1,
    borderColor: colors.line,
  },
  medal: {
    width: 68,
    height: 76,
    backgroundColor: colors.lightGreen,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 4,
    borderColor: '#D6E5C4',
  },
  earned: { backgroundColor: colors.lightYellow, borderColor: colors.yellow },
  check: {
    position: 'absolute',
    bottom: -8,
    width: 24,
    height: 24,
    backgroundColor: colors.green,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1, gap: space.sm },
  title: { ...type.label, color: colors.ink },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.sm,
    flexWrap: 'wrap',
  },
});
