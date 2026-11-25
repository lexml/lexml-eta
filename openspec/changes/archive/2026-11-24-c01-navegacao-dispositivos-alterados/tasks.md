## 1. Navegação na ordem de leitura

- [x] 1.1 Criar `test/redux/revisao/reducer-navega-entre-dispositivos-alterados.test.ts`, no padrão de `reducer-atualiza-revisao-dispositivo-exclusao.test.ts` (`buildProjetoNormaFromJsonix` + `elementoReducer`, revisão ligada), despachando `NAVEGAR_ENTRE_ELEMENTOS_ALTERADOS` e conferindo o elemento do `ElementoMarcado`: subir a partir do último artigo excluído leva à marca acima; a partir de um excluído, descer leva a outro excluído não vizinho e subir volta; artigo alterado seguido de artigo excluído (descer a partir do alterado e subir a partir do artigo seguinte levam ao excluído); dois artigos vizinhos excluídos (nas duas ordens de exclusão) são alcançados um depois do outro, na ordem do texto; descer da ementa até a última marca e subir dela até a primeira passa pelas mesmas marcas em ordem inversa; sem marca na direção pedida, não há `ElementoMarcado`. Verificar que os casos dos defeitos falham antes da 1.2.
- [x] 1.2 Mover `principalDoExcluido` e `excluidoImediatamenteAntes` de `atualizaRevisao.ts` para `revisaoUtil.ts` (exportadas, mesmo comportamento) e reescrever a busca de `navegaEntreDispositivosAlterados.ts` sobre a lista na ordem de leitura do design (decisão 1), mantendo a troca de página e os eventos emitidos. Comentários de uma linha, só com o porquê. Verificar com o teste da 1.1, os testes de `test/redux/revisao/` e `npm test` completo passando.

## 2. E2E

- [x] 2.1 Criar `cypress/e2e/revisao/navegacao-dispositivos-alterados.cy.ts`: com a revisão ligada, alterar o texto de um artigo e excluir o último artigo; a partir da ementa, descer com o botão "próximo" (`.button-navegacao-marca`, primeiro) por todas as marcas e subir com "anterior" (segundo), conferindo a linha atual em cada passo e a ordem inversa na subida; e excluir dois artigos vizinhos e conferir que a descida passa pelos dois, na ordem da tela. Verificar com o spec passando e o caso da subida a partir do último excluído falhando sem a 1.2.

## 3. Registro

- [x] 3.1 Registrar a #1096 em `docs/sessao/TODO.md`, com a issue a abrir sobre a revisão do inciso sem número (`…_inc[sn:1593]`) que não se liga ao inciso ao abrir. Verificar com `openspec validate 2026-11-24-c01-navegacao-dispositivos-alterados` sem erros.
