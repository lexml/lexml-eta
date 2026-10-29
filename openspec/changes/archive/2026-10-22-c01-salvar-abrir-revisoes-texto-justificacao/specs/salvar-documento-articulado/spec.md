## MODIFIED Requirements

### Requirement: Revisões de texto na justificação gravada
Ao gravar a justificação, o sistema SHALL gravar cada marca de revisão de texto como `ins` (texto incluído) ou `del` (texto excluído), no ponto do texto em que está, com o conteúdo e a formatação que tiver, inclusive notas de rodapé. Cada `ins`/`del` SHALL ter um `id` de prefixo `_rt`, único no documento, e um `RevisaoTextual` nos metadados do LexEdit com esse `id` em `refIdRevisao`, o autor em `refIdUsuario` e a data com fuso horário. O arquivo salvo SHALL ser válido pelo esquema LexML.

#### Scenario: Justificação com marcas de revisão
- **WHEN** o usuário salva uma justificação com um trecho incluído e um trecho excluído em revisão de texto
- **THEN** o texto gravado contém o trecho incluído dentro de um `ins` e o trecho excluído dentro de um `del`, cada um com `id` de prefixo `_rt`
- **AND** `RevisoesTextuais` contém um `RevisaoTextual` para cada um, com `refIdRevisao` igual ao `id`, o `refIdUsuario` do autor e a data da revisão

#### Scenario: Revisão em mais de um trecho
- **WHEN** o usuário salva uma justificação com uma revisão que substituiu um trecho (exclusão e inclusão na mesma ação) e outra que excluiu um trecho com parte em negrito
- **THEN** cada `ins` e cada `del` gravado tem um `id` diferente dos demais, e cada um tem o seu `RevisaoTextual`

#### Scenario: Nota de rodapé em trecho excluído
- **WHEN** o usuário salva uma justificação com uma nota de rodapé dentro de um trecho excluído em revisão
- **THEN** o `del` gravado contém o `NotaDeRodape` da nota

#### Scenario: Justificação sem marcas de revisão
- **WHEN** o usuário salva uma justificação sem nenhuma marca de revisão de texto
- **THEN** o arquivo salvo não contém `ins`, `del` nem `RevisoesTextuais`

#### Scenario: Modo anexo de parecer
- **WHEN** o usuário salva, no modo anexo de parecer, um documento com marcas de revisão de texto na justificação
- **THEN** o arquivo salvo não contém `RevisoesTextuais`

### Requirement: Registro de usuários das revisões
O sistema SHALL registrar em `Usuarios` dos metadados do LexEdit cada usuário referenciado por alguma revisão da hierarquia ou de texto, uma única vez, com `idUsuario` igual ao identificador fornecido pelo host, `nome` e, quando houver, `sigla`. Sem identificador, `idUsuario` SHALL ser o nome. `refIdUsuario` de cada revisão SHALL referenciar um `idUsuario` registrado.

#### Scenario: Dois usuários revisando
- **WHEN** duas revisões feitas pelo usuário `sf:fulano` e uma pelo usuário `sf:ciclana` são salvas
- **THEN** `Usuarios` contém um registro para cada um, e cada `refIdUsuario` referencia um deles

#### Scenario: Usuário sem identificador
- **WHEN** uma revisão é feita por um usuário sem identificador, de nome "Anônimo"
- **THEN** o registro em `Usuarios` e o `refIdUsuario` correspondente usam `Anônimo` como identificador

#### Scenario: Mesmo usuário nos dois tipos de revisão
- **WHEN** o usuário `sf:fulano`, de sigla "FT", faz uma revisão da hierarquia e uma revisão de texto na justificação, e o documento é salvo
- **THEN** `Usuarios` contém um único registro de `sf:fulano`, com a sigla "FT", referenciado pelas duas revisões

#### Scenario: Marca de revisão de texto sem identificador do usuário
- **WHEN** a justificação recebida do host tem uma marca de revisão de texto que só informa o nome do autor, "Fulano de Tal", e o documento é salvo
- **THEN** o registro em `Usuarios` e o `refIdUsuario` da marca usam `Fulano de Tal` como identificador

### Requirement: Ordem das pendências no arquivo salvo
Quando houver mais de uma pendência a gravar, o sistema SHALL gravar, nesta ordem, as que existirem: justificação não informada, remissões internas inválidas, revisões de texto e revisões da hierarquia.

#### Scenario: Justificação vazia e remissão inválida
- **WHEN** o usuário salva um documento com a justificação obrigatória vazia e ao menos uma remissão interna inválida
- **THEN** a lista de pendências do arquivo salvo contém exatamente "Não foi informado um texto de justificação." seguido de "Corrigir remissões internas inválidas."

#### Scenario: Remissão inválida e revisões de texto e da hierarquia
- **WHEN** o usuário salva um documento com uma remissão interna inválida, uma marca de revisão de texto na justificação e uma revisão da hierarquia
- **THEN** a lista de pendências do arquivo salvo contém exatamente "Corrigir remissões internas inválidas.", "Resolver marcas de revisão de texto." e "Resolver marcas de revisão na articulação.", nessa ordem

## ADDED Requirements

### Requirement: Pendência de revisões de texto
Enquanto houver ao menos uma marca de revisão de texto na justificação gravada, o sistema SHALL incluir na lista de pendências dos metadados do LexEdit o item "Resolver marcas de revisão de texto.". Ao abrir um documento, o item gravado SHALL NOT ser usado para reconstruir o estado do editor.

#### Scenario: Pendência presente com marca de revisão
- **WHEN** o usuário salva um documento com ao menos uma marca de revisão de texto na justificação
- **THEN** a lista de pendências contém "Resolver marcas de revisão de texto."

#### Scenario: Pendência ausente após resolver as marcas
- **WHEN** o usuário aceita ou rejeita todas as marcas de revisão de texto da justificação e salva
- **THEN** a lista de pendências não contém esse item

#### Scenario: Pendência ausente no modo anexo de parecer
- **WHEN** o usuário salva, no modo anexo de parecer, um documento com marca de revisão de texto na justificação
- **THEN** a lista de pendências não contém esse item
