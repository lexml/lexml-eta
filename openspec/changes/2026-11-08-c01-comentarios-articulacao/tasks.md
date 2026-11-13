## 1. Modelo, identificação e ordenação

- [x] 1.1 Acrescentar `uuid2Dispositivo?` a `SequenciaComentario` e criar a sequência de dispositivo em `comentarioUtil.ts`. Verificar com testes unitários de criação.
- [x] 1.2 Criar a identificação do dispositivo comentado reaproveitando `textoCanonicoDoDispositivo`, com complemento para ementa, preâmbulo, agrupador, pena e bloco de alteração, no formato do lexml-emenda ("ementa", "Inciso I do art. 5º citado no art. 2º"). Verificar com testes unitários de cada tipo, inclusive após renumerar.
- [x] 1.3 Acrescentar o local como primeiro critério de `ordenarSequencias` (articulação antes da justificação em "Ordem no texto"; "Mais recentes" sem distinção). Verificar com testes unitários dos cenários de ordenação da spec.

## 2. Aba de comentários

- [x] 2.1 Exibir o local ("No texto", classe `--texto`, ou "Na justificação") e, para a articulação, a identificação no bloco do trecho do card e do modal de adicionar (rótulo "Trecho selecionado"), como no lexml-emenda. Verificar com testes de componente da aba.
- [x] 2.2 Exibir a aba também no modo anexo de parecer. Verificar com teste de componente do `LexmlEtaComponent` nos dois modos.

## 3. Editor da articulação

- [x] 3.1 Botão "Adicionar comentário" na barra do texto articulado, com habilitação e título pelo elemento selecionado (sem `lexmlId`, articulação, omissis, excluído em revisão, já comentado; títulos da spec), evento para o componente raiz e o CSS `.button-comentario-articulacao` do lexml-emenda. Verificar com testes de componente do editor.
- [x] 3.2 `EtaBlotOpcoesComentario` por último no contêiner de opções ou de revisão, atualizado pelo conjunto de `uuid2` comentados e na recriação de linhas, com o clique emitindo a seleção. Linha sem contêiner ganha um `EtaContainerOpcoes` só com o comentário, mantido quando o diff sai, e o clique no blot não move o cursor (`eta-quill.ts`). CSS `.blot__opcoes_comentario` do lexml-emenda. Verificar com testes de componente: ícone depois do de diferenças, linha sem diff, diff que sai com comentário, linha recriada por transformação e por rejeição de revisão.
- [x] 3.3 Emitir a seleção do dispositivo comentado sob o cursor e posicionar o cursor no dispositivo a partir do `uuid2`. Verificar com testes de componente.

- [x] 3.4 Botão "Comentários" nos botões de telas pequenas da barra do texto articulado (`btn-comentarios`), emitindo `abrir-modal-lista-comentarios`, com o CSS do lexml-emenda (`.mobile-button.btn-comentarios sl-icon`, `align-self: center` até 768px). Verificar com teste de componente do editor e, no app, a 700px e a 600px.

## 4. Integração no componente raiz

- [x] 4.1 Adicionar, responder, editar e excluir sequências de dispositivo pelo fluxo existente, com a aba exibida e a sequência destacada ao criar. Verificar com testes de componente do `LexmlEtaComponent` dos cenários de adicionar, indicador e identificação.
- [x] 4.2 Sincronizar cursor e aba nos dois sentidos para a articulação (destaque, rolagem e seleção pela aba exibindo a aba "Texto", sem desfazer a seleção na troca de aba), e abrir o modal da lista até 992px ao criar e ao clicar no ícone do dispositivo. Verificar com testes de componente, inclusive com `TABLET_WIDTH` fixado.
- [x] 4.3 Reconciliar as sequências depois de lotes com `ElementoRemovido` ou `RevisaoAceita`, passando a sequência para o novo `uuid2` quando o lote remove e inclui o mesmo `uuid` (transformação), tratando como vivo o `uuid2` presente na articulação ou numa revisão de exclusão pendente. Desfazer não recria a sequência (sem conjunto de descartados: nada a recria, ver design). Verificar com testes de componente: excluir o dispositivo e o pai, desfazer, excluir em revisão (inclusive pai com filho comentado), aceitar e rejeitar, transformar artigo em parágrafo e parágrafo em artigo (com desfazer), alerta e pendência.

- [x] 4.4 Regressão da justificação com sequências dos dois locais na lista: sincronizar (`comentarios-alterados`), abrir arquivo (filtro por `getIdsComentarios()`), excluir sequência, clicar na sequência e trocar de aba não afetam as sequências da articulação, e vice-versa. Verificar com testes de componente e com os testes de comentários da justificação já existentes passando.

## 5. Teste E2E (Cypress)

- [x] 5.1 Criar `cypress/e2e/comentarios/comentarios-articulacao.cy.ts` (com `export {};`): comentar um dispositivo pela barra, conferir o ícone e a sequência ("No texto" e a identificação), renumerar e conferir a identificação, clicar no ícone, excluir o dispositivo e desfazer sem a sequência voltar; com `cy.viewport(700, 800)`, o botão "Comentários" da barra do texto articulado abre o modal da lista. Seguir `docs/guia-cypress.md` (marcar a linha com `getOpcoesDeMenuDoDispositivo`, clique em `sl-button` por `dispatchEvent`). Verificar com `npx cypress run --env envName=local --spec` no arquivo novo, só com autorização do usuário.

## 6. Documentação e fechamento

- [ ] 6.1 Registrar no `CLAUDE.md` (item 24) a âncora por `uuid2`, a reconciliação com a articulação e a passagem da sequência na transformação.
- [ ] 6.2 Rodar `npm test` completo e o lint só nos arquivos alterados, sem regressão, e `openspec validate 2026-11-08-c01-comentarios-articulacao --strict` sem erros.
