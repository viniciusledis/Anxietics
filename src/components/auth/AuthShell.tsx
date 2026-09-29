import { ReactNode } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Brand } from '../../ui/primitives';
import { colors, radius, space } from '../../ui/theme';
export function AuthShell({
  children,
  compact = false,
}: {
  children: ReactNode;
  compact?: boolean;
}) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardDismissMode={
            Platform.OS === 'ios' ? 'interactive' : 'on-drag'
          }
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.brand}>
            <Brand />
          </View>
          {!compact && (
            <View style={styles.artworkFrame}>
              <Image
                accessibilityIgnoresInvertColors
                accessibilityLabel="Jardim Anxietics com trilha, flores e banco"
                resizeMode="cover"
                source={require('../../../docs/visual-3d/references/Anxietics - Identidade Visual 1.png')}
                style={styles.artwork}
              />
            </View>
          )}
          <View style={styles.content}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  keyboard: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
    padding: space.xxl,
    gap: space.xxl,
    paddingBottom: space.xxxl,
    justifyContent: 'center',
  },
  brand: { alignItems: 'center' },
  artworkFrame: {
    height: 164,
    overflow: 'hidden',
    borderRadius: radius.xl,
    backgroundColor: '#FFF8EB',
  },
  artwork: { width: '100%', height: '100%' },
  content: { gap: space.lg },
});
