# Validação da primeira entrega

## Verificações automatizadas

Executadas em 14/09/2026:

- TypeScript: verificação sem erros.
- 20 testes de regras e repositório: aprovados.
- Expo Doctor: 18 de 18 verificações aprovadas.
- `expo install --check`: dependências compatíveis.
- Exportação dos bundles Android e iOS: concluída. Isso não compila um APK/IPA nem executa o código em um dispositivo.

Os testes verificam sobreposição, gestos retos e diagonais rápidos, toques separados, cantos, conclusão única em 95%, limite de memória da malha, dimensionamento, bloqueios, idempotência, modo livre, mudança de dia, recarga, ordem de gravação e recuperação após erro. A recarga usa um armazenamento simulado em memória.

## Prévia no navegador

Executado roteiro automatizado com Playwright e Chrome headless em perfil temporário, sem acessar um perfil pessoal. Foram aprovados: corte por arraste de mouse, repetição do mesmo caminho sem aumento do percentual, conclusão, reinício pelo botão “Jogar de novo”, nova conclusão sem duplicar conquistas, desbloqueio após recarregar a página, persistência do ajuste de movimento reduzido, conclusão das três variações e acesso ao modo livre no mesmo dia.

Foi verificado o redimensionamento de uma rodada em andamento para 320 × 568, 768 × 1024 e 844 × 390 pixels, com campo dentro dos limites e acima do botão de reinício, preservando o percentual. A inspeção de capturas confirmou contraste entre grama alta/cortada e as três paletas. Foi corrigido um tamanho mínimo intrínseco do canvas HTML do Skia que impedia seu encolhimento; o ajuste é restrito à entrada web. A barra de progresso passou a expor o percentual também na web via atributos ARIA.

Esses resultados usam React Native Web, CanvasKit e armazenamento do navegador. Não verificam a thread de interface nativa, gestos de dedo em tela capacitiva, barras reais do sistema, fonte ampliada no sistema nem AsyncStorage nativo. A prévia não mede FPS ou sensação tátil. O roteiro reprodutível é `scripts/verify-preview.cjs`; requer a prévia local na porta 8081 e Chrome instalado. A confirmação nativa de reinício de uma rodada parcial (`Alert.alert`) deve ser validada no celular.

## Testes reais pendentes

Não foram executados testes em Android ou iOS físico ou emulador nesta entrega. O ambiente não possui um simulador iOS configurado (`simctl` indisponível). Não há alegação de 60 FPS, baixa latência, consumo de memória medido ou benefício clínico.

| Cenário | O que observar | Resultado em aparelho |
| --- | --- | --- |
| Movimentos lentos, rápidos e diagonais | Máquina acompanha o dedo e o trecho entre eventos permanece cortado | Pendente |
| Repetir um caminho já cortado | Percentual permanece igual | Pendente |
| Soltar e tocar longe | Não aparece ponte cortada entre gestos | Pendente |
| Um segundo dedo | Não cria salto inesperado nem congela o próximo gesto | Pendente |
| Ir para segundo plano durante gesto e voltar | Rodada preservada se o processo continuar vivo, próximo gesto sem ponte | Pendente |
| Cortar quase tudo | Resíduos somem em 95%; uma única conclusão | Pendente |
| Voltar e repetir a mesma etapa | Próxima permanece aberta; conquista não é duplicada | Pendente |
| Fechar o processo após salvar e reabrir | Etapas, atividades do dia e preferência permanecem | Pendente |
| Reiniciar antes de concluir | Confirmação, percentual zero e campo novo; conquistas preservadas | Pendente |
| Sair antes de concluir | Sem punição; só o corte da rodada é descartado | Pendente |
| Tela pequena, tablet, fonte ampliada, barras e recortes | Campo e controles alcançáveis, sem regiões obrigatórias cobertas | Pendente |
| Movimento reduzido do sistema e ajuste local | Conclusão estática quando qualquer um estiver ativo | Pendente |
| Dia seguinte e rodada atravessando meia-noite | Apenas o trio diário renova; conquistas continuam | Pendente |
| Concluir o trio e continuar | Modo livre disponível no mesmo dia | Pendente |

## Registro sugerido para cada sessão

Anote data, modelo do aparelho, sistema, versão do Expo Go, versão do aplicativo, duração aproximada observada e passos que reproduzem qualquer falha. Duração é anotação do teste, não um cronômetro ou meta dentro do jogo.

Peça descrições sobre resposta ao toque, satisfação visual, esforço para completar e vontade de repetir. Separe o que foi observado do que o participante relatou. Registre também avaliações neutras ou negativas. Não converta engajamento ou relaxamento percebido em evidência de melhora clínica.

Antes de testes formais com participantes, alinhe o procedimento e os instrumentos com a orientação acadêmica. Esta lista é um roteiro de usabilidade e funcionamento, não um protocolo clínico validado.
