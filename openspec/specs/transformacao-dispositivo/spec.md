# Transformação de Dispositivo

## Purpose

Define o comportamento da transformação do tipo de um dispositivo: o cursor e a linha ativa do editor quando a transformação é feita pelo teclado (Tab e Shift+Tab), inclusive em transformações encadeadas, e o lugar do dispositivo resultante nas transformações que o mantêm no mesmo pai, como as omissões.

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

### Requirement: Transformação no mesmo pai mantém o dispositivo no lugar
Nas transformações em que o dispositivo continua no mesmo pai (omitir incisos, alíneas, itens, parágrafos ou artigos; transformar omissis em dispositivo; transformar dispositivo genérico em inciso, alínea ou item), o dispositivo resultante SHALL ocupar a posição do dispositivo transformado, SHALL fazer parte do documento (inclusive ao salvar) e SHALL manter o identificador interno do dispositivo transformado.

#### Scenario: Omitir o primeiro inciso
- **WHEN** em alteração de norma o usuário usa "Omitir Incisos" no primeiro inciso de um artigo com outros incisos
- **THEN** o omissis fica logo depois do artigo, antes dos demais incisos, e faz parte do documento

#### Scenario: Omitir um inciso do meio
- **WHEN** o usuário usa "Omitir Incisos" num inciso que tem incisos antes e depois dele
- **THEN** o omissis fica entre esses incisos

#### Scenario: Transformar omissis em inciso
- **WHEN** o usuário transforma em inciso um omissis do caput
- **THEN** o inciso fica no lugar do omissis e faz parte do documento

#### Scenario: Desfazer e refazer a omissão
- **WHEN** o usuário desfaz e depois refaz a omissão de um inciso
- **THEN** o inciso volta ao seu lugar e, ao refazer, o omissis volta ao lugar do inciso
