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
import { GrassGame3D } from '../minigames/grass/GrassGame3D';
import { GAME_INFO } from '../minigames/definitions';
import { Session } from '../minigames/types';
import { localDay, Progress } from '../domain/progress';
import { grassEquipment } from '../economy/rules';
import { TransactionResult } from '../storage/transactions';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { colors, common } from '../ui/theme';

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
  const grass3D = session.game === 'grass' && session.grassVisual !== '2d';
  const FieldComponent = grass3D ? GrassGame3D : Component;
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
      <View style={styles.header}>
        <Button
          secondary
          label="‹  Voltar"
          onPress={onExit}
          disabled={savingResult}
          style={styles.back}
        />
        <Text style={common.eyebrow}>{modeLabel}</Text>
      </View>
      <View style={styles.intro}>
        <Text style={styles.title}>{info.name}</Text>
        {session.game === 'grass' && (
          <Text
            testID="grass-loadout"
            style={{ color: colors.muted, fontSize: 12, marginTop: 6 }}
          >
            {loadout.name}
          </Text>
        )}
        <View style={styles.progressLabel}>
          <Text style={styles.instruction}>
            {openEnded ? info.freeInstruction : info.instruction}
          </Text>
          {!openEnded && (
            <Text style={[styles.percent, grass3D && styles.grassPercent]}>
              {percent}%
            </Text>
          )}
        </View>
        {!openEnded && (
          <View
            accessible
            accessibilityRole="progressbar"
            accessibilityLabel="Progresso da atividade"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            style={[styles.track, grass3D && styles.grassTrack]}
          >
            <View
              style={[
                styles.fill,
                grass3D && styles.grassFill,
                { width: `${percent}%` },
              ]}
            />
          </View>
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
              gap: 16,
              marginTop: 8,
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
                  borderRadius: 14,
                  borderWidth: color === index ? 3 : 1,
                  borderColor: color === index ? colors.ink : colors.line,
                  backgroundColor: shade,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: '#233C32', fontWeight: '700' }}>
                  {['●', '◇', '≋'][index]}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
      <View style={styles.fieldArea} onLayout={layout}>
        {(grass3D || field.scale > 0) && FieldComponent && (
          <View style={grass3D ? styles.frame3D : styles.frame}>
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
        {(paused || !foreground) && !complete && (
          <View style={[styles.celebration, { padding: 24, gap: 16 }]}>
            <Text style={styles.completeTitle}>Uma pausa.</Text>
            <Text style={styles.completeBody}>Sua rodada está aqui.</Text>
            <Button
              label="Continuar"
              onPress={() => setPaused(false)}
              disabled={!foreground}
            />
            <Button secondary label="Sair da rodada" onPress={onExit} />
          </View>
        )}
        {complete && (
          <Animated.View
            testID="completion-card"
            style={[styles.celebration, { opacity }]}
          >
            <ScrollView contentContainerStyle={styles.celebrationContent}>
              <View style={styles.seal}>
                <Text style={styles.check}>✓</Text>
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
                <Text style={styles.completeBody}>
                  Confirmando o salvamento…
                </Text>
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
                <View testID="reward-breakdown" style={{ gap: 9 }}>
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
                      fontSize: 17,
                      fontWeight: '600',
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
      </View>
      <View style={styles.bottom}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button
            secondary
            label="Recomeçar"
            disabled={savingResult}
            style={{ flex: 1 }}
            onPress={() => setConfirmRestart(true)}
          />
          <Button
            secondary
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  back: { minHeight: 48, paddingVertical: 10, paddingHorizontal: 14 },
  intro: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 10 },
  title: {
    fontSize: 23,
    fontWeight: '600',
    color: colors.ink,
    letterSpacing: -0.7,
  },
  progressLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 12,
    marginBottom: 10,
  },
  instruction: { fontSize: 13, color: colors.muted, flex: 1 },
  percent: {
    fontSize: 15,
    color: colors.green,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  grassPercent: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '700',
  },
  track: {
    height: 5,
    backgroundColor: colors.line,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: colors.green, borderRadius: 3 },
  grassTrack: { height: 9, borderRadius: 6, backgroundColor: colors.lightGreen },
  grassFill: { backgroundColor: '#6E9D5C', borderRadius: 6 },
  grassCaption: {
    color: colors.green,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 7,
    minHeight: 16,
  },
  fieldArea: {
    flex: 1,
    marginHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 90,
  },
  frame: { padding: 6, backgroundColor: '#E0E3D0', borderRadius: 7 },
  frame3D: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  bottom: { paddingHorizontal: 24, paddingBottom: 10, paddingTop: 8, gap: 10 },
  note: {
    color: colors.muted,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
  },
  exitNote: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
  },
  celebration: {
    position: 'absolute',
    width: '90%',
    maxWidth: 350,
    maxHeight: '96%',
    borderRadius: 24,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: '#DBE3CE',
    shadowColor: '#233C32',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  celebrationContent: { padding: 24, gap: 12 },
  seal: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.lightGreen,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  check: { fontSize: 26, color: colors.green },
  completeTitle: {
    color: colors.ink,
    fontSize: 23,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  completeBody: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 4,
  },
});
