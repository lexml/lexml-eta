## 1. Transformação no mesmo pai

- [x] 1.1 Criar `test/redux/transforma/reducer-transforma-no-mesmo-pai.test.ts` com o `mpv_905_2019` (Art. 627 da alteração): "Omitir Incisos" no inciso I deixa o omissis na árvore, primeiro filho do caput, com o `uuid` do inciso, e o `ElementoIncluido` com a referência no artigo; num inciso do meio, o omissis fica entre os vizinhos; "omissis → inciso" num caput com omissis deixa o inciso na árvore, no lugar do omissis; omitir um parágrafo deixa o omissis na árvore, no lugar do parágrafo. Verificar que falha antes da 1.2.
- [x] 1.2 Em `dispositivoLexmlUtil.ts#converteDispositivo`, no grupo das transformações no mesmo pai, guardar a posição, remover o antigo do pai antes de criar o novo nela e não repetir a remoção no fim para esse grupo (comentário de uma linha, só com o porquê). Verificar com o teste da 1.1 e com os demais testes de `test/redux/transforma/`.
- [x] 1.3 No mesmo arquivo da 1.1: desfazer a omissão do inciso I devolve o inciso ao seu lugar, e refazer devolve o omissis ao lugar do inciso. Verificar que passa.

## 2. E2E e verificação

- [x] 2.1 Criar `cypress/e2e/alteracao-norma/omitir-incisos.cy.ts` com o `mpv_905_2019`: "Omitir Incisos" pelo menu no inciso I do Art. 627 põe a linha do omissis logo depois do artigo e antes do inciso II, e o documento obtido por `getDocumentoArticulado()` tem o omissis no caput do Art. 627, antes do inciso II. Verificar que falha antes da 1.2 (`git stash` do `src`).
- [x] 2.2 Rodar os specs Cypress de `cypress/e2e/alteracao-norma/` e de `cypress/e2e/transformacao/`, comparando com as falhas já conhecidas, e o `npm test` completo, sem falhas.

## 3. Registro

- [x] 3.1 Registrar a #1087 em `docs/sessao/TODO.md`. Verificar com `openspec validate 2026-11-25-c03-transformacao-no-mesmo-pai-preserva-dispositivo` sem erros.
