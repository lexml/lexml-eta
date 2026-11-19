# Tasks

## 1. Conversor e contrato de metadados

- [x] 1.1 Remover do leitor LexEdit a leitura de `dataUltimaModificacao`, seu campo no tipo de dados lidos e a atribuição ao estado do componente, preservando o campo e a gravação no modelo serializado; verificar com testes unitários que abrir ignora valores válidos, inválidos ou ausentes sem afetar outros grupos e que exportar grava o valor fornecido.
- [x] 1.2 Adaptar o teste de ida e volta do conversor para confirmar que a data anterior não é preservada e que os demais grupos permanecem iguais; verificar com os testes unitários e de integração de `documentoArticulado`.
- [x] 1.3 Atualizar `docs/extensao-formato-lexml/13-outros-metadados-do-lexedit.md` para dizer que o atributo é gravado no arquivo e ignorado ao abrir; verificar que o texto não promete leitura ou exposição ao host.

## 2. API do componente e fluxo de edição

- [x] 2.1 Remover `dataUltimaModificacaoDocumento`, o estado privado correspondente e o repasse do valor em `alterarDadosBasicos`; verificar com testes do componente que abrir e alterar dados básicos não conservam a data de entrada e que exportar produz uma data nova.
- [x] 2.2 Atualizar o E2E Cypress existente `cypress/e2e/documento-articulado/abertura-data-ultima-modificacao.cy.ts` para verificar que a abertura não expõe a data e que a exportação gera um novo instante; a cobertura E2E é viável porque o spec existente já abre fixtures pela UI e inspeciona `getDocumentoArticulado()`. Verificar com a execução direcionada documentada em `docs/guia-cypress.md`.
- [x] 2.3 Atualizar `docs/api-componente-lexml-eta.md`, removendo a propriedade pública e descrevendo o instante novo no documento exportado; manter a explicação distinta de `Proposicao.dataUltimaModificacao`. Verificar que a referência da API não lista mais `dataUltimaModificacaoDocumento`.
