import {
  ActivityIndicator,
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../ui/theme';

const gardenArtwork = require('../../../docs/visual-3d/references/Anxietics - Identidade Visual 1.png') as ImageSourcePropType;

export function SplashScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <View style={styles.mark} accessibilityElementsHidden>
          <Text style={styles.sprout}>♧</Text>
        </View>
        <Text accessibilityRole="header" style={styles.brand}>
          anxietics
        </Text>
        <Text style={styles.message}>Preparando seu jardim de pausas…</Text>
        <ActivityIndicator
          accessibilityLabel="Carregando aplicativo"
          color={colors.green}
          style={styles.loading}
        />
      </View>
      <Image
        accessibilityIgnoresInvertColors
        resizeMode="cover"
        source={gardenArtwork}
        style={styles.artwork}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'space-between',
  },
  content: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 28 },
  mark: {
    width: 74,
    height: 74,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightGreen,
  },
  sprout: { color: colors.green, fontSize: 40, fontWeight: '700' },
  brand: {
    marginTop: 18,
    color: colors.ink,
    fontSize: 38,
    fontWeight: '700',
    letterSpacing: -1.5,
  },
  message: { marginTop: 10, color: colors.muted, fontSize: 15 },
  loading: { marginTop: 24 },
  artwork: { width: '100%', height: '38%' },
});
