## MODIFIED Requirements

### Requirement: Invalidação de remissão ao excluir o dispositivo de destino
Quando um dispositivo referenciado por uma remissão é removido, o sistema SHALL marcar visualmente o link como inválido e exibir uma mensagem de erro associada ao dispositivo de origem. A regra vale para o dispositivo removido e para todos os seus descendentes, inclusive o caput de um artigo removido.

#### Scenario: Remoção do dispositivo de destino
- **WHEN** um dispositivo que é alvo de uma ou mais remissões é removido
- **THEN** cada link correspondente recebe uma marcação visual de inválido (vermelho, tachado) e um painel de erro aparece abaixo do texto do dispositivo de origem

#### Scenario: Remoção de artigo cujo caput é referenciado
- **WHEN** um artigo é removido e existe uma remissão cujo destino é o caput desse artigo (ex.: "caput do art. 2º")
- **THEN** essa remissão é marcada como inválida, com a mesma marcação visual e mensagem de erro do cenário anterior

#### Scenario: Remoção de dispositivo com descendentes referenciados
- **WHEN** um dispositivo é removido e existem remissões cujo destino é um de seus descendentes (inciso, parágrafo, alínea etc.)
- **THEN** cada uma dessas remissões é marcada como inválida

#### Scenario: Mensagem de erro persiste até o link ser removido
- **WHEN** uma remissão está marcada como inválida
- **THEN** a mensagem de erro permanece mesmo que o usuário edite outras partes do texto do dispositivo de origem, e só desaparece quando o link inválido é removido

#### Scenario: Undo restaura a remissão
- **WHEN** o usuário desfaz (undo) a remoção do dispositivo de destino
- **THEN** a marcação de inválido e a mensagem de erro são revertidas automaticamente, sem exigir nova detecção

#### Scenario: Undo restaura remissões para descendentes e para o caput
- **WHEN** o usuário desfaz (undo) a remoção de um dispositivo cujos descendentes (inclusive o caput, se for artigo) eram alvo de remissões invalidadas pela remoção
- **THEN** todas essas remissões deixam de estar marcadas como inválidas e voltam a apontar para o descendente restaurado correspondente

## ADDED Requirements

### Requirement: Preservação do vínculo de remissões para o caput em ações que recriam o artigo
Toda ação que recria um artigo a partir do histórico ou de uma revisão — desfazer/refazer a remoção, desfazer/refazer um movimento, rejeitar uma revisão de movimentação — SHALL preservar o vínculo das remissões cujo destino é o caput desse artigo: o link continua apontando para o caput restaurado, continua sendo atualizado em renumerações posteriores e é salvo apontando para ele, nunca como destino excluído.

#### Scenario: Desfazer a remoção de um artigo cujo caput é referenciado
- **WHEN** o usuário remove um artigo cujo caput é alvo de uma remissão e depois desfaz (undo) a remoção
- **THEN** o link volta a apontar para o caput do artigo restaurado, sem marcação de inválido, e o texto do caput é o mesmo de antes da remoção

#### Scenario: Desfazer o movimento de um artigo cujo caput é referenciado
- **WHEN** o usuário move um artigo cujo caput é alvo de uma remissão e depois desfaz (undo) o movimento
- **THEN** o link continua apontando para o caput desse artigo, com o texto refletindo a posição restaurada

#### Scenario: Refazer após desfazer
- **WHEN** o usuário desfaz e em seguida refaz (redo) uma ação que recria um artigo cujo caput é referenciado
- **THEN** a cada passo o link continua apontando para o caput desse artigo

#### Scenario: Rejeitar revisão de movimentação de artigo cujo caput é referenciado
- **WHEN** com revisão ativa o usuário move um artigo cujo caput é alvo de uma remissão e depois rejeita essa revisão de movimentação
- **THEN** o link continua apontando para o caput do artigo na posição restaurada, sem marcação de inválido

#### Scenario: Salvar após desfazer
- **WHEN** após qualquer uma das ações acima o usuário salva o documento
- **THEN** a remissão para o caput é persistida apontando para o caput do artigo, não como remissão para dispositivo excluído
