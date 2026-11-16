# Tasks

## 1. Linha não editável

- [x] 1.1 Em `createElemento` (`src/model/elemento/elementoUtil.ts`), calcular `editavel` falso também para o preâmbulo (D1). Acrescentar o teste unitário: `editavel` falso para preâmbulo e articulação, verdadeiro para ementa e artigo. Verificar com esse teste passando.
- [x] 1.2 Em `verificarMudouLinha` (`src/util/eta-quill/eta-quill.ts`), antes dos redirecionamentos, devolver a seleção colapsada que cai numa linha sem `editavel`: para `oldRange` ou, sem ele, para o início da linha atual. Em `marcarLinhaAtual`, trocar o teste de tipo `'Articulacao'` por `editavel` (D3). Verificar pelos testes de 1.4.
- [x] 1.3 Em `src/util/eta-quill/eta-keyboard.ts`, as quatro setas passam a procurar a linha editável anterior ou seguinte, e cancelam o evento quando não há nenhuma (D2). Verificar pelos testes de 1.4.
- [x] 1.4 Criar `test/componente/lexml-eta/navegacaoCursor.component.test.ts`, com o Quill real e `novoDocumentoArticulado()`:
  - ↓ e → no fim da ementa vão ao início do Art. 1º;
  - ↑ e ← no início do Art. 1º vão ao fim da ementa;
  - ↑ e ← no início da ementa ficam;
  - `setSelection` dentro do preâmbulo ou da epígrafe volta para a posição anterior, e a linha atual não muda;
  - o conteúdo do preâmbulo tem `contenteditable="false"`.
  - Rodar também `focoInicialEmenta` e `preambulo.component.test.ts`. Verificar com todos passando.
- [x] 1.5 Atualizar o item 15 do `CLAUDE.md`: o preâmbulo é não editável, e a regra de cursor e setas vale por `editavel`, não por tipo. Verificar relendo o trecho.

## 2. E2E

- [x] 2.1 Criar `cypress/e2e/documento-articulado/navegacao-preambulo.cy.ts`, seguindo `docs/guia-cypress.md` e usando `export {};`. Marcar a ementa com `getOpcoesDeMenuDoDispositivo` e conferir:
  - `{end}{downarrow}` leva a linha atual (`container__elemento--ativo`) ao Art. 1º;
  - `{uparrow}` no início do Art. 1º volta à ementa;
  - o preâmbulo nunca fica ativo;
  - o conteúdo do preâmbulo tem `contenteditable="false"`.
  - Verificar com o spec passando.
- [x] 2.2 Ajustar o caso "é bloqueado" de `cypress/e2e/documento-articulado/abertura-preambulo.cy.ts`, que punha o cursor no preâmbulo. Ele passa a conferir que o preâmbulo não é editável e que digitar sobre ele não altera o texto. Verificar com o spec passando.

## 3. Verificação integrada

- [x] 3.1 Rodar o `npm test` completo, com o servidor de desenvolvimento parado. Verificar que todos os lotes passam.
- [x] 3.2 Rodar o Cypress de `documento-articulado/*`, `remissao-interna/*` e `transformacao/*`, que usam setas e marcação de linha. Verificar que as únicas falhas são as que já existem na `develop` (`abertura-pena.cy.ts`).
- [x] 3.3 Rodar `openspec validate 2026-11-04-c02-preambulo-sem-cursor --strict`, que deve passar sem erros.
