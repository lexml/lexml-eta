## ADDED Requirements

### Requirement: Revisão de exclusão de dispositivo com bloco de alteração
Quando um dispositivo que contém bloco de alteração de norma é excluído em revisão, o sistema SHALL registrar uma única revisão principal `excluido` para o dispositivo, associando a ela todos os dispositivos do bloco, e SHALL gravar o bloco de alteração completo (dispositivos, rótulos, textos e hierarquia) dentro do dispositivo excluído, no elemento `Alteracao`. Os dispositivos do bloco SHALL NOT gerar revisões principais próprias.

#### Scenario: Uma única marca na sessão
- **WHEN** o usuário, em modo de revisão, exclui um artigo que altera uma norma, com um artigo de alteração e um parágrafo no bloco
- **THEN** o editor exibe uma única marca de revisão para a exclusão, e a contagem de revisões aumenta em um

#### Scenario: Bloco de alteração gravado
- **WHEN** o usuário, em modo de revisão, exclui o artigo 5 que altera uma norma, com o artigo `Art. 3º` e o parágrafo `§ 2º` no bloco, e salva
- **THEN** a revisão `excluido` contém o artigo excluído com o caput, a norma alterada e o bloco de alteração com o `Art. 3º` e o `§ 2º`, na hierarquia e na ordem originais

#### Scenario: Identificador dos dispositivos do bloco excluído
- **WHEN** o artigo excluído tem identificador `_art4-exc1`
- **THEN** os dispositivos do bloco têm identificadores com esse prefixo, como `_art4-exc1_cpt_alt1_art3`

#### Scenario: Exclusões em sequência
- **WHEN** o usuário, em modo de revisão, exclui um artigo que altera norma e, em seguida, outro artigo anterior a ele, e salva
- **THEN** cada revisão `excluido` contém o bloco de alteração do respectivo artigo, com identificadores calculados pela posição final

### Requirement: Revisão de movimentação de dispositivo com bloco de alteração
Quando um dispositivo que contém bloco de alteração de norma é movido ou transformado em revisão, o sistema SHALL manter uma única revisão principal para o dispositivo, e os dispositivos do bloco SHALL ser tratados como descendentes dele, sem revisões principais próprias.

#### Scenario: Artigo com bloco de alteração movido
- **WHEN** o usuário, em modo de revisão, move um artigo que altera norma para outra posição
- **THEN** o editor exibe uma única marca de revisão de movimentação, e rejeitá-la devolve o artigo e o seu bloco de alteração à posição original

#### Scenario: Movido e salvo
- **WHEN** o usuário, em modo de revisão, move um artigo que altera norma e salva
- **THEN** o arquivo contém uma única revisão `movido;<posicaoOriginal>`, e o bloco de alteração permanece no artigo na articulação
