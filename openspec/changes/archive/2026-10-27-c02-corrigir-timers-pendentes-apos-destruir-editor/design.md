## Context

A change `2026-10-27-c01` adicionou `this.quill.marcarLinhaAtual(el)` ao foco inicial (`editor.component.ts`, `carregarArticulacao`). `marcarLinhaAtual` chama `atualizarLinhaCorrente` (que agenda `scrollToElemento` em `setTimeout(0)`) e `elementoSelecionado.notify` (que agenda a entrega em `setTimeout(1)`). Nos testes de componente do Lote 1 (`anexos`, `documentoArticulado`, `pena`, `preambulo`), o editor é destruído antes desses timers dispararem. Em `disconnectedCallback`, `destroiQuill` zera `_quill` e limpa o DOM, então:

- `EditorComponent.elementoSelecionado` lê `this.quill.linhaAtual` com `_quill` indefinido;
- `isInEtaBoxViewport` chama `getBoundingClientRect()` em um `el` capturado antes do timeout, agora nulo.

O Mocha trata ambos como erro não capturado, quebrando hooks `beforeEach` (cascata de 65 falhas). Os lotes 2 a 9 passaram. A análise foi feita por leitura de código; a hipótese é confirmada pela correção (ver Riscos).

## Goals / Non-Goals

**Goals:**
- Eliminar os erros não capturados após a destruição do editor, tornando o Lote 1 verde.
- Corrigir a causa raiz no `Observable` (cancelamento só checado no agendamento).

**Non-Goals:**
- Alterar o comportamento de foco/seleção inicial da ementa.
- Reverter o `marcarLinhaAtual` da change anterior.
- Mudar o `Observable` além da checagem de cancelamento.

## Decisions

1. **`Observable.notify` rechecar `isCanceled()` dentro do `setTimeout`.** Corrige a classe do problema para todos os assinantes. Alternativa: só guardas locais no editor; descartada por deixar o defeito latente (o commit `490cfd48` é do mesmo tipo).
2. **`scrollToElemento` resolver o elemento dentro do timeout e sair se for nulo.** Não há inscrição a cancelar nesse caminho, então a guarda precisa ser local. Alternativa: cancelar o timer em `destroi()`; descartada por exigir guardar o id do timer sem ganho sobre a guarda simples.
3. **`elementoSelecionado` sair cedo quando `_quill` é indefinido.** Defesa adicional para callbacks já entregues; barata e explícita.

## Risks / Trade-offs

- Código que dependesse de callback de inscrição cancelada seria afetado. Mitigação: busca por `.cancel()` e `inscricoes` nos consumidores antes de aplicar, e `npm test` completo.
- Se após as guardas ainda houver erros no Lote 1 (inclusive os `ResizeObserver loop`, cuja relação não foi verificada), investigar como causa separada, sem silenciá-los.
