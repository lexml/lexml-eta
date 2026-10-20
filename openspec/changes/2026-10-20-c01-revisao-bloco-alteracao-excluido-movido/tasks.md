## 1. Vínculo entre revisões (pai efetivo)

- [x] 1.1 Criar o auxiliar de pai efetivo do elemento (articulação de alteração sobe para `uuidAlteracao`) e testá-lo
- [x] 1.2 Usar o auxiliar em `identificarRevisaoElementoPai` e `findRevisaoElementoPrincipal`
- [x] 1.3 Usar o auxiliar nas decisões de principal x filho de `atualizaRevisao.ts` (exclusão e inclusão)
- [x] 1.4 Teste de reducer: exclusão de artigo com bloco de alteração gera uma revisão principal, com os dispositivos do bloco associados
- [x] 1.5 Teste de reducer: movimentação de artigo com bloco de alteração gera uma revisão principal; desfazer/refazer e rejeitar restauram o bloco

## 2. Salvar

- [ ] 2.1 Em `criaSubarvoreSolta`, criar filhos de primeiro nível do bloco em `raiz.alteracoes`; garantir ordem pai antes de filho
- [ ] 2.2 Confirmar que ids do bloco excluído seguem o prefixo `_<base>-exc<n>` (ajustar `reescreveIds`/`updateIdDispositivoAndFilhos` se preciso)
- [ ] 2.3 Testes de `montaRevisoesArticulacao`: exclusão com bloco (com § e artigo), exclusões em sequência e movido com bloco

## 3. Abrir

- [ ] 3.1 Em `reconstroiRevisoes`, reconstruir `Alteracao` no excluído e associar os dispositivos do bloco à revisão do excluído
- [ ] 3.2 Tratar o bloco como descendente em `operacaoDoDescendente` (movido/transformado)
- [ ] 3.3 Testes de reconstrução: excluído com bloco, rejeitar restaura o bloco, ida e volta salvar-abrir-salvar, movido reaberto

## 4. E2E (Cypress)

- [ ] 4.1 Avaliar viabilidade à luz de `docs/guia-cypress.md` (salvar por captura de `URL.createObjectURL`, como `titulo-dispositivo.cy.ts`; abrir por `#fileUpload`)
- [ ] 4.2 Spec em `cypress/e2e/revisao/`: criar artigo que altera norma com bloco, ativar revisão, excluir o artigo, salvar, reabrir e conferir uma marca e os dispositivos do bloco; incluir caso de movido
- [ ] 4.3 Se a criação do bloco pela UI não for viável, usar fixture gerada por `criarDocumentoArticulado` (como `demo/doc/teste_revisao_*.json`) e registrar a decisão

## 5. Fechamento

- [ ] 5.1 Rodar a suíte unitária, lint e o E2E novo; corrigir testes que codificavam duas marcas
- [ ] 5.2 Atualizar o `CLAUDE.md` com a regra de pai efetivo (invariante)
