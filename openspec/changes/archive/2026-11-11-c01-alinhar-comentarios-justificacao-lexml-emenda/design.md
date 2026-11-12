# Design

## Context

Os comentários da justificação seguem a mesma lógica do lexml-emenda (`moduloComentario`, balão ao fim do trecho, eventos `abrir-modal-comentario` e `comentario-selecionado`). O CSS do editor (`editor-texto-rico.css.ts`) é praticamente igual ao do lexml-emenda. A arquitetura da UI, porém, é outra:

- no lexml-emenda, a aba, os modais e a lógica de seleção e rolagem ficam todos em `lexml-emenda.component.ts`;
- no eta, a aba e os modais ficam num componente próprio, `lexml-eta-comentarios`. Ele não guarda as sequências, devolve as ações por eventos e renderiza os modais num contêiner no `body` (invariante aw do CLAUDE.md).

As divergências levantadas em 11/11/2026 estão em `proposal.md` (What Changes). Os valores de referência estão em `lexml-emenda/src/components/lexml-emenda.component.ts` (CSS embutido no `render` e métodos `renderComentariosEstaticos`, `renderModal*`, `rolarParaSequenciaComentario`, `exibirComentarioAtualNaLista`, `limparComentarioAtual`) e em `lexml-emenda/src/components/editor-texto-rico/editor-texto-rico.css.ts`.

## Goals / Non-Goals

**Goals:**
- Visual da aba e dos modais idêntico ao do lexml-emenda: cores, tamanhos, pesos e espaçamentos.
- Comportamento de seleção, rolagem e telas pequenas igual ao do lexml-emenda.

**Non-Goals:**
- Manter a arquitetura atual do eta: o componente separado e os modais no `body` continuam, sem levar a UI para dentro do componente raiz.
- Tudo o que é da articulação no lexml-emenda (`button-comentario-articulacao`, `blot__opcoes_comentario`, `isComentarioArticulacao`) fica para a change `2026-11-08-c01`.
- Sem mudança no formato do arquivo e na interface com o host.

## Decisions

1. **CSS copiado literalmente do lexml-emenda.** As regras de `.comentarios*`, `.comentario-sequencia*`, `.comentario-item*`, `.comentario-dialog*`, `.comentario-modal*` e `.comentario-confirmacao*` substituem as atuais de `comentarios.css.ts`, com os mesmos valores. Regras que só o eta tem saem: o `cursor: pointer` do card, o flex com rolagem interna da lista e o `blockquote` amarelo do modal.
   - *Alternativa descartada:* ajustar regra por regra o CSS atual. Era mais fácil deixar diferença escapar, que foi justamente o problema da entrega anterior.
   - Consequência: a rolagem passa a ser do painel. No lexml-emenda, quem rola é a base do `sl-tab-panel`, no shadow DOM.

2. **Markup alinhado ao do lexml-emenda**, mantendo os ids e as classes que os testes do eta já usam (`#dlg-comentario`, `#btn-confirmar-comentario`, etc.).
   - Entram: o `label.comentarios__ordenacao-container`, os spans `__trecho-conteudo`/`__trecho-texto` (aspas e reticências), o `span.comentario-sequencia__seta` no "Responder" (sem `sl-icon name="reply"`), as classes `--excluir`/`--justificativa`, os `div.comentario-modal__grupo`/`__campo`, o `div.comentario-dialog__footer` no rodapé e o bloco `comentario-confirmacao` com o ícone e os textos do lexml-emenda.
   - Os modificadores de classe passam a seguir o lexml-emenda (`comentario-sequencia__acao--excluir`, `comentario-item__acao--excluir`), e as classes `__excluir` do eta saem. `comentario-sequencia__responder` e `comentario-item__editar` ficam só como ganchos de teste, sem CSS, porque o lexml-emenda não tem classe própria para esses botões.

3. **Ícone da aba.** O `chat-left-text.svg` é copiado do lexml-emenda para `assets/icons/`, e entra a regra `sl-tab[panel='comentarios'] sl-icon { transform: translateY(2px) }` no componente raiz.

4. **Modal da lista dentro de `lexml-eta-comentarios`.** Ele usa o mesmo `containerModais` dos outros modais e o mesmo `renderLista()` da aba (classe `comentario-dialog--lista`, título com ícone, botão "Fechar"), e é aberto pelo método público `abrirModalLista()`.
   - A decisão entre aba e modal fica no componente raiz, num `exibirSequenciaAtualNaLista()` equivalente ao `exibirComentarioAtualNaLista` do lexml-emenda: largura até 992px (`TABLET_WIDTH`) abre o modal; acima disso, exibe a aba e rola.
   - Selecionar uma sequência no modal fecha o modal.

5. **Botão de telas pequenas no editor.** O `editor-texto-rico` renderiza `.comentarios-mobile-toolbar` só quando tem comentários, ou seja, na justificação. O botão emite `abrir-modal-lista-comentarios` e as media queries (992px e 640px) são copiadas do lexml-emenda.

6. **Rolagem igual à do lexml-emenda, dentro do componente.** O método `rolarParaSequencia(id)` procura o card no painel visível (a aba ou o modal, porque a lista existe nos dois) e rola o contêiner (base do `sl-tab-panel` ou `.comentarios` do modal) até o card ficar a 25% da altura, com `behavior: 'smooth'`. Ele repete a tentativa em `requestAnimationFrame`, 80ms e 200ms, porque o painel só fica visível depois da troca de aba. Esse método substitui o `scrollIntoView({ block: 'nearest' })` do `updated`.

7. **Limpeza ao trocar de aba no componente raiz.** Os listeners de `sl-tab-show` das duas abas passam a chamar `limparSequenciaAtual()`, que zera `idSequenciaComentarioAtual` e chama `destacarComentario(undefined)`. A exceção é a aba "Comentários" no painel da direita, que rola até a sequência atual. A flag `preservarSequenciaNaTrocaAba`, como no lexml-emenda, evita a limpeza quando é o clique numa sequência que exibe a justificação.

8. **Depois de criar.** No lugar do destaque simples, entra o equivalente a `selecionarComentarioTextoRicoAposCriacao`: `posicionarCursorComentario`, depois a rolagem, repetidos em `requestAnimationFrame` e 80ms, e o modal em telas pequenas.

9. **Painel lateral até 768px.** O `updateLayoutSplitPanel` já é igual ao do lexml-emenda. O que se sabe de diferente é o CSS do `sl-split-panel` (`--min: 100%; --max: 100%` dentro do `@media (max-width: 768px)`), que entra. A primeira task do grupo confirma no navegador, a 700px, se isso basta. Se não bastar, a causa é investigada ali mesmo, antes de seguir.
   - Causa, encontrada na implementação: fora da media query o painel tem `--min: 70%; --max: 85%`, e o `sl-split-panel` limita a posição a essa faixa. Assim, o `position = 100` do modo celular parava em 85% e o painel continuava visível.

10. **Regra que faltava no editor.** `.ql-editor del comentario.comentario-selecionado` é copiada do lexml-emenda.

## Risks / Trade-offs

- [A lista existe duas vezes no DOM (aba e modal), e as buscas por `data-id-sequencia-comentario` podem achar o card errado] → toda busca de card (rolagem, foco no teclado) passa pelo painel visível, como faz o `getPainelComentariosVisivel` do lexml-emenda.
- [O host serve os ícones a partir dos assets do pacote, e um `chat-left-text.svg` ausente lá mantém a aba sem ícone] → o arquivo vai para `assets/icons/`, já copiado por `copy:assets`. Registrar no resumo da change, para quem atualizar o `lexeditweb-editor`.
- [Trocar o CSS e as classes quebra os seletores dos testes existentes] → os testes de componente e o E2E são atualizados no mesmo grupo que muda o markup.
- [Rolagem suave com repetições é difícil de verificar em teste] → o teste de componente confere a posição final depois de esperar a rolagem, e o E2E confere só que o card fica visível.
- [Conflito de delta com a change `2026-11-08-c01`, que modifica outros requisitos de `comentarios`] → esta change modifica só "Destaque do trecho comentado", "Excluir sequência de comentários" e "Excluir comentário", que a outra não toca. Quem arquivar depois precisa conferir.
