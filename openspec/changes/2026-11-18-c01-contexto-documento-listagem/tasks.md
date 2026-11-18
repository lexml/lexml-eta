# Tasks

## 1. Renomeação para ContextoDocumento

- [x] 1.1 Renomear `ContextoImportacaoArquivo` → `ContextoDocumento`, `ReferenciaImportacaoArquivo` → `ReferenciaDocumento` (em `urlsNovaProposicao.ts`), `contextoImportacaoArquivo.ts` → `contextoDocumento.ts` com `montaContextoDocumento`, e `montaUrlImportacao` → `montaUrlContexto`, atualizando `nova-proposicao.component.ts`, `src/index.ts`, `scripts/validate-package.mjs`, `docs/api-componente-lexml-eta.md` e os testes existentes (`modulosNovaProposicao.test.ts`, `callbacks.component.test.ts`). Verificar com `npm run build`, `node scripts/validate-package.mjs` (após `npm run build:types`) e a suíte `out-tsc/test/componente/nova-proposicao/*.test.js` passando, sem nenhuma ocorrência dos nomes antigos fora de `openspec/changes/archive/`.

## 2. Contexto na listagem da Tela 2b

- [x] 2.1 Em `urlsNovaProposicao.ts`, mudar `ListarDocumentosCallback` para `(consulta, contexto: ContextoDocumento)`. Em `nova-proposicao.component.ts`, montar o contexto em `carregarDocumentos` e passá-lo a `listarDocumentos`, que o entrega ao callback e aplica `montaUrlContexto` sobre `montaUrlProposicao` na `urlDocumentosMateria`. Verificar com testes de componente em `tela2b.component.test.ts`: o callback recebe o contexto da subemenda (consulta e contexto distintos em "Em outra matéria", com `documentoReferenciado` da Tela 1), e o `fetch` de `urlDocumentosMateria` recebe os placeholders preenchidos e codificados; um teste em `modulosNovaProposicao.test.ts` cobre `montaUrlContexto` com a URL de listagem e a URL sem placeholders do contexto. O `onObterTextoDocumento` segue só com `{ id }` (confirmar no teste existente de texto por id).
- [x] 2.2 Documentar em `docs/api-componente-lexml-eta.md` o segundo parâmetro de `onListarDocumentos`, os placeholders de `urlDocumentosMateria`, a diferença entre `consulta` e `documentoReferenciado` (com o exemplo de "Em outra matéria") e que o texto do documento não recebe o contexto. Verificar relendo o texto contra a spec.

## 3. Recarga da lista

- [x] 3.1 Incluir o contexto na chave de `carregarDocumentos` e fazer `entrarTela2b` carregar em qualquer modo de matéria, descartando lista e seleção quando a chave difere da carregada. Verificar com testes de componente em `tela2b.component.test.ts`: troca de espécie (substitutivo → subemenda) com a mesma matéria recarrega com o novo contexto e descarta a seleção; carga em andamento durante a troca tem a resposta descartada; voltar à Tela 2 e retornar sem mudar a Tela 1 preserva a lista e a seleção e não chama `onListarDocumentos` de novo; "Em outra matéria" já verificada também recarrega.

## 4. Demo

- [x] 4.1 Em `demo/components/demoview.ts`, acrescentar `?especie={especie}` à `urlDocumentosMateria`; em `demo/server/handlers.mjs`, na subemenda substitutiva (`especie=subemenda`) omitir os documentos de `sigla` `PL`. Verificar com `npm run test:demo-server`, com casos para `especie=substitutivo` (lista completa), `especie=subemenda` (sem `PL`) e sem o parâmetro (lista completa).

## 5. E2E (Cypress)

- [ ] 5.1 Estender `cypress/e2e/nova-proposicao/documento-origem-camara.cy.ts` (consultar `docs/guia-cypress.md`) usando o mock: na subemenda substitutiva a lista não traz os documentos `PL` e, ao voltar à Tela 1 e trocar para substitutivo com a mesma matéria, a lista volta a traze-los. Verificar com `npm run cy:run:local` só nesse spec (com o `npm start` ativo). Se o fluxo de voltar e trocar a espécie não for viável no Cypress, registrar a decisão e deixá-lo coberto pelo teste de componente do 3.1.

## 6. Validação

- [ ] 6.1 Validar a change com `openspec validate "2026-11-18-c01-contexto-documento-listagem" --strict` e rodar `npm test` para conferir que nenhum teste existente depende de `onListarDocumentos(consulta)` de um só parâmetro.
