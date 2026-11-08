## 1. Modelo, identificação e ordenação

- [ ] 1.1 Acrescentar `uuid2Dispositivo?` a `SequenciaComentario` e criar a sequência de dispositivo em `comentarioUtil.ts`. Verificar com testes unitários de criação.
- [ ] 1.2 Criar a identificação do dispositivo comentado reaproveitando `textoCanonicoDoDispositivo`, com complemento para ementa, preâmbulo, agrupador, pena e bloco de alteração. Verificar com testes unitários de cada tipo, inclusive após renumerar.
- [ ] 1.3 Acrescentar o local como primeiro critério de `ordenarSequencias` (articulação antes da justificação em "Ordem no texto"; "Mais recentes" sem distinção). Verificar com testes unitários dos cenários de ordenação da spec.

## 2. Aba de comentários

- [ ] 2.1 Exibir o local ("No texto"/"Na justificação") e, para a articulação, a identificação no lugar do trecho, no card e no modal de adicionar. Verificar com testes de componente da aba.
- [ ] 2.2 Exibir a aba também no modo anexo de parecer. Verificar com teste de componente do `LexmlEtaComponent` nos dois modos.

## 3. Editor da articulação

- [ ] 3.1 Botão "Adicionar comentário" na barra do texto articulado, com habilitação e título pelo elemento selecionado (sem `lexmlId`, articulação, omissis, excluído em revisão, já comentado) e evento para o componente raiz. Verificar com testes de componente do editor.
- [ ] 3.2 `EtaBlotOpcoesComentario` por último no contêiner de opções ou de revisão, atualizado pelo conjunto de `uuid2` comentados e na recriação de linhas, com o clique emitindo a seleção. Verificar com testes de componente: ícone depois do de diferenças, linha recriada por transformação e por rejeição de revisão.
- [ ] 3.3 Emitir a seleção do dispositivo comentado sob o cursor e posicionar o cursor no dispositivo a partir do `uuid2`. Verificar com testes de componente.

## 4. Integração no componente raiz

- [ ] 4.1 Adicionar, responder, editar e excluir sequências de dispositivo pelo fluxo existente, com a aba exibida e a sequência destacada ao criar. Verificar com testes de componente do `LexmlEtaComponent` dos cenários de adicionar, indicador e identificação.
- [ ] 4.2 Sincronizar cursor e aba nos dois sentidos para a articulação (destaque, rolagem e seleção pela aba exibindo a aba "Texto"). Verificar com testes de componente.
- [ ] 4.3 Reconciliar as sequências depois de lotes com `ElementoRemovido` ou `RevisaoAceita`, tratando como vivo o `uuid2` presente na articulação ou numa revisão de exclusão pendente, com o conjunto de `uuid2` descartados zerado em `descartarDocumentoAtual`. Verificar com testes de componente: excluir o dispositivo e o pai, desfazer, excluir em revisão (inclusive pai com filho comentado), aceitar e rejeitar, transformar artigo em parágrafo, alerta e pendência.

## 5. Teste E2E (Cypress)

- [ ] 5.1 Criar `cypress/e2e/comentarios/comentarios-articulacao.cy.ts` (com `export {};`): comentar um dispositivo pela barra, conferir o ícone e a sequência ("No texto" e a identificação), renumerar e conferir a identificação, clicar no ícone, excluir o dispositivo e desfazer sem a sequência voltar. Seguir `docs/guia-cypress.md` (marcar a linha com `getOpcoesDeMenuDoDispositivo`, clique em `sl-button` por `dispatchEvent`). Verificar com `npx cypress run --env envName=local --spec` no arquivo novo, só com autorização do usuário.

## 6. Documentação e fechamento

- [ ] 6.1 Registrar no `CLAUDE.md` (item 24) a âncora por `uuid2`, a reconciliação com a articulação e o conjunto de descartados.
- [ ] 6.2 Rodar `npm test` completo e o lint só nos arquivos alterados, sem regressão, e `openspec validate 2026-11-08-c01-comentarios-articulacao --strict` sem erros.
