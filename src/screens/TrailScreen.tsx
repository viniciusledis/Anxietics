import { EconomySummary } from '../economy/EconomySummary';
import { useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Progress } from '../domain/progress';
import { GAME_INFO } from '../minigames/definitions';
import { GAME_COMPONENTS } from '../minigames/catalog';
import { Session } from '../minigames/types';
import {
  LEGACY_STAGE_IDS,
  STAGES,
  getStageStatus,
  unlockedGames,
} from '../trail/stages';
import { Button } from '../ui/Button';
import { BottomNavigation } from '../ui/BottomNavigation';
import { Icon, gameIcon } from '../ui/Icon';
import {
  Badge,
  Brand,
  IconButton,
  ProgressBar,
  SectionHeader,
  SegmentedControl,
  SproutArt,
} from '../ui/primitives';
import { colors, common, radius, space, type } from '../ui/theme';

type Props = {
  progress: Progress;
  onPlay: (session: Omit<Session, 'id'>) => void;
  onSettings: () => void;
  onEconomy: (screen: 'shop' | 'inventory' | 'garden' | 'achievements') => void;
  onDev?: () => void;
};
export function TrailScreen({
  progress,
  onPlay,
  onSettings,
  onDev,
  onEconomy,
}: Props) {
  const scroll = useRef<ScrollView>(null);
  const compact = useWindowDimensions().height < 700;
  const [tab, setTab] = useState<'trail' | 'daily' | 'free'>('trail');
  const completeCount = STAGES.filter((stage) =>
    progress.completedStageIds.includes(stage.id),
  ).length;
  const today = progress.daily.tasks.filter((task) => task.completed).length;
  const legacyCount = LEGACY_STAGE_IDS.filter((id) =>
    progress.completedStageIds.includes(id),
  ).length;
  return (
    <View style={common.screen}>
      <ScrollView
        ref={scroll}
        style={common.screen}
        contentContainerStyle={[
          styles.content,
          compact && { gap: space.md, paddingTop: space.md },
        ]}
      >
        <View style={styles.row}>
          <Brand />
          <IconButton icon="settings" label="Ajustes" onPress={onSettings} />
        </View>
        <View style={styles.welcome}>
          <View style={styles.welcomeCopy}>
            <Text style={common.eyebrow}>SEU TEMPO, SEU RITMO</Text>
            <Text
              accessibilityRole="header"
              style={[common.title, compact && type.title]}
            >
              Seu jardim de pausas.
            </Text>
          </View>
          <SproutArt size={compact ? 80 : 108} />
        </View>
        <EconomySummary progress={progress} />
        <SegmentedControl
          value={tab}
          onChange={setTab}
          options={[
            { id: 'trail', label: 'Trilha' },
            { id: 'daily', label: 'Hoje' },
            { id: 'free', label: 'Livre' },
          ]}
        />
        {tab === 'trail' && (
          <>
            <View style={styles.row}>
              <SectionHeader
                title="Um gesto de cada vez"
                detail={`${completeCount} de ${STAGES.length} etapas concluídas`}
              />
              <Badge
                label={`${completeCount}/${STAGES.length}`}
                icon="flower"
              />
            </View>
            <View style={styles.path}>
              {STAGES.map((stage, index) => {
                const status = getStageStatus(
                  stage.id,
                  progress.completedStageIds,
                );
                const locked =
                  status === 'locked' || !GAME_COMPONENTS[stage.game];
                const offset = [0, 32, 64, 32][index % 4] ?? 0;
                const nextOffset = [0, 32, 64, 32][(index + 1) % 4] ?? 0;
                return (
                  <View
                    key={stage.id}
                    style={[styles.stage, { marginLeft: offset }]}
                  >
                    {index < STAGES.length - 1 && (
                      <View
                        pointerEvents="none"
                        style={[
                          styles.connector,
                          {
                            transform: [
                              {
                                rotate: `${-Math.atan2(nextOffset - offset, 120)}rad`,
                              },
                            ],
                          },
                        ]}
                      />
                    )}
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`${stage.title}. ${status === 'completed' ? 'Concluída, repetir' : locked ? 'Bloqueada' : 'Disponível'}`}
                      accessibilityState={{ disabled: locked }}
                      disabled={locked}
                      onPress={() =>
                        onPlay({
                          mode: status === 'completed' ? 'free' : 'trail',
                          game: stage.game,
                          variation: stage.variation,
                          stageId: stage.id,
                        })
                      }
                      style={({ pressed }) => [
                        styles.stageButton,
                        pressed && { transform: [{ scale: 0.98 }] },
                      ]}
                    >
                      <View
                        style={[
                          styles.node,
                          locked
                            ? styles.lockedNode
                            : status === 'completed'
                              ? styles.completedNode
                              : styles.currentNode,
                        ]}
                      >
                        <Icon
                          name={
                            locked
                              ? gameIcon[stage.game]
                              : status === 'completed'
                                ? 'flower'
                                : 'play'
                          }
                          size={32}
                          color={locked ? '#88927F' : colors.paper}
                        />
                        <View
                          style={[
                            styles.stateMark,
                            {
                              backgroundColor: locked
                                ? colors.disabled
                                : colors.paper,
                            },
                          ]}
                        >
                          <Icon
                            name={
                              locked
                                ? 'lock'
                                : status === 'completed'
                                  ? 'check'
                                  : 'sprout'
                            }
                            size={14}
                            color={locked ? colors.muted : colors.green}
                          />
                        </View>
                      </View>
                      <View style={styles.stageCopy}>
                        <Text style={styles.step}>
                          ETAPA {String(index + 1).padStart(2, '0')}
                        </Text>
                        <Text
                          style={[
                            styles.stageTitle,
                            locked && { color: colors.muted },
                          ]}
                        >
                          {stage.title}
                        </Text>
                        <Text
                          style={[
                            styles.status,
                            status === 'available' && {
                              color: colors.greenDark,
                              fontWeight: '700',
                            },
                          ]}
                        >
                          {locked
                            ? 'Ainda vai florescer'
                            : status === 'completed'
                              ? 'Concluída · jogar de novo'
                              : 'Disponível · começar'}
                        </Text>
                      </View>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </>
        )}
        {tab === 'daily' && (
          <>
            <SectionHeader
              title="Um cuidado para hoje"
              detail={
                today === 3
                  ? 'Seu jardim recebeu os três cuidados de hoje.'
                  : 'Três convites. Faça o que couber no seu dia.'
              }
            />
            <View style={styles.dailyProgress}>
              <Icon name="water" color={colors.blue} />
              <View style={{ flex: 1, gap: space.sm }}>
                <Text style={styles.stageTitle}>
                  {today}/3 atividades concluídas
                </Text>
                <ProgressBar
                  value={today}
                  max={3}
                  label="Atividades de hoje"
                  tone="blue"
                />
              </View>
            </View>
            {progress.daily.tasks.map((task, index) => (
              <View key={task.id} style={styles.activity}>
                <View style={styles.activityTop}>
                  <View style={styles.gameIcon}>
                    <Icon name={gameIcon[task.game]} size={28} />
                  </View>
                  <View style={{ flex: 1, gap: space.xs }}>
                    <Text style={styles.stageTitle}>
                      {GAME_INFO[task.game].name}
                    </Text>
                    <Text style={common.caption}>
                      {GAME_INFO[task.game].variations[task.variation]}
                    </Text>
                  </View>
                  <Icon
                    name={task.completed ? 'check' : 'water'}
                    color={task.completed ? colors.green : colors.blue}
                  />
                </View>
                <Button
                  label={
                    task.completed ? 'Repetir livremente' : 'Jogar atividade'
                  }
                  secondary={task.completed}
                  disabled={!GAME_COMPONENTS[task.game]}
                  onPress={() =>
                    onPlay({
                      mode: task.completed ? 'free' : 'daily',
                      game: task.game,
                      variation: task.variation,
                      day: progress.daily.date,
                      taskId: task.id,
                    })
                  }
                />
              </View>
            ))}
            <Text style={common.caption}>
              Uma partida guiada pode concluir uma etapa e a tarefa do mesmo
              jogo e variação. As recompensas aparecem juntas no resultado.
            </Text>
          </>
        )}
        {tab === 'free' && (
          <>
            <SectionHeader
              title="Seu tempo de brincar"
              detail="Repita os jogos abertos, sem metas ou recompensas."
            />
            {unlockedGames(progress.completedStageIds).map((game) => (
              <View key={game} style={styles.activity}>
                <View style={styles.activityTop}>
                  <View style={styles.gameIcon}>
                    <Icon name={gameIcon[game]} size={28} />
                  </View>
                  <Text style={[styles.stageTitle, { flex: 1 }]}>
                    {GAME_INFO[game].name}
                  </Text>
                </View>
                {GAME_INFO[game].variations.map((name, variation) => (
                  <Button
                    key={name}
                    secondary
                    label={name}
                    icon="play"
                    disabled={!GAME_COMPONENTS[game]}
                    onPress={() => onPlay({ mode: 'free', game, variation })}
                  />
                ))}
              </View>
            ))}
            <Text style={common.caption}>
              O modo livre não concede sementes, XP ou avanço nas conquistas.
            </Text>
          </>
        )}
        {legacyCount > 0 && (
          <Text style={common.caption}>
            {legacyCount} conquistas da primeira versão também estão
            preservadas.
          </Text>
        )}
        <Text style={styles.gentle}>
          Seu jardim estará aqui quando você voltar.
        </Text>
        {!!onDev && (
          <Button
            secondary
            icon="lab"
            label="Laboratório de desenvolvimento"
            onPress={onDev}
          />
        )}
        <Text style={styles.disclaimer}>
          O Anxietics não substitui acompanhamento profissional. Seu progresso
          não mede melhora da saúde mental.
        </Text>
      </ScrollView>
      <BottomNavigation
        onHome={() => scroll.current?.scrollTo({ y: 0, animated: false })}
        onNavigate={onEconomy}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  content: { ...common.content, gap: space.xl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.sm,
  },
  welcome: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  welcomeCopy: { flex: 1, gap: space.sm },
  path: { paddingHorizontal: space.sm },
  stage: { minHeight: 120, justifyContent: 'center' },
  connector: {
    position: 'absolute',
    width: 5,
    height: 126,
    left: 32,
    top: 60,
    backgroundColor: colors.line,
    borderRadius: radius.round,
    transformOrigin: 'top',
  },
  stageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
    paddingVertical: space.md,
  },
  node: {
    width: 68,
    height: 68,
    borderRadius: radius.xl,
    borderBottomWidth: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentNode: { backgroundColor: colors.green, borderColor: colors.greenDark },
  completedNode: { backgroundColor: '#70A04E', borderColor: colors.green },
  lockedNode: { backgroundColor: colors.disabled, borderColor: '#CED6C5' },
  stateMark: {
    position: 'absolute',
    right: -4,
    bottom: -6,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.round,
    borderWidth: 2,
    borderColor: colors.background,
  },
  stageCopy: { flex: 1, gap: space.xs },
  step: { ...type.small, color: colors.muted, letterSpacing: 0.6 },
  stageTitle: { ...type.label, color: colors.ink },
  status: { ...type.caption, color: colors.muted },
  activity: {
    padding: space.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.paper,
    gap: space.lg,
    borderWidth: 1,
    borderColor: colors.line,
  },
  activityTop: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  gameIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightGreen,
    borderRadius: radius.md,
  },
  dailyProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
    paddingVertical: space.sm,
  },
  gentle: {
    ...type.caption,
    color: colors.greenDark,
    textAlign: 'center',
    marginTop: space.lg,
  },
  disclaimer: { ...type.small, color: colors.muted, textAlign: 'center' },
});
