# Tasks

## 1. Função única de descrição por operações

- [ ] 1.1 Criar `buildDescricaoPorOperacoes` em `revisaoUtil.ts` e fazer `buildDescricaoRevisaoElemento` delegar a ela, com o mapeamento atual como reserva quando a revisão não tem o atributo `revisao` (design.md, Decisões 1 e 3). Absorver o ramo de rótulo existente, mantendo as descrições de `alterado`, `adicionado`, `excluido` e `alteracaoRotulo` exatamente como estão. Incluir o derivador do rótulo anterior pela posição e pelo tipo (artigo, parágrafo, inciso, alínea, item), usado só fora de alteração de norma; dentro dela a descrição usa "posição original <n>". Verificar com testes unitários em `revisao-operacoes.test.ts`: cada operação isolada; `movido;3` em artigo (`antes era "Artigo Art. 3º"`), em artigo a partir da décima posição (`Art. 10.`), em parágrafo, inciso, alínea e item; `movido;3` em dispositivo de alteração de norma (`posição original 3`); `movido;3,alterado`; `transformado;alinea,alterado` (tipo pela descrição do tipo); `movido` com `alteracaoRotulo`; rótulo anterior desconhecido; revisão sem atributo caindo no legado; e a string "Dispositivo removido" para `excluido`.

## 2. Descrição acompanha as operações na sessão

- [ ] 2.1 Em `atualizaRevisao.ts`, recalcular a descrição de todas as revisões de elemento que tenham o atributo `revisao` no fim da ação (design.md, Decisão 2), e remover as chamadas pontuais de `buildDescricaoRevisaoFromStateType`/`buildDescricaoRevisaoElemento` que ficam redundantes. Verificar com testes de reducer, incluindo o cenário do relato (artigo movido, alterado, movido de novo, alterado de novo): a descrição é `Dispositivo movido (antes era "Artigo Art. 3º") e texto alterado` ao fim; movido e depois alterado e depois desfeito volta a `Dispositivo movido (antes era "Artigo Art. 3º")`; transformado e alterado; desfazer e refazer da movimentação (design.md, Riscos); exclusão mantém "Dispositivo removido" e o editor continua tratando o dispositivo como excluído.

## 3. Descrição na reabertura

- [ ] 3.1 Fazer `novaRevisao` em `reconstroiRevisoes.ts` calcular a descrição pela mesma função depois de gravar o atributo `revisao` (design.md, Decisão 4). Verificar com um teste de ida e volta (MPV 905/2019): para cada cenário de `reconstroiRevisoes.test.ts` (adicionado, alterado, movido, movido e alterado, transformado, excluído, alteracaoRotulo), a descrição da revisão reaberta é igual à da sessão original; incluir o cenário do relato (artigo 3 movido duas vezes e alterado duas vezes), um dispositivo de alteração de norma movido (`posição original <n>`, igual nos dois lados) e um dispositivo de cada tipo (parágrafo, inciso, alínea, item) movido fora de alteração de norma.

## 4. E2E

- [ ] 4.1 E2E Cypress, depois de consultar `docs/guia-cypress.md` (Shadow DOM, setup de documentos, diagnóstico de falhas): no spec `cypress/e2e/revisao/abertura-revisoes-hierarquia.cy.ts`, verificar o `title` das marcas do documento aberto (a fixture `demo/doc/teste_revisoes_hierarquia.json` já tem movimentação, transformação, alteração, adição e exclusão): a marca do dispositivo movido e alterado descreve `Dispositivo movido (antes era "Artigo Art. <n>º") e texto alterado`, e nenhuma marca de dispositivo movido diz "Dispositivo adicionado". Se a fixture não tiver um dispositivo movido e alterado ao mesmo tempo, gerar uma nova fixture com `criarDocumentoArticulado` (mesma técnica da change anterior, não escrita à mão) em vez de editar a existente. A criação das revisões ao vivo pela interface fica sem E2E: depende do menu de contexto (guia §3 e §4) e é coberta pelos testes de reducer da tarefa 2.1. Verificar rodando o spec e confirmando que `revisao.cy.ts` e `abertura-revisao-alteracao-rotulo.cy.ts` continuam passando.

## 5. Regressão e fechamento

- [ ] 5.1 Rodar `npm test` e os specs Cypress de `cypress/e2e/revisao/` e `cypress/e2e/documento-articulado/`, e confirmar que nada regrediu. Os specs `grupo-g-atualizacao.cy.ts` e `grupo-f-invalidacao-restauracao.cy.ts` já falham antes desta change (esperam `art1_par1` onde o parágrafo único tem `art1_par1u`) e ficam fora da verificação.
- [ ] 5.2 Registrar o fechamento: no `CLAUDE.md`, item 13, a regra de descrição por operações, o rótulo anterior derivado da posição fora de alteração de norma, a troca por "posição original <n>" dentro dela e a razão (o rótulo anterior e o "Novo/Existente" não estão no arquivo); atualizar a spec principal `abrir-documento-articulado` e criar a `descricao-marca-revisao` se a sincronização das specs for feita no arquivamento. Verificar relendo os arquivos.

## Workflow follow-up

- Arquivar a change depois de atendidos os requisitos de revisão do projeto, sincronizando as specs principais.
