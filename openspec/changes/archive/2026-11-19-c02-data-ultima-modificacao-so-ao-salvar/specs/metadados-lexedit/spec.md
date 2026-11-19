# Spec Delta

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
- **AND** abrir o documento não expõe nem conserva o valor lido no estado de edição
- **AND** o próximo documento exportado contém o instante dessa nova exportação

#### Scenario: Salvar de novo difere só na data da última modificação
- **WHEN** um documento salvo pelo editor é aberto e salvo de novo, sem alterações, num instante posterior
- **THEN** o segundo arquivo é igual ao primeiro, exceto pelo valor de `dataUltimaModificacao`, que é o instante do segundo salvamento

### Requirement: Data da última modificação no arquivo
Ao exportar um documento para salvamento, o sistema SHALL gravar em `lexedit:Metadado` `dataUltimaModificacao` com o instante da exportação, no formato `xsd:dateTime` com fuso horário local (ISO 8601, precisão de segundos). A abertura SHALL ignorar esse atributo e não o manter no estado de edição. Os atributos `aplicacao` e `versaoAplicacao` SHALL NOT ser gravados e SHALL ser ignorados ao abrir.

#### Scenario: Salvar grava o instante do salvamento
- **WHEN** o usuário obtém o documento para salvamento em 29/10/2026, às 10:15:30 no horário local, com fuso de -03:00
- **THEN** o `lexedit:Metadado` exportado traz `dataUltimaModificacao="2026-10-29T10:15:30-03:00"`

#### Scenario: Salvar de novo atualiza a data
- **WHEN** o usuário abre um arquivo com `dataUltimaModificacao="2026-05-12T10:15:00-03:00"` e depois obtém o documento para salvamento
- **THEN** o documento exportado traz o instante da nova exportação em `dataUltimaModificacao`, sem reaproveitar o valor lido

#### Scenario: Data inválida é ignorada ao abrir
- **WHEN** o usuário abre um arquivo com `dataUltimaModificacao="ontem"` e outros metadados válidos
- **THEN** o documento abre normalmente e os demais metadados válidos são aplicados

#### Scenario: Aplicação e versão não gravadas
- **WHEN** o usuário salva um documento
- **THEN** o `lexedit:Metadado` do arquivo salvo não contém `aplicacao` nem `versaoAplicacao`

#### Scenario: Arquivo com aplicação e versão é aberto
- **WHEN** o usuário abre um arquivo cujo `lexedit:Metadado` traz `aplicacao="LexEdit"` e `versaoAplicacao="1.0.0"`
- **THEN** o documento abre normalmente, sem erro, e os dois atributos são ignorados

## REMOVED Requirements

### Requirement: Propriedade pública da data da última modificação
**Reason**: O instante do salvamento é metadado do arquivo e não precisa integrar o estado de edição nem ser exposto pelo componente. A propriedade pública será removida.
**Migration**: Hosts devem deixar de consultar `dataUltimaModificacaoDocumento`. O instante da exportação permanece no `dataUltimaModificacao` do documento retornado para salvamento.
