import { useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { validateRegistration } from '../../auth/validation';
import { AuthInput } from '../../components/auth/AuthInput';
import { AuthShell } from '../../components/auth/AuthShell';
import { useAuth } from '../../hooks/useAuth';
import { SproutArt } from '../../ui/primitives';
import { Button } from '../../ui/Button';
import { colors, common, radius, space, type } from '../../ui/theme';

export function RegisterScreen({ onLogin }: { onLogin: () => void }) {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState(() =>
    validateRegistration('', '', '', ''),
  );
  const [submitted, setSubmitted] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmationRef = useRef<TextInput>(null);

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (busy) return true;
        onLogin();
        return true;
      },
    );
    return () => subscription.remove();
  }, [busy, onLogin]);

  const submit = async () => {
    if (busy) return;
    setSubmitted(true);
    const nextErrors = validateRegistration(
      name,
      email,
      password,
      confirmPassword,
    );
    setErrors(nextErrors);
    setRequestError(null);
    if (Object.keys(nextErrors).length > 0) return;

    setBusy(true);
    const result = await signUp(name.trim(), email, password);
    setRequestError(result.error);
    setConfirmationSent(!result.error && result.needsEmailConfirmation);
    setBusy(false);
  };

  if (confirmationSent) {
    return (
      <AuthShell compact>
        <SproutArt size={140} />
        <Text style={common.eyebrow}>CONTA CRIADA</Text>
        <Text accessibilityRole="header" style={common.title}>
          Confira seu e-mail.
        </Text>
        <Text accessibilityLiveRegion="polite" style={common.body}>
          Conta criada com sucesso. Enviamos um link de confirmação para o seu
          e-mail.
        </Text>
        <Button label="Voltar para o login" onPress={onLogin} />
      </AuthShell>
    );
  }

  const update = (
    field: 'name' | 'email' | 'password' | 'confirmPassword',
    value: string,
    setter: (next: string) => void,
  ) => {
    setter(value);
    setErrors((current) => ({ ...current, [field]: undefined }));
    setRequestError(null);
  };

  return (
    <AuthShell compact>
      <View style={styles.heading}>
        <Text accessibilityRole="header" style={common.title}>
          Crie seu espaço.
        </Text>
        <Text style={common.body}>
          Uma conta para voltar ao Anxietics com segurança.
        </Text>
      </View>
      <AuthInput
        autoCapitalize="words"
        autoComplete="name"
        editable={!busy}
        error={submitted ? errors.name : undefined}
        label="Nome"
        onChangeText={(value) => update('name', value, setName)}
        onSubmitEditing={() => emailRef.current?.focus()}
        placeholder="Como podemos chamar você?"
        returnKeyType="next"
        textContentType="name"
        value={name}
      />
      <AuthInput
        ref={emailRef}
        autoCapitalize="none"
        autoComplete="email"
        editable={!busy}
        error={submitted ? errors.email : undefined}
        keyboardType="email-address"
        label="E-mail"
        onChangeText={(value) => update('email', value, setEmail)}
        onSubmitEditing={() => passwordRef.current?.focus()}
        placeholder="voce@exemplo.com"
        returnKeyType="next"
        textContentType="emailAddress"
        value={email}
      />
      <AuthInput
        ref={passwordRef}
        autoCapitalize="none"
        autoComplete="new-password"
        editable={!busy}
        error={submitted ? errors.password : undefined}
        label="Senha"
        onChangeText={(value) => update('password', value, setPassword)}
        onSubmitEditing={() => confirmationRef.current?.focus()}
        password
        placeholder="Pelo menos 8 caracteres"
        returnKeyType="next"
        textContentType="newPassword"
        value={password}
      />
      <AuthInput
        ref={confirmationRef}
        autoCapitalize="none"
        autoComplete="new-password"
        editable={!busy}
        error={submitted ? errors.confirmPassword : undefined}
        label="Confirmar senha"
        onChangeText={(value) =>
          update('confirmPassword', value, setConfirmPassword)
        }
        onSubmitEditing={() => void submit()}
        password
        placeholder="Digite a senha novamente"
        returnKeyType="done"
        textContentType="newPassword"
        value={confirmPassword}
      />
      {!!requestError && (
        <Text accessibilityLiveRegion="assertive" style={styles.feedback}>
          {requestError}
        </Text>
      )}
      <Button
        disabled={busy}
        label={busy ? 'Criando conta…' : 'Criar conta'}
        loading={busy}
        onPress={() => void submit()}
      />
      <Pressable
        accessibilityRole="button"
        disabled={busy}
        onPress={onLogin}
        style={styles.link}
      >
        <Text style={styles.linkText}>Já tenho uma conta</Text>
      </Pressable>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  heading: { gap: space.sm, marginBottom: space.sm },
  feedback: {
    ...type.caption,
    padding: space.md,
    borderRadius: radius.md,
    backgroundColor: colors.lightError,
    color: colors.error,
  },
  link: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.sm,
  },
  linkText: { ...type.label, color: colors.green, textAlign: 'center' },
});
