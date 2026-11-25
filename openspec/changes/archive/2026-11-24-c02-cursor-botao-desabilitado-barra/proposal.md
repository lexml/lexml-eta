## Why

Na barra de ferramentas do texto articulado, os botões "Adicionar remissão" e "Adicionar comentário" mostram o cursor de mão (de clique) mesmo desabilitados, o que sugere que o clique faz alguma coisa (issue #1098). Os dois têm regra própria para o estado desabilitado, mas ela perde por especificidade para a regra geral da barra (`#lx-eta-box .ql-snow.ql-toolbar button { cursor: pointer }`).

## What Changes

- Todo botão desabilitado da barra do texto articulado e da barra da justificação mostra a seta comum (`cursor: default`), e não a mão, inclusive os que hoje nunca ficam desabilitados.
- Os botões habilitados continuam com a mão.
- Os botões "Aceitar revisões" e "Rejeitar revisões" da justificação (`sl-button` do Shoelace) continuam com o cursor de proibido do próprio componente.

## Capabilities

### New Capabilities

- `barra-ferramentas-articulacao`: comportamento dos controles da barra de ferramentas do editor do texto articulado.

### Modified Capabilities

- `barra-ferramentas-justificacao`: requisito novo "Botão desabilitado não mostra o cursor de clique".

## Impact

- `src/assets/css/editor.css.ts` e `src/components/editor/editor.component.ts` (estilos da barra do texto articulado) e `src/components/editor-texto-rico/editor-texto-rico.css.ts` (barra da justificação). Só CSS.
- Testes: um teste de componente novo e um E2E novo.
- Fora do escopo: `renderBotoesParaTratarTodasRevisoes` (`editor.component.ts`) não é chamado, e os botões "Aceitar Revisões"/"Rejeitar Revisões" da articulação não aparecem na tela.
