## ADDED Requirements

### Requirement: Rótulo nos cards do popup de diferenças
O sistema SHALL exibir o rótulo do dispositivo acima do texto em cada card do popup de diferenças da revisão — o rótulo anterior no card "Texto antes da revisão", o atual no card "Texto atual" e a comparação dos dois no card "Diferença" — somente quando a própria revisão registra a troca de rótulo: na pena, sempre, e nos demais dispositivos quando a revisão tem a operação `alteracaoRotulo` (renumeração manual). O rótulo SHALL ser o mesmo na sessão e no documento reaberto. A renumeração automática e a movimentação NÃO SHALL fazer o rótulo aparecer, porque mudam o rótulo sem que a marca descreva essa troca.

#### Scenario: Troca de rótulo da pena
- **WHEN** o usuário troca o rótulo da pena de "Pena –" para "Infração –" em modo de revisão e abre o popup de diferenças
- **THEN** o card "Texto antes da revisão" exibe "Pena –", o card "Texto atual" exibe "Infração –" e o card "Diferença" marca o trecho removido e o inserido

#### Scenario: Só o texto da pena alterado
- **WHEN** o usuário altera apenas o texto da pena e abre o popup de diferenças
- **THEN** os três cards exibem o mesmo rótulo, e o rótulo não aparece como diferença

#### Scenario: Renumeração manual
- **WHEN** o usuário renumera manualmente um dispositivo em modo de revisão (revisão `alteracaoRotulo`) e abre o popup de diferenças, na sessão ou depois de reabrir o documento
- **THEN** o card "Texto antes da revisão" exibe o rótulo anterior e o card "Texto atual" exibe o novo

#### Scenario: Renumeração automática
- **WHEN** o usuário altera o texto de um dispositivo que teve o rótulo mudado pela renumeração automática (por exemplo, pela inclusão de um artigo antes dele) e abre o popup de diferenças
- **THEN** nenhum card exibe a linha de rótulo
