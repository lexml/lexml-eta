## ADDED Requirements

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
