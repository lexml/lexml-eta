## Context

`situacaoNaNormaVigente.ts` varre a articulação viva e coleta ids de dispositivos de alteração com `existeNaNormaAlterada` definido; `loadProjetoNorma` reaplica por id antes de abrir a articulação. Dispositivos dentro de excluídos em revisão só existem como snapshots (`elementoAntesRevisao`) e são montados em `montaRevisoesArticulacao`, que também calcula os ids finais `_<base>-exc<n>` apenas ao salvar. Ao abrir, `reconstroiRevisoes` os recria sem `existeNaNormaAlterada`.

## Goals / Non-Goals

**Goals:**
- Gravar a situação dos dispositivos de bloco excluído nas listas já existentes.
- Reaplicar a situação ao reconstruir o excluído ao abrir.

**Non-Goals:**
- Mudar o XSD ou o formato das listas.
- Alterar a situação de dispositivos fora de bloco de alteração.

## Decisions

1. **Coleta junto da montagem das exclusões.** Os ids finais só existem em `montaRevisoesArticulacao`; a lista de situação dos excluídos é montada ali, a partir dos mesmos objetos (`reescreveIds`), e mesclada às listas da varredura da articulação. Alternativa descartada: recalcular ids em separado (divergiria).
2. **Reaplicação em `reconstroiRevisoes`.** O valor de `existeNaNormaAlterada` dos dispositivos reconstruídos vem das listas lidas do arquivo, por id, antes de montar o snapshot `antes` usado ao rejeitar.
3. **Sem formato novo.** Ids `_art…-exc…` são únicos no arquivo e a leitura por id já é tolerante a id sem dispositivo (ignorado).

## Risks / Trade-offs

- Ordem de execução: a leitura das listas precisa estar disponível quando `reconstroiRevisoes` roda; hoje a situação é aplicada em `loadProjetoNorma`, antes. Confirmar o caminho de dados.
- Arquivos salvos antes desta change (e antes da c01) não têm os dados; ficam sem selo, como hoje.
