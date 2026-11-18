# Tasks

## 1. Foco do root sem rolagem

- [x] 1.1 No construtor de `EtaQuill` (`src/util/eta-quill/eta-quill.ts`), sobrescrever o `focus` da instância do root: repassa as opções recebidas e, sem opções, usa `{ preventScroll: true }`; comentário de uma linha com o porquê. Verificar com o teste da 1.2.
- [x] 1.2 Teste de componente em `test/componente/lexml-eta/` com um documento maior que a área do editor: com o foco no `<p>` de um dispositivo e a rolagem no meio, `quill.root.focus()` e um `setSelection` para o início do texto não alteram `scrollTop`; `quill.root.focus({ preventScroll: false })` continua repassando as opções. Verificar com `npm test` passando (inclui os testes de foco inicial).

## 2. E2E com teclado nativo

- [x] 2.1 Comandos Cypress `cliqueNativo`/`teclaNativa` (ou helpers no próprio spec, se não houver segundo uso) usando `Cypress.automation('remote:debugger:protocol', ...)` com `Input.dispatchMouseEvent`/`Input.dispatchKeyEvent`, chamados dentro de `cy.then` e com a coordenada convertida pela escala do iframe da aplicação. Verificar pelo uso no spec da 2.2.
- [x] 2.2 E2E `cypress/e2e/edicao/home-sem-rolagem.cy.ts`: abre `mpv_905_2019`, repete em várias posições de rolagem o clique nativo no meio de um dispositivo e o Home nativo, conferindo que `scrollTop` não muda e que o cursor fica no início do texto; caso de controle com Ctrl+Home rolando ao início. Verificar com o spec passando e falhando sem a correção da 1.1.
- [x] 2.3 Registrar em `docs/guia-cypress.md` a técnica de eventos nativos por CDP (quando usar, chamada dentro de `cy.then`, conversão de coordenadas). Verificar relendo a seção contra o spec da 2.2.

## 3. Limpeza e registro

- [x] 3.1 Remover o spec de investigação `cypress/e2e/_investigacao-home.cy.ts` e registrar a #1077 em `docs/sessao/TODO.md`. Verificar com `git status` sem o spec de investigação e `openspec validate 2026-11-17-c02-home-sem-rolagem` sem erros.
