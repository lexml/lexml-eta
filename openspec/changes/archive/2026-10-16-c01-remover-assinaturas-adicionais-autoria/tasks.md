# Tasks

## 1. Interface e modelo

- [x] 1.1 Remover de `autoria.component.ts` o template `_getAssinaturasAdicionaisTemplate`, sua chamada em `render()` e os tratadores `_atualizarQtdAssinaturasAdicionaisSenadores/Deputados`; verificar que a aba de autoria mostra só parlamentares, "Incluir parlamentar" e o checkbox de partido e UF
- [x] 1.2 Remover `quantidadeAssinaturasAdicionaisSenadores` e `quantidadeAssinaturasAdicionaisDeputados` de `Autoria` em `proposicao.ts`; verificar com `npm run build` sem erros de tipo
- [x] 1.3 Remover de `autoria.css.ts` as regras que ficarem sem uso (`.assinaturas-adicionais .autoria-input`), mantendo o layout do checkbox; verificar por `grep` que nenhum seletor removido ainda é usado

## 2. Testes e fixtures

- [x] 2.1 Retirar as duas propriedades de `test/assets/altera_norma_trava_editor.ts` e `.json`; verificar que os testes que usam esses fixtures seguem passando
- [x] 2.2 Em `test/model/documento/autoriaParlamentar.test.ts`, remover o cenário "assinaturas adicionais ficam em 0" e a propriedade do `gravada(...)` que o exercita; verificar que o restante do arquivo passa
- [x] 2.3 Rodar a suíte unitária (`npm test`) e `npm run lint`; verificar que passam e que `grep -ri "AssinaturasAdicionais" src test demo cypress` não retorna nada
- [x] 2.4 E2E (Cypress): decisão de não criar spec novo, pois a remoção de dois campos não justifica um teste E2E e a ausência foi confirmada pelo usuário executando a aplicação; os specs E2E de autoria existentes (`abertura-autoria-parlamentar.cy.ts`) seguem cobrindo a aba sem os campos

## 3. Documentação

- [x] 3.1 Atualizar `docs/api-componente-lexml-eta.md`: retirar os dois campos do modelo `Autoria` e a armadilha "As quantidades de assinaturas adicionais..."; verificar por `grep` que o termo não aparece mais
- [x] 3.2 Ajustar em `CLAUDE.md` (item 13, autoria de parlamentares) o trecho que diz que as quantidades de assinaturas adicionais voltam a 0 ao abrir; verificar por `grep`

## Workflow follow-up

- Confirmar com quem mantém o `lexeditweb-editor` se há DTO/JSON com esses campos antes de publicar a versão.
- Arquivar a change após a revisão.
