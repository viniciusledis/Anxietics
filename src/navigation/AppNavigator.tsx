import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GameScreen } from '../screens/GameScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { TrailScreen } from '../screens/TrailScreen';
import { useProgress } from '../storage/useProgress';
import { getStageStatus, Stage } from '../trail/stages';
import { Button } from '../ui/Button';
import { SaveNotice } from '../ui/SaveNotice';
import { colors, common } from '../ui/theme';
import { useReducedMotion } from '../ui/useReducedMotion';

type Screen = { name: 'trail' } | { name: 'settings' } | { name: 'game'; stage: Stage; replay: boolean };

export function AppNavigator() {
  const store = useProgress();
  const [screen, setScreen] = useState<Screen>({ name: 'trail' });
  const reducedMotion = useReducedMotion(store.progress?.preferences.reducedMotion ?? false);
  const exit = useCallback(() => setScreen({ name: 'trail' }), []);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (screen.name === 'trail') return false;
      exit();
      return true;
    });
    return () => subscription.remove();
  }, [screen.name, exit]);

  const play = (stage: Stage) => {
    if (!store.progress) return;
    const status = getStageStatus(stage.id, store.progress.completedStageIds);
    if (status === 'locked') return;
    setScreen({ name: 'game', stage, replay: status === 'completed' });
  };

  return (
    <SafeAreaView style={common.screen}>
      {!store.progress ? <View style={styles.loading}>
        {store.loadError ? <>
          <Text style={common.title}>Vamos tentar de novo?</Text>
          <Text style={common.body}>Não foi possível ler seu progresso. Os dados existentes não foram substituídos.</Text>
          <Button label="Tentar carregar novamente" onPress={() => { void store.reload(); }} />
        </> : <><ActivityIndicator color={colors.green} /><Text style={common.body}>Abrindo seu caminho…</Text></>}
      </View> : <>
        <SaveNotice status={store.saveStatus} retry={store.retrySave} />
        {screen.name === 'trail' && <TrailScreen progress={store.progress} onPlay={play} onSettings={() => setScreen({ name: 'settings' })} />}
        {screen.name === 'settings' && <SettingsScreen reducedMotion={store.progress.preferences.reducedMotion} onReducedMotion={store.setReducedMotion} onExit={exit} />}
        {screen.name === 'game' && <GameScreen stage={screen.stage} replay={screen.replay} reducedMotion={reducedMotion} onExit={exit} onComplete={store.finishStage} />}
      </>}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ loading: { flex: 1, justifyContent: 'center', padding: 28, gap: 18 } });
