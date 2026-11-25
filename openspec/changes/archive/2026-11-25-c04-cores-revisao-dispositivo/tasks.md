## 1. Classificação da revisão

- [x] 1.1 Criar `test/redux/revisao/tipoRevisaoElemento.test.ts`: `getTipoRevisaoElemento` devolve `inclusao` para `adicionado` e `adicionado,alterado`; `alteracao` para `alterado`, `movido;3`, `movido;3,alterado`, `transformado;inciso` e `alteracaoRotulo;art2`; `exclusao` para `excluido` (também com outras operações); sem operações, segue o `stateType` (`ElementoRemovido`, `ElementoIncluido`, `ElementoModificado`). Verificar que falha antes da 1.2.
- [x] 1.2 Em `revisaoUtil.ts`, criar `getTipoRevisaoElemento` com a precedência de `buildDescricaoPorOperacoes`. Verificar com o teste da 1.1.

## 2. Cor na tela

- [x] 2.1 Em `eta-container-table.ts#atualizarAtributoRevisao`, gravar `tipo-revisao` a partir de `getTipoRevisaoElemento` e tirá-lo junto com `em-revisao`; em `editor.css.ts`, colorir a linha, `.texto__rotulo` e `.titulo-dispositivo` por `tipo-revisao` (`green`, `blue`, `red`), com comentário de uma linha sobre a origem das cores.
- [x] 2.2 Criar `cypress/e2e/revisao/cores-revisao.cy.ts`, com o modo de revisão ligado: incluir um artigo dá texto e rótulo verdes (`rgb(0, 128, 0)`), alterar o texto de outro dá azul (`rgb(0, 0, 255)`), excluir um terceiro dá vermelho (`rgb(255, 0, 0)`) e riscado; aceitar ou rejeitar uma dessas revisões devolve as cores normais. Verificar que falha antes da 2.1 (`git stash` do `src`).
- [x] 2.3 No mesmo arquivo, abrir `demo/doc/teste_revisao_descricao_operacoes.json`: os dispositivos movidos e o transformado ficam em azul. Conferir o visual por screenshot (sem guardar a imagem).

## 3. Verificação

- [x] 3.1 Rodar os specs Cypress de `cypress/e2e/revisao/`, comparando com as falhas já conhecidas, e o `npm test` completo, sem falhas.

## 4. Registro

- [x] 4.1 Registrar a #1095 em `docs/sessao/TODO.md`. Verificar com `openspec validate 2026-11-25-c04-cores-revisao-dispositivo` sem erros.
