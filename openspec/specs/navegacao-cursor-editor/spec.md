# navegacao-cursor-editor Specification

## Purpose

Definir em quais linhas do editor da articulação o cursor pode ficar e como as setas o movem entre elas, pulando as linhas não editáveis, como a epígrafe e o preâmbulo.

## Requirements

### Requirement: Linhas não editáveis não recebem o cursor
O editor SHALL tratar como não editáveis a linha da epígrafe e a do preâmbulo. Uma linha não editável SHALL NOT receber o cursor nem ser marcada como linha atual, qualquer que seja a origem da seleção (clique, teclado ou menu da linha). Quando a seleção cair numa linha não editável, o cursor SHALL voltar para onde estava antes.

#### Scenario: Clique sobre o preâmbulo
- **WHEN** o cursor está no Art. 1º e o usuário clica sobre o texto do preâmbulo
- **THEN** o cursor continua no Art. 1º, e o preâmbulo não é marcado como linha atual

#### Scenario: Clique sobre a epígrafe
- **WHEN** o cursor está na ementa e o usuário clica sobre a epígrafe
- **THEN** o cursor continua na ementa, e a epígrafe não é marcada como linha atual

#### Scenario: Seleção levada ao preâmbulo por outro caminho
- **WHEN** a seleção do editor é posicionada dentro do preâmbulo sem passar pelas setas, por exemplo pelo menu da linha
- **THEN** o cursor volta para a posição anterior, e a linha atual não muda

### Requirement: Setas pulam as linhas não editáveis
Ao sair de uma linha pelas setas, o editor SHALL levar o cursor à linha editável seguinte (↓ e →) ou anterior (↑ e ←), pulando as não editáveis. As setas ↓ e → SHALL levar ao início dessa linha, e ↑ e ← ao fim. Se não houver linha editável nessa direção, o cursor SHALL ficar onde está.

#### Scenario: Seta para baixo no fim da ementa
- **WHEN** o documento tem preâmbulo, o cursor está no fim da ementa e o usuário tecla ↓
- **THEN** o cursor vai para o início do primeiro dispositivo da articulação, e o preâmbulo é pulado

#### Scenario: Seta para a direita no fim da ementa
- **WHEN** o documento tem preâmbulo, o cursor está no fim da ementa e o usuário tecla →
- **THEN** o cursor vai para o início do primeiro dispositivo da articulação

#### Scenario: Seta para cima no início do primeiro dispositivo
- **WHEN** o documento tem preâmbulo, o cursor está no início do Art. 1º e o usuário tecla ↑
- **THEN** o cursor vai para o fim da ementa, e o preâmbulo é pulado

#### Scenario: Seta para a esquerda no início do primeiro dispositivo
- **WHEN** o documento tem preâmbulo, o cursor está no início do Art. 1º e o usuário tecla ←
- **THEN** o cursor vai para o fim da ementa

#### Scenario: Seta para cima no início da ementa
- **WHEN** o cursor está no início da ementa e o usuário tecla ↑ ou ←
- **THEN** o cursor continua no início da ementa, sem entrar na epígrafe

#### Scenario: Documento sem preâmbulo
- **WHEN** o documento não tem preâmbulo, o cursor está no fim da ementa e o usuário tecla ↓
- **THEN** o cursor vai para o início do primeiro dispositivo da articulação, como antes
