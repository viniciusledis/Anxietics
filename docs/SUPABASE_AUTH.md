# Autenticação com Supabase

O aplicativo usa Supabase Auth para cadastro, login e sessão. Nome e e-mail
também são copiados para `public.profiles` por um trigger de banco. O progresso
dos minijogos continua local no AsyncStorage nesta versão; ele não é enviado ao
Supabase nem sincronizado entre aparelhos.

## 1. Variáveis de ambiente

Copie `.env.example` para `.env` e preencha com os valores de **Project URL** e
da chave pública **anon** disponíveis em Project Settings → API:

```sh
EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-publica
```

O prefixo `EXPO_PUBLIC_` é necessário para o Expo disponibilizar os valores ao
bundle. Essas variáveis fazem parte do cliente distribuído e não são segredos;
a proteção dos dados depende das policies RLS. Nunca coloque uma chave
`service_role` no aplicativo. Reinicie o Metro depois de alterar `.env`.

## 2. Banco, trigger e RLS

Aplique a migration
[`supabase/migrations/20260923000000_create_profiles.sql`](../supabase/migrations/20260923000000_create_profiles.sql)
pelo Supabase CLI ou copie o arquivo completo para o SQL Editor do projeto.
Ela:

- cria `public.profiles` com `id`, `name`, `email` e `created_at`;
- liga `profiles.id` a `auth.users.id` com exclusão em cascata;
- ativa RLS;
- permite que usuários autenticados leiam e atualizem somente o próprio perfil;
- bloqueia acesso anônimo à tabela;
- cria `public.handle_new_user()` como `security definer`, com `search_path`
  vazio, e o trigger `on_auth_user_created`;
- preenche o profile de usuários que já existiam antes da migration.

Não há policy de `insert` para o cliente. A criação é feita exclusivamente pelo
trigger logo após a inclusão em `auth.users`. O nome vem de
`raw_user_meta_data.name`, enviado por `supabase.auth.signUp()`.

## 3. Configuração de autenticação

No Dashboard, abra Authentication → Providers → Email:

1. mantenha **Allow new users to sign up** habilitado;
2. escolha se **Confirm email** ficará habilitado;
3. se a confirmação estiver ativa, configure Authentication → URL
   Configuration com o Site URL/redirect adequado à distribuição do app e
   ajuste o template de e-mail, se necessário;
4. para produção, configure SMTP próprio e revise rate limits/attack
   protection.

Com confirmação habilitada, o cadastro retorna usuário sem sessão e o app
mostra a orientação para verificar o e-mail. Com confirmação desabilitada, a
sessão retornada abre imediatamente a área autenticada.

## 4. Persistência e ciclo da sessão

`src/lib/supabase.ts` cria um único client com:

- AsyncStorage como storage de autenticação;
- `persistSession: true`;
- `autoRefreshToken: true`;
- `detectSessionInUrl: false`.

`AuthProvider` chama `getSession()` na abertura, mantém um listener de
`onAuthStateChange()` e pausa/retoma o refresh automático conforme o app sai ou
volta ao primeiro plano. `RootNavigator` usa a sessão como fonte de verdade e
monta apenas um dos fluxos: Splash, autenticação ou aplicativo.

## 5. Roteiro manual de teste

1. Inicie sem sessão: Splash deve terminar em Login.
2. Tente campos vazios, e-mail inválido, senha curta e senhas diferentes.
3. Cadastre uma conta e confira `Authentication → Users` e
   `Table Editor → profiles` com o mesmo UUID.
4. Se Confirm email estiver ativo, confira a mensagem de confirmação, confirme
   o link e faça login.
5. Se estiver desativado, confirme a entrada direta após o cadastro.
6. Feche e reabra o app: após a Splash, a área principal deve abrir sem novo
   login.
7. Em Ajustes, use **Sair da conta**: Login deve substituir a área protegida e
   o botão Voltar não deve reabri-la.
8. Tente credenciais inválidas e teste também sem rede.
9. No SQL Editor, autenticado como um usuário de teste, confirme que uma
   consulta/alteração de outro `profiles.id` é recusada pelas policies.

O projeto não inclui credenciais reais nem usa `service_role` no cliente.
