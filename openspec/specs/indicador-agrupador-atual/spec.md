# indicador-agrupador-atual Specification

## Purpose
Indicador flutuante, sobre o topo da área do texto articulado, da cadeia de agrupadores (Parte a Subseção) do trecho exibido no topo, para o usuário saber em que parte do texto está ao rolar (issue #1080). Aparece só na rolagem do usuário, por alguns segundos, e é apenas informativo.

## Requirements

### Requirement: Indicador flutuante do agrupador atual
A área do texto articulado SHALL exibir um indicador flutuante com a cadeia de agrupadores (Parte, Livro, Título, Capítulo, Seção, Subseção) do dispositivo exibido no topo da área de texto, do mais externo ao mais interno, com os rótulos como aparecem no texto, separados por "›". O indicador SHALL ficar centralizado sobre o topo da área de texto e fora do conteúdo do Quill (não faz parte do documento editado). Quando o dispositivo do topo é um agrupador, a cadeia SHALL terminar nele.

#### Scenario: Artigo dentro de seção
- **WHEN** o primeiro dispositivo visível no topo da área de texto é um artigo da Seção I do Capítulo II do Título II
- **THEN** o indicador mostra "TÍTULO II › CAPÍTULO II › Seção I"

#### Scenario: Agrupador no topo
- **WHEN** o primeiro dispositivo visível no topo é a linha do "CAPÍTULO II" do Título I
- **THEN** o indicador mostra "TÍTULO I › CAPÍTULO II"

#### Scenario: Dispositivo filho de artigo
- **WHEN** o primeiro dispositivo visível no topo é um inciso ou parágrafo de um artigo do Capítulo I
- **THEN** o indicador mostra a cadeia do artigo, terminando em "CAPÍTULO I"

#### Scenario: Fora do conteúdo do Quill
- **WHEN** o indicador é exibido
- **THEN** ele não está dentro do container do Quill e não altera o conteúdo nem o tamanho do documento

### Requirement: Exibição temporária após a rolagem
O indicador SHALL aparecer somente quando a área de texto é rolada e SHALL desaparecer suavemente 3 segundos depois da última rolagem. Ele SHALL NOT aparecer ao abrir o documento, ao trocar de página nem ao editar; só volta a aparecer numa nova rolagem.

#### Scenario: Aparece ao rolar
- **WHEN** o usuário rola o texto até um artigo do Capítulo II
- **THEN** o indicador aparece com "TÍTULO I › CAPÍTULO II"

#### Scenario: Some depois de 3 segundos
- **WHEN** passam 3 segundos desde a última rolagem
- **THEN** o indicador desaparece com uma transição suave

#### Scenario: Rolagem contínua
- **WHEN** o usuário continua rolando antes de completar 3 segundos
- **THEN** o indicador continua visível e os 3 segundos contam a partir da última rolagem

#### Scenario: Abertura do documento
- **WHEN** o documento é aberto ou uma página da articulação é carregada, sem rolagem
- **THEN** o indicador não é exibido

### Requirement: Atualização do indicador
A cadeia do indicador SHALL ser recalculada a cada rolagem e depois de cada alteração do documento, de modo que reflita sempre os rótulos atuais (inclusive após renumeração, inclusão, exclusão ou transformação de agrupadores). A alteração do documento SHALL NOT exibir o indicador nem prolongar o tempo em que ele fica visível.

#### Scenario: Rolar até outro capítulo
- **WHEN** o indicador mostra "TÍTULO I › CAPÍTULO I" e o usuário rola o texto até que um artigo do Capítulo II fique no topo
- **THEN** o indicador passa a mostrar "TÍTULO I › CAPÍTULO II"

#### Scenario: Renumeração de agrupador
- **WHEN** o usuário inclui um capítulo antes do "CAPÍTULO II", renumerando-o para "CAPÍTULO III", e depois rola o texto com um artigo dele no topo
- **THEN** o indicador mostra "CAPÍTULO III"

### Requirement: Indicador oculto fora de agrupador
O indicador SHALL ficar oculto, mesmo durante a rolagem, quando o dispositivo do topo da área de texto não está sob nenhum agrupador: epígrafe, ementa, preâmbulo, artigos anteriores ao primeiro agrupador ou documento sem agrupadores.

#### Scenario: Documento sem agrupadores
- **WHEN** o documento não tem nenhum agrupador e o usuário rola o texto
- **THEN** o indicador não é exibido

#### Scenario: Ementa no topo
- **WHEN** o documento tem agrupadores e o usuário rola o texto até a ementa ficar no topo
- **THEN** o indicador não é exibido

### Requirement: Agrupadores de bloco de alteração fora da cadeia
A cadeia do indicador SHALL considerar apenas os agrupadores da própria proposição. Agrupadores dentro de um bloco de alteração (texto da norma alterada) SHALL ser ignorados; um dispositivo de bloco de alteração no topo SHALL mostrar a cadeia do artigo que contém o bloco.

#### Scenario: Capítulo citado em bloco de alteração
- **WHEN** o topo da área de texto é um artigo de bloco de alteração, sob um "CAPÍTULO V-A" da norma alterada, e o artigo que contém o bloco está no Capítulo I da proposição
- **THEN** o indicador mostra a cadeia terminando em "CAPÍTULO I", sem "CAPÍTULO V-A"

### Requirement: Indicador sem interação
O indicador SHALL ser apenas informativo: os níveis não são links nem botões, e o indicador SHALL NOT capturar o mouse, de modo que o clique sobre ele chegue ao texto que está embaixo.

#### Scenario: Clique sobre o indicador
- **WHEN** o indicador está visível sobre a primeira linha do texto e o usuário clica nele
- **THEN** o clique chega à linha do texto embaixo, como se o indicador não existisse

### Requirement: Mesmo conteúdo em qualquer largura
O indicador SHALL exibir todos os níveis da cadeia em qualquer largura de tela, inclusive em celulares. Quando a cadeia não couber na largura da área de texto, o texto SHALL quebrar em mais de uma linha, sem cortar níveis.

#### Scenario: Celular
- **WHEN** a tela tem 768px de largura ou menos e o topo é um artigo da Seção I do Capítulo II do Título II
- **THEN** o indicador mostra "TÍTULO II › CAPÍTULO II › Seção I"
