import { ReactNode } from 'react';
import {
  Image,
  ImageSourcePropType,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../ui/theme';

const gardenArtwork = require('../../../docs/visual-3d/references/Anxietics - Identidade Visual 1.png') as ImageSourcePropType;

export function AuthShell({ children }: { children: ReactNode }) {
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
          <View style={styles.artworkFrame}>
            <Image
              accessibilityIgnoresInvertColors
              accessibilityLabel="Jardim Anxietics com trilha, flores e banco"
              resizeMode="cover"
              source={gardenArtwork}
              style={styles.artwork}
            />
          </View>
          <View style={styles.content}>
            <Text style={styles.brand}>♧ anxietics</Text>
            {children}
          </View>
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
    maxWidth: 620,
    alignSelf: 'center',
    padding: 18,
    justifyContent: 'center',
  },
  artworkFrame: {
    height: 180,
    overflow: 'hidden',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: colors.lightGreen,
  },
  artwork: { width: '100%', height: '100%' },
  content: {
    padding: 24,
    gap: 16,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: colors.line,
  },
  brand: {
    color: colors.green,
    fontSize: 23,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
});
