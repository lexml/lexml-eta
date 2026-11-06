## MODIFIED Requirements

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
- **WHEN** a URN é de `subemenda.substitutiva;ssp` da `camara.deputados`
- **THEN** a URN não é de substitutivo

#### Scenario: Sigla anterior da subemenda substitutiva
- **WHEN** a URN é de `subemenda.substitutiva;pep` da `camara.deputados`
- **THEN** o tipo não é resolvido e a URN não é de substitutivo

#### Scenario: Tipo não resolvido
- **WHEN** a URN tem uma autoridade ou um tipo que o vocabulário não conhece
- **THEN** a URN não é de substitutivo
