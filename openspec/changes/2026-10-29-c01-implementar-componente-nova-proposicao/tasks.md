# Tasks

Issue #1050. Ao concluir todas as subtasks de um grupo numerado, pausar para validação do usuário antes do próximo.

## 1. Componente e vocabulário/preâmbulo

- [x] 1.1 Implementar o fallback do preâmbulo no componente (log de erro com a URN + `O CONGRESSO NACIONAL decreta:` quando `getPreambuloPadrao` devolve `undefined`), sem alterar `getPreambuloPadrao`; corrigir a seção 5.2 e os pontos em aberto de `docs/requisitos/componente-nova-proposicao.md`; teste unitário cobre tipo com e sem modelo e confirma que `buildProjetoNormaFromJsonix` continua sem preâmbulo para tipo sem modelo
- [x] 1.2 Criar os módulos puros do componente em `src/components/nova-proposicao/` — URN (RN-11 a RN-14, RN-22), listas de siglas (RN-00/RN-00a, ativos antes de inativos), identificação do documento (RN-08), epígrafe do caso padrão e montagem das URLs (sigla em maiúsculas, número sem zeros) —; testes unitários cobrem os cenários de URN, siglas e placeholders da spec `nova-proposicao`
- [x] 1.3 Implementar a validação da configuração (três URLs obrigatórias com erro que nomeia a ausente, casa padrão `SF`, `inicializarVocabulario(casa)` ao criar e a cada nova configuração); teste de componente cobre os cenários de configuração
- [x] 1.4 Implementar a Tela 1 (grupos g1 a g6, Verificar, ementa, alerta de sigla inativa, PLV/MPV, destino com lista de comissões e falha das comissões, padrões de parecer); testes de componente cobrem os cenários dos requisitos de espécie, identificação, sigla inativa, MPV, verificação, destino, forma de apresentação e Continuar
- [x] 1.5 Implementar as Telas 2 e 3 (opções de texto inicial, padrão por espécie, texto estruturado indisponível, consulta do texto só nas opções 3 e 4 ao Continuar, Voltar com dados preservados, upload simulado com erro de parser simulado sem chamar URL, Cancelar) e os eventos `nova-proposicao-concluida`/`nova-proposicao-cancelada`; testes de componente cobrem os cenários de texto inicial, indisponibilidade, importação simulada, tela de erro e conteúdo do resultado
- [x] 1.6 Exportar o componente em `src/index.ts`, documentar o uso e o contrato em `docs/api-componente-lexml-eta.md` e rodar `npm run lint` e `npm test` sem falhas

## 2. Backend da demo e integração no modal

- [x] 2.1 Criar `demo/server/` com os handlers puros e dados simulados: copiar para `demo/server/dados/` as 10 comissões por casa já extraídas em `exemplos/comissoes-{sf,cn,cd}.json` desta change (a CD é dado simulado, pois `docs/comissoes-cd.json` repete o do CN; os arquivos de `docs/` são apagados pelo usuário antes do apply) e criar o índice de proposições (PL, PLP e MPV da combo, com "PL 3/2023 (sem texto LexML)" respondendo `200` com `textoEstruturadoDisponivel: false` e `404` no texto); criar o script `npm run generate:demo-json`, que sempre gera o `.json` de todo `demo/doc/*.ts` (inclusive os três hoje sem `.json`), e fazer o servidor ler só esses `.json`; testes unitários dos handlers cobrem `200`, `404`, normalização de número/ano e filtro por casa
- [x] 2.2 Ligar os handlers ao middleware de `web-dev-server.config.mjs` sob `/demo-api/`; verificar com `curl` em `npm start` que as três rotas respondem como na tabela do design
- [x] 2.3 Integrar o componente à demo em `demoview.ts`: botão "Nova proposição" abre o `sl-dialog` modal com a configuração `/demo-api/...` e a casa da demo; no evento de conclusão chamar `novaProposicao()` com os dados coletados (`texto` como `documentoModelo`); no cancelamento só fechar; recriar o modal a cada abertura e reaplicar a configuração ao trocar a casa; verificar manualmente os fluxos de proposição, substitutivo, PLV e cancelamento

## 3. Retirada do destino do lexml-eta (BREAKING)

- [x] 3.1 Tornar `Proposicao.colegiadoApreciador` opcional e gravar/ler `lexedit:ColegiadoApreciador` só quando existir (`buildJsonixFromProjetoNorma`, `buildProjetoNormaFromJsonix`); testes unitários e de ida e volta cobrem presença, ausência, atributo inválido e anexo de parecer
- [x] 3.2 Remover `DestinoComponent`, `_lexmlDestino`, `destinoAoAbrir`, o aplicar/coletar destino e a aba "Destino" (rótulo "Data, Autoria e Impressão"); `novaProposicao()` e a abertura passam a manter o colegiado em memória; derivar o local do fecho do colegiado ou "Sala das Sessões" na ausência; testes de componente cobrem os cenários das specs `abrir-documento-articulado`, `salvar-documento-articulado`, `modo-anexo-parecer` e `interface-lexml-eta`
- [x] 3.3 Remover `getComissoes`/`comissoes`/`urlComissoes` do `lexml-eta` se não houver outro consumidor (senão marcar como obsoleta), ajustar fixtures de teste, demo e Cypress que usavam o destino, e atualizar `docs/migracao-interface-lexml-eta.md` e `docs/api-componente-lexml-eta.md` com o BREAKING para o `lexeditweb-editor`; `npm run lint` e `npm test` sem falhas
- [x] 3.4 Revisar o impacto em `Proposicao` exposto ao host e registrar a coordenação com o `lexeditweb-editor` (colegiado ausente, três URLs, `casaLegislativaEditor`) no handoff

## 4. E2E (Cypress)

- [x] 4.1 Avaliar a viabilidade à luz de `docs/guia-cypress.md` (Shadow DOM, `sl-*` com `dispatchEvent`, modal no light DOM da demo, espera por requisições às URLs simuladas) e registrar a decisão; se algum cenário for inviável, cobri-lo por teste de componente e documentar a alternativa
- [x] 4.2 Criar `cypress/e2e/nova-proposicao/` cobrindo: proposição com texto vazio criando o documento no editor; substitutivo com texto do documento referenciado; PLV com verificação da MPV; texto estruturado indisponível (RN-09); upload simulado levando à Tela 3 e **Continuar** com documento vazio; cancelamento; `npm run cy:run:local` passa
- [x] 4.3 Verificar de ponta a ponta na demo (SF e CD) que o colegiado escolhido é gravado ao salvar e restaurado ao abrir, e que documento sem colegiado salva sem `lexedit:ColegiadoApreciador`
