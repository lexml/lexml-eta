## 1. Cursor depois de excluir

- [x] 1.1 Ampliar `test/componente/lexml-eta/cursorAposRemover.component.test.ts` (preâmbulo e Arts. 1º a 3º só com caput): excluir o Art. 2º leva o cursor ao início do texto do novo Art. 2º (antigo 3º) e o marca como linha atual; excluir o Art. 3º (último) leva ao Art. 2º; o caso do Art. 1º continua valendo; Delete em linha vazia (`removerElementoSemTextoAction` com `'Delete'`) vai ao seguinte e Backspace (`'Backspace'`) ao fim do anterior; em revisão, excluir o Art. 2º deixa o cursor no Art. 3º; artigo com parágrafo excluído leva ao artigo seguinte; desfazer a inclusão de um artigo mantém o cursor como hoje. Verificar que os casos novos de exclusão falham antes da 1.2 e os demais passam.
- [x] 1.2 Acrescentar `cursorNaLinhaSeguinte?: boolean` a `StateEvent` (`src/redux/state.ts`) e marcar o `ElementoRemovido` em `elementoReducer.ts` nos casos `REMOVER_ELEMENTO` e `REMOVER_ELEMENTO_SEM_TEXTO` com `key === 'Delete'`, conferindo que a marca sobrevive a `atualizaRevisao` e `sincronizarRemissoesPosAcao`. Em `removerLinhaQuill` (`editor.component.ts`), com a marca, guardar a linha depois da última linha do lote antes de remover e levar o cursor ao início da primeira linha editável a partir dela; sem ela, manter o comportamento atual. Comentários de uma linha, só com o porquê. Verificar com o teste da 1.1 e `npm test` completo passando.

## 2. E2E

- [x] 2.1 Em `cypress/e2e/edicao/cursor-apos-remover.cy.ts`, com Ctrl+D e menu "Remover" nativos: mudar o controle para "excluir o Art. 3º leva ao novo Art. 3º (antigo 4º)", acrescentar "excluir o Art. 4º (último) leva ao Art. 3º" e um caso de Delete nativo em linha vazia indo ao seguinte, se `cypress/support/eventos-nativos.ts` já tiver a tecla (senão, registrar a decisão e deixar o caso coberto pelo teste de componente). Verificar com o spec passando e os casos novos falhando sem a 1.2.
  - Decisão: `eventos-nativos.ts` não tem a tecla Delete; o Delete em linha vazia fica coberto pelo teste de componente da 1.1.

## 3. Registro

- [x] 3.1 Registrar a #1075 em `docs/sessao/TODO.md`. Verificar com `openspec validate 2026-11-23-c01-cursor-apos-remover-vai-ao-seguinte` sem erros.
