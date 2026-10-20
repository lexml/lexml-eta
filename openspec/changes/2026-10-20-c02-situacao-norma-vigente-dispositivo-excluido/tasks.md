## 1. Salvar

- [ ] 1.1 Coletar a situação (Existente/Novo) dos dispositivos de bloco de alteração dos excluídos em `montaRevisoesArticulacao`, com os ids finais `_<base>-exc<n>`
- [ ] 1.2 Mesclar essa coleta às listas de `lexedit:SituacaoNaNormaVigente` ao compor o metadado
- [ ] 1.3 Testes: excluído com bloco (existente e novo), excluído sem bloco, exclusões em sequência

## 2. Abrir

- [ ] 2.1 Disponibilizar as listas lidas a `reconstroiRevisoes` e aplicar `existeNaNormaAlterada` por id aos dispositivos reconstruídos
- [ ] 2.2 Testes: rejeitar a exclusão restaura o selo e o rótulo; ida e volta salvar-abrir-salvar gera listas iguais

## 3. Integração e E2E

- [ ] 3.1 Cenário no teste de integração com o CLI real (`documentoArticulado.integration.ts`): listas com ids `_…-exc…` sobrevivem à ida e volta
- [ ] 3.2 E2E (Cypress), avaliado à luz de `docs/guia-cypress.md`: abrir fixture com excluído com bloco e situação, rejeitar a exclusão e conferir os selos; se for inviável, registrar a decisão e manter a cobertura de integração

## 4. Fechamento

- [ ] 4.1 Rodar a suíte unitária e o lint; atualizar o `CLAUDE.md` (item sobre metadados do LexEdit)
