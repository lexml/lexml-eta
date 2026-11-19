## MODIFIED Requirements

### Requirement: Comentários compatíveis com o conversor LexML

O sistema SHALL gravar `Comentarios` no formato tipado do conversor `jsonix-lexml`, conforme `schemas/lexedit.xsd`. O conversor SHALL converter o arquivo em XML sem erro e sem descartar nenhum `span` `_tc`, `SequenciaComentario`, `Comentario` ou atributo deles, seja o `refIdElementoComentado` de um trecho da justificação, seja de um dispositivo da articulação, e o XML gerado SHALL ser válido pelo `schemas/lexedit.xsd`, inclusive quanto à unicidade dos `id` dos `span`, `ins` e `del`.

#### Scenario: Conversão para XML preserva os comentários

- **WHEN** o usuário salva um documento com um trecho comentado em dois fragmentos e uma resposta, e o arquivo é convertido em XML pelo conversor
- **THEN** o XML contém os dois `span` com `id` de prefixo `_tc` e um `lexedit:SequenciaComentario` com `refIdElementoComentado` e dois `lexedit:Comentario`, com `refIdUsuario`, `data` e os `p` do texto

#### Scenario: Conversão preserva os comentários da articulação

- **WHEN** o usuário salva um documento com comentários num artigo, num inciso e num dispositivo excluído em revisão, e o arquivo é convertido em XML pelo conversor e de volta
- **THEN** o XML contém um `lexedit:SequenciaComentario` para cada um, com o `refIdElementoComentado` gravado, e a volta do XML produz os mesmos `Comentarios`

#### Scenario: XML válido pelo esquema do LexEdit

- **WHEN** o XML gerado a partir de um documento com comentários sobre texto com marcas de revisão é validado com `schemas/lexedit.xsd`
- **THEN** a validação não aponta erro, nem na parte LexML nem no conteúdo de `lexedit:Metadado`
