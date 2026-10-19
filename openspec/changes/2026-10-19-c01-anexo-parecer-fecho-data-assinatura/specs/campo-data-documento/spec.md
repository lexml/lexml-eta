## ADDED Requirements

### Requirement: Padrão "Não informar" no campo Data
O campo "Data" do formulário SHALL ter a opção "Não informar" selecionada por padrão em um documento novo, em ambos os modos (normal e anexo de parecer). A data só SHALL ser considerada informada quando o usuário a selecionar ou quando ela vier de um documento aberto.

#### Scenario: Documento novo
- **WHEN** o editor é inicializado com um documento novo
- **THEN** o campo "Data" exibe "Não informar" selecionado e a proposição obtida da aplicação não tem data

#### Scenario: Usuário informa a data
- **WHEN** o usuário seleciona a opção de data e escolhe `2026-04-24`
- **THEN** o campo "Data" passa a ter a data `2026-04-24` informada

#### Scenario: Usuário volta a não informar
- **WHEN** o usuário, com uma data informada, seleciona "Não informar"
- **THEN** o campo "Data" fica sem data

### Requirement: Ordem das opções do campo Data
O campo "Data" SHALL exibir a opção "Não informar" antes da opção de data.

#### Scenario: Ordem de exibição
- **WHEN** o campo "Data" é exibido
- **THEN** a opção "Não informar" aparece antes da opção de data
