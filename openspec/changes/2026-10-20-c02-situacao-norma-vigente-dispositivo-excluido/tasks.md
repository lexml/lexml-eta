## 1. Salvar

- [x] 1.1 Coletar a situação (Existente/Novo) dos dispositivos de bloco de alteração dos excluídos em `montaRevisoesArticulacao`, com os ids finais `_<base>-exc<n>`
- [x] 1.2 Mesclar essa coleta às listas de `lexedit:SituacaoNaNormaVigente` ao compor o metadado
- [x] 1.3 Testes: excluído com bloco (existente e novo), excluído sem bloco, exclusões em sequência

## 2. Abrir

- [x] 2.1 Disponibilizar as listas lidas a `reconstroiRevisoes` e aplicar `existeNaNormaAlterada` por id aos dispositivos reconstruídos
- [x] 2.2 Testes: rejeitar a exclusão restaura o selo e o rótulo; ida e volta salvar-abrir-salvar gera listas iguais

## 3. Integração e E2E

- [x] 3.1 Cenário no teste de integração com o CLI real (`documentoArticulado.integration.ts`): listas com ids `_…-exc…` sobrevivem à ida e volta (22 testes passando com o CLI 2.1.0)
- [x] 3.2 E2E (Cypress), avaliado à luz de `docs/guia-cypress.md`: abrir fixture com excluído com bloco e situação, rejeitar a exclusão e conferir os selos (`abertura-revisao-bloco-alteracao.cy.ts`, fixture `demo/doc/teste_revisao_exclusao_bloco_situacao.json` gerada por `criarDocumentoArticulado`)

## 4. Fechamento

- [x] 4.1 Rodar a suíte unitária e o lint; atualizar o `CLAUDE.md` (item sobre metadados do LexEdit)
