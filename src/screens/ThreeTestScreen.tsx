import { Component, ReactNode, useEffect, useState } from 'react';
import { AppState, AppStateStatus, StyleSheet, Text, View } from 'react-native';
import { ThreeTestScene } from '../three/ThreeTestScene';
import { TopBar } from '../ui/primitives';
import { colors, common, radius, space, type } from '../ui/theme';

type ErrorBoundaryProps = { children: ReactNode };
type ErrorBoundaryState = { failed: boolean };

class ThreePreviewErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <View style={styles.fallback}>
          <Text style={styles.fallbackTitle}>
            O canvas 3D não pôde ser aberto.
          </Text>
          <Text style={common.body}>
            Confira se este cliente Expo inclui suporte ao expo-gl.
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export function ThreeTestScreen({ onExit }: { onExit: () => void }) {
  const [appState, setAppState] = useState<AppStateStatus>(
    AppState.currentState,
  );
  const [touches, setTouches] = useState(0);
  const [selected, setSelected] = useState(false);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', setAppState);
    return () => subscription.remove();
  }, []);

  return (
    <View style={styles.screen}>
      <TopBar
        title="Teste 3D isolado"
        onBack={onExit}
        backLabel="‹  Laboratório"
      />

      <View style={styles.copy}>
        <Text style={styles.title}>Objeto interativo</Text>
        <Text style={common.body}>
          Toque no objeto para alternar sua cor. A câmera, a luz e a animação
          ficam no canvas; este texto e o contador continuam em React Native.
        </Text>
      </View>

      <View
        style={styles.canvasFrame}
        accessible
        accessibilityLabel="Área de teste 3D com um objeto geométrico girando"
      >
        <ThreePreviewErrorBoundary>
          <ThreeTestScene
            active={appState === 'active'}
            onObjectTouch={(nextSelected) => {
              setSelected(nextSelected);
              setTouches((value) => value + 1);
            }}
          />
        </ThreePreviewErrorBoundary>
      </View>

      <View style={styles.hud}>
        <View>
          <Text style={styles.hudLabel}>TOQUES</Text>
          <Text style={styles.hudValue}>{touches}</Text>
        </View>
        <View style={styles.hudRight}>
          <Text style={styles.hudLabel}>ESTADO</Text>
          <Text style={styles.state}>{selected ? 'Ativo' : 'Em repouso'}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    padding: space.xl,
    gap: space.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  back: { minHeight: 44, paddingVertical: 10, paddingHorizontal: 14 },
  copy: { gap: 8 },
  title: {
    color: colors.ink,
    ...type.title,
  },
  canvasFrame: {
    flex: 1,
    minHeight: 280,
    maxHeight: 520,
    overflow: 'hidden',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.lightGreen,
  },
  hud: {
    minHeight: 76,
    borderRadius: radius.lg,
    paddingHorizontal: 20,
    paddingVertical: 13,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hudRight: { alignItems: 'flex-end' },
  hudLabel: {
    color: colors.muted,
    ...type.eyebrow,
  },
  hudValue: { color: colors.ink, fontSize: 24, fontWeight: '700' },
  state: { color: colors.green, fontSize: 17, fontWeight: '700', marginTop: 3 },
  fallback: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 8,
    backgroundColor: colors.paper,
  },
  fallbackTitle: { color: colors.ink, fontSize: 18, fontWeight: '700' },
});
