# Proposal

## Why

Os comentários da justificação (changes `2026-11-03-c02` e `2026-11-03-c03`, issue #972) foram entregues com a aba e os modais redesenhados, em vez de seguir o padrão já definido no lexml-emenda, onde a funcionalidade nasceu. O teste manual encontrou ícones faltando, cores, tamanhos e espaçamentos diferentes, e comportamentos ausentes, inclusive em telas pequenas. A parte da articulação (`2026-11-08-c01`) vai reaproveitar essa base, então o alinhamento precisa vir antes.

## What Changes

- Ícones: acrescentar o `chat-left-text` (aba "Comentários", hoje sem ícone) e trocar o ícone inexistente do "Responder" pela seta desenhada do lexml-emenda.
- Aba "Comentários": markup e CSS iguais aos do lexml-emenda (painel, cabeçalho, ordenação, card, card selecionado em azul, selo "Na justificação", trecho em uma linha entre aspas com reticências, separadores, autor, data, texto, ações e espaçamentos).
- Modais de adicionar, responder e editar e de confirmação de exclusão: estrutura e CSS do lexml-emenda (cabeçalho e rodapé com borda, título, largura, campos, trecho em uma linha, ícone de lixeira na confirmação) e os textos explicativos da confirmação do lexml-emenda.
- Editor: destaque de trecho comentado selecionado também quando o trecho está dentro de uma exclusão em revisão.
- Comportamento:
  - trocar de aba (exceto para "Comentários") limpa a sequência atual e o destaque;
  - exibir a aba "Comentários" rola a lista até a sequência atual;
  - a rolagem deixa o card a 25% da altura do painel;
  - depois de criar um comentário, o cursor vai para o trecho e a lista rola até a nova sequência.
- Telas pequenas (até 992px de largura): botão "Comentários" na barra da justificação; a lista de comentários passa a ser exibida num modal, no lugar da aba, ao criar, ao clicar no ícone do trecho e pelo botão.
- Painel lateral oculto até 768px de largura, como no lexml-emenda: confirmar no navegador e alinhar o CSS do `sl-split-panel`.

## Capabilities

### New Capabilities

_Nenhuma._

### Modified Capabilities

- `comentarios`: confirmação de exclusão com o texto explicativo do lexml-emenda; destaque do trecho selecionado dentro de exclusão em revisão; limpeza da sequência atual ao trocar de aba; rolagem até a sequência atual ao exibir a aba e depois de criar; lista em modal e botão "Comentários" em telas pequenas.

## Impact

- `src/components/comentarios/comentarios.component.ts` e `comentarios.css.ts` (markup, CSS, modal de lista).
- `src/components/editor-texto-rico/editor-texto-rico.component.ts` e `editor-texto-rico.css.ts` (botão de telas pequenas, regra de `del`).
- `src/components/lexml-eta.component.ts` (troca de aba, rolagem, decisão entre aba e modal, CSS do `sl-split-panel` e do ícone da aba).
- `assets/icons/chat-left-text.svg` (novo, copiado do lexml-emenda).
- Testes de componente de `test/components/comentarios/` e `test/componente/lexml-eta/comentarios.component.test.ts`; E2E `cypress/e2e/comentarios/comentarios-justificacao.cy.ts`.
- Coordenação: a change `2026-11-08-c01-comentarios-articulacao` modifica outros requisitos da mesma capability. Esta change não toca nesses requisitos, e quem arquivar por último precisa conferir o delta.
- Sem impacto no formato do arquivo nem no host.
