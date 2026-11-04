## ADDED Requirements

### Requirement: Serialização da pena
O sistema SHALL gravar a pena de um dispositivo no elemento `Pena` desse dispositivo, depois dos seus filhos, com o identificador `<identificador do dono>_pena`, o `Rotulo` no formato "<rótulo> –" e o texto em `p`. A pena SHALL NOT ser gravada entre os filhos do dispositivo. A pena do artigo SHALL ser gravada no `Caput`. A gravação SHALL valer também para penas dentro de bloco de alteração de norma, e o arquivo SHALL sobreviver à conversão em XML pelo conversor LexML validada com o esquema.

#### Scenario: Pena de parágrafo com incisos
- **WHEN** o § 2º do art. 2 tem os incisos I e II e a pena "Pena –" com o texto "reclusão, de 6 (seis) a 14 (quatorze) anos, e multa." e o usuário salva
- **THEN** o `Paragrafo` `art2_par2` contém os incisos e, depois deles, o elemento `Pena` `art2_par2_pena` com `Rotulo` "Pena –" e esse texto em `p`

#### Scenario: Pena do artigo
- **WHEN** o art. 1 tem pena e o usuário salva
- **THEN** a pena é gravada no `Caput` `art1_cpt`, com o identificador `art1_cpt_pena`

#### Scenario: Pena em bloco de alteração
- **WHEN** um artigo de bloco de alteração tem o caput omissis e uma pena, e o usuário salva
- **THEN** o `Caput` do artigo do bloco contém o texto omitido e a `Pena`

#### Scenario: Conversão pelo conversor LexML
- **WHEN** o arquivo com penas é convertido em XML pelo conversor, validado com o esquema e convertido de volta
- **THEN** as penas, com identificador, rótulo e texto, são preservadas na ida e na volta

## MODIFIED Requirements

### Requirement: Revisão de alteração de texto
Quando o texto, o título ou, na pena, o rótulo de um dispositivo é alterado em revisão, o sistema SHALL gravar na articulação o texto, o título e o rótulo revisados e, na revisão `alterado`, o estado anterior do dispositivo como filho de `RevisaoArticulacao`: um dispositivo do mesmo tipo do dispositivo revisado, sem `id`, com o texto anterior e, quando havia título, com o `TituloDispositivo` anterior. A ausência de `TituloDispositivo` nesse filho SHALL significar que o dispositivo não tinha título. Quando o dispositivo revisado é uma pena, o filho SHALL conter também o `Rotulo` anterior. O sistema SHALL NOT gravar um parágrafo solto como filho da revisão.

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

#### Scenario: Rótulo da pena alterado
- **WHEN** o usuário, em modo de revisão, troca o rótulo de uma pena de "Pena –" para "Infração –" e salva
- **THEN** a articulação contém a pena com o `Rotulo` "Infração –", e a revisão `alterado` contém como filho uma `Pena`, sem `id`, com o `Rotulo` "Pena –" e o texto da pena

#### Scenario: Só o texto da pena alterado
- **WHEN** o usuário, em modo de revisão, altera só o texto de uma pena e salva
- **THEN** a revisão `alterado` contém como filho uma `Pena`, sem `id` e sem `Rotulo`, com o texto anterior

#### Scenario: Pena excluída em revisão
- **WHEN** o usuário, em modo de revisão, remove uma pena e salva
- **THEN** a revisão `excluido` contém como filho a `Pena` removida, com `id` `_<base>-exc<n>`, `Rotulo` e texto

#### Scenario: Esquema do LexEdit
- **WHEN** o arquivo contém essas revisões de pena
- **THEN** o `lexedit.xsd` aceita `Pena` como filho de `RevisaoArticulacao`; o `jsonix-lexml` 2.1.0 descarta esse filho sem erro, então a gravação depende do `jsonix-lexml` 2.2.0
