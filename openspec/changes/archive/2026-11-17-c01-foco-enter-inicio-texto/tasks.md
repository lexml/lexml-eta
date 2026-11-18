# Tasks

## 1. Linha marcada no reducer

- [x] 1.1 Em `adicionaElemento.ts`, emitir `ElementoMarcado [atual, novo]` quando `action.manterFocoNoAtual` for verdadeiro e `action.posicao === 'antes'`; nos demais casos, manter `[novo, atual]`. Verificar com o teste da 1.2.
- [x] 1.2 Acrescentar testes de reducer em `test/redux/adiciona/` (artigo e parágrafo): com `manterFocoNoAtual`, `ElementoMarcado.elementos[0]` é o dispositivo que manteve o texto; sem a propriedade (menu), continua o novo; com a propriedade e posição diferente de `'antes'`, a ordem não muda. Verificar com `npm test` passando.
- [x] 1.3 Acrescentar teste de refazer: depois de incluir com `manterFocoNoAtual`, desfazer e refazer, `ElementoMarcado.elementos[0]` e `ElementoSelecionado` apontam para o dispositivo com o texto; depois de desfazer, o marcado é o dispositivo original. Verificar com `npm test` passando.

## 2. Despacho pelo Enter

- [x] 2.1 Em `EditorComponent.adicionarElemento`, acrescentar `manterFocoNoAtual: true` à ação só no ramo `posicao === 'antes'`, com comentário de uma linha explicando a diferença em relação ao menu. Verificar manualmente na demo (`npm start`): Enter no início do Art. 4º deixa o cursor no início do Art. 5º; "Adicionar artigo antes" pelo menu deixa o cursor no novo.
- [x] 2.2 E2E Cypress em `cypress/e2e/edicao/enter-inicio-texto.cy.ts` (viável pelo `docs/guia-cypress.md`: Enter por `digitarNoDispositivo('{home}{enter}')` depois de marcar a linha com `getOpcoesDeMenuDoDispositivo`, já que o clique sintético não marca `linhaAtual`): Enter no início de um artigo e de um parágrafo com texto, conferindo que `.container__elemento--ativo` é a linha com o texto, já renumerada, e que o novo dispositivo está vazio; caso de controle com Enter no fim; caso de controle com "Adicionar artigo antes" pelo menu, com o novo ativo. Verificar rodando o spec com `npm run cy:run:local -- --spec cypress/e2e/edicao/enter-inicio-texto.cy.ts`.

## 3. Documentação

- [x] 3.1 Registrar a issue #1086 como concluída em `docs/sessao/TODO.md`. Verificar `openspec validate 2026-11-17-c01-foco-enter-inicio-texto` sem erros.
