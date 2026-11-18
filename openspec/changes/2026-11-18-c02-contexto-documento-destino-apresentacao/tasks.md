# Tasks

## 1. Destino e forma de apresentação no contexto

- [x] 1.1 Em `urlsNovaProposicao.ts`, acrescentar a `ContextoDocumento` os campos `colegiadoDestino: Readonly<ColegiadoDestino>` e `anexoParecer: boolean`, e a `montaUrlContexto` os placeholders `{tipoColegiado}`, `{siglaComissao}` (vazio sem comissão) e `{anexoParecer}` (`true`/`false`). Em `contextoDocumento.ts`, `montaContextoDocumento` recebe um terceiro parâmetro `{ colegiadoDestino, anexoParecer }` e congela `colegiadoDestino`. Em `nova-proposicao.component.ts`, extrair a regra do destino de `montarResultado` para um getter `colegiadoDestino`, usado pelo resultado e pelas duas chamadas de `montaContextoDocumento` (importação e `carregarDocumentos`). Verificar com `modulosNovaProposicao.test.ts` (contexto com Plenário sem comissão, Comissão com sigla, `anexoParecer` dos dois valores, `montaUrlContexto` com os três placeholders codificados, inclusive `Comiss%C3%A3o`, e URL sem eles inalterada; atualizar o `deep.equal` existente) e com `callbacks.component.test.ts`/`tela2b.component.test.ts` (o callback de importação recebe o destino e a forma escolhidos; na `CD`, o contexto da listagem traz Plenário com a comissão; trocar a comissão ou a caixa de parecer na Tela 1 e voltar à Tela 2b chama `onListarDocumentos` de novo e descarta a seleção). Rodar `npm run build` e a suíte `out-tsc/test/componente/nova-proposicao/*.test.js`.
- [x] 1.2 Documentar em `docs/api-componente-lexml-eta.md`, na tabela "Contexto do documento", os campos `colegiadoDestino` e `anexoParecer` com os placeholders, a regra da comissão no Plenário da `CD`, a codificação de `Plenário`/`Comissão` e que trocar destino ou forma de apresentação também recarrega a lista da Tela 2b. Em `demo/components/demoview.ts`, acrescentar os três placeholders à `urlImportacaoArquivo`. Verificar relendo a doc contra a spec e com `npm run test:demo-server` (o backend simulado continua ignorando a query).

## 2. E2E (Cypress)

- [x] 2.1 Em `cypress/e2e/nova-proposicao/callbacks.cy.ts` (consultar `docs/guia-cypress.md`), estender o teste do contexto pelo callback para conferir `colegiadoDestino` (`Comissão`, `CBX`) e `anexoParecer` (`true`), e o teste da importação pela URL para incluir `{tipoColegiado}`, `{siglaComissao}` e `{anexoParecer}` na `urlImportacaoArquivo` e conferir `Comissão`, `CBX` e `true` na query interceptada. Verificar com `npm run cy:run:local` só nesse spec (com o `npm start` ativo). A recarga da Tela 2b por troca de destino fica nos testes de componente da 1.1, como na c01.

## 3. Validação

- [x] 3.1 Validar com `openspec validate "2026-11-18-c02-contexto-documento-destino-apresentacao" --strict`, rodar `npm test` e, depois de `npm run build:types`, `node scripts/validate-package.mjs`, sem falhas.
