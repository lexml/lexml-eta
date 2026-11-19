# Proposal

## Why

A #1059 fez a nova proposição criada a partir de documento importado aproveitar, além da ementa e da articulação, a justificação, as revisões, a autoria e os demais metadados do arquivo. A issue lexml/lexml-eta#1102 reverte essa ampliação: do documento importado interessam apenas a ementa e a articulação, pelo mesmo caminho do texto de outra proposição. Ao conferir esse caminho, apareceu um defeito antigo: o modelo não tem os metadados do LexEdit apagados, e a situação na norma vigente e as remissões internas inválidas do arquivo de origem acabam aplicadas ao documento novo.

## What Changes

- A `nova-proposicao` passa a devolver o documento importado em `texto`, como o documento referenciado e o de outra proposição. **BREAKING** em relação à #1059: o campo `documentoImportado` sai do `detail` de conclusão. Os demais pontos da #1059 (URL ou callback de importação, POST pelo `Content-Type`, `.json` lido direto, alertas de recusa e de falha na Tela 2) não mudam.
- O `lexml-eta` deixa de aceitar `documentoImportado` em `novaProposicao` e remove o caminho de importação próprio, junto com a notificação e o alerta de anexos não recuperados (os anexos são descartados como os demais metadados, sem aviso). O host passa o documento importado em `documentoModelo`.
- O documento de modelo passa a ser limpo de verdade: os metadados do LexEdit (`metadado.metadadoProprietario`) e a justificação são descartados antes da abertura, e a situação na norma vigente e as remissões internas inválidas do modelo deixam de ser aplicadas.
- A URN do documento de modelo deixa de ser validada contra a casa do editor; a URN informada para a nova proposição continua validada. A demo deixa de derivar a URN do modelo para a Câmara.
- Saem as peças que só existiam por causa do alerta de anexos: as opções de cor, duração e ícone do `alertarInfo`, a regra amarela de notificação e o alinhamento específico do alerta na aba Avisos.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `nova-proposicao`: o documento importado volta a sair em `texto`; `documentoImportado` deixa de existir no resultado.
- `interface-lexml-eta`: `novaProposicao` deixa de aceitar documento importado; o requisito "Documento de modelo" passa a descartar também a justificação, a situação na norma vigente e as remissões inválidas do modelo, e a não validar a casa da URN do modelo; saem os requisitos "Documento importado" e "Anexos do documento importado".

## Impact

- Código: `src/components/nova-proposicao/` (resultado), `src/components/lexml-eta.component.ts` (`novaProposicao`, `DadosNovaProposicao`), `src/model/lexml/documento/modelo/montaDocumentoNovaProposicao.ts`, `src/model/lexml/documento/documentoArticulado.ts` (opção de casa na leitura), `src/redux/elemento/util/alertaUtil.ts`, `src/components/alertas/alertas.component.ts`, `src/components/editor/editor.component.ts`, `src/model/alerta/alerta.ts`, demo (`demoview.ts`).
- Testes: unitários da `nova-proposicao`, do `lexml-eta` e de `montaDocumentoNovaProposicao`; E2E de importação.
- Documentação: `docs/api-componente-lexml-eta.md` e o item 26 do CLAUDE.md.
- Host `lexeditweb-editor`: deixa de precisar tratar `documentoImportado`; o documento importado chega em `texto` e vai para `documentoModelo`, como já faz com o de outra proposição. A exigência de `urlImportacaoArquivo` ou `onImportarArquivo` continua.
