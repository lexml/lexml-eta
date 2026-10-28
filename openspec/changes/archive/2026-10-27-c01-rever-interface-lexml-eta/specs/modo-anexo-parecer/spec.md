# Spec Delta

## ADDED Requirements

### Requirement: Modo de anexo de parecer como propriedade do documento
O modo de anexo de parecer SHALL ser uma propriedade do documento, definida em `novaProposicao` ou lida do arquivo ao abrir, e SHALL NOT ser uma opção da configuração do componente. O modo SHALL valer enquanto o documento estiver em edição e ser descartado no reset.

#### Scenario: Nova proposição de anexo de parecer
- **WHEN** o host chama `novaProposicao` com o indicativo de anexo de parecer ativo
- **THEN** o editor abre no modo de anexo de parecer

#### Scenario: Abrir anexo de parecer salvo
- **WHEN** o host abre um arquivo salvo no modo de anexo de parecer
- **THEN** o editor abre no modo de anexo de parecer, sem depender de configuração

#### Scenario: Troca de documento
- **WHEN** o host abre um documento normal depois de um anexo de parecer
- **THEN** o editor volta ao modo normal, com as abas de justificação e de notas exibidas

## MODIFIED Requirements

### Requirement: Justificação oculta e opcional no modo anexo de parecer
No modo anexo de parecer, o sistema SHALL ocultar a aba de justificação e a aba de notas de rodapé, SHALL NOT exigir justificação (sem pendência de preenchimento e sem alerta global de justificação) e SHALL omitir `justificativa`, `justificativaAntesRevisao` e `notasRodape` da proposição entregue à aplicação consumidora.

#### Scenario: Abas ocultas
- **WHEN** o documento está no modo anexo de parecer
- **THEN** a aba "Justificação" e a aba "Notas" não são exibidas

#### Scenario: Justificação não exigida
- **WHEN** o editor no modo anexo de parecer é inicializado sem nenhum texto de justificação
- **THEN** a proposição não registra pendência de justificação e nenhum alerta global de justificação é exibido

#### Scenario: Campos de justificação omitidos
- **WHEN** a aplicação consumidora obtém a proposição no modo anexo de parecer
- **THEN** a proposição não contém `justificativa`, `justificativaAntesRevisao` nem `notasRodape`

### Requirement: Destino, data, autoria e impressão no modo anexo de parecer
No modo anexo de parecer, o sistema SHALL exibir, na mesma aba do modo normal, os formulários de destino, data, autoria e opções de impressão, e SHALL tratar seus valores como no modo normal. A aba SHALL ter o rótulo "Destino, Data, Autoria e Impressão".

#### Scenario: Formulários exibidos
- **WHEN** o documento está no modo anexo de parecer
- **THEN** a aba "Destino, Data, Autoria e Impressão" exibe os formulários de destino, data, autoria e opções de impressão

#### Scenario: Proposição com local, autoria e data
- **WHEN** a aplicação consumidora obtém a proposição no modo anexo de parecer com data informada e um parlamentar na autoria
- **THEN** a proposição contém `local`, `autoria` e `dataUltimaModificacao` com os valores do formulário

#### Scenario: Proposição sem data informada
- **WHEN** a aplicação consumidora obtém a proposição no modo anexo de parecer com "Não informar" selecionado
- **THEN** `dataUltimaModificacao` da proposição é vazio
