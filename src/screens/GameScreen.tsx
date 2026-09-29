import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  AppState,
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { fitField } from '../minigames/grass/coverage';
import { GAME_COMPONENTS } from '../minigames/catalog';
import { GAME_3D_COMPONENTS } from '../minigames/three/catalog';
import { GAME_INFO } from '../minigames/definitions';
import { Session } from '../minigames/types';
import { localDay, Progress } from '../domain/progress';
import { grassEquipment } from '../economy/rules';
import { TransactionResult } from '../storage/transactions';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { colors, radius, shadows, space, type } from '../ui/theme';
import { Icon } from '../ui/Icon';
import {
  Badge,
  IconButton,
  ProgressBar,
  SproutArt,
  TopBar,
} from '../ui/primitives';

type Props = {
  session: Session;
  reducedMotion: boolean;
  onExit: () => void;
  progress: Progress;
  onShop: () => void;
  onContinue: () => void;
  onComplete: (session: Session) => Promise<TransactionResult>;
  onFree: () => void;
};
export function GameScreen({
  session,
  reducedMotion,
  onExit,
  onComplete,
  onFree,
  progress,
  onShop,
  onContinue,
}: Props) {
  const [loadout] = useState(() => grassEquipment(progress.economy));
  const [savingResult, setSavingResult] = useState(false);
  const [savedResult, setSavedResult] = useState(false);
  const [saveError, setSaveError] = useState('');
  const completionSession = useRef<Session | null>(null);
  const sending = useRef(false);
  const [percent, setPercent] = useState(0);
  const [complete, setComplete] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [color, setColor] = useState(0);
  const [bounds, setBounds] = useState({ width: 0, height: 0 });
  const [foreground, setForeground] = useState(
    AppState.currentState !== 'background',
  );
  const [paused, setPaused] = useState(false);
  const [confirmRestart, setConfirmRestart] = useState(false);
  const completed = useRef(false);
  const currentAttempt = useRef(0);
  const mounted = useRef(true);
  const opacity = useRef(new Animated.Value(0)).current;
  const info = GAME_INFO[session.game];
  const Component = GAME_COMPONENTS[session.game];
  const is3D =
    !!GAME_3D_COMPONENTS[session.game] &&
    (session.visual ?? session.grassVisual) !== '2d';
  const grass3D = is3D && session.game === 'grass';
  const FieldComponent = is3D ? GAME_3D_COMPONENTS[session.game] : Component;
  const openEnded = session.mode === 'free' && info.openEnded;
  const enabled = foreground && !paused && !confirmRestart && !complete;
  useEffect(() => {
    mounted.current = true;
    const sub = AppState.addEventListener('change', (state) => {
      setForeground(state === 'active');
      if (state !== 'active') setPaused(true);
    });
    return () => {
      mounted.current = false;
      sub.remove();
    };
  }, []);
  const saveCompletion = useCallback(
    async (ended: Session) => {
      if (sending.current) return;
      sending.current = true;
      setSavingResult(true);
      setSaveError('');
      try {
        const result = await onComplete(ended);
        if (mounted.current && completionSession.current?.id === ended.id) {
          setSavedResult(result.ok);
          if (!result.ok) setSaveError(result.message);
        }
      } finally {
        sending.current = false;
        if (mounted.current) setSavingResult(false);
      }
    },
    [onComplete],
  );
  const finish = useCallback(() => {
    if (
      !mounted.current ||
      attempt !== currentAttempt.current ||
      completed.current
    )
      return;
    completed.current = true;
    setPercent(100);
    setComplete(true);
    const ended = {
      ...session,
      id: `${session.id}:${attempt}`,
    };
    completionSession.current = ended;
    void saveCompletion(ended);
    AccessibilityInfo.announceForAccessibility(
      'Atividade concluída. Você pode repetir ou voltar à trilha.',
    );
  }, [attempt, session, saveCompletion]);
  const report = useCallback(
    (value: number) => {
      if (
        mounted.current &&
        attempt === currentAttempt.current &&
        !completed.current
      )
        setPercent(value);
    },
    [attempt],
  );
  useEffect(() => {
    if (!complete) {
      opacity.setValue(0);
      return;
    }
    if (reducedMotion || !foreground || paused) {
      opacity.setValue(1);
      return;
    }
    const animation = Animated.timing(opacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [complete, reducedMotion, foreground, paused, opacity]);
  const restart = () => {
    completionSession.current = null;
    setSavedResult(false);
    setSaveError('');
    completed.current = false;
    currentAttempt.current += 1;
    setAttempt(currentAttempt.current);
    setPercent(0);
    setColor(0);
    setComplete(false);
    setPaused(false);
    setConfirmRestart(false);
  };
  const layout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setBounds((old) =>
      old.width === width && old.height === height ? old : { width, height },
    );
  };
  const receipt = progress.economy.receipts.find(
    (r) => r.sessionId === `${session.id}:${attempt}`,
  );
  const confirmed = savedResult || !!receipt;
  const field = fitField(Math.min(bounds.width - 24, 520), bounds.height - 20);
  const modeLabel = {
    trail: 'TRILHA',
    daily: 'ATIVIDADE DO DIA',
    free: 'MODO LIVRE',
    dev: 'LABORATÓRIO',
  }[session.mode];
  return (
    <View style={styles.screen}>
      <View
        style={styles.gameContent}
        accessibilityElementsHidden={complete || paused || !foreground}
        aria-hidden={complete || paused || !foreground}
        importantForAccessibility={
          complete || paused || !foreground ? 'no-hide-descendants' : 'auto'
        }
      >
        <View style={styles.header}>
          <IconButton
            icon="back"
            label="‹  Voltar"
            onPress={onExit}
            disabled={savingResult}
          />
          <Badge label={modeLabel} />
        </View>
        <View style={styles.intro}>
          <Text style={styles.title}>{info.name}</Text>
          {session.game === 'grass' && (
            <Text testID="grass-loadout" style={styles.loadout}>
              {loadout.name}
            </Text>
          )}
          <View style={styles.progressLabel}>
            <Text style={styles.instruction}>
              {openEnded ? info.freeInstruction : info.instruction}
            </Text>
            {!openEnded && (
              <Text style={[styles.percent, is3D && styles.grassPercent]}>
                {percent}%
              </Text>
            )}
          </View>
          {!openEnded && (
            <ProgressBar label="Progresso da atividade" value={percent} />
          )}
          {grass3D && (
            <Text style={styles.grassCaption}>
              {percent >= 75
                ? 'Quase pronto — o jardim já respira.'
                : percent >= 25
                  ? 'O caminho aparado está aparecendo.'
                  : 'Deslize sem pressa. Cada passada conta.'}
            </Text>
          )}
          {!!info.colors && (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                gap: space.lg,
                marginTop: space.sm,
              }}
            >
              {info.colors.map((shade, index) => (
                <Pressable
                  key={shade}
                  disabled={!enabled}
                  accessibilityRole="button"
                  accessibilityLabel={`Cor ${index + 1}`}
                  accessibilityState={{ selected: color === index }}
                  onPress={() => setColor(index)}
                  style={{
                    width: 48,
                    height: 44,
                    borderRadius: radius.md,
                    borderWidth: color === index ? 3 : 1,
                    borderColor: color === index ? colors.ink : colors.line,
                    backgroundColor: shade,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon
                    name={
                      index === 0 ? 'flower' : index === 1 ? 'leaf' : 'water'
                    }
                    size={20}
                    color={colors.ink}
                  />
                </Pressable>
              ))}
            </View>
          )}
        </View>
        <View style={styles.fieldArea} onLayout={layout}>
          {(is3D || field.scale > 0) && FieldComponent && (
            <View style={is3D ? styles.frame3D : styles.frame}>
              <FieldComponent
                key={attempt}
                game={session.game}
                variation={session.variation}
                mode={session.mode}
                scale={field.scale}
                enabled={enabled}
                reducedMotion={reducedMotion}
                color={color}
                grassEquipment={loadout}
                onProgress={report}
                onComplete={finish}
              />
            </View>
          )}
        </View>
        <View style={styles.bottom}>
          <View style={{ flexDirection: 'row', gap: space.sm }}>
            <Button
              secondary
              icon="restart"
              compact
              label="Recomeçar"
              disabled={savingResult}
              style={{ flex: 1 }}
              onPress={() => setConfirmRestart(true)}
            />
            <Button
              secondary
              icon="pause"
              compact
              label="Pausar"
              style={{ flex: 1 }}
              onPress={() => setPaused(true)}
              disabled={complete || paused}
            />
          </View>
          {openEnded && !complete && (
            <Button
              label="Encerrar por aqui"
              onPress={finish}
              disabled={!enabled}
            />
          )}
          <Text style={styles.exitNote}>
            Sem pressa. Ao sair, só esta rodada recomeça.
          </Text>
        </View>
      </View>
      {(paused || !foreground) && !complete && (
        <View style={styles.pauseOverlay} accessibilityViewIsModal>
          <ScrollView
            style={styles.pauseScroll}
            contentContainerStyle={styles.pauseCard}
          >
            <View style={styles.pauseIcon}>
              <Icon name="pause" size={28} />
            </View>
            <Text style={styles.completeTitle}>Uma pausa.</Text>
            <Text style={styles.completeBody}>Sua rodada está aqui.</Text>
            <Button
              label="Continuar"
              onPress={() => setPaused(false)}
              disabled={!foreground}
            />
            <Button secondary label="Sair da rodada" onPress={onExit} />
            <Button
              secondary
              compact
              icon="restart"
              label="Recomeçar"
              onPress={() => setConfirmRestart(true)}
              disabled={savingResult}
            />
          </ScrollView>
        </View>
      )}
      {complete && (
        <Animated.View
          testID="completion-card"
          accessibilityViewIsModal
          style={[styles.celebration, { opacity }]}
        >
          <View style={{ paddingHorizontal: space.md }}>
            <TopBar
              title="Seu momento"
              backLabel="‹  Voltar"
              onBack={onExit}
              disabled={savingResult}
              trailing={
                <IconButton
                  icon="restart"
                  label="Recomeçar"
                  onPress={() => setConfirmRestart(true)}
                  disabled={savingResult}
                />
              }
            />
          </View>
          <ScrollView contentContainerStyle={styles.celebrationContent}>
            <SproutArt size={104} />
            <View style={{ alignSelf: 'center' }}>
              <Badge label="ATIVIDADE CONCLUÍDA" icon="check" />
            </View>
            <Text style={styles.completeTitle}>Um momento concluído.</Text>
            <Text style={styles.completeBody}>
              {session.mode === 'dev'
                ? 'Teste concluído. Seu progresso não foi alterado.'
                : session.mode === 'daily' && session.day !== localDay()
                  ? 'O dia mudou durante a rodada. As novas tarefas estão na trilha.'
                  : 'Você pode seguir ou brincar mais um pouco.'}
            </Text>
            {savingResult && (
              <Text style={styles.completeBody}>Confirmando o salvamento…</Text>
            )}
            {!confirmed && !!saveError && (
              <>
                <Text
                  accessibilityLiveRegion="polite"
                  style={styles.completeBody}
                >
                  {saveError}
                </Text>
                <Button
                  label="Tentar salvar conclusão"
                  disabled={savingResult}
                  onPress={() => {
                    if (completionSession.current)
                      void saveCompletion(completionSession.current);
                  }}
                />
              </>
            )}
            {confirmed && receipt && (
              <View testID="reward-breakdown" style={styles.reward}>
                {receipt.completed.map((label, i) => (
                  <Text key={i} style={styles.completeBody}>
                    {label}
                  </Text>
                ))}
                {receipt.lines.map((line) => (
                  <Text key={line.eventId} style={styles.completeBody}>
                    {line.label}: +{line.seeds} sementes · +{line.xp} XP
                  </Text>
                ))}
                <Text
                  testID="rewards-total"
                  style={{
                    color: colors.green,
                    ...type.label,
                    textAlign: 'center',
                  }}
                >
                  Recebido: {receipt.lines.reduce((n, l) => n + l.seeds, 0)}{' '}
                  sementes · {receipt.lines.reduce((n, l) => n + l.xp, 0)} XP
                </Text>
                {receipt.levelAfter > receipt.levelBefore && (
                  <Text style={styles.completeBody}>
                    Novo nível: {receipt.levelAfter}
                  </Text>
                )}
                <Text style={styles.completeBody}>
                  Saldo: {progress.economy.seeds} sementes · Nível{' '}
                  {receipt.levelAfter}
                </Text>
              </View>
            )}
            {confirmed && !receipt && session.mode === 'free' && (
              <Text style={styles.completeBody}>
                Modo livre: sem sementes ou XP. Continue no seu ritmo.
              </Text>
            )}
            <Button
              icon="sprout"
              label="Continuar trilha"
              disabled={!confirmed || savingResult}
              onPress={onContinue}
            />
            <Button
              secondary
              label="Visitar loja"
              disabled={!confirmed || savingResult}
              onPress={onShop}
            />
            <Button
              secondary
              label="Voltar à trilha"
              disabled={savingResult}
              onPress={onExit}
            />
            <Button
              secondary
              label="Jogar livremente"
              disabled={!confirmed || savingResult}
              onPress={onFree}
            />
          </ScrollView>
        </Animated.View>
      )}
      <ConfirmDialog
        visible={confirmRestart}
        title="Recomeçar a rodada?"
        message="O desenho e o progresso desta rodada serão limpos. Suas conquistas continuam salvas."
        confirmLabel="Sim, recomeçar"
        onCancel={() => setConfirmRestart(false)}
        onConfirm={restart}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    width: '100%',
    maxWidth: 620,
    alignSelf: 'center',
    backgroundColor: colors.background,
  },
  gameContent: { flex: 1 },
  header: {
    paddingHorizontal: space.md,
    paddingTop: space.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
  },
  intro: {
    paddingHorizontal: space.xl,
    paddingTop: space.sm,
    paddingBottom: space.sm,
  },
  title: { ...type.title, color: colors.ink },
  loadout: { ...type.small, color: colors.muted, marginTop: space.xs },
  progressLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
    marginTop: space.sm,
    marginBottom: space.md,
  },
  instruction: { ...type.caption, color: colors.muted, flex: 1 },
  percent: {
    ...type.label,
    color: colors.green,
    fontVariant: ['tabular-nums'],
  },
  grassPercent: { color: colors.greenDark },
  grassCaption: { ...type.small, color: colors.green, marginTop: space.sm },
  fieldArea: {
    flex: 1,
    marginHorizontal: space.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 90,
  },
  frame: {
    padding: space.xs,
    backgroundColor: colors.line,
    borderRadius: radius.sm,
  },
  frame3D: {
    width: '100%',
    height: '100%',
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  bottom: {
    paddingHorizontal: space.xl,
    paddingBottom: space.sm,
    paddingTop: space.sm,
    gap: space.sm,
  },
  exitNote: { ...type.small, color: colors.muted, textAlign: 'center' },
  pauseOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.xl,
  },
  pauseScroll: {
    flexGrow: 0,
    maxHeight: '90%',
    width: '100%',
    maxWidth: 350,
    borderRadius: radius.xl,
    backgroundColor: colors.paper,
  },
  pauseCard: {
    padding: space.xxl,
    gap: space.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.paper,
    ...shadows.soft,
  },
  pauseIcon: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    width: 52,
    height: 52,
    backgroundColor: colors.lightGreen,
    borderRadius: radius.lg,
  },
  celebration: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
  },
  celebrationContent: {
    flexGrow: 1,
    padding: space.xxl,
    gap: space.md,
    justifyContent: 'center',
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  reward: {
    gap: space.sm,
    padding: space.lg,
    marginVertical: space.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.lightGreen,
  },
  completeTitle: { ...type.title, color: colors.ink, textAlign: 'center' },
  completeBody: {
    ...type.caption,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: space.xs,
  },
});
