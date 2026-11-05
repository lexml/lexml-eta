## 1. Prova com o conversor

- [x] 1.1 Montar à mão um documento JSONIX com um trecho comentado em dois `span` `_tc<id>_1`/`_2` (um deles dentro de um `ins`) e um `lexedit:Comentarios` com dois `Comentario` de dois `p`, convertê-lo em XML e de volta com o CLI real (`JSONIX_LEXML_CLI`, conferindo a existência do arquivo de saída, porque o CLI sai com 0 em erro) e validar o XML com `schemas/lexedit.xsd`. Verificar que nada é descartado; se algo for, registrar no design.md e parar para decidir com o usuário.

## 2. Gravação

- [x] 2.1 Em `conversor/justificacao.ts`, montar `comentario` como `span` `_tc<id>_<n>` na varredura, com id substituto para id fora do padrão, ignorando a marca vazia, e devolver `trechosComentados` em `montaJustificacao`. Verificar com testes unitários: um fragmento, dois parágrafos, trecho com `ins` dentro e trecho dentro de `del`, trecho em célula de tabela, ids todos únicos.
- [x] 2.2 Acrescentar `comentarios` a `DadosLexEdit` e, em `montaMetadadoLexEdit`, o grupo `Comentarios` (só sequências com trecho, `refIdElementoComentado` no fragmento `_1`, linhas em `p`), os autores em `montaUsuarios` e a pendência "Remover comentários." na ordem nova. Verificar com testes unitários dos cenários de `salvar-documento-articulado` e `metadados-lexedit` deste change.
- [x] 2.3 Em `lexml-eta.component.ts#getDocumentoArticulado`, enviar as sequências (fora do anexo de parecer). Verificar com teste de componente que o documento salvo contém o `span` e o `Comentarios`.

## 3. Leitura

- [ ] 3.1 Em `buildProjetoNormaFromJsonix.ts`, `lerComentarios` tolerante e `DadosLexEdit.comentariosLidos`. Verificar com testes unitários: autor registrado e não registrado, data inválida, sequência sem comentário, ref de dispositivo, `p` em linhas.
- [ ] 3.2 Em `lerJustificacao`, recriar `comentario` a partir do `span` `_tc` com sequência (com e sem sufixo) e desembrulhar os demais. Verificar com testes unitários, inclusive `span` de classe `p` em célula com um `span` `_tc` dentro.
- [ ] 3.3 Em `abrirDocumentoArticulado`, aplicar as sequências depois do `setContent`, descartar as sem trecho e reavaliar o alerta. Verificar com testes de componente dos cenários de `abrir-documento-articulado` deste change, incluindo salvar, reabrir e salvar de novo com o mesmo resultado (`congelarRelogio()` de `test/doc/documentoArticulado.ts`).

## 4. Integração com o conversor

- [ ] 4.1 Acrescentar a `documentoArticulado.integration.ts` o cenário de comentários (dois fragmentos, revisão dentro, resposta, autor também de revisão) com ida e volta pelo CLI real e validação pelo `lexedit.xsd`. Verificar com `npm run test:documento-articulado:xml`.

## 5. Teste E2E (Cypress)

- [ ] 5.1 Gerar `demo/doc/teste_comentarios.json` pelo `getDocumentoArticulado()` real (não à mão), com um trecho comentado em dois parágrafos e uma resposta de outro usuário.
- [ ] 5.2 Criar `cypress/e2e/documento-articulado/abertura-comentarios.cy.ts` (com `export {};`): abrir a fixture por `#fileUpload`, conferir o destaque dos dois fragmentos, a sequência com os dois autores e o alerta; salvar capturando o blob de `URL.createObjectURL` (como em `titulo-dispositivo.cy.ts`), reabrir e conferir a mesma sequência. Verificar com `npm run cy:run:local -- --spec` no arquivo novo.

## 6. Documentação e fechamento

- [ ] 6.1 Atualizar `docs/extensao-formato-lexml/08-comentarios.md` (id de cada fragmento, casos particulares de leitura, implementado só para a justificação), a tabela de `00-especificacao-esquema-lexedit.md` e a fixture `scripts/fixtures-lexedit/08-comentarios.xml` com um trecho em dois fragmentos. Verificar com `npm run verify:xsd-lexedit`.
- [ ] 6.2 Registrar no `CLAUDE.md` o padrão de gravação e leitura dos comentários (varredura única, ordem das pendências e descarte das sequências sem trecho).
- [ ] 6.3 Rodar `npm test` completo e o lint só nos arquivos alterados, sem regressão, e `openspec validate 2026-11-03-c03-salvar-abrir-comentarios-justificacao --strict` sem erros.
