# Spec Delta

## ADDED Requirements

### Requirement: Grupo de usuários referenciados
O sistema SHALL gravar o grupo `Usuarios` em `lexedit:Metadado` somente quando houver ao menos uma referência `refIdUsuario` a registrar, sem repetir usuários, e SHALL ler o grupo ao abrir de forma independente dos demais grupos.

#### Scenario: Documento sem referência a usuário
- **WHEN** o usuário salva um documento sem nenhum grupo que referencie usuários
- **THEN** o arquivo salvo não contém `Usuarios`

#### Scenario: Convivência com os demais grupos
- **WHEN** o usuário salva um documento com opções de impressão, autoria, remissão interna inválida e revisões da hierarquia
- **THEN** o arquivo salvo contém um único `MetadadoProprietario` com todos os grupos, e `Usuarios` com os usuários das revisões

### Requirement: Revisões da hierarquia compatíveis com o conversor LexML
O sistema SHALL gravar `RevisoesArticulacao` no formato tipado do conversor `jsonix-lexml` 2.0.0, conforme `schemas/lexedit.xsd`, incluindo o conteúdo filho de cada `RevisaoArticulacao` (parágrafo do texto anterior ou dispositivo excluído com sua hierarquia). O conversor SHALL converter o arquivo em XML sem erro e sem descartar nenhum atributo ou conteúdo das revisões.

#### Scenario: Conversão para XML preserva as revisões
- **WHEN** o usuário salva um documento com revisões de adição, exclusão, alteração, movimentação e transformação, e o arquivo é convertido em XML pelo conversor
- **THEN** o XML contém um `lexedit:RevisaoArticulacao` por revisão principal, com `revisao`, `refIdUsuario` e `data`, e o conteúdo filho de cada uma

#### Scenario: XML válido pelo esquema do LexEdit
- **WHEN** o XML gerado a partir de um documento com revisões da hierarquia é validado com `schemas/lexedit.xsd`
- **THEN** a validação não aponta erro, nem na parte LexML nem no conteúdo de `lexedit:Metadado`

#### Scenario: Ida e volta pelo conversor
- **WHEN** um documento com revisões da hierarquia é salvo, convertido em XML, convertido de volta em JSON e aberto
- **THEN** o editor exibe as mesmas revisões, e salvar esse documento gera um arquivo igual ao original
