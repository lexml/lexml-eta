# Tasks

## 1. Remover tiposReferenciaveis

- [x] 1.1 Remover `tiposReferenciaveis` de `tiposVocabulario.ts` e de `vocabularioSenado.ts`, a validação em `mesclarVocabulario.ts` e `aceitaComoReferencia`; verificar com `npm run build` sem erros de tipo
- [x] 1.2 Remover `getTiposReferenciaveis` de `consultasVocabulario.ts` e os testes correspondentes (`vocabulario.consultas.test.ts`, `vocabulario.mesclar.test.ts`); verificar que a suíte desses arquivos passa
- [x] 1.3 Atualizar `docs/requisitos/vocabulario.md` (RV-10, seção 3.5, tabela e interface) e o item 18 do `CLAUDE.md`; verificar por busca que não resta `tiposReferenciaveis` fora de `openspec/changes/archive/` e da change `2026-10-26-c01-...`

## 2. isSubstitutivo

- [x] 2.1 Implementar `isSubstitutivo(urn)` em `urnUtil.ts` com helper interno do evento da URN, e testes unitários para todos os cenários da spec (SBT, PL com e sem evento, evento sem `substitutivo='s'`, tipo que não aceita, PEP, tipo não resolvido); verificar que os testes passam
- [x] 2.2 Registrar `isSubstitutivo` em `docs/requisitos/vocabulario.md` e no item 18 do `CLAUDE.md`; verificar a consistência com a spec

## 3. Código morto

- [x] 3.1 Remover `getRefGenericaProjeto` e o `TODO`; buscar usos de `NomeComGenero`, `generoMasculino` e `generoFeminino` e remover só o que ficar sem uso; verificar com `npm run build` e `npm run lint`
- [x] 3.2 Remover `substitutivo` de `ParametrosEdicao`, `Proposicao` e `lexml-eta.component.ts`, ajustando testes que o citem; verificar com `npm test` e anotar no `CLAUDE.md` a mudança a comunicar ao host

## 4. Verificação final

- [x] 4.1 E2E (Cypress): não aplicável, porque a mudança não altera UI nem fluxo do editor; o risco é coberto pelos testes unitários do vocabulário e de `isSubstitutivo` (2.1) e pela suíte completa. Como checagem de regressão, rodar `npm test` e `npm run cy:run:local` em um spec de abertura de documento (ex.: `abertura-preambulo.cy.ts`)
- [x] 4.2 Validar a change com `openspec validate 2026-10-28-c01-is-substitutivo-sem-tipos-referenciaveis --strict` e verificar que passa
