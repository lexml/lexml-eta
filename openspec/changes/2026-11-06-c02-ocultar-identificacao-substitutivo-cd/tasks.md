# Tasks

## 1. Componente: tipo e ano derivados na CD

- [ ] 1.1 Em `siglasNovaProposicao.ts`, criar a busca do tipo de substitutivo/subemenda da casa pela sigla (`SBT`/`SSP`), com erro que nomeia a sigla ausente; verificar com teste unitário dos casos `SBT`, `SSP` e sigla ausente (`modulosNovaProposicao.test.ts`)
- [ ] 1.2 Em `nova-proposicao.component.ts`, derivar `tipoSubstitutivo` da espécie na `CD` (design D1/D4) e remover `chaveSubstitutivo`, `onSiglaSubstitutivo` e a exigência de g2 em `tela1Valida`; verificar que `Continuar` habilita na `CD` sem informar sigla ou ano do substitutivo e que o `SF` segue com `tipoSubstitutivo` indefinido
- [ ] 1.3 Remover o fieldset `np-g2` da Tela 1 e o uso de `numeroFixoDe` para o substitutivo; verificar que `np-g2` não existe na `CD` (Substitutivo e Subemenda) nem no `SF`
- [ ] 1.4 Garantir o ano (design D2): ano corrente na criação e ano da URN inicial na edição, mantido na troca de espécie e ao trocar o destino; verificar por testes de componente em `alterarDadosBasicos.component.test.ts` (substitutivo e subemenda da Câmara de 2025, troca de espécie, troca de destino, número real preservado na URN)
- [ ] 1.5 Atualizar `novaProposicao.component.test.ts` (o teste "Tela 1 na CD" deixa de esperar `np-g2` e passa a conferir tipo `SBT`/`SSP` e ano corrente na URN do resultado) e o teste de `np-ano-substitutivo` em `alterarDadosBasicos.component.test.ts`; verificar com a execução dos testes de `test/componente/nova-proposicao/`

## 2. Teste E2E (Cypress)

- [ ] 2.1 Em `cypress/e2e/nova-proposicao/nova-proposicao.cy.ts`, ajustar os dois casos da `CD`: remover `escolherItemLista('#np-sigla-substitutivo', ...)`, afirmar que `#np-g2` não existe e manter a verificação da URN (`substitutivo;sbt:\d{4};999999` e `subemenda.substitutiva;ssp:\d{4};999999`). A viabilidade foi avaliada: os casos já existem e usam o mesmo fluxo (`docs/guia-cypress.md`), então basta adaptá-los; verificar executando o spec (`cy:run:local`) com os dois casos passando e os demais do arquivo inalterados

## 3. Documentação

- [ ] 3.1 Atualizar `docs/requisitos/componente-nova-proposicao.md` (g2, RN-01, RN-06, RN-12 e regra de ano) e `docs/requisitos/layout-tela-1-componente-nova-proposicao.txt`; verificar por busca de `g2` e "Identificação do substitutivo" que nenhuma menção restante contradiz a spec

## 4. Validação final

- [ ] 4.1 Rodar `openspec validate 2026-11-06-c02-ocultar-identificacao-substitutivo-cd` e a suíte `test/componente/nova-proposicao/`; verificar que ambos passam sem erros

## Workflow follow-up

- Arquivar a change depois da revisão (`/opsx-archive`), mesclando o delta em `openspec/specs/nova-proposicao/spec.md`.
