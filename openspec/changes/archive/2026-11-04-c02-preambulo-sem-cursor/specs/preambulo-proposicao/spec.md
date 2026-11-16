## MODIFIED Requirements

### Requirement: Preâmbulo bloqueado e sem ações
O sistema SHALL tratar o preâmbulo como dispositivo bloqueado: o texto não pode ser alterado pelo usuário e nenhuma ação de edição da estrutura é oferecida sobre ele. O preâmbulo SHALL ser uma linha não editável, que não recebe o cursor (ver `navegacao-cursor-editor`).

#### Scenario: Tentativa de editar o texto
- **WHEN** o usuário tenta digitar, apagar, colar ou formatar texto no preâmbulo
- **THEN** o texto do preâmbulo permanece inalterado

#### Scenario: Menu de ações do preâmbulo
- **WHEN** o usuário aciona o menu da linha do preâmbulo
- **THEN** nenhuma ação de adicionar, remover, transformar, mover ou renumerar é oferecida, e o cursor não é posicionado no preâmbulo

#### Scenario: Cursor não entra no preâmbulo
- **WHEN** o usuário clica sobre o preâmbulo ou navega pelas setas entre a ementa e a articulação
- **THEN** o cursor nunca fica no preâmbulo
