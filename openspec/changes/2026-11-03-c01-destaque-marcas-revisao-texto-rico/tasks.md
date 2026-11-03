## 1. Estilo das marcas de revisão

- [x] 1.1 Em `editor-texto-rico.css.ts`, trocar as regras sem escopo `.ql-editor ins`/`.ql-editor del` por regras sob `.lexml-eta-editor-texto-rico`: `ins` com letra verde (`#188038`), sem fundo e sem sublinhado; `del` sem fundo, com `text-decoration: none` e traço vermelho (`#d93025`) de 2px por `background-image` a 55% da altura. Verificar abrindo `demo/doc/teste_revisao_texto.json` no `npm start`: inclusão em verde e exclusão tachada em vermelho, inclusive sobre o trecho em negrito e a referência de nota.
- [x] 1.2 Acrescentar as regras da moldura (`.revisao-selecionada` com `--cor-moldura-revisao` verde ou vermelha, bordas superior e inferior com `box-decoration-break: clone`, laterais por `::before`/`::after`) e a supressão das laterais em `.revisao-fragmento-continua-anterior::before` e `.revisao-fragmento-continua-proximo::after`. Verificar no navegador aplicando a classe a um `del` pelo DevTools.

## 2. Moldura sob o cursor e texto entregue

- [ ] 2.1 Em `editor-texto-rico.component.ts`, no `setTimeout` de `onSelectionChange`, chamar a atualização da moldura: limpar as três classes, localizar o `ins`/`del` sob o cursor (caractere depois e antes do cursor; primeiro e último da seleção), marcar os elementos de mesma tag e mesmo `id-revisao` e marcar os pares contíguos pela posição no Quill (design.md, "Moldura por classes no DOM"). Verificar com o teste de componente da 3.2.
- [ ] 2.2 Marcar os `del` com `spellcheck="false"` em `setContent`, `updateTexto` e `updateApenasTexto`. Verificar com o teste de componente da 3.3.
- [ ] 2.3 Em `ajustaHtml`, retirar o atributo `spellcheck` e as classes `revisao-selecionada`, `revisao-fragmento-continua-anterior` e `revisao-fragmento-continua-proximo` (removendo o atributo `class` que ficar vazio). Verificar com o teste de componente da 3.4.

## 3. Testes de componente

- [ ] 3.1 Em `test/components/editor-texto-rico/editor-texto-rico.test.ts`, conferir pelo estilo computado que `ins` tem cor verde e fundo transparente e que `del` tem fundo transparente com `background-image` e sem `text-decoration`. Verificar com `npm test`.
- [ ] 3.2 Testar a moldura: cursor numa inclusão emoldura só ela; cursor num de dois `del` com o mesmo `id-revisao` separados por negrito emoldura os dois e marca o par contíguo; substituição (`del` + `ins` com o mesmo `id-revisao`) emoldura só o lado do cursor; cursor fora de marca não deixa nenhuma classe; mover o cursor não acrescenta passos ao histórico de desfazer. Verificar com `npm test`.
- [ ] 3.3 Testar que o `del` tem `spellcheck="false"` no DOM depois de `setContent` e depois de uma edição. Verificar com `npm test`.
- [ ] 3.4 Testar que, com o cursor numa marca emoldurada, `updateApenasTexto()` deixa `texto` sem `spellcheck` e sem as classes da moldura. Verificar com `npm test`.

## 4. Teste E2E (Cypress)

- [ ] 4.1 Criar `cypress/e2e/documento-articulado/revisao-texto-destaque.cy.ts` (com `export {};`, item 21 do CLAUDE.md), abrindo `demo/doc/teste_revisao_texto.json` como em `abertura-revisao-texto.cy.ts`. Conferir o estilo computado de `ins` e `del` e, posicionando o cursor pelo Quill do editor da justificação (`quill.setSelection(indice, 0, 'user')` via `cy.window()`, `docs/guia-cypress.md`), que os dois trechos da exclusão que atravessa o negrito recebem `revisao-selecionada` e que mover o cursor para texto comum retira a classe. Verificar com `npm run cy:run:local -- --spec` no arquivo novo e com o `abertura-revisao-texto.cy.ts` existente sem regressão.

## 5. Fechamento

- [ ] 5.1 Rodar `npm test` completo e o lint só nos arquivos alterados (`npx eslint` e `npx prettier --check`), sem regressão.
- [ ] 5.2 Rodar `openspec validate 2026-11-03-c01-destaque-marcas-revisao-texto-rico --strict` sem erros.
