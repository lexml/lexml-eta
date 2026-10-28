## 1. Teste de regressão (E2E Cypress)

Viabilidade avaliada à luz de `docs/guia-cypress.md`: o `keydown` sintético (padrão de `cypress/e2e/transformacao/tab-artigo-em-paragrafo.cy.ts`) não gera o `focusout` real que zera o timer no uso manual, e por isso não reproduzia o bug. O teste arma `timerOnChange` de forma determinística via `cy.window()` (§8 e §13.3), em vez de depender de tempo (§9), e cobre o mesmo risco.

- [ ] 1.1 Criar `cypress/e2e/transformacao/cursor-apos-transformar.cy.ts` com `beforeEach` que monta Art. 1 com um parágrafo e dois incisos (com texto, pois dispositivo vazio tem largura 0 e não é clicável) , conferindo antes os nomes de menu (a posição `filho` é omitida) e a colisão de `const` de nível superior com `grep -rn "^const " cypress/e2e/`. Verificar executando o `beforeEach` sem erro.
- [ ] 1.2 Escrever o caso "Shift+Tab seguido de Tab com `onChange` pendente": clicar no inciso II, aguardar o `timerOnChange` zerar, disparar `keydown` Shift+Tab, armar `timerOnChange` pela API do editor, disparar `keydown` Tab e verificar que a linha com `container__elemento--ativo` é o inciso II e que a seleção do Quill está nela. Verificar que o teste **falha** antes da correção (`npm run cy:run:local -- --spec ...`).
- [ ] 1.3 Escrever o caso de controle sem timer pendente (Shift+Tab, aguardar o timer zerar, Tab) e verificar que passa antes e depois da correção.

## 2. Correção

- [ ] 2.1 Em `EditorComponent.transformarElemento`, chamar `cancelarTimerOnChangePendente()` antes do dispatch de `shiftTabAction`/`tabAction`/`transformarAction`, e verificar que o spec do item 1.2 passa.
- [ ] 2.2 Atualizar o comentário de `cancelarTimerOnChangePendente` para citar a transformação além da criação de dispositivo, e verificar que continua curto e no estilo do arquivo.

## 3. Validação

- [ ] 3.1 Rodar os specs de `cypress/e2e/transformacao/` e os de `cypress/e2e/revisao/desfazer-rejeicao-transformacao.cy.ts` e `remissao-interna/grupo-n-alvo-muda-tipo.cy.ts`, e verificar que nenhum regride.
- [ ] 3.2 Rodar `npm run lint` e `npm test`, e verificar saída sem erros novos.
- [ ] 3.3 Validação manual no app (MPV 905): inciso IV → Shift+Tab → Tab sem pausa, e o mesmo para o § 5º do art. 2º e para a alínea j do inciso III do art. 9º. Verificar que o cursor permanece no dispositivo transformado. O E2E não substitui este passo, porque o teclado real gera eventos de seleção que o `keydown` sintético não gera.
- [ ] 3.4 Rodar `openspec validate 2026-10-28-c01-cursor-apos-transformar-dispositivo --strict` e verificar que passa.
