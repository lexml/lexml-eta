## Context

Ver proposal.md (Why). Cursor medido no navegador (`getComputedStyle`) em todos os botões das duas barras, desabilitados de fato ou à força:

- Barra do texto articulado: a regra `#lx-eta-box .ql-snow.ql-toolbar button { cursor: pointer }` (`editor.css.ts`, especificidade 1,2,1) vence as regras próprias do estado desabilitado: `lexml-eta-proposicao-editor .btn-remissao-interna:disabled` (`editor.component.ts`, `not-allowed`, 0,2,1) e `#lx-eta-barra-ferramenta .button-comentario-articulacao:disabled` (`editor.css.ts`, `default`, 1,2,0). Resultado: mão nos dois.
- Barra da justificação: o comentário desabilitado já mostra a seta (`.ql-toolbar button.ql-lexml-eta-comentario:disabled`, 0,3,1, vence o `.ql-snow .ql-toolbar button` do Quill, 0,2,1); os demais botões, forçados a desabilitados, mostram a mão. Os `sl-button` de aceitar/rejeitar revisões mostram `not-allowed`, definido no shadow DOM do Shoelace.

## Goals / Non-Goals

**Goals:**
- Um único ponto por barra decide o cursor de todo botão desabilitado.

**Non-Goals:**
- O cursor dos `sl-button` do Shoelace (continua `not-allowed`) e a aparência (opacidade, cor) dos botões desabilitados.
- `renderBotoesParaTratarTodasRevisoes`, que não é chamado.

## Decisions

**1. Regra geral de `:disabled` por barra, mais específica que a da mão.** Na articulação, `#lx-eta-box .ql-snow.ql-toolbar button:disabled` (1,3,1); na justificação, `.ql-snow.ql-toolbar button:disabled` e `.ql-snow .ql-toolbar button:disabled` (0,3,1), restritos ao componente da justificação se o seletor do Quill alcançar outras barras. As regras próprias dos botões de remissão e comentário perdem a linha de `cursor` (que hoje não vale) e mantêm a aparência.
- Alternativa descartada: aumentar a especificidade de cada regra própria. Corrige os dois botões de hoje, mas um botão que passe a ser desabilitado continuaria com a mão.
- Alternativa descartada: `pointer-events: none` no desabilitado. Tira também a dica (`title`), que a barra da justificação exige em todo controle.

## Risks / Trade-offs

- [Outra regra com id ou `!important` sobre `cursor` num botão da barra] → o teste de componente força o estado desabilitado em todos os botões das duas barras e confere o cursor de cada um.
