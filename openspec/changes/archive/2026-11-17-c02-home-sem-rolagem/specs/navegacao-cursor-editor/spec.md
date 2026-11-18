## ADDED Requirements

### Requirement: Reposicionar o cursor não rola a tela
Quando o editor reposiciona o cursor dentro da área visível, como ao devolvê-lo do rótulo ao início do texto, a tela SHALL NOT rolar. A tecla Home SHALL levar o cursor ao início da linha visual em que ele está, e na primeira linha do dispositivo ao início do texto, sem alterar a rolagem. Ctrl+Home e Ctrl+End SHALL continuar levando ao início e ao fim da proposição, com a rolagem correspondente.

#### Scenario: Home no meio do texto de um dispositivo
- **WHEN** a proposição é maior que a tela, o usuário rola até o meio dela, clica no meio do texto de um dispositivo e tecla Home
- **THEN** o cursor vai para o início do texto do dispositivo, e a tela continua na mesma posição

#### Scenario: Home repetido em pontos diferentes da proposição
- **WHEN** o usuário repete, em várias posições de rolagem, o clique no meio de um dispositivo seguido de Home
- **THEN** em nenhuma das vezes a tela rola para o início da proposição

#### Scenario: Ctrl+Home
- **WHEN** o cursor está no meio da proposição e o usuário tecla Ctrl+Home
- **THEN** o cursor vai para o início do primeiro dispositivo e a tela rola para o início, como antes
