# Tasks

## 1. Remoção do código

- [x] 1.1 Em `src/components/lexml-eta.component.ts`, remover a propriedade `exibirAjuda`, as abas "Comando" e "Dicas" e o painel "dicas"; `tabIsVisible` passa a tratar só "notas" e "atalhos" (D1). Verificar com o `tsc` sem erros.
- [x] 1.2 Em `src/components/editor/editor.component.ts`, remover:
  - o botão "Dicas";
  - `showAjudaModal`, o `@query` `ajudaModal` e o import;
  - o `<lexml-eta-ajuda-modal>`.
  - Em `src/assets/css/editor.css.ts`, remover o `.btn-dicas` (D3).
  - Verificar com o `tsc` sem erros.
- [x] 1.3 Apagar `src/components/ajuda/ajuda.component.ts` e `ajuda.modal.component.ts`, e tirar as exportações de `src/index.ts` (D2). Verificar com o `tsc` sem erros e com um `grep` por `ajuda`, `dicas`, `exibirAjuda` e `'comando'` em `src` que não ache restos (os atalhos ficam).
- [x] 1.4 Testes:
  - tirar `lexml-eta-ajuda` e `lexml-eta-ajuda-modal` de `test/integracao/registros-entrypoint.test.ts`;
  - criar `test/componente/lexml-eta/abasApoio.component.test.ts` com os cenários da spec (abas com e sem anexo de parecer, sem painel "dicas", barra só com "Atalhos").
  - Verificar com os dois arquivos passando.
- [x] 1.5 Documentação:
  - em `docs/api-componente-lexml-eta.md`, remover a linha `exibirAjuda`;
  - registrar no `docs/sessao/TODO.md` a coordenação com o `lexeditweb-editor` (sem `exibirAjuda`, `AjudaComponent` e `AjudaModalComponent`).
  - Verificar com um `grep` sem `exibirAjuda` na documentação.

## 2. E2E

- [x] 2.1 Criar `cypress/e2e/documento-articulado/abas-apoio.cy.ts`, seguindo `docs/guia-cypress.md` e usando `export {};`:
  - na nova proposição, `#tabs-direita` tem só as abas "Notas" e "Atalhos";
  - com `cy.viewport(700, 800)` (faixa de 641 a 768 px), a barra do editor tem só o botão "Atalhos" visível, e não há `lexml-eta-ajuda-modal`.
  - Verificar com o spec passando.

## 3. Verificação integrada

- [x] 3.1 Rodar o `npm test` completo, com o servidor de desenvolvimento parado. Verificar que todos os lotes passam.
- [x] 3.2 Rodar o `npm run prepublish`, que gera a distribuição. Verificar que termina sem erro e que `dist/` não contém `lexml-eta-ajuda`.
- [x] 3.3 Rodar o Cypress de `documento-articulado/*`. Verificar que as únicas falhas são as que já existem (`abertura-pena.cy.ts`).
- [x] 3.4 Rodar `openspec validate 2026-11-04-c03-remover-abas-comando-dicas --strict`, que deve passar sem erros.
