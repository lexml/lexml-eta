# exibir-diferencas-dispositivo Specification

## Purpose

Define o popup "Exibir diferenças" de um dispositivo em revisão: quando é oferecido, quais abas e cards exibe e como compara o texto e o título anteriores com os atuais, na sessão de edição e no documento reaberto.

## Requirements

### Requirement: Exibir diferenças em revisão de texto ou de título
O sistema SHALL oferecer a ação de exibir diferenças em toda revisão em que o texto ou o título do dispositivo foi alterado, inclusive quando a revisão combina outras operações, como movimentação ou transformação.

#### Scenario: Texto alterado
- **WHEN** o usuário altera o texto de um dispositivo em modo de revisão
- **THEN** a marca da revisão oferece a ação de exibir diferenças

#### Scenario: Só o título alterado
- **WHEN** o usuário adiciona, altera ou remove o título de um dispositivo em modo de revisão
- **THEN** a marca da revisão oferece a ação de exibir diferenças

### Requirement: Título nos cards do popup de diferenças
O sistema SHALL exibir o título do dispositivo acima do texto em cada card do popup de diferenças da revisão: o título anterior no card "Texto antes da revisão", o título atual no card "Texto atual" e a comparação dos dois no card "Diferença". O título SHALL ser exibido sempre que existir em um dos lados, mesmo que só o texto tenha mudado.

#### Scenario: Título alterado
- **WHEN** o usuário altera o título de "Do objeto" para "Da finalidade" em modo de revisão e abre o popup de diferenças
- **THEN** o card "Texto antes da revisão" exibe "Do objeto" acima do texto, e o card "Texto atual" exibe "Da finalidade" acima do texto

#### Scenario: Só o texto alterado em dispositivo com título
- **WHEN** o usuário altera apenas o texto de um dispositivo que tem o título "Do objeto" e abre o popup de diferenças
- **THEN** os três cards exibem "Do objeto" acima do texto, e o título não aparece como diferença

#### Scenario: Sem título nos dois lados
- **WHEN** o usuário altera o texto de um dispositivo sem título e abre o popup de diferenças
- **THEN** nenhum card exibe a linha de título, e o popup fica como era antes desta mudança

#### Scenario: Título com formatação
- **WHEN** o título atual tem itálico e subscrito e o usuário abre o popup de diferenças
- **THEN** o card "Texto atual" exibe o título com o itálico e o subscrito preservados

### Requirement: Comparação do título no card Diferença
O card "Diferença" SHALL comparar o título anterior com o atual da mesma forma que compara o texto, destacando os trechos inseridos e removidos.

#### Scenario: Título parcialmente alterado
- **WHEN** o título muda de "Do objeto" para "Do objeto e da finalidade" e o usuário abre o popup de diferenças
- **THEN** o card "Diferença" exibe "Do objeto" sem destaque e " e da finalidade" como trecho inserido

#### Scenario: Título adicionado
- **WHEN** o usuário adiciona o título "Do objeto" a um dispositivo sem título e abre o popup de diferenças
- **THEN** o card "Diferença" exibe todo o título "Do objeto" como inserido

#### Scenario: Título removido
- **WHEN** o usuário remove o título "Do objeto" de um dispositivo e abre o popup de diferenças
- **THEN** o card "Diferença" exibe todo o título "Do objeto" como removido

### Requirement: Lado sem título no popup
Quando só um dos lados tem título, o card do lado sem título SHALL exibir "Sem título" em itálico e cinza no lugar do título, e esse marcador SHALL NOT entrar na comparação do card "Diferença".

#### Scenario: Título adicionado
- **WHEN** o usuário adiciona um título a um dispositivo sem título e abre o popup de diferenças
- **THEN** o card "Texto antes da revisão" exibe "Sem título" em itálico e cinza acima do texto, e o card "Texto atual" exibe o novo título

#### Scenario: Título removido
- **WHEN** o usuário remove o título de um dispositivo e abre o popup de diferenças
- **THEN** o card "Texto antes da revisão" exibe o título removido, e o card "Texto atual" exibe "Sem título" em itálico e cinza

### Requirement: Aba de revisão não depende do texto anterior
O popup SHALL exibir a aba "Texto antes da revisão" sempre que o dispositivo tem revisão de texto ou de título, inclusive quando o texto anterior é vazio.

#### Scenario: Título alterado em dispositivo de texto vazio
- **WHEN** o usuário altera o título de um dispositivo cujo texto é vazio e abre o popup de diferenças
- **THEN** o popup exibe a aba "Texto antes da revisão" com os títulos anterior e atual

### Requirement: Aba Texto original sem título
A aba "Texto original", que compara o texto atual com o texto da norma alterada, SHALL continuar sem exibir título, porque a norma vigente não tem título de dispositivo.

#### Scenario: Dispositivo de alteração de norma com título
- **WHEN** o usuário abre o popup de diferenças de um dispositivo de alteração de norma que tem título
- **THEN** a aba "Texto original" exibe apenas os textos, sem a linha de título

### Requirement: Mesmo popup na sessão e no documento reaberto
O popup de diferenças de uma revisão de título SHALL exibir o mesmo conteúdo na sessão em que a revisão foi criada e no documento reaberto a partir do arquivo salvo.

#### Scenario: Salvar, reabrir e abrir o popup
- **WHEN** o usuário altera o título de "Do objeto" para "Da finalidade" em modo de revisão, salva, reabre o documento e abre o popup de diferenças
- **THEN** o card "Texto antes da revisão" exibe "Do objeto" e o card "Texto atual" exibe "Da finalidade", como antes de salvar
