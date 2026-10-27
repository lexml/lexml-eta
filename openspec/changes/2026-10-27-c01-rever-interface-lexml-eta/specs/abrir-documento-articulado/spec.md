# Spec Delta

## ADDED Requirements

### Requirement: Abertura de documento de tipo outro
Ao abrir um documento cuja URN tenha autoridade fora de `senado.federal`, `camara.deputados` e `congresso.nacional` (por exemplo, `federal`), o sistema SHALL abrir o documento como tipo "outro": SHALL NOT exibir a edição do colegiado de destino nem a da autoria, SHALL ignorar os valores de destino e autoria do arquivo, e SHALL gravar ambos vazios ao salvar. A aba de avisos SHALL exibir uma mensagem de erro informando que esse tipo de documento não é completamente suportado pelo editor. O erro SHALL NOT impedir a edição do texto nem o salvamento.

#### Scenario: Formulários ausentes
- **WHEN** o usuário abre um documento de autoridade `federal`
- **THEN** a aba de destino, data, autoria e impressão não exibe os formulários de destino nem de autoria

#### Scenario: Aviso de documento não suportado
- **WHEN** o usuário abre um documento de autoridade `federal`
- **THEN** a aba de avisos exibe um erro informando que o tipo de documento não é completamente suportado

#### Scenario: Salvar documento de tipo outro
- **WHEN** o usuário edita o texto de um documento de tipo outro e o salva
- **THEN** o salvamento ocorre, o arquivo não contém destino nem autoria preenchidos, e `lexedit:Pendencias` traz a pendência de documento não suportado

#### Scenario: Documento da casa oposta continua recusado
- **WHEN** o editor do Senado abre um documento de autoridade `camara.deputados`
- **THEN** a abertura é recusada com erro descritivo

### Requirement: Modo e referência aplicados ao abrir
Ao abrir um documento, o sistema SHALL aplicar o modo de anexo de parecer e a URN do documento referenciado lidos de `lexedit:Metadado`. Valores ausentes SHALL assumir o modo normal e a ausência de documento referenciado.

#### Scenario: Anexo de parecer lido do arquivo
- **WHEN** o usuário abre um arquivo com `anexoParecer="true"`
- **THEN** o editor abre no modo de anexo de parecer

#### Scenario: Documento referenciado lido do arquivo
- **WHEN** o usuário abre um arquivo com `urnDocumentoReferenciado`
- **THEN** o documento aberto mantém essa URN como documento referenciado

## MODIFIED Requirements

### Requirement: Destino aplicado ao abrir
Ao abrir um documento de tipo suportado, o sistema SHALL preencher o formulário de destino com o `lexedit:ColegiadoApreciador` registrado. Atributo ausente ou inválido SHALL assumir o valor padrão do formulário, sem invalidar os demais, e sem o elemento o destino SHALL permanecer o padrão. A regra do local do fecho SHALL ser mantida: o local lido do arquivo só vale enquanto o destino não for alterado pelo usuário em relação ao destino aplicado ao abrir. Em documento de tipo outro, o destino lido SHALL ser ignorado.

#### Scenario: Destino restaurado
- **WHEN** o usuário abre um arquivo com `ColegiadoApreciador` de `tipoColegiado="Comissão"` e uma `siglaComissao`
- **THEN** o formulário de destino exibe Comissão e a comissão informada

#### Scenario: Arquivo sem ColegiadoApreciador
- **WHEN** o usuário abre um arquivo que não contém `lexedit:ColegiadoApreciador` (inclusive um salvo antes desta versão)
- **THEN** o documento abre sem erro e o formulário de destino exibe Plenário
- **AND** ao salvar, o arquivo registra `tipoColegiado="Plenário"`

#### Scenario: Local preservado com destino igual
- **WHEN** o usuário abre um arquivo com destino Plenário e local "Sala das Sessões", sem alterar o destino, e salva
- **THEN** o local gravado continua "Sala das Sessões"

#### Scenario: Atributo inválido
- **WHEN** o arquivo traz `tipoColegiado` fora dos valores conhecidos
- **THEN** o formulário assume o tipo padrão e os demais atributos válidos são aplicados

#### Scenario: Destino ignorado em tipo outro
- **WHEN** o usuário abre um arquivo de autoridade `federal` com `tipoColegiado="Comissão"`
- **THEN** o destino lido é ignorado e nenhum formulário de destino é exibido
