## 1. Gravação da remissão externa da ementa

- [x] 1.1 Acrescentar a `test/model/documento/roundTripRemissaoExterna.test.ts` um caso com a remissão externa na ementa (`sourceUuid` da ementa, texto "Altera a Lei nº 12.965, de 23 de abril de 2014, para…"): depois de `buildJsonixFromProjetoNorma` e da abertura (`buildProjetoNormaFromJsonix` + `inicializaRemissoesExternasAoAbrir`), a ementa tem o link e o registro tem a entrada com a mesma URN, o mesmo texto e o `sourceUuid` da ementa reaberta. Verificar que falha antes da 1.2 e que o caso existente continua passando.
- [x] 1.2 Em `buildJsonixFromProjetoNorma.ts`, `montaParteInicial(projetoNorma, remissoesExternas?)` repassa o registro ao `buildStructuredContent` da ementa, e `montaProjetoNorma` o informa. Verificar com o teste da 1.1.

## 2. Detecção na ementa e E2E

- [x] 2.1 Criar `cypress/e2e/remissao-externa/grupo-d-ementa.cy.ts` (`cy.novaProposicao`, `digitarTextoRemissao` e `dispararDeteccaoRemissao` na linha da ementa): o texto da issue na ementa vira link (`a.lexml-remissao-externa` com o texto "Lei nº 12.965, de 23 de abril de 2014"); o documento obtido por `getDocumentoArticulado()` tem a `Remissao` na ementa; reaberto por `#fileUpload`, a ementa mostra o link. Verificar que falha antes da 2.2.
- [x] 2.2 Em `editor.component.ts#coordenarDeteccaoExterna`, achar o dispositivo da linha também na ementa (decisão 1 do design), mantendo a conferência de norma alterada só na articulação. Comentário de uma linha, só com o porquê. Verificar com o spec da 2.1, os demais specs de `cypress/e2e/remissao-externa/` e `npm test` completo passando.

## 3. Registro

- [x] 3.1 Registrar a #1085 em `docs/sessao/TODO.md`. Verificar com `openspec validate 2026-11-24-c03-remissao-externa-na-ementa` sem erros.
