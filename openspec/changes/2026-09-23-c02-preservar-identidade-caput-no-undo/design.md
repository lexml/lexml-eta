## Context

Ver proposal.md — Why. Estado atual relevante (confirmado por teste de caracterização em 23/09/2026):

- **O caput não tem Elemento próprio.** `createElemento`/`getElementos` percorrem `filhos`, e `HierarquiaArtigo.filhos` devolve `caput.filhos + paragrafos`, sem o caput (invariante (n) do CLAUDE.md). O texto do artigo é delegado ao caput (`conteudoUtil.ts`), por isso sobrevive à recriação via `elemento.conteudo.texto`.
- **Recriação no undo/redo**: `incluir()` → `redoDispositivosExcluidos` → `redodDispositivoExcluido` (`undoRedoReducerUtil.ts`) chama `criaDispositivo`, que para artigos cria um caput novo (`uuid` de `Counter.next()`, `uuid2` de `generateUUID()`), e depois copia só `uuid`/`uuid2` do Elemento do artigo. É o mesmo caminho usado por undo de remover, undo de mover, redo e `rejeitaExclusao` (rejeição de revisão de movimentação).
- **Captura de removidos**: `capturarRemovidosEDescendentes` (`removeElemento.ts`) percorre `filhos` — o caput nunca entra em `lexmlIdsRemovidos`/`uuidsRemovidos`, então `marcarRemissoesComoInvalidas` não o marca.
- **Restauração no undo**: `undo.ts` usa `eventos.find(...)` e processa só o **primeiro** `RemissaoInvalidada` (o dispositivo raiz removido). Remissões para descendentes invalidadas pela remoção continuam `valida:false` após o undo — bug pré-existente, confirmado com remissão para inciso do artigo removido.
- **Mover** (`resetUuidTodaArvore`) não toca o caput: o caput mantém `uuid`/`uuid2` no movimento em si; só perde a identidade quando o undo do movimento o recria.
- **O que a c01 (arquivada) deixou no código**: resolução das entradas do registry por `uuid` com fallback por `uuid2` e reancoragem, via buscas locais `buscarDispositivoPorUuid`/`buscarDispositivoPorUuid2` (`sincronizarRemissoes.ts`), que cobrem caput e artigo com bloco de alteração; `MOVER_*` e `REJEITAR_REVISAO` em `ACOES_ESTRUTURAIS`; sinalizador `suprimirInvalidacaoRemissao` em `removeElemento`, enviado por `rejeitaInclusao` na rejeição de movimentação. Os casos com alvo no caput ficaram como `it.skip` em `reducer-atualiza-remissao-mover.test.ts` (undo/redo do movimento e rejeição da movimentação).

## Goals / Non-Goals

**Goals:**
- Caput recriado com o mesmo `uuid` e `uuid2` que tinha, em toda recriação que passa por `redodDispositivoExcluido`.
- Remoção invalida remissões para o caput; undo restaura remissões para qualquer descendente do removido.

**Non-Goals:**
- **Redo não reinvalida remissões** (remover → undo → redo deixa as remissões válidas apontando para dispositivo removido). Pré-existente e independente de caput — `redo.ts` não trata remissões para nenhum alvo. Registrar como issue à parte.
- Lacunas de `getDispositivoByUuid2` (caput e artigo com bloco de alteração) — ver `docs/sessao/ACHADO_BUSCA_UUID2_C02.md`. Esta correção não busca por `uuid2`, e a c01 já usa busca própria (`buscarDispositivoPorUuid2`). O possível bug latente em `aplicaRevisoes.ts:109` fica para issue da revisão (hoje mascarado pelo fallback por `lexmlId` na linha seguinte).
- Capturar como removidos os dispositivos dentro de blocos de alteração (`alteracoes`) do artigo removido — a captura atual já não os inclui; fora do escopo.
- Alterar o modelo de remissão (`RemissaoInternaValue`) ou as regras de atualização de texto.

## Decisions

### D1 — Identidade do caput carregada no Elemento do artigo

`Elemento` ganha um campo opcional com a identidade do caput (ex.: `caput?: { uuid: number; uuid2: string }`), preenchido por `createElemento` quando o dispositivo é artigo. `redodDispositivoExcluido`, ao recriar um artigo, reaplica esses valores ao caput recém-criado.

Por que aqui: é o único ponto por onde passam todas as recriações (undo/redo de remover e de mover, rejeição de revisão), e o Elemento é o que fica guardado em `past`/`future` e nos snapshots de revisão (`elementoAntesRevisao`/`elementoAposRevisao`).

Alternativas consideradas:
- **Incluir o caput como Elemento na lista de removidos/incluídos**: quebra a invariante (n) e faria a camada de DOM tentar criar uma linha para o caput. Descartado.
- **Remissão ao caput como alvo relativo ao artigo** (`targetUuid` do artigo + marcador de caput): muda o modelo de remissão e todos os consumidores de `targetUuid` (diálogos, popup, serialização), e o `uuid` do artigo muda ao mover (exigiria passar também por reancoragem). Descartado.
- **Fallback por `targetLexmlId` terminado em `_cpt`**: o id textual muda com renumeração — a mesma fragilidade que motivou o uso de `uuid`. Descartado.
- **Preservar só o `uuid2`** (e deixar o fallback da c01 reancorar): funcionaria, mas faria toda remissão ao caput passar por reancoragem e reescrita de `href` a cada recriação, dependendo do pós-processamento de ação estrutural. Preservando os dois, a entrada resolve direto pelo `uuid`, sem reancoragem.

### D2 — Reaplicação protegida contra identidade duplicada

A reaplicação só ocorre se nenhum dispositivo da articulação já tiver aquele `uuid`, verificado com `buscarDispositivoPorUuid` da c01 (cobre caput e artigo com bloco de alteração, ao contrário de `findDispositivoByUuid`). No fluxo normal de undo, `remover()` roda antes de `incluir()`, então o caput antigo já saiu da árvore; mas em `isUndoRedoColarSubstituindo` a ordem é inversa (incluir antes de remover). A guarda evita dois dispositivos com o mesmo `uuid` nesse e em qualquer fluxo futuro; na ausência do campo (históricos anteriores à mudança) o comportamento é o atual.

### D3 — Caput incluído na captura de removidos, sem mudar o resto do percurso

`capturarRemovidosEDescendentes` passa a visitar também o caput quando o dispositivo visitado é artigo. Não trocar pelo `percorreHierarquiaDispositivos` inteiro: ele também desce em `alteracoes`, o que ampliaria o conjunto de invalidações além do escopo (ver Non-Goals).

### D4 — Undo restaura todas as invalidações do lote

`undo.ts` passa a processar **todos** os eventos `RemissaoInvalidada` do lote (não só o primeiro), restaurando entradas `valida:false` cujo destino está entre os dispositivos restaurados. O casamento usa `targetUuid` quando presente (identidade estável, agora preservada também para o caput por D1) e cai para `targetLexmlId` apenas quando `targetUuid` é indefinido — mesma regra de `marcarRemissoesComoInvalidas`. Isso evita restaurar uma entrada invalidada por outra ação com id textual coincidente, preservando a invariante preserve-invalids. Um único `RemissaoRestaurada` por dispositivo restaurado continua sendo emitido, como hoje é emitido para o raiz.

## Risks / Trade-offs

- [Elementos antigos em `past`/`future` sem o campo novo] → campo opcional; ausência degrada para o comportamento atual, sem erro.
- [Snapshots de revisão (`JSON.parse(JSON.stringify(elemento))`) passam a carregar o campo] → valor serializável e inerte fora de `redodDispositivoExcluido`; teste de rejeição de revisão cobre o caminho.
- [D3 alterar o comportamento da rejeição de movimentação da c01] → com `suprimirInvalidacaoRemissao`, a rejeição de movimentação não emite invalidação, independentemente de quais dispositivos são coletados; D3 só amplia a coleta. Verificar com `reducer-atualiza-remissao-mover.test.ts` e `reducer-invalida-restaura-remissao.test.ts`.
- [D4 mudar o comportamento de alertas/eventos no undo de remoções com muitos descendentes] → os alertas já são removidos por `sourceUuid`; teste com remissões para raiz, inciso e caput do mesmo artigo removido.
- [Guarda de D2 custa uma busca em profundidade por artigo recriado] → só em undo/redo/rejeição de artigos, não em digitação.

## Migration Plan

Sem migração: `uuid`/`uuid2` são identidade de sessão, não persistidos; o formato LexML salvo não muda. Rollback = reverter o commit.
