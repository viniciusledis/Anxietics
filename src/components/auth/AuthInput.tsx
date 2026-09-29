import { forwardRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { colors } from '../../ui/theme';

type Props = TextInputProps & {
  label: string;
  error?: string;
  password?: boolean;
};

export const AuthInput = forwardRef<TextInput, Props>(function AuthInput(
  { label, error, password = false, editable = true, style, ...props },
  ref,
) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.field, !!error && styles.fieldError]}>
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          accessibilityHint={error}
          editable={editable}
          placeholderTextColor="#8A948B"
          selectionColor={colors.green}
          secureTextEntry={password && !passwordVisible}
          style={[styles.input, style]}
          {...props}
        />
        {password && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              passwordVisible ? 'Ocultar senha' : 'Mostrar senha'
            }
            disabled={!editable}
            hitSlop={8}
            onPress={() => setPasswordVisible((visible) => !visible)}
            style={styles.visibility}
          >
            <Text style={styles.visibilityText}>
              {passwordVisible ? 'Ocultar' : 'Mostrar'}
            </Text>
          </Pressable>
        )}
      </View>
      {!!error && (
        <Text accessibilityLiveRegion="polite" style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  group: { gap: 7 },
  label: { color: colors.ink, fontSize: 14, fontWeight: '600' },
  field: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 18,
    backgroundColor: colors.paper,
  },
  fieldError: { borderColor: '#A54A3F' },
  input: {
    flex: 1,
    minHeight: 52,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.ink,
    fontSize: 16,
  },
  visibility: {
    minWidth: 72,
    minHeight: 48,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visibilityText: { color: colors.green, fontSize: 13, fontWeight: '700' },
  error: { color: '#913D34', fontSize: 13, lineHeight: 18 },
});
