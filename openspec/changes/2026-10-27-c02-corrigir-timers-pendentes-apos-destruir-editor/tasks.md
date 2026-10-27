# Tasks

## 1. Observable ignora inscrições canceladas

- [x] 1.1 Em `src/util/observable.ts`, reavaliar `isCanceled()` dentro do `setTimeout` de `notify`; verificar buscando `.cancel()` nos consumidores que nenhum depende de callback pós-cancelamento
- [x] 1.2 Criar `test/util/observable.test.ts` cobrindo: callback ativo é invocado; inscrição cancelada depois do `notify` não é invocada; verificar com o teste passando

## 2. Editor tolera destruição com timers pendentes

- [x] 2.1 Em `EtaQuill.scrollToElemento` (`eta-quill.ts`), obter o elemento dentro do timeout e retornar se for nulo; verificar que não há mais `getBoundingClientRect` de nulo
- [x] 2.2 Em `EditorComponent.elementoSelecionado`, retornar quando `_quill` for indefinido; verificar que não há mais `reading 'linhaAtual'`
- [x] 2.3 Adicionar teste de componente (em `test/componente/lexml-eta/`) que carrega uma proposição, desconecta o editor logo em seguida e aguarda os timers, sem erro não capturado; verificar que falha sem 2.1/2.2 e passa com elas

## 3. Validação e E2E

- [x] 3.1 Rodar `npm test` completo e verificar que o Lote 1 passa (sem "done() called multiple times" nem `ResizeObserver loop`); se algum persistir, registrá-lo como causa separada
- [x] 3.2 E2E (Cypress), avaliado à luz de `docs/guia-cypress.md`: o defeito só se manifesta em teardown rápido do componente, o que o Cypress não reproduz de forma determinística. Decisão: não criar spec novo; como alternativa, rodar o spec E2E da change anterior (seleção da ementa, `cypress/e2e/`) e verificar que continua passando, confirmando que o foco inicial não regrediu
