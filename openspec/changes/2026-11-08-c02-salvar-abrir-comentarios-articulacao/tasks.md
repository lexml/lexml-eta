## 1. Prova com o conversor

- [ ] 1.1 Montar à mão um documento JSONIX com `Comentarios` de refs para um caput, um inciso e um dispositivo gravado numa revisão de exclusão (`_<base>-exc1`), convertê-lo em XML e de volta com o CLI real (`JSONIX_LEXML_CLI`, conferindo a existência do arquivo de saída, porque o CLI sai com 0 em erro) e validar o XML com `schemas/lexedit.xsd`. Verificar que nada é descartado; se algo for, registrar no design.md e parar para decidir com o usuário.

## 2. Gravação

- [ ] 2.1 Em `montaRevisoesArticulacao`, devolver o mapa `uuid2 → id gravado` do excluído e de seus descendentes, calculado no mesmo laço de `_<base>-exc<n>`. Verificar com testes unitários: um excluído, excluído com filhos, duas exclusões no mesmo pai.
- [ ] 2.2 Em `montaMetadadoLexEdit`, gravar as sequências da articulação (dispositivo vivo pela articulação, caput para artigo, excluído pelo mapa), antes das da justificação e na ordem do texto, descartando a que não se resolve; autores em `Usuarios` e a pendência. Verificar com testes unitários dos cenários de `salvar-documento-articulado` deste change.
- [ ] 2.3 Em `getDocumentoArticulado`, enviar as sequências também no anexo de parecer e o mapa dos excluídos pelo `DadosLexEdit`. Verificar com teste de componente nos dois modos.

## 3. Leitura

- [ ] 3.1 Em `lerComentarios`, separar as sequências da justificação (`_tc`) das da articulação (`comentariosArticulacaoLidos`, na ordem gravada), mantendo a tolerância. Verificar com testes unitários: ref de caput, de artigo, de excluído, sem comentário, data inválida.
- [ ] 3.2 Em `abrirDocumentoArticulado`, depois de aplicar as revisões, ligar cada sequência ao `uuid2` (dispositivo pelo `id`, caput para artigo, excluído em revisão pendente pelo `lexmlId`), descartando a sem dispositivo e a segunda do mesmo dispositivo, e reavaliar o alerta. Verificar com testes de componente dos cenários de `abrir-documento-articulado` deste change, incluindo salvar, reabrir e salvar de novo com o mesmo resultado (`congelarRelogio()`).

## 4. Integração com o conversor

- [ ] 4.1 Acrescentar a `documentoArticulado.integration.ts` o cenário de comentários na articulação e na justificação, com dispositivo excluído em revisão, ida e volta pelo CLI real e validação pelo `lexedit.xsd`. Verificar com `npm run test:documento-articulado:xml` (com `JSONIX_LEXML_CLI` e o JDK do IntelliJ no PATH).

## 5. Teste E2E (Cypress)

- [ ] 5.1 Gerar `demo/doc/teste_comentarios_articulacao.json` pelo `getDocumentoArticulado()` real (não à mão), com comentários num artigo, num inciso, num parágrafo excluído em revisão e num trecho da justificação.
- [ ] 5.2 Criar `cypress/e2e/documento-articulado/abertura-comentarios-articulacao.cy.ts` (com `export {};`): abrir a fixture por `#fileUpload`, conferir os ícones, as sequências ("No texto" com a identificação e "Na justificação") e o alerta; salvar capturando o blob de `URL.createObjectURL`, reabrir e conferir as mesmas sequências. Verificar com `npx cypress run --env envName=local --spec` no arquivo novo, só com autorização do usuário.

## 6. Documentação e fechamento

- [ ] 6.1 Atualizar `docs/extensao-formato-lexml/08-comentarios.md` (implementado também para a articulação, ref de excluído em revisão, regras de leitura), a tabela de `00-especificacao-esquema-lexedit.md` e a fixture `scripts/fixtures-lexedit/08-comentarios.xml` com uma sequência de dispositivo. Verificar com `npm run verify:xsd-lexedit`.
- [ ] 6.2 Registrar no `CLAUDE.md` (item 24) a origem de cada ref (articulação, mapa dos excluídos, varredura da justificação) e a ligação depois das revisões ao abrir.
- [ ] 6.3 Rodar `npm test` completo e o lint só nos arquivos alterados, sem regressão, e `openspec validate 2026-11-08-c02-salvar-abrir-comentarios-articulacao --strict` sem erros.
