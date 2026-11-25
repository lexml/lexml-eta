## Why

Uma proposição iniciada com texto vazio mostra o único artigo como "Art. 1º", embora a regra de numeração do editor dê "Artigo único." quando a articulação tem um só artigo (issue #1104). O rótulo certo só aparece depois de incluir e excluir um segundo artigo, porque só a renumeração aplica a regra: o documento vazio padrão traz o rótulo "Art. 1º", e a abertura copia o rótulo do documento.

## What Changes

- A proposição iniciada com texto vazio passa a mostrar o artigo como "Artigo único.", e o grava assim ao salvar.
- Nada muda depois: incluir um segundo artigo continua dando "Art. 1º" e "Art. 2º", e voltar a um só artigo continua dando "Artigo único.".
- O comando Cypress que localiza o artigo pelo número passa a reconhecer "Artigo único." como o artigo 1.

## Capabilities

### New Capabilities

- `numeracao-artigo`: rótulo do artigo quando a articulação tem um só artigo.

### Modified Capabilities

(nenhuma)

## Impact

- `src/model/lexml/documento/modelo/documentoPadrao.ts` (rótulo do artigo do documento vazio). O documento padrão é usado pela nova proposição com texto vazio (`montaDocumentoNovaProposicao`) e pela carga sem documento (`lexml-eta-proposicao.component.ts#loadProjetoNorma`).
- `cypress/support/commands.ts` (`getContainerArtigoByNumero`), usado com o número 1 em 68 specs, 41 deles logo depois de `cy.novaProposicao()`.
- Testes: unitário do documento padrão, reducer de incluir e excluir a partir dele e E2E novo.
- Fora do escopo: documento aberto de arquivo, modelo ou importação com um só artigo rotulado "Art. 1º" mantém o rótulo do arquivo (recalcular na abertura seria outra issue).
- Sem mudança de API pública nem de formato de arquivo: o id do artigo continua `art1`.
