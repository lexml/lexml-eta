## ADDED Requirements

### Requirement: Vocabulário organizado por autoridade
O sistema SHALL organizar o vocabulário de URN em um conjunto de definições por autoridade (`federal`, `senado.federal`, `camara.deputados` e `congresso.nacional`) mais uma definição comum, mescladas em um único vocabulário interno. Todo item de `autoridades`, `tiposDocumento`, `siglas`, `fakeUrns` e `preambulosPadrao` vindo de uma definição de autoridade SHALL ter essa autoridade associada; a definição comum SHALL conter apenas `atalhosUrn` e `eventos`, sem autoridade carimbada.

#### Scenario: Item de autoridade recebe a autoridade na mesclagem
- **WHEN** o vocabulário mesclado é consultado por um tipo declarado na definição do Senado
- **THEN** a entrada correspondente tem `urnAutoridade` igual a `senado.federal`

#### Scenario: Tipo usado por mais de uma autoridade
- **WHEN** o vocabulário mesclado é consultado por `decreto.legislativo`
- **THEN** existe uma entrada para cada uma de `senado.federal`, `camara.deputados` e `congresso.nacional`

#### Scenario: Definição comum não é carimbada
- **WHEN** o vocabulário mesclado é consultado por `eventos`
- **THEN** os itens não têm `urnAutoridade` acrescentada pela mesclagem

#### Scenario: Vocabulário fora da API pública
- **WHEN** o pacote é consumido por um host
- **THEN** o vocabulário mesclado não é exportado pelo ponto de entrada do pacote

### Requirement: Autoridade da URN gerada para proposição nova
O sistema SHALL gerar a URN de uma proposição nova a partir da sigla informada pelo host, usando a autoridade e o tipo da entrada de `fakeUrns` dessa sigla. Cada sigla SHALL ter exatamente uma entrada.

#### Scenario: Medida provisória é federal
- **WHEN** uma proposição nova é criada com a sigla `MPV`
- **THEN** a URN gerada é `urn:lex:br:federal:medida.provisoria;mpv:9999;999999`, com número e ano provisórios quando não informados

#### Scenario: Projeto de lei de conversão é do Congresso
- **WHEN** uma proposição nova é criada com a sigla `PLV`
- **THEN** a URN gerada tem autoridade `congresso.nacional` e tipo `projeto.lei.conversao;plv`

#### Scenario: Projeto de resolução da Câmara
- **WHEN** uma proposição nova é criada com a sigla `PRC`
- **THEN** a URN gerada tem autoridade `camara.deputados` e tipo `projeto.resolucao;prc`

#### Scenario: Siglas do Senado inalteradas
- **WHEN** uma proposição nova é criada com qualquer uma das siglas `PEC`, `PL`, `PLS`, `PLP`, `PLC`, `PRS`, `PDS`, `PDL`, `SCD` ou `ECD`
- **THEN** a URN gerada tem autoridade `senado.federal`

#### Scenario: Sigla desconhecida
- **WHEN** uma proposição nova é criada com uma sigla ausente do vocabulário
- **THEN** a geração da URN falha com a mensagem de que a sigla não foi encontrada no vocabulário

### Requirement: Resolução de tipo pela autoridade da URN
O sistema SHALL resolver o tipo de documento de uma URN preferindo a entrada cuja autoridade seja a da URN e, na ausência dela, SHALL usar qualquer entrada de mesma URN de tipo, na ordem de mesclagem (comum, `federal`, `senado.federal`, `camara.deputados`, `congresso.nacional`). Um tipo inexistente em todas as autoridades SHALL continuar sem resolução.

#### Scenario: Entrada da própria autoridade
- **WHEN** o tipo é resolvido para `urn:lex:br:camara.deputados:projeto.resolucao;prc:2026;1`
- **THEN** o resultado é a entrada de `projeto.resolucao;prc` da Câmara dos Deputados

#### Scenario: Fallback para outra autoridade
- **WHEN** o tipo é resolvido para `urn:lex:br:senado.federal:projeto.lei.conversao;plv:2026;1` e `projeto.lei.conversao;plv` só existe no Congresso Nacional
- **THEN** o resultado é a entrada do Congresso Nacional, com a mesma descrição e o mesmo gênero

#### Scenario: Norma referenciada de autoridade não declarada para o tipo
- **WHEN** o tipo é resolvido para `urn:lex:br:camara.deputados:lei:2020-01-01;1`, com `lei` declarada só em `federal`
- **THEN** o resultado é a entrada de `lei` de `federal`

#### Scenario: Tipo desconhecido
- **WHEN** o tipo é resolvido para uma URN cujo tipo não existe em nenhuma autoridade
- **THEN** não há resultado, e a validação da URN falha

### Requirement: Sigla derivada do tipo e da autoridade da URN
O sistema SHALL obter a sigla de uma URN pelo tipo resolvido, preferindo a entrada de sigla da autoridade da URN, e SHALL devolver texto vazio quando o tipo não tiver sigla.

#### Scenario: Sigla de proposição
- **WHEN** a sigla é obtida para `urn:lex:br:senado.federal:projeto.lei;pls:2026;1`
- **THEN** o resultado é `PLS`

#### Scenario: Sigla de medida provisória federal
- **WHEN** a sigla é obtida para `urn:lex:br:federal:medida.provisoria;mpv:2020;930`
- **THEN** o resultado é `MPV`

#### Scenario: Tipo sem sigla
- **WHEN** a sigla é obtida para `urn:lex:br:federal:lei:2020-01-01;1`
- **THEN** o resultado é texto vazio
