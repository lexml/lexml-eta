# vocabulario-urn

## Purpose
Definir o vocabulário de URN do editor, separado por autoridade (federal, senado, câmara, congresso e comum), mesclado em uma visão completa (todas as autoridades, para resolver tipo, sigla e autoridade de uma URN) e em uma visão da casa legislativa do editor (para as consultas sem autoridade), e recusar documento de outra casa ao iniciar a edição.

## Requirements

### Requirement: Vocabulário por autoridade e por casa legislativa do editor
O sistema SHALL organizar o vocabulário de URN em definições por autoridade (`federal`, `senado.federal`, `camara.deputados` e `congresso.nacional`) mais uma definição comum (`atalhosUrn` e `eventos`), e SHALL mesclá-las em duas visões:
- a **visão completa**, com todas as autoridades, independente da casa do editor;
- a **visão da casa**, com as autoridades da casa legislativa do editor: `SF` com `federal`, `senado.federal` e `congresso.nacional`; `CD` com `federal`, `camara.deputados` e `congresso.nacional`.

A visão da casa SHALL NOT conter tipos exclusivos da outra casa. As consultas que partem de uma URN SHALL usar a visão completa; as consultas sem autoridade (tipo pela sigla, tipos ativos e inativos) SHALL usar a visão da casa. Todo tipo de documento SHALL ter, após a mesclagem, a autoridade da definição de onde veio.

#### Scenario: Vocabulário do Senado
- **WHEN** a visão da casa é montada para `SF`
- **THEN** ela contém tipos de `senado.federal`, `congresso.nacional` e `federal`, e nenhum de `camara.deputados`

#### Scenario: Vocabulário da Câmara
- **WHEN** a visão da casa é montada para `CD`
- **THEN** ela contém tipos de `camara.deputados`, `congresso.nacional` e `federal`, e nenhum de `senado.federal`

#### Scenario: Visão completa
- **WHEN** a visão completa é consultada, com qualquer casa do editor
- **THEN** ela contém tipos das quatro autoridades

#### Scenario: Item recebe a autoridade na mesclagem
- **WHEN** o vocabulário é consultado por um tipo declarado na definição do Senado
- **THEN** a entrada tem `urnAutoridade` igual a `senado.federal`

#### Scenario: Tipo repetido em mais de uma autoridade
- **WHEN** o vocabulário é consultado por `decreto.legislativo` ou `resolucao`
- **THEN** existe uma entrada para cada autoridade que o declara, com descrição e gênero idênticos

#### Scenario: Vocabulário fora da API pública
- **WHEN** o pacote é consumido por um host
- **THEN** nenhuma das visões do vocabulário é exportada pelo ponto de entrada do pacote

### Requirement: Casa legislativa do editor e inicialização do vocabulário
O sistema SHALL selecionar a visão da casa pela propriedade `casaLegislativaEditor` de `LexmlEtaConfig` (`SF` ou `CD`), distinta de `casaLegislativa` (casa do documento). As visões SHALL ficar em variável estática, e a visão da casa SHALL ser (re)inicializada pelo `LexmlEtaComponent` sempre que `lexmlEtaConfig` for atribuída; a visão completa não depende da casa. Valor ausente ou inválido SHALL assumir `SF` e registrar um aviso. A casa do editor SHALL vir só da configuração, nunca da URN.

#### Scenario: Configuração com a Câmara
- **WHEN** `lexmlEtaConfig` é atribuída com `casaLegislativaEditor` igual a `CD`
- **THEN** as consultas sem autoridade passam a usar a visão da casa de `CD`

#### Scenario: Reatribuição da configuração
- **WHEN** `lexmlEtaConfig` é atribuída novamente com outra casa
- **THEN** a visão da casa é montada de novo para a nova casa, e a resolução por URN não muda

#### Scenario: Casa ausente ou inválida
- **WHEN** `casaLegislativaEditor` está ausente ou tem valor diferente de `SF` e `CD`
- **THEN** a visão da casa de `SF` é usada e um aviso é registrado

#### Scenario: Casa do documento independente
- **WHEN** `casaLegislativaEditor` é `SF` e a casa do documento (`casaLegislativa`) é `CN`
- **THEN** a visão da casa continua a de `SF` e a casa do documento não é alterada

### Requirement: Tipo de documento e sua chave
O sistema SHALL representar cada tipo de documento com `urnTipoDocumento` (tipo sem sigla), `sigla` opcional em maiúsculas (só em proposições), `descricao`, `genero`, `ativo` (padrão `true`) e `tipoRelacaoSubstitutivo` (estes dois, apenas em proposições). A chave do tipo no vocabulário mesclado SHALL ser `urnAutoridade + urnTipoDocumento + sigla`. A URN do tipo SHALL ser calculada como `urnTipoDocumento` seguido de `;` e a sigla em minúsculas, quando houver sigla, e SHALL NOT ser declarada nos dados.

#### Scenario: URN do tipo calculada
- **WHEN** o tipo `projeto.lei` com sigla `PL` é mesclado
- **THEN** sua URN de tipo é `projeto.lei;pl`

#### Scenario: Norma sem sigla
- **WHEN** o tipo `lei`, sem sigla, é mesclado
- **THEN** sua URN de tipo é `lei`

#### Scenario: Chaves distintas
- **WHEN** dois tipos têm a mesma URN de tipo e autoridades diferentes
- **THEN** são entradas distintas do vocabulário mesclado

### Requirement: Listagem de tipos ativos e inativos
O sistema SHALL listar, a partir do vocabulário da casa, os tipos de proposição ativos (`tiposDocumentoAtivos`) e, separadamente, os inativos. Normas não entram em nenhuma das duas listas.

#### Scenario: Tipos ativos
- **WHEN** os tipos ativos de `SF` são listados
- **THEN** o resultado contém as proposições com `ativo` verdadeiro e nenhuma inativa nem norma

#### Scenario: Tipos inativos
- **WHEN** os tipos inativos de `SF` são listados
- **THEN** o resultado contém só as proposições com `ativo` falso

### Requirement: Identificação do tipo pela sigla
O sistema SHALL identificar um tipo de proposição pela sigla, comparada sem diferença de caixa, devolvendo o tipo **ativo** correspondente; sem tipo ativo com a sigla, o resultado SHALL ser vazio.

#### Scenario: Sigla ativa
- **WHEN** o tipo é identificado pela sigla `pec` no vocabulário de `SF`
- **THEN** o resultado é o tipo ativo `proposta.emenda.constitucional;pec`

#### Scenario: Sigla só inativa
- **WHEN** a sigla pertence apenas a um tipo inativo
- **THEN** o resultado é vazio

#### Scenario: Sigla de outra casa
- **WHEN** a sigla `PRC` é consultada no vocabulário de `SF`
- **THEN** o resultado é vazio

### Requirement: Autoridade da URN gerada para proposição nova
O sistema SHALL gerar a URN de uma proposição nova a partir da sigla informada pelo host, usando a autoridade e o URN de tipo do tipo **ativo** que tem essa sigla no vocabulário da casa.

#### Scenario: Medida provisória é federal
- **WHEN** uma proposição nova é criada com a sigla `MPV`
- **THEN** a URN gerada é `urn:lex:br:federal:medida.provisoria;mpv:9999;999999`, com número e ano provisórios quando não informados

#### Scenario: Projeto de lei de conversão é do Congresso
- **WHEN** uma proposição nova é criada com a sigla `PLV`
- **THEN** a URN gerada tem autoridade `congresso.nacional` e tipo `projeto.lei.conversao;plv`

#### Scenario: Sigla própria da Câmara
- **WHEN** uma proposição nova é criada com a sigla `PL` no vocabulário de `CD`
- **THEN** a URN gerada tem autoridade `camara.deputados`

#### Scenario: Sigla desconhecida na casa
- **WHEN** uma proposição nova é criada com uma sigla que não é de tipo ativo da casa
- **THEN** a geração da URN falha com a mensagem de que a sigla não foi encontrada no vocabulário

### Requirement: Resolução de tipo e sigla pela autoridade exata da URN
O sistema SHALL resolver o tipo de documento de uma URN casando a autoridade e o segmento de tipo (com a sigla, quando houver) com uma entrada da **visão completa** do vocabulário, incluindo tipos inativos e normas, qualquer que seja a casa do editor, e SHALL NOT usar entrada de outra autoridade como alternativa. A sigla de uma URN SHALL ser a do tipo resolvido, e texto vazio quando o tipo não tiver sigla. Quando o segmento de tipo da URN não traz sigla e não é uma norma declarada na autoridade, o sistema SHALL resolvê-lo para o tipo **ativo** com sigla da mesma autoridade que tem esse tipo, nunca para um inativo nem para outra autoridade. URN cuja autoridade e tipo não estejam no vocabulário SHALL ficar sem resolução e falhar na validação.

#### Scenario: Proposição ativa
- **WHEN** o tipo é resolvido para `urn:lex:br:senado.federal:projeto.lei;pl:2026;1`
- **THEN** o resultado é a entrada ativa de `projeto.lei;pl` do Senado

#### Scenario: Proposição inativa
- **WHEN** o tipo é resolvido para `urn:lex:br:senado.federal:projeto.lei;pls:2026;1` e `pls` é inativo
- **THEN** o resultado é a entrada inativa, e a sigla obtida é `PLS`

#### Scenario: Sigla de medida provisória
- **WHEN** a sigla é obtida para `urn:lex:br:federal:medida.provisoria;mpv:2020;930`
- **THEN** o resultado é `MPV`

#### Scenario: Norma da autoridade declarada
- **WHEN** o tipo é resolvido para `urn:lex:br:federal:lei:2020-01-01;1`
- **THEN** o resultado é a entrada de `lei` de `federal`, e a sigla é texto vazio

#### Scenario: Tipo sem sigla na URN
- **WHEN** o tipo é resolvido para `urn:lex:br:federal:medida.provisoria:2019-11-11;905`
- **THEN** o resultado é a entrada ativa `medida.provisoria;mpv` de `federal`, e a sigla obtida é `MPV`

#### Scenario: Com e sem sigla são equivalentes
- **WHEN** o tipo é resolvido para `urn:lex:br:senado.federal:projeto.lei;pl:2026;1` e para `urn:lex:br:senado.federal:projeto.lei:2026;1`
- **THEN** ambos resolvem para a mesma entrada, o tipo ativo `projeto.lei;pl` de `senado.federal`

#### Scenario: Tipo sem sigla e autoridade que não o declara
- **WHEN** o tipo é resolvido para `urn:lex:br:federal:projeto.lei:2026;1`
- **THEN** não há resultado

#### Scenario: Sem fallback para outra autoridade
- **WHEN** o tipo é resolvido para `urn:lex:br:senado.federal:projeto.lei.conversao;plv:2026;1` e `projeto.lei.conversao;plv` só existe no Congresso Nacional
- **THEN** não há resultado, e a validação da URN falha

#### Scenario: Norma da outra casa no editor do Senado
- **WHEN** a casa do editor é `SF` e o tipo é resolvido para `urn:lex:br:camara.deputados:resolucao:1989-09-21;17`
- **THEN** o resultado é a entrada de `resolucao` de `camara.deputados`, e a URN é válida

#### Scenario: Norma da outra casa no editor da Câmara
- **WHEN** a casa do editor é `CD` e o tipo é resolvido para `urn:lex:br:senado.federal:resolucao:1970-11-27;93`
- **THEN** o resultado é a entrada de `resolucao` de `senado.federal`, e a URN é válida

#### Scenario: Tipo da outra casa
- **WHEN** a casa do editor é `SF` e o tipo é resolvido para `urn:lex:br:camara.deputados:projeto.lei;pl:2026;1`
- **THEN** o resultado é a entrada ativa de `projeto.lei;pl` de `camara.deputados`

### Requirement: Recusa de documento de outra casa
Ao iniciar a edição de um documento já identificado por URN (recebida do host ou lida de arquivo), o sistema SHALL recusar a URN cuja autoridade não pertença à visão da casa do editor, com um erro de inicialização cuja mensagem informa que documento de outra casa legislativa não é suportado. A recusa SHALL acontecer antes de qualquer alteração do documento em edição, que permanece como estava. A criação de proposição nova pela sigla SHALL NOT ser afetada, porque sempre gera URN de autoridade da casa.

#### Scenario: Documento da Câmara no editor do Senado
- **WHEN** a casa do editor é `SF` e a edição é iniciada com a URN `urn:lex:br:camara.deputados:projeto.lei;pl:2026;1`
- **THEN** a inicialização falha com a mensagem de documento de outra casa, e o documento que estava em edição continua aberto

#### Scenario: Documento do Senado no editor da Câmara
- **WHEN** a casa do editor é `CD` e um arquivo com a URN `urn:lex:br:senado.federal:projeto.lei;pl:2026;1` é aberto
- **THEN** a abertura falha com a mensagem de documento de outra casa

#### Scenario: Autoridade comum às duas casas
- **WHEN** a casa do editor é `CD` e a edição é iniciada com a URN `urn:lex:br:federal:medida.provisoria;mpv:2026;1` ou `urn:lex:br:congresso.nacional:projeto.lei.conversao;plv:2026;1`
- **THEN** a edição é iniciada normalmente

#### Scenario: Proposição nova
- **WHEN** a casa do editor é `SF` e a edição é iniciada sem URN, com a sigla `PL`
- **THEN** a URN gerada tem autoridade `senado.federal` e a edição é iniciada normalmente

### Requirement: Casa responsável da autoridade
Cada autoridade do vocabulário SHALL poder declarar a `sigla` opcional da casa legislativa responsável pelas suas proposições: `senado.federal` com `SF`, `camara.deputados` com `CD` e `congresso.nacional` com `CN`. A autoridade `federal` SHALL NOT declarar sigla. A casa responsável de uma URN SHALL ser a sigla da sua autoridade na visão completa, e URN de autoridade sem sigla ou desconhecida SHALL ficar sem casa responsável.

#### Scenario: Sigla de cada autoridade
- **WHEN** a visão completa é consultada
- **THEN** `senado.federal` tem sigla `SF`, `camara.deputados` tem `CD`, `congresso.nacional` tem `CN` e `federal` não tem sigla

#### Scenario: Casa responsável de uma URN
- **WHEN** a casa responsável de uma URN de autoridade `congresso.nacional` é consultada
- **THEN** o resultado é `CN`

#### Scenario: Autoridade sem casa
- **WHEN** a casa responsável de uma URN de autoridade `federal` ou desconhecida é consultada
- **THEN** não há casa responsável

### Requirement: Proposição suportada pelo editor
Uma URN SHALL ser de proposição suportada quando o seu tipo resolvido for uma proposição (tipo com sigla, ativo ou inativo) da visão da casa do editor, de autoridade que declara sigla de casa. Toda URN que não seja de proposição suportada SHALL ser de tipo "não suportado".

#### Scenario: Proposição da casa
- **WHEN** o editor do Senado consulta uma URN `senado.federal:projeto.lei;pl`
- **THEN** a URN é de proposição suportada

#### Scenario: Proposição inativa
- **WHEN** o editor do Senado consulta uma URN `senado.federal:projeto.lei;pls`
- **THEN** a URN é de proposição suportada

#### Scenario: Medida provisória
- **WHEN** o editor consulta uma URN `federal:medida.provisoria;mpv`
- **THEN** a URN é de tipo não suportado

#### Scenario: Norma de autoridade com casa
- **WHEN** o editor do Senado consulta uma URN `senado.federal:resolucao`
- **THEN** a URN é de tipo não suportado

### Requirement: Validação de siglas e chaves do vocabulário mesclado
A mesclagem SHALL falhar com erro descritivo quando houver duas proposições **ativas** com a mesma sigla **na visão de uma mesma casa**, ou duas entradas com a mesma chave. Siglas repetidas entre proposições inativas, entre uma ativa e uma inativa, ou entre ativas de casas diferentes (por exemplo, `PL` do Senado e `PL` da Câmara na visão completa), SHALL ser permitidas.

#### Scenario: Sigla duplicada entre ativos
- **WHEN** duas proposições ativas da visão de uma mesma casa declaram a sigla `PL`
- **THEN** a mesclagem falha informando a sigla duplicada

#### Scenario: Sigla repetida entre casas
- **WHEN** `senado.federal` e `camara.deputados` declaram, cada um, uma proposição ativa com a sigla `PL`
- **THEN** a mesclagem conclui sem erro

#### Scenario: Sigla repetida com inativo
- **WHEN** uma proposição ativa e uma inativa declaram a mesma sigla
- **THEN** a mesclagem conclui sem erro

### Requirement: Identificação de substitutivo pela URN
O sistema SHALL informar se uma URN é de um substitutivo, resolvendo o tipo na visão completa. A URN SHALL ser de substitutivo quando o `tipoRelacaoSubstitutivo` do seu tipo for `é substitutivo`, ou quando for `aceita substitutivo` e a URN apresentar um evento do vocabulário com `substitutivo` igual a `s`. Qualquer outro caso, inclusive `é subemenda substitutiva`, `não aceita substitutivo`, tipo não resolvido e URN sem evento, SHALL resultar em falso.

#### Scenario: Tipo que é substitutivo
- **WHEN** a URN é de `substitutivo;sbt` da `camara.deputados`
- **THEN** a URN é de substitutivo, mesmo sem evento

#### Scenario: Tipo que aceita substitutivo com evento de substitutivo
- **WHEN** a URN é `urn:lex:br:senado.federal:projeto.lei;pl:2026;12@apresentacao.substitutivo`
- **THEN** a URN é de substitutivo

#### Scenario: Tipo que aceita substitutivo com evento que não é de substitutivo
- **WHEN** a URN é de um tipo que aceita substitutivo e o evento tem `substitutivo` diferente de `s`
- **THEN** a URN não é de substitutivo

#### Scenario: Tipo que aceita substitutivo sem evento
- **WHEN** a URN é `urn:lex:br:senado.federal:projeto.lei;pl:2026;12`
- **THEN** a URN não é de substitutivo

#### Scenario: Tipo que não aceita substitutivo
- **WHEN** a URN é de um tipo com `não aceita substitutivo`, ainda que com evento de substitutivo
- **THEN** a URN não é de substitutivo

#### Scenario: Subemenda substitutiva
- **WHEN** a URN é de `subemenda.substitutiva;pep` da `camara.deputados`
- **THEN** a URN não é de substitutivo

#### Scenario: Tipo não resolvido
- **WHEN** a URN tem uma autoridade ou um tipo que o vocabulário não conhece
- **THEN** a URN não é de substitutivo
