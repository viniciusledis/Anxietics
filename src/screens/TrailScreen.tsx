import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
import { colors, common } from '../ui/theme';

type Props = {
  progress: Progress;
  onPlay: (session: Omit<Session, 'id'>) => void;
  onSettings: () => void;
  onDev?: () => void;
};
export function TrailScreen({ progress, onPlay, onSettings, onDev }: Props) {
  const [tab, setTab] = useState<'trail' | 'daily' | 'free'>('trail');
  const completeCount = STAGES.filter((stage) =>
    progress.completedStageIds.includes(stage.id),
  ).length;
  const today = progress.daily.tasks.filter((task) => task.completed).length;
  const legacyCount = LEGACY_STAGE_IDS.filter((id) =>
    progress.completedStageIds.includes(id),
  ).length;
  return (
    <ScrollView style={common.screen} contentContainerStyle={styles.content}>
      <View style={styles.row}>
        <Text style={styles.brand}>♧ anxietics</Text>
        <Button secondary label="Ajustes" onPress={onSettings} />
      </View>
      <Text style={[common.eyebrow, { marginTop: 24 }]}>
        SEU TEMPO, SEU RITMO
      </Text>
      <Text style={[common.title, { marginTop: 10 }]}>
        Seu jardim de pausas.
      </Text>
      <Text style={[common.body, { marginTop: 10 }]}>
        Explore um gesto novo. Volte quando quiser.
      </Text>
      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          Trilha: {completeCount}/{STAGES.length} etapas
        </Text>
        <Text style={styles.summaryText}>Hoje: {today}/3 atividades</Text>
        <Text
          accessibilityLabel={`${completeCount} detalhes no jardim`}
          style={{ fontSize: 23, color: colors.green }}
        >
          {'✿ '.repeat(Math.min(completeCount, 14)) || '·  ·  ·'}
        </Text>
        <Text style={styles.small}>
          Cada etapa acrescenta uma flor ao jardim. Isso representa seu
          progresso no app.
        </Text>
        {legacyCount > 0 && (
          <Text style={styles.small}>
            {legacyCount} conquistas da primeira versão também estão
            preservadas.
          </Text>
        )}
      </View>
      <View style={styles.tabs}>
        {(
          [
            ['trail', 'Trilha'],
            ['daily', 'Hoje'],
            ['free', 'Livre'],
          ] as const
        ).map(([id, label]) => (
          <Pressable
            key={id}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === id }}
            onPress={() => setTab(id)}
            style={[
              styles.tab,
              tab === id && { backgroundColor: colors.green },
            ]}
          >
            <Text
              style={{
                fontWeight: '600',
                color: tab === id ? colors.paper : colors.green,
              }}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </View>
      {tab === 'trail' && (
        <>
          <Text style={common.eyebrow}>14 GESTOS PARA DESCOBRIR</Text>
          {STAGES.map((stage, index) => {
            const status = getStageStatus(stage.id, progress.completedStageIds);
            const locked = status === 'locked' || !GAME_COMPONENTS[stage.game];
            const info = GAME_INFO[stage.game];
            return (
              <View
                key={stage.id}
                style={[styles.stage, { marginLeft: index % 2 ? 24 : 0 }]}
              >
                {index < STAGES.length - 1 && <View style={styles.connector} />}
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
                  style={styles.stageButton}
                >
                  <View
                    style={[
                      styles.node,
                      {
                        backgroundColor: locked
                          ? '#E0E3D9'
                          : status === 'completed'
                            ? colors.green
                            : info.accent,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: 26,
                        color: locked ? colors.muted : colors.paper,
                      }}
                    >
                      {status === 'completed' ? '✓' : info.symbol}
                    </Text>
                  </View>
                  <View style={{ flex: 1, gap: 5 }}>
                    <Text style={styles.stageTitle}>
                      {String(index + 1).padStart(2, '0')} · {stage.title}
                    </Text>
                    <Text style={styles.small}>
                      {locked
                        ? 'Conclua a etapa anterior'
                        : status === 'completed'
                          ? 'Concluída · jogar livremente'
                          : 'Disponível · descobrir →'}
                    </Text>
                  </View>
                </Pressable>
              </View>
            );
          })}
        </>
      )}
      {tab === 'daily' && (
        <>
          <Text style={common.eyebrow}>TRÊS CONVITES PARA HOJE</Text>
          <Text style={styles.small}>
            {today === 3
              ? 'Atividades concluídas. O modo livre continua aberto.'
              : 'Uma sugestão, sem obrigação. Estas escolhas ficam guardadas durante o dia.'}
          </Text>
          {progress.daily.tasks.map((task, index) => (
            <View key={task.id} style={styles.card}>
              <Text style={styles.stageTitle}>
                {index + 1}. {GAME_INFO[task.game].name}
              </Text>
              <Text style={styles.small}>
                {GAME_INFO[task.game].variations[task.variation]} ·{' '}
                {task.completed ? 'Concluída hoje' : 'Disponível'}
              </Text>
              <Button
                label={
                  task.completed ? 'Repetir livremente' : 'Jogar atividade'
                }
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
          <Text style={styles.small}>
            Jogar pela trilha não marca estas tarefas. Elas têm seu próprio
            registro, sem mudar suas conquistas.
          </Text>
        </>
      )}
      {tab === 'free' && (
        <>
          <Text style={common.eyebrow}>CAMPOS ABERTOS</Text>
          <Text style={styles.small}>
            Repita qualquer jogo liberado. Sem alterar tarefas ou conquistas.
          </Text>
          {unlockedGames(progress.completedStageIds).map((game) => (
            <View key={game} style={styles.card}>
              <Text style={styles.stageTitle}>{GAME_INFO[game].name}</Text>
              {GAME_INFO[game].variations.map((name, variation) => (
                <Button
                  key={name}
                  secondary
                  label={name}
                  disabled={!GAME_COMPONENTS[game]}
                  onPress={() => onPlay({ mode: 'free', game, variation })}
                />
              ))}
            </View>
          ))}
        </>
      )}
      {!!onDev && (
        <Button
          secondary
          label="Laboratório de desenvolvimento"
          onPress={onDev}
        />
      )}
      <Text style={styles.disclaimer}>
        O Anxietics não substitui acompanhamento profissional. Seu progresso não
        mede melhora da saúde mental.
      </Text>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  content: {
    padding: 22,
    gap: 16,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    fontSize: 25,
    fontWeight: '700',
    color: colors.ink,
    letterSpacing: -1,
  },
  summary: {
    padding: 18,
    borderRadius: 20,
    backgroundColor: colors.lightGreen,
    gap: 9,
  },
  summaryText: { fontSize: 16, fontWeight: '600', color: colors.ink },
  tabs: { flexDirection: 'row', gap: 8, marginVertical: 8 },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: colors.lightGreen,
  },
  stage: { minHeight: 106, justifyContent: 'center' },
  connector: {
    position: 'absolute',
    left: 31,
    top: 60,
    width: 4,
    height: 85,
    backgroundColor: '#D3DEC5',
  },
  stageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
  },
  node: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageTitle: { fontSize: 17, fontWeight: '600', color: colors.ink },
  small: { fontSize: 13, color: colors.muted, lineHeight: 20 },
  card: {
    padding: 18,
    borderRadius: 20,
    backgroundColor: colors.paper,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.line,
  },
  disclaimer: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.muted,
    marginVertical: 16,
  },
});
