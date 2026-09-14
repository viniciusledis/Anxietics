# Validação do MVP 0.2

Executada em 14/09/2026, no macOS 13.7.8, Node 22.21.0. Não houve avaliação com participantes nem medição de eficácia clínica.

## Verificações automatizadas

| Verificação | Resultado | O que comprova |
| --- | --- | --- |
| `npm run check` | TypeScript sem erros; 36 testes aprovados | Contratos e regras puras; persistência com armazenamento simulado. |
| `npm run doctor` | 18/18 verificações aprovadas | Configuração e compatibilidade verificadas pelo Expo. |
| `npx expo install --check` | Dependências compatíveis | Alinhamento com o SDK 54 instalado. |
| `npm run export:mobile` | Android e iOS exportados | Geração de bundles JavaScript/Hermes; não compila APK/IPA nem executa o app nativo. |
| Roteiro principal Playwright | 14 jogos concluídos por gestos | Integração da variante inicial de cada jogo na prévia web. |
| Roteiro de ciclo de vida Playwright | Aprovado | Animações e pausas web, variações adicionais e migração v1→v2. |

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
- Repetição da grama sem nova conquista nem marcação diária.
- Três tarefas diárias de grama, incluindo as três variações, concluídas separadamente; acesso ao livre após o trio.
- Preferência de movimento reduzido salva e restaurada.
- Cancelamento da exclusão preservando dados; exclusão confirmada e recarga restaurando o estado inicial.
- Redimensionamento da pintura em andamento para 320 × 568, 768 × 1024 e 844 × 390, preservando percentual e campo acima dos controles.

`scripts/verify-lifecycle.cjs` verificou ainda:

- Expansão visível da tinta com animações habilitadas; imagens do campo estáveis enquanto pausado.
- Pedra solta fora retornando à posição inicial sem aumentar o progresso.
- Evento de visibilidade **simulado no navegador** durante a rega: percentual estacionário, retomada explícita e nenhum acúmulo sem um novo gesto.
- Saída desses jogos sem erro de página ou mudança tardia do progresso persistido. A desativação de callbacks e cancelamento de animações também foram conferidos no código; não foi feita análise de CPU/memória após desmontagem.
- Conclusão das outras duas constelações e das variações kiwi/melancia, com movimento habilitado.
- Leitura de dados v1, gravação automática como v2, preservação de três conquistas antigas e duas tarefas do dia, exibição do resumo histórico e desbloqueio correto da janela.

Os roteiros não registraram exceções de página. Foram inspecionadas capturas dos **14 jogos após um gesto**, da conclusão, das tarefas e das dimensões reduzidas. Transformações, símbolos dos recipientes e instrumentos estavam visíveis. Na prévia horizontal de 844 × 390, o campo cabe, mas fica pequeno; a orientação principal configurada para o app é retrato. Isso não valida conforto em paisagem.

As capturas e `resultado.json` do roteiro principal ficam em `anxietics-preview` dentro do diretório temporário do sistema. O roteiro imprime o caminho; arquivos temporários não são versionados. Para reproduzir, inicie `npm run web:games` na porta 8081 e, em outro terminal, execute `npm run test:preview` com Google Chrome instalado.

**Limite da evidência:** CanvasKit, mouse, localStorage e o evento web de visibilidade não equivalem a Skia nativo, toque capacitivo, AsyncStorage nativo ou suspensão real pelo sistema operacional. Não foi medida a fluidez, latência ou memória no Chrome ou no celular. As demais variações de paleta compartilham regras, mas não foram todas percorridas visualmente neste roteiro.

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
| Binário independente sem internet | Jogos e gravação local funcionam sem Metro | Pendente |

O campo visual exige arrastar e enxergar os objetos. Rótulos e controles acessíveis não tornam os 14 jogos plenamente jogáveis por leitor de tela; essa adaptação permanece uma limitação.

## Registro sugerido para o TCC

Anote data, modelo, sistema, versão do Expo Go/app, duração observada e passos de qualquer falha. A duração é registro da avaliação, não um cronômetro do jogo. Observe resposta ao toque, satisfação da transformação, facilidade de completar e vontade de repetir.

Separe comportamento observado de relato do participante, incluindo avaliações neutras ou negativas. Engajamento e percepção de relaxamento não demonstram melhora clínica. Antes de coleta formal, alinhe procedimentos e instrumentos com a orientação acadêmica; este documento registra verificação técnica e sugere observações de usabilidade.
