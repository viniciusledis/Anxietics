import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SaveStatus } from '../storage/useProgress';
import { Button } from './Button';
import { Icon } from './Icon';
import { colors, space, type } from './theme';
export function SaveNotice({
  status,
  retry,
}: {
  status: SaveStatus;
  retry: () => void;
}) {
  if (status === 'saved') return null;
  return (
    <View
      style={[
        styles.notice,
        status === 'error' && { backgroundColor: colors.lightError },
      ]}
      accessibilityLiveRegion="polite"
    >
      <View style={styles.row}>
        {status === 'saving' ? (
          <ActivityIndicator size="small" color={colors.green} />
        ) : (
          <Icon name="alert" color={colors.error} size={20} />
        )}
        <Text style={styles.text}>
          {status === 'saving'
            ? 'Salvando no aparelho…'
            : 'Não foi possível salvar a alteração. O último estado confirmado foi preservado.'}
        </Text>
      </View>
      {status === 'error' && (
        <Button
          secondary
          compact
          label="Tentar salvar novamente"
          onPress={retry}
        />
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  notice: {
    paddingHorizontal: space.xl,
    paddingVertical: space.sm,
    gap: space.sm,
    backgroundColor: colors.lightGreen,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
  },
  text: {
    ...type.caption,
    flexShrink: 1,
    color: colors.ink,
    textAlign: 'center',
  },
});
