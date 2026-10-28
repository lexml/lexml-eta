# Spec Delta

## MODIFIED Requirements

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

## REMOVED Requirements

### Requirement: Validação do vocabulário mesclado
**Reason**: a validação de `tiposReferenciaveis` deixa de existir; o requisito é substituído por "Validação de siglas e chaves do vocabulário mesclado", sem o cenário de referência inexistente.
**Migration**: nenhuma; as regras de sigla ativa única por casa e de chave única continuam, no requisito substituto.

### Requirement: Tipos de referência de um substitutivo
**Reason**: o componente de nova proposição não precisa mais restringir ou derivar os tipos de referência do substitutivo a partir do vocabulário, e `tiposReferenciaveis` deixa de existir.
**Migration**: nenhuma; não há consumidor da consulta no editor. A identificação de um documento como substitutivo passa a ser feita por "Identificação de substitutivo pela URN".

## ADDED Requirements

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
