# Tasks

## 1. Dicas da barra de ferramentas

- [x] 1.1 Teste de componente em `test/componente/` com `lexml-eta-editor-texto-rico` no modo justificação: todo `button` e `.ql-picker-label` da barra tem `title` não vazio; link = "Inserir link", primeiro e segundo `.ql-picker.ql-table .ql-picker-label` = "Inserir tabela" e "Formatar tabela"; rótulo do alinhamento = "Alinhamento"; rótulo do estilo = "Estilo do parágrafo"; os itens do menu de tabela não herdam o `title` do rótulo. Verificar que falha antes da 1.2.
- [x] 1.2 Em `configureTooltip()` (`editor-texto-rico.component.ts`): acrescentar as dicas do link, dos dois menus de tabela (pelo índice, no rótulo), do rótulo de alinhamento e do de estilo; retirar `button.ql-table`. Verificar com o teste da 1.1 e `npm test` completo passando.

## 2. E2E

- [x] 2.1 Criar `cypress/e2e/documento-articulado/dicas-barra-justificacao.cy.ts` (com `export {};`): nova proposição, aba Justificação por `sl-tab[panel="justificativa"]`, e conferir o atributo `title` de inserir link, inserir tabela e formatar tabela na barra `#lexml-eta-editor-texto-rico-justificativa .ql-toolbar`. A dica nativa do navegador não é visível ao Cypress, por isso o atributo é o critério. Verificar com o spec passando e falhando sem a correção da 1.2.

## 3. Registro

- [x] 3.1 Registrar a #1091 em `docs/sessao/TODO.md`. Verificar com `openspec validate 2026-11-18-c02-dicas-barra-ferramentas-justificacao` sem erros.
