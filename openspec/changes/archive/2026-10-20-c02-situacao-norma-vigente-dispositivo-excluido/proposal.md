# Proposal

## Why

A situação "Existente/Novo" dos dispositivos de um bloco de alteração é gravada em `lexedit:SituacaoNaNormaVigente` a partir da articulação viva. Um dispositivo de bloco de alteração que está dentro de um dispositivo excluído em revisão não está mais na articulação, então a situação dele se perde ao salvar. Ao reabrir e rejeitar a exclusão, os dispositivos voltam sem o selo, e o § "Novo" perde a regra de numeração automática do pai "Novo".

Depende da change `2026-10-20-c01-revisao-bloco-alteracao-excluido-movido`, que passa a gravar o bloco de alteração dentro da revisão `excluido`.

## What Changes

- Ao salvar, os ids dos dispositivos de bloco de alteração contidos em dispositivos excluídos em revisão entram em `refIdsDispositivosExistentes` ou `refIdsDispositivosNovos`, conforme a situação que tinham.
- Ao abrir, a situação é reaplicada aos dispositivos reconstruídos do excluído, de modo que rejeitar a exclusão devolve o selo Existente/Novo.
- Sem mudança de formato: as listas já são texto com ids separados por espaço, e os ids `_art…-exc…` já são únicos no arquivo.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `metadados-lexedit`: a situação na norma vigente passa a cobrir dispositivos de bloco de alteração contidos em excluídos.

## Impact

- Código: `src/model/lexml/documento/conversor/situacaoNaNormaVigente.ts` (coleta e reaplicação), `src/model/lexml/documento/conversor/reconstroiRevisoes.ts` (valor de `existeNaNormaAlterada` ao reconstruir) e o ponto que compõe o `lexedit` ao salvar.
- Os ids dos excluídos só são calculados ao salvar (`montaRevisoesArticulacao`); a coleta precisa usar os mesmos ids finais.
