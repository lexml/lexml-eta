# Tasks

## 1. Cursor depois de excluir

- [x] 1.1 Teste de componente em `test/componente/lexml-eta/` com preâmbulo e os Arts. 1º a 3º só com caput: cursor no Art. 1º, `removerElementoAction` do Art. 1º → seleção no início do texto do novo Art. 1º e `linhaAtual` igual a essa linha; controle: excluir o Art. 2º deixa o cursor no início do texto do Art. 1º. Verificar que o caso do Art. 1º falha antes da 1.2.
- [x] 1.2 Em `removerLinhaQuill` (`editor.component.ts`): quando a linha em `range.index - 1` não é editável, usar a primeira linha editável seguinte (sem nenhuma, manter o comportamento atual); comentário de uma linha com o porquê. Verificar com o teste da 1.1 e `npm test` completo passando.

## 2. E2E

- [x] 2.1 Criar `cypress/e2e/edicao/cursor-apos-remover.cy.ts`: documento montado por `selectFile({ contents })` (como em `setas-dispositivo-vizinho.cy.ts`), com preâmbulo e os Arts. 1º a 4º; cursor posto por clique nativo e exclusão por Ctrl+D e pelo menu "Remover", ambos nativos (o comando `selecionarOpcaoDeMenuDoDispositivo` move a seleção do Quill com cliques sintéticos); conferir que a linha atual do Quill é o novo Art. 1º e a seleção está no início do texto dele; controle excluindo o Art. 3º. Verificar com o spec passando e falhando sem a correção da 1.2.

## 3. Registro

- [x] 3.1 Registrar a #1074 em `docs/sessao/TODO.md`. Verificar com `openspec validate 2026-11-19-c01-cursor-apos-remover-primeiro-artigo` sem erros.
