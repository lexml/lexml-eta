## Context

O `ResizeObserver loop completed with undelivered notifications` é um aviso do navegador (evento `error` na janela) emitido quando uma notificação de `ResizeObserver` não é entregue no mesmo quadro. O `@web/test-runner-mocha` o registra como erro não capturado do teste em execução. No Lote 1, ele atingiu `anexos > aba > também aparece no modo anexo de parecer` (em 1 de 5 execuções repetidas, com 13 falhas em cascata) e já aparecia no resultado original. O teste reabre o documento com `anexoParecer: true`, o que remove a aba "Justificação" e o painel "notas" do `sl-tab-group` ([lexml-eta.component.ts](src/components/lexml-eta.component.ts)).

**Investigação (confirmada):** em 10 execuções dos dois arquivos de componente, 1 falhou (10%), sempre com esse aviso e sempre no mesmo teste de anexos. No Shoelace instalado (`chunk.FDP56HU3.js`), o `sl-tab-group` observa o `nav` com um `ResizeObserver` cujo callback chama `preventIndicatorTransition()`, `repositionIndicator()` e `updateScrollControls()`; esta última altera a propriedade reativa `hasScrollControls`, que re-renderiza e muda o layout do mesmo `nav`, gerando nova notificação no mesmo quadro. A remoção da aba "Justificação" ao reabrir com `anexoParecer` muda a largura do `nav` e dispara esse ciclo; quando o quadro coincide, o navegador emite o aviso. A origem é o próprio Shoelace, não código do app, e o aviso não indica perda de dado nem defeito funcional.

Já existe um contorno pontual em `documentoArticulado.component.test.ts` e `exibirDiferencaDialog.test.ts` (aguardar o `updateComplete` do `sl-tab-group`). A tentativa de aplicá-lo ao teste de anexos não eliminou a falha intermitente.

## Goals / Non-Goals

**Goals:**
- Fazer o `npm test` deixar de falhar por esse aviso, sem esconder outros erros.
- Registrar com evidência a origem do aviso.

**Non-Goals:**
- Alterar `src/` ou o comportamento do `sl-tab-group`.
- Ignorar erros não capturados em geral.

## Decisions

1. **Tratamento central no `testRunnerHtml`**, em um script que registra um listener de `error` em fase de captura, antes do script de autorun do Mocha, e chama `stopImmediatePropagation()` somente quando a mensagem contém `ResizeObserver loop`. Alternativa: helper importado por cada teste; descartada por exigir lembrar de usá-lo em todo teste com `sl-tab-group`.
2. **Filtro estrito pela mensagem**: qualquer outro erro continua chegando ao Mocha. Não usar `window.onerror = () => true`.
3. **Contornos pontuais existentes** ficam, a menos que a investigação mostre que se tornam inócuos; removê-los não é objetivo e só é feito com evidência.
4. **Ordem do listener**: o Mocha registra `onerror` ao carregar; o listener de captura precisa rodar antes dele. Verificar empiricamente (ver tasks) e, se a ordem não valer, registrar o listener antes do carregamento do framework de testes.

## Risks / Trade-offs

- Ignorar o aviso pode mascarar um loop de layout real do app. Mitigação: filtro restrito à mensagem exata do `ResizeObserver` e investigação registrada; o aviso nunca causa perda de dado.
- O comportamento da ordem dos listeners pode variar entre versões do Chromium/Mocha. Mitigação: teste de regressão que dispara o aviso e confirma que não derruba o teste.
