## 1. Cursor de botão desabilitado

- [x] 1.1 Criar `test/componente/lexml-eta/cursorBotaoDesabilitado.component.test.ts`, abrindo o `lexml-eta` com `novoDocumentoArticulado()`: em cada barra (texto articulado, `#lx-eta-barra-ferramenta`; justificação, `.ql-toolbar` do `lexml-eta-editor-texto-rico`), todo `button` desabilitado (os que já estão e os demais, desabilitados no teste e restaurados depois) tem `getComputedStyle(...).cursor === 'default'`, e um botão habilitado continua com `pointer`; os `sl-button` de aceitar/rejeitar revisões da justificação continuam com `not-allowed` no `[part="base"]`. Verificar que os casos da barra do texto articulado e dos botões forçados da justificação falham antes da 1.2.
- [x] 1.2 Acrescentar a regra geral de `:disabled` com `cursor: default` em `editor.css.ts` (barra do texto articulado) e em `editor-texto-rico.css.ts` (barra da justificação), conforme o design, e tirar a linha de `cursor` das regras próprias de `.btn-remissao-interna`/`.btn-remover-remissao` (`editor.component.ts`), `.button-comentario-articulacao` (`editor.css.ts`) e `.ql-lexml-eta-comentario` (`editor-texto-rico.css.ts`), mantendo a aparência. Verificar com o teste da 1.1 e `npm test` completo passando.

## 2. E2E

- [x] 2.1 Criar `cypress/e2e/edicao/cursor-botao-desabilitado.cy.ts`: sem seleção, "Adicionar remissão" (`.btn-remissao-interna`) está desabilitado com cursor `default`; com texto selecionado (seleção nativa), fica habilitado com `pointer`; o "Adicionar comentário" da justificação sem seleção mostra `default`. Verificar com o spec passando e os casos da barra do texto articulado falhando sem a 1.2.

## 3. Registro

- [x] 3.1 Registrar a #1098 em `docs/sessao/TODO.md`. Verificar com `openspec validate 2026-11-24-c02-cursor-botao-desabilitado-barra` sem erros. Ao arquivar, ajustar o Purpose de `barra-ferramentas-justificacao` (hoje só fala de dicas) para incluir o cursor dos botões.
