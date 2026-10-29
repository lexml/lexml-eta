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

## ADDED Requirements

### Requirement: Ida e volta do documento salvo pelo conversor jsonix-lexml
Ao converter em XML um documento salvo pelo editor e convertê-lo de volta em JSON pelo conversor `jsonix-lexml` 2.1.0, o sistema SHALL abrir o resultado com os mesmos valores de todos os grupos do LexEdit que suporta e com a mesma justificação, inclusive as notas de rodapé e as marcas de revisão de texto. Salvar de novo esse documento SHALL gerar um arquivo igual ao original. Exceção, enquanto o plugin de tabelas do editor não guardar largura: a largura de tabela e de coluna não volta ao editor, e o arquivo salvo de novo não a tem.

#### Scenario: Opções de impressão, fecho e remissão inválida voltam do XML
- **WHEN** um documento com opções de impressão alteradas, local e data do fecho e uma remissão interna inválida é salvo, convertido em XML, convertido de volta em JSON e aberto
- **THEN** o formulário de opções de impressão, o campo "Data" e o local exibem os valores salvos, e a remissão é reconstruída como inválida
- **AND** salvar esse documento aberto gera um arquivo igual ao salvo originalmente

#### Scenario: Pendência de justificação na ida e volta com justificação vazia
- **WHEN** um documento com a justificação obrigatória vazia é salvo, convertido em XML, convertido de volta em JSON e aberto
- **THEN** salvar esse documento aberto gera um arquivo igual ao salvo originalmente, com a pendência "Não foi informado um texto de justificação."

#### Scenario: Justificação preenchida na ida e volta
- **WHEN** um documento com a justificação preenchida, com texto formatado, lista, link, tabela sem largura, imagem com largura e notas de rodapé, é salvo, convertido em XML, convertido de volta em JSON e aberto
- **THEN** salvar esse documento aberto gera um arquivo igual ao salvo originalmente, com os mesmos `NotaDeRodape` e sem a pendência "Não foi informado um texto de justificação."

#### Scenario: Revisões de texto na ida e volta
- **WHEN** um documento com marcas de revisão de texto na justificação, uma delas com nota de rodapé no trecho excluído, é salvo, convertido em XML, convertido de volta em JSON e aberto
- **THEN** o editor exibe as mesmas marcas, com o mesmo autor e a mesma data
- **AND** salvar esse documento aberto gera um arquivo igual ao salvo originalmente, com os mesmos `ins`, `del`, `RevisoesTextuais`, `Usuarios` e a pendência "Resolver marcas de revisão de texto."

### Requirement: Revisões de texto compatíveis com o conversor LexML
O sistema SHALL gravar `RevisoesTextuais` no formato tipado do conversor `jsonix-lexml` 2.1.0, conforme `schemas/lexedit.xsd`. O conversor SHALL converter o arquivo em XML sem erro e sem descartar nenhum `ins`, `del`, `RevisaoTextual` ou atributo deles, e o XML gerado SHALL ser válido pelo `schemas/lexedit.xsd`, inclusive quanto à unicidade dos `id` de `ins` e `del`.

#### Scenario: Conversão para XML preserva as revisões de texto
- **WHEN** o usuário salva um documento com marcas de inclusão, exclusão e substituição na justificação, e o arquivo é convertido em XML pelo conversor
- **THEN** o XML contém os `ins` e `del` com os `id` de prefixo `_rt` e um `lexedit:RevisaoTextual` para cada um, com `refIdRevisao`, `refIdUsuario` e `data`

#### Scenario: XML válido pelo esquema do LexEdit
- **WHEN** o XML gerado a partir de um documento com marcas de revisão de texto é validado com `schemas/lexedit.xsd`
- **THEN** a validação não aponta erro, nem na parte LexML nem no conteúdo de `lexedit:Metadado`

## REMOVED Requirements

### Requirement: Ida e volta do documento salvo pelo conversor
**Reason**: A exceção temporária das revisões de texto acabou, e o cenário "Exceção temporária com nota de rodapé ou revisão de texto" não pode sair por MODIFIED.
**Migration**: O requisito "Ida e volta do documento salvo pelo conversor jsonix-lexml" o substitui, com os mesmos cenários e o de revisões de texto no lugar da exceção.
