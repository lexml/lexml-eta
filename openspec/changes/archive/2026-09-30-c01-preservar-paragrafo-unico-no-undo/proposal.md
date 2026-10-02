## Why

Uma remissão para "parágrafo único do art. 2º" passa a "§ 1º do art. 2º" quando uma ação recria o artigo do parágrafo a partir do histórico ou de uma revisão: desfazer (e refazer) um movimento do artigo, ou rejeitar uma revisão de movimentação. O parágrafo continua exibindo "Parágrafo único.", mas volta com id `art2_par1` em vez de `art2_par1u`, e a sincronização de remissões recalcula o texto a partir desse id. No sentido inverso, um artigo carregado de arquivo cujo único parágrafo o autor redigiu como "§ 1º" passa a "Parágrafo único." (rótulo, id e remissão) quando o parágrafo é removido e a remoção é desfeita — o desfazer deixa de devolver o documento ao estado anterior. Os dois efeitos foram confirmados por teste de reducer em 30/09/2026.

A change arquivada `2026-09-22-c01-corrigir-remissao-paragrafo-unico` (issue #1003) resolveu a mesma divergência entre rótulo e id para a edição ao vivo, mas não cobre a recriação de dispositivos pelo desfazer/refazer e pela rejeição de revisão.

## What Changes

- Ações que recriam um parágrafo a partir do histórico ou de uma revisão (desfazer/refazer de movimento e de remoção, rejeição de revisão de movimentação) passam a recriá-lo na mesma forma — "único" ou numerada — que ele tinha no momento registrado, sempre que ele continuar sendo o único parágrafo do seu artigo. O id do parágrafo e o texto das remissões para ele acompanham essa forma.
- Quando o artigo recriado tem mais de um parágrafo, a forma numerada continua sendo decidida pela contagem, como hoje.

## Capabilities

### New Capabilities

(nenhuma)

### Modified Capabilities

- `remissao-interna`: novo requisito garantindo que a forma "único"/numerada de um parágrafo, e das remissões para ele, é preservada em ações que recriam o parágrafo a partir do histórico ou de uma revisão.

## Impact

- **Código**: recriação de dispositivos no undo/redo e na rejeição de revisão (`src/redux/elemento/util/undoRedoReducerUtil.ts#incluir`).
- **Sem alteração**: modelo `Elemento` (a forma já está no `rotulo` registrado), `buildId`/`buildHref` (`idUtil.ts`), `createRotulo` (`numeracaoParagrafo.ts`), sincronização de remissões, formato LexML persistido.
- **Fora do escopo**: com a revisão ativa, rejeitar a revisão de **remoção** de um dispositivo referenciado deixa a remissão marcada como inválida, embora o destino volte a existir. Encontrado na mesma investigação, mas sem relação com o parágrafo único; a spec só prevê a restauração ao rejeitar revisão de movimentação. Será tratado em issue própria.
- **Testes**: unitários de reducer (base: teste temporário de caracterização `test/redux/remissao/reducer-undo-remissao-paragrafo-unico.test.ts`); E2E Cypress avaliado na task correspondente.
