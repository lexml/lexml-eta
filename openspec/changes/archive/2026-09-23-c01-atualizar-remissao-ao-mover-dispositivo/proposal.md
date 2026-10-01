## Why

Issue #1004: a atualização automática do texto/link das remissões internas funciona para as ações estruturais que renumeram dispositivos (adicionar, remover, TAB etc.), mas não para "Mover para cima" e "Mover para baixo" — que também renumeram. Após mover, remissões para o dispositivo movido (e para o irmão deslocado) passam a exibir o número antigo, apontando silenciosamente para o dispositivo errado. O mesmo vale para a rejeição de uma revisão de movimentação, que desfaz o movimento sem atualizar as remissões e, além disso, marca na tela como inválidas remissões que continuam válidas.

## What Changes

- "Mover para cima" e "Mover para baixo" passam a atualizar o texto e o destino das remissões internas afetadas, com as mesmas regras já aplicadas às demais ações estruturais (qualificada, enxuta, contextual, texto manual preservado, texto livre nunca regenerado).
- Remissões cujo destino é o dispositivo movido ou um de seus descendentes continuam apontando para ele após o movimento (hoje perdem o vínculo, porque o movimento atribui nova identidade de sessão à subárvore movida).
- Remissões contidas no texto do dispositivo movido continuam funcionais (link, popup, atualização futura) após o movimento.
- Desfazer/refazer o movimento restaura as remissões de forma coerente.
- Rejeitar uma revisão de movimentação atualiza as remissões para a posição restaurada e não marca como inválidas remissões cujo destino continua existindo.

## Capabilities

### New Capabilities

(nenhuma)

### Modified Capabilities

- `remissao-interna`: o requisito de atualização automática em renumeração passa a cobrir mover para cima/baixo e a rejeição de revisão de movimentação; novo requisito garantindo que remissões para/dentro de um dispositivo movido preservam o vínculo, e que a rejeição de uma movimentação em revisão não invalida remissões.

## Impact

- **Código**: pós-processamento de remissões do reducer (`sincronizarRemissoesPosAcao.ts`), sincronização de entradas (`src/model/remissao/sincronizarRemissoes.ts`), modelo `RemissaoInternaValue` (`src/model/remissao/remissao.ts`), pontos de criação de entradas do registry (`adicionaRemissaoInterna.ts`, `inicializaRemissoesAoAbrir.ts`), rejeição de revisão (`rejeitaRevisao.ts`/`removeElemento.ts`).
- **Sem alteração**: reducers de mover (`moveElementoAcima.ts`/`moveElementoAbaixo.ts`), camada de DOM do editor, undo/redo genérico, formato LexML persistido.
- **Fora do escopo**: perda de identidade do caput ao desfazer uma ação que recria o artigo (bug pré-existente, tratado à parte — `docs/sessao/PROMPT_BUG_CAPUT_UNDO.md`).
- **Testes**: unitários de reducer para o núcleo; novo grupo E2E Cypress `grupo-k` para o fluxo pela UI.
