import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from './Button';
import { colors } from './theme';

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  onCancel,
  onConfirm,
  busy = false,
}: {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  busy?: boolean;
}) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={busy ? () => {} : onCancel}
    >
      <View style={styles.backdrop}>
        <ScrollView contentContainerStyle={styles.card} style={styles.scroll}>
          <Text accessibilityRole="header" style={styles.title}>
            {title}
          </Text>
          <Text style={styles.body}>{message}</Text>
          <Button
            label={busy ? 'Aguarde…' : confirmLabel}
            onPress={onConfirm}
            disabled={busy}
          />
          <Button
            secondary
            label="Cancelar"
            onPress={onCancel}
            disabled={busy}
          />
        </ScrollView>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#183B3480',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flexGrow: 0,
    maxHeight: '90%',
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    backgroundColor: colors.paper,
  },
  card: { padding: 24, gap: 16 },
  title: { fontSize: 22, fontWeight: '600', color: colors.ink },
  body: { fontSize: 15, lineHeight: 23, color: colors.muted },
});
