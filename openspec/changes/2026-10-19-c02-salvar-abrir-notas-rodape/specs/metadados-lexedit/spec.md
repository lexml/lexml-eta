## MODIFIED Requirements

### Requirement: Ida e volta do documento salvo pelo conversor
Ao converter em XML um documento salvo pelo editor e convertê-lo de volta em JSON pelo conversor `jsonix-lexml` 2.0.0, o sistema SHALL abrir o resultado com os mesmos valores de todos os grupos do LexEdit que suporta e com a mesma justificação, inclusive as notas de rodapé. Salvar de novo esse documento SHALL gerar um arquivo igual ao original. Exceção temporária, enquanto as revisões de texto não forem gravadas (issue #994): elas não voltam, e o arquivo é igual ao original sem elas. Exceção, enquanto o plugin de tabelas do editor não guardar largura: a largura de tabela e de coluna não volta ao editor, e o arquivo salvo de novo não a tem.

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

#### Scenario: Exceção temporária com nota de rodapé ou revisão de texto
- **WHEN** um documento com marca de revisão de texto na justificação é salvo, aberto e salvo de novo
- **THEN** o segundo arquivo é igual ao primeiro, e nenhum dos dois contém a marca de revisão; uma nota de rodapé fora do trecho excluído em revisão é mantida nos dois
