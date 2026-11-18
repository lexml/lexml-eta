# Tasks

## 1. Recorte da seleção no início do texto

- [x] 1.1 Teste de componente em `test/componente/lexml-eta/` que reproduz a falha: com a seleção nativa para trás, do fim do texto de um dispositivo até o rótulo, a atualização da seleção do Quill deixa selecionado todo o texto, sem o rótulo, e a seleção nativa continua para trás; com a seleção para frente do rótulo ao meio do texto, sobra o trecho do início do texto ao meio; com o cursor sem seleção no rótulo, ele vai ao início do texto. Verificar que os dois primeiros casos falham antes da 1.2.
- [x] 1.2 Em `verificarMudouLinha` (`src/util/eta-quill/eta-quill.ts`), recortar a seleção não colapsada cujo começo cai no rótulo e demais elementos do redirecionamento, mantendo o fim e o sentido (`rangeToNative` + `setBaseAndExtent`, atualização silenciosa do Quill); comentário de uma linha com o porquê. Verificar com o teste da 1.1 passando e `npm test` completo passando (inclui `navegacaoCursor` e `focoSemRolagem`).

## 2. E2E com teclado e mouse nativos

- [x] 2.1 Mover `teclaNativa`/`cliqueNativo` de `cypress/e2e/edicao/home-sem-rolagem.cy.ts` para um módulo em `cypress/support/` (com um arrasto nativo: `mousePressed`, `mouseMoved` com o botão, `mouseReleased`), importado pelos dois specs; atualizar a seção 15 do `docs/guia-cypress.md` para apontar o módulo. Verificar com `home-sem-rolagem.cy.ts` passando.
- [x] 2.2 E2E `cypress/e2e/edicao/selecao-shift-home.cy.ts` num dispositivo de texto de uma linha: End + Shift+Home seleciona todo o texto sem o rótulo; Shift+→ em seguida tira o primeiro caractere; Home + Shift+End (controle) seleciona todo o texto; arrastar do meio do texto até o rótulo seleciona do início do texto ao ponto inicial. Conferir pela seleção do Quill e pelo texto selecionado. Verificar com o spec passando e falhando sem a correção da 1.2.

## 3. Registro

- [x] 3.1 Registrar a #1070 em `docs/sessao/TODO.md`. Verificar com `openspec validate 2026-11-17-c03-selecao-shift-home` sem erros.
