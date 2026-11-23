## Context

Ver proposal.md (Why). Fatos que moldam a solução:

- Quem decide a linha do cursor na exclusão é o editor, por posição: `removerLinhaQuill` (`editor.component.ts`) trata todo evento `ElementoRemovido` e, depois de remover as linhas, leva o cursor ao início do texto da linha em `range.index - 1`, com o desvio da #1074 para a próxima linha editável quando a de cima não é editável.
- `removerLinhaQuill` também roda no desfazer de uma inclusão, no refazer de uma exclusão e ao rejeitar uma revisão de inclusão (`RevisaoAdicionalRejeitada`). Nesses caminhos o cursor deve continuar como hoje; alguns emitem um `ElementoMarcado` depois, outros não (o desfazer só marca em parte dos casos, `undo.ts`).
- O Backspace em linha vazia (`REMOVER_ELEMENTO_SEM_TEXTO` com `key === 'Backspace'`) emite `ElementoMarcado` com `moverParaFimLinha` para o dispositivo anterior, aplicado num `setTimeout(0)`, que prevalece sobre `removerLinhaQuill`. O Delete em linha vazia não emite nada e hoje sobe pelo comportamento padrão.
- O dispatch é síncrono até `processarStateEvents`, e o teste de componente da #1074 despacha `removerElementoAction` direto no store, sem passar pelo editor.
- No modo de revisão, as linhas do excluído e dos seus descendentes recebem `atualizarElemento` e continuam na tela; o evento `ElementoRemovido` traz o excluído e os descendentes.

## Goals / Non-Goals

**Goals:**
- A exclusão feita pelo usuário (Ctrl+D, menu "Remover", Delete em linha vazia) deixa o cursor na linha seguinte ao excluído, subindo só quando não há linha editável abaixo.

**Non-Goals:**
- Desfazer, refazer, rejeitar revisão, Backspace em linha vazia e exclusão de agrupador (que já marca o primeiro filho por `ElementoMarcado` depois deste ponto).
- Destino "próximo do mesmo nível": a regra é a linha seguinte na tela (decisão do usuário).

## Decisions

**1. Marcar no evento, no reducer, a exclusão feita pelo usuário.** `StateEvent` ganha o campo opcional `cursorNaLinhaSeguinte`, ao lado de `moverParaFimLinha`. Em `elementoReducer.ts`, os casos `REMOVER_ELEMENTO` e `REMOVER_ELEMENTO_SEM_TEXTO` com `key === 'Delete'` marcam o evento `ElementoRemovido` resultante. Os demais caminhos chamam `removeElemento` como função (`undo`, `redo`, `rejeitaRevisao`) ou montam o evento por conta própria, e ficam sem a marca.
- Alternativa descartada: um campo no `EditorComponent` ligado antes do dispatch. Não cobre o dispatch direto no store (teste de componente e host) e espalha a regra pelos três pontos de disparo.
- Alternativa descartada: o reducer emitir `ElementoMarcado` para o dispositivo seguinte. Exigiria achar no modelo a "linha seguinte" (inclusive a linha excluída que fica na tela em revisão), e é aplicado num `setTimeout`, com o cursor passando antes pela linha de cima.

**2. Linha seguinte calculada antes de remover.** Em `removerLinhaQuill`, com a marca, guardar a linha logo depois da última linha do lote (a primeira que não pertence a `event.elementos`) antes de remover ou atualizar as linhas; depois, avançar dali até a primeira linha editável e usar o início do texto dela. Sem linha editável abaixo, seguir o caminho atual (linha de cima, com o desvio da #1074). Funciona igual em revisão, porque o ponto de partida já fica depois das linhas mantidas na tela.

**3. Conferir a marca depois de `atualizaRevisao` e `sincronizarRemissoesPosAcao`.** As duas rodam depois do reducer de exclusão; se alguma reconstruir o evento `ElementoRemovido`, a marca se perde. O teste de revisão (task 1.1) cobre isso; se ela se perder, a marca é aplicada no fim do `elementoReducer`, sobre o evento final.

## Risks / Trade-offs

- [A linha seguinte é de outra estrutura, como um agrupador (CAPÍTULO II) depois do último artigo do capítulo] → o cursor vai para o agrupador, que é a linha que toma o lugar na tela. Aceito na decisão do usuário.
- [Um evento anterior no mesmo lote remove a linha guardada] → conferir que ela ainda está no documento (`domNode.isConnected`) antes de usá-la e, senão, cair no caminho atual.
