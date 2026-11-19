# Spec Delta

## MODIFIED Requirements

### Requirement: Dados da nova proposição
`novaProposicao` SHALL exigir URN, epígrafe e preâmbulo. SHALL aceitar, opcionalmente, URN do documento referenciado, colegiado de destino, autoria, opções de impressão, outros metadados, documento articulado de modelo e indicativo de modo de anexo de parecer. O documento importado pelo componente de nova proposição SHALL ser informado como documento de modelo. O colegiado de destino SHALL ser informado apenas por esta chamada (ou pelo arquivo aberto), pois o `lexml-eta` não tem formulário de destino. Dado obrigatório ausente SHALL rejeitar a chamada com erro descritivo, sem alterar o documento em edição.

#### Scenario: Obrigatório ausente
- **WHEN** o host chama `novaProposicao` sem epígrafe
- **THEN** a chamada é rejeitada com erro que nomeia o dado ausente, e o documento em edição permanece como estava

#### Scenario: Opcionais ausentes
- **WHEN** o host chama `novaProposicao` apenas com URN, epígrafe e preâmbulo
- **THEN** o documento é criado sem colegiado e com os valores padrão para autoria, opções de impressão e outros metadados

#### Scenario: Colegiado informado
- **WHEN** o host chama `novaProposicao` com colegiado de destino Comissão e sigla `CCJ`
- **THEN** o documento é criado com esse colegiado, que é gravado ao salvar

#### Scenario: Modelo e importado juntos
- **WHEN** o host cria a proposição a partir de um arquivo importado
- **THEN** informa o documento como documento de modelo, pois não há parâmetro próprio para documento importado

### Requirement: Documento de modelo
Quando `novaProposicao` recebe um documento articulado de modelo (documento referenciado, de outra proposição ou importado), o sistema SHALL aproveitar dele somente a articulação e a ementa. URN, URN referenciada, epígrafe, preâmbulo e os demais dados SHALL vir dos parâmetros ou do padrão, mesmo os opcionais não informados. O que o modelo traz de justificação, anexos, revisões, comentários, situação na norma vigente, remissões internas inválidas, fecho, autoria, opções de impressão, destino e outros metadados SHALL ser descartado, sem aviso ao usuário. A URN do modelo MUST NOT ser validada contra a casa do editor; a URN validada é a informada nos parâmetros.

#### Scenario: Parâmetros sobrescrevem o modelo
- **WHEN** o modelo traz epígrafe, preâmbulo e URN diferentes dos informados
- **THEN** o documento criado usa os informados

#### Scenario: Metadados do modelo descartados
- **WHEN** o modelo traz anexos, revisões, autoria e outros metadados e a nova proposição não os informa
- **THEN** o documento criado não tem anexos nem revisões, e autoria, impressão, destino e outros metadados têm os valores padrão

#### Scenario: Situação e remissões inválidas do modelo descartadas
- **WHEN** o modelo traz dispositivos de bloco de alteração marcados como existentes na norma vigente e remissões internas marcadas como inválidas
- **THEN** o documento criado não recebe essa situação nem essa lista de remissões inválidas

#### Scenario: Justificação do modelo descartada
- **WHEN** o modelo traz justificação
- **THEN** o documento criado não tem a justificação do modelo, nem ao salvar

#### Scenario: Modelo de outra casa
- **WHEN** o editor do Senado recebe um modelo cuja URN é da Câmara, com URN de parâmetro do Senado
- **THEN** a proposição é criada com a articulação e a ementa do modelo, sem a recusa de documento da outra casa

#### Scenario: Texto aproveitado
- **WHEN** o modelo traz articulação e ementa
- **THEN** o documento criado contém essa articulação e essa ementa

## REMOVED Requirements

### Requirement: Documento importado
**Reason**: A #1102 define que, do documento importado, só interessam a ementa e a articulação, pelo mesmo caminho do texto de outra proposição.
**Migration**: O host passa o documento importado (`texto` do resultado do componente de nova proposição) em `documentoModelo`; ver o requisito "Documento de modelo".

### Requirement: Anexos do documento importado
**Reason**: Os anexos passam a ser descartados como os demais metadados do modelo, sem aviso.
**Migration**: Nenhuma; o requisito "Documento de modelo" cobre o descarte.
