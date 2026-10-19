## 1. Confirmação e reprodução

- [x] 1.1 Confirmar com o produto que a cabeça de alteração com rótulo pendente deve ser numerável (opção a do `design.md`, D1) e registrar a resposta no `design.md`; sem essa confirmação, não seguir para a seção 2
- [x] 1.2 Escrever teste unitário que reproduz o conflito: cabeça criada por `adicionaElemento` em artigo com bloco de alteração exibe o alerta de numeração com `fix` e `podeRenumerar` devolve `false` (o teste deve falhar após a correção ser aplicada, confirmando a causa)

## 2. Regra única de renumeração

- [x] 2.1 Extrair o critério de renumeração para uma função sobre o `Dispositivo` e usá-la em `podeRenumerar`, admitindo dispositivo de alteração com rótulo pendente; verificar com testes unitários: cabeça pendente (numerável), cabeça já numerada com `existeNaNormaAlterada` (não numerável), omissis (não numerável), dispositivo fora de alteração (inalterado)
- [x] 2.2 Usar o mesmo critério em `validaNumeracaoDispositivoAlteracao` para decidir `fix`; verificar com testes de validação: alerta com correção quando numerável, alerta sem `fix` quando não numerável
- [x] 2.3 Verificar que `renumeraElemento` aceita a cabeça pendente (rótulo atualizado, `id` e `id` do caput recalculados) e continua recusando número iniciado em zero em alteração; testes de reducer

## 3. Testes E2E (Cypress)

- [ ] 3.1 Avaliar a viabilidade à luz de `docs/guia-cypress.md` (§3 race conditions, §4 menu dinâmico, §7 edição, §9 âncoras) e dos specs de `cypress/e2e/alteracao-norma/`; registrar a decisão em `design.md`. Se for inviável, propor teste de integração equivalente
- [ ] 3.2 Spec E2E em `cypress/e2e/alteracao-norma/`: criar o artigo de alteração, acionar "Corrigir agora" no alerta de numeração da cabeça, informar o número e verificar o rótulo e a ausência do aviso de erro
- [ ] 3.3 Spec E2E: dispositivo de alteração que não pode ser renumerado não exibe "Corrigir agora" no alerta

## 4. Fechamento

- [ ] 4.1 Executar a suíte completa (`npm test`), `npm run lint` e os specs E2E novos; registrar o resultado
- [ ] 4.2 Arquivar a change para mesclar a spec principal e conferir `openspec validate --strict`
