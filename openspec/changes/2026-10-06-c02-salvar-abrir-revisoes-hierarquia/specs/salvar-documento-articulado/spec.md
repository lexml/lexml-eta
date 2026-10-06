# Spec Delta

## ADDED Requirements

### Requirement: Serialização das revisões da hierarquia
Em modo de revisão, o sistema SHALL manter a articulação do arquivo na versão atual (dispositivos excluídos não aparecem nela) e registrar cada revisão principal em `RevisoesArticulacao` dos metadados do LexEdit, com `revisao`, `refIdUsuario` e `data`. Os atributos `refIdUsuario` e `data` SHALL ser os da última operação registrada. Sem revisão, o grupo SHALL ser omitido.

#### Scenario: Dispositivo adicionado
- **WHEN** o usuário, em modo de revisão, adiciona o artigo 4 e salva
- **THEN** a articulação contém o artigo 4 em sua forma final, e `RevisoesArticulacao` contém uma revisão com `refIdDispositivo` igual a `art4` e `revisao` igual a `adicionado`

#### Scenario: Hierarquia adicionada gera uma revisão
- **WHEN** o usuário, em modo de revisão, adiciona um artigo com parágrafo e incisos e salva
- **THEN** há uma única revisão `adicionado`, referenciando o artigo, e nenhuma revisão própria para o parágrafo e os incisos

#### Scenario: Documento sem revisão
- **WHEN** o usuário salva um documento sem nenhuma revisão da hierarquia
- **THEN** o arquivo salvo não contém `RevisoesArticulacao` nem o registro `Usuarios`

### Requirement: Revisão de alteração de texto
Quando o texto de um dispositivo é alterado em revisão, o sistema SHALL gravar na articulação o texto revisado e, na revisão `alterado`, o conteúdo anterior como parágrafo filho de `RevisaoArticulacao`.

#### Scenario: Texto de inciso alterado
- **WHEN** o usuário, em modo de revisão, altera o texto do inciso II do artigo 4 e salva
- **THEN** a articulação contém o novo texto, e a revisão com `refIdDispositivo` do inciso e `revisao` igual a `alterado` contém o texto original em um parágrafo filho

### Requirement: Revisão de movimentação
Quando um dispositivo é movido em revisão, o sistema SHALL registrar `movido;<posicaoOriginal>`, onde a posição original é o sequencial, iniciando em 1, que o dispositivo ocupava antes da movimentação. Para artigos, o sequencial SHALL contar todos os artigos da articulação; para os demais dispositivos, SHALL contar todos os filhos do pai original, de qualquer tipo.

#### Scenario: Inciso movido
- **WHEN** o usuário, em modo de revisão, move o inciso III do artigo 5 para depois do inciso V e salva
- **THEN** a revisão do dispositivo movido tem `revisao` igual a `movido;3`

#### Scenario: Artigo movido para outro agrupador
- **WHEN** o usuário, em modo de revisão, move o terceiro artigo da articulação para dentro de um agrupador diferente e salva
- **THEN** a revisão tem `revisao` igual a `movido;3`, e o identificador do artigo na articulação não inclui o agrupador

### Requirement: Revisão de transformação de tipo
Quando o tipo de um dispositivo é transformado em revisão, o sistema SHALL registrar `transformado;<tipoOriginal>`, com o tipo original em minúsculas e sem acentuação.

#### Scenario: Inciso transformado em alínea
- **WHEN** o usuário, em modo de revisão, transforma um inciso em alínea e salva
- **THEN** a articulação contém a alínea, e a revisão tem `revisao` igual a `transformado;inciso`

#### Scenario: Alínea transformada em inciso
- **WHEN** o usuário, em modo de revisão, transforma uma alínea em inciso e salva
- **THEN** a revisão tem `revisao` igual a `transformado;alinea`

### Requirement: Operações combinadas em ordem
Quando um mesmo dispositivo sofre mais de uma operação de revisão, o sistema SHALL registrar todas no atributo `revisao`, separadas por vírgula, na ordem em que ocorreram. Uma operação já registrada SHALL NOT ser repetida, e o argumento SHALL ser o da primeira ocorrência.

#### Scenario: Movido e depois alterado
- **WHEN** o usuário, em modo de revisão, move o inciso III e depois altera o seu texto
- **THEN** a revisão tem `revisao` igual a `movido;3,alterado`, com o conteúdo original como parágrafo filho

#### Scenario: Transformado e depois alterado
- **WHEN** o usuário, em modo de revisão, transforma um inciso em alínea e depois altera o texto
- **THEN** a revisão tem `revisao` igual a `transformado;inciso,alterado`

#### Scenario: Movido duas vezes
- **WHEN** o usuário, em modo de revisão, move o mesmo dispositivo duas vezes para posições diferentes da original
- **THEN** a revisão tem uma única operação `movido`, com a posição de antes da primeira movimentação

#### Scenario: Adicionado e depois alterado
- **WHEN** o usuário, em modo de revisão, adiciona um dispositivo e depois altera o seu texto
- **THEN** a revisão tem `revisao` igual a `adicionado`, sem conteúdo anterior

### Requirement: Revisão de exclusão
Quando um dispositivo é excluído em revisão, o sistema SHALL removê-lo da articulação e registrá-lo como filho de uma `RevisaoArticulacao` com `revisao` igual a `excluido`, sem `refIdDispositivo`, preservando o dispositivo com toda a sua hierarquia (filhos, rótulos e textos).

#### Scenario: Artigo excluído
- **WHEN** o usuário, em modo de revisão, exclui o artigo 3 e salva
- **THEN** a articulação não contém o artigo excluído, e os artigos seguintes já têm rótulo e identificador finais
- **AND** `RevisoesArticulacao` contém uma revisão `excluido`, sem `refIdDispositivo`, com o artigo e seu caput como filho

#### Scenario: Artigo excluído com filhos
- **WHEN** o usuário, em modo de revisão, exclui um artigo com parágrafo e incisos e salva
- **THEN** a revisão `excluido` contém o artigo com o parágrafo e os incisos, na mesma hierarquia e ordem originais

### Requirement: Identificador dos dispositivos excluídos
O sistema SHALL identificar cada dispositivo excluído, dentro de `RevisaoArticulacao`, com o prefixo `_`, o identificador que o dispositivo ocuparia na posição em que aparece na edição e o sufixo `-exc<sequencial>`, em que o sequencial numera, em ordem de posição, os excluídos com o mesmo identificador-base. O identificador SHALL ser calculado ao salvar, refletindo a posição final.

#### Scenario: Artigo excluído
- **WHEN** o usuário, em modo de revisão, exclui o artigo 2 de um documento com artigos 1, 2 e 3 e salva
- **THEN** o artigo excluído tem o identificador `_art2-exc1`, e o antigo artigo 3 aparece na articulação como `art2`

#### Scenario: Dois artigos excluídos em sequência
- **WHEN** o usuário, em modo de revisão, exclui o artigo 2 e, em seguida, o novo artigo 2 (antigo artigo 3) e salva
- **THEN** os excluídos têm os identificadores `_art2-exc1` e `_art2-exc2`, nessa ordem

#### Scenario: Exclusão anterior à exclusão já registrada
- **WHEN** o usuário, em modo de revisão, exclui o artigo 2 e, depois, o artigo 1 de um documento com artigos 1, 2 e 3 e salva
- **THEN** os excluídos têm os identificadores `_art1-exc1` (antigo artigo 1) e `_art1-exc2` (antigo artigo 2), ambos antes do artigo `art1` (antigo artigo 3)

#### Scenario: Identificador dos filhos do excluído
- **WHEN** o artigo excluído `_art3-exc1` possui caput
- **THEN** o caput recebe o identificador `_art3-exc1_cpt`

### Requirement: Data da revisão com fuso horário
O sistema SHALL gravar a data de cada revisão no formato ISO 8601 com fuso horário (por exemplo, `2026-05-11T15:51:00-03:00`), representando o mesmo instante registrado pelo editor.

#### Scenario: Data gravada com fuso
- **WHEN** uma revisão feita em 11/05/2026 às 15:51:00 no fuso UTC-03:00 é salva
- **THEN** o atributo `data` da revisão é `2026-05-11T15:51:00-03:00`

### Requirement: Registro de usuários das revisões
O sistema SHALL registrar em `Usuarios` dos metadados do LexEdit cada usuário referenciado por alguma revisão, uma única vez, com `idUsuario` igual ao identificador fornecido pelo host, `nome` e, quando houver, `sigla`. Sem identificador, `idUsuario` SHALL ser o nome. `refIdUsuario` de cada revisão SHALL referenciar um `idUsuario` registrado.

#### Scenario: Dois usuários revisando
- **WHEN** duas revisões feitas pelo usuário `sf:fulano` e uma pelo usuário `sf:ciclana` são salvas
- **THEN** `Usuarios` contém um registro para cada um, e cada `refIdUsuario` referencia um deles

#### Scenario: Usuário sem identificador
- **WHEN** uma revisão é feita por um usuário sem identificador, de nome "Anônimo"
- **THEN** o registro em `Usuarios` e o `refIdUsuario` correspondente usam `Anônimo` como identificador

### Requirement: Pendência de revisões da hierarquia
Enquanto houver ao menos uma revisão da hierarquia não resolvida, o sistema SHALL incluir na lista de pendências dos metadados do LexEdit o item "Resolver marcas de revisão na articulação.".

#### Scenario: Pendência presente com revisão
- **WHEN** o usuário salva um documento com ao menos uma revisão da hierarquia
- **THEN** a lista de pendências contém "Resolver marcas de revisão na articulação."

#### Scenario: Pendência ausente após resolver as revisões
- **WHEN** o usuário aceita ou rejeita todas as revisões da hierarquia e salva
- **THEN** a lista de pendências não contém esse item
