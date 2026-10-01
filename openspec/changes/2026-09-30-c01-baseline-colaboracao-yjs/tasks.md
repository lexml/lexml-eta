# Tasks

Esta change documenta comportamento já implementado. As tarefas confirmam que cada cenário das specs tem cobertura e fecham as lacunas **apenas com testes** (`test/collab/` ou `e2e-collab/`); nenhum código de produção muda. Comando de referência do harness Node: `npm run test:collab` (hoje 70 testes passando).

## 1. colaboracao-identidade-seed

- [ ] 1.1 Mapear cada cenário de `colaboracao-identidade-seed` ao teste de `test/collab/ydocConverter.test.ts` que o cobre e registrar o mapa em um comentário no topo do arquivo de teste; verificar que nenhum cenário fica sem teste ou sem nota de lacuna
- [ ] 1.2 Acrescentar teste de `gidAleatorio` sem `crypto.randomUUID` (cenário "fora de contexto seguro") e verificar que `npm run test:collab` passa
- [ ] 1.3 Acrescentar teste que semeia uma articulação com bloco de alteração e verifica a posição do caput e dos dispositivos do bloco na ordem canônica; verificar que `npm run test:collab` passa
- [ ] 1.4 Acrescentar teste de que mover um dispositivo preserva o `gid` e verificar que `npm run test:collab` passa

## 2. colaboracao-transporte

- [ ] 2.1 Mapear os cenários de `colaboracao-transporte` aos testes de `test/collab/yjsCollabService.test.ts` e registrar o mapa no topo do arquivo; verificar a lista de lacunas
- [ ] 2.2 Acrescentar teste de parâmetros incompletos (falta sala, endereço ou token) mantendo o estado desligado, e verificar que `npm run test:collab` passa
- [ ] 2.3 Acrescentar teste de tempo máximo de conexão: sem resposta, o estado permanece "local" e o documento segue editável; verificar com `npm run test:collab`
- [ ] 2.4 Acrescentar teste do repasse do token e da criação da persistência local por sala nas fábricas reais (com `WebsocketProvider` e `IndexeddbPersistence` substituídos por duplos), e verificar com `npm run test:collab`
- [ ] 2.5 Registrar no teste ou na spec, como decisão, que o carregamento sob demanda do transporte e a falha ao ligar no componente são verificados pela suíte do browser e pelo E2E (não pelo harness Node)

## 3. colaboracao-estrutura

- [ ] 3.1 Mapear os cenários de `colaboracao-estrutura` aos testes de `test/collab/sincronizadorEstrutural.test.ts` e de `test/collab/integracao.test.ts`; verificar a lista de lacunas
- [ ] 3.2 Acrescentar teste de inclusão remota cuja referência não resolve (fallback para o pai real, sem exceção) e verificar com `npm run test:collab`
- [ ] 3.3 Acrescentar teste de que um omissis não é usado como referência de inserção e verificar com `npm run test:collab`
- [ ] 3.4 Acrescentar teste de que o dispositivo criado por inclusão remota adota o `gid` remoto e verificar com `npm run test:collab`
- [ ] 3.5 Verificar, com o E2E estrutural de `e2e-collab/estrutural.spec.ts` e `e2e-collab/tab.spec.ts`, os cenários de inclusão, remoção e promoção; executar `npm run e2e:collab`

## 4. colaboracao-texto

- [ ] 4.1 Mapear os cenários de `colaboracao-texto` aos testes de `test/collab/textoBinding.test.ts` e de `test/collab/textoSincronizador.test.ts`; verificar a lista de lacunas
- [ ] 4.2 Acrescentar teste de que as edições estruturais do editor (rótulo, menu, elementos incorporados) não entram no texto compartilhado, extraindo o critério para uma função pura testável sem mudar o comportamento, ou registrar a lacuna se isso exigir mudança de código de produção
- [ ] 4.3 Acrescentar teste de que a edição remota num dispositivo não renderizado não gera erro e é exibida quando o dispositivo passa a ser renderizado, e verificar com `npm run test:collab`
- [ ] 4.4 Verificar o cenário do artigo que delega o texto ao caput com `e2e-collab/texto.spec.ts` e `npm run e2e:collab`

## 5. colaboracao-presenca

- [ ] 5.1 Mapear os cenários de `colaboracao-presenca` aos testes de `test/collab/presencaSincronizador.test.ts` e ao E2E `e2e-collab/cursores.spec.ts`; verificar a lista de lacunas
- [ ] 5.2 Acrescentar teste de que o cursor de dispositivo não renderizado resulta em nenhuma posição (sem erro) e verificar com `npm run test:collab`
- [ ] 5.3 Acrescentar teste da posição estável do cursor entre clientes com offsets absolutos diferentes e verificar com `npm run test:collab`

## 6. colaboracao-undo

- [ ] 6.1 Mapear os cenários de `colaboracao-undo` aos testes de `test/collab/undoColaboracao.test.ts` e aos E2E de `e2e-collab/undo.spec.ts`; verificar a lista de lacunas
- [ ] 6.2 Acrescentar teste de que o desfazer de um cliente preserva a edição feita pelo outro depois da ação desfeita, e verificar com `npm run test:collab`
- [ ] 6.3 Verificar com `npm run e2e:collab` os cenários de atalho (Ctrl+Z/Ctrl+Y), de botão da barra, de refazer depois de desfazer uma inclusão e de desfazer de texto
- [ ] 6.4 Verificar, na suíte do browser (`npm test`), que o desfazer e o refazer com a colaboração desligada seguem como antes, e registrar o resultado

## 7. colaboracao-remissao

- [ ] 7.1 Mapear os cenários de `colaboracao-remissao` aos testes de `test/collab/remissaoMetaBinding.test.ts`, de `test/collab/remissaoMetaSincronizador.test.ts` e de `e2e-collab/remissao.spec.ts`; verificar a lista de lacunas
- [ ] 7.2 Acrescentar teste de aplicação idempotente do tombstone (repetido e antes da detecção do link) e verificar com `npm run test:collab`
- [ ] 7.3 Acrescentar teste de que a mesma remissão com identificadores locais distintos é reconhecida pela chave semântica, e verificar com `npm run test:collab`
- [ ] 7.4 Acrescentar teste de que a validade da remissão é recalculada localmente quando o alvo é removido por outro cliente, e verificar com `npm run test:collab`

## 8. Testes E2E e fechamento

- [ ] 8.1 Registrar no `design.md` a decisão sobre o E2E exigido pela config: os cenários de dois navegadores ficam no Playwright (`e2e-collab/`, cobertos em `docs/guia-cypress.md` §14), por serem multi-contexto e inviáveis no Cypress; o Cypress cobre só a regressão single-user. Verificar que `docs/guia-cypress.md` (ou a nota que o substitua) continua coerente com essa divisão
- [ ] 8.2 Executar a suíte Cypress completa (`npm run cy:run:local`) e registrar o resultado; as falhas conhecidas do `develop` (`grupo-g`, CT-F-11) não bloqueiam a change se forem as mesmas
- [ ] 8.3 Executar `openspec validate 2026-09-30-c01-baseline-colaboracao-yjs --strict` e verificar que passa sem erros
- [ ] 8.4 Executar `npm run test:collab`, `npm run e2e:collab`, `npm test` e `npm run build`, verificar que passam e registrar os totais
