## ADDED Requirements

### Requirement: Remissão externa na ementa
A ementa SHALL ter remissão externa como os dispositivos: a detecção automática SHALL criar o link ao sair da linha da ementa, e as remissões externas da ementa SHALL ser gravadas no texto da ementa ao salvar e reconstruídas ao abrir. O preâmbulo SHALL continuar sem detecção automática.

#### Scenario: Citação na ementa vira link ao sair da linha
- **WHEN** a ementa contém "Altera a Lei nº 12.965, de 23 de abril de 2014, para…" e o usuário sai da linha da ementa
- **THEN** o sistema cria o link da citação na ementa, apontando para a URN da Lei nº 12.965, de 2014

#### Scenario: Link da ementa sobrevive a salvar e abrir
- **WHEN** a ementa tem um link de remissão externa criado na sessão e o documento é salvo e reaberto
- **THEN** a ementa reaberta tem o link, com a mesma URN e o mesmo texto

#### Scenario: Preâmbulo sem detecção
- **WHEN** o preâmbulo contém citação a norma externa, como a do art. 60 da Constituição no texto padrão da PEC
- **THEN** a citação não vira link
