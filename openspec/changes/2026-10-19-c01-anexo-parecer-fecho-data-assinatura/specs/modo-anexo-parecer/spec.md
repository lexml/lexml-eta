## ADDED Requirements

### Requirement: Justificação oculta e opcional no modo anexo de parecer
No modo anexo de parecer, o sistema SHALL ocultar a aba de justificação e a aba de notas de rodapé, SHALL NOT exigir justificação (sem pendência de preenchimento e sem alerta global de justificação) e SHALL omitir `justificativa`, `justificativaAntesRevisao` e `notasRodape` da proposição entregue à aplicação consumidora.

#### Scenario: Abas ocultas
- **WHEN** o editor é inicializado com `anexoParecer` ativo
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
- **WHEN** o editor é inicializado com `anexoParecer` ativo
- **THEN** a aba "Destino, Data, Autoria e Impressão" exibe os formulários de destino, data, autoria e opções de impressão

#### Scenario: Proposição com local, autoria e data
- **WHEN** a aplicação consumidora obtém a proposição no modo anexo de parecer com data informada e um parlamentar na autoria
- **THEN** a proposição contém `local`, `autoria` e `dataUltimaModificacao` com os valores do formulário

#### Scenario: Proposição sem data informada
- **WHEN** a aplicação consumidora obtém a proposição no modo anexo de parecer com "Não informar" selecionado
- **THEN** `dataUltimaModificacao` da proposição é vazio

### Requirement: Fecho e assinaturas no modo anexo de parecer
Ao salvar no modo anexo de parecer, o sistema SHALL registrar local, data e autoria nos metadados do LexEdit e gerar a `ParteFinal` (`LocalDataFecho` e `AssinaturaTexto`) com as mesmas regras do modo normal. Ao abrir, SHALL aplicar a data, o local e a autoria registrados ao formulário.

#### Scenario: Salvar com data e assinatura
- **WHEN** o usuário, no modo anexo de parecer, informa a data `2026-04-24`, inclui um parlamentar na autoria e salva
- **THEN** o arquivo salvo registra local, data e autoria nos metadados do LexEdit, e `ParteFinal` contém `LocalDataFecho` com a data por extenso e um `AssinaturaTexto` do parlamentar

#### Scenario: Salvar sem data e sem autoria
- **WHEN** o usuário, no modo anexo de parecer, mantém "Não informar" e nenhum parlamentar e salva
- **THEN** o arquivo salvo registra o local, não contém data nem autoria, e `LocalDataFecho` contém somente o local seguido de vírgula

#### Scenario: Abrir e reabrir preserva o fecho
- **WHEN** o usuário salva um documento do modo anexo de parecer com data e autoria, abre o arquivo salvo e o salva novamente sem alterações
- **THEN** o segundo arquivo registra o mesmo local, a mesma data, a mesma autoria e a mesma `ParteFinal` do primeiro
