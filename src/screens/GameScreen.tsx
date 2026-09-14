import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Alert, Animated, AppState, LayoutChangeEvent, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GrassGame } from '../minigames/grass/GrassGame';
import { fitField } from '../minigames/grass/coverage';
import { Stage } from '../trail/stages';
import { Button } from '../ui/Button';
import { colors, common } from '../ui/theme';

type Props = { stage: Stage; replay: boolean; reducedMotion: boolean; onExit: () => void; onComplete: (id: string) => void };

export function GameScreen({ stage, replay, reducedMotion, onExit, onComplete }: Props) {
  const [percent, setPercent] = useState(0);
  const [complete, setComplete] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [bounds, setBounds] = useState({ width: 0, height: 0 });
  const [active, setActive] = useState(AppState.currentState === 'active');
  const completed = useRef(false);
  const currentAttempt = useRef(0);
  const mounted = useRef(true);
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    mounted.current = true;
    const subscription = AppState.addEventListener('change', state => setActive(state === 'active'));
    return () => { mounted.current = false; subscription.remove(); };
  }, []);

  // O id da tentativa também rejeita callbacks que já estavam na fila ao reiniciar/sair.
  const finish = useCallback(() => {
    if (!mounted.current || attempt !== currentAttempt.current || completed.current) return;
    completed.current = true;
    setPercent(100);
    setComplete(true);
    onComplete(stage.id);
    AccessibilityInfo.announceForAccessibility('Campo concluído. Você pode repetir ou voltar à trilha.');
  }, [attempt, stage.id, onComplete]);

  const reportProgress = useCallback((value: number) => {
    if (mounted.current && attempt === currentAttempt.current) setPercent(value);
  }, [attempt]);

  useEffect(() => {
    if (!complete) { opacity.setValue(0); return; }
    if (reducedMotion) { opacity.setValue(1); return; }
    const animation = Animated.timing(opacity, { toValue: 1, duration: 450, useNativeDriver: true });
    animation.start();
    return () => animation.stop();
  }, [complete, reducedMotion, opacity]);

  const restart = () => {
    completed.current = false;
    currentAttempt.current += 1;
    setAttempt(currentAttempt.current);
    setPercent(0);
    setComplete(false);
  };

  const askRestart = () => {
    if (percent === 0 || complete) { restart(); return; }
    Alert.alert('Recomeçar este campo?', 'Só o corte desta rodada será reiniciado. As etapas concluídas continuam salvas.', [
      { text: 'Continuar aqui', style: 'cancel' }, { text: 'Recomeçar', onPress: restart },
    ]);
  };

  const layout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setBounds(previous => previous.width === width && previous.height === height ? previous : { width, height });
  };
  const field = fitField(Math.min(bounds.width - 24, 520), bounds.height - 20);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Button secondary label="‹  Trilha" onPress={onExit} style={styles.back} hint="Sai da rodada sem alterar suas etapas concluídas." />
        <Text style={common.eyebrow}>{replay ? 'MODO LIVRE' : 'CORTAR GRAMA'}</Text>
      </View>
      <View style={styles.intro}>
        <Text style={styles.title}>{stage.title}</Text>
        <View style={styles.progressLabel}>
          <Text style={styles.instruction}>{complete ? 'Seu caminho ficou por aqui.' : 'Passe o dedo. Crie seu caminho.'}</Text>
          <Text style={styles.percent}>{percent}%</Text>
        </View>
        <View accessible accessibilityRole="progressbar" accessibilityLabel="Área cortada do campo"
          aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} style={styles.track}>
          <View style={[styles.fill, { width: `${percent}%` }]} />
        </View>
      </View>

      <View style={styles.fieldArea} onLayout={layout}>
        {field.scale > 0 && <View style={styles.frame}>
          <GrassGame key={attempt} stage={stage} scale={field.scale} enabled={active} onProgress={reportProgress} onComplete={finish} />
        </View>}
        {!active && <View style={StyleSheet.absoluteFill} />}
        {complete && <Animated.View testID="completion-card" style={[styles.celebration, { opacity }]}>
          <ScrollView contentContainerStyle={styles.celebrationContent}>
            <View style={styles.seal}><Text style={styles.check}>✓</Text></View>
            <Text style={styles.completeTitle}>Um campo renovado.</Text>
            <Text style={styles.completeBody}>Pode ficar mais um pouco.{ '\n' }Ou seguir no seu ritmo.</Text>
            <Button label="Voltar à trilha" onPress={onExit} />
            <Button secondary label="Jogar de novo" onPress={restart} />
          </ScrollView>
        </Animated.View>}
      </View>

      <View style={styles.bottom}>
        <Text style={styles.note}>{complete ? 'Concluir de novo não duplica conquistas.' : 'Sem tempo limite. Quase todo o campo já basta.'}</Text>
        <Button secondary label="Recomeçar campo" onPress={askRestart} />
        <Text style={styles.exitNote}>Ao sair, apenas o corte desta rodada recomeça.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, width: '100%', maxWidth: 620, alignSelf: 'center', backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  back: { minHeight: 48, paddingVertical: 10, paddingHorizontal: 14 },
  intro: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 10 },
  title: { fontSize: 25, fontWeight: '600', color: colors.ink, letterSpacing: -0.7 },
  progressLabel: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 12, marginBottom: 10 },
  instruction: { fontSize: 13, color: colors.muted, flex: 1 },
  percent: { fontSize: 15, color: colors.green, fontWeight: '600', fontVariant: ['tabular-nums'] },
  track: { height: 5, backgroundColor: colors.line, borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.green, borderRadius: 3 },
  fieldArea: { flex: 1, marginHorizontal: 12, alignItems: 'center', justifyContent: 'center', minHeight: 80 },
  frame: { padding: 6, backgroundColor: '#E0E3D0', borderRadius: 7 },
  bottom: { paddingHorizontal: 24, paddingBottom: 10, paddingTop: 8, gap: 10 },
  note: { color: colors.muted, fontSize: 12, textAlign: 'center', lineHeight: 17 },
  exitNote: { color: colors.muted, fontSize: 11, lineHeight: 16, textAlign: 'center' },
  celebration: { position: 'absolute', width: '90%', maxWidth: 350, maxHeight: '96%', borderRadius: 24, backgroundColor: colors.paper, borderWidth: 1, borderColor: '#DBE3CE', shadowColor: '#233C32', shadowOpacity: 0.1, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 4 },
  celebrationContent: { padding: 24, gap: 12 },
  seal: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.lightGreen, justifyContent: 'center', alignItems: 'center', alignSelf: 'center' },
  check: { fontSize: 26, color: colors.green },
  completeTitle: { color: colors.ink, fontSize: 23, fontWeight: '600', textAlign: 'center', letterSpacing: -0.5 },
  completeBody: { color: colors.muted, fontSize: 14, lineHeight: 21, textAlign: 'center', marginBottom: 4 },
});
