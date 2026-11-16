## MODIFIED Requirements

### Requirement: Aba de anexos
O sistema SHALL exibir a aba "Anexos" imediatamente antes da aba "Avisos", com o número de anexos no rótulo quando houver ao menos um. A aba SHALL aparecer também no modo anexo de parecer. O editor SHALL NOT ter nenhum botão de anexo na barra de ferramentas.

#### Scenario: Aba antes de Avisos
- **WHEN** o editor é inicializado
- **THEN** a aba "Anexos" é exibida entre "Dados da proposição" e "Avisos"

#### Scenario: Contador no rótulo
- **WHEN** a lista tem três anexos
- **THEN** o rótulo da aba indica 3 anexos; sem anexos, o rótulo não traz número

#### Scenario: Modo anexo de parecer
- **WHEN** o editor é inicializado com um documento no modo anexo de parecer
- **THEN** a aba "Anexos" é exibida

#### Scenario: Sem botão na barra de ferramentas
- **WHEN** o editor é inicializado
- **THEN** a barra de ferramentas do texto não tem o botão de anexo
