## ADDED Requirements

### Requirement: Data da última modificação no arquivo
Ao salvar, o sistema SHALL gravar em `lexedit:Metadado` o atributo `dataUltimaModificacao` com o instante do salvamento, no formato `xsd:dateTime` com o fuso horário local (ISO 8601, precisão de segundos). Cada salvamento SHALL gravar o seu próprio instante, sem reaproveitar a data lida do arquivo aberto. Os atributos `aplicacao` e `versaoAplicacao` SHALL NOT ser gravados e SHALL ser ignorados ao abrir.

#### Scenario: Salvar grava o instante do salvamento
- **WHEN** o usuário salva um documento em 29/10/2026, às 10:15:30 no horário local, com fuso de -03:00
- **THEN** o `lexedit:Metadado` do arquivo salvo traz `dataUltimaModificacao="2026-10-29T10:15:30-03:00"`

#### Scenario: Salvar de novo atualiza a data
- **WHEN** o usuário abre um arquivo com `dataUltimaModificacao="2026-05-12T10:15:00-03:00"` e o salva
- **THEN** o arquivo salvo traz o instante do novo salvamento em `dataUltimaModificacao`, e não a data lida

#### Scenario: Aplicação e versão não gravadas
- **WHEN** o usuário salva um documento
- **THEN** o `lexedit:Metadado` do arquivo salvo não contém `aplicacao` nem `versaoAplicacao`

#### Scenario: Arquivo com aplicação e versão é aberto
- **WHEN** o usuário abre um arquivo cujo `lexedit:Metadado` traz `aplicacao="LexEdit"` e `versaoAplicacao="1.0.0"`
- **THEN** o documento abre normalmente, sem erro, e os dois atributos são ignorados

### Requirement: Propriedade pública da data da última modificação
O componente `LexmlEtaComponent` SHALL expor a propriedade pública somente leitura `dataUltimaModificacaoDocumento`, com o valor de `dataUltimaModificacao` lido do documento aberto, como gravado no arquivo. A propriedade SHALL ficar indefinida quando o atributo estiver ausente ou não for uma data e hora válida, numa nova proposição e depois de `fecharDocumento()`. Valor ausente ou inválido SHALL NOT impedir a abertura do documento. Obter o documento para salvar SHALL NOT alterar a propriedade.

#### Scenario: Abrir arquivo com a data
- **WHEN** o usuário abre um arquivo com `dataUltimaModificacao="2026-05-12T10:15:00-03:00"`
- **THEN** a propriedade `dataUltimaModificacaoDocumento` do componente contém `2026-05-12T10:15:00-03:00`

#### Scenario: Abrir arquivo sem a data
- **WHEN** o usuário abre um arquivo sem `dataUltimaModificacao`, depois de ter aberto outro que a tinha
- **THEN** a propriedade `dataUltimaModificacaoDocumento` fica indefinida

#### Scenario: Data inválida no arquivo
- **WHEN** o usuário abre um arquivo com `dataUltimaModificacao="ontem"`
- **THEN** o documento abre normalmente, a propriedade fica indefinida e os demais metadados válidos são aplicados

#### Scenario: Nova proposição
- **WHEN** o host cria uma nova proposição depois de ter aberto um arquivo com `dataUltimaModificacao`
- **THEN** a propriedade `dataUltimaModificacaoDocumento` fica indefinida

#### Scenario: Documento fechado
- **WHEN** o host chama `fecharDocumento()` com um documento aberto que tinha `dataUltimaModificacao`
- **THEN** a propriedade `dataUltimaModificacaoDocumento` fica indefinida

#### Scenario: Salvar não altera a propriedade
- **WHEN** o usuário abre um arquivo com `dataUltimaModificacao="2026-05-12T10:15:00-03:00"` e obtém o documento para salvar
- **THEN** a propriedade `dataUltimaModificacaoDocumento` continua com `2026-05-12T10:15:00-03:00`

## MODIFIED Requirements

### Requirement: Ida e volta dos metadados do LexEdit pelo conversor
Ao converter em XML um documento salvo pelo editor e convertê-lo de volta em JSON pelo conversor `jsonix-lexml`, o sistema SHALL abrir o resultado com os mesmos valores de todos os grupos do LexEdit que suporta e com a mesma justificação, inclusive as notas de rodapé e as marcas de revisão de texto. Salvar de novo esse documento SHALL gerar um arquivo igual ao original, exceto por `dataUltimaModificacao`, que registra o instante do novo salvamento. Exceção, enquanto o plugin de tabelas do editor não guardar largura: a largura de tabela e de coluna não volta ao editor, e o arquivo salvo de novo não a tem.

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

#### Scenario: Data da última modificação na ida e volta
- **WHEN** um documento salvo com `dataUltimaModificacao` é convertido em XML, convertido de volta em JSON e aberto
- **THEN** o XML contém o atributo `dataUltimaModificacao` em `lexedit:Metadado` e é válido pelo `schemas/lexedit.xsd`
- **AND** a propriedade `dataUltimaModificacaoDocumento` do componente contém o mesmo valor gravado

#### Scenario: Salvar de novo difere só na data da última modificação
- **WHEN** um documento salvo pelo editor é aberto e salvo de novo, sem alterações, num instante posterior
- **THEN** o segundo arquivo é igual ao primeiro, exceto pelo valor de `dataUltimaModificacao`, que é o instante do segundo salvamento
