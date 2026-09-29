import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { validateLogin } from '../../auth/validation';
import { AuthInput } from '../../components/auth/AuthInput';
import { AuthShell } from '../../components/auth/AuthShell';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../ui/Button';
import { colors, common } from '../../ui/theme';

export function LoginScreen({ onRegister }: { onRegister: () => void }) {
  const { signIn, initializationError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState(() => validateLogin('', ''));
  const [submitted, setSubmitted] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const passwordRef = useRef<TextInput>(null);

  const submit = async () => {
    if (busy) return;
    setSubmitted(true);
    const nextErrors = validateLogin(email, password);
    setErrors(nextErrors);
    setRequestError(null);
    if (Object.keys(nextErrors).length > 0) return;

    setBusy(true);
    const result = await signIn(email, password);
    setRequestError(result.error);
    setBusy(false);
  };

  return (
    <AuthShell>
      <View style={styles.heading}>
        <Text accessibilityRole="header" style={common.title}>
          Que bom ter você aqui.
        </Text>
        <Text style={common.body}>
          Entre para continuar sua trilha, no seu tempo e no seu ritmo.
        </Text>
      </View>
      <AuthInput
        autoCapitalize="none"
        autoComplete="email"
        editable={!busy}
        error={submitted ? errors.email : undefined}
        keyboardType="email-address"
        label="E-mail"
        onChangeText={(value) => {
          setEmail(value);
          setErrors((current) => ({ ...current, email: undefined }));
          setRequestError(null);
        }}
        onSubmitEditing={() => passwordRef.current?.focus()}
        placeholder="voce@exemplo.com"
        returnKeyType="next"
        textContentType="emailAddress"
        value={email}
      />
      <AuthInput
        ref={passwordRef}
        autoCapitalize="none"
        autoComplete="current-password"
        editable={!busy}
        error={submitted ? errors.password : undefined}
        label="Senha"
        onChangeText={(value) => {
          setPassword(value);
          setErrors((current) => ({ ...current, password: undefined }));
          setRequestError(null);
        }}
        onSubmitEditing={() => void submit()}
        password
        placeholder="Sua senha"
        returnKeyType="done"
        textContentType="password"
        value={password}
      />
      {!!(requestError ?? initializationError) && (
        <Text accessibilityLiveRegion="assertive" style={styles.feedback}>
          {requestError ?? initializationError}
        </Text>
      )}
      <Button
        disabled={busy}
        label={busy ? 'Entrando…' : 'Entrar'}
        loading={busy}
        onPress={() => void submit()}
      />
      <Pressable
        accessibilityRole="button"
        disabled={busy}
        onPress={onRegister}
        style={styles.link}
      >
        <Text style={styles.linkText}>Ainda não tem conta? Criar conta</Text>
      </Pressable>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  heading: { gap: 8, marginBottom: 2 },
  feedback: {
    padding: 13,
    borderRadius: 14,
    backgroundColor: '#F7E4DF',
    color: '#79362F',
    fontSize: 14,
    lineHeight: 20,
  },
  link: {
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  linkText: { color: colors.green, fontSize: 15, fontWeight: '700' },
});
