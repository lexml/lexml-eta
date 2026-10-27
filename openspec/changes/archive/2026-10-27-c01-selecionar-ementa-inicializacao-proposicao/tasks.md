# Tasks

## 1. Tratamento defensivo no teclado

- [x] 1.1 Adicionar optional chaining para `this.quill.linhaAtual?.elemento?.bloqueado` e `this.quill.linhaAtual?.tipo === 'Omissis'` em `src/util/eta-quill/eta-keyboard.ts` e verificar com `npm run build`

## 2. Seleção explícita da ementa na inicialização

- [x] 2.1 Invocar `this.quill.marcarLinhaAtual(el)` após `setSelection(..., SILENT)` na rotina assíncrona de foco inicial em `src/components/editor/editor.component.ts` e verificar com `npm run build`
- [x] 2.2 Adicionar teste unitário/componente verificando que a inicialização do editor define `quill.linhaAtual` na ementa e ativa sua borda, verificando com `npm test`

## 3. Teste E2E (Cypress)

- [x] 3.1 Adicionar teste E2E Cypress cobrindo a inicialização de nova proposição com a ementa marcada com `container__elemento--ativo`, garantindo digitação imediata e ausência de erros no console, e verificar com execução do Cypress
