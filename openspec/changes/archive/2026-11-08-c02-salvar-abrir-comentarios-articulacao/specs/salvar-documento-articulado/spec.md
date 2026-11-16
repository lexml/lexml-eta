## ADDED Requirements

### Requirement: Comentários na articulação gravados

Ao salvar, o sistema SHALL gravar cada sequência de comentários de um dispositivo como um `SequenciaComentario` nos metadados do LexEdit, no mesmo grupo `Comentarios` das sequências da justificação, com `refIdElementoComentado` igual ao `id` gravado do dispositivo e os comentários no mesmo formato da justificação. Para um artigo, o `refIdElementoComentado` SHALL ser o `id` do caput. Para um dispositivo excluído em revisão, SHALL ser o `id` com que o dispositivo é gravado na revisão de exclusão. As sequências da articulação SHALL vir antes das da justificação, na ordem dos dispositivos no texto. Os autores SHALL entrar em `Usuarios` e a pendência "Remover comentários." SHALL ser gravada como para a justificação. No modo anexo de parecer, as sequências da articulação também SHALL ser gravadas.

#### Scenario: Comentário num inciso

- **WHEN** o usuário salva um documento com uma sequência no inciso I do art. 3º, cujo `id` é `art3_cpt_inc1`
- **THEN** `Comentarios` contém um `SequenciaComentario` com `refIdElementoComentado` igual a `art3_cpt_inc1`
- **AND** a lista de pendências contém "Remover comentários."

#### Scenario: Comentário num artigo

- **WHEN** o usuário salva um documento com uma sequência no art. 2º
- **THEN** o `refIdElementoComentado` da sequência é `art2_cpt`

#### Scenario: Id depois da renumeração

- **WHEN** o usuário comenta o art. 3º, inclui um artigo antes dele e salva
- **THEN** o `refIdElementoComentado` da sequência é `art4_cpt`

#### Scenario: Ementa

- **WHEN** o usuário salva um documento com uma sequência na ementa
- **THEN** o `refIdElementoComentado` da sequência é `ementa`

#### Scenario: Dispositivo excluído em revisão

- **WHEN** o usuário salva um documento com um parágrafo comentado excluído em revisão
- **THEN** o `refIdElementoComentado` da sequência é igual ao `id` do parágrafo gravado na revisão de exclusão

#### Scenario: Articulação e justificação

- **WHEN** o usuário salva um documento com uma sequência na justificação e, criada depois, uma sequência no art. 2º
- **THEN** `Comentarios` contém primeiro a sequência do art. 2º e depois a da justificação

#### Scenario: Anexo de parecer

- **WHEN** o usuário salva no modo anexo de parecer um documento com uma sequência no art. 1º
- **THEN** o arquivo salvo contém `Comentarios` com a sequência do art. 1º e a pendência "Remover comentários."

## MODIFIED Requirements

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
- **THEN** o arquivo salvo não contém `span` com `id` de prefixo `_tc`

#### Scenario: Modo anexo de parecer

- **WHEN** o usuário salva um documento no modo anexo de parecer
- **THEN** o arquivo salvo não contém `span` com `id` de prefixo `_tc` nem `SequenciaComentario` cujo `refIdElementoComentado` tenha prefixo `_tc`
