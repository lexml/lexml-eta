# Tasks

## 1. Negrito da primeira linha na exibição

- [x] 1.1 Em `textoParaExibicao` (`src/model/elemento/elementoUtil.ts`), envolver em `<b>…</b>` o trecho da epígrafe anterior ao primeiro `<br/>` (ou o texto inteiro, sem `<br/>`), sem `<b>` vazio e sem retirar formatação existente (D1, D2); verificar com testes unitários de `createElemento` para a epígrafe: duas linhas, três linhas, uma linha, primeira linha vazia, `<i>` na segunda linha, e ementa/dispositivos inalterados.
- [x] 1.2 Estender `test/componente/lexml-eta/epigrafeQuebraLinha.component.test.ts`: a primeira linha exibida está dentro de `<b>` e tem `font-weight` de negrito, a segunda não; `getProposicao().epigrafe.texto` e a epígrafe do arquivo salvo não têm `b`; verificar rodando o teste.
- [x] 1.3 Atualizar o item 25 do `CLAUDE.md` (invariante av: a cópia para a tela também recebe o `<b>` da primeira linha); verificar por leitura.

## 2. Verificação ponta a ponta

- [x] 2.1 E2E Cypress (viável: `cypress/e2e/nova-proposicao/nova-proposicao.cy.ts` já exibe e salva a epígrafe do PLV e do substitutivo do SF): estender `epigrafeExibidaDeve` para conferir que o trecho de cima está em negrito (`font-weight` computado) e o de baixo não, e acrescentar um caso de epígrafe de uma linha (PL padrão) inteira em negrito; verificar com `npm run cy:run:local -- --spec cypress/e2e/nova-proposicao/nova-proposicao.cy.ts`.
- [x] 2.2 Rodar `npm test` completo e o Cypress de `documento-articulado/*`; verificar que só falham os casos já conhecidos (`abertura-pena`).
