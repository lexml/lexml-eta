## Why

Ao mover para cima um artigo que contém uma remissão interna (ex.: o art. 3º, com o texto "Conforme o parágrafo único do art. 2º", passa a art. 2º), o link na tela fica com o destino correto, mas exibe o número antigo: "parágrafo único do art. 2º" em vez de "art. 3º". O registro de remissões e o texto do estado já estão corretos; só o que o editor desenha está desatualizado, e um salvamento posterior ou uma nova edição da linha pode propagar o texto antigo. Reproduzido em 01/10/2026 pela tela (Cypress) e por teste de reducer.

O defeito é anterior à change `2026-09-30-c01-preservar-paragrafo-unico-no-undo` e independe do parágrafo único: acontece com qualquer remissão cujo número de destino muda quando a **origem** é o artigo movido. Quando a origem não é movida, o link já existe no DOM e é reescrito corretamente.

## What Changes

- Quando uma ação estrutural atualiza o texto de uma remissão na origem, a linha que o editor recria para essa origem passa a nascer com o texto já atualizado, e não com o texto de antes da sincronização.
- O texto exibido no link, o destino do link e o texto do dispositivo no estado voltam a concordar logo após mover (para cima/baixo), desfazer, refazer e rejeitar revisão de movimentação.
- Sem mudança de comportamento para remissões cuja origem não é recriada, nem para textos de remissão editados manualmente (continuam preservados).

## Capabilities

### New Capabilities

(nenhuma)

### Modified Capabilities

- `remissao-interna`: novo requisito garantindo que o texto exibido de uma remissão, na linha recriada do artigo que a contém, reflete a numeração atual do destino.

## Impact

- **Código**: `src/redux/elemento/reducer/sincronizarRemissoesPosAcao.ts` (reconciliação dos eventos do lote com o texto sincronizado da origem).
- **Sem alteração**: `moduloRemissao.ts` e `editor.component.ts` (renderização), `sincronizarRemissoes.ts` (regras de atualização do texto), `mover*`/`undo`/`redo`, formato LexML persistido.
- **Testes**: unitário de reducer (base: `test/redux/remissao/reducer-mover-artigo-vizinho-paragrafo-unico.test.ts`, não commitado, 1 caso falhando); E2E Cypress no grupo M (CT-M-03), reproduzindo o roteiro do usuário.
