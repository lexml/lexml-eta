# Proposal

## Why

Issue #1022: o modo "anexo de parecer" (`LexmlEtaConfig.anexoParecer`) esconde e ignora data, local do fecho e autoria, mas o P.O. definiu que esse modo deve apenas ocultar a aba de justificação (mantendo a justificação opcional) e permitir fecho, data e assinaturas. Além disso, o campo "Data" nasce com a data de hoje marcada e a opção "Não informar" aparece depois da data, quando o padrão desejado é não informar.

## What Changes

- No modo anexo de parecer, o formulário volta a exibir data e autoria, e a aba passa a se chamar sempre "Destino, Data, Autoria e Impressão".
- Ao salvar no modo anexo de parecer, o documento passa a registrar local, data e autoria nos metadados do LexEdit e a gerar `ParteFinal` com `LocalDataFecho` e `AssinaturaTexto`, como no modo normal.
- Ao abrir no modo anexo de parecer, a data do arquivo passa a ser aplicada ao campo "Data" (hoje é forçada a "Não informar").
- `getProposicao()` no modo anexo de parecer passa a preencher `dataUltimaModificacao` a partir do campo "Data" e deixa de remover `local` e `autoria`. **BREAKING** para hosts que dependiam da ausência desses campos no anexo.
- O modo anexo de parecer continua sem aba de justificação, sem aba de notas de rodapé e com a justificação opcional (sem pendência nem alerta); `justificativa`, `justificativaAntesRevisao` e `notasRodape` continuam removidos de `getProposicao()`.
- O campo "Data" passa a ter "Não informar" como padrão (nos dois modos) e a opção "Não informar" é exibida antes da opção de data.
- Documentação da API (`docs/api-componente-lexml-eta.md`) atualizada para a nova definição do modo.

## Capabilities

### New Capabilities

- `modo-anexo-parecer`: comportamento do componente quando `anexoParecer` está ativo (justificação oculta e opcional; destino, data, autoria e impressão disponíveis).
- `campo-data-documento`: campo "Data" do formulário (padrão "Não informar" e ordem das opções).

### Modified Capabilities

- `salvar-documento-articulado`: remove os requisitos "Fecho no modo anexo de parecer" e "Autoria no modo anexo de parecer", pois o fecho e a autoria passam a ser salvos também nesse modo.
- `abrir-documento-articulado`: o requisito de recuperação do local e da data do fecho passa a valer também no modo anexo de parecer.

## Impact

- Código: `src/components/lexml-eta.component.ts` (`getDocumentoArticulado`, `abrirDocumentoArticulado`, `setProposicao`, `resetaProposicao`, `getProposicao`, `removerDadosNaoAplicaveisAoAnexoParecer`, `render`) e `src/components/data/data.component.ts`.
- Testes: `test/componente/lexml-eta/lexml-eta-anexo-parecer.test.ts`, `documentoArticulado.component.test.ts` e o E2E `cypress/e2e/documento-articulado/abertura-local-data-fecho.cy.ts`.
- API para hosts (ex.: `lexeditweb-editor`): `getProposicao()` no anexo passa a incluir `local`, `autoria` e `dataUltimaModificacao` conforme o formulário.
- Documentação: `docs/api-componente-lexml-eta.md`.
