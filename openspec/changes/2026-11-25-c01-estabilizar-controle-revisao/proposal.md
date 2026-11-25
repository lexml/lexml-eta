## Why

O controle de revisão da articulação quebra em situações comuns de uso, e o editor fica num estado em que não é mais possível aceitar ou recusar revisões (#1105, #1106, #1107, #1108). Todos os problemas foram reproduzidos na demo com a MPV 885 e a MPV 905. Três deles vêm de premissas frágeis em `atualizaRevisao`: o histórico (`past`) sempre guarda a ação corrente, e toda revisão é de um dispositivo da articulação com elemento anterior na sequência de leitura.

## What Changes

- **Alterar a ementa em revisão deixa de travar o editor (#1107).** Hoje, com uma revisão da ementa no estado, toda ação com inclusão ou exclusão lança `"undefined" is not valid JSON` em `atualizarLexmlIdEmElementosDeRevisoes`, porque a ementa não tem elemento anterior na sequência de leitura. Recusar um artigo incluído chega a tirá-lo da articulação antes do erro, e a revisão dele fica órfã: depois disso, nem aceitar nem recusar funciona mais, mesmo após aceitar a revisão da ementa.
- **Desfazer em revisão e sincronizar só a marcação das remissões deixam de lançar ou de criar revisão fantasma (#1108, ampliada).** O caso da issue (desfazer a primeira ação feita em revisão, com o `past` vazio) é um sintoma. A mesma falha aparece quando o Quill só desenha os links de remissão externa (o *linker* roda na primeira visita a cada linha) e, ao sair da linha, o texto é sincronizado. `atualizaTextoElemento` não grava essa sincronização no `past`, mas emite `ElementoModificado`. Com o `past` vazio, a revisão lança. Com o `past` preenchido, ela lê a ação anterior e cria uma revisão "Texto do dispositivo foi alterado" **sem estado anterior** num dispositivo que o usuário só visitou. Recusar essa revisão lança.
- **Não é mais possível remover, em revisão, o dispositivo que tem subordinado removido ou alterado em revisão, também dentro de bloco de alteração (#1106).** A regra já existe no reducer, mas não alcança o primeiro nível de um bloco de alteração, cujo pai registrado é a articulação de alteração e não o artigo hospedeiro. Quando a regra impede a remoção, a opção "Remover" deixa de aparecer no menu e o Ctrl+D não remove.
- **Em revisão, o cursor fica no dispositivo excluído (#1105).** Como a linha continua na tela, marcada como excluída, ela passa a ser a linha atual depois da exclusão, sem a alternância de hoje (às vezes o seguinte é selecionado, às vezes a marca de selecionado fica no excluído). Fora da revisão continua valendo a regra da #1075 (o cursor vai para o dispositivo seguinte). **Altera um cenário definido pela change `2026-11-23-c01-cursor-apos-remover-vai-ao-seguinte`.**

Fora do escopo:

- **Clique no ✓/✕ com o cursor na ementa.** Na exploração parecia que o clique se perdia e levava o cursor ao último artigo. Era um artefato do teste: o botão estava fora da área visível, e o clique caía fora do editor. Com o botão visível, o clique funciona.
- **Atomicidade dos reducers de revisão.** O reducer de recusar muta a articulação no lugar antes de `atualizaRevisao` rodar, então qualquer erro posterior deixa o estado parcial. Esta change remove as causas conhecidas do erro, mas não torna os reducers atômicos (risco registrado no design).

## Capabilities

### New Capabilities

- `revisao-articulacao`: controle de revisão da articulação. Cobre quais ações geram revisão, a consistência das revisões com o histórico de desfazer, a revisão da ementa e as restrições de remoção em modo de revisão.

### Modified Capabilities

- `navegacao-cursor-editor`: o requisito "Cursor depois de excluir um dispositivo" passa a manter o cursor no dispositivo excluído quando a revisão está ativa e a linha continua na tela.

## Impact

- `src/redux/elemento/reducer/atualizaRevisao.ts` (`getElementoAntesModificacao`, `processaEventosDeModificacao`, `atualizarLexmlIdEmElementosDeRevisoes`, menu dos elementos dos eventos), `src/redux/elemento/reducer/atualizaTextoElemento.ts` (sinaliza a sincronização só de marcação), `src/redux/state.ts` (campo opcional em `StateEvent`), `src/redux/elemento/util/revisaoUtil.ts` (`existeFilhoExcluidoOuAlteradoDuranteRevisao` com o pai efetivo), `src/redux/elemento/reducer/elementoReducer.ts` (`marcaCursorNaLinhaSeguinte`), `src/components/editor/editor.component.ts` (`removerLinhaQuill` e Ctrl+D).
- Testes de reducer em `test/redux/revisao/`, teste de componente `test/componente/lexml-eta/cursorAposRemover.component.test.ts` e E2E em `cypress/e2e/revisao/` e `cypress/e2e/edicao/cursor-apos-remover.cy.ts` (o cenário de revisão muda de expectativa).
- Sem mudança de API pública nem de formato de arquivo.
