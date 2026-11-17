# Tasks

## 1. Contexto e URL

- [x] 1.1 Em `urlsNovaProposicao.ts`, criar `ContextoImportacaoArquivo`, alterar `ImportarArquivoCallback` para `(arquivo, contexto)` e criar `montaUrlImportacao(modelo, contexto)` com os placeholders (codificados, ausente = vazio). Em módulo próprio, criar a função pura que monta o contexto a partir de `DadosIdentificacao`, do número original e das URNs de `montaUrnNovaProposicao`. Exportar o tipo em `src/index.ts` e em `scripts/validate-package.mjs`. Verificar com testes unitários: PEC (CD), PLV, substitutivo do SF (`siglaDocumento` = sigla do PL e `@apresentacao.substitutivo` na `urn`), SBT e SSP (CD), referenciada complementar (PLS/PLC), placeholders codificados e vazios, URL sem placeholders intacta; e com `npm run build` e `node scripts/validate-package.mjs`.
- [x] 1.2 Documentar em `docs/api-componente-lexml-eta.md` o segundo parâmetro do callback, os placeholders de `urlImportacaoArquivo` (que deixa de ser "sem placeholders") e a recomendação de o host extrair o tipo da norma do segmento de tipo da URN. Verificar relendo o texto contra a spec.

## 2. Componente

- [ ] 2.1 Em `nova-proposicao.component.ts`, montar o contexto (congelado) ao acionar **Continuar** na importação e passá-lo a `importarPeloCallback` e `importarPelaUrl`. Verificar com testes de componente em `callbacks.component.test.ts`: o callback recebe o contexto do substitutivo do SF e de um SBT da CD, e o `fetch` da URL é chamado com os placeholders preenchidos (um caso por formato distinto, sem repetir a matriz do 1.1).
- [ ] 2.2 Desabilitar **Voltar** e **Cancelar** das Telas 2 e 2b enquanto `processando`. Verificar com testes de componente: com importação pendente (promise não resolvida) os dois botões ficam desabilitados e voltam a ficar habilitados ao responder (sucesso e falha); o mesmo na obtenção de texto da Tela 2b.

## 3. Demo

- [ ] 3.1 Em `demo/components/demoview.ts`, acrescentar placeholders à `urlImportacaoArquivo` da demo e garantir que `demo/server/handlers.mjs` aceite a query string (hoje decide só pelo `Content-Type`). Verificar com `npm run test:demo-server`, incluindo um caso com query string.

## 4. E2E (Cypress)

- [ ] 4.1 Estender `cypress/e2e/nova-proposicao/callbacks.cy.ts` (consultar `docs/guia-cypress.md`): o stub de `onImportarArquivo` recebe o contexto de um substitutivo (`calledWith` com `urn`, `especie` e `documentoReferenciado`), e um cenário com `cy.intercept` na URL com placeholders confere a query do `POST`. Verificar com `npm run cy:run:local` só nesse spec. O bloqueio de **Voltar** e **Cancelar** fica no teste de componente (2.2), porque exigir uma resposta pendente no navegador é frágil; registrar a decisão aqui se o E2E do bloqueio não for feito.

## 5. Validação

- [ ] 5.1 Validar a change com `openspec validate "2026-11-17-c02-contexto-importacao-arquivo" --strict` e rodar `npm test` para conferir que nenhum teste existente depende do `onImportarArquivo(arquivo)` de um só parâmetro.
