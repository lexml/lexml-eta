# campo-data-documento Specification

## Purpose

Definir o campo "Data" do formulário do documento: o valor padrão de um documento novo, a ordem das opções exibidas ao usuário e as datas entregues na proposição obtida pelo host (a data de impressão e o instante da obtenção).

## Requirements

### Requirement: Padrão "Não informar" no campo Data
O campo "Data" do formulário SHALL ter a opção "Não informar" selecionada por padrão em um documento novo, em ambos os modos (normal e anexo de parecer). A data só SHALL ser considerada informada quando o usuário a selecionar ou quando ela vier de um documento aberto.

#### Scenario: Documento novo
- **WHEN** o editor é inicializado com um documento novo
- **THEN** o campo "Data" exibe "Não informar" selecionado e a proposição obtida da aplicação tem `data` vazio

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

### Requirement: Data de impressão na proposição obtida
A proposição obtida pela aplicação consumidora SHALL trazer em `data` a data do campo "Data" (`AAAA-MM-DD`), que é a data de impressão do fecho, e SHALL trazer `data` vazio quando o campo estiver em "Não informar". A data de impressão SHALL NOT ser entregue em `dataUltimaModificacao`.

#### Scenario: Data informada
- **WHEN** o usuário informa `2026-04-24` no campo "Data" e a aplicação consumidora obtém a proposição
- **THEN** a proposição tem `data` igual a `2026-04-24`

#### Scenario: Data aberta do arquivo
- **WHEN** o usuário abre um documento com a data do fecho `2026-04-24` e a aplicação consumidora obtém a proposição
- **THEN** a proposição tem `data` igual a `2026-04-24`

#### Scenario: Sem documento iniciado
- **WHEN** a aplicação consumidora obtém a proposição sem documento iniciado
- **THEN** a proposição tem `data` vazio

### Requirement: Data da última modificação na proposição obtida
A proposição obtida pela aplicação consumidora SHALL trazer em `dataUltimaModificacao` o instante em que foi obtida, com data, hora (precisão de segundos) e o fuso horário local (`xsd:dateTime`, ISO 8601), no mesmo formato gravado em `dataUltimaModificacao` no arquivo. Cada obtenção SHALL trazer o seu próprio instante, independente do campo "Data" e da data lida do arquivo aberto.

#### Scenario: Instante da obtenção
- **WHEN** a aplicação consumidora obtém a proposição em 04/11/2026 às 10:15:30, com o fuso horário local −03:00
- **THEN** a proposição tem `dataUltimaModificacao` igual a `2026-11-04T10:15:30-03:00`

#### Scenario: Independente do campo Data
- **WHEN** o usuário informa `2026-04-24` no campo "Data" e a aplicação consumidora obtém a proposição em 04/11/2026 às 10:15:30, com o fuso −03:00
- **THEN** a proposição tem `dataUltimaModificacao` igual a `2026-11-04T10:15:30-03:00` e `data` igual a `2026-04-24`

#### Scenario: Documento aberto com data de modificação gravada
- **WHEN** o usuário abre um arquivo com `dataUltimaModificacao="2026-05-12T10:15:00-03:00"` e a aplicação consumidora obtém a proposição em 04/11/2026 às 10:15:30, com o fuso −03:00
- **THEN** a proposição tem `dataUltimaModificacao` igual a `2026-11-04T10:15:30-03:00`, e não a data lida
