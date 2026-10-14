# Spec Delta

## MODIFIED Requirements

### Requirement: Revisão de alteração de texto
Quando o texto ou o título de um dispositivo é alterado em revisão, o sistema SHALL gravar na articulação o texto e o título revisados e, na revisão `alterado`, o estado anterior do dispositivo como filho de `RevisaoArticulacao`: um dispositivo do mesmo tipo do dispositivo revisado, sem `id`, com o texto anterior e, quando havia título, com o `TituloDispositivo` anterior. A ausência de `TituloDispositivo` nesse filho SHALL significar que o dispositivo não tinha título. O sistema SHALL NOT gravar um parágrafo solto como filho da revisão.

#### Scenario: Texto de inciso alterado
- **WHEN** o usuário, em modo de revisão, altera o texto do inciso II do artigo 4 e salva
- **THEN** a articulação contém o novo texto, e a revisão com `refIdDispositivo` do inciso e `revisao` igual a `alterado` contém como filho um inciso, sem `id`, com o texto original

#### Scenario: Artigo alterado
- **WHEN** o usuário, em modo de revisão, altera o texto de um artigo e salva
- **THEN** o filho da revisão é um artigo, sem `id`, com o texto original no `Caput`

#### Scenario: Texto alterado em dispositivo com título
- **WHEN** o usuário, em modo de revisão, altera apenas o texto de um dispositivo que tem o título "Do objeto" e salva
- **THEN** o filho da revisão contém o texto original e o `TituloDispositivo` "Do objeto"

#### Scenario: Título adicionado
- **WHEN** o usuário, em modo de revisão, adiciona um título a um dispositivo que não tinha título e salva
- **THEN** a articulação contém o dispositivo com o novo título, e o filho da revisão contém o texto do dispositivo, sem `TituloDispositivo`

#### Scenario: Título alterado
- **WHEN** o usuário, em modo de revisão, altera o título de "Do objeto" para "Da finalidade" e salva
- **THEN** a articulação contém o título "Da finalidade", e o filho da revisão contém o `TituloDispositivo` "Do objeto" e o texto do dispositivo

#### Scenario: Título removido
- **WHEN** o usuário, em modo de revisão, remove o título "Do objeto" de um dispositivo e salva
- **THEN** a articulação contém o dispositivo sem título, e o filho da revisão contém o `TituloDispositivo` "Do objeto"

#### Scenario: Título e texto alterados
- **WHEN** o usuário, em modo de revisão, altera o título e o texto de um dispositivo e salva
- **THEN** o filho da revisão contém o título anterior e o texto anterior

#### Scenario: Título com formatação
- **WHEN** o usuário, em modo de revisão, altera um título cujo valor anterior tinha itálico e subscrito e salva
- **THEN** o `TituloDispositivo` do filho da revisão preserva o itálico e o subscrito

#### Scenario: Título restaurado ao valor original
- **WHEN** o usuário, em modo de revisão, altera o título e o restaura ao valor original antes de salvar
- **THEN** o arquivo salvo não contém revisão para esse dispositivo

### Requirement: Revisão de alteração de rótulo
Quando o rótulo de um dispositivo de alteração de norma é alterado em revisão, o sistema SHALL gravar na articulação o dispositivo com o rótulo e o identificador finais e registrar `alteracaoRotulo;<idOriginal>` em `revisao`, onde `<idOriginal>` é o identificador anterior à alteração, do qual se deriva o rótulo anterior. O dispositivo filho com o estado anterior SHALL ser gravado somente quando a revisão também contém `alterado`.

#### Scenario: Parágrafo renumerado
- **WHEN** o usuário, em modo de revisão, renumera o parágrafo `art2_cpt_alt1_art3_par3-1` (`§ 3º-A`) para `§ 3º-B` e salva
- **THEN** a articulação contém o parágrafo `§ 3º-B` com o identificador final, e a revisão com `refIdDispositivo` igual ao identificador final tem `revisao` igual a `alteracaoRotulo;art2_cpt_alt1_art3_par3-1`, sem dispositivo filho

#### Scenario: Renumeração combinada com alteração de texto
- **WHEN** o usuário, em modo de revisão, renumera um parágrafo, altera o seu texto e salva
- **THEN** a revisão tem `alteracaoRotulo;<idOriginal>,alterado` e contém o texto anterior em um dispositivo filho

#### Scenario: Conversão pelo conversor LexML
- **WHEN** o arquivo com a revisão `alteracaoRotulo` é convertido em XML pelo conversor e validado com `schemas/lexedit.xsd`
- **THEN** o XML contém o atributo `revisao` com a operação e o argumento, e a validação não aponta erro

### Requirement: Operações combinadas em ordem
Quando um mesmo dispositivo sofre mais de uma operação de revisão, o sistema SHALL registrar todas no atributo `revisao`, separadas por vírgula, na ordem em que ocorreram. Uma operação já registrada SHALL NOT ser repetida, e o argumento SHALL ser o da primeira ocorrência.

#### Scenario: Movido e depois alterado
- **WHEN** o usuário, em modo de revisão, move o inciso III e depois altera o seu texto
- **THEN** a revisão tem `revisao` igual a `movido;3,alterado`, com o conteúdo original em um dispositivo filho

#### Scenario: Transformado e depois alterado
- **WHEN** o usuário, em modo de revisão, transforma um inciso em alínea e depois altera o texto
- **THEN** a revisão tem `revisao` igual a `transformado;inciso,alterado`

#### Scenario: Movido duas vezes
- **WHEN** o usuário, em modo de revisão, move o mesmo dispositivo duas vezes para posições diferentes da original
- **THEN** a revisão tem uma única operação `movido`, com a posição de antes da primeira movimentação

#### Scenario: Adicionado e depois alterado
- **WHEN** o usuário, em modo de revisão, adiciona um dispositivo e depois altera o seu texto
- **THEN** a revisão tem `revisao` igual a `adicionado`, sem conteúdo anterior

#### Scenario: Revisão sem alterado não grava conteúdo anterior
- **WHEN** o usuário, em modo de revisão, apenas adiciona, move ou transforma um dispositivo, ou apenas renumera um dispositivo de alteração de norma, e salva
- **THEN** a revisão tem apenas os atributos `refIdDispositivo`, `revisao`, `refIdUsuario` e `data`, sem dispositivo filho
