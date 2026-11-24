# Spec Delta

## ADDED Requirements

### Requirement: Identificadores de dispositivo repetidos ao salvar
No modo flexível de validação de numeração (ver `numeracao-repetida`), o sistema SHALL gerar o arquivo mesmo quando dispositivos tiverem identificadores repetidos, e SHALL gravar esses identificadores como estão, sem desambiguá-los. No modo rígido, a tentativa de salvar um documento com identificadores repetidos SHALL falhar com erro descritivo, que é propagado à aplicação consumidora.

#### Scenario: Salvar com artigos repetidos no modo flexível
- **WHEN** o usuário salva, no modo flexível, um documento com dois "Art. 5º"
- **THEN** o arquivo é gerado, e os dois artigos têm o `id` `art5`

#### Scenario: Ida e volta no modo flexível
- **WHEN** o arquivo salvo no modo flexível com dois "Art. 5º" é reaberto no modo flexível
- **THEN** os dois artigos são reabertos, e o segundo exibe o erro de numeração repetida

#### Scenario: Salvar com identificadores repetidos no modo rígido
- **WHEN** o usuário salva, no modo rígido, um documento em que dois artigos irmãos de um bloco de alteração foram renumerados para o mesmo número
- **THEN** o arquivo não é gerado e o erro de identificadores repetidos é propagado à aplicação consumidora

### Requirement: Pendência de numeração repetida
Enquanto houver dispositivo com numeração repetida, no modo flexível, o sistema SHALL incluir, na lista de pendências dos metadados do LexEdit do arquivo salvo, o item "Existem dispositivos com numeração repetida.". A condição SHALL ser a mesma do alerta de numeração repetida da aba Avisos. Ao abrir um documento, a pendência gravada SHALL NOT ser usada para reconstruir o estado do editor.

#### Scenario: Pendência presente com numeração repetida
- **WHEN** o usuário salva, no modo flexível, um documento com dois "Art. 5º"
- **THEN** o arquivo salvo contém, na lista de pendências, o item "Existem dispositivos com numeração repetida."

#### Scenario: Pendência ausente depois da correção
- **WHEN** o usuário corrige a numeração repetida e salva
- **THEN** o arquivo salvo não contém o item "Existem dispositivos com numeração repetida."

#### Scenario: Pendência gravada não é lida ao abrir
- **WHEN** o usuário abre, no modo flexível, um arquivo cuja lista de pendências contém "Existem dispositivos com numeração repetida.", mas cuja numeração não se repete
- **THEN** a aba Avisos não exibe o alerta de numeração repetida

## MODIFIED Requirements

### Requirement: Ordem das pendências no arquivo salvo
Quando houver mais de uma pendência a gravar, o sistema SHALL gravar, nesta ordem, as que existirem: justificação não informada, numeração repetida, remissões internas inválidas, comentários, revisões de texto e revisões da hierarquia.

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
- **THEN** a lista de pendências do arquivo salvo contém exatamente "Não foi informado um texto de justificação.", "Existem dispositivos com numeração repetida." e "Corrigir remissões internas inválidas.", nessa ordem
