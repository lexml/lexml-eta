## MODIFIED Requirements

### Requirement: Data, autoria e impressão no modo anexo de parecer
No modo anexo de parecer, o sistema SHALL exibir, na mesma aba do modo normal, os formulários de data, autoria e opções de impressão, e SHALL tratar seus valores como no modo normal. A aba SHALL ter o rótulo "Dados da proposição".

#### Scenario: Formulários exibidos
- **WHEN** o documento está no modo anexo de parecer
- **THEN** a aba "Dados da proposição" exibe os formulários de data, autoria e opções de impressão

#### Scenario: Proposição com local, autoria e data
- **WHEN** a aplicação consumidora obtém a proposição no modo anexo de parecer com data informada e um parlamentar na autoria
- **THEN** a proposição contém `local`, `autoria` e `data` com os valores do formulário

#### Scenario: Proposição sem data informada
- **WHEN** a aplicação consumidora obtém a proposição no modo anexo de parecer com "Não informar" selecionado
- **THEN** `data` da proposição é vazio
