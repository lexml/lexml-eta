## MODIFIED Requirements

### Requirement: Tipo de documento e sua chave
O sistema SHALL representar cada tipo de documento com `urnTipoDocumento` (tipo sem sigla), `sigla` opcional em maiúsculas (só em proposições), `descricao`, `genero`, `ativo` (padrão `true`) e `tipoRelacaoSubstitutivo` (estes dois, apenas em proposições), e com os códigos opcionais de modelo de epígrafe `modeloEpigrafe` e `modeloEpigrafeSubstitutivo`. A chave do tipo no vocabulário mesclado SHALL ser `urnAutoridade + urnTipoDocumento + sigla`. A URN do tipo SHALL ser calculada como `urnTipoDocumento` seguido de `;` e a sigla em minúsculas, quando houver sigla, e SHALL NOT ser declarada nos dados.

#### Scenario: URN do tipo calculada
- **WHEN** o tipo `projeto.lei` com sigla `PL` é mesclado
- **THEN** sua URN de tipo é `projeto.lei;pl`

#### Scenario: Norma sem sigla
- **WHEN** o tipo `lei`, sem sigla, é mesclado
- **THEN** sua URN de tipo é `lei`

#### Scenario: Chaves distintas
- **WHEN** dois tipos têm a mesma URN de tipo e autoridades diferentes
- **THEN** são entradas distintas do vocabulário mesclado

#### Scenario: Tipo sem modelo de epígrafe
- **WHEN** um tipo não declara `modeloEpigrafe` nem `modeloEpigrafeSubstitutivo`
- **THEN** o tipo é mesclado sem eles, e a epígrafe de documentos desse tipo usa o modelo padrão

## ADDED Requirements

### Requirement: Modelos de epígrafe por autoridade
Cada autoridade do vocabulário SHALL poder declarar uma lista de modelos de epígrafe, cada um com um `codigo` e uma string de `modelo`. Os códigos de modelo de um tipo de documento SHALL referir-se aos modelos da mesma autoridade do tipo. Os modelos SHALL estar disponíveis na visão completa, com a autoridade de onde vieram.

#### Scenario: Modelo carimbado com a autoridade
- **WHEN** a visão completa é montada
- **THEN** o modelo `substitutivo` de `senado.federal` e o de `camara.deputados` são entradas distintas, cada uma com a sua autoridade

#### Scenario: Código resolvido na autoridade do tipo
- **WHEN** um tipo de `camara.deputados` declara `modeloEpigrafe` igual a `substitutivo`
- **THEN** o modelo usado é o `substitutivo` de `camara.deputados`, não o de `senado.federal`

### Requirement: Validação dos modelos de epígrafe na mesclagem
A mesclagem SHALL falhar com erro descritivo quando uma autoridade declarar dois modelos de epígrafe com o mesmo código, ou quando um tipo declarar `modeloEpigrafe` ou `modeloEpigrafeSubstitutivo` com um código inexistente na sua autoridade.

#### Scenario: Código duplicado
- **WHEN** uma autoridade declara dois modelos com o código `substitutivo`
- **THEN** a mesclagem falha informando a autoridade e o código duplicado

#### Scenario: Código inexistente
- **WHEN** um tipo declara `modeloEpigrafe` igual a `inexistente`
- **THEN** a mesclagem falha informando o tipo e o código não encontrado

### Requirement: Modelos de epígrafe iniciais
O vocabulário SHALL declarar estes modelos:
- `senado.federal`: `substitutivo`;
- `camara.deputados`: `substitutivo` e `subemenda.substitutiva`;
- `congresso.nacional`: `plv`.

As associações aos tipos SHALL ser:
- no Senado, todo tipo com `aceita substitutivo` tem `modeloEpigrafeSubstitutivo` igual a `substitutivo`;
- na Câmara, o tipo com `é substitutivo` tem `modeloEpigrafe` igual a `substitutivo`, e o tipo com `é subemenda substitutiva` tem `modeloEpigrafe` igual a `subemenda.substitutiva`;
- no Congresso, o PLV tem `modeloEpigrafe` igual a `plv`.

Nenhum outro tipo SHALL ter modelo.

#### Scenario: Tipos do Senado que aceitam substitutivo
- **WHEN** a visão completa é consultada pelos tipos de `senado.federal` com `aceita substitutivo`
- **THEN** todos têm `modeloEpigrafeSubstitutivo` igual a `substitutivo` e nenhum tem `modeloEpigrafe`

#### Scenario: Tipos da Câmara
- **WHEN** a visão completa é consultada pelos tipos SBT e PEP de `camara.deputados`
- **THEN** SBT tem `modeloEpigrafe` igual a `substitutivo` e PEP tem `modeloEpigrafe` igual a `subemenda.substitutiva`

#### Scenario: PLV
- **WHEN** a visão completa é consultada pelo tipo PLV de `congresso.nacional`
- **THEN** ele tem `modeloEpigrafe` igual a `plv`

#### Scenario: Demais tipos
- **WHEN** a visão completa é consultada por um tipo fora das associações acima (por exemplo, PL da Câmara ou MPV)
- **THEN** ele não tem `modeloEpigrafe` nem `modeloEpigrafeSubstitutivo`
