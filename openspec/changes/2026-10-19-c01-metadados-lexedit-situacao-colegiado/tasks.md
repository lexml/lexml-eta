# Tasks

## 1. Esquema, especificação e fixtures

- [x] 1.1 Em `schemas/lexedit.xsd`, remover `@substitutivo`, adicionar `@urnDocumentoReferenciado` (`xsd:string`) e os elementos `SituacaoNaNormaVigente` e `ColegiadoApreciador` (com o tipo simples `TipoColegiado`) ao `xsd:all` de `Metadado`; verificar com `npm run verify:xsd-lexedit`
- [x] 1.2 Atualizar `docs/extensao-formato-lexml/13-outros-metadados-do-lexedit.md`, `documento-articulado-exemplo.xml/.json`, `plano-xsd-lexedit.md` e `issues.md` (sem `substitutivo`; com `urnDocumentoReferenciado` como previsto e não preenchido; com a seção de situação; e criar `14-colegiado-apreciador.md` com a especificação do colegiado, no formato dos demais arquivos numerados); conferir que nenhum exemplo cita `substitutivo` com `grep`
- [x] 1.3 Atualizar `scripts/fixtures-lexedit/13-outros-metadados-do-lexedit.xml` e criar fixtures para `SituacaoNaNormaVigente` e `ColegiadoApreciador`; verificar com `npm run verify:xsd-lexedit` (todas validam)

## 2. Situação na norma vigente (salvar e abrir)

- [ ] 2.1 Adicionar o tipo e o campo em `MetadadoLexEdit`/`DadosLexEdit` e o montador `montaSituacaoNaNormaVigente` (só dispositivos de alteração com situação definida; omite elemento e atributos vazios); teste unitário em `test/model/lexml/documento/` cobrindo existentes, novos, mistos, vazio e dispositivo fora de bloco de alteração
- [ ] 2.2 Coletar os ids por varredura da articulação em `lexml-eta-proposicao.component.ts#getDocumentoArticulado`; teste unitário com articulação contendo bloco de alteração
- [ ] 2.3 Implementar `lerSituacaoNaNormaVigente` (tolerante) e propagar as listas até `loadArticulacao.ts`, reaplicando `existeNaNormaAlterada` por id; testes unitários do leitor (lista vazia, id duplicado, id inexistente, tipo inesperado) e do carregamento (valor restaurado, sem elemento = comportamento atual)
- [ ] 2.4 Ida e volta: teste de reducer/abertura que salva, reabre e salva de novo, comparando os arquivos por igualdade

## 3. Colegiado apreciador (salvar e abrir)

- [ ] 3.0 Remover "Plenário via Comissão": tipo em `proposicao.ts`, rádio e ramos relacionados em `destino.component.ts`, `docs/api-componente-lexml-eta.md` e o teste em `documentoArticulado.component.test.ts`; verificar com `grep -rn "via Comissão" src test docs/api-componente-lexml-eta.md` sem resultados, `npm run build` e teste de componente do destino (valor desconhecido cai em `Plenário`)
- [ ] 3.1 Adicionar o campo em `DadosLexEdit`, o montador `montaColegiadoApreciador` e o leitor `lerColegiadoApreciador` (padrão da classe para atributo ausente ou inválido); testes unitários de montador e leitor, inclusive `siglaComissao` ausente e `tipoColegiado` inválido
- [ ] 3.2 Coletar o destino em `lexml-eta.component.ts#getDocumentoArticulado` (omitido no anexo de parecer) e aplicá-lo ao abrir depois de `inicializarEdicao`, mantendo a casa do host; atualizar `destinoAoAbrir` depois da aplicação; teste de componente cobrindo destino Plenário, Comissão e o invariante do local do fecho (igual preserva, alterado deriva)
- [ ] 3.3 Compor ambos os grupos em `montaMetadadoLexEdit`/`lerMetadadoLexEdit` e confirmar que a ausência dos grupos mantém a saída atual; teste unitário de composição

## 4. Integração e E2E

- [ ] 4.1 Estender a suíte de integração `documentoArticulado.integration.ts` com os novos grupos (ida e volta pelo CLI real, validação com `lexedit.xsd`); verificar com `npm run test:documento-articulado:xml`
- [ ] 4.2 Criar fixture `demo/doc/` via `criarDocumentoArticulado` (com bloco de alteração, dispositivos existentes e novos, destino Comissão) e o spec Cypress `cypress/e2e/documento-articulado/abertura-situacao-e-destino.cy.ts` abrindo pela UI (consultar `docs/guia-cypress.md`: shadow DOM, `sl-select`/rádios do destino, marcação "Existente/Novo"); verificar com `npm run cy:run:local -- --spec ...`. Se o diálogo de comissão se mostrar inviável no Cypress, registrar a decisão e cobrir o destino por teste de componente
- [ ] 4.3 Rodar a suíte completa (`npm test`) e `npm run lint`; verificar que nada regride

## 5. Documentação do projeto

- [ ] 5.1 Registrar no `CLAUDE.md` (item 13) os dois grupos novos, a retirada de `substitutivo`, o `urnDocumentoReferenciado` previsto e a revisão do invariante (x); atualizar `docs/sessao/TODO.md`
