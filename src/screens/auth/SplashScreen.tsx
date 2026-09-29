import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Brand, SproutArt } from '../../ui/primitives';
import { colors, space, type } from '../../ui/theme';
export function SplashScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <SproutArt size={180} />
        <Brand />
        <Text style={styles.message}>Preparando seu jardim de pausas…</Text>
        <ActivityIndicator
          accessibilityLabel="Carregando aplicativo"
          color={colors.green}
          style={styles.loading}
        />
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
  },
  content: { alignItems: 'center', padding: space.xxl, gap: space.lg },
  message: { ...type.body, color: colors.muted, textAlign: 'center' },
  loading: { marginTop: space.sm },
});
