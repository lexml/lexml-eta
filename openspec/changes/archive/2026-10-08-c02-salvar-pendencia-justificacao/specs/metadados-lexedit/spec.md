## MODIFIED Requirements

### Requirement: Ida e volta dos metadados do LexEdit pelo conversor
Ao converter em XML um documento salvo pelo editor e convertê-lo de volta em JSON pelo conversor `jsonix-lexml` 2.0.0, o sistema SHALL abrir o resultado com os mesmos valores de todos os grupos do LexEdit que suporta. Salvar de novo esse documento SHALL gerar um arquivo igual ao original. Exceção temporária, enquanto a justificação não for gravada no arquivo (issue #991): um documento salvo com a justificação preenchida não tem a pendência de justificação, mas, ao ser aberto, fica com a justificação vazia e, salvo de novo, passa a ter essa pendência; só nesse caso o segundo arquivo pode diferir do original, e só pela pendência de justificação.

#### Scenario: Opções de impressão, fecho e remissão inválida voltam do XML
- **WHEN** um documento com opções de impressão alteradas, local e data do fecho e uma remissão interna inválida é salvo, convertido em XML, convertido de volta em JSON e aberto
- **THEN** o formulário de opções de impressão, o campo "Data" e o local exibem os valores salvos, e a remissão é reconstruída como inválida
- **AND** salvar esse documento aberto gera um arquivo igual ao salvo originalmente

#### Scenario: Pendência de justificação na ida e volta com justificação vazia
- **WHEN** um documento com a justificação obrigatória vazia é salvo, convertido em XML, convertido de volta em JSON e aberto
- **THEN** salvar esse documento aberto gera um arquivo igual ao salvo originalmente, com a pendência "Não foi informado um texto de justificação."

#### Scenario: Exceção temporária com justificação preenchida
- **WHEN** um documento com a justificação preenchida é salvo, aberto e salvo de novo, antes de a justificação ser gravada no arquivo
- **THEN** o segundo arquivo difere do primeiro somente pela pendência "Não foi informado um texto de justificação."
