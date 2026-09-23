## 1. Testes de caracterização (falham antes da correção)

- [x] 1.1 Promover o teste temporário `test/redux/remissao/reducer-undo-remissao-caput.test.ts` a teste definitivo (remover o cabeçalho "TEMPORÁRIO" e os `console.log` de diagnóstico, manter as asserções): remover artigo invalida remissão ao caput; remover + undo mantém o caput resolvível por `targetUuid` com mesmo `uuid2` e texto; undo restaura remissão para inciso do artigo removido; rejeitar revisão de movimentação mantém o caput resolvível; controle de mover sem undo. Verificar com `npx tsc` + `npx wtr out-tsc/test/redux/remissao/reducer-undo-remissao-caput.test.js --coverage=false` que os 4 casos de bug falham e o de controle passa
- [x] 1.2 Adicionar ao mesmo arquivo: undo de mover (artigo com caput referenciado), redo após undo de remover, colar-substituindo sobre artigo com caput referenciado (guarda de identidade duplicada, D2) e undo de remoção com remissões simultâneas para raiz, inciso e caput do mesmo artigo (D4); verificar quais falham hoje e registrar

> Evidência (grupo 1, 23/09/2026): 11 casos, 1 passando (controle: mover sem undo) e 10 falhando antes da correção. O redo foi coberto por duas cadeias: mover → undo → redo, e remover → undo → redo → undo (redo de uma remoção não recria o artigo, então a verificação é o undo seguinte). Colar-substituindo usa o cenário de `reducer-colar-dispositivo.test.ts` (MPV 905/2019 + `TEXTO_001`), porque colar exige conteúdo em JSONIX; nele o uuid do caput já não duplica hoje, e o caso falha só pela resolução do caput. No caso das três remissões simultâneas, o undo hoje restaura só a do artigo (`[undefined, false, undefined]`): a do inciso continua inválida e a do caput nunca foi invalidada. A entrada alheia (mesmo id textual `art2`, destino inexistente) cobre a invariante preserve-invalids.

## 2. Identidade do caput na recriação (D1, D2)

- [x] 2.1 Adicionar o campo opcional de identidade do caput em `Elemento` (`src/model/elemento/elemento.ts`) e preenchê-lo em `createElemento` quando o dispositivo é artigo; verificar com `npm run build` sem erros e com teste unitário de `createElemento` (artigo carrega `uuid`/`uuid2` do caput; outros tipos não carregam)
- [x] 2.2 Em `redodDispositivoExcluido`, reaplicar `uuid`/`uuid2` ao caput recriado quando o campo existir e `buscarDispositivoPorUuid` não encontrar dispositivo com aquele `uuid` (D2); verificar que os casos de undo/redo/rejeição/colar-substituindo das tasks 1.1 e 1.2 passam

## 3. Invalidação e restauração (D3, D4)

- [ ] 3.1 Em `capturarRemovidosEDescendentes` (`removeElemento.ts`), incluir o caput de cada artigo visitado, sem descer em `alteracoes` (D3); verificar que o caso "remover artigo invalida remissão ao caput" passa e que `reducer-invalida-restaura-remissao.test.ts`, `reducer-mensagem-remissao-invalida.test.ts` e os casos de rejeição de movimentação de `reducer-atualiza-remissao-mover.test.ts` (sinalizador `suprimirInvalidacaoRemissao` da c01) continuam passando
- [ ] 3.2 Em `undo.ts`, processar todos os `RemissaoInvalidada` do lote, casando por `targetUuid` (fallback `targetLexmlId` só sem `targetUuid`) e emitindo `RemissaoRestaurada` por dispositivo restaurado (D4); verificar que os casos de inciso/caput/raiz simultâneos passam, que os alertas de remissão inválida das origens afetadas são removidos, e que a invariante preserve-invalids se mantém (entrada invalidada por outra ação não é restaurada)

## 4. E2E e regressão

- [ ] 4.1 Criar `cypress/e2e/remissao-interna/grupo-l-caput-undo.cy.ts` (consultar `docs/guia-cypress.md` antes; conferir colisão de `const` globais; `grupo-k` já é usado pela c01) com: CT-L-01 remissão "caput do art. 2º" + remover art. 2º (link marcado inválido) + desfazer pelo botão `.lx-eta-btn-desfazer` (link volta válido e o `href` aponta para o caput existente); CT-L-02 remissão para caput + mover o artigo + desfazer (link válido, texto na posição restaurada). Verificar com `npx cypress run --spec "cypress/e2e/remissao-interna/grupo-l-caput-undo.cy.ts" --config baseUrl=http://localhost:8000/demo`. Se algum caso se mostrar inviável, registrar a decisão aqui e cobrir o risco com teste unitário equivalente (ex.: save após undo, via padrão de `reducer-save-remissao-pos-renumeracao.test.ts`)
- [ ] 4.2 Teste unitário de save após undo: remissão para caput, remover + undo, serializar e verificar que a remissão sai apontando para o caput (não como `@invalido`/destino excluído); verificar com `npx wtr` restrito ao arquivo
- [ ] 4.3 Reativar os dois `it.skip` com alvo no caput deixados pela c01 em `reducer-atualiza-remissao-mover.test.ts` ("undo/redo com alvo no caput do artigo movido" e "rejeitar a movimentação com alvo no caput"), removendo os comentários de pendência, e verificar que passam
- [ ] 4.4 Rodar `npm test` completo e as suítes E2E de remissão interna (`grupo-f-invalidacao-restauracao`, `grupo-g-atualizacao`, `grupo-h-referencia-enxuta`, `grupo-k-mover-dispositivo`) e verificar ausência de regressões

## 5. Documentação

- [ ] 5.1 Atualizar `docs/referencia/REMISSAO_INTERNA.md` e `docs/guias/TREINAMENTO_REMISSAO_INTERNA.md` com: identidade do caput preservada na recriação, invalidação/restauração cobrindo descendentes e caput; registrar como débito conhecido que o redo não reinvalida remissões; verificar por leitura que as seções de invalidação/undo citam o caput
