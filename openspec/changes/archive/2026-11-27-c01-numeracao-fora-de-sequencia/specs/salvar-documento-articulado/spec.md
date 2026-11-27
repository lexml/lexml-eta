# Spec Delta

## MODIFIED Requirements

### Requirement: Ordem das pendências no arquivo salvo
Quando houver mais de uma pendência a gravar, o sistema SHALL gravar, nesta ordem, as que existirem: justificação não informada, numeração irregular, remissões internas inválidas, comentários, revisões de texto e revisões da hierarquia.

#### Scenario: Justificação vazia e remissão inválida
- **WHEN** o usuário salva um documento com a justificação obrigatória vazia e ao menos uma remissão interna inválida
- **THEN** a lista de pendências do arquivo salvo contém exatamente "Não foi informado um texto de justificação." seguido de "Corrigir remissões internas inválidas."

#### Scenario: Remissão inválida e revisões de texto e da hierarquia
- **WHEN** o usuário salva um documento com uma remissão interna inválida, uma marca de revisão de texto na justificação e uma revisão da hierarquia
- **THEN** a lista de pendências do arquivo salvo contém exatamente "Corrigir remissões internas inválidas.", "Resolver marcas de revisão de texto." e "Resolver marcas de revisão na articulação.", nessa ordem

#### Scenario: Comentário entre remissões e revisões
- **WHEN** o usuário salva um documento com uma remissão interna inválida, um trecho comentado na justificação e uma marca de revisão de texto
- **THEN** a lista de pendências do arquivo salvo contém exatamente "Corrigir remissões internas inválidas.", "Remover comentários." e "Resolver marcas de revisão de texto.", nessa ordem

#### Scenario: Numeração repetida entre justificação e remissões
- **WHEN** o usuário salva, no modo flexível, um documento com a justificação obrigatória vazia, dois "Art. 5º" e uma remissão interna inválida
- **THEN** a lista de pendências do arquivo salvo contém exatamente "Não foi informado um texto de justificação.", "Existem dispositivos com numeração irregular." e "Corrigir remissões internas inválidas.", nessa ordem

### Requirement: Pendência de numeração repetida
Enquanto houver dispositivo com complemento na numeração, com lacuna na numeração ou com numeração fora de ordem, ou, no modo flexível, com numeração repetida, o sistema SHALL incluir, na lista de pendências dos metadados do LexEdit do arquivo salvo, um único item "Existem dispositivos com numeração irregular.". A condição SHALL ser a mesma do alerta de numeração irregular da aba Avisos. Ao abrir um documento, a pendência gravada SHALL NOT ser usada para reconstruir o estado do editor.

#### Scenario: Pendência presente com numeração repetida
- **WHEN** o usuário salva, no modo flexível, um documento com dois "Art. 5º"
- **THEN** o arquivo salvo contém, na lista de pendências, o item "Existem dispositivos com numeração irregular."

#### Scenario: Pendência presente com lacuna e fora de ordem
- **WHEN** o usuário salva, em qualquer dos modos, um documento com os artigos 1, 3, 2 e 4, nessa ordem
- **THEN** o arquivo salvo contém, uma única vez, o item "Existem dispositivos com numeração irregular."

#### Scenario: Pendência ausente depois da correção
- **WHEN** o usuário corrige a numeração irregular e salva
- **THEN** o arquivo salvo não contém o item "Existem dispositivos com numeração irregular."

#### Scenario: Pendência gravada não é lida ao abrir
- **WHEN** o usuário abre, no modo flexível, um arquivo cuja lista de pendências contém "Existem dispositivos com numeração irregular.", mas cuja numeração não tem irregularidade
- **THEN** a aba Avisos não exibe o alerta de numeração irregular

#### Scenario: Pendência antiga gravada não é lida ao abrir
- **WHEN** o usuário abre, no modo flexível, um arquivo salvo antes desta mudança, cuja lista de pendências contém "Existem dispositivos com numeração repetida.", mas cuja numeração não tem irregularidade
- **THEN** a aba Avisos não exibe o alerta de numeração irregular
