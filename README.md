# Anxietics

MVP 0.2 do TCC **Anxietics: Gamificação no Cuidado da Ansiedade**, de Vinícius Peres Ledis dos Santos. React Native, Expo e TypeScript, com 14 minijogos, trilha progressiva, três atividades diárias e modo livre.

O aplicativo oferece momentos de jogo, pausa e distração. **Progresso no app não mede melhora da saúde mental.** Benefícios para ansiedade são hipóteses de pesquisa; esta implementação não realizou estudo com participantes nem demonstra eficácia clínica. O projeto acadêmico original está preservado na raiz.

## Abrir no celular

Use Node.js 22 LTS e npm:

```sh
npm ci
npm start
```

1. Instale um **Expo Go compatível com SDK 54**: [distribuições oficiais](https://expo.dev/go?sdkVersion=54&platform=android&device=true). Confira também a [compatibilidade do Expo Go](https://docs.expo.dev/troubleshooting/expo-go-version-mismatch/), pois a disponibilidade nas lojas muda.
2. Deixe computador e celular na mesma rede Wi-Fi.
3. Android: abra o Expo Go e escaneie o QR code. iPhone: use a Câmera e abra o link no Expo Go.
4. Abra a primeira etapa e arraste a máquina. Concluir libera a próxima; etapas concluídas podem ser repetidas.
5. Para verificar persistência, espere “Salvando no aparelho…” desaparecer, feche o app e abra novamente.

**As dependências utilizadas estão incluídas no Expo Go do SDK 54. Não exigem um development build.** Se não houver Expo Go compatível para seu dispositivo, será necessário usar uma compilação própria ou planejar uma atualização conjunta do SDK; não atualize módulos nativos isoladamente. Um binário iOS próprio depende das ferramentas e regras de assinatura da Apple. Suporte do SDK: Android 7+ e iOS 15.1+.

No desenvolvimento, o Expo Go carrega o código pelo Metro. O app não usa API de jogos, login, backend, anúncios ou serviços pagos, mas uma nova abertura pelo Expo Go pode precisar do servidor de desenvolvimento. A execução offline de um binário independente ainda precisa ser validada no aparelho. Problemas de conexão: confira a rede e o firewall; `npx expo start --tunnel` é uma alternativa de desenvolvimento que depende de internet.

## Jogos disponíveis

Todos têm instrução visível, pausa, saída e reinício com confirmação. Cada um possui três variações de paleta, padrão ou ilustração; **são variações do mesmo jogo**, não jogos adicionais.

| Jogo | Interação e conclusão guiada |
| --- | --- |
| Cortar grama | Máquina transforma a área única sob o gesto; conclui em 95%. |
| Janela embaçada | Pano remove vapor e revela uma paisagem; 95%. |
| Jardim de areia | Rastelo deixa cinco sulcos paralelos; quatro gestos amplos. |
| Lavar objetos | Jato limpa um vaso; somente a superfície do vaso conta; 95%. |
| Pintar com rolinho | Três cores; cobertura única da parede; 95%. Faixas já pintadas preservam sua cor. |
| Tapete de flores | Flores espaçadas; oito em cada uma de quatro regiões amplas. |
| Organizar pedrinhas | Quatro formas, encaixe com tolerância; soltura fora retorna sem punição. |
| Bolinhas por cor | Seis bolinhas; recipientes identificados por cor **e símbolo**. |
| Revelar ilustração | Pincel remove papel texturizado; revela casa, barco ou borboleta; 95%. |
| Regar um jardim | Segure o bico do regador sobre quatro vasos; cada um floresce após cerca de quatro segundos de água acumulada. |
| Alisar argila | Espátula remove os relevos de uma superfície 2D; 95%. |
| Pequenas luzes | Siga o círculo maior; pode levantar o dedo e continuar do próximo ponto. |
| Tinta na água | Manchas coloridas se expandem; três gestos com cada uma das três cores. |
| Cortar frutas | Seis frutas estáticas; o gesto divide cada fruta visualmente. |

Areia, flores e tinta têm **modo livre sem meta obrigatória**, com botão “Encerrar por aqui”. Os outros jogos mantêm sua conclusão natural no modo livre e podem ser repetidos. Não há tempo limite, derrota, vidas, ranking, sequência ou punição. Sessões de um a três minutos são intenção de design, não duração medida: alguns objetivos simples podem ser alcançados em menos de um minuto.

A recompensa é uma flor no jardim da trilha e o desbloqueio seguinte, concedidos uma vez por etapa. Não há moedas ou pontuação de saúde.

## Trilha, dia e armazenamento

São três registros separados:

- **Trilha:** 14 etapas, uma para cada jogo. Concluir uma etapa disponível libera a seguinte. Repetir uma concluída abre o modo livre.
- **Hoje:** três tarefas escolhidas entre os jogos liberados no início daquele dia. Com poucas opções, usam variações diferentes. Jogar pela trilha não marca automaticamente uma tarefa diária.
- **Livre:** permite repetir jogos liberados; não concede conquistas nem marca tarefas. Completar o trio diário não bloqueia o acesso.

As três escolhas são salvas e ficam fixas durante a **data local do aparelho (`AAAA-MM-DD`)**, mesmo se outra etapa for desbloqueada. O dia é verificado ao carregar, ao voltar ao primeiro plano, ao concluir e a cada 30 segundos com o app aberto. Uma nova data substitui apenas o trio diário; conquistas e preferências permanecem. Não há compensação obrigatória por dias ausentes.

Uma tarefa iniciada ontem pode ser terminada, mas **não completa uma tarefa do novo dia**. Alterar manualmente relógio/fuso pode renovar o trio; não há proteção antifraude neste protótipo. Não existe histórico/calendário de dias anteriores.

AsyncStorage grava JSON com esquema **versão 2**, mantendo a chave histórica `@anxietics/progress/v1` para migrar instalações anteriores. A migração preserva o Jardim concluído, as conquistas antigas Clareira/Bosque, o registro diário compatível e a preferência. As conquistas antigas não pulam os novos jogos. Versões desconhecidas ou dados inválidos mostram erro sem substituição automática.

As gravações seguem uma fila. Se houver erro, o estado continua na memória e aparece uma opção de tentar salvar novamente. Fechar o processo antes da gravação pode perder a última alteração. “Ajustes → Apagar dados deste aparelho” pede confirmação e restaura etapas, tarefas e preferência iniciais.

O desenho, posições e percentual **parciais da rodada não são persistidos**. Sair ou reiniciar descarta apenas essa rodada. Segundo plano pausa o jogo e preserva a rodada se o sistema mantiver o processo vivo; voltar exige “Continuar”. Não há sincronização entre aparelhos. AsyncStorage não é criptografado; não são coletados dados pessoais, clínicos ou emocionais. Backup/desinstalação seguem a política do aparelho.

## Entendendo a arquitetura

```text
App.tsx                       Provedores de gestos e áreas seguras
src/navigation/               Escolha da tela e criação de partidas
src/screens/                  Trilha, jogo, ajustes e laboratório
src/trail/stages.ts            Ordem e estado das 14 etapas
src/minigames/types.ts         Contratos simples: jogo, modo e partida
src/minigames/definitions.ts   Nomes, instruções e variações
src/minigames/catalog.ts       Catálogo com componentes dos jogos
src/minigames/shared/          Campo, gesto, máscara e conclusão comuns
src/minigames/grass/           Grama e cálculo reutilizável de cobertura
src/minigames/surface/         Janela, lavagem, pintura, revelação e argila
src/minigames/*/rules.ts       Regras puras de cada interação
src/domain/progress.ts         Conclusão, recompensas, tarefas e migração
src/storage/                  Leitura, validação e fila de gravação
src/ui/                       Botões, confirmações e movimento reduzido
tests/                        Testes de regras e armazenamento
scripts/verify-preview.cjs     Roteiro de gestos reais no navegador
docs/                         Decisões e evidências de validação
```

Comece por `types.ts`, `definitions.ts` e `stages.ts`; depois leia `grass/coverage.ts` e um `rules.ts`. A tela `GameScreen` controla a rodada; os jogos só informam percentual e conclusão. `completeSession` decide o efeito da conclusão no progresso persistente. Navegação por estado foi preservada: poucas telas não justificaram trocar a arquitetura.

**Por que Skia?** Componentes nativos servem bem para botões e textos. Para desenhar milhares de pedacinhos de superfície a cada gesto, um canvas é mais apropriado que milhares de Views. Skia reúne formas em caminhos; Gesture Handler recebe o gesto e Reanimated compartilha dados com a camada visual. No Android/iOS, as funções marcadas com `'worklet'` podem rodar na thread de interface. Isso reduz o trabalho de React por movimento, mas não comprova fluidez sem medir no celular.

O campo tem 320 × 448 unidades lógicas e escala uniforme. A cobertura usa 80 × 112 células: cada célula conta uma vez. A distância ao **segmento inteiro** entre eventos cobre gestos rápidos; a máscara desenha as mesmas células contabilizadas. O vaso filtra as células elegíveis. Aos 95%, a máscara termina os resíduos; 100% é o acabamento automático, não uma exigência de precisão.

Desenhar areia, encaixar, regar e cortar têm regras próprias. Caminhos/partículas são limitados: 12 blocos de 100 segmentos na areia, 352 flores, 24 manchas de tinta, seis frutas. Não se armazena um histórico infinito de movimentos. React recebe mudanças de percentual inteiro e conclusão, não cada posição do dedo. A rodada protege a conclusão e ignora callbacks atrasados de tentativas anteriores; as regras também impedem recompensa duplicada.

## Laboratório de desenvolvimento

Para abrir qualquer jogo sem percorrer a trilha:

```sh
npm run dev:games
# Ou, para a prévia auxiliar no navegador:
npm run web:games
```

Abra **Laboratório de desenvolvimento** no fim da tela da trilha. Há botões para as três variações de cada jogo e para os três modos livres abertos. Essas partidas não modificam conquistas ou tarefas.

O atalho só aparece quando `__DEV__` é verdadeiro **e** `EXPO_PUBLIC_DEV_TOOLS=1`. `npm start` normal não o habilita. Uma exportação de produção não o mostra mesmo com a variável. O script inicializador define a variável sem depender da sintaxe de ambiente do sistema operacional.

## Como adicionar um jogo

1. Acrescente o identificador em `GAME_IDS` e os metadados em `GAME_INFO`.
2. Crie um componente que receba `GameProps`; use as regras puras em um `rules.ts` quando possível.
3. Registre o componente em `GAME_COMPONENTS`. O TypeScript aponta registros faltantes. A trilha inicial acompanha a ordem de `GAME_IDS`.
4. Respeite `enabled`, `reducedMotion`, `mode` e `scale`. Desative callbacks de quadro e cancele animações ao desmontar. Reinício remonta o componente.
5. Envie `onProgress` e `onComplete`, sem gravar recompensas diretamente. Para regras novas de tarefa/persistência, altere o domínio e planeje a migração.
6. Teste conclusão alcançável, reinício, pausa, limites de memória e integração. Adicione a interação ao roteiro de prévia e valide em Android/iOS.

## Verificar

```sh
npm run check
npm run doctor
npx expo install --check
npm run export:mobile
```

`check` executa TypeScript e testes das regras. O repositório de testes usa armazenamento simulado; isso não prova persistência nativa. `export:mobile` gera bundles JavaScript/Hermes para Android e iOS, **não APK/IPA**, e não mede desempenho.

Prévia auxiliar:

```sh
npm run web:games
# Em outro terminal, com Chrome instalado e servidor em localhost:8081:
npm run test:preview
```

O preparo web copia o CanvasKit instalado para `public/`, sem CDN. O teste usa Chrome headless em perfil temporário. Capturas e `resultado.json` ficam na pasta `anxietics-preview` do diretório temporário do sistema; o caminho exato é impresso no fim. O roteiro usa mouse: não equivale a toque nativo. `npm run web` abre a experiência normal sem laboratório.

Consulte [VALIDACAO.md](docs/VALIDACAO.md) para os resultados executados e dispositivos pendentes. [DECISOES.md](docs/DECISOES.md) registra fontes oficiais, limites, migração e os alertas transitivos de dependências ainda pendentes. Sons, vibração e gráficos complexos não foram adicionados.

## O que observar no celular

Observe resposta ao toque, continuidade de gestos rápidos, clareza e satisfação da transformação, facilidade de completar e vontade de repetir. Nos encaixes, solte um pouco fora; na rega, confira se entende onde posicionar o bico; na tinta, experimente as três cores. Teste pausa, segundo plano, reinício, fechamento após salvar e reabertura. Registre modelo, sistema e passos de eventuais atrasos.

Essas observações orientam melhorias de interação e usabilidade. Não demonstram benefício clínico nem substituem acompanhamento profissional.
