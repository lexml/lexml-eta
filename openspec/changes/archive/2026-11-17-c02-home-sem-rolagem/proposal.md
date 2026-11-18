## Why

Numa proposição maior que a tela, teclar Home depois de clicar no meio de um dispositivo às vezes rola o editor para o início da proposição (issue #1077). O cursor vai para o lugar certo, mas o usuário perde a posição na tela.

A causa foi reproduzida com clique e Home nativos (CDP) na demo. O Home leva o cursor nativo ao rótulo, e `verificarMudouLinha` o devolve ao início do texto com `setSelection`. Dentro desse `setSelection`, o Quill 1.3.7 chama `root.focus()`, porque só reconhece o foco no próprio root, e o foco está no `<p>` do dispositivo. Com o cursor nativo numa posição não editável, o Chrome rola o editor para o início ao receber esse `focus`.

## What Changes

- O foco que o editor devolve ao root ao reposicionar o cursor deixa de rolar a tela. Vale para o Home e para qualquer outro caminho que passe pelo mesmo `focus` (redirecionamento do rótulo e do menu, devolução do cursor de linha não editável, `setSelection` em geral).
- O destino do cursor não muda: o Home continua levando ao início da linha visual (na primeira linha do dispositivo, ao início do texto).
- Fora do escopo: o Ctrl+Home e o Ctrl+End, que rolam ao início e ao fim de propósito.

## Capabilities

### New Capabilities

(nenhuma)

### Modified Capabilities

- `navegacao-cursor-editor`: novo requisito sobre a rolagem ao reposicionar o cursor.

## Impact

- `src/util/eta-quill/eta-quill.ts`: o `focus` do root chamado sem opções passa a usar `preventScroll`.
- `docs/guia-cypress.md`: registro da técnica de teclado e mouse nativos por CDP, usada no E2E novo.
- Sem mudança de API pública nem de formato de arquivo.
