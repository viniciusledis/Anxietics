export type LoginField = 'email' | 'password';
export type RegisterField = 'name' | 'email' | 'password' | 'confirmPassword';
export type FieldErrors<T extends string> = Partial<Record<T, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function validateLogin(email: string, password: string) {
  const errors: FieldErrors<LoginField> = {};
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) errors.email = 'Informe seu e-mail.';
  else if (!EMAIL_PATTERN.test(normalizedEmail))
    errors.email = 'Digite um e-mail válido.';

  if (!password) errors.password = 'Informe sua senha.';
  return errors;
}

export function validateRegistration(
  name: string,
  email: string,
  password: string,
  confirmPassword: string,
) {
  const errors: FieldErrors<RegisterField> = {};
  const normalizedEmail = normalizeEmail(email);

  if (!name.trim()) errors.name = 'Informe seu nome.';
  if (!normalizedEmail) errors.email = 'Informe seu e-mail.';
  else if (!EMAIL_PATTERN.test(normalizedEmail))
    errors.email = 'Digite um e-mail válido.';

  if (!password) errors.password = 'Crie uma senha.';
  else if (password.length < 8)
    errors.password = 'Use pelo menos 8 caracteres.';

  if (!confirmPassword)
    errors.confirmPassword = 'Confirme sua senha.';
  else if (password !== confirmPassword)
    errors.confirmPassword = 'As senhas não são iguais.';

  return errors;
}
