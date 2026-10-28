# Spec Delta

## ADDED Requirements

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
