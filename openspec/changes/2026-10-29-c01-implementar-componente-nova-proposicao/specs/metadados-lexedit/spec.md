## MODIFIED Requirements

### Requirement: Colegiado apreciador no arquivo
O sistema SHALL gravar o destino da proposição em `lexedit:ColegiadoApreciador`, com `siglaCasaLegislativa` (`SF`, `CD` ou `CN`) e `tipoColegiado` (`Plenário` ou `Comissão`), e `siglaComissao` somente quando houver comissão informada, **apenas quando o documento tem colegiado**. O colegiado SHALL vir de `novaProposicao` ou do arquivo aberto e SHALL NOT ser editável no `lexml-eta`; sem colegiado, o sistema SHALL NOT gravar o elemento nem assumir valor padrão. Um anexo de parecer SHALL NOT ter o elemento gravado, assim como não tem fecho nem autoria.

#### Scenario: Destino Plenário
- **WHEN** o usuário salva um documento criado com colegiado Plenário do Senado
- **THEN** o arquivo contém `lexedit:ColegiadoApreciador` com `siglaCasaLegislativa="SF"` e `tipoColegiado="Plenário"`, sem `siglaComissao`

#### Scenario: Destino Comissão
- **WHEN** o usuário salva um documento criado com colegiado de uma comissão
- **THEN** o `lexedit:ColegiadoApreciador` contém `tipoColegiado="Comissão"` e a `siglaComissao` informada

#### Scenario: Documento sem colegiado
- **WHEN** o usuário salva um documento que não tem colegiado (criado sem ele ou aberto de arquivo sem o elemento)
- **THEN** o arquivo não contém `lexedit:ColegiadoApreciador`
