# Proposal

## Why

Desde a #1053, a epígrafe pode ter várias linhas separadas por `<br/>` (substitutivo do Senado, PLV), e o editor já as exibe em linhas separadas, mas todas com o mesmo peso. A issue #1060 pede que, na aba de texto, a primeira linha fique em negrito e as demais não, como na epígrafe impressa.

## What Changes

- Na exibição da epígrafe na aba de texto, a primeira linha (até o primeiro `<br/>`) fica em negrito, e as linhas seguintes ficam sem negrito.
- A epígrafe de uma linha só fica toda em negrito.
- A formatação que o texto da epígrafe já traga (`<b>`, `<i>`) é mantida como veio.
- O negrito é só de exibição: o texto da epígrafe no documento salvo, na `Proposicao` entregue ao host e no componente de nova proposição não muda.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `epigrafe-proposicao`: novo requisito de apresentação da epígrafe no editor (primeira linha em negrito, demais sem negrito, só na exibição).

## Impact

- Código: `src/model/elemento/elementoUtil.ts` (`textoParaExibicao`, que já converte o `<br/>` da epígrafe para a tela).
- Testes: teste de componente da epígrafe com quebra (`test/componente/lexml-eta/epigrafeQuebraLinha.component.test.ts`) e E2E de `cypress/e2e/nova-proposicao/nova-proposicao.cy.ts`.
- Sem mudança de formato de arquivo, de API pública nem de dependência; nada a coordenar com o `lexeditweb-editor`.
