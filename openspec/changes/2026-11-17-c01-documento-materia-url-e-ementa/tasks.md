# Tasks

## 1. Contrato e lógica pura

- [x] 1.1 Em `urlsNovaProposicao.ts`, renomear `urlInteiroTeor` para `urlDocumento?` e acrescentar `ementa?` e `tooltipDocumento?` em `DocumentoMateria`. Em `documentosMateria.ts`, renomear `urlInteiroTeorSegura` para `urlDocumentoSegura` (aceita `undefined`), incluir a `ementa` no texto pesquisável do filtro e criar `tooltipDoDocumento(doc)` com o padrão "Abrir o documento em outra aba". Verificar com testes unitários em `documentosMateria.test.ts` (filtro pela ementa, tooltip padrão/vazio/do host, URL ausente e insegura).
- [x] 1.2 Atualizar `docs/api-componente-lexml-eta.md` com os campos novos e o **BREAKING** da renomeação. Verificar relendo o texto contra a spec.

## 2. Tela 2b

- [ ] 2.1 Em `nova-proposicao.component.ts`, exibir a ementa abaixo do título (2 linhas, `title` com o texto completo), tornar o ícone condicional a `urlDocumento`, usar o tooltip e o `aria-label` de `tooltipDoDocumento` e trocar "inteiro teor" por "documento" no parágrafo da tela. Verificar com testes de componente em `tela2b.component.test.ts` (ementa presente e ausente, ícone presente e ausente, tooltip padrão e do host).

## 3. Demo

- [ ] 3.1 Em `demo/server/dados/documentos-materia.json`, trocar `urlInteiroTeor` por `urlDocumento` e acrescentar ementas, um documento sem `ementa`, um sem `urlDocumento` e um com `tooltipDocumento`; ajustar `handlers.test.mjs`. Verificar com `npm run test:demo-server`.

## 4. E2E (Cypress)

- [ ] 4.1 Estender `cypress/e2e/nova-proposicao/documento-origem-camara.cy.ts` (consultar `docs/guia-cypress.md`) usando o mock: ementa exibida abaixo do título, filtro pela ementa, ícone ausente no documento sem `urlDocumento` e tooltip do host. Se algum caso não for viável (por exemplo, o limite de 2 linhas, que depende de layout), registrar a decisão e cobrir com teste de componente.
