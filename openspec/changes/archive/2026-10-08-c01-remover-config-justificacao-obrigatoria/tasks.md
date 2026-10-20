# Tasks

## 1. Remover a configuração

- [x] 1.1 Remover `justificacaoObrigatoria` de `src/model/lexmlEtaConfig.ts` e a atribuição em `demo/components/demoview.ts`; verificar com `npm run build` sem erros de compilação.
- [x] 1.2 Simplificar `isJustificacaoObrigatoria()` em `lexml-eta.component.ts` para depender só de `!this.anexoParecer`; verificar que a pendência e o alerta global de justificação continuam disparando fora do anexo.
- [x] 1.3 Atualizar `docs/api-componente-lexml-eta.md` (parágrafo de `pendenciasPreenchimento` e linha da tabela de config); verificar com busca por `justificacaoObrigatoria` em `src/`, `demo/` e `docs/` sem ocorrências (fora de `openspec/changes/archive`).

## 2. Testes

- [x] 2.1 Em `lexml-eta.component.test.ts`, remover o teste do default e os casos com a flag `false`; manter os casos que provam a pendência e o alerta com justificação vazia; verificar com `npm test`.
- [x] 2.2 Em `lexml-eta-anexo-parecer.test.ts`, remover a atribuição da flag e manter a asserção de que o anexo não exige justificação; verificar com `npm test`.
- [x] 2.3 E2E (Cypress): avaliar a viabilidade à luz de `docs/guia-cypress.md`. A mudança não cria fluxo de UI novo, então a proposta é cobrir o risco (pendência/alerta fora do anexo, ausência no anexo) pelos testes de componente das tasks 2.1 e 2.2; registrar a decisão aqui e só criar spec Cypress se a avaliação indicar ganho real.
  - Decisão: não criar spec Cypress. Nenhum E2E existente cobre a pendência/alerta de justificação, a mudança só remove uma flag sem criar fluxo de UI, e o risco (pendência e alerta fora do anexo, ausência no anexo) fica coberto pelos testes de componente de 2.1 e 2.2 (22 testes passando nos dois arquivos).

## 3. Verificação final

- [x] 3.1 Rodar `npm run lint` e `npm test` completos e verificar que passam.
  - Fechada por decisão do usuário sem execução completa: `npm run lint` reportou 2365 problemas (2214 erros, em sua maioria corrigíveis com `--fix`, não filtrados por arquivo) e o `npm test` completo foi cancelado. Verificado só: `npm run build` sem erros e os dois arquivos de teste afetados passando (22 testes).
