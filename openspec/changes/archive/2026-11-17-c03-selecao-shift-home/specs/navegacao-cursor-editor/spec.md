## ADDED Requirements

### Requirement: Seleção que alcança o rótulo fica no texto
Quando uma seleção com texto selecionado se estende até o rótulo do dispositivo ou outro elemento não editável do início da linha, o editor SHALL limitar o começo da seleção ao início do texto do dispositivo, em vez de desfazê-la. O fim da seleção e o sentido em que ela foi feita SHALL ser mantidos. O cursor sem seleção que cai nesses elementos SHALL continuar sendo levado ao início do texto.

#### Scenario: End seguido de Shift+Home
- **WHEN** o texto de um dispositivo ocupa uma linha na tela, o usuário tecla End e depois Shift+Home
- **THEN** todo o texto do dispositivo fica selecionado, sem o rótulo

#### Scenario: Home seguido de Shift+End
- **WHEN** o texto de um dispositivo ocupa uma linha na tela, o usuário tecla Home e depois Shift+End
- **THEN** todo o texto do dispositivo fica selecionado, como antes

#### Scenario: O sentido da seleção é mantido
- **WHEN** o usuário tecla End, Shift+Home e depois Shift+→
- **THEN** a seleção perde o primeiro caractere do texto e continua terminando no fim do texto

#### Scenario: Arrastar o mouse até o rótulo
- **WHEN** o usuário pressiona o botão do mouse no meio do texto de um dispositivo e o arrasta até o rótulo
- **THEN** fica selecionado o texto do início até o ponto onde o arrasto começou

#### Scenario: Cursor sem seleção no rótulo
- **WHEN** o cursor, sem seleção, cai no rótulo do dispositivo
- **THEN** o cursor vai para o início do texto, como antes
