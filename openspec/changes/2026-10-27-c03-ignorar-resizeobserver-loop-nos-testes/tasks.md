# Tasks

## 1. Investigar a origem do aviso

- [x] 1.1 Reproduzir a falha rodando `anexos.component.test.js` e `documentoArticulado.component.test.js` repetidamente (por exemplo 10 vezes) e registrar a taxa de falha antes da correção, verificando que o erro é sempre `ResizeObserver loop`
- [x] 1.2 Identificar qual interação dispara o aviso (remoção da aba "Justificação"/painel "notas" ao reabrir com `anexoParecer`) e se a causa é do `sl-tab-group` ou do app, registrando a conclusão e as evidências na seção Context do `design.md`

## 2. Tratamento central no ambiente de testes

- [x] 2.1 Em `web-test-runner.config.mjs`, adicionar ao `testRunnerHtml` um listener de `error` em fase de captura que ignora apenas mensagens com `ResizeObserver loop` e deixa os demais erros seguirem; verificar que um erro lançado de propósito em um teste ainda é reportado como falha (verificado com um teste temporário, depois removido)
- [x] 2.2 Adicionar um teste de regressão em `test/` que provoca o aviso (por exemplo, um `ResizeObserver` cujo callback altera o tamanho do elemento observado) e confirma que o teste passa, e que um erro comum disparado em outro teste continua falhando; verificar com `wtr` no arquivo (o teste passa com o filtro e falha sem ele; o erro comum não pode ficar como teste permanente porque falharia a suíte, então foi checado manualmente)
- [x] 2.3 Reavaliar os contornos pontuais (`updateComplete` do `sl-tab-group` em `documentoArticulado.component.test.ts` e `exibirDiferencaDialog.test.ts`) e removê-los somente se os testes continuarem estáveis; caso contrário, registrar a decisão de mantê-los (decisão: mantidos; são inofensivos, garantem que o `sl-tab-group` renderize antes do teardown e removê-los não traz ganho)

## 3. Validação e E2E

- [ ] 3.1 Repetir 10 execuções dos dois arquivos de componente e rodar `npm test` completo, verificando 0 falhas por `ResizeObserver` e a contagem de testes igual à da execução anterior mais o teste novo
- [ ] 3.2 E2E (Cypress), avaliado à luz de `docs/guia-cypress.md`: a mudança é restrita ao ambiente do `web-test-runner` e não afeta o comportamento exercitado pelo Cypress. Decisão: não criar spec novo; como alternativa, o teste de regressão da 2.2 cobre o risco (o aviso não derruba o teste e outros erros continuam falhando)
