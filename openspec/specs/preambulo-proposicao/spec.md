# preambulo-proposicao Specification

## Purpose

Exibir o preâmbulo da proposição como um dispositivo somente leitura entre a ementa e a articulação, e preenchê-lo com o texto padrão do tipo da proposição quando estiver vazio.

## Requirements

### Requirement: Exibição do preâmbulo entre a ementa e a articulação
O sistema SHALL exibir o preâmbulo, quando existir, como uma linha própria do editor posicionada depois da ementa e antes do primeiro dispositivo da articulação.

#### Scenario: Preâmbulo exibido na ordem correta
- **WHEN** um documento com ementa, preâmbulo e articulação é aberto
- **THEN** o editor exibe, nesta ordem, a ementa, o preâmbulo e o primeiro dispositivo da articulação

#### Scenario: Preâmbulo vazio sem texto padrão não é exibido
- **WHEN** um documento cujo preâmbulo está vazio e cujo tipo não tem texto padrão é aberto
- **THEN** o editor não exibe linha de preâmbulo e o documento é carregado normalmente

### Requirement: Preâmbulo bloqueado e sem ações
O sistema SHALL tratar o preâmbulo como dispositivo bloqueado: o texto não pode ser alterado pelo usuário e nenhuma ação de edição da estrutura é oferecida sobre ele.

#### Scenario: Tentativa de editar o texto
- **WHEN** o usuário tenta digitar, apagar, colar ou formatar texto no preâmbulo
- **THEN** o texto do preâmbulo permanece inalterado

#### Scenario: Menu de ações do preâmbulo
- **WHEN** o cursor está no preâmbulo
- **THEN** nenhuma ação de adicionar, remover, transformar, mover ou renumerar é oferecida

### Requirement: Inserção de novos dispositivos depois do preâmbulo
O sistema SHALL inserir o dispositivo criado a partir da ementa, ou antes do primeiro dispositivo da articulação, depois do preâmbulo, mantendo-o entre a ementa e a articulação.

#### Scenario: Adicionar artigo a partir da ementa
- **WHEN** o usuário adiciona um artigo depois da ementa em um documento com preâmbulo
- **THEN** o novo artigo é o primeiro da articulação e aparece depois do preâmbulo

#### Scenario: Adicionar agrupador a partir da ementa
- **WHEN** o usuário adiciona um agrupador depois da ementa em um documento com preâmbulo
- **THEN** o novo agrupador é o primeiro da articulação e aparece depois do preâmbulo

### Requirement: Texto padrão do preâmbulo por tipo de proposição
O sistema SHALL preencher o preâmbulo com o texto padrão do tipo da proposição sempre que ele estiver vazio, tanto em proposição nova quanto na abertura de um documento.

#### Scenario: Textos padrão por tipo
- **WHEN** o preâmbulo está vazio e o tipo da proposição na URN (desconsiderada a sigla após o `;`) é um dos listados abaixo
- **THEN** o preâmbulo recebe o texto correspondente:
  - `projeto.lei`, `projeto.lei.complementar`, `projeto.lei.conversao` e `projeto.decreto.legislativo` (PL, PLS, PLC, PLN, PLP, PLV, PDL, PDS e PDN): "O CONGRESSO NACIONAL decreta:"
  - `proposta.emenda.constitucional` (PEC): "As Mesas da Câmara dos Deputados e do Senado Federal, nos termos do § 3º do art. 60 da Constituição Federal, promulgam a seguinte Emenda ao texto constitucional:"
  - `medida.provisoria` (MPV): "O PRESIDENTE DA REPÚBLICA, no uso da atribuição que lhe confere o art. 62 da Constituição, adota a seguinte Medida Provisória, com força de lei:"

#### Scenario: Projeto de resolução conforme a autoridade
- **WHEN** o preâmbulo está vazio e o tipo da proposição é `projeto.resolucao`
- **THEN** o preâmbulo recebe o texto da autoridade da URN:
  - `senado.federal` (PRS): "O SENADO FEDERAL resolve:"
  - `camara.deputados` (PRC): "A CÂMARA DOS DEPUTADOS resolve:"
  - `congresso.nacional` (PRN): "O CONGRESSO NACIONAL resolve:"

#### Scenario: Projeto de resolução com autoridade desconhecida
- **WHEN** o preâmbulo está vazio, o tipo é `projeto.resolucao` e a autoridade não é uma das três acima
- **THEN** o preâmbulo permanece vazio e não é exibido

#### Scenario: Sigla não influencia o texto
- **WHEN** duas proposições têm o mesmo tipo e autoridade e siglas diferentes (por exemplo `projeto.lei;pl` e `projeto.lei;pls`)
- **THEN** ambas recebem o mesmo texto padrão

#### Scenario: Proposição nova
- **WHEN** uma nova proposição de tipo com texto padrão é criada
- **THEN** o preâmbulo exibido é o texto padrão do tipo

#### Scenario: Abertura de documento com preâmbulo vazio
- **WHEN** um documento de tipo com texto padrão, cujo preâmbulo está vazio, é aberto
- **THEN** o preâmbulo exibido é o texto padrão do tipo

#### Scenario: Tipo sem texto padrão
- **WHEN** o preâmbulo está vazio e o tipo não tem texto padrão
- **THEN** o preâmbulo permanece vazio e não é exibido

### Requirement: Preâmbulo preenchido prevalece sobre o texto padrão
O sistema SHALL exibir o preâmbulo existente no documento, sem substituí-lo pelo texto padrão, mesmo que o texto seja diferente do padrão do tipo, inclusive em normas.

#### Scenario: Preâmbulo diferente do padrão
- **WHEN** um documento de tipo com texto padrão tem um preâmbulo preenchido com outro texto
- **THEN** o editor exibe o texto do documento

#### Scenario: Norma com preâmbulo
- **WHEN** uma norma com preâmbulo preenchido é aberta
- **THEN** o editor exibe esse preâmbulo

#### Scenario: Norma sem preâmbulo
- **WHEN** uma norma com preâmbulo vazio é aberta
- **THEN** nenhum preâmbulo é exibido nem preenchido

### Requirement: Salvamento do preâmbulo exibido
O sistema SHALL gravar no arquivo salvo o texto do preâmbulo exibido, inclusive o texto padrão aplicado, e preservar os parágrafos de um preâmbulo com mais de um parágrafo.

#### Scenario: Texto padrão gravado ao salvar
- **WHEN** um documento que recebeu o texto padrão é salvo e reaberto
- **THEN** o preâmbulo do arquivo contém o texto padrão e é exibido igual

#### Scenario: Preâmbulo com mais de um parágrafo
- **WHEN** um documento cujo preâmbulo tem dois parágrafos é aberto e salvo
- **THEN** o arquivo salvo contém os dois parágrafos, na mesma ordem
