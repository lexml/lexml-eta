## Why

A detecção automática de remissão interna não reconhece a forma absoluta "caput do art. N": o usuário digita "caput do art. 2º", sai da linha e nenhum link é criado — nem para o caput, nem para o "art. 2º" contido no trecho. A forma contextual ("caput deste artigo") e a composta ("inciso I do caput do art. 2º") funcionam, e o texto canônico que o sistema gera na renumeração já é "caput do art. N"; só a detecção não reconhece o que o próprio sistema escreve.

A causa, confirmada por teste (`test/redux/remissao/reducer-detecta-caput-absoluto.test.ts`): `ReferenciaDispositivoParser.preparaTexto` remove o "caput" apenas quando há espaço antes dele; com o "caput" no início do trecho, o parser fica inválido e `detectarReferenciasAbsolutas` descarta o match inteiro. Mesmo com o parser corrigido, ele ignora a palavra "caput" e o destino seria o Artigo, não o Caput.

## What Changes

- `detectarReferenciasAbsolutas` passa a reconhecer o trecho exato `caput do art. N` e a resolvê-lo para o **caput** do artigo (não para o artigo inteiro), sem depender do parser.
- Formas compostas ("inciso I do caput do art. 2º") e contextuais ("caput deste artigo") permanecem como hoje.
- Nenhuma mudança no parser (`ReferenciaDispositivoParser`, compartilhado com o assistente de alteração), em `buscaDispositivoById` nem na renumeração/serialização, que já suportam o caput.
- Testes: unitários de caracterização, E2E com o texto digitado no grupo L (a fixture `teste_remissao_caput.json` é mantida), regressão completa.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `remissao-interna`: o requisito "Detecção automática de referências a dispositivos do mesmo documento" ganha o cenário de referência absoluta ao caput.

## Impact

- Código: `src/redux/elemento/reducer/adicionaRemissaoInterna.ts` (`detectarReferenciasAbsolutas`).
- Testes: `test/redux/remissao/reducer-detecta-caput-absoluto.test.ts` (novo), `cypress/e2e/remissao-interna/grupo-l-caput-undo.cy.ts` (novo caso).
- Sem impacto em API pública, formato LexML, dependências ou no repositório `lexeditweb-editor`.
