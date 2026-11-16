# Proposal

## Why

O preâmbulo é somente leitura, mas recebe o cursor: as setas entram nele e o clique o posiciona ali (issue #1037). O usuário fica parado numa linha em que não pode fazer nada e precisa de teclas a mais para atravessá-la. A epígrafe já não recebe o cursor pelo clique, e o preâmbulo deve se comportar da mesma forma.

## What Changes

- **Preâmbulo não editável:** o preâmbulo passa a ser uma linha não editável, como a epígrafe. Clicar sobre ele não posiciona o cursor, não marca a linha como atual, e o cursor continua onde estava.
- **Setas pulam linhas não editáveis:** ↑, ↓, ← e → pulam toda linha não editável (preâmbulo e epígrafe), indo para a linha editável seguinte ou anterior. Quando não há linha editável nessa direção, o cursor fica onde está.
  - No fim da ementa, ↓ e → vão direto ao primeiro dispositivo da articulação.
  - No início do primeiro dispositivo, ↑ e ← vão ao fim da ementa.
  - No início da ementa, ↑ e ← deixam de entrar na epígrafe.
- **Regra genérica:** a regra vale para qualquer linha não editável, e não por tipo de dispositivo. Uma linha não editável nunca é marcada como atual nem recebe o cursor, venha a seleção do teclado, do mouse ou do menu.

## Capabilities

### New Capabilities

- `navegacao-cursor-editor`: posicionamento do cursor nas linhas do editor da articulação. Cobre as linhas que podem receber o cursor e a navegação pelas setas entre elas, incluindo pular as linhas não editáveis.

### Modified Capabilities

- `preambulo-proposicao`: o requisito "Preâmbulo bloqueado e sem ações" passa a dizer que o preâmbulo não recebe o cursor. O cenário "Menu de ações do preâmbulo" pressupunha o cursor no preâmbulo e passa a ser descrito pelo menu da linha.

## Impact

- **Código:**
  - `src/model/elemento/elementoUtil.ts` (`editavel` falso também para o preâmbulo);
  - `src/util/eta-quill/eta-keyboard.ts` (setas pulam linhas não editáveis);
  - `src/util/eta-quill/eta-quill.ts` (`verificarMudouLinha`/`marcarLinhaAtual`: a seleção que cai numa linha não editável volta para onde estava).
- **Testes:**
  - teste de componente novo, com o Quill real, cobrindo setas e seleção sobre o preâmbulo e a epígrafe;
  - teste unitário de `createElemento`;
  - E2E novo, e ajuste do `abertura-preambulo.cy.ts`, cujo caso "é bloqueado" punha o cursor no preâmbulo.
- **Documentação:** `CLAUDE.md`, item 15.
- **Sem impacto em:** arquivo LexML, API pública do componente e `lexeditweb-editor`.
