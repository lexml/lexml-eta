# modo-anexo-parecer Specification

## Purpose

Definir o comportamento do editor no modo anexo de parecer: sem as abas de justificação e de notas de rodapé, mas com destino, data, autoria, impressão, fecho e assinaturas como no modo normal.

## Requirements

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

### Requirement: Colegiado no modo anexo de parecer
O modo anexo de parecer SHALL NOT interferir no tratamento do colegiado apreciador: ele é recebido de `novaProposicao` ou lido do arquivo, exposto na proposição e gravado em `lexedit:ColegiadoApreciador` como no modo normal.

#### Scenario: Salvar e reabrir em anexo de parecer
- **WHEN** o usuário salva um anexo de parecer com colegiado Comissão e o reabre
- **THEN** o colegiado Comissão e a sigla da comissão são preservados
