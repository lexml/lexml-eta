## Context

Ver `proposal.md` (Why). Pontos do estado atual que sustentam a decisão, confirmados com teclado real e instrumentação no navegador:

- Uma transformação (Tab/Shift+Tab) preserva o uuid, então o lote de eventos traz `ElementoIncluido` e `ElementoRemovido` do mesmo dispositivo. A linha do Quill é removida e recriada (o tipo mudou).
- `inserirNovoElementoNoQuill` só seleciona a linha recriada se `timerOnChange` estiver inativo (`selecionarLinha && !this.timerOnChange && fnSelecionarNovaLinha(...)`). A guarda existe para evitar o reposicionamento do cursor quando um dispositivo novo nasce logo após uma digitação (commit `2a26445a`).
- `processarPosLoopEventos` arma `timerOnChange` (1 s) ao final de todo lote com inclusão, remoção, modificação ou renumeração, inclusive o da própria transformação.
- Quando a seleção da linha recriada é pulada, `removerLinhaQuill` posiciona a seleção no índice da linha removida, que já pertence ao dispositivo anterior, e marca esse dispositivo como linha atual.
- Inclusão de dispositivo (Enter), movimentação e desfazer/refazer já chamam `cancelarTimerOnChangePendente()` antes de despachar; `transformarElemento` é a exceção.
- Fica intermitente porque o `flushEdicaoPendente` (blur/`focusout`) às vezes zera o timer antes do segundo Tab, e às vezes não.

## Goals / Non-Goals

**Goals:**
- O cursor permanece no dispositivo transformado, qualquer que seja o intervalo entre transformações.
- Seguir o padrão já usado pelas demais ações estruturais do editor.

**Non-Goals:**
- Alterar a guarda `!this.timerOnChange` de `inserirNovoElementoNoQuill` ou o fluxo de criação de dispositivo.
- Mudar o reducer de transformação, o histórico (undo/redo) ou a sincronização de remissões.

## Decisions

**D1. Cancelar o debounce pendente em `transformarElemento`, antes do dispatch.**
Replica o padrão de `adicionarElemento`, `moverElemento` e `undoRedoEstrutura`. Com o timer limpo, a transformação encontra `timerOnChange` inativo, e `inserirNovoElementoNoQuill` seleciona a linha recriada.

Alternativas consideradas:
- *Selecionar a linha sempre que ela já existia (`linhaASerReinserida`), ignorando o timer.* É mais pontual e preserva a guarda para dispositivos novos, mas acrescenta uma condição a um método com histórico de regressão e foge da convenção do código. Fica como plano B se a D1 se mostrar insuficiente.
- *Remover a guarda `!this.timerOnChange`.* Reabriria o bug do commit `2a26445a`.

**D2. Não perder a emissão de `onChange`.**
O cancelamento descarta só o agendamento atual. O lote de eventos da transformação chama `agendarEmissaoEventoOnChange` ao final (confirmado no log: `ARMA-TIMER` logo após `REMOVER-LINHA`), então a emissão sai depois da transformação. Texto digitado e ainda não sincronizado também não se perde: `transformarElemento` envia o texto atual da linha no elemento da ação, e a conversão o usa (`novo.texto = action.atual.conteudo?.texto ?? atual.texto`, em `dispositivoLexmlUtil.ts`).

## Risks / Trade-offs

- [O cancelamento atrasa a emissão de `onChange` em até 1 s a mais] → O comportamento é o mesmo de Enter, mover e desfazer/refazer, e o debounce de texto é rearmado ao final da transformação.
- [A correção não cobrir o caso em que o timer é armado entre o cancelamento e o processamento dos eventos] → O cancelamento e o dispatch ocorrem no mesmo tick síncrono, e o timer só é rearmado depois do processamento dos eventos (log: `ARMA-TIMER` depois de `REMOVER-LINHA`). O E2E arma o timer antes do Tab para cobrir esse ponto.
- [Regressão em Enter/criação de dispositivo] → Nenhum código desse fluxo é alterado.

## Open Questions

Nenhuma.
