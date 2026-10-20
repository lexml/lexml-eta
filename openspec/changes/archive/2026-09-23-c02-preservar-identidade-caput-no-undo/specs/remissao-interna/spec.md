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

#### Scenario: Redo da remoção invalida de novo as remissões
- **WHEN** o usuário remove um dispositivo que é alvo de remissões (ou cujos descendentes são), desfaz (undo) e em seguida refaz (redo) a remoção
- **THEN** as remissões para o dispositivo removido e seus descendentes voltam a ser marcadas como inválidas, com a mesma marcação visual, mensagem de erro e alerta da remoção original, e um novo undo as restaura

#### Scenario: Salvar após o redo da remoção
- **WHEN** após o redo de uma remoção o usuário salva o documento
- **THEN** as remissões para os dispositivos removidos são persistidas como inválidas, e nenhuma é gravada como remissão válida para outro dispositivo que tenha herdado o número do removido

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

### Requirement: Marcação de links de remissão não cria passos no histórico de desfazer
Mudanças que alteram apenas a marcação de links de remissão no texto de um dispositivo — criação do link por detecção, marcação ou desmarcação de inválido — SHALL NOT criar passos próprios no histórico de desfazer/refazer nem descartar os passos que podem ser refeitos. Cada ação do usuário (ex.: remover um dispositivo) é desfeita com um único comando de desfazer, independentemente de onde estava o foco. Mudanças de formatação feitas pelo usuário (negrito, itálico, sobrescrito) continuam sendo passos desfazíveis.

#### Scenario: Desfazer uma remoção com o foco no dispositivo de origem
- **WHEN** o foco está no dispositivo de origem de uma remissão, o usuário remove o dispositivo de destino (o link passa a ser marcado como inválido) e clica em "Desfazer"
- **THEN** um único "Desfazer" restaura o dispositivo removido e o link volta a ser válido

#### Scenario: Criação de link por detecção não é um passo de desfazer
- **WHEN** o usuário digita uma referência, sai do dispositivo (o link é criado) e em seguida clica em "Desfazer"
- **THEN** o "Desfazer" reverte a digitação, e não apenas a criação do link

#### Scenario: Formatação do usuário continua desfazível
- **WHEN** o usuário aplica negrito a um trecho de um dispositivo e clica em "Desfazer"
- **THEN** o negrito é desfeito
