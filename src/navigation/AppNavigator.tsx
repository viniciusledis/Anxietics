import { ShopScreen } from '../screens/ShopScreen';
import { GardenScreen } from '../screens/GardenScreen';
import { AchievementsScreen } from '../screens/AchievementsScreen';
import { STAGES, getStageStatus } from '../trail/stages';
import { localDay } from '../domain/progress';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GameScreen } from '../screens/GameScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { TrailScreen } from '../screens/TrailScreen';
import { DevScreen } from '../screens/DevScreen';
import { ThreeTestScreen } from '../screens/ThreeTestScreen';
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
  | {
      name:
        | 'trail'
        | 'settings'
        | 'dev'
        | 'threeTest'
        | 'shop'
        | 'inventory'
        | 'garden'
        | 'achievements';
    }
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
      if (store.resetBusy || store.busy) return true;
      if (screen.name === 'trail') return false;
      exit();
      return true;
    });
    return () => sub.remove();
  }, [screen.name, exit, store.resetBusy, store.busy]);
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
      session: {
        ...selection,
        day: selection.day ?? localDay(),
        id: `${Date.now()}:${++serial}`,
      },
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
                message="Etapas, conquistas, XP, sementes, compras virtuais, equipamentos, jardim e preferências serão apagados. Isso reinicia o perfil local."
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
              onEconomy={(name) => setScreen({ name })}
              onSettings={() => setScreen({ name: 'settings' })}
              onDev={DEV_TOOLS ? () => setScreen({ name: 'dev' }) : undefined}
            />
          )}
          {(screen.name === 'shop' || screen.name === 'inventory') && (
            <ShopScreen
              key={screen.name}
              progress={store.progress}
              busy={store.busy}
              inventory={screen.name === 'inventory'}
              onExit={exit}
              onGarden={() => setScreen({ name: 'garden' })}
              onBuy={store.buy}
              onEquip={store.equip}
            />
          )}
          {screen.name === 'garden' && (
            <GardenScreen
              progress={store.progress}
              busy={store.busy}
              onExit={exit}
              onShop={() => setScreen({ name: 'shop' })}
              onPlace={store.place}
            />
          )}
          {screen.name === 'achievements' && (
            <AchievementsScreen progress={store.progress} onExit={exit} />
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
            <DevScreen
              onPlay={play}
              onThreeTest={() => setScreen({ name: 'threeTest' })}
              onExit={exit}
            />
          )}
          {screen.name === 'threeTest' && DEV_TOOLS && (
            <ThreeTestScreen onExit={() => setScreen({ name: 'dev' })} />
          )}
          {screen.name === 'game' && (
            <GameScreen
              key={screen.session.id}
              session={screen.session}
              progress={store.progress}
              onShop={() => setScreen({ name: 'shop' })}
              onContinue={() => {
                const next = STAGES.find(
                  (s) =>
                    getStageStatus(s.id, store.progress!.completedStageIds) ===
                    'available',
                );
                if (next)
                  play({
                    mode: 'trail',
                    game: next.game,
                    variation: next.variation,
                    stageId: next.id,
                  });
                else exit();
              }}
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
                  grassVisual: screen.session.grassVisual,
                })
              }
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
}
