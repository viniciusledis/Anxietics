# Registro de decisões do MVP

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
| Dia local com três variações únicas | Regra previsível sem timezone de servidor. Sem bloqueio por calendário, sequências ou sanção por ausência. Calendário detalhado fica para depois. |
| Celebração por opacidade | Transição curta, sem flashes, partículas ou som. Sem animação quando o sistema ou o ajuste local pede menos movimento. O movimento necessário para seguir o dedo é mantido. |

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

## Limitações e próximas entregas

Não há teste com participantes nem medição de FPS, latência ou consumo de memória em aparelhos intermediários. A arquitetura busca reduzir trabalho por gesto, mas isso não prova fluidez. O jogo exige interação visual e arraste; rótulos e botões acessíveis não tornam o campo plenamente jogável por leitor de tela. Essa adaptação ainda precisa ser projetada e avaliada.

O corte parcial não é persistido entre sessões. Não há migração de versão de dados além da validação do esquema v1. Uma versão desconhecida falha com aviso, sem apagar automaticamente o conteúdo. Não há exportação/backup próprio, onboarding, calendário completo, sons, vibração ou notificações. O aplicativo não contém imagens pagas, login, backend ou anúncios.

Próxima entrega: testar a interação da grama no Android e iOS, revisar tamanho da máquina, contraste, forma das bordas e esforço de conclusão segundo observações reais. Em seguida, detalhar a experiência diária. O jogo de frutas deve ser iniciado somente depois de validar a grama, sem bombas, punição ou demanda de reflexos rápidos.
