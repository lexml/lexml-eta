## Why

Ao transformar um dispositivo com Shift+Tab e, logo em seguida, com Tab (por exemplo, inciso → parágrafo → inciso), o cursor sobe para o dispositivo anterior em vez de permanecer no dispositivo transformado (issue #1038). O erro ocorre com qualquer tipo de dispositivo (inciso, parágrafo, alínea) e atrapalha quem encadeia transformações.

A causa foi confirmada com teclado real e instrumentação no navegador: a transformação recria a linha do Quill, e `inserirNovoElementoNoQuill` só seleciona a linha recriada quando `timerOnChange` está inativo. A transformação anterior termina armando esse debounce de 1 s (`agendarEmissaoEventoOnChange`), então um Tab dado dentro de 1 s encontra o timer ativo, não seleciona a nova linha, e `removerLinhaQuill` reposiciona a seleção no índice da linha removida, que agora pertence ao dispositivo anterior.

## What Changes

- `EditorComponent.transformarElemento` passa a cancelar o debounce de `onChange` pendente antes de despachar a transformação, como já fazem a inclusão de dispositivo, a movimentação e o desfazer/refazer.
- A emissão de `onChange` não se perde: o próprio lote de eventos da transformação rearma o debounce ao final.
- Teste E2E de regressão (Cypress) que arma o `timerOnChange` antes do Tab e confere que a linha ativa continua sendo a do dispositivo transformado.
- Documenta o comportamento esperado em uma capability nova, já que não existe spec para a transformação de dispositivos.

## Capabilities

### New Capabilities
- `transformacao-dispositivo`: comportamento do cursor e da linha ativa após transformar o tipo de um dispositivo pelo teclado (Tab e Shift+Tab).

### Modified Capabilities

Nenhuma.

## Impact

- Código: `src/components/editor/editor.component.ts` (`transformarElemento`).
- Testes: novo spec em `cypress/e2e/transformacao/`.
- Sem mudança de API, de formato de arquivo ou de dependências.
