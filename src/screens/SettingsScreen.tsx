import { useState } from 'react';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../ui/Button';
import { colors, common } from '../ui/theme';

type Props = {
  reducedMotion: boolean;
  onReducedMotion: (value: boolean) => void;
  onExit: () => void;
  onReset: () => Promise<boolean>;
  resetBusy: boolean;
  resetError: boolean;
};

export function SettingsScreen({
  reducedMotion,
  onReducedMotion,
  onExit,
  onReset,
  resetBusy,
  resetError,
}: Props) {
  const [confirm, setConfirm] = useState(false);
  const [signOutBusy, setSignOutBusy] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const { user, signOut } = useAuth();
  const metadataName = user?.user_metadata.name;
  const displayName =
    typeof metadataName === 'string' && metadataName.trim()
      ? metadataName.trim()
      : null;
  return (
    <ScrollView style={common.screen} contentContainerStyle={styles.content}>
      <Button
        secondary
        label="‹  Voltar à trilha"
        onPress={onExit}
        disabled={resetBusy || signOutBusy}
        style={{ alignSelf: 'flex-start' }}
      />
      <Text style={[common.eyebrow, { marginTop: 32 }]}>DO SEU JEITO</Text>
      <Text style={[common.title, { marginTop: 10 }]}>Ajustes e cuidados</Text>
      <View style={styles.preference}>
        <View style={{ flex: 1, gap: 6 }}>
          <Text style={styles.subtitle}>Menos movimento</Text>
          <Text style={styles.body}>
            Reduz animações de conclusão, encaixes, frutas e tinta. O movimento
            que acompanha o dedo continua. A preferência do sistema também é
            respeitada.
          </Text>
        </View>
        <Switch
          accessibilityLabel="Menos movimento"
          value={reducedMotion}
          onValueChange={onReducedMotion}
          trackColor={{ false: '#CED5C2', true: colors.green }}
          thumbColor={colors.paper}
        />
      </View>
      <Text style={styles.subtitle}>Um espaço para jogar</Text>
      <Text style={styles.body}>
        O Anxietics oferece minijogos para momentos de pausa. O progresso mostra
        atividades concluídas no aplicativo e não mede melhora da saúde mental.
      </Text>
      <Text style={styles.body}>
        O aplicativo não substitui acompanhamento profissional, não faz
        diagnósticos e não oferece tratamento.
      </Text>
      <Text style={styles.subtitle}>Sua conta</Text>
      <Text style={styles.body}>
        {displayName ? `${displayName} · ` : ''}
        {user?.email ?? 'Conta autenticada'}
      </Text>
      <Text style={styles.body}>
        A sessão da conta é mantida pelo Supabase para que você possa voltar sem
        entrar novamente. Sua senha não é armazenada pelo aplicativo.
      </Text>
      <Button
        secondary
        label={signOutBusy ? 'Saindo…' : 'Sair da conta'}
        loading={signOutBusy}
        disabled={resetBusy}
        onPress={() => {
          if (signOutBusy) return;
          setSignOutBusy(true);
          setSignOutError(null);
          void signOut().then((result) => {
            setSignOutError(result.error);
            setSignOutBusy(false);
          });
        }}
      />
      {!!signOutError && (
        <Text accessibilityLiveRegion="assertive" style={styles.error}>
          {signOutError}
        </Text>
      )}
      <Text style={styles.subtitle}>Seu progresso, neste aparelho</Text>
      <Text style={styles.body}>
        Etapas, atividades do dia e esta preferência continuam no armazenamento
        local do aplicativo e não são sincronizadas com a conta nesta versão. A
        política de backup do aparelho pode incluir esses dados.
      </Text>
      <Text style={styles.body}>
        Não existe sequência para manter. A cada dia, a sugestão de três
        atividades é renovada. Etapas abertas permanecem abertas, e repetir é
        sempre permitido.
      </Text>
      <Text style={styles.body}>
        Sair de um jogo descarta apenas a rodada parcial. Etapas concluídas
        ficam salvas. Desinstalar o aplicativo ou limpar seus dados pode apagar
        o progresso.
      </Text>
      <Button
        secondary
        label="Apagar dados deste aparelho"
        disabled={signOutBusy}
        onPress={() => setConfirm(true)}
      />
      {resetError && (
        <Text style={styles.body}>
          Não foi possível apagar. Tente novamente; o progresso atual foi
          preservado.
        </Text>
      )}
      <ConfirmDialog
        visible={confirm}
        title="Apagar todos os dados?"
        message="Isso apaga etapas, conquistas, XP, sementes, compras virtuais, equipamentos, jardim, tarefas e preferências. O perfil local reinicia com o presente inicial. Não é possível desfazer."
        confirmLabel="Apagar e recomeçar"
        busy={resetBusy}
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          void onReset().then((ok) => {
            if (ok) {
              setConfirm(false);
              onExit();
            }
          });
        }}
      />
      <Text style={styles.version}>
        ANXIETICS · MVP 0.3{'\n'}Projeto de TCC · Vinícius Peres Ledis dos
        Santos
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 24,
    gap: 16,
    maxWidth: 580,
    alignSelf: 'center',
    width: '100%',
  },
  preference: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderColor: colors.line,
    marginBottom: 10,
  },
  subtitle: { fontSize: 18, color: colors.ink, fontWeight: '600' },
  body: { fontSize: 15, lineHeight: 23, color: colors.muted },
  error: { fontSize: 14, lineHeight: 20, color: '#913D34' },
  version: {
    marginTop: 16,
    fontSize: 11,
    lineHeight: 19,
    color: colors.muted,
    letterSpacing: 0.5,
  },
});
