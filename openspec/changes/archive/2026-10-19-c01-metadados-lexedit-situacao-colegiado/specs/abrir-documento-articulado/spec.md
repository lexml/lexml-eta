# Spec Delta

## ADDED Requirements

### Requirement: Reaplicação da situação dos dispositivos de alteração ao abrir
Ao abrir um documento, o sistema SHALL restaurar a situação "Existente" ou "Novo" dos dispositivos de bloco de alteração a partir de `lexedit:SituacaoNaNormaVigente`. Identificador que não corresponda a nenhum dispositivo do documento SHALL ser ignorado, sem erro. Sem o elemento, o comportamento SHALL ser o de hoje.

#### Scenario: Situação restaurada
- **WHEN** o usuário abre um arquivo em que um dispositivo de alteração consta em `refIdsDispositivosExistentes` e outro em `refIdsDispositivosNovos`
- **THEN** o primeiro é exibido como "Existente" e o segundo como "Novo"

#### Scenario: Identificador inexistente
- **WHEN** o arquivo lista um identificador sem dispositivo correspondente
- **THEN** o documento abre normalmente e o identificador é ignorado

#### Scenario: Arquivo sem o elemento
- **WHEN** o usuário abre um arquivo sem `lexedit:SituacaoNaNormaVigente`
- **THEN** o documento abre como antes, sem alterar a situação dos dispositivos

### Requirement: Destino aplicado ao abrir
Ao abrir um documento, o sistema SHALL preencher o formulário de destino com o `lexedit:ColegiadoApreciador` registrado. Atributo ausente ou inválido SHALL assumir o valor padrão do formulário, sem invalidar os demais, e sem o elemento o destino SHALL permanecer o padrão. A regra do local do fecho SHALL ser mantida: o local lido do arquivo só vale enquanto o destino não for alterado pelo usuário em relação ao destino aplicado ao abrir.

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
