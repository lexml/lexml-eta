## Why

Ao excluir o Art. 1º, o cursor some (issue #1074). Ao excluir qualquer outro artigo, ele vai para o dispositivo acima, como esperado.

Depois da exclusão, `removerLinhaQuill` (`editor.component.ts`) põe o cursor na linha anterior à removida. Antes do Art. 1º está o preâmbulo, que desde a #1037 não recebe cursor nem é marcado como linha atual (`editavel` falso): o cursor fica no preâmbulo, sem linha marcada, e a linha atual continua sendo a do artigo excluído. Por isso ↑ leva à ementa (as setas pulam a linha não editável) e ↓ não mostra o cursor. Confirmado por teste de componente.

## What Changes

- Depois de excluir um dispositivo, quando a linha anterior não é editável (preâmbulo, epígrafe), o cursor vai para o início do texto da próxima linha editável — no caso da issue, o novo Art. 1º — e ela passa a ser a linha atual.
- Nos demais casos, nada muda: o cursor continua indo para o dispositivo acima.

## Capabilities

### New Capabilities

(nenhuma)

### Modified Capabilities

- `navegacao-cursor-editor`: novo requisito sobre o cursor depois de excluir um dispositivo.

## Impact

- `src/components/editor/editor.component.ts` (`removerLinhaQuill`).
- Sem mudança de API pública nem de formato de arquivo.
