import { StyleSheet, Text, View } from 'react-native';
import { SaveStatus } from '../storage/useProgress';
import { Button } from './Button';
import { colors } from './theme';

export function SaveNotice({ status, retry }: { status: SaveStatus; retry: () => void }) {
  if (status === 'saved') return null;
  return (
    <View style={styles.notice} accessibilityLiveRegion="polite">
      <Text style={styles.text}>{status === 'saving' ? 'Salvando no aparelho…' : 'Não foi possível salvar. Seu progresso ainda está nesta sessão.'}</Text>
      {status === 'error' && <Button secondary label="Tentar salvar novamente" onPress={retry} />}
    </View>
  );
}

const styles = StyleSheet.create({
  notice: { paddingHorizontal: 20, paddingVertical: 8, gap: 8, backgroundColor: '#EEE6CB' },
  text: { fontSize: 13, lineHeight: 18, color: colors.ink, textAlign: 'center' },
});
