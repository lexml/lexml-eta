## ADDED Requirements

### Requirement: Setas para cima e para baixo vão ao dispositivo vizinho
Com o cursor na última linha do texto de um dispositivo na tela, ↓ SHALL levar o cursor ao dispositivo editável imediatamente abaixo, tenha ele texto ou não; com o cursor na primeira linha, ↑ SHALL levar ao imediatamente acima. O cursor SHALL ficar na mesma posição horizontal, na primeira linha do texto do destino (↓) ou na última (↑); se o texto do destino não alcança essa posição, no fim dele, e se está vazio, no início. Dentro de um texto com várias linhas na tela, ↓ e ↑ SHALL continuar movendo o cursor entre as linhas do mesmo texto.

#### Scenario: Seta para baixo com o dispositivo seguinte vazio
- **WHEN** os Arts. 3º e 4º estão vazios, o cursor está no meio do texto do Art. 2º e o usuário tecla ↓
- **THEN** o cursor vai para o Art. 3º

#### Scenario: Seta para cima com o dispositivo anterior vazio
- **WHEN** os Arts. 3º e 4º estão vazios, o cursor está no meio do texto do Art. 5º e o usuário tecla ↑
- **THEN** o cursor vai para o Art. 4º

#### Scenario: Seta para baixo mantém a posição horizontal
- **WHEN** o cursor está no meio do texto de um artigo e o artigo seguinte tem texto mais longo que essa posição
- **THEN** ↓ leva o cursor ao ponto do texto do artigo seguinte que fica logo abaixo, como antes

#### Scenario: Texto do destino mais curto
- **WHEN** o cursor está no fim da linha de um texto longo e o texto do artigo seguinte é mais curto que essa posição
- **THEN** ↓ leva o cursor ao fim do texto do artigo seguinte

#### Scenario: Texto com várias linhas
- **WHEN** o texto de um artigo ocupa várias linhas na tela e o cursor está na primeira delas
- **THEN** ↓ leva o cursor à linha seguinte do mesmo texto
