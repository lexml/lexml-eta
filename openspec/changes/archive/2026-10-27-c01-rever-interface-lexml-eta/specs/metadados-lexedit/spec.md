# Spec Delta

## REMOVED Requirements

### Requirement: Documento referenciado previsto e não preenchido
**Reason**: O atributo `urnDocumentoReferenciado` passa a ser gravado e lido, porque a URN do documento referenciado é dado da nova proposição.
**Migration**: Ver o requisito "Documento referenciado gravado e lido".

## ADDED Requirements

### Requirement: Documento referenciado gravado e lido
O esquema do LexEdit SHALL prever o atributo opcional `urnDocumentoReferenciado` (texto) em `lexedit:Metadado`. O sistema SHALL gravar esse atributo ao salvar um documento que tenha documento referenciado, omiti-lo quando não houver, e lê-lo ao abrir. Valor vazio ou ausente SHALL ser tratado como sem documento referenciado.

#### Scenario: Salvar grava a URN do documento referenciado
- **WHEN** o usuário salva um documento com documento referenciado
- **THEN** o `lexedit:Metadado` do arquivo salvo traz `urnDocumentoReferenciado` com a URN informada

#### Scenario: Salvar sem documento referenciado
- **WHEN** o usuário salva um documento sem documento referenciado
- **THEN** o `lexedit:Metadado` do arquivo salvo não contém `urnDocumentoReferenciado`

#### Scenario: Arquivo com a URN do documento referenciado é aberto
- **WHEN** o usuário abre um arquivo cujo `lexedit:Metadado` traz `urnDocumentoReferenciado`
- **THEN** o documento aberto mantém essa URN como documento referenciado

#### Scenario: Ida e volta preserva a referência
- **WHEN** o usuário salva um documento com documento referenciado, abre o arquivo e o salva novamente
- **THEN** o segundo arquivo traz a mesma `urnDocumentoReferenciado`

#### Scenario: Esquema aceita o atributo
- **WHEN** um `lexedit:Metadado` com `urnDocumentoReferenciado` é validado com `schemas/lexedit.xsd`
- **THEN** a validação não aponta erro

### Requirement: Modo de anexo de parecer no arquivo
O sistema SHALL gravar `anexoParecer` (booleano) em `lexedit:Metadado` ao salvar, com `true` no modo de anexo de parecer e `false` no modo normal, e SHALL lê-lo ao abrir. Atributo ausente ou inválido SHALL ser tratado como `false`, sem invalidar os demais metadados.

#### Scenario: Salvar no modo de anexo de parecer
- **WHEN** o usuário salva um documento no modo de anexo de parecer
- **THEN** o `lexedit:Metadado` do arquivo salvo traz `anexoParecer="true"`

#### Scenario: Salvar no modo normal
- **WHEN** o usuário salva um documento no modo normal
- **THEN** o `lexedit:Metadado` do arquivo salvo traz `anexoParecer="false"`

#### Scenario: Arquivo sem o atributo
- **WHEN** o usuário abre um arquivo salvo antes desta versão, sem `anexoParecer`
- **THEN** o documento abre no modo normal, sem erro

#### Scenario: Atributo inválido
- **WHEN** o arquivo traz `anexoParecer` com valor que não é booleano
- **THEN** o documento abre no modo normal e os demais metadados válidos são aplicados

### Requirement: Pendência de documento não suportado
Ao salvar um documento de tipo "não suportado" (URN que não é de proposição suportada pelo editor; ver `vocabulario-urn`), o sistema SHALL incluir em `lexedit:Pendencias` a pendência "Este tipo de documento não é completamente suportado pelo editor.". A pendência SHALL ser recalculada pela URN a cada salvamento, e a pendência gravada em arquivo SHALL NOT ser lida ao abrir.

#### Scenario: Salvar documento de tipo não suportado
- **WHEN** o usuário salva um documento de autoridade `federal`
- **THEN** `lexedit:Pendencias` contém a pendência de documento não suportado

#### Scenario: Salvar norma de autoridade com casa
- **WHEN** o usuário salva um documento de URN `senado.federal:resolucao`
- **THEN** `lexedit:Pendencias` contém a pendência de documento não suportado

#### Scenario: Salvar documento de tipo suportado
- **WHEN** o usuário salva uma proposição de autoridade `senado.federal`
- **THEN** `lexedit:Pendencias` não contém a pendência de documento não suportado

#### Scenario: Pendência gravada não é lida
- **WHEN** o usuário abre um arquivo de tipo suportado cujo `lexedit:Pendencias` traz a pendência de documento não suportado
- **THEN** nenhum alerta de documento não suportado é exibido
