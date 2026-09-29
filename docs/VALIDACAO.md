# Validação do MVP 0.3

Validação original executada em 14/09/2026 e atualização técnica para o Expo SDK 57 verificada em 23/09/2026, no macOS 13.7.8 e Node 22.21.0. Não houve avaliação com participantes nem medição de eficácia clínica.

## Verificações automatizadas

| Verificação | Resultado | O que comprova |
| --- | --- | --- |
| `npm run check` | TypeScript sem erros; 63 testes aprovados | Contratos e regras puras; autenticação e persistência com armazenamento simulado. |
| `npm run doctor -- --verbose` | 21/21 verificações aprovadas | Configuração, schema, peers, versões nativas, Hermes e requisitos das lojas verificados pelo Expo. |
| `npx expo install --check` | Dependências compatíveis | Alinhamento com o SDK 57 instalado. |
| `npm run export:mobile` | Android e iOS exportados | Geração de bundles JavaScript/Hermes; não compila APK/IPA nem executa o app nativo. |
| `npx expo export --platform web` | Web exportada | Compatibilidade de Metro, React Native Web, Skia e CanvasKit no empacotamento. |
| Roteiro principal Playwright | 14 jogos concluídos por gestos | Integração da variante inicial de cada jogo na prévia web. |
| Roteiro de ciclo de vida Playwright | Aprovado | Animações e pausas web, variações adicionais e migração v1/v2→v3. |

Os testes puros cobrem:

- Cobertura única, sobreposição em sentido contrário, segmentos rápidos retos/diagonais, cantos, toques separados, conclusão em 95% apenas uma vez, limite da malha e escala do campo.
- Lavagem contando apenas a superfície elegível e tratando uma superfície vazia sem conclusão falsa.
- Encaixes alcançáveis, tolerância de soltura, rejeição do recipiente errado e peças já organizadas não selecionáveis.
- Rega acumulada/capada por vaso, constelações concluídas com toques separados e ordem dos pontos em segmentos rápidos.
- Amplitude dos gestos de areia, espaçamento/limite das flores e metas nas quatro regiões, limite/cores/expansão da tinta, corte de frutas por gestos lentos e rápidos sem contar novamente.
- Conclusão de partida idempotente, desbloqueio de todas as etapas, rejeição de etapa bloqueada e separação entre trilha, tarefas e livre.
- Trio estável no mesmo dia, variedade após desbloqueios no dia seguinte, ausência sem perda de conquistas e rodada antiga sem marcar tarefa nova.
- Migração, versões inválidas, serialização/recarga, ordem da fila de gravação, recuperação de erro e restauração do estado inicial.

## Prévia no navegador

**Plataforma:** Chrome 153.0.8010.36 headless, perfil temporário, React Native Web e CanvasKit. Gestos executados com mouse via Playwright. Não foi utilizado um perfil pessoal do navegador.

`scripts/verify-preview.cjs` verificou cada um dos 14 jogos: abertura com zero, interação com progresso, pausa, cancelamento do reinício preservando a rodada, reinício confirmado limpando o estado e conclusão alcançável com um único cartão. Nos seis jogos de cobertura, repetir o mesmo percurso manteve o percentual. Todas as partidas do laboratório preservaram o estado persistido.

Também foram exercitados:

- Modo livre sem conclusão obrigatória em areia, flores e tinta, com encerramento manual.
- Conclusão normal da grama, janela desbloqueada após recarregar e areia ainda bloqueada.
- Repetição livre da grama sem nova conquista, XP, sementes ou marcação diária.
- Três tarefas diárias de grama: uma reconhecida junto da etapa e as outras duas pela tela Hoje; acesso ao livre após o trio.
- Preferência de movimento reduzido salva e restaurada.
- Cancelamento da exclusão preservando dados; exclusão confirmada e recarga restaurando o estado inicial.
- Redimensionamento da pintura em andamento para 320 × 568, 768 × 1024 e 844 × 390, preservando percentual e campo acima dos controles.

`scripts/verify-lifecycle.cjs` verificou ainda:

- Expansão visível da tinta com animações habilitadas; imagens do campo estáveis enquanto pausado.
- Pedra solta fora retornando à posição inicial sem aumentar o progresso.
- Evento de visibilidade **simulado no navegador** durante a rega: percentual estacionário, retomada explícita e nenhum acúmulo sem um novo gesto.
- Saída desses jogos sem erro de página ou mudança tardia do progresso persistido. A desativação de callbacks e cancelamento de animações também foram conferidos no código; não foi feita análise de CPU/memória após desmontagem.
- Conclusão das outras duas constelações e das variações kiwi/melancia, com movimento habilitado.
- Leitura de dados v1, gravação automática como v3, preservação de três conquistas antigas e duas tarefas do dia, exibição do resumo histórico e desbloqueio correto da janela.

Os roteiros não registraram exceções de página. Foram inspecionadas capturas dos **14 jogos após um gesto**, da conclusão, das tarefas e das dimensões reduzidas. Transformações, símbolos dos recipientes e instrumentos estavam visíveis. Na prévia horizontal de 844 × 390, o campo cabe, mas fica pequeno; a orientação principal configurada para o app é retrato. Isso não valida conforto em paisagem.

As capturas e `resultado.json` do roteiro principal ficam em `anxietics-preview` dentro do diretório temporário do sistema. O roteiro imprime o caminho; arquivos temporários não são versionados. Para reproduzir, inicie `npm run web:games` na porta 8081 e, em outro terminal, execute `npm run test:preview` com Google Chrome instalado.

**Limite da evidência:** CanvasKit, mouse, localStorage e o evento web de visibilidade não equivalem a Skia nativo, toque capacitivo, AsyncStorage nativo ou suspensão real pelo sistema operacional. Não foi medida a fluidez, latência ou memória no Chrome ou no celular. As demais variações de paleta compartilham regras, mas não foram todas percorridas visualmente neste roteiro.

## Economia: evidências da entrega 0.3

Os 55 testes incluem 19 cenários novos de economia/transações: pagamento de etapa uma vez, soma etapa/diária/conquista, bônus diário inclusive ao voltar à mesma data, compra suficiente/insuficiente/repetida, invariância de XP, equipamento independente e padrão, área real do cortador largo, colocação/movimentação/substituição/remoção, marcos únicos, migração sem retroativos, rejeição de economia inválida, recarga, falha de gravação com retry, ativação única, reset, retry após meia-noite, todas as decorações e ações concorrentes. Um teste segura uma escrita para confirmar que a interface só recebe o snapshot depois de gravado; a compra seguinte usa o saldo recém-confirmado.

`scripts/verify-economy.cjs` percorreu a experiência normal em Chrome headless 153.0.8010.36, em 390 × 844, **sem injetar saldo**:

1. Perfil novo com 50 sementes; grama concluída com falha de gravação simulada. Nenhuma recompensa apareceu como recebida, nem foi liberada a ação de continuar. Retry salvou exatamente 45 sementes e 50 XP, discriminados em etapa, tarefa e Primeiro passo.
2. Compra e equipamento da aparência azul; repetição livre com o cortador padrão azul.
3. Restante do trio diário e bônus, janela com novo nível e areia com Explorador.
4. Compra/equipamento do cortador largo junto da cor azul. O mesmo segmento mostrou 11% com o padrão e 13% com o largo; repetir a região não acrescentou percentual. A conclusão livre não deu sementes/XP. Esses percentuais inteiros não medem ganho exato de tempo nem desempenho.
5. Novas etapas, compra do vaso, colocação, movimentação e remoção/retorno, com Meu cantinho concedida uma vez.
6. Saldo insuficiente para a fonte com confirmação desabilitada; filtros e restauração independente do padrão no inventário.
7. Outras etapas e compra coral com falha de gravação: saldo e inventário continuaram anteriores até o retry, sem cobrança dupla.
8. Recarga com saldo, XP, propriedades, ferramenta larga/azul e posição do vaso preservados. O percurso terminou com 15 sementes e 270 XP.

Capturas e resultado ficam em `anxietics-economy` no diretório temporário. Foram inspecionados a composição do resultado, aparência equipada, ferramenta larga no campo, jardim reaberto, conquistas e mensagem de saldo insuficiente. A tela de resultado usa rolagem interna para manter a composição e as ações alcançáveis em telas pequenas.

### Catálogo e jardim completo

`scripts/verify-catalog.cjs` comprou os oito itens pela interface, equipou as duas aparências e a ferramenta e colocou todas as cinco decorações em posições diferentes. Também confirmou oito propriedades, cinco IDs únicos no jardim, persistência após recarga e alvos de pelo menos 44 pixels dentro da largura de uma prévia de 320 × 568. Foram inspecionadas as prévias e a composição do jardim completo em 390 × 844, além da tela menor.

**Esse roteiro complementar usa um saldo inicial de fixture de 1.000 sementes num perfil temporário**, para verificar todo o catálogo sem esperar por novos dias. Ele não mede a progressão normal nem prova que 1.000 sementes sejam obtidas nesse percurso. O roteiro anterior, `verify-economy`, ganhou as sementes jogando sem injeção de saldo. Capturas e resultado deste teste ficam em `anxietics-catalog` no diretório temporário.

### Ocorrência na regressão da rega

Duas tentativas do roteiro excederam a espera de dez segundos por vaso no Chrome. Uma medição isolada registrou intervalos sem novos callbacks de quadro, embora `document.visibilityState` permanecesse `visible`. O jogo continuava acumulando água quando os quadros retornavam. Foi ampliada para 30 segundos a tolerância **do teste funcional**, mantendo a regra e o limite de delta do jogo. A regressão completa dos 14 jogos e o roteiro de ciclo de vida passaram depois disso. Isso não é uma medição de fluidez em aparelhos nem permite afirmar que o problema ocorreria, ou não, no nativo.

A economia não adicionou dependências. Não houve testes com participantes ou aparelhos Android/iOS; balanceamento dos preços, compreensão das recompensas e conforto da ferramenta larga ainda precisam de avaliação real. Os testes monetários usam armazenamento simulado ou localStorage, não o AsyncStorage nativo. A gravação única de JSON mantém os campos juntos no nível da API; não foi simulado desligamento físico durante escrita.

## Android e iOS: testes reais pendentes

**Nenhum aparelho físico, emulador Android ou simulador iOS foi testado nesta entrega.** Exportação e compatibilidade não substituem essa execução. O ambiente não tem simulador iOS configurado. Não há alegação de 60 FPS, baixa latência, autonomia ou relaxamento comprovado.

| Cenário | O que observar no aparelho | Estado |
| --- | --- | --- |
| Todos os jogos, movimentos lentos/rápidos/diagonais | Resposta ao dedo, continuidade e satisfação visual | Pendente |
| Sobreposição, dedos separados e segundo dedo | Sem contagem dupla, pontes indevidas ou gesto preso | Pendente |
| Encaixes, recipientes, vasos e luzes | Alvos confortáveis e instrução compreensível | Pendente |
| Superfícies próximas de 95% | Resíduos terminados sem caça a fragmentos; uma conclusão | Pendente |
| Tinta/areia/flores em sessões longas | Limites discretos; memória e processamento em aparelho intermediário | Pendente |
| Pausar, interromper gesto e colocar em segundo plano | Processamento suspenso, sem água extra nem retomada automática | Pendente |
| Sair, voltar e reiniciar | Rodada nova e conquistas preservadas; nenhum efeito continua fora do jogo | Pendente |
| Fechar processo após salvar e reabrir | Etapas, tarefas e preferência permanecem | Pendente |
| Meia-noite, fuso e dias sem abrir | Só o trio renova; tarefa antiga não marca uma nova | Pendente |
| Completar o trio e continuar no livre | Acesso no mesmo dia sem recompensas duplicadas | Pendente |
| Apagar dados/cancelar confirmação/falha de armazenamento | Estado inicial apenas após confirmação e gravação bem-sucedida | Pendente |
| Tela pequena/tablet, barras, recortes e fonte ampliada | Campo e botões alcançáveis e legíveis | Pendente |
| Movimento reduzido local e do sistema | Animações decorativas reduzidas; gesto funcional | Pendente |
| Compra e equipamento, jogo alterado e jardim após reabrir | Saldo coerente, efeito real e escolhas persistidas no AsyncStorage nativo | Pendente |
| Falha real de armazenamento durante compra/conclusão | Nenhum sucesso indevido, retry sem cobrança/pagamento extra | Pendente |
| Binário independente sem internet | Jogos e gravação local funcionam sem Metro | Pendente |

O campo visual exige arrastar e enxergar os objetos. Rótulos e controles acessíveis não tornam os 14 jogos plenamente jogáveis por leitor de tela; essa adaptação permanece uma limitação.

## Registro sugerido para o TCC

Anote data, modelo, sistema, versão do Expo Go/app, duração observada e passos de qualquer falha. A duração é registro da avaliação, não um cronômetro do jogo. Observe resposta ao toque, satisfação da transformação, facilidade de completar e vontade de repetir.

Separe comportamento observado de relato do participante, incluindo avaliações neutras ou negativas. Engajamento e percepção de relaxamento não demonstram melhora clínica. Antes de coleta formal, alinhe procedimentos e instrumentos com a orientação acadêmica; este documento registra verificação técnica e sugere observações de usabilidade.
