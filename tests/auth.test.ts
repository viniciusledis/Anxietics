import assert from 'node:assert/strict';
import { test } from 'node:test';
import { authErrorMessage } from '../src/auth/errors';
import {
  normalizeEmail,
  validateLogin,
  validateRegistration,
} from '../src/auth/validation';

test('login exige e-mail válido e senha', () => {
  assert.deepEqual(validateLogin('', ''), {
    email: 'Informe seu e-mail.',
    password: 'Informe sua senha.',
  });
  assert.deepEqual(validateLogin('invalido', 'segredo'), {
    email: 'Digite um e-mail válido.',
  });
  assert.deepEqual(validateLogin(' pessoa@exemplo.com ', 'segredo'), {});
});

test('cadastro valida nome, senha mínima e confirmação', () => {
  assert.deepEqual(validateRegistration(' ', 'x', '123', '456'), {
    name: 'Informe seu nome.',
    email: 'Digite um e-mail válido.',
    password: 'Use pelo menos 8 caracteres.',
    confirmPassword: 'As senhas não são iguais.',
  });
  assert.deepEqual(
    validateRegistration(
      'Ana',
      'ana@exemplo.com',
      'oitochars',
      'oitochars',
    ),
    {},
  );
});

test('e-mail é normalizado antes de autenticar', () => {
  assert.equal(normalizeEmail('  Pessoa@Exemplo.COM '), 'pessoa@exemplo.com');
});

test('erros técnicos conhecidos recebem mensagens amigáveis', () => {
  assert.equal(
    authErrorMessage({ code: 'invalid_credentials' }, 'signIn'),
    'E-mail ou senha incorretos.',
  );
  assert.equal(
    authErrorMessage({ message: 'Network request failed' }, 'signIn'),
    'Não foi possível conectar. Verifique sua internet e tente novamente.',
  );
  assert.equal(
    authErrorMessage({ code: 'email_not_confirmed' }, 'signIn'),
    'Confirme seu e-mail antes de entrar.',
  );
});
