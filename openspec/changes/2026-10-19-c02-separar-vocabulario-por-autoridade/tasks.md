# Tasks

## 1. Teste de caracterização do vocabulário atual

- [x] 1.1 Criar `test/model/documento/vocabulario.caracterizacao.test.ts` que percorre cada entrada de `tiposDocumento`, `fakeUrns` e `preambulosPadrao` do vocabulário atual e fixa as saídas de `getTipo`, `getSigla`, `getAutoridade`, `getPreambuloPadrao`, `getTipoDocumentoUrn` e `buildFakeUrn`, inclusive para URNs de autoridade cruzada que hoje resolvem
- [x] 1.2 Incluir no teste as invariantes do vocabulário e marcar como esperadas as mudanças deliberadas da primeira etapa (MPV `federal`, PLV `congresso.nacional`, preâmbulo por tipo + autoridade)
- [x] 1.3 Executar o teste contra o código ainda não migrado e confirmar que passa

## 2. Dividir os dados por autoridade (primeira etapa, concluída)

- [x] 2.1 Criar `vocabulario/tipos.ts` com os tipos de item
- [x] 2.2 Criar `mesclar.ts` (carimba `urnAutoridade` e concatena) com teste próprio
- [x] 2.3 Criar `federal.ts`, `senado.ts`, `camara.ts` e `congresso.ts`
- [x] 2.4 Criar `comum.ts` e `index.ts`; remover `vocabulario.ts`
- [x] 2.5 Mover `fakeUrns` de MPV para `federal` e de PLV para `congresso`

## 3. Modelo do tipo de documento e mesclagem por casa

- [x] 3.1 Reescrever `vocabulario/tipos.ts` conforme D2: `TipoDocumentoItem` (`urnTipoDocumento`, `sigla?`, `descricao`, `genero`, `ativo?`, `tipoRelacaoSubstitutivo?`, `tiposReferenciaveis?`), `TipoRelacaoSubstitutivo` e o tipo mesclado com `urnAutoridade` e `urn`; remover `SiglaItem` e `FakeUrnItem`
- [x] 3.2 Migrar os dados de `federal.ts`, `senado.ts`, `camara.ts` e `congresso.ts`: `urn` → `urnTipoDocumento` + `sigla`; remover `siglas` e `fakeUrns`; marcar `ativo: false` nos tipos legados conforme o código atual (uma sigla ativa por sigla); declarar `tipoRelacaoSubstitutivo` (`substitutivo;sbt` = `é substitutivo`, `subemenda.substitutiva;pep` = `é subemenda substitutiva`, PL/PLP/PEC/PRS/PDL = `aceita substitutivo`, PLV = `não aceita substitutivo`) e deixar `tiposReferenciaveis` vazio no SF
- [x] 3.3 Reescrever `mesclar.ts` e criar `montarVocabulario(casa)` (D1, D3): composição `SF`/`CD`, cálculo de `urn` e de `tiposDocumentoAtivos`/inativos, resolução de `tiposReferenciaveis` e validações com erro descritivo
- [x] 3.4 Cobrir `mesclar`/`montarVocabulario` com testes das duas casas e de cada falha de validação (sigla duplicada entre ativos, chave duplicada, referência inexistente, referência a tipo que não aceita substitutivo, sigla repetida com inativo)

## 4. Consultas e vocabulário estático

- [x] 4.1 Implementar o estado estático em `vocabulario/index.ts` (D5): `getVocabulario()`, `inicializarVocabulario(casa)` com normalização para `SF` e aviso para valor inválido, e inicialização sob demanda de `SF`
- [x] 4.2 Criar `vocabulario/consultas.ts` (D4): `getTiposDocumentoAtivos`, `getTiposDocumentoInativos`, `getTipoPorSigla`, `getTiposReferenciaveis`
- [x] 4.3 Reescrever `urnUtil.ts`: `getTipo`/`getTipoDocumentoUrn` pela autoridade exata (remover `procurarPorAutoridade`), `getSigla` pelo tipo resolvido, `buildFakeUrn` a partir de `getTipoPorSigla`, `getPreambuloPadrao` sobre o vocabulário estático
- [x] 4.4 Testes de cada consulta para `SF` e `CD`, cobrindo os cenários da spec `vocabulario-urn` (inclusive tipo da outra casa, sem fallback e C3 por `tipoRelacaoSubstitutivo`)

## 5. Inicialização no componente

- [x] 5.1 Confirmar `LexmlEtaConfig.casaLegislativaEditor` (já adicionado, padrão `SF`) e chamar `inicializarVocabulario` no `LexmlEtaComponent` sempre que `lexmlEtaConfig` for atribuída, antes de `inicializarEdicao`
- [x] 5.2 Teste de componente: configuração com `CD` muda as consultas; reatribuição remonta; `casaLegislativa` (documento) permanece independente
- [x] 5.3 Documentar `casaLegislativaEditor` em `docs/api-componente-lexml-eta.md`

## 6. Chamadores e preâmbulo

- [ ] 6.1 Conferir cada chamador de `getTipo`/`getSigla`/`getTipoDocumentoUrn` (`buildProjetoNormaFromJsonix`, `adicionaAlteracaoComAssistente`, `atualizaReferenciaElemento`, `colarUtil`, `dispositivoValidator`, `documentoArticulado`, `lexml-eta.component`) e garantir que o "não resolve" (`undefined`) não lança exceção não tratada (D8), com teste onde houver comportamento novo
- [ ] 6.2 Ajustar `preambulosPadrao` das autoridades à tabela de D6 e validar os cenários da spec `preambulo-proposicao`, incluindo o de autoridade fora do vocabulário da casa

## 7. Testes e fixtures existentes

- [ ] 7.1 Reescrever `vocabulario.caracterizacao.test.ts` e `vocabulario.lookup.test.ts` (D7) para o modelo novo, rodando `SF` e `CD` com helper que restaura `SF`
- [ ] 7.2 Ajustar `documentoArticulado.test.ts` (MPV com autoridade `federal`) e `preambuloPadrao.test.ts` (PLV, MPV e demais combinações, por casa)
- [ ] 7.3 Procurar testes e specs que dependam de URNs de tipo/autoridade que deixam de resolver (ex.: `preambuloCarga.test.ts`, `roundTripRemissaoExterna.test.ts`, `buildJsonixMetadados.test.ts`, `abertura-preambulo.cy.ts`, fixtures de `demo/doc`) e ajustá-los ou registrar por que não são afetados

## 8. Teste E2E (Cypress)

- [x] 8.1 ~~Avaliar a viabilidade de um spec Cypress~~ Dispensada por decisão do usuário. Decisão registrada: sem spec E2E novo, porque o vocabulário é dado e consulta pura, sem superfície de UI própria; o risco é coberto pelos testes de vocabulário, de `urnUtil` e de componente (5.2)
- [ ] 8.2 Executar `abertura-preambulo.cy.ts` e confirmar que passa (ou ajustar o fixture/URN, se usar uma combinação que deixou de resolver)

## 9. Fechamento

- [ ] 9.1 Executar `npm run build` e `npm test` e confirmar que passam (sem `npm run lint` e sem a suíte E2E completa)
- [ ] 9.2 Registrar no `CLAUDE.md` (Quirks e Gotchas) a estrutura `vocabulario/` por autoridade e por casa, `casaLegislativaEditor` × `casaLegislativa`, o estado estático, a resolução sem fallback e a mudança da URN de MPV/PLV, sinalizando o `lexeditweb-editor` e o Infoleg Editor como pontos de coordenação
- [ ] 9.3 Sincronizar `docs/requisitos/vocabulario.md` com o que foi implementado
- [ ] 9.4 Atualizar `docs/sessao/TODO.md` com o estado da change (issue #1026; próximas: tela de nova proposição, `tiposReferenciaveis` do SF, `ativo` definitivo)
