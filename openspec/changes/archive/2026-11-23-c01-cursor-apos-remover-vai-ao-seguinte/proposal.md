## Why

Ao excluir um dispositivo, o cursor sobe para o dispositivo acima do excluído (issue #1075). O natural é ele ficar no dispositivo que toma o lugar do excluído, na linha logo abaixo, como num editor de texto: ao excluir o Art. 11, o cursor vai para o novo Art. 11 (antigo Art. 12), e só sobe quando não há nada abaixo.

## What Changes

- Ao excluir um dispositivo pelo Ctrl+D, pelo menu "Remover" ou pela tecla Delete numa linha vazia, o cursor vai para o início do texto da primeira linha editável abaixo do excluído (e dos seus descendentes), que passa a ser a linha atual.
- Sem linha editável abaixo (por exemplo, ao excluir o último artigo), o cursor continua indo para o dispositivo acima, como hoje.
- No modo de revisão, a linha excluída continua na tela, marcada; o cursor vai para a linha abaixo dela e dos seus descendentes, com a mesma regra.
- Backspace numa linha vazia continua levando o cursor ao fim da linha de cima.
- Desfazer, refazer e rejeitar uma revisão não mudam: continuam posicionando o cursor como hoje.

## Capabilities

### New Capabilities

(nenhuma)

### Modified Capabilities

- `navegacao-cursor-editor`: o requisito "Cursor depois de excluir um dispositivo" passa a levar o cursor ao dispositivo seguinte, subindo só quando não há linha editável abaixo.

## Impact

- `src/redux/elemento/reducer/elementoReducer.ts` (marca o evento da exclusão feita pelo usuário), `src/redux/state.ts` (campo opcional em `StateEvent`) e `src/components/editor/editor.component.ts` (`removerLinhaQuill`).
- Testes: `test/componente/lexml-eta/cursorAposRemover.component.test.ts` e `cypress/e2e/edicao/cursor-apos-remover.cy.ts` (o caso de controle muda de expectativa).
- Sem mudança de API pública nem de formato de arquivo.
