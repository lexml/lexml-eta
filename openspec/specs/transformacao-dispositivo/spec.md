# Transformação de Dispositivo

## Purpose

Define o comportamento do cursor e da linha ativa do editor quando o usuário transforma o tipo de um dispositivo pelo teclado (Tab e Shift+Tab), inclusive em transformações encadeadas.

## Requirements

### Requirement: Cursor permanece no dispositivo transformado
Ao transformar o tipo de um dispositivo com Tab ou Shift+Tab, o sistema SHALL manter o cursor e a linha ativa no próprio dispositivo transformado, e SHALL NOT mover a seleção para o dispositivo anterior.

#### Scenario: Transformação simples
- **WHEN** o usuário posiciona o cursor em um inciso e pressiona Shift+Tab
- **THEN** o inciso passa a ser um parágrafo, e a linha ativa e o cursor permanecem nesse parágrafo

#### Scenario: Outros tipos de dispositivo
- **WHEN** o usuário transforma um parágrafo ou uma alínea com Tab ou Shift+Tab
- **THEN** a linha ativa e o cursor permanecem no dispositivo transformado

### Requirement: Transformações encadeadas mantêm o cursor
O sistema SHALL manter o cursor no dispositivo transformado quando uma transformação ocorre logo após a anterior, independentemente do intervalo entre as duas teclas e de haver emissão de alteração de texto ainda pendente.

#### Scenario: Shift+Tab seguido de Tab em sequência rápida
- **WHEN** o usuário pressiona Shift+Tab em um inciso e, em menos de um segundo, pressiona Tab no parágrafo resultante
- **THEN** o dispositivo volta a ser inciso, e a linha ativa e o cursor permanecem nele, sem subir para o dispositivo anterior

#### Scenario: Transformação com emissão de alteração pendente
- **WHEN** existe uma emissão de alteração de texto agendada e o usuário transforma o dispositivo ativo com Tab
- **THEN** o cursor permanece no dispositivo transformado, e a emissão de alteração ocorre depois da transformação
