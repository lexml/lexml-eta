## RENAMED Requirements

- FROM: `### Requirement: Destino, data, autoria e impressão no modo anexo de parecer`
- TO: `### Requirement: Data, autoria e impressão no modo anexo de parecer`

## MODIFIED Requirements

### Requirement: Data, autoria e impressão no modo anexo de parecer
No modo anexo de parecer, o sistema SHALL exibir, na mesma aba do modo normal, os formulários de data, autoria e opções de impressão, e SHALL tratar seus valores como no modo normal. A aba SHALL ter o rótulo "Data, Autoria e Impressão".

#### Scenario: Formulários exibidos
- **WHEN** o documento está no modo anexo de parecer
- **THEN** a aba "Data, Autoria e Impressão" exibe os formulários de data, autoria e opções de impressão

#### Scenario: Proposição com local, autoria e data
- **WHEN** a aplicação consumidora obtém a proposição no modo anexo de parecer com data informada e um parlamentar na autoria
- **THEN** a proposição contém `local`, `autoria` e `dataUltimaModificacao` com os valores do formulário

#### Scenario: Proposição sem data informada
- **WHEN** a aplicação consumidora obtém a proposição no modo anexo de parecer com "Não informar" selecionado
- **THEN** `dataUltimaModificacao` da proposição é vazio

## ADDED Requirements

### Requirement: Colegiado no modo anexo de parecer
O modo anexo de parecer SHALL NOT interferir no tratamento do colegiado apreciador: ele é recebido de `novaProposicao` ou lido do arquivo, exposto na proposição e gravado em `lexedit:ColegiadoApreciador` como no modo normal.

#### Scenario: Salvar e reabrir em anexo de parecer
- **WHEN** o usuário salva um anexo de parecer com colegiado Comissão e o reabre
- **THEN** o colegiado Comissão e a sigla da comissão são preservados
