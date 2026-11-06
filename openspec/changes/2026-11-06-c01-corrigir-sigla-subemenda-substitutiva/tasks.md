# Tasks

## 1. Vocabulário da Câmara e testes

- [x] 1.1 Trocar a sigla `PEP` por `SSP` no tipo `subemenda.substitutiva` de `vocabularioCamara.ts` e verificar que `getTipo` resolve `urn:lex:br:camara.deputados:subemenda.substitutiva;ssp:2026;1` e não resolve a mesma URN com `;pep`
- [x] 1.2 Atualizar `vocabulario.porCasa.test.ts` (tabela `CAMARA` e mapa `fakeUrns`) e `urnUtil.test.ts` para `SSP`/`;ssp`, acrescentando o caso de `;pep` sem resolução; verificar que os testes de vocabulário e de `urnUtil` passam para SF e CD
- [x] 1.3 Atualizar `modulosNovaProposicao.test.ts` e `novaProposicao.component.test.ts` para `SSP`/`;ssp`; verificar que a lista de siglas de subemenda substitutiva é `['SSP']` e que a URN gerada é `urn:lex:br:camara.deputados:subemenda.substitutiva;ssp:<ano>;999999`

## 2. Teste E2E (Cypress)

Viável: já existe, em `cypress/e2e/nova-proposicao/nova-proposicao.cy.ts`, o caso "na Câmara, substitutivo usa a sigla do substitutivo e as comissões da CD", que serve de molde (`#casaEditor`, `escolherItemLista`, `verificarProposicao`, `lerSalvo`). Consultar `docs/guia-cypress.md` antes de escrever.

- [ ] 2.1 Acrescentar o caso "na Câmara, subemenda substitutiva usa a sigla SSP" (espécie `subemenda`, sigla `SSP` em `#np-sigla-substitutivo`) e verificar que a URN salva casa com `/^urn:lex:br:camara\.deputados:subemenda\.substitutiva;ssp:\d{4};999999$/`; executar o spec e confirmar que passa

## 3. Documentação e specs

- [ ] 3.1 Atualizar `docs/requisitos/vocabulario.md` (seção 3.5, `pep`, e seção 6, "Referência da subemenda substitutiva (`pep`)") para `ssp`; verificar com busca que não restam `pep`/`PEP` fora do histórico em `openspec/changes/archive/`
- [ ] 3.2 Atualizar o exemplo "Subemenda substitutiva" da change `2026-11-05-c01-alterar-dados-basicos-proposicao` (`specs/dados-basicos-proposicao/spec.md`, linhas 48-49) de `PEP` para `SSP`; verificar com busca que a change não cita mais `PEP`
- [ ] 3.3 Validar a change com `openspec validate 2026-11-06-c01-corrigir-sigla-subemenda-substitutiva` e confirmar que passa sem erros

## Workflow follow-up

- Arquivar a change depois da validação do usuário, para mesclar o delta na spec `vocabulario-urn`.
