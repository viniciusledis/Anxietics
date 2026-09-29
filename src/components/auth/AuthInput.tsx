import { forwardRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { colors, radius, space, type } from '../../ui/theme';
import { Icon } from '../../ui/Icon';

type Props = TextInputProps & {
  label: string;
  error?: string;
  password?: boolean;
};

export const AuthInput = forwardRef<TextInput, Props>(function AuthInput(
  {
    label,
    error,
    password = false,
    editable = true,
    style,
    onFocus,
    onBlur,
    ...props
  },
  ref,
) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.field,
          focused && styles.fieldFocused,
          !editable && styles.fieldDisabled,
          !!error && styles.fieldError,
        ]}
      >
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          accessibilityHint={error}
          editable={editable}
          placeholderTextColor={colors.muted}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
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
            <Icon
              name={passwordVisible ? 'eyeOff' : 'eye'}
              size={22}
              color={colors.muted}
            />
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
  group: { gap: space.sm },
  label: { ...type.caption, color: colors.ink, fontWeight: '700' },
  field: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.line,
    borderRadius: radius.md,
    backgroundColor: colors.paper,
  },
  fieldFocused: { borderColor: colors.green, backgroundColor: '#FAFFF5' },
  fieldDisabled: { backgroundColor: colors.disabled },
  fieldError: { borderColor: colors.error },
  input: {
    ...type.body,
    flex: 1,
    minWidth: 0,
    minHeight: 52,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    color: colors.ink,
    fontSize: 16,
  },
  visibility: {
    minWidth: 48,
    minHeight: 48,
    paddingHorizontal: space.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: { ...type.caption, color: colors.error },
});
