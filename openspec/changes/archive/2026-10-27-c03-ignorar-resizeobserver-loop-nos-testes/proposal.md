# Proposal

## Why

O `npm test` falha de forma intermitente no Lote 1 com `ResizeObserver loop completed with undelivered notifications`, atribuído ao teste `anexos > aba > também aparece no modo anexo de parecer`. Em uma das 5 execuções repetidas dos arquivos `anexos.component.test` e `documentoArticulado.component.test`, o erro derrubou 13 testes em cascata (`done() called multiple times`). O aviso é inofensivo do navegador, vindo do `sl-tab-group` do Shoelace quando uma aba é removida na reabertura do documento, mas o Mocha o trata como erro não capturado. O contorno atual (aguardar o `updateComplete` do `sl-tab-group` no fim do teste) existe em dois testes e comprovadamente não basta.

## What Changes

- Tratar o `ResizeObserver loop` de forma centralizada no ambiente de testes do navegador (`testRunnerHtml` do `web-test-runner.config.mjs`), ignorando apenas esse aviso e preservando todos os demais erros não capturados.
- Investigar, com evidência, qual interação dispara o aviso e registrar a conclusão no `design.md` (se é do app ou apenas do Shoelace).
- Reavaliar os contornos pontuais já existentes (`await ...updateComplete` nos testes de `documentoArticulado` e `exibirDiferencaDialog`) e removê-los somente se a solução central os tornar desnecessários.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

Nenhuma. Mudança apenas de infraestrutura de testes, sem alteração de comportamento do produto (`skip_specs: true`).

## Impact

- `web-test-runner.config.mjs` (e `web-test-runner.documento-articulado.config.mjs`, se tiver `testRunnerHtml` próprio).
- Possível simplificação em `test/componente/lexml-eta/documentoArticulado.component.test.ts` e `test/components/editor/exibirDiferencaDialog.test.ts`.
- Sem impacto em `src/`, em API pública ou em formato de arquivo.
