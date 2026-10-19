## ADDED Requirements

### Requirement: Pendência de justificação não informada

Quando a justificação do documento em edição for obrigatória e não tiver texto, o sistema SHALL incluir, na lista de pendências dos metadados do LexEdit do arquivo salvo, o item "Não foi informado um texto de justificação.". A condição SHALL ser a mesma do alerta de justificação da aba Avisos. Ao abrir um documento, a lista de pendências gravada SHALL NOT ser usada para reconstruir o estado do editor.

#### Scenario: Pendência presente com justificação vazia

- **WHEN** o usuário salva um documento cuja justificação é obrigatória e está vazia
- **THEN** o arquivo salvo contém, na lista de pendências, o item "Não foi informado um texto de justificação."

#### Scenario: Pendência ausente com justificação preenchida

- **WHEN** o usuário salva um documento cuja justificação tem texto
- **THEN** o arquivo salvo não contém o item "Não foi informado um texto de justificação." na lista de pendências

#### Scenario: Pendência ausente quando a justificação não é obrigatória

- **WHEN** o usuário salva um documento no modo anexo de parecer, ou com a obrigatoriedade da justificação desligada na configuração do editor, e a justificação está vazia
- **THEN** o arquivo salvo não contém o item "Não foi informado um texto de justificação." na lista de pendências

#### Scenario: Pendência gravada não é lida ao abrir

- **WHEN** o usuário abre um arquivo cuja lista de pendências contém "Não foi informado um texto de justificação."
- **THEN** o editor recalcula a pendência a partir da justificação em edição, sem usar o item gravado

### Requirement: Ordem das pendências no arquivo salvo

Quando houver mais de uma pendência a gravar, o sistema SHALL gravar primeiro a pendência de justificação não informada e depois a de remissões internas inválidas.

#### Scenario: Justificação vazia e remissão inválida

- **WHEN** o usuário salva um documento com a justificação obrigatória vazia e ao menos uma remissão interna inválida
- **THEN** a lista de pendências do arquivo salvo contém exatamente "Não foi informado um texto de justificação." seguido de "Corrigir remissões internas inválidas."
