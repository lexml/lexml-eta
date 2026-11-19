# Tasks

## 1. Ícones e regras do editor

- [x] 1.1 Copiar `chat-left-text.svg` do lexml-emenda para `assets/icons/` e acrescentar `sl-tab[panel='comentarios'] sl-icon { transform: translateY(2px) }` em `lexml-eta.component.ts`. Verificação: `npm start` exibe o ícone na aba "Comentários", alinhado ao das outras abas.
- [x] 1.2 Copiar a regra `.ql-editor del comentario.comentario-selecionado` do lexml-emenda para `editor-texto-rico.css.ts`. Verificação: no app, um trecho comentado dentro de uma exclusão em revisão fica amarelo escuro com o cursor e mantém o traço vermelho (cenário "Cursor no trecho comentado dentro de exclusão").

## 2. Aba "Comentários": markup e CSS

- [x] 2.1 Alinhar o markup de `render`/`renderSequencia`/`renderComentario` de `comentarios.component.ts` ao do lexml-emenda. Entram: o container da ordenação, os spans do trecho, a seta em CSS no "Responder" (sem `sl-icon name="reply"`), o selo de origem com a classe `--justificativa` e os modificadores `--excluir`. Verificação: os testes de `test/components/comentarios/comentarios.component.test.ts` passam com os seletores atualizados.
- [x] 2.2 Substituir as regras da aba em `comentarios.css.ts` pelas do lexml-emenda, valor por valor (painel, cabeçalho, ordenação, lista, card, selecionado, foco, topo, origem, ações, seta, trecho, comentário, autor, data, texto e ações do comentário), e retirar as regras que só o eta tem (design, decisão 1). Verificação: com o app e o demo do lexml-emenda lado a lado, na mesma largura, as medidas do DevTools (padding, margin, gap, fonte, cores) do card, do trecho e do comentário batem.

## 3. Modais: markup, CSS e textos

- [x] 3.1 Alinhar o markup dos modais de adicionar, responder e editar ao do lexml-emenda: grupo do trecho com os spans, `__campo` e rodapé em `comentario-dialog__footer`. Manter os ids usados pelos testes. Verificação: os testes de componente do modal passam.
- [x] 3.2 Alinhar a confirmação de exclusão: bloco `comentario-confirmacao` com o ícone de lixeira e os textos do lexml-emenda, classe `comentario-dialog--confirmacao`. Verificação: um teste de componente confere os dois avisos (cenários "Aviso da confirmação").
- [x] 3.3 Substituir as regras dos modais em `comentarios.css.ts` pelas do lexml-emenda (`comentario-dialog::part(...)`, `comentario-modal__*`, `comentario-confirmacao*`, rodapé). Verificação: comparação lado a lado no DevTools, como em 2.2, dos três modais.

## 4. Seleção e rolagem

- [x] 4.1 Implementar a rolagem até a sequência no painel visível, com o card a 25% da altura, rolagem suave e novas tentativas em rAF/80ms/200ms (design, decisão 6), no lugar do `scrollIntoView({ block: 'nearest' })`. Verificação: um teste de componente com lista rolável confere que o card fica visível depois da rolagem.
- [x] 4.2 No componente raiz, limpar a sequência atual e o destaque ao exibir outra aba (esquerda, ou direita diferente de "Comentários"), com a flag que preserva a seleção feita pelo clique na sequência, e rolar até a sequência atual ao exibir "Comentários" (design, decisão 7). Verificação: testes em `test/componente/lexml-eta/comentarios.component.test.ts` para os cenários de "Sequência atual ao trocar de aba" e "Voltar à aba de comentários".
- [x] 4.3 Depois de criar um comentário, posicionar o cursor no trecho e rolar até a nova sequência (design, decisão 8). Verificação: teste de componente do cenário "Criar comentário com muitas sequências".

## 5. Telas pequenas

- [x] 5.1 No `editor-texto-rico`, renderizar o botão "Comentários" (`.comentarios-mobile-toolbar`) só na justificação, emitindo `abrir-modal-lista-comentarios`, e copiar as media queries de 992px e 640px do lexml-emenda. Verificação: teste de componente de que o botão existe só com comentários e emite o evento; no app, o botão aparece em 900px e some em 1280px.
- [x] 5.2 Criar em `lexml-eta-comentarios` o modal da lista (`comentario-dialog--lista`, título com ícone, "Fechar") e o método `abrirModalLista()`. No componente raiz, decidir entre aba e modal pela largura (≤ 992px) ao criar, ao clicar no ícone do trecho e pelo botão, e fechar o modal ao selecionar uma sequência. Verificação: testes de componente dos cenários "Ícone do trecho em tela pequena", "Criar comentário em tela pequena" e "Selecionar sequência no modal".
- [x] 5.3 Acrescentar `--min: 100%; --max: 100%` ao `@media (max-width: 768px)` do `sl-split-panel` e conferir no app, a 700px, que o painel da direita não aparece. Se continuar aparecendo, investigar e corrigir a causa antes de fechar a task. Verificação: no app, com a janela a 700px, o painel da direita não é exibido e o botão "Comentários" abre a lista.

## 6. E2E e documentação

- [x] 6.1 Atualizar `cypress/e2e/comentarios/comentarios-justificacao.cy.ts` com os seletores novos e acrescentar casos para: o aviso da confirmação, a limpeza da seleção ao trocar para "Notas", e, com `cy.viewport(900, 800)`, o botão "Comentários" abrindo o modal e a seleção no modal fechando-o (consultar `docs/guia-cypress.md` sobre os modais no `body` e o Shadow DOM). A comparação visual dos espaçamentos não tem como ser coberta por E2E e fica nas verificações lado a lado de 2.2 e 3.3. Verificação: `npm run cy:run:local -- --spec cypress/e2e/comentarios/comentarios-justificacao.cy.ts` passa.
- [x] 6.2 Rodar `npm test` e o lint só nos arquivos alterados. Atualizar o item 24 do `CLAUDE.md` (padrão visual do lexml-emenda, lista duplicada aba/modal, limiar de 992px) e o `docs/sessao/TODO.md`. Verificação: suíte verde, lint sem erros nos arquivos tocados e documentação atualizada.
