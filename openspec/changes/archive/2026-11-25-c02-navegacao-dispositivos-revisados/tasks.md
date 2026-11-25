## 1. Habilitação e tooltips

- [x] 1.1 Criar `test/componente/lexml-eta/botoesNavegacaoRevisao.component.test.ts`: com o modo de revisão desligado, os dois botões `.button-navegacao-marca` estão desabilitados, com cursor `default` e cor `rgb(185, 185, 185)`; ligar o modo (`ativarDesativarRevisaoAction`) os habilita e desligar volta a desabilitar; os títulos são "Ir para o próximo dispositivo revisado" e "Ir para o dispositivo revisado anterior". Verificar que falha antes da 1.2.
- [x] 1.2 Em `editor.component.ts`, guardar `emRevisao` num `@state` no início de `stateChanged` e dar `?disabled` aos dois botões a partir dele (comentário de uma linha, só com o porquê); trocar os títulos. Em `editor.css.ts`, incluir os botões de navegação desabilitados (e `:hover`) na regra do "Adicionar comentário" desabilitado. Verificar com o teste da 1.1.

## 2. Posição junto à chave

- [x] 2.1 No mesmo arquivo da 1.1, caso novo: os dois botões ficam num agrupador junto da chave "Marcas de revisão", logo antes dela. Verificar que falha antes da 2.2.
- [x] 2.2 Em `editor.component.ts`, mover os dois botões para um agrupador com a chave, alinhado à direita em `editor.css.ts`. Verificar com o teste da 2.1 e com `cursorBotaoDesabilitado.component.test.ts` (#1098).

## 3. E2E e verificação

- [x] 3.1 Criar `cypress/e2e/revisao/botoes-navegacao-revisao.cy.ts`: depois de `cy.novaProposicao()`, os dois botões estão desabilitados, com cursor de seta e cinza, com os títulos novos, e ficam à direita do "Adicionar comentário", na mesma linha e logo à esquerda da chave; depois de `cy.ativarRevisaoDispositivo()`, ficam habilitados e com a mão. Verificar que falha antes da 1.2 (`git stash` do `src`).
- [x] 3.2 Rodar de novo `cypress/e2e/revisao/navegacao-dispositivos-alterados.cy.ts` (#1096) e `cypress/e2e/edicao/cursor-botao-desabilitado.cy.ts` (#1098), e o `npm test` completo, sem falhas.

## 4. Registro

- [x] 4.1 Registrar a #1097 em `docs/sessao/TODO.md`. Verificar com `openspec validate 2026-11-25-c02-navegacao-dispositivos-revisados` sem erros.
