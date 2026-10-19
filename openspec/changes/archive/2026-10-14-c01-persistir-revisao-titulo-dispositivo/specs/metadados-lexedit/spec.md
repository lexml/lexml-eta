# Spec Delta

## MODIFIED Requirements

### Requirement: Revisões da hierarquia compatíveis com o conversor LexML
O sistema SHALL gravar `RevisoesArticulacao` no formato tipado do conversor `jsonix-lexml` 2.0.0, conforme `schemas/lexedit.xsd`, incluindo o conteúdo filho de cada `RevisaoArticulacao` (dispositivo com o estado anterior, com o texto e o título anteriores, ou dispositivo excluído com sua hierarquia). O conversor SHALL converter o arquivo em XML sem erro e sem descartar nenhum atributo ou conteúdo das revisões.

#### Scenario: Conversão para XML preserva as revisões
- **WHEN** o usuário salva um documento com revisões de adição, exclusão, alteração, movimentação e transformação, e o arquivo é convertido em XML pelo conversor
- **THEN** o XML contém um `lexedit:RevisaoArticulacao` por revisão principal, com `revisao`, `refIdUsuario` e `data`, e o conteúdo filho de cada uma

#### Scenario: XML válido pelo esquema do LexEdit
- **WHEN** o XML gerado a partir de um documento com revisões da hierarquia é validado com `schemas/lexedit.xsd`
- **THEN** a validação não aponta erro, nem na parte LexML nem no conteúdo de `lexedit:Metadado`

#### Scenario: Ida e volta pelo conversor
- **WHEN** um documento com revisões da hierarquia é salvo, convertido em XML, convertido de volta em JSON e aberto
- **THEN** o editor exibe as mesmas revisões, e salvar esse documento gera um arquivo igual ao original

#### Scenario: Conversão preserva o estado anterior com título
- **WHEN** um documento com revisões de texto, e de adição, alteração e remoção de título, uma delas com formatação no título, em inciso e em artigo, é convertido em XML pelo conversor e validado com `schemas/lexedit.xsd`
- **THEN** o XML contém o `TituloDispositivo` anterior, com a formatação, dentro de cada revisão que o tinha, não contém `TituloDispositivo` onde não havia título, a validação não aponta erro, e a conversão de volta reproduz as mesmas revisões
