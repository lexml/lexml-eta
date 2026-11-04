## 1. Modelo e regras

- [x] 1.1 Criar `src/model/comentario/comentario.ts` com `SequenciaComentario { id, comentarios }` e `Comentario { usuario: Usuario, data, texto }`, e `comentarioUtil.ts` com: criação de sequência e de comentário (id por `generateUUID`, data ISO com fuso), `isComentarioDoUsuario`, `podeEditar`, `podeExcluir` (autor e mais de um comentário), ordenação ("Ordem no texto" por posição recebida; "Mais recentes" pela data do último comentário, com desempate pela ordem de criação) e formatação dd/mm/aaaa hh:mm. Verificar com testes unitários novos em `test/model/comentario/` (`npm test`).

## 2. Marcação no Quill

- [x] 2.1 Portar `moduloComentario.ts` do `lexml-emenda` para `src/components/editor-texto-rico/` (blot `comentario`, atributo `id-sequencia-comentario`, cópia e colagem sem marcação, consultas por id sobre todos os fragmentos) e registrá-lo em `configure-private-quill.ts`. Verificar com testes de componente: marcar uma seleção, remover, `existe` depois de apagar o trecho, posição inicial, texto do trecho com espaços, colar HTML copiado com marcação sem levar a marcação.
- [x] 2.2 Acrescentar a função que retira as tags `comentario` de um HTML preservando o texto, compartilhada pela colagem e pelo texto entregue ao host. Verificar com teste unitário (tags aninhadas, vários fragmentos, HTML sem marcação inalterado).

## 3. Editor de texto rico

- [ ] 3.1 Acrescentar o botão "Adicionar comentário" à barra de ferramentas (ícone, título e estado habilitado só com seleção sem comentário) e emitir `abrir-modal-comentario` com o trecho e o intervalo. Verificar com testes de componente: desabilitado sem seleção, desabilitado com seleção já comentada, evento emitido com seleção válida.
- [ ] 3.2 Expor a API (`adicionarComentario`, `removerComentario`, `possuiComentario`, `getTextoComentario`, `getIndiceComentario`, `posicionarCursorComentario`, `registrarComentarioRemovido`, `destacarComentario`) e o conjunto de ids removidos aplicado a cada `text-change` e limpo em `setContent`. Verificar com testes de componente, incluindo desfazer depois de remover sem recriar a marcação.
- [ ] 3.3 Destaque do trecho (amarelo claro; amarelo escuro sob o cursor, em todos os fragmentos) e emissão de `comentario-selecionado` na mudança de seleção, mais o CSS. Verificar com testes de componente: classe no trecho sob o cursor, evento com o id, evento sem id ao sair.
- [ ] 3.4 Ícone ao fim do trecho (último fragmento), reposicionado em rolagem, redimensionamento e mudança de texto, que emite `comentario-selecionado` pedindo a abertura da aba; cursor antes e depois do ícone continua dentro e fora do trecho. Verificar com testes de componente (botão criado por sequência, clique emite o evento, ícone some ao remover a sequência).

## 4. Comentário e revisão

- [ ] 4.1 No `moduloRevisao`, botão "Adicionar comentário" no quadro da revisão, oculto quando algum trecho da revisão já está comentado, que seleciona todos os trechos da revisão (sem o texto comum entre eles) e emite `abrir-modal-comentario`. Verificar com testes de componente portados da emenda ("adicionar comentario a partir do tooltip", "nao deveria selecionar texto normal entre fragmentos", "nao deveria exibir botao ... quando revisao ja possuir comentario").
- [ ] 4.2 Preservar a marcação de comentário ao aceitar e rejeitar revisão dentro do trecho e ao excluir em modo de revisão um trecho comentado; CSS de `comentario` com `ins`/`del` (fundo no comentário, traço da exclusão repetido). Verificar com testes de componente (aceitar inclusão, rejeitar exclusão, excluir em revisão) e com os testes de revisão existentes sem regressão.

## 5. Aba e modais

- [ ] 5.1 Criar `lexml-eta-comentarios` (`src/components/comentarios/`): cabeçalho com ordenação, lista vazia, sequência (local, trecho, "Responder", excluir sequência), comentários (autor, data, texto com quebras de linha, "Editar" e "Excluir" conforme 1.1), destaque da sequência atual com rolagem, seleção por clique e setas, e eventos para o componente raiz. Verificar com testes de componente do componente novo.
- [ ] 5.2 Modais de adicionar, editar e responder (trecho na adição, 500 caracteres com contador, "Comentar" desabilitado sem texto) e de confirmação das duas exclusões. Verificar com testes de componente.
- [ ] 5.3 No `lexml-eta.component.ts`: aba "Comentários" antes de "Notas" fora do anexo de parecer, estado das sequências, tratamento dos eventos (criar com o usuário atual, responder, editar, excluir sequência e comentário), sincronização com o editor (remoção da sequência sem marcação a cada mudança de texto, destaque da sequência sob o cursor, abrir a aba ao criar e ao clicar no ícone, posicionar o cursor ao selecionar na aba) e descarte em `descartarDocumentoAtual`. Verificar com testes em `test/componente/lexml-eta/` para cada cenário da spec `comentarios`.

## 6. Alerta, pendência e texto ao host

- [ ] 6.1 Alerta `alerta-global-comentarios` (INFO, pode fechar) reavaliado a cada mudança da lista, e pendência "Remover comentários." em `getPendenciasPreenchimento`. Verificar com testes de componente dos cenários do delta de `pendencias-proposicao`.
- [ ] 6.2 `getProposicao().justificativa` sem as tags `comentario` (função da 2.2), mantendo `_lexmlJustificativa.texto` com a marcação. Verificar com teste de componente.

## 7. Teste E2E (Cypress)

- [ ] 7.1 Criar `cypress/e2e/comentarios/comentarios-justificacao.cy.ts` (com `export {};`): abrir uma proposição, ir à justificação, selecionar um trecho pelo Quill (`quill.setSelection(..., 'user')` via `cy.window()`, `docs/guia-cypress.md`), clicar em "Adicionar comentário", preencher o modal e confirmar (botões `sl-button` por `dispatchEvent(new MouseEvent('click'))`); conferir o destaque, a sequência na aba e o alerta; responder; excluir a sequência e conferir que o destaque e o alerta somem. Verificar com `npm run cy:run:local -- --spec` no arquivo novo.
- [ ] 7.2 Rodar os specs de revisão de texto existentes (`abertura-revisao-texto.cy.ts`, `revisao-texto-destaque.cy.ts` da c01) sem regressão.

## 8. Fechamento

- [ ] 8.1 Rodar `npm test` completo e o lint só nos arquivos alterados, sem regressão.
- [ ] 8.2 Registrar no `CLAUDE.md` (Quirks and Gotchas) o que não é óbvio do código: estado fora do Redux, conjunto de ids removidos e texto ao host sem marcação.
- [ ] 8.3 Rodar `openspec validate 2026-11-03-c02-comentarios-justificacao --strict` sem erros.
