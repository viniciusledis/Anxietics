export type AuthOperation = 'initialize' | 'signIn' | 'signUp' | 'signOut';

type AuthErrorLike = {
  code?: string;
  message?: string;
  status?: number;
};

export function authErrorMessage(
  error: AuthErrorLike | null | undefined,
  operation: AuthOperation,
): string {
  const code = error?.code?.toLowerCase() ?? '';
  const message = error?.message?.toLowerCase() ?? '';

  if (
    code.includes('network') ||
    message.includes('failed to fetch') ||
    message.includes('network request failed') ||
    message.includes('load failed')
  ) {
    return 'Não foi possível conectar. Verifique sua internet e tente novamente.';
  }

  if (
    code === 'invalid_credentials' ||
    message.includes('invalid login credentials')
  ) {
    return 'E-mail ou senha incorretos.';
  }

  if (
    code === 'email_not_confirmed' ||
    message.includes('email not confirmed')
  ) {
    return 'Confirme seu e-mail antes de entrar.';
  }

  if (
    code === 'user_already_exists' ||
    message.includes('already registered') ||
    message.includes('already been registered')
  ) {
    return 'Não foi possível criar a conta com este e-mail. Entre ou use outro endereço.';
  }

  if (
    code === 'weak_password' ||
    message.includes('password should be at least') ||
    message.includes('password must be at least')
  ) {
    return 'A senha precisa ter pelo menos 8 caracteres.';
  }

  if (code === 'email_address_invalid' || message.includes('invalid email')) {
    return 'Digite um e-mail válido.';
  }

  if (operation === 'initialize') {
    return 'Não foi possível recuperar sua sessão. Tente fechar e abrir o aplicativo.';
  }
  if (operation === 'signOut') {
    return 'Não foi possível sair agora. Verifique sua conexão e tente novamente.';
  }
  if (operation === 'signUp') {
    return 'Não foi possível criar sua conta agora. Tente novamente.';
  }
  return 'Não foi possível entrar agora. Tente novamente.';
}
