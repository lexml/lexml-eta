# Tasks

## 1. Regra e resultado da Tela 1

- [x] 1.1 Em `nova-proposicao.component.ts`, criar o getter `comissaoObrigatoria` e usá-lo em `destinoValido`, `onTipoColegiado` (manter a comissão ao ir para Plenário), exibição do seletor e `montarResultado` (`siglaComissao` também no Plenário). Verificar com testes de componente: CD substitutivo/subemenda com Plenário exige comissão e a devolve no `detail`; troca de destino mantém a comissão; Proposição na CD e SF seguem sem comissão no Plenário.
- [x] 1.2 Tratar a falha na lista de comissões na CD em substitutivo (erro visível e **Continuar** desabilitado). Verificar com teste de componente do cenário de falha.

## 2. Modo de edição e aba de dados básicos

- [x] 2.1 Em `aplicarDadosIniciais`, ler `siglaComissao` também no Plenário quando `comissaoObrigatoria`. Verificar com testes de componente: colegiado Plenário com comissão vem preenchido; sem comissão vem vazio com **Continuar** desabilitado.
- [x] 2.2 Em `dados-basicos.component.ts`, exibir "Plenário (SIGLA)" quando houver sigla. Verificar com teste de componente de dados básicos (Plenário com e sem comissão; Comissão inalterado).
- [x] 2.3 Documentar a mudança em `docs/api-componente-lexml-eta.md` (destino Plenário com `siglaComissao` na CD). Verificar relendo o texto contra a spec.

## 3. E2E (Cypress)

- [ ] 3.1 Spec em `cypress/e2e/nova-proposicao/` (consultar `docs/guia-cypress.md`): CD, subemenda substitutiva e substitutivo, destino Plenário exige comissão, **Continuar** desabilitado sem ela, arquivo salvo com `lexedit:ColegiadoApreciador` Plenário + `siglaComissao`. Ajustar os specs existentes da CD que escolhem Plenário. Se algum caso não for viável, registrar a decisão e cobrir com teste de componente.
