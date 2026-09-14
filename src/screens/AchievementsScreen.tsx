import { ScrollView, Text, View } from 'react-native';
import { Progress } from '../domain/progress';
import { ACHIEVEMENTS, achievementProgress } from '../economy/rules';
import { ECONOMY } from '../economy/config';
import { EconomySummary } from '../economy/EconomySummary';
import { Button } from '../ui/Button';
import { colors, common } from '../ui/theme';
export function AchievementsScreen({
  progress,
  onExit,
}: {
  progress: Progress;
  onExit: () => void;
}) {
  return (
    <ScrollView
      style={common.screen}
      contentContainerStyle={{
        padding: 22,
        gap: 16,
        width: '100%',
        maxWidth: 600,
        alignSelf: 'center',
      }}
    >
      <Button secondary label="Voltar à trilha" onPress={onExit} />
      <Text style={common.title}>Conquistas</Text>
      <EconomySummary progress={progress} />
      <Text style={common.body}>
        Marcos do seu caminho no aplicativo, sem prazo ou obrigação. Cada
        recompensa é concedida uma vez.
      </Text>
      {ACHIEVEMENTS.map((a) => (
        <View
          key={a.id}
          style={{
            backgroundColor: colors.paper,
            borderRadius: 20,
            padding: 20,
            gap: 10,
            borderWidth: 1,
            borderColor: colors.line,
          }}
        >
          <Text
            style={{ color: colors.green, fontSize: 20, fontWeight: '600' }}
          >
            {progress.economy.achievementIds.includes(a.id) ? '✓ ' : '◇ '}
            {a.name}
          </Text>
          <Text style={common.body}>{a.description}</Text>
          <Text style={common.body}>
            {achievementProgress(progress, a.id)}/{a.target} ·{' '}
            {progress.economy.achievementIds.includes(a.id)
              ? 'Conquistada'
              : 'Em andamento'}
          </Text>
          <Text style={common.body}>
            Recompensa: {ECONOMY.achievements[a.id]} sementes
          </Text>
        </View>
      ))}
      <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 20 }}>
        Marcos já alcançados antes da ativação da economia são preservados como
        conquistados, sem pagamento retroativo.
      </Text>
    </ScrollView>
  );
}
