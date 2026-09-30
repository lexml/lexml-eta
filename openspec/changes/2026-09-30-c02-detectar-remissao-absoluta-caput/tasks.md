## 1. Caracterização (antes de corrigir)

- [x] 1.1 Conferir `test/redux/remissao/reducer-detecta-caput-absoluto.test.ts` (7 cenários: parser, controle "art. 2º", "caput do art. 2º", sem º, misto, composto) e verificar que, sem a correção, os 4 cenários de caput falham e os 3 de controle passam
- [x] 1.2 Acrescentar cenários: caixa ("CAPUT DO ART. 2º"), artigo inexistente ("caput do art. 9º" não cria remissão), "caput do art. 2º" com artigo único, e "caput deste artigo" ainda resolvendo para o caput; verificar que passam ou falham pelo motivo esperado

## 2. Correção

- [x] 2.1 Em `detectarReferenciasAbsolutas` (`adicionaRemissaoInterna.ts`), resolver o trecho exato `caput do art. N` para `artigo.caput`, sem passar pelo parser; verificar que o arquivo do grupo 1 passa por inteiro
- [x] 2.2 Rodar `adicionaRemissaoInterna`/`remissao` existentes (`test/redux/remissao/`, `test/model/remissao/`) e verificar que nenhuma falha nova aparece

## 3. Renumeração

- [x] 3.1 Teste unitário em `sincronizarRemissoes`: remissão detectada por "caput do art. 2º" vira "caput do art. 3º" quando um artigo é inserido antes; verificar que passa sem alterar `src/`

## 4. E2E (Cypress)

- [x] 4.1 Consultar `docs/guia-cypress.md` (digitação, `digitarTextoRemissao`, `dispararDeteccaoRemissao`, invariantes j-m) e registrar a viabilidade
- [x] 4.2 Novo caso em `cypress/e2e/remissao-interna/grupo-l-caput-undo.cy.ts`: digitar "caput do art. 2º", sair da linha, verificar que o link foi criado para o caput; manter a fixture `teste_remissao_caput.json` nos casos existentes; rodar o spec do grupo L e verificar que passa
- [x] 4.3 (não aplicável: o caso digitado foi viável, via `digitarTextoRemissao` + `dispararDeteccaoRemissao`) Se o caso digitado não for viável no Cypress, registrar a decisão e cobrir o mesmo risco por teste de integração, sem omitir em silêncio

## 5. Spec e regressão

- [ ] 5.1 Validar a change (`openspec validate 2026-09-30-c02-detectar-remissao-absoluta-caput --strict`) e verificar que não há erros
- [ ] 5.2 Rodar `npm test` completo (Node 22), incluindo o round-trip com corpus real `buildJsonixFromProjetoNorma.integracao.test.ts`, e verificar que a suíte passa
- [ ] 5.3 Rodar `npm run lint` e verificar que não há erros nos arquivos alterados
