# Tasks

## 1. Campo "Data": padrão "Não informar" e ordem das opções

- [x] 1.1 Em `data.component.ts`, exibir o radio "Não informar" antes do radio da data e reescrever a regra CSS `sl-radio:first-child` para mirar o radio da data por classe; verificar com teste de componente que "Não informar" vem antes e que o layout não quebra.
- [x] 1.2 Em `resetaProposicao` (`lexml-eta.component.ts`), zerar `dataUltimaModificacao` do `Proposicao` padrão para que documento novo nasça com "Não informar"; verificar com teste de componente que, em documento novo, nos modos normal e anexo, `#no-date` está marcado e `getProposicao().dataUltimaModificacao` é vazio.
- [x] 1.3 Verificar que uma proposição recebida do host em `params.proposicao` mantém a data que traz (teste de componente).

## 2. Modo anexo de parecer sem tratamento especial de data, local e autoria

- [x] 2.1 Em `render`, remover o `display: none` do bloco de data e autoria e usar sempre o rótulo "Destino, Data, Autoria e Impressão"; verificar com teste de componente que, com `anexoParecer`, `lexml-eta-data` e `lexml-eta-autoria` estão visíveis e que a aba "Justificação" e a aba "Notas" continuam ocultas.
- [x] 2.2 Em `getDocumentoArticulado`, remover o ramo `anexoParecer ? {}`; verificar com teste de componente (`documentoArticulado.component.test.ts`) que, no anexo, o documento salvo registra local, data e autoria e gera `ParteFinal` com `LocalDataFecho` e `AssinaturaTexto`, e que sem data e sem parlamentar sai só o local seguido de vírgula.
- [x] 2.3 Em `abrirDocumentoArticulado` e `setProposicao`, remover o forçamento da data a `''` no anexo; verificar com teste de componente que a data do arquivo é aplicada ao campo "Data" no anexo e que salvar e reabrir preserva local, data e autoria.
- [x] 2.4 Em `getProposicao`, preencher `dataUltimaModificacao` também no anexo, e em `removerDadosNaoAplicaveisAoAnexoParecer` parar de apagar `local` e `autoria` (manter a remoção de `justificativa`, `justificativaAntesRevisao` e `notasRodape`); verificar com teste de componente (`lexml-eta-anexo-parecer.test.ts`) que `local`, `autoria` e `dataUltimaModificacao` são entregues e que os três campos de justificação continuam ausentes.
- [x] 2.5 Ajustar os testes existentes que afirmam "sem data/autoria/local" no anexo (`lexml-eta-anexo-parecer.test.ts` e as linhas com `anexoParecer = true` em `documentoArticulado.component.test.ts` e `lexml-eta.component.test.ts`); verificar com `npm test` sem falhas nesses arquivos.

## 3. Teste E2E (Cypress)

- [x] 3.1 Avaliada a viabilidade à luz de `docs/guia-cypress.md`: é viável, porque o app de demonstração tem o checkbox "Anexo de parecer" (aplicado a `lexmlEtaConfig.anexoParecer` antes de abrir) e o `#fileUpload` abre arquivos pela UI. Criar o spec `cypress/e2e/documento-articulado/anexo-parecer-data-fecho.cy.ts`, com as fixtures de `demo/doc` geradas por `criarDocumentoArticulado`, cobrindo: (a) campo "Data" com "Não informar" por padrão e antes da opção de data; (b) no modo anexo, abrir arquivo com data e ver a data no campo; (c) no modo anexo, abas "Justificação" e "Notas" ausentes e bloco de data e autoria visível. Verificar com `npm run cy:run:local` passando no spec novo.
- [x] 3.2 Registrar no próprio spec que o salvar via download real do navegador não é coberto em E2E (sem precedente de infraestrutura de download no projeto) e que esse lado fica coberto pelos testes de componente da tarefa 2.2.

## 4. Documentação

- [ ] 4.1 Atualizar `docs/api-componente-lexml-eta.md`: a descrição de `anexoParecer` (seção 5), os campos removidos de `getProposicao()` no anexo (seção 4.2) e o padrão do campo "Data"; verificar relendo as seções contra o código final.
- [ ] 4.2 Rodar `openspec validate 2026-10-19-c01-anexo-parecer-fecho-data-assinatura` e confirmar que passa.

## Workflow follow-up

- Avisar o mantenedor do `lexeditweb-editor` de que `getProposicao()` no modo anexo de parecer passa a incluir `local`, `autoria` e `dataUltimaModificacao`.
- Arquivar a change depois da validação e da revisão do usuário.
