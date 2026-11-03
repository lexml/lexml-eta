## ADDED Requirements

### Requirement: Serialização da justificação
Ao salvar, o sistema SHALL gravar a justificação do documento em edição em `ProjetoNorma/Justificacao/PartePrincipal`, com o conteúdo rico no subconjunto HTML do LexML. O sistema SHALL NOT gravar `Justificacao` quando a justificação não tiver conteúdo nem no modo anexo de parecer. O arquivo salvo SHALL ser válido pelo esquema LexML.

#### Scenario: Justificação com texto formatado
- **WHEN** o usuário salva um documento cuja justificação tem parágrafos com negrito, itálico, sublinhado, sobrescrito, alinhamento e uma lista
- **THEN** o arquivo salvo contém `Justificacao/PartePrincipal` com esses parágrafos e a lista, com as mesmas marcações e classes de alinhamento

#### Scenario: Justificação vazia
- **WHEN** o usuário salva um documento cuja justificação está vazia ou só tem parágrafos vazios
- **THEN** o arquivo salvo não contém `Justificacao`

#### Scenario: Modo anexo de parecer
- **WHEN** o usuário salva um documento no modo anexo de parecer
- **THEN** o arquivo salvo não contém `Justificacao`

#### Scenario: Valor do momento do salvamento
- **WHEN** o usuário salva o documento e depois altera a justificação
- **THEN** o arquivo já obtido mantém a justificação do momento em que foi salvo

### Requirement: Adaptação do conteúdo rico da justificação ao LexML
Ao gravar a justificação, o sistema SHALL converter o conteúdo do editor para o que o esquema LexML aceita, sem perder texto nem formatação suportada: negrito e itálico como `b` e `i`; link com `xlink:href`, sem `rel`; tabela sem `tbody`, sem atributos de controle do editor e sem células ocultas de mesclagem, com `id` `_tabela<sequencial>` na ordem das tabelas; parágrafo dentro de célula como `span` com a classe `p`; largura em `style`; imagem dentro de parágrafo; sem quebras de linha `br`.

#### Scenario: Tabela com células mescladas e largura
- **WHEN** o usuário salva uma justificação com uma tabela que tem largura de 80%, uma coluna de 40% e uma célula que ocupa duas colunas
- **THEN** a tabela gravada tem `id` `_tabela1` e `style` `width: 80%`, a célula tem `colspan` 2 e a coluna tem `style` `width: 40%`
- **AND** a tabela gravada não tem `tbody`, `table_id`, `row_id`, `cell_id` nem a célula oculta de mesclagem

#### Scenario: Célula com dois parágrafos
- **WHEN** o usuário salva uma justificação com uma célula de tabela que tem dois parágrafos, o primeiro centralizado
- **THEN** a célula gravada contém dois `span`, o primeiro com as classes `p` e de alinhamento centralizado, e o segundo com a classe `p`

#### Scenario: Duas tabelas
- **WHEN** o usuário salva uma justificação com duas tabelas
- **THEN** as tabelas gravadas têm os `id` `_tabela1` e `_tabela2`, na ordem do texto

#### Scenario: Link
- **WHEN** o usuário salva uma justificação com um link para `https://www.congressonacional.leg.br`
- **THEN** o link gravado é um `a` com `xlink:href` igual a esse endereço e sem `rel`

#### Scenario: Imagem com largura
- **WHEN** o usuário salva uma justificação com uma imagem inserida pelo editor, com largura de 50%
- **THEN** a imagem é gravada como `img` dentro de um parágrafo, com o mesmo `src` e `style` `width: 50%`

#### Scenario: Parágrafo vazio
- **WHEN** o usuário salva uma justificação com um parágrafo vazio entre dois parágrafos com texto
- **THEN** o parágrafo vazio é gravado sem conteúdo, sem `br`

### Requirement: Notas de rodapé e revisões na justificação gravada
Enquanto notas de rodapé e marcas de revisão de texto não forem gravadas no arquivo (issues #993 e #994), o sistema SHALL gravar a justificação sem elas: a nota de rodapé é retirada, o texto incluído em revisão fica sem a marca, e o texto excluído em revisão é descartado. O restante da justificação SHALL ser gravado normalmente.

#### Scenario: Justificação com nota de rodapé
- **WHEN** o usuário salva uma justificação com uma nota de rodapé num parágrafo
- **THEN** o parágrafo gravado tem o texto sem a nota de rodapé

#### Scenario: Justificação com marcas de revisão
- **WHEN** o usuário salva uma justificação com um trecho incluído e um trecho excluído em revisão de texto
- **THEN** o texto gravado contém o trecho incluído, sem marca, e não contém o trecho excluído
