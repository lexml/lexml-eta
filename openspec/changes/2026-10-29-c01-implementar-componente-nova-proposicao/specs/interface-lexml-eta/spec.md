## MODIFIED Requirements

### Requirement: Dados da nova proposição
`novaProposicao` SHALL exigir URN, epígrafe e preâmbulo. SHALL aceitar, opcionalmente, URN do documento referenciado, colegiado de destino, autoria, opções de impressão, outros metadados, documento articulado de modelo e indicativo de modo de anexo de parecer. O colegiado de destino SHALL ser informado apenas por esta chamada (ou pelo arquivo aberto), pois o `lexml-eta` não tem formulário de destino. Dado obrigatório ausente SHALL rejeitar a chamada com erro descritivo, sem alterar o documento em edição.

#### Scenario: Obrigatório ausente
- **WHEN** o host chama `novaProposicao` sem epígrafe
- **THEN** a chamada é rejeitada com erro que nomeia o dado ausente, e o documento em edição permanece como estava

#### Scenario: Opcionais ausentes
- **WHEN** o host chama `novaProposicao` apenas com URN, epígrafe e preâmbulo
- **THEN** o documento é criado sem colegiado e com os valores padrão para autoria, opções de impressão e outros metadados

#### Scenario: Colegiado informado
- **WHEN** o host chama `novaProposicao` com colegiado de destino Comissão e sigla `CCJ`
- **THEN** o documento é criado com esse colegiado, que é gravado ao salvar
