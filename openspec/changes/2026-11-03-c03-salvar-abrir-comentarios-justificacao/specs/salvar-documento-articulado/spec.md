## ADDED Requirements

### Requirement: Comentários na justificação gravada

Ao gravar a justificação, o sistema SHALL gravar cada trecho comentado como `span` com `id` de prefixo `_tc`, no ponto do texto em que está e com o conteúdo e a formatação que tiver, inclusive marcas de revisão de texto e notas de rodapé. Cada sequência de comentários SHALL ser gravada como um `SequenciaComentario` nos metadados do LexEdit, com `refIdElementoComentado` igual ao `id` do trecho e um `Comentario` por comentário, na ordem da sequência, com o autor em `refIdUsuario`, a data com fuso horário em `data` e o texto em parágrafos `p`, um por linha. A marcação de trecho sem sequência SHALL ser gravada só como texto. O arquivo salvo SHALL ser válido pelo esquema LexML.

#### Scenario: Trecho comentado com resposta

- **WHEN** o usuário salva uma justificação com um trecho comentado cuja sequência tem um comentário e uma resposta
- **THEN** o texto gravado contém o trecho dentro de um `span` com `id` de prefixo `_tc`
- **AND** `Comentarios` contém um `SequenciaComentario` com `refIdElementoComentado` igual a esse `id` e dois `Comentario`, na ordem, cada um com o `refIdUsuario` do autor, a data e o texto

#### Scenario: Comentário em duas linhas

- **WHEN** o usuário salva um comentário escrito em duas linhas
- **THEN** o `Comentario` gravado tem dois `p`, um para cada linha

#### Scenario: Justificação sem comentários

- **WHEN** o usuário salva uma justificação sem nenhum trecho comentado
- **THEN** o arquivo salvo não contém `span` com `id` de prefixo `_tc` nem `Comentarios`

#### Scenario: Modo anexo de parecer

- **WHEN** o usuário salva um documento no modo anexo de parecer
- **THEN** o arquivo salvo não contém `Comentarios`

### Requirement: Trecho comentado em vários fragmentos

Um trecho comentado pode ocupar mais de um elemento no texto, por atravessar parágrafos ou por conter marcas de revisão ou formatação que o dividem. O sistema SHALL gravar um `span` por fragmento, com `id` `_tc<id da sequência>_<n>`, em que `n` é a posição do fragmento entre os da mesma sequência, a partir de 1, na ordem do documento; um trecho de um só fragmento também recebe o sufixo `_1`. O `refIdElementoComentado` da sequência SHALL ser o `id` do primeiro fragmento. Todo `id` gravado SHALL ser único no documento.

#### Scenario: Trecho em dois parágrafos

- **WHEN** o usuário salva uma justificação com um trecho comentado que começa num parágrafo e termina no seguinte
- **THEN** cada parágrafo contém um `span` do trecho, com `id` terminados em `_1` e `_2` e a mesma parte central
- **AND** o `refIdElementoComentado` da sequência é o `id` terminado em `_1`

#### Scenario: Trecho dividido por marca de revisão

- **WHEN** o usuário salva um trecho comentado que contém, no meio, um texto incluído em revisão
- **THEN** os `id` de todos os `span` e de todos os `ins` e `del` gravados são diferentes entre si

### Requirement: Pendência de comentários

Enquanto houver ao menos uma sequência de comentários gravada, o sistema SHALL incluir na lista de pendências dos metadados do LexEdit o item "Remover comentários.". Ao abrir um documento, o item gravado SHALL NOT ser usado para reconstruir o estado do editor.

#### Scenario: Pendência presente com comentário

- **WHEN** o usuário salva um documento com ao menos um trecho comentado na justificação
- **THEN** a lista de pendências contém "Remover comentários."

#### Scenario: Pendência ausente depois de excluir os comentários

- **WHEN** o usuário exclui todas as sequências de comentários e salva
- **THEN** a lista de pendências não contém "Remover comentários."

## MODIFIED Requirements

### Requirement: Ordem das pendências no arquivo salvo
Quando houver mais de uma pendência a gravar, o sistema SHALL gravar, nesta ordem, as que existirem: justificação não informada, remissões internas inválidas, comentários, revisões de texto e revisões da hierarquia.

#### Scenario: Justificação vazia e remissão inválida
- **WHEN** o usuário salva um documento com a justificação obrigatória vazia e ao menos uma remissão interna inválida
- **THEN** a lista de pendências do arquivo salvo contém exatamente "Não foi informado um texto de justificação." seguido de "Corrigir remissões internas inválidas."

#### Scenario: Remissão inválida e revisões de texto e da hierarquia
- **WHEN** o usuário salva um documento com uma remissão interna inválida, uma marca de revisão de texto na justificação e uma revisão da hierarquia
- **THEN** a lista de pendências do arquivo salvo contém exatamente "Corrigir remissões internas inválidas.", "Resolver marcas de revisão de texto." e "Resolver marcas de revisão na articulação.", nessa ordem

#### Scenario: Comentário entre remissões e revisões
- **WHEN** o usuário salva um documento com uma remissão interna inválida, um trecho comentado na justificação e uma marca de revisão de texto
- **THEN** a lista de pendências do arquivo salvo contém exatamente "Corrigir remissões internas inválidas.", "Remover comentários." e "Resolver marcas de revisão de texto.", nessa ordem
