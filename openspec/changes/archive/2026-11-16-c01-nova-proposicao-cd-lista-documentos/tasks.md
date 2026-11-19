# Tasks

## 1. Contrato e configuração

- [x] 1.1 Em `urlsNovaProposicao.ts`, declarar `DocumentoMateria`, `ListarDocumentosCallback`, `ObterTextoDocumentoCallback`, `urlDocumentosMateria`/`urlTextoDocumento` e o placeholder `{id}`; exigir as duas origens só com `casaLegislativaEditor = 'CD'`. Verificar com testes unitários de `validarConfigNovaProposicao` (CD recusa sem origem; SF e padrão aceitam) e de montagem de URL.
- [x] 1.2 Documentar os dois serviços e o **BREAKING** em `docs/api-componente-lexml-eta.md`. Verificar relendo o texto contra a spec.

## 2. Tela 2 sem inputs na CD

- [x] 2.1 Na `CD`, em substitutivo/subemenda, a opção "Texto de outra proposição" não renderiza sigla/número/ano/verificar/ementa e **Continuar** leva à Tela 2b. Verificar com teste de componente (CD, SF e outra espécie da CD).

## 3. Tela 2b

- [x] 3.1 Seção "Em qual matéria está o documento?" (padrão "Nesta mesma matéria"; "Em outra matéria" com select de siglas da referenciada, número, ano e **Verificar**). Verificar com teste de componente para os cenários de matéria padrão, verificada e inexistente.
- [x] 3.2 Lista "Documento de origem": carregamento por `onListarDocumentos`, linha (título, identificação, "Papel: Dep. Nome", data DD/MM/AAAA), ícone de inteiro teor, item desabilitado sem texto estruturado, lista vazia, falha, seleção única, faixa "Fonte selecionada" com **Trocar**. Verificar com testes de componente.
- [x] 3.3 Filtro textual genérico no cliente (sem acento/caixa, inclui data). Verificar com teste unitário da função de filtro e de componente.
- [x] 3.4 **Continuar**, **Voltar** e **Cancelar**: obter texto por `onObterTextoDocumento({id})`, `concluir({ texto })`, tratamento de indisponível/falha, **Voltar** à Tela 2 com a escolha preservada. Verificar com testes de componente do `detail`.

## 4. Demo

- [x] 4.1 Em `demo/server/handlers.mjs`, adicionar `GET /demo-api/materias/{sigla}/{numero}/{ano}/documentos` (lista no contrato `DocumentoMateria`; `404` para matéria sem mock) e `GET /demo-api/documentos/{id}/texto` (JSONIX reaproveitado dos textos já servidos; `404` para documento sem texto). Verificar com casos novos em `demo/server/handlers.test.mjs`.
- [x] 4.2 Massa de dados do mock, fora do componente: PL 4/2025 com texto original, "Substitutivo do relator" (CSAUDE), "Complementação de voto", "Parecer do relator 1 – CCJC", PL 117/2025 e PL 480/2025 (apensados) e um documento com `textoEstruturadoDisponivel: false`; uma matéria com lista vazia; qualquer outra matéria dá `404`. Verificar nos testes do fake (rota devolve cada caso).
- [x] 4.3 Em `demo/components/demoview.ts`, passar `urlDocumentosMateria` e `urlTextoDocumento` na config. Verificar abrindo a demo em `CD` e percorrendo a Tela 2b manualmente.

## 5. E2E (Cypress)

- [x] 5.1 Usando o mock da demo (grupo 4), spec em `cypress/e2e/nova-proposicao/` (consultar `docs/guia-cypress.md`): CD, subemenda substitutiva, "Texto de outra proposição", Tela 2b, filtro, seleção, **Continuar** abre o editor com o texto do documento. Se o fluxo de CD na demo não for viável, registrar a decisão e cobrir com teste de componente.
