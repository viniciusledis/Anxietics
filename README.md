# Anxietics

MVP do TCC **Anxietics: Gamificação no Cuidado da Ansiedade**, de Vinícius Peres Ledis dos Santos. Aplicativo em React Native, Expo e TypeScript para Android e iOS. O núcleo desta entrega é um jogo tátil de cortar grama, com três variações em uma trilha.

O aplicativo oferece momentos de jogo e pausa. **Progresso no aplicativo não mede melhora da saúde mental.** Não há diagnóstico, tratamento personalizado ou eficácia clínica demonstrada por esta implementação.

## Abrir no celular

Pré-requisito: Node.js 22 LTS e npm. Na pasta do projeto:

```sh
npm ci
npm start
```

1. Instale o **Expo Go compatível com SDK 54**. Consulte [as versões oficiais](https://expo.dev/go?sdkVersion=54&platform=android&device=true).
2. Deixe computador e celular na mesma rede Wi-Fi.
3. No Android, abra o Expo Go e escaneie o QR code do terminal. No iPhone, use a Câmera e abra o link no Expo Go.
4. Abra a primeira etapa, arraste um dedo e corte o campo. Ao atingir pelo menos 95%, os resíduos são finalizados visualmente e a próxima etapa é liberada.
5. Aguarde o aviso “Salvando no aparelho…” desaparecer antes de forçar o fechamento para testar a persistência.

O SDK 54 foi escolhido deliberadamente para esta primeira validação: conforme a [documentação de compatibilidade do Expo Go](https://docs.expo.dev/troubleshooting/expo-go-version-mismatch/), consultada em 14/09/2026, ele ainda tem distribuição pela App Store. Versões mais novas no iPhone físico podem requerer outro fluxo. No Android, use o APK oficial de SDK 54 caso a versão da Play Store seja diferente. A disponibilidade nas lojas pode mudar; confira a versão antes de instalar.

**Estas dependências estão incluídas no Expo Go; esta entrega não exige uma compilação de desenvolvimento.** Para um binário próprio ou uma futura migração de SDK, o fluxo de development build pode ser adotado depois. Não é preciso contratar serviço pago para esta validação. Suporte do SDK 54: Android 7+ e iOS 15.1+.

Se o celular não alcançar o servidor, confira rede e firewall. Como alternativa, `npx expo start --tunnel` depende de internet e pode pedir instalação do utilitário gratuito de túnel; o aplicativo não passa a precisar de um backend por isso.

O jogo e o armazenamento não usam APIs remotas. Durante desenvolvimento, o Expo Go precisa carregar o código do Metro; fechar o Metro pode impedir uma nova abertura. Funcionamento offline a partir de uma instalação independente ainda precisa de validação em um binário próprio.

## O que foi entregue

- Trilha vertical com etapas disponível, bloqueada e concluída.
- Jardim de início, Clareira dourada e Cantinho do bosque: **variações do mesmo minijogo**, com paletas e padrões diferentes.
- Máquina acompanhando o dedo, corte persistente durante a rodada, percentual por área única e cobertura do segmento inteiro entre eventos.
- Conclusão a partir de 95%, preenchimento visual dos resíduos e mensagem discreta. Sem tempo limite, derrota, vidas ou punição.
- Etapas concluídas repetíveis sem duplicar conquistas. O modo livre não espera o dia seguinte.
- Persistência local das etapas, registro diário básico e preferência de movimento reduzido; respeito também à configuração de acessibilidade do sistema.
- Voltar à trilha, botão voltar do Android, reinício com confirmação quando há corte parcial e indicação de falhas de gravação.

Calendário completo, sons, vibração e corte de frutas ficam para entregas posteriores. O jogo de frutas só começa depois da validação do toque na grama.

## Entendendo o código

```text
App.tsx                         Provedores de gestos e áreas seguras
src/navigation/                 Alternância entre as três telas
src/screens/                    Trilha, jogo e ajustes
src/trail/stages.ts              Conteúdo, paletas e ordem das etapas
src/minigames/grass/coverage.ts  Cálculo de área e limite de conclusão
src/minigames/grass/GrassGame.tsx Gestos e desenho Skia
src/minigames/grass/art.ts       Geometria estática da grama
src/domain/progress.ts          Conquistas, desbloqueio e dia local
src/storage/                    Leitura, validação e fila de gravação
src/ui/                         Botões, cores e movimento reduzido
tests/                          Regras e persistência com armazenamento simulado
docs/                           Decisões acadêmicas e roteiro de validação
```

Comece a leitura por `stages.ts`, depois `coverage.ts`, `GrassGame.tsx` e `progress.ts`. Na navegação, uma variável guarda qual tela está aberta; com apenas três telas, não precisamos de uma biblioteca de navegação. Novos tipos de minijogo exigirão ampliar o tipo `game` e a seleção do componente; a definição de etapas já está separada.

O campo lógico tem **320 × 448 unidades**, dividido em **80 × 112 células de 4 unidades**. Cada célula é marcada uma única vez. A função `cutSegment` mede a distância do centro da célula até o segmento entre o ponto anterior e o atual; a região dentro do raio da máquina fica cortada. Isso cobre também os trechos entre eventos distantes. O percentual é uma aproximação por células de área igual, e a imagem utiliza exatamente essas mesmas células.

O desenho usa poucos elementos Skia, com as folhas reunidas em paths estáticos. A máscara de corte reúne células vizinhas em retângulos, sem armazenar o histórico ilimitado do dedo. `SharedValue` guarda valores utilizados pela camada visual; funções com `'worklet'` podem executar na thread de interface. No celular, gestos, posição, marcação e máscara são atualizados nessa thread. React recebe apenas mudanças do percentual inteiro e a conclusão, no máximo 100 atualizações de percentual por rodada.

Uma trava no motor permite emitir a conclusão uma vez. Outra na tela ignora callbacks duplicados ou de uma tentativa anterior. `completeStage` também é idempotente: a mesma etapa nunca entra duas vezes na lista de conquistas. A recompensa desta versão é a própria etapa concluída e a abertura da seguinte, sem moedas ou pontos extras.

## Regras do dia e do armazenamento

- Sugestão de três atividades por **data local do aparelho** (`AAAA-MM-DD`), sem exigir três para continuar.
- Cada variação conta no máximo uma vez naquele dia. Repetir a mesma variação continua permitido; para preencher o trio, jogue as três.
- Na abertura, no retorno ao primeiro plano, na conclusão e a cada 30 segundos enquanto aberto, verifica-se a data. Ao mudar, somente o registro diário é renovado. A atualização da interface pode levar até 30 segundos se o app continuar aberto à meia-noite.
- Uma rodada que atravessa a meia-noite conta no dia em que termina.
- Conquistas e desbloqueios são permanentes, mesmo após ausência. Não há sequência, perda de pontos ou recuperação de dias.
- Mudança de fuso ou ajuste manual do relógio segue o dia indicado pelo aparelho. Não há sistema antifraude; isso não cria conquistas permanentes extras.
- AsyncStorage guarda um JSON versionado na chave `@anxietics/progress/v1`. As gravações são enfileiradas para manter a ordem. Dados de versão desconhecida ou JSON inválido exibem erro sem serem sobrescritos.
- O corte parcial é memória da rodada: sair/reiniciar/encerrar o processo o descarta. As etapas já concluídas permanecem. Colocar em segundo plano preserva a rodada se o sistema mantiver o processo vivo.
- Falha de gravação mantém o estado em memória e oferece uma nova tentativa. Encerrar o processo antes de a escrita terminar pode perder a última alteração.
- Não há sincronização ou restauração entre aparelhos. Desinstalação, limpeza de dados e políticas de backup do sistema afetam o armazenamento. AsyncStorage não é criptografado; não armazenamos registros emocionais nem dados clínicos.

## Verificar

```sh
npm run check
npm run doctor
npx expo install --check
npm run export:mobile
```

`check` executa TypeScript e testes do motor/regras/repositório. O armazenamento dos testes é simulado: comprova serialização e regras, **não comprova persistência real no Android/iOS**. Exportar gera bundles JavaScript/Hermes, não APK/IPA, e não mede desempenho.

Também há uma prévia auxiliar para desenvolvimento:

```sh
npm run web
```

O script copia o CanvasKit instalado para `public/`, sem CDN ou serviço pago. `src/Root.web.tsx` carrega esse recurso antes do app; Android/iOS usam `src/Root.tsx` e ignoram essa preparação. O comportamento de gestos, armazenamento e animações no navegador pode diferir do nativo.

Com a prévia em `http://localhost:8081` e Google Chrome instalado, `npm run test:preview` executa o roteiro de interface com Playwright em um perfil temporário. As capturas ficam em `/tmp/anxietics-preview`. Nenhum perfil pessoal do navegador é utilizado.

O npm reportou alertas em dependências da cadeia de ferramentas do SDK escolhido. A pendência e o motivo de não aplicar uma migração forçada estão no [registro de decisões](docs/DECISOES.md).

Consulte [o registro de validação](docs/VALIDACAO.md) para distinguir o que foi executado de testes ainda pendentes.

## O que observar no celular

Jogue sem tentar “ter um bom resultado”. Observe se a máquina acompanha o dedo, se passadas rápidas deixam caminhos contínuos, se a transformação é legível e satisfatória, se completar o campo é fácil e se surge vontade de repetir. Teste cantos, saída, reinício e reabertura depois de concluir uma etapa. Anote aparelho, sistema e situações em que houve atraso.

Essas observações informam a próxima iteração de interação e usabilidade. Não demonstram benefício clínico. O [registro de decisões para o TCC](docs/DECISOES.md) explica o recorte em relação ao projeto de pesquisa preservado na raiz.
