## MODIFIED Requirements

### Requirement: Colegiado apreciador no arquivo
O sistema SHALL gravar o destino da proposição em `lexedit:ColegiadoApreciador`, com `siglaCasaLegislativa` (`SF`, `CD` ou `CN`) e `tipoColegiado` (`Plenário` ou `Comissão`), e `siglaComissao` somente quando houver comissão informada, **apenas quando o documento tem colegiado**. O colegiado SHALL vir de `novaProposicao` ou do arquivo aberto e SHALL NOT ser editável no `lexml-eta`; sem colegiado, o sistema SHALL NOT gravar o elemento. O modo de anexo de parecer SHALL NOT interferir: o colegiado é gravado e lido como nos demais documentos.

#### Scenario: Destino Plenário
- **WHEN** o usuário salva um documento criado com colegiado Plenário do Senado
- **THEN** o arquivo contém `lexedit:ColegiadoApreciador` com `siglaCasaLegislativa="SF"` e `tipoColegiado="Plenário"`, sem `siglaComissao`

#### Scenario: Destino Comissão
- **WHEN** o usuário salva um documento criado com colegiado de uma comissão
- **THEN** o `lexedit:ColegiadoApreciador` contém `tipoColegiado="Comissão"` e a `siglaComissao` informada

#### Scenario: Documento sem colegiado
- **WHEN** o usuário salva um documento criado sem colegiado
- **THEN** o arquivo não contém `lexedit:ColegiadoApreciador`

#### Scenario: Anexo de parecer
- **WHEN** o usuário salva, no modo de anexo de parecer, um documento com colegiado Comissão
- **THEN** o arquivo contém `lexedit:ColegiadoApreciador` com `tipoColegiado="Comissão"` e a `siglaComissao`
