## Why

Teclar End e depois Shift+Home num dispositivo desmarca a seleção, quando deveria selecionar o texto até o início da linha (issue #1070). O caminho inverso, Home e depois Shift+End, funciona. Isso impede selecionar o texto do dispositivo de trás para frente, que é um uso comum do teclado.

A causa provável é a mesma da #1077: o Home nativo leva o cursor ao rótulo do dispositivo. Com o Shift, a seleção vai do fim do texto até o rótulo, e `verificarMudouLinha` trata toda seleção que começa no rótulo (ou no menu, nas aspas etc.) como um cursor fora do lugar. Por isso ela a troca por um cursor no início do texto, sem seleção. A primeira task reproduz a falha antes da correção.

## What Changes

- Uma seleção que se estende até o rótulo ou outro elemento não editável do início da linha passa a ser recortada no início do texto do dispositivo, em vez de desfeita. O fim da seleção e o sentido dela (para trás ou para frente) são mantidos, então Shift+→ e Shift+← continuam movendo a ponta que o usuário estava movendo.
- Vale para qualquer forma de chegar ao rótulo com seleção: Shift+Home, Shift+↑ e arrastar o mouse até o rótulo.
- O cursor sem seleção que cai no rótulo continua sendo levado ao início do texto, como hoje.
- O alcance do Shift+Home não muda: vai até o início da linha visual, como o Home (requisito da #1077). Num texto que ocupa uma linha na tela, isso seleciona o texto inteiro.
- Os helpers de clique e tecla nativos (CDP) do E2E da #1077 passam a um módulo de suporte do Cypress, porque o E2E novo é o segundo uso.

## Capabilities

### New Capabilities

(nenhuma)

### Modified Capabilities

- `navegacao-cursor-editor`: novo requisito sobre a seleção que alcança o rótulo do dispositivo.

## Impact

- `src/util/eta-quill/eta-quill.ts` (`verificarMudouLinha`): recorte da seleção não colapsada.
- `cypress/support/`: módulo com os helpers de eventos nativos; `cypress/e2e/edicao/home-sem-rolagem.cy.ts` passa a usá-lo; `docs/guia-cypress.md` (seção 15) aponta para ele.
- Sem mudança de API pública nem de formato de arquivo.
