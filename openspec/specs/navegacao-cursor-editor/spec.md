# navegacao-cursor-editor Specification

## Purpose

Definir em quais linhas do editor da articulação o cursor pode ficar e como as setas o movem entre elas, pulando as linhas não editáveis, como a epígrafe e o preâmbulo, onde o cursor fica depois do Enter que cria dispositivo, que reposicionar o cursor, como pela tecla Home, não rola a tela, como fica a seleção que alcança o rótulo do dispositivo e que ↓ e ↑ levam ao dispositivo vizinho, mesmo vazio.

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

### Requirement: Cursor depois do Enter que cria dispositivo
Quando o Enter cria um dispositivo a partir de um artigo, parágrafo, inciso, alínea ou item, o editor SHALL deixar o cursor no dispositivo que ficou com o texto depois do ponto do cursor. Com o cursor no início do texto, o dispositivo vazio é criado antes do atual, e o cursor SHALL ficar no início do dispositivo atual, que manteve o texto e foi renumerado. Refazer essa inclusão SHALL deixar o cursor no mesmo dispositivo. As opções "Adicionar … antes" do menu SHALL continuar levando o cursor ao dispositivo novo.

#### Scenario: Enter no início do texto de um artigo
- **WHEN** o cursor está no início do texto do Art. 4º, que tem texto, e o usuário tecla Enter
- **THEN** um Art. 4º vazio é criado, o artigo com o texto passa a ser o Art. 5º, e o cursor fica no início do texto do Art. 5º, que é a linha atual

#### Scenario: Enter no início do texto de um parágrafo
- **WHEN** o cursor está no início do texto do § 1º, que tem texto, e o usuário tecla Enter
- **THEN** um § 1º vazio é criado, o parágrafo com o texto passa a ser o § 2º, e o cursor fica no início do texto do § 2º

#### Scenario: Enter no meio do texto
- **WHEN** o cursor está no meio do texto do Art. 3º e o usuário tecla Enter
- **THEN** o texto depois do cursor vai para o novo Art. 4º, e o cursor fica no início do Art. 4º, como antes

#### Scenario: Enter no fim do texto
- **WHEN** o cursor está no fim do texto do Art. 4º e o usuário tecla Enter
- **THEN** um Art. 5º vazio é criado e o cursor fica nele, como antes

#### Scenario: Refazer o Enter no início do texto
- **WHEN** o usuário tecla Enter no início do texto do Art. 4º, desfaz e refaz
- **THEN** depois de refazer, o cursor fica no artigo com o texto (Art. 5º)

#### Scenario: Adicionar artigo antes pelo menu
- **WHEN** o usuário escolhe "Adicionar artigo antes" no menu do Art. 4º
- **THEN** um Art. 4º vazio é criado e o cursor fica nele, como antes

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

### Requirement: Cursor depois de excluir um dispositivo
Depois de excluir um dispositivo pelo comando de exclusão ou pela tecla Delete numa linha vazia, o cursor SHALL ir para o início do texto da primeira linha editável abaixo do excluído e dos seus descendentes, que passa a ser a linha atual. Sem linha editável abaixo, o cursor SHALL ir para o início do texto do dispositivo acima; quando essa linha não é editável, como o preâmbulo, SHALL ir para a primeira linha editável abaixo dela. Backspace numa linha vazia SHALL levar o cursor ao fim da linha de cima.

#### Scenario: Excluir um artigo do meio
- **WHEN** o documento tem os Arts. 10 a 12 e o usuário exclui o Art. 11
- **THEN** o cursor vai para o início do texto do novo Art. 11 (antigo Art. 12), que fica marcado como linha atual

#### Scenario: Excluir um artigo que não é o primeiro
- **WHEN** o documento tem os Arts. 1º a 4º e o usuário exclui o Art. 4º, o último
- **THEN** o cursor vai para o Art. 3º, que fica marcado como linha atual, porque não há linha editável abaixo

#### Scenario: Excluir o primeiro artigo depois do preâmbulo
- **WHEN** o documento tem preâmbulo e os Arts. 1º a 3º, e o usuário exclui o Art. 1º
- **THEN** o cursor vai para o início do texto do novo Art. 1º (antigo Art. 2º), que fica marcado como linha atual, e não para o preâmbulo

#### Scenario: Excluir um artigo com parágrafos
- **WHEN** o Art. 2º tem parágrafos, é seguido pelo Art. 3º, e o usuário exclui o Art. 2º
- **THEN** o cursor vai para o início do texto do novo Art. 2º (antigo Art. 3º)

#### Scenario: Delete numa linha vazia
- **WHEN** o cursor está num dispositivo sem texto, seguido de outro dispositivo, e o usuário tecla Delete
- **THEN** o dispositivo é excluído e o cursor vai para o início do texto do dispositivo seguinte

#### Scenario: Backspace numa linha vazia
- **WHEN** o cursor está num dispositivo sem texto e o usuário tecla Backspace
- **THEN** o dispositivo é excluído e o cursor vai para o fim do texto do dispositivo acima

#### Scenario: Excluir em modo de revisão
- **WHEN** a revisão está ativa, o documento tem os Arts. 1º a 3º e o usuário exclui o Art. 2º
- **THEN** a linha do Art. 2º continua na tela marcada como excluída e o cursor vai para o início do texto do Art. 3º
