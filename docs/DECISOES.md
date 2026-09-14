# Registro de decisões do MVP 0.2

Data: 14/09/2026. Autor do projeto acadêmico: Vinícius Peres Ledis dos Santos.

## Referência acadêmica e instruções de produto

Foi lido o arquivo `Anxietics_ Gamificação no Cuidado da Ansiedade.docx`, preservado na raiz sem alterações. As seções 1 e 3 propõem investigar gamificação, engajamento, hábitos de autocuidado e consciência emocional. A seção 4 descreve procedimentos bibliográficos, survey, desenvolvimento e avaliação futuros. A seção 5 apresenta um cronograma que vai de agosto de 2026 a junho de 2027. O documento fornecido não contém resultados de survey, testes do protótipo ou evidência de eficácia clínica.

As referências citadas pelo projeto não foram verificadas como parte desta implementação. Suas afirmações não foram transferidas para a interface como fatos clínicos comprovados.

O pedido de implementação refina o produto: a experiência central é jogar, com transformação tátil de superfícies, trilha e repetição livre. Acompanhamento emocional, questionários e listas de hábitos não foram incluídos no núcleo. Isso é uma decisão de escopo do MVP informada pelo autor, não um resultado da pesquisa de campo. Cabe alinhar com a orientação acadêmica se os objetivos e instrumentos do TCC devem refletir esse recorte.

A investigação futura pode observar engajamento e percepção de relaxamento. Esta entrega não realizou avaliação com participantes e não afirma reduzir, tratar ou eliminar ansiedade.

## Escolhas técnicas

| Decisão | Motivo e limite |
| --- | --- |
| React Native + Expo SDK 54 + TypeScript | Código compartilhado Android/iOS, início acessível via Expo Go compatível, tipos básicos para tornar os contratos claros. SDK 54 foi fixado pela distribuição do Expo Go no iPhone; não é a versão mais nova. |
| Skia + Gesture Handler + Reanimated | Views nativas bastam para telas e botões; milhares de pequenas Views de grama trariam trabalho desnecessário de layout e reconciliação. Skia agrupa desenho em paths e recebe valores compartilhados na UI thread. O custo é uma dependência gráfica nativa e maior complexidade no adaptador do jogo. |
| Malha de 8.960 células e máscara limitada | Área sem contagem dupla, memória limitada pelo tamanho do campo. Células são amostradas pelo centro; bordas têm discretização de quatro unidades lógicas. A máscara representa a mesma área contabilizada. |
| Segmentos completos entre eventos | Continuidade inclusive quando o sistema entrega poucos pontos num gesto rápido. Curvas não capturadas pelo sistema são aproximadas por segmentos retos; não podemos reconstruir movimentos que não foram recebidos. |
| Campo de proporção fixa com escala uniforme | Não deforma a máquina e permite preservar o corte ao mudar o espaço disponível. Pode haver margens em telas com outras proporções. Área de jogo não fica sob os controles nem sob barras do sistema. Orientação principal é retrato. |
| Conclusão em 95% | Evita caça aos últimos fragmentos. O 100% mostrado depois representa a finalização visual automática; o motor mantém a contagem real do instante de conclusão. |
| Navegação por estado | Adequada a trilha, jogo e ajustes; botão voltar do Android tratado. Sem deep links e histórico de navegação complexo nesta entrega. |
| AsyncStorage com JSON versionado e fila | Persistência simples, sem conta nem backend. Fila impede que uma escrita lenta antiga sobrescreva uma nova; o app só libera a interação após ler o estado inicial. Falhas não são ocultadas. |
| Conquista como etapa concluída | Evita um segundo saldo de recompensas que poderia divergir. Concluir novamente é idempotente. Não existe pontuação de saúde. |
| Dia local com três tarefas fixas | Seleção determinística entre jogos já liberados, com variações quando há poucas opções. Fica salva até mudar a data. Trilha, tarefas e modo livre têm efeitos separados. Sem histórico de calendário nem sanção por ausência. |
| Movimento reduzido | Conclusão por opacidade, encaixes e divisão de frutas usam transições curtas; tinta cresce suavemente. O ajuste local ou do sistema elimina essas animações. O gesto necessário para jogar permanece. Sem flashes, sons ou vibração. |

## Fontes oficiais consultadas

- [Matriz Expo / React Native e requisitos de sistema](https://docs.expo.dev/versions/latest/).
- [Compatibilidade entre SDK e Expo Go](https://docs.expo.dev/troubleshooting/expo-go-version-mismatch/).
- [Skia no SDK 54](https://docs.expo.dev/versions/v54.0.0/sdk/skia/): 2.2.12 incluído no Expo Go.
- [Reanimated no SDK 54](https://docs.expo.dev/versions/v54.0.0/sdk/reanimated/): instalação via Expo e configuração automática pelo preset Babel.
- [Gestos com Skia](https://shopify.github.io/react-native-skia/docs/animations/gestures/): integração recomendada com Gesture Handler.
- [Animações e valores compartilhados](https://shopify.github.io/react-native-skia/docs/animations/animations/).
- [AsyncStorage no SDK 54](https://docs.expo.dev/versions/v54.0.0/sdk/async-storage/).
- [Preparação do Skia para a prévia web](https://shopify.github.io/react-native-skia/docs/getting-started/web/).

As versões exatas resolvidas estão no `package-lock.json`. Reproduza com `npm ci`; use `npx expo install` ao adicionar módulos nativos. Não atualizar React Native, Skia ou Reanimated isoladamente sem rever a compatibilidade do SDK.

O `npm audit` desta instalação reportou 16 alertas (7 moderados, 9 altos), incluindo dependências transitivas da cadeia Expo/Metro, PostCSS, image-size e xcode/uuid. A sugestão automática envolve migrar para Expo 57, alterando o fluxo escolhido de teste no iPhone. Não foi aplicado `audit fix --force` nem overrides sem validar compatibilidade. O Expo Doctor verifica compatibilidade, não ausência de vulnerabilidades. Esta pendência deve ser revista antes de distribuição: esta entrega é um protótipo local, não uma versão liberada para produção.

## Ampliação incremental para 14 jogos

A base anterior e o motor de grama foram preservados. O pedido seguinte autorizou implementar todos os jogos, incluindo frutas, antes dos testes físicos; isso modifica a ordem inicialmente proposta, sem transformar a prévia web em validação nativa. Os grupos passaram por testes de regras antes de avançar: integração/base, superfícies, encaixes/rega/luzes e experiências criativas.

O catálogo mantém metadados separados dos componentes e da ordem da trilha. Janela, lavagem, pintura, revelação e argila compartilham cobertura; cada um tem camada, textura e ferramenta próprias. A lavagem usa uma máscara do vaso no desenho e no denominador da cobertura. Encaixe testa a posição ao soltar, rega acumula tempo sobre um alvo, luzes seguem sequência espacial, areia mede amplitude por gesto, flores usam regiões e espaçamento, tinta conta gestos por cor e frutas testam interseção do segmento. Não são 14 trocas de cor do jogo de grama.

A tinta usa círculos translúcidos em composição multiplicativa; não simula fluidos. As frutas ficam paradas. Argila é um relevo desenhado em 2D, sem simulação de volume. O mesmo vaso é usado em três paletas. Esses recortes tornam as regras compreensíveis e a conclusão alcançável sem reflexos rápidos.

### Limites explícitos de desenho

- Superfícies: 8.960 células, máscara sem histórico de gestos; pintura tem três caminhos de cores.
- Areia: 12 blocos de até 100 segmentos, cada um com cinco sulcos. Ao atingir o limite, o bloco mais antigo é reutilizado. Um gesto amplo se afasta pelo menos 150 unidades lógicas do início; movimentos curtos repetidos não contam como um caminho amplo.
- Flores: grade de 16 × 22 posições, até 352 flores; o mesmo ponto não recebe outra flor. Oito flores em cada região concluem a tarefa guiada. O campo cheio pode ser limpo por “Recomeçar”.
- Tinta: até 24 manchas; as mais antigas são substituídas. Cada cor conta três inícios de gesto na tarefa guiada. Não há meta obrigatória no livre.
- Encaixes: quatro pedras ou seis bolinhas, tolerância de 48 unidades para soltar. Bolinhas mantêm símbolos independentes da paleta.
- Rega: quatro plantas, quatro segundos acumulados por vaso, sem perda ou excesso. O delta de quadro é limitado para não acumular água por tempo em segundo plano.
- Frutas: seis objetos com duas metades cada. Luzes: sete ou oito pontos conforme a variação.

Pausar ou abrir a confirmação de reinício desabilita o gesto. Segundo plano pausa e exige retomada explícita; callbacks de quadro são desativados. Desmontar remove gestos, ouvintes e callbacks de quadro e cancela animações. Reiniciar muda a chave do componente e cria o estado inicial. Sons e vibração não existem, portanto não há serviços desses recursos a interromper.

### Partidas e migração

`GameScreen` possui uma trava de conclusão e identifica cada tentativa. `completeSession` valida contexto, jogo liberado e tarefa/etapa correspondente. A lista de sessões recentes é limitada a 64; mesmo depois desse limite, uma etapa já conquistada ou tarefa já marcada não pode recompensar novamente. Partidas do laboratório e suas repetições livres são isoladas do domínio persistente.

A versão 2 mantém a chave histórica de armazenamento e migra JSON v1. Clareira e Bosque, antigos campos de grama, permanecem como conquistas históricas, mostradas no resumo; não liberam automaticamente jogos novos. O Jardim preserva sua conquista na primeira etapa. Uma versão desconhecida continua sendo erro, sem apagar dados automaticamente.

O trio diário é determinado pela data e pelos jogos liberados naquele momento, salvo como três tarefas identificadas por data e posição. Abrir o app várias vezes ou desbloquear outro jogo não troca o trio. Uma tarefa de ontem não marca uma tarefa de hoje. Recuar a data do aparelho pode renovar tarefas, limitação aceita sem sistema antifraude.

Apagar dados escreve o estado inicial no fim da mesma fila e só o publica depois de gravar. Atualizações e novas tentativas de salvar ficam bloqueadas durante essa operação; uma falha preserva o estado atual em memória e permite tentar de novo.

## Limitações e validação seguinte

Não há teste com participantes nem medição de FPS, latência ou consumo de memória em aparelhos intermediários. A arquitetura busca reduzir trabalho por gesto, mas isso não prova fluidez. O jogo exige interação visual e arraste; rótulos e botões acessíveis não tornam o campo plenamente jogável por leitor de tela. Essa adaptação ainda precisa ser projetada e avaliada.

O estado parcial dos jogos não é persistido entre sessões. Não há exportação/backup próprio, onboarding, calendário histórico, sons, vibração ou notificações. O aplicativo não contém imagens pagas, login, backend ou anúncios. As variações reutilizam regras: mudam cores, padrão ou desenho, sem serem contabilizadas como novos jogos.

Testes no Chrome exercitaram os 14 jogos, pausa, reinício, persistência web, diário e modo livre. Isso não executa worklets na thread nativa, nem valida o AsyncStorage de Android/iOS. A exportação de bundles não substitui compilação e execução nativa. O roteiro e evidências estão em [VALIDACAO.md](VALIDACAO.md).

A próxima validação é em Android e iOS: continuidade e latência do toque, conforto dos alvos, retorno dos encaixes, compreensão da rega, discrição dos efeitos, memória em sessões longas e comportamento ao sair/voltar. Sessões de um a três minutos são intenção; os objetivos atuais podem ser mais curtos. Ajustar metas exige observação, não uma contagem regressiva. Possível engajamento e relaxamento percebido continuam hipóteses, sem resultados de participantes nesta entrega.
