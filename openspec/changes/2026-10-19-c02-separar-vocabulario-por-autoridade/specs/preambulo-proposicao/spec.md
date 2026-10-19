## MODIFIED Requirements

### Requirement: Texto padrão do preâmbulo por tipo de proposição
O sistema SHALL preencher o preâmbulo com o texto padrão da combinação tipo + autoridade da URN da proposição sempre que ele estiver vazio, tanto em proposição nova quanto na abertura de um documento. O tipo SHALL ser lido da URN desconsiderada a sigla após o `;`. Uma combinação de tipo e autoridade fora das listadas abaixo SHALL NOT ter texto padrão.

#### Scenario: Textos padrão por tipo
- **WHEN** o preâmbulo está vazio e o tipo e a autoridade da URN formam uma das combinações abaixo
- **THEN** o preâmbulo recebe o texto correspondente:
  - `projeto.lei` (PL, PLS, PLC, PLN) em `senado.federal`, `camara.deputados` ou `congresso.nacional`: "O CONGRESSO NACIONAL decreta:"
  - `projeto.lei.complementar` (PLP) em `senado.federal` ou `camara.deputados`: "O CONGRESSO NACIONAL decreta:"
  - `projeto.lei.conversao` (PLV) em `congresso.nacional`: "O CONGRESSO NACIONAL decreta:"
  - `projeto.decreto.legislativo` (PDL, PDS, PDN) em `senado.federal`, `camara.deputados` ou `congresso.nacional`: "O CONGRESSO NACIONAL decreta:"
  - `proposta.emenda.constitucional` (PEC) em `senado.federal` ou `camara.deputados`: "As Mesas da Câmara dos Deputados e do Senado Federal, nos termos do § 3º do art. 60 da Constituição Federal, promulgam a seguinte Emenda ao texto constitucional:"
  - `medida.provisoria` (MPV) em `federal`: "O PRESIDENTE DA REPÚBLICA, no uso da atribuição que lhe confere o art. 62 da Constituição, adota a seguinte Medida Provisória, com força de lei:"

#### Scenario: Projeto de resolução conforme a autoridade
- **WHEN** o preâmbulo está vazio e o tipo da proposição é `projeto.resolucao`
- **THEN** o preâmbulo recebe o texto da autoridade da URN:
  - `senado.federal` (PRS): "O SENADO FEDERAL resolve:"
  - `camara.deputados` (PRC): "A CÂMARA DOS DEPUTADOS resolve:"
  - `congresso.nacional` (PRN): "O CONGRESSO NACIONAL resolve:"

#### Scenario: Projeto de resolução com autoridade desconhecida
- **WHEN** o preâmbulo está vazio, o tipo é `projeto.resolucao` e a autoridade não é uma das três acima
- **THEN** o preâmbulo permanece vazio e não é exibido

#### Scenario: Combinação de tipo e autoridade sem texto padrão
- **WHEN** o preâmbulo está vazio e a URN é, por exemplo, `urn:lex:br:senado.federal:projeto.lei.conversao;plv:2026;1` ou `urn:lex:br:senado.federal:medida.provisoria;mpv:2026;1`
- **THEN** o preâmbulo permanece vazio e não é exibido

#### Scenario: Sigla não influencia o texto
- **WHEN** duas proposições têm o mesmo tipo e autoridade e siglas diferentes (por exemplo `projeto.lei;pl` e `projeto.lei;pls` em `senado.federal`)
- **THEN** ambas recebem o mesmo texto padrão

#### Scenario: Proposição nova
- **WHEN** uma nova proposição de tipo com texto padrão para a sua autoridade é criada
- **THEN** o preâmbulo exibido é o texto padrão do tipo

#### Scenario: Abertura de documento com preâmbulo vazio
- **WHEN** um documento cuja combinação de tipo e autoridade tem texto padrão, e cujo preâmbulo está vazio, é aberto
- **THEN** o preâmbulo exibido é o texto padrão

#### Scenario: Tipo sem texto padrão
- **WHEN** o preâmbulo está vazio e o tipo não tem texto padrão
- **THEN** o preâmbulo permanece vazio e não é exibido
