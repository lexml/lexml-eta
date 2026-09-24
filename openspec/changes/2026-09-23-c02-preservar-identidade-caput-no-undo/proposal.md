## Why

Remissões internas cujo destino é o caput de um artigo quebram silenciosamente sempre que uma ação recria o artigo: desfazer a remoção, desfazer um movimento ou rejeitar uma revisão de movimentação. O artigo volta com a mesma identidade de sessão, mas o caput volta com uma identidade nova, e a remissão passa a apontar para um dispositivo que não existe mais — sem aviso, congelada no texto antigo, e salva como se o destino tivesse sido excluído. Além disso, remover o artigo não marca como inválida a remissão para o seu caput, e desfazer a remoção não restaura remissões para descendentes do artigo removido (só para o próprio artigo). Os três efeitos foram confirmados por teste de reducer em 23/09/2026.

A c01 (`2026-09-23-c01-atualizar-remissao-ao-mover-dispositivo`, issue #1004, já integrada e arquivada) deixou o caso do caput explicitamente fora do escopo, com dois casos de teste pendentes; esta change o completa.

## What Changes

- Ações que recriam um artigo (undo/redo de remoção e de movimento, rejeição de revisão de movimentação) passam a recriar o caput com a mesma identidade de sessão que ele tinha, mantendo resolvíveis as remissões que apontam para ele.
- Remover um artigo passa a marcar como inválidas as remissões para o seu caput, como já acontece com o artigo e demais descendentes.
- Desfazer a remoção passa a restaurar a validade de todas as remissões para o dispositivo removido **e seus descendentes** (hoje só o dispositivo raiz é restaurado; remissões para incisos/parágrafos/caput do artigo removido continuam marcadas como inválidas após o undo).
- Mudanças apenas na marcação dos links de remissão (criação do link, marcação de inválido) deixam de gerar passos próprios no histórico de desfazer. Hoje, no uso manual, clicar em "Desfazer" com o foco no dispositivo de origem grava essa marcação como uma edição de texto, e são necessários dois cliques para desfazer uma remoção: o primeiro desfaz só a marcação. Encontrado no teste manual desta change (24/09/2026); o defeito já existia para qualquer alvo, e ficou visível para o caput porque a remoção passou a invalidar a remissão para ele.

## Capabilities

### New Capabilities

(nenhuma)

### Modified Capabilities

- `remissao-interna`: o requisito de invalidação ao excluir o destino passa a cobrir explicitamente descendentes (inclusive o caput) na remoção e na restauração por undo; novo requisito garantindo que remissões para o caput sobrevivem a ações que recriam o artigo; novo requisito garantindo que a marcação de links de remissão não cria passos no histórico de desfazer.

## Impact

- **Código**: modelo `Elemento` (`src/model/elemento/elemento.ts`) e sua criação (`elementoUtil.ts#createElemento`); recriação no undo/redo (`src/redux/elemento/util/undoRedoReducerUtil.ts#redodDispositivoExcluido`); captura de removidos (`removeElemento.ts#capturarRemovidosEDescendentes`); restauração no undo (`undo.ts`); atualização de texto (`atualizaTextoElemento.ts`) e utilitário de HTML (`src/util/html-util.ts`).
- **Sem alteração**: modelo de remissão (`RemissaoInternaValue`), reducers de mover, camada de DOM do editor, formato LexML persistido, `getDispositivoByUuid2` (ver design — não é necessário a esta correção).
- **Relação com a c01 (arquivada)**: a coleta de removidos alterada aqui convive com o sinalizador `suprimirInvalidacaoRemissao` que a c01 introduziu em `removeElemento.ts` para a rejeição de movimentação. Com esta change, o fallback por `uuid2` da c01 passa a funcionar também para caput, e os dois casos deixados como `it.skip` em `reducer-atualiza-remissao-mover.test.ts` (undo/redo e rejeição com alvo no caput) devem passar a valer.
- **Testes**: unitários de reducer (base: teste temporário de caracterização `test/redux/remissao/reducer-undo-remissao-caput.test.ts`); E2E Cypress avaliado na task correspondente.
