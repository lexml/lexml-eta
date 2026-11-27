# Spec Delta

## MODIFIED Requirements

### Requirement: Alerta de numeração repetida

Enquanto houver dispositivo com complemento na numeração, com lacuna na numeração ou com numeração fora de ordem, ou, no modo flexível de validação de numeração (ver `numeracao-repetida`), com numeração repetida, a aba Avisos SHALL exibir o alerta crítico "Existem dispositivos com numeração irregular.", que o usuário não pode fechar. O alerta SHALL aparecer uma única vez, por mais que a condição seja reavaliada e qualquer que seja a combinação de irregularidades, e SHALL ser retirado quando não houver mais nenhuma delas.

#### Scenario: Abrir documento com numeração repetida

- **WHEN** o usuário abre, no modo flexível, um documento com dois "Art. 5º"
- **THEN** a aba Avisos exibe o alerta "Existem dispositivos com numeração irregular.", sem botão de fechar, junto com os demais alertas produzidos na abertura

#### Scenario: Abrir documento com lacuna

- **WHEN** o usuário abre, em qualquer dos modos, um documento com os artigos 1, 3 e 4
- **THEN** a aba Avisos exibe o alerta "Existem dispositivos com numeração irregular."

#### Scenario: Correção da última repetição

- **WHEN** o documento tem uma única numeração repetida e o usuário a corrige
- **THEN** a aba Avisos deixa de exibir o alerta de numeração irregular

#### Scenario: Correção parcial

- **WHEN** o documento tem artigos repetidos e incisos repetidos em outro artigo, e o usuário corrige só os incisos
- **THEN** a aba Avisos continua exibindo o alerta de numeração irregular

#### Scenario: Sem duplicação do alerta

- **WHEN** o documento tem numeração repetida, lacuna e numeração fora de ordem, e o usuário faz várias ações sem corrigi-las
- **THEN** a aba Avisos exibe um único alerta de numeração irregular

### Requirement: Mesma condição para o alerta e a pendência de numeração repetida

O alerta de numeração irregular da aba Avisos SHALL ser exibido exatamente quando a pendência de preenchimento "Existem dispositivos com numeração irregular." for incluída na proposição montada para salvar e na lista de pendências do arquivo salvo.

#### Scenario: Alerta e pendência coincidem

- **WHEN** o documento está em edição com o alerta de numeração irregular exibido
- **THEN** a proposição montada para salvar contém a pendência "Existem dispositivos com numeração irregular."

#### Scenario: Sem alerta e sem pendência

- **WHEN** o documento está em edição sem o alerta de numeração irregular
- **THEN** a proposição montada para salvar não contém essa pendência
