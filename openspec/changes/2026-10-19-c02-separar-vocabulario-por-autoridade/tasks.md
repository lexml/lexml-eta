# Tasks

## 1. Teste de caracterização do vocabulário atual

- [x] 1.1 Criar `test/model/documento/vocabulario.caracterizacao.test.ts` que percorre cada entrada de `tiposDocumento`, `fakeUrns` e `preambulosPadrao` do vocabulário atual e fixa as saídas de `getTipo`, `getSigla`, `getAutoridade`, `getPreambuloPadrao`, `getTipoDocumentoUrn` e `buildFakeUrn`, inclusive para URNs de autoridade cruzada que hoje resolvem (ex.: `camara.deputados:lei`, `senado.federal:...;plv`, `senado.federal:medida.provisoria;mpv`)
- [x] 1.2 Incluir no teste as invariantes do vocabulário (uma só entrada por sigla em `fakeUrns`; tipos com descrição e gênero idênticos entre cópias) e marcar explicitamente como esperadas as mudanças desta change: `buildFakeUrn('MPV')` → autoridade `federal`, `buildFakeUrn('PLV')` → `congresso.nacional` e os textos padrão de preâmbulo que deixam de existir nas combinações fora da tabela do `design.md` (D4): `senado.federal` e `camara.deputados` com `projeto.lei.conversao` e `medida.provisoria`; `federal` com qualquer tipo que não seja `medida.provisoria`; `congresso.nacional` com `projeto.lei.complementar`, `proposta.emenda.constitucional` e `medida.provisoria`
- [x] 1.3 Executar o teste contra o código ainda não migrado e confirmar que passa (exceto as expectativas deliberadamente alteradas em 1.2, que passam a valer após a tarefa 2)

## 2. Dividir os dados por autoridade

- [x] 2.1 Criar `src/model/lexml/documento/vocabulario/tipos.ts` com os tipos de item (`VocabularioAutoridade` com itens sem `urnAutoridade`, `VocabularioComum` e o item de `tiposDocumento` com `urnAutoridade`)
- [x] 2.2 Criar `mesclar.ts` (função pura: carimba `urnAutoridade` e concatena na ordem comum, `federal`, `senado`, `camara`, `congresso`) com teste unitário próprio (carimbo, ordem, itens do comum sem carimbo)
- [x] 2.3 Criar `federal.ts`, `senado.ts`, `camara.ts` e `congresso.ts` com `autoridade`, `tiposDocumento`, `siglas`, `fakeUrns` e `preambulosPadrao` conforme a tabela do `design.md` (D2); distribuir os preâmbulos conforme a tabela de D4 (cada tipo só nas autoridades indicadas; `projeto.resolucao` em Senado, Câmara e Congresso, cada um com o próprio texto)
- [x] 2.4 Criar `comum.ts` só com `atalhosUrn` e `eventos` e `index.ts` exportando `VOCABULARIO = mesclar(...)`; remover `vocabulario.ts` e garantir que o import `./vocabulario` de `urnUtil.ts` continua resolvendo e que `VOCABULARIO` não aparece no `index` do pacote
- [x] 2.5 Mover `fakeUrns` de MPV para `federal` e de PLV para `congresso`; rodar o teste de caracterização (1.x) e confirmar que só as duas expectativas deliberadas diferem do estado anterior

## 3. Lookups pela autoridade da URN

- [ ] 3.1 Criar o helper interno de busca com preferência pela autoridade da URN e fallback na ordem de mesclagem (D3) e aplicá-lo a `getTipo` e `getTipoDocumentoUrn`
- [ ] 3.2 Aplicar o mesmo helper a `getSigla` (em `siglas` e depois em `fakeUrns`)
- [ ] 3.3 Cobrir com testes os cenários da spec `vocabulario-urn`: entrada da própria autoridade, fallback para outra autoridade (`senado.federal:...;plv`, `camara.deputados:lei`), tipo desconhecido, sigla de MPV federal e tipo sem sigla
- [ ] 3.4 Rodar o teste de caracterização completo e a suíte `npm test`; qualquer diferença além de MPV/PLV é regressão a corrigir

## 4. Testes e fixtures existentes

- [ ] 4.1 Conferir `test/model/documento/documentoArticulado.test.ts` (linhas que usam `buildUrnProposicao('MPV', ...)`) e ajustar as asserções de URN/nome de arquivo para a autoridade `federal`
- [ ] 4.2 Atualizar `test/model/documento/preambuloPadrao.test.ts` à delta de `preambulo-proposicao`: PLV passa de `senado.federal` para `congresso.nacional`; MPV sob `senado.federal` passa a não ter texto; acrescentar `projeto.lei.complementar` e PEC na Câmara, PDL/PDS no Senado e na Câmara com texto e `projeto.lei` no Congresso com texto
- [ ] 4.3 Procurar testes e specs que dependam do preâmbulo de documentos com combinação fora da tabela (ex.: `preambuloCarga.test.ts`, `roundTripRemissaoExterna.test.ts`, `buildJsonixMetadados.test.ts`, `abertura-preambulo.cy.ts`; as URNs `federal:projeto.lei` desses testes são sintéticas) e ajustá-los ou registrar por que não são afetados

## 5. Teste E2E (Cypress)

- [ ] 5.1 Avaliar a viabilidade de um spec Cypress à luz de `docs/guia-cypress.md` e registrar a decisão. Avaliação prévia: o vocabulário é dado e lookup puro, sem superfície de UI própria; um spec dedicado teria custo alto (Shadow DOM, setup de documento) e cobriria o mesmo risco que o teste de caracterização e os testes de `urnUtil`. Alternativa proposta: cobrir o risco de ponta a ponta com os testes de integração `documentoArticulado.test.ts` (nova proposição com MPV/PLV/PL e nome de arquivo) e, como fumaça de regressão, executar os specs Cypress existentes que abrem documentos com preâmbulo (`cypress/e2e/documento-articulado/abertura-preambulo.cy.ts`) após a migração
- [ ] 5.2 Executar `abertura-preambulo.cy.ts` e confirmar que passa (ou ajustar o fixture/URN, se usar uma combinação que perdeu o texto padrão)

## 6. Fechamento

- [ ] 6.1 Executar `npm run lint`, `npm run build` e `npm test` e confirmar que passam
- [ ] 6.2 Registrar no `CLAUDE.md` (Quirks e Gotchas) a estrutura `vocabulario/` por autoridade, a ordem de mesclagem, o fallback dos lookups e a mudança da URN nova de MPV/PLV, sinalizando o `lexeditweb-editor` como ponto de coordenação
- [ ] 6.3 Atualizar `docs/sessao/TODO.md` com o estado da change (issue #1026, primeira etapa concluída; próximas: flag `ativo`, `tipoRelacaoSubstitutivo`, siglas antigas, sigla da casa, limpeza de `siglas`)
