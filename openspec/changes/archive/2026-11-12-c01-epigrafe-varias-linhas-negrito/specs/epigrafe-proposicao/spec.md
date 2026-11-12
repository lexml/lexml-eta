# Spec Delta

## ADDED Requirements

### Requirement: Negrito da primeira linha da epígrafe no editor
Na aba de texto, o editor SHALL exibir em negrito a primeira linha da epígrafe (o trecho anterior ao primeiro `br`, ou a epígrafe inteira quando não houver `br`) e SHALL exibir sem negrito as linhas seguintes. A formatação já presente no texto da epígrafe SHALL ser mantida. O negrito MUST ser apenas de exibição: o texto da epígrafe salvo e o entregue ao host MUST NOT ganhar formatação.

#### Scenario: Epígrafe com duas linhas
- **WHEN** a epígrafe é `EMENDA Nº        - CCJ (SUBSTITUTIVO)<br/>(ao Projeto de Lei nº 5.008, de 2023)`
- **THEN** o editor exibe `EMENDA Nº        - CCJ (SUBSTITUTIVO)` em negrito e, na linha de baixo, `(ao Projeto de Lei nº 5.008, de 2023)` sem negrito

#### Scenario: Epígrafe com mais de duas linhas
- **WHEN** a epígrafe tem dois `br`
- **THEN** só a primeira das três linhas é exibida em negrito

#### Scenario: Epígrafe de uma linha
- **WHEN** a epígrafe é `PROJETO DE LEI Nº 12, DE 2026`, sem `br`
- **THEN** o editor exibe a epígrafe inteira em negrito

#### Scenario: Formatação existente mantida
- **WHEN** a epígrafe tem um trecho em itálico na segunda linha
- **THEN** o trecho continua em itálico, e a segunda linha continua sem negrito

#### Scenario: Texto salvo sem negrito
- **WHEN** um documento cuja epígrafe tem um `br` é exibido e salvo
- **THEN** a epígrafe do arquivo salvo e a de `getProposicao()` têm o mesmo texto de antes da exibição, sem elemento de negrito acrescentado
