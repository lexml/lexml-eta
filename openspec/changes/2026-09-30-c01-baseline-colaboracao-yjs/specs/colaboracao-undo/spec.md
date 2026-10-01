# Spec Delta

## Purpose

Define o desfazer e o refazer em modo colaborativo: cada usuário desfaz apenas as próprias ações, em texto e em estrutura, sem apagar o trabalho dos outros e sem alterar o desfazer do editor quando a colaboração está desligada.

## ADDED Requirements

### Requirement: Desfazer atua só nas ações do próprio usuário
O sistema SHALL, com a colaboração ligada, desfazer e refazer apenas as mudanças feitas pelo próprio usuário, preservando as dos outros.

#### Scenario: Desfazer uma inclusão própria
- **WHEN** um cliente inclui um dispositivo e aciona o desfazer
- **THEN** o dispositivo some nesse cliente e no outro

#### Scenario: Ação alheia preservada
- **WHEN** um cliente desfaz suas ações depois de o outro ter editado
- **THEN** as edições do outro cliente permanecem

### Requirement: Refazer reaplica a ação desfeita
O sistema SHALL permitir refazer uma ação desfeita, propagando a reaplicação para os demais clientes.

#### Scenario: Refazer uma inclusão
- **WHEN** um cliente desfaz uma inclusão e aciona o refazer
- **THEN** o dispositivo reaparece nesse cliente e no outro

### Requirement: Uma ação estrutural é um passo de desfazer
O sistema SHALL tratar cada ação estrutural do usuário como um único passo de desfazer, sem fundir ações consecutivas.

#### Scenario: Duas inclusões seguidas
- **WHEN** o usuário inclui dois dispositivos em sequência e aciona o desfazer uma vez
- **THEN** apenas a última inclusão é desfeita

### Requirement: Desfazer de texto
O sistema SHALL desfazer a digitação do próprio usuário, e a reversão MUST ser propagada aos demais clientes.

#### Scenario: Desfazer digitação
- **WHEN** um cliente digita e aciona o desfazer
- **THEN** o texto digitado é revertido nesse cliente e no outro

### Requirement: Autoridade de desfazer por modo
O sistema SHALL, com a colaboração ligada, encaminhar o desfazer e o refazer (atalhos de teclado e botões da barra) ao desfazer colaborativo, suspendendo o histórico anterior; com a colaboração desligada, o desfazer existente MUST permanecer inalterado.

#### Scenario: Atalho com a colaboração ligada
- **WHEN** o usuário aciona Ctrl+Z ou Ctrl+Y com a colaboração ligada
- **THEN** a ação é executada pelo desfazer colaborativo

#### Scenario: Botão da barra com a colaboração ligada
- **WHEN** o usuário clica em desfazer ou refazer na barra do editor
- **THEN** a ação é executada pelo desfazer colaborativo

#### Scenario: Colaboração desligada
- **WHEN** a colaboração está desligada
- **THEN** o desfazer e o refazer funcionam como antes da colaboração

### Requirement: O desfazer reaparece no estado local
O sistema SHALL refletir no estado e na tela de cada cliente o resultado do desfazer da mesma forma que reflete uma mudança remota, recalculando numeração e remissões.

#### Scenario: Numeração após desfazer
- **WHEN** um desfazer remove um dispositivo que deslocava a numeração
- **THEN** cada cliente recalcula os rótulos dos irmãos

### Requirement: A reconstrução da tela não polui o histórico
O sistema SHALL descartar, do texto compartilhado e do histórico de desfazer, as alterações espúrias geradas pelo editor ao reconstruir a tela após uma inclusão ou remoção.

#### Scenario: Refazer depois de desfazer uma inclusão
- **WHEN** o usuário desfaz uma inclusão e depois a refaz
- **THEN** o dispositivo é reincluído e nenhuma alteração espúria é registrada no texto
