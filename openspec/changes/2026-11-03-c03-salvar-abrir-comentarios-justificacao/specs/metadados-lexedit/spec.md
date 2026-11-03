## ADDED Requirements

### Requirement: Comentários compatíveis com o conversor LexML

O sistema SHALL gravar `Comentarios` no formato tipado do conversor `jsonix-lexml`, conforme `schemas/lexedit.xsd`. O conversor SHALL converter o arquivo em XML sem erro e sem descartar nenhum `span` `_tc`, `SequenciaComentario`, `Comentario` ou atributo deles, e o XML gerado SHALL ser válido pelo `schemas/lexedit.xsd`, inclusive quanto à unicidade dos `id` dos `span`, `ins` e `del`.

#### Scenario: Conversão para XML preserva os comentários

- **WHEN** o usuário salva um documento com um trecho comentado em dois fragmentos e uma resposta, e o arquivo é convertido em XML pelo conversor
- **THEN** o XML contém os dois `span` com `id` de prefixo `_tc` e um `lexedit:SequenciaComentario` com `refIdElementoComentado` e dois `lexedit:Comentario`, com `refIdUsuario`, `data` e os `p` do texto

#### Scenario: XML válido pelo esquema do LexEdit

- **WHEN** o XML gerado a partir de um documento com comentários sobre texto com marcas de revisão é validado com `schemas/lexedit.xsd`
- **THEN** a validação não aponta erro, nem na parte LexML nem no conteúdo de `lexedit:Metadado`

## MODIFIED Requirements

### Requirement: Grupo de usuários referenciados
O sistema SHALL gravar o grupo `Usuarios` em `lexedit:Metadado` somente quando houver ao menos uma referência `refIdUsuario` a registrar, sem repetir usuários, e SHALL ler o grupo ao abrir de forma independente dos demais grupos.

#### Scenario: Documento sem referência a usuário
- **WHEN** o usuário salva um documento sem nenhum grupo que referencie usuários
- **THEN** o arquivo salvo não contém `Usuarios`

#### Scenario: Convivência com os demais grupos
- **WHEN** o usuário salva um documento com opções de impressão, autoria, remissão interna inválida, revisões da hierarquia e revisões de texto na justificação
- **THEN** o arquivo salvo contém um único `MetadadoProprietario` com todos os grupos, e `Usuarios` com os usuários dos dois tipos de revisão

#### Scenario: Somente revisões de texto
- **WHEN** o usuário salva um documento sem revisões da hierarquia e com uma marca de revisão de texto na justificação
- **THEN** o arquivo salvo contém `Usuarios` com o autor da marca, e não contém `RevisoesArticulacao`

#### Scenario: Autores dos comentários
- **WHEN** o usuário salva um documento com uma sequência de comentários de dois autores, um deles também autor de uma marca de revisão de texto
- **THEN** o arquivo salvo contém `Usuarios` com os dois autores, cada um uma única vez
