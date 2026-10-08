# pendencias-proposicao Specification

## Purpose

Pendências da proposição são condições do documento em edição que, enquanto não resolvidas, impedem o seu protocolamento, e que o editor sinaliza ao usuário na aba Avisos.

## Requirements

### Requirement: Alerta de justificação não informada

Enquanto a justificação for obrigatória e não tiver texto, a aba Avisos SHALL exibir um alerta crítico com a mensagem "Não foi informado um texto de justificação.", que o usuário não pode fechar. O alerta SHALL aparecer uma única vez, por mais que a condição seja reavaliada. Justificação sem texto é aquela vazia ou só com marcação, espaços ou `&nbsp;`.

#### Scenario: Justificação vazia

- **WHEN** a justificação é obrigatória e está vazia
- **THEN** a aba Avisos exibe o alerta "Não foi informado um texto de justificação."
- **AND** o alerta não tem botão de fechar

#### Scenario: Justificação só com espaços

- **WHEN** a justificação é obrigatória e contém apenas espaços ou parágrafos em branco
- **THEN** a aba Avisos exibe o alerta "Não foi informado um texto de justificação."

#### Scenario: Justificação preenchida

- **WHEN** a justificação é obrigatória e contém texto
- **THEN** a aba Avisos não exibe o alerta de justificação

#### Scenario: Sem duplicação do alerta

- **WHEN** a condição é reavaliada várias vezes com a justificação vazia
- **THEN** a aba Avisos exibe um único alerta de justificação

### Requirement: Mesma condição para o alerta e a pendência de justificação

O alerta de justificação da aba Avisos SHALL ser exibido exatamente quando a pendência de preenchimento "Não foi informado um texto de justificação." for incluída na proposição montada para salvar.

#### Scenario: Alerta e pendência coincidem

- **WHEN** o documento está em edição com o alerta de justificação exibido
- **THEN** a proposição montada para salvar contém a pendência "Não foi informado um texto de justificação."

#### Scenario: Sem alerta e sem pendência

- **WHEN** o documento está em edição sem o alerta de justificação
- **THEN** a proposição montada para salvar não contém essa pendência

### Requirement: Avaliação do alerta de justificação ao iniciar a edição

Ao terminar a inicialização da edição, o sistema SHALL avaliar a condição do alerta de justificação, sem depender de nenhuma edição do usuário. Isso vale tanto para um documento novo quanto para um documento aberto.

#### Scenario: Documento novo

- **WHEN** a edição de um documento novo é iniciada com a justificação obrigatória
- **THEN** a aba Avisos exibe o alerta "Não foi informado um texto de justificação." sem que o usuário edite nada

#### Scenario: Documento aberto sem justificação

- **WHEN** o usuário abre um documento cuja justificação está vazia
- **THEN** a aba Avisos exibe o alerta de justificação junto com os demais alertas produzidos na abertura

#### Scenario: Documento aberto com justificação

- **WHEN** a edição é iniciada com uma proposição cuja justificação tem texto
- **THEN** a aba Avisos não exibe o alerta de justificação

### Requirement: Atualização do alerta de justificação durante a edição

O sistema SHALL reavaliar o alerta de justificação depois de cada alteração no texto da justificação, no máximo cerca de 1 segundo depois da última alteração, e também depois de cada alteração na articulação.

#### Scenario: Preencher a justificação

- **WHEN** o alerta de justificação está exibido e o usuário digita um texto na justificação
- **THEN** o alerta deixa de ser exibido logo depois que o usuário para de digitar, sem precisar editar a articulação

#### Scenario: Esvaziar a justificação

- **WHEN** a justificação tem texto e o usuário apaga todo o texto
- **THEN** o alerta de justificação volta a ser exibido logo depois da última alteração

### Requirement: Sem alerta quando a justificação não é obrigatória

Quando a justificação não for obrigatória, o sistema SHALL NOT exibir o alerta de justificação em nenhum momento da edição. Isso acontece no modo anexo de parecer e quando a configuração do editor desliga a obrigatoriedade.

#### Scenario: Anexo de parecer

- **WHEN** a edição é iniciada no modo anexo de parecer
- **THEN** a aba Avisos não exibe o alerta de justificação, nem ao abrir nem depois de editar a articulação

#### Scenario: Obrigatoriedade desligada na configuração

- **WHEN** a configuração do editor informa que a justificação não é obrigatória e a justificação está vazia
- **THEN** a aba Avisos não exibe o alerta de justificação
