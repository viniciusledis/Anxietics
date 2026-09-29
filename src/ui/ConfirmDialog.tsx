import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from './Button';
import { Icon } from './Icon';
import { colors, radius, space, type } from './theme';
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  onCancel,
  onConfirm,
  busy = false,
  destructive = false,
}: {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  busy?: boolean;
  destructive?: boolean;
}) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={busy ? () => {} : onCancel}
    >
      <SafeAreaView style={styles.backdrop}>
        <View accessibilityViewIsModal style={styles.modal}>
          <ScrollView contentContainerStyle={styles.card} bounces={false}>
            <View
              style={[
                styles.symbol,
                destructive && { backgroundColor: colors.lightError },
              ]}
            >
              <Icon
                name={destructive ? 'alert' : 'restart'}
                size={30}
                color={destructive ? colors.error : colors.green}
              />
            </View>
            <Text accessibilityRole="header" style={styles.title}>
              {title}
            </Text>
            <Text style={styles.body}>{message}</Text>
            <Button
              label={busy ? 'Aguarde…' : confirmLabel}
              onPress={onConfirm}
              disabled={busy}
              loading={busy}
              destructive={destructive}
            />
            <Button
              secondary
              label="Cancelar"
              onPress={onCancel}
              disabled={busy}
            />
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    padding: space.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    maxHeight: '90%',
    width: '100%',
    maxWidth: 400,
    borderRadius: radius.xl,
    backgroundColor: colors.paper,
    overflow: 'hidden',
  },
  card: { padding: space.xxl, gap: space.lg },
  symbol: {
    alignSelf: 'center',
    width: 60,
    height: 60,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightGreen,
  },
  title: { ...type.title, color: colors.ink, textAlign: 'center' },
  body: { ...type.body, color: colors.muted, textAlign: 'center' },
});
