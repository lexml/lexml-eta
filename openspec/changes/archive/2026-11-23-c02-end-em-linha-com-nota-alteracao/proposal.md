## Why

Num dispositivo de bloco de alteração que fecha as aspas, a linha termina com o `”` e a nota de alteração, como `(NR)`. Nessa linha, End leva o cursor ao início do dispositivo seguinte, e Shift+End seleciona até lá (issue #1103). O esperado é que End leve ao fim do texto do dispositivo e Shift+End selecione até ele.

## What Changes

- End, com o cursor na última linha do texto na tela, leva o cursor ao fim do texto do dispositivo, mesmo quando a linha termina com o `”` e a nota de alteração.
- Shift+End, na mesma situação, estende a seleção até o fim do texto, sem o `”` nem a nota, mantendo o ponto onde ela começou.
- Nas demais linhas do texto na tela, End e Shift+End continuam indo ao fim daquela linha, como hoje.
- Ctrl+End continua levando ao fim da proposição.

## Capabilities

### New Capabilities

(nenhuma)

### Modified Capabilities

- `navegacao-cursor-editor`: requisito novo "End e Shift+End ficam no texto do dispositivo".

## Impact

- `src/util/eta-quill/eta-keyboard.ts` (tratamento de End e Shift+End sem Ctrl no `keydown`).
- Testes: um teste de componente novo e um E2E novo em `cypress/e2e/edicao/`, com teclas nativas.
- Sem mudança de API pública nem de formato de arquivo.
