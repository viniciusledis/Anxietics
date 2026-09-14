import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GameScreen } from '../screens/GameScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { TrailScreen } from '../screens/TrailScreen';
import { DevScreen } from '../screens/DevScreen';
import { Session } from '../minigames/types';
import { useProgress } from '../storage/useProgress';
import { unlockedGames } from '../trail/stages';
import { Button } from '../ui/Button';
import { SaveNotice } from '../ui/SaveNotice';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { colors, common } from '../ui/theme';
import { useReducedMotion } from '../ui/useReducedMotion';

const DEV_TOOLS = __DEV__ && process.env.EXPO_PUBLIC_DEV_TOOLS === '1';
let serial = 0;
type Screen =
  | { name: 'trail' | 'settings' | 'dev' }
  | { name: 'game'; session: Session };
export function AppNavigator() {
  const store = useProgress();
  const [screen, setScreen] = useState<Screen>({ name: 'trail' });
  const [confirmReset, setConfirmReset] = useState(false);
  const reducedMotion = useReducedMotion(
    store.progress?.preferences.reducedMotion ?? false,
  );
  const exit = useCallback(() => setScreen({ name: 'trail' }), []);
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (store.resetBusy) return true;
      if (screen.name === 'trail') return false;
      exit();
      return true;
    });
    return () => sub.remove();
  }, [screen.name, exit, store.resetBusy]);
  const play = (selection: Omit<Session, 'id'>) => {
    if (!store.progress) return;
    if (selection.mode === 'dev' || selection.sandbox) {
      if (!DEV_TOOLS) return;
    } else if (
      !unlockedGames(store.progress.completedStageIds).includes(selection.game)
    )
      return;
    setScreen({
      name: 'game',
      session: { ...selection, id: `${Date.now()}:${++serial}` },
    });
  };
  return (
    <SafeAreaView style={common.screen}>
      {!store.progress ? (
        <View
          style={{ flex: 1, justifyContent: 'center', padding: 28, gap: 18 }}
        >
          {store.loadError ? (
            <>
              <Text style={common.title}>Vamos tentar de novo?</Text>
              <Text style={common.body}>
                Não foi possível ler o progresso. Os dados não foram
                substituídos.
              </Text>
              <Button
                label="Tentar carregar"
                onPress={() => {
                  void store.reload();
                }}
              />
              <Button
                secondary
                label="Apagar dados e recomeçar"
                onPress={() => setConfirmReset(true)}
              />
              {store.resetError && (
                <Text style={common.body}>
                  Não foi possível apagar. Tente novamente.
                </Text>
              )}
              <ConfirmDialog
                visible={confirmReset}
                title="Apagar dados locais?"
                message="As conquistas, tarefas e preferências deste aplicativo serão apagadas."
                confirmLabel="Apagar e recomeçar"
                busy={store.resetBusy}
                onCancel={() => setConfirmReset(false)}
                onConfirm={() => {
                  void store.reset().then((ok) => {
                    if (ok) setConfirmReset(false);
                  });
                }}
              />
            </>
          ) : (
            <>
              <ActivityIndicator color={colors.green} />
              <Text style={common.body}>Abrindo seu caminho…</Text>
            </>
          )}
        </View>
      ) : (
        <>
          <SaveNotice status={store.saveStatus} retry={store.retrySave} />
          {screen.name === 'trail' && (
            <TrailScreen
              progress={store.progress}
              onPlay={play}
              onSettings={() => setScreen({ name: 'settings' })}
              onDev={DEV_TOOLS ? () => setScreen({ name: 'dev' }) : undefined}
            />
          )}
          {screen.name === 'settings' && (
            <SettingsScreen
              reducedMotion={store.progress.preferences.reducedMotion}
              onReducedMotion={store.setReducedMotion}
              onExit={exit}
              onReset={store.reset}
              resetBusy={store.resetBusy}
              resetError={store.resetError}
            />
          )}
          {screen.name === 'dev' && DEV_TOOLS && (
            <DevScreen onPlay={play} onExit={exit} />
          )}
          {screen.name === 'game' && (
            <GameScreen
              key={screen.session.id}
              session={screen.session}
              reducedMotion={reducedMotion}
              onExit={exit}
              onComplete={store.finishSession}
              onFree={() =>
                play({
                  game: screen.session.game,
                  variation: screen.session.variation,
                  mode: 'free',
                  sandbox:
                    screen.session.mode === 'dev' || screen.session.sandbox,
                })
              }
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
}
