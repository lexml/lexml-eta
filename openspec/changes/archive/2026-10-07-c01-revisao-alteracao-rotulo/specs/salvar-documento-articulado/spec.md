# Spec Delta

## ADDED Requirements

### Requirement: Revisão de alteração de rótulo
Quando o rótulo de um dispositivo de alteração de norma é alterado em revisão, o sistema SHALL gravar na articulação o dispositivo com o rótulo e o identificador finais e registrar `alteracaoRotulo;<idOriginal>` em `revisao`, onde `<idOriginal>` é o identificador anterior à alteração, do qual se deriva o rótulo anterior. O parágrafo filho com o conteúdo anterior SHALL ser gravado somente quando a revisão também contém `alterado`.

#### Scenario: Parágrafo renumerado
- **WHEN** o usuário, em modo de revisão, renumera o parágrafo `art2_cpt_alt1_art3_par3-1` (`§ 3º-A`) para `§ 3º-B` e salva
- **THEN** a articulação contém o parágrafo `§ 3º-B` com o identificador final, e a revisão com `refIdDispositivo` igual ao identificador final tem `revisao` igual a `alteracaoRotulo;art2_cpt_alt1_art3_par3-1`, sem parágrafo filho

#### Scenario: Renumeração combinada com alteração de texto
- **WHEN** o usuário, em modo de revisão, renumera um parágrafo, altera o seu texto e salva
- **THEN** a revisão tem `alteracaoRotulo;<idOriginal>,alterado` e contém o texto anterior como parágrafo filho

#### Scenario: Conversão pelo conversor LexML
- **WHEN** o arquivo com a revisão `alteracaoRotulo` é convertido em XML pelo conversor e validado com `schemas/lexedit.xsd`
- **THEN** o XML contém o atributo `revisao` com a operação e o argumento, e a validação não aponta erro
