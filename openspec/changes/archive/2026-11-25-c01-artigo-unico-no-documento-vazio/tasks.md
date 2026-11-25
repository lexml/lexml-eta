## 1. Documento padrão com artigo único

- [x] 1.1 Criar `test/model/documento/documentoPadraoArtigoUnico.test.ts`: o documento de `montaDocumentoNovaProposicao` sem modelo, aberto com `buildProjetoNormaFromJsonix`, tem um artigo com rótulo "Artigo único.", número `1` e id `art1`; salvo com `buildJsonixFromProjetoNorma`, o artigo sai com rótulo "Artigo único." e id `art1`. Verificar que falha antes da 1.2.
- [x] 1.2 Em `documentoPadrao.ts`, trocar o rótulo do artigo de `DOCUMENTO_PADRAO` para "Artigo único.". Verificar com o teste da 1.1 e com `test/model/documento/montaDocumentoNovaProposicao.test.ts`.
- [x] 1.3 No mesmo arquivo da 1.1, a partir do documento padrão aberto: incluir um artigo depois do único (`ADICIONAR_ELEMENTO`) dá "Art. 1º" e "Art. 2º"; excluir o segundo (`REMOVER_ELEMENTO`) volta a "Artigo único.". Verificar que passa.

## 2. Cypress e verificação

- [x] 2.1 Em `cypress/support/commands.ts`, `getContainerArtigoByNumero(1)` passa a aceitar também o rótulo "Artigo único." (comentário de uma linha, só com o porquê).
- [x] 2.2 Criar `cypress/e2e/edicao/artigo-unico.cy.ts`: depois de `cy.novaProposicao()`, o único artigo mostra "Artigo único."; "Adicionar artigo depois" pelo menu dá "Art. 1º" e "Art. 2º"; "Remover" pelo menu no Art. 2º volta a "Artigo único.". Verificar que o primeiro caso falha antes da 1.2 (`git stash` do `src`).
- [x] 2.3 Rodar os specs Cypress que usam `cy.novaProposicao()` e comparar com as falhas já conhecidas (`docs/sessao/TODO.md`); rodar o `npm test` completo, sem falhas.

## 3. Registro

- [x] 3.1 Registrar a #1104 em `docs/sessao/TODO.md`. Verificar com `openspec validate 2026-11-25-c01-artigo-unico-no-documento-vazio` sem erros.
