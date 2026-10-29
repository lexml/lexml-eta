## MODIFIED Requirements

### Requirement: Destino aplicado ao abrir
Ao abrir um documento de tipo suportado, o sistema SHALL manter como colegiado do documento o `lexedit:ColegiadoApreciador` registrado, sem exibi-lo em formulário editável. Sem o elemento, o documento SHALL ficar sem colegiado, sem valor padrão. Atributo ausente ou inválido no elemento SHALL ser ignorado sem invalidar os demais. A regra do local do fecho SHALL ser mantida: o local lido do arquivo SHALL valer enquanto o colegiado do documento for o lido ao abrir. Em documento de tipo não suportado, o colegiado lido SHALL ser ignorado.

#### Scenario: Destino restaurado
- **WHEN** o usuário abre um arquivo com `ColegiadoApreciador` de `tipoColegiado="Comissão"` e uma `siglaComissao`
- **THEN** o documento mantém esse colegiado e o grava ao ser salvo

#### Scenario: Arquivo sem ColegiadoApreciador
- **WHEN** o usuário abre um arquivo que não contém `lexedit:ColegiadoApreciador` (inclusive um salvo antes desta versão)
- **THEN** o documento abre sem erro e sem colegiado
- **AND** ao salvar, o arquivo não registra `lexedit:ColegiadoApreciador`

#### Scenario: Local preservado com destino igual
- **WHEN** o usuário abre um arquivo com colegiado Plenário e local "Sala das Sessões" e salva
- **THEN** o local gravado continua "Sala das Sessões"

#### Scenario: Atributo inválido
- **WHEN** o arquivo traz `tipoColegiado` fora dos valores conhecidos
- **THEN** o atributo inválido é ignorado e os demais atributos válidos são aplicados

#### Scenario: Destino ignorado em tipo não suportado
- **WHEN** o usuário abre um arquivo de tipo não suportado com `tipoColegiado="Comissão"`
- **THEN** o colegiado lido é ignorado
