# Tasks

## 1. Documento de modelo limpo no `lexml-eta`

- [x] 1.1 Em `montaDocumentoNovaProposicao.ts`, trocar o `delete valor.metadadoProprietario` (sem efeito) por apagar `valor.metadado.metadadoProprietario` e `valor.projetoNorma.justificacao`; verificar com casos novos em `test/model/documento/montaDocumentoNovaProposicao.test.ts` (modelo com metadados do LexEdit e justificação sai sem os dois)
- [x] 1.2 Em `novaProposicao`, ler o modelo com `lerDocumentoArticulado(…, { verificarCasa: false })`, mantendo a validação da URN informada; verificar em `test/componente/lexml-eta/novaProposicao.component.test.ts` que um modelo com URN da Câmara cria a proposição do Senado com a ementa e a articulação dele
- [x] 1.3 Verificar no mesmo arquivo de teste, com um modelo salvo pelo próprio editor, que a situação na norma vigente, as remissões internas inválidas, a justificação, a autoria, as revisões e os anexos do modelo não chegam ao documento criado (estado, aba Avisos e `getDocumentoArticulado()`); o teste deve falhar sem a correção de 1.1

## 2. Remoção do caminho próprio da importação

- [x] 2.1 No `lexml-eta`, remover `documentoImportado` de `DadosNovaProposicao`, o desvio para `novaProposicaoImportada` e esse método, a notificação e o alerta de anexos; voltar o `abrirDocumentoLido` a não receber `aplicarPadroes`; trocar o bloco `documento importado` do teste de componente pelos casos de 1.2/1.3; verificar com `tsc` e com o teste de componente do `lexml-eta`
- [x] 2.2 Remover as peças que só serviam ao alerta: opções do `alertarInfo` (`alertaUtil.ts`), regra `sl-alert[variant='warning']` (`editor.component.ts`), classe `alerta--botao-centralizado` (`alertas.component.ts`) e `ALERTA_ANEXOS_NAO_RECUPERADOS` (`model/alerta/alerta.ts`); verificar por `grep` que não sobra referência e que os testes que exercitam o `alertarInfo` passam
- [x] 2.3 Na `nova-proposicao`, emitir o documento importado (URL, `.json` e callback) em `texto` e tirar `documentoImportado` de `ResultadoNovaProposicao`/`ResultadoAlteracaoDadosBasicos`; ajustar `novaProposicao.component.test.ts`, `callbacks.component.test.ts` e `tela2b.component.test.ts`; verificar com os testes de `test/componente/nova-proposicao/`
- [x] 2.4 Atualizar `docs/api-componente-lexml-eta.md` (tabela de `novaProposicao`: sai `documentoImportado`, "Documento de modelo" com o que é descartado e sem validar a casa da URN; seção 11: o importado em `texto`) e o item 26 do CLAUDE.md (o importado vai como modelo; o modelo é limpo em `montaDocumentoNovaProposicao`; nada de alerta de anexos); verificar relendo contra os deltas de spec

## 3. Demo e E2E

- [x] 3.1 Em `demoview.ts`, deixar de repassar `documentoImportado` e de aplicar `derivarParaCamara` ao `texto` (a função continua na lista de documentos da Câmara); verificar que `demoview.ts` compila e que a demo cria a proposição na `CD` a partir de outra proposição
- [x] 3.2 Ajustar `cypress/e2e/nova-proposicao/importacao-documento.cy.ts`: o JSON com justificação e anexo cria o documento só com a ementa e a articulação, sem justificação e sem alerta de anexos; o XML segue com a ementa do serviço simulado; conferir que `documento-origem-camara.cy.ts` não depende do que saiu; verificar rodando os specs de `cypress/e2e/nova-proposicao/` contra a demo
- [x] 3.3 Atualizar o roteiro manual local (`teste-manual-importacao/ROTEIRO.md`, fora do git) para o comportamento novo; verificar relendo

## 4. Integração

- [x] 4.1 Rodar `npm test` completo; verificar que todos os lotes passam
- [x] 4.2 Rodar `openspec validate 2026-11-19-c01-modelo-somente-ementa-articulacao --strict`; verificar que a change é válida
