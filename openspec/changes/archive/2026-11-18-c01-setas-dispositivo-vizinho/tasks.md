# Tasks

## 1. Destino de ↓ e ↑ no dispositivo vizinho

- [x] 1.1 Teste de componente em `test/componente/lexml-eta/` com artigos de texto e vazios (como o print da issue: Arts. 1º e 2º com texto, 3º e 4º vazios, 5º com texto): ↓ no meio do texto do Art. 2º vai ao Art. 3º; ↑ no meio do Art. 5º vai ao Art. 4º; ↓ no meio de um texto com o seguinte mais longo fica na mesma posição horizontal (diferença de `left` de `getBounds` menor que um caractere); seguinte mais curto vai ao fim dele; Shift+↓ não é tratado pelo editor. Disparar o `keydown` com `which`/`keyCode` definidos. Verificar que os casos de destino falham antes da 1.2.
- [x] 1.2 Em `eta-keyboard.ts`, método único usado por `onTeclaArrowDown`/`onTeclaArrowUp`, depois dos testes de fim/início e omissis: sem Shift e na última (↓)/primeira (↑) linha visual, cancela a tecla e leva ao índice do vizinho editável (`linhaEditavel`) mais próximo na horizontal, conforme o design; comentário de uma linha com o porquê. Verificar com o teste da 1.1 e `npm test` completo passando (inclui `navegacaoCursor`).

## 2. E2E com setas nativas

- [x] 2.1 Acrescentar `TECLA_SETA_ABAIXO`/`TECLA_SETA_ACIMA` em `cypress/support/eventos-nativos.ts` e criar `cypress/e2e/edicao/setas-dispositivo-vizinho.cy.ts`: proposição com Arts. 1º a 5º como no print (3º e 4º vazios); clique nativo no meio do texto do Art. 2º e ↓ nativo vai ao Art. 3º; no meio do Art. 5º, ↑ vai ao Art. 4º; controle com artigos com texto mantendo a posição horizontal; texto de várias linhas: ↓ na primeira linha fica no mesmo artigo. Verificar com o spec passando e falhando sem a correção da 1.2.

## 3. Registro

- [x] 3.1 Registrar a #1072 em `docs/sessao/TODO.md`. Verificar com `openspec validate 2026-11-18-c01-setas-dispositivo-vizinho` sem erros.
