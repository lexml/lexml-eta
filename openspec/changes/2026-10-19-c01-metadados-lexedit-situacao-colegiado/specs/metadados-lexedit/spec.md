# Spec Delta

## ADDED Requirements

### Requirement: Flag de substitutivo fora do formato salvo
O sistema SHALL NOT gravar nem ler o atributo `substitutivo` em `lexedit:Metadado`, e o esquema `schemas/lexedit.xsd` SHALL NOT declará-lo.

#### Scenario: Documento salvo não contém substitutivo
- **WHEN** o usuário salva um documento, inclusive um criado como texto substitutivo
- **THEN** o `lexedit:Metadado` do arquivo salvo não contém o atributo `substitutivo`

#### Scenario: Arquivo com o atributo substitutivo é aberto
- **WHEN** o usuário abre um arquivo cujo `lexedit:Metadado` traz `substitutivo`
- **THEN** o documento abre normalmente, sem erro, e o atributo é ignorado

### Requirement: Documento referenciado previsto e não preenchido
O esquema do LexEdit SHALL prever o atributo opcional `urnDocumentoReferenciado` (texto) em `lexedit:Metadado`. O sistema SHALL NOT gravar esse atributo ao salvar nem alterar o comportamento ao ler um arquivo que o contenha.

#### Scenario: Salvar não grava a URN do documento referenciado
- **WHEN** o usuário salva qualquer documento
- **THEN** o `lexedit:Metadado` do arquivo salvo não contém `urnDocumentoReferenciado`

#### Scenario: Arquivo com a URN do documento referenciado é aberto
- **WHEN** o usuário abre um arquivo cujo `lexedit:Metadado` traz `urnDocumentoReferenciado`
- **THEN** o documento abre normalmente, sem erro

#### Scenario: Esquema aceita o atributo
- **WHEN** um `lexedit:Metadado` com `urnDocumentoReferenciado` é validado com `schemas/lexedit.xsd`
- **THEN** a validação não aponta erro

### Requirement: Situação dos dispositivos de alteração na norma vigente
O sistema SHALL gravar, em `lexedit:SituacaoNaNormaVigente`, os identificadores dos dispositivos de bloco de alteração de norma que existem na norma vigente em `refIdsDispositivosExistentes` e os que são novos em `refIdsDispositivosNovos`, cada lista como texto com os identificadores separados por espaço. Dispositivos fora de bloco de alteração e dispositivos sem situação informada SHALL NOT constar em nenhuma das listas. O elemento SHALL ser omitido quando as duas listas estiverem vazias, e um atributo com lista vazia SHALL ser omitido.

#### Scenario: Dispositivos existentes e novos
- **WHEN** o usuário salva um documento com um bloco de alteração contendo um artigo marcado como "Existente" e outro marcado como "Novo"
- **THEN** o arquivo contém `lexedit:SituacaoNaNormaVigente` com o id do primeiro em `refIdsDispositivosExistentes` e o id do segundo em `refIdsDispositivosNovos`

#### Scenario: Várias ocorrências na mesma lista
- **WHEN** o documento tem três dispositivos existentes em blocos de alteração
- **THEN** `refIdsDispositivosExistentes` lista os três ids separados por espaço, e `refIdsDispositivosNovos` é omitido

#### Scenario: Documento sem bloco de alteração
- **WHEN** o usuário salva um documento sem nenhum bloco de alteração de norma
- **THEN** o arquivo não contém `lexedit:SituacaoNaNormaVigente`

### Requirement: Colegiado apreciador no arquivo
O sistema SHALL gravar o destino da proposição em `lexedit:ColegiadoApreciador`, com `siglaCasaLegislativa` (`SF`, `CD` ou `CN`) e `tipoColegiado` (`Plenário` ou `Comissão`), e `siglaComissao` somente quando houver comissão informada. Um anexo de parecer SHALL NOT ter o elemento gravado, assim como não tem fecho nem autoria.

#### Scenario: Destino Plenário
- **WHEN** o usuário salva um documento com destino Plenário do Senado
- **THEN** o arquivo contém `lexedit:ColegiadoApreciador` com `siglaCasaLegislativa="SF"` e `tipoColegiado="Plenário"`, sem `siglaComissao`

#### Scenario: Destino Comissão
- **WHEN** o usuário salva um documento com destino a uma comissão
- **THEN** o `lexedit:ColegiadoApreciador` contém `tipoColegiado="Comissão"` e a `siglaComissao` escolhida

### Requirement: Novos grupos na ida e volta pelo conversor
O conversor `jsonix-lexml` 2.1.0 SHALL converter para XML e de volta para JSON um documento com `lexedit:SituacaoNaNormaVigente` e `lexedit:ColegiadoApreciador` sem descartá-los, e o XML gerado SHALL ser válido pelo `schemas/lexedit.xsd`.

#### Scenario: Ida e volta preserva situação e destino
- **WHEN** um documento com bloco de alteração (dispositivos existentes e novos) e destino Comissão é salvo, convertido em XML, convertido de volta em JSON e aberto
- **THEN** a situação dos dispositivos e o destino exibem os valores salvos
- **AND** salvar esse documento aberto gera um arquivo igual ao salvo originalmente
