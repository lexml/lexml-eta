## ADDED Requirements

### Requirement: End e Shift+End ficam no texto do dispositivo
A tecla End SHALL levar o cursor ao fim da linha visual em que ele está, sem passar do fim do texto do dispositivo: quando a linha termina com elementos que não são do texto, como o fecho de aspas e a nota de alteração, o cursor SHALL ir para o fim do texto. Shift+End SHALL estender a seleção pelo mesmo critério, mantendo o ponto onde ela começou. Ctrl+End SHALL continuar levando ao fim da proposição.

#### Scenario: End em linha com nota de alteração
- **WHEN** o texto de um dispositivo que fecha as aspas termina na mesma linha da tela que o `”` e a nota `(NR)`, o cursor está nessa linha e o usuário tecla End
- **THEN** o cursor vai para o fim do texto do dispositivo, que continua sendo a linha atual

#### Scenario: Shift+End em linha com nota de alteração
- **WHEN** o cursor está no meio da última linha, na tela, do texto de um dispositivo que termina com o `”` e a nota `(NR)`, e o usuário tecla Shift+End
- **THEN** fica selecionado o texto do ponto onde estava o cursor até o fim do texto, sem o `”` nem a nota, e a linha atual não muda

#### Scenario: End numa linha do texto que não é a última na tela
- **WHEN** o texto de um dispositivo ocupa várias linhas na tela, o cursor está na primeira delas e o usuário tecla End
- **THEN** o cursor vai para o fim dessa linha da tela, dentro do texto, como antes

#### Scenario: End em linha sem nota de alteração
- **WHEN** o texto de um dispositivo sem fecho de aspas ocupa uma linha na tela e o usuário tecla End
- **THEN** o cursor vai para o fim do texto, como antes
