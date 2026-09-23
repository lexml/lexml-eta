## 1. Testes de caracterização (falham antes da correção)

- [x] 1.1 Criar `test/redux/remissao/reducer-atualiza-remissao-mover.test.ts` (seguindo o padrão de `reducer-atualiza-remissao-renumeracao.test.ts`) com casos de mover para cima e para baixo: remissão para o dispositivo movido, para descendente do movido, para o caput do artigo movido, para o irmão deslocado e remissão contida no dispositivo movido; verificar que os casos de destino/origem movidos falham hoje (evidência do bug) e registrar a saída
- [x] 1.2 Adicionar ao mesmo arquivo os casos de artigo movido para outro agrupador mantendo o número (D2), undo/redo do movimento e save após mover (link salvo apontando para o destino correto, não como excluído — ver padrão de `reducer-save-remissao-pos-renumeracao.test.ts`); verificar que falham hoje

> Evidência (23/09/2026, antes da correção): 10 falhas, 1 pulado. O destino movido fica com o id antigo; o irmão deslocado não é atualizado; o inciso do artigo movido deixa de ser resolvível; o registry da origem movida continua sob o uuid antigo; o save após mover grava `href="art3"` (destino tratado como excluído).

## 2. Identidade estável por `uuid2` no registry

- [x] 2.1 Adicionar `targetUuid2?`/`sourceUuid2?` a `RemissaoInternaValue` (`src/model/remissao/remissao.ts`) e verificar `npm run build` sem erros
- [x] 2.2 Implementar o pré-passo de preenchimento de `uuid2` (D5) no `elementoReducer`, antes do `switch`, restrito a `ACOES_ESTRUTURAIS`; teste unitário: entrada criada sem `uuid2` recebe os dois valores antes de uma ação estrutural e não é tocada em ação não estrutural
- [x] 2.3 Em `sincronizarEntrada`, fallback por `uuid2` — via busca local baseada em `percorreHierarquiaDispositivos`, não `findDispositivoByUuid2` (D1) — para destino e origem com reancoragem de `targetUuid`/`sourceUuid`, preenchimento de `uuid2` ausente, e reancoragem mesmo quando o id textual não mudou (D1, D2); verificar com testes unitários de `sincronizarRemissoes`, incluindo destino em caput e em inciso/parágrafo de artigo com bloco de alteração, e com um caso novo em `reducer-atualiza-remissao-mover.test.ts`: artigo com alteração movido com remissão para um inciso ou parágrafo próprio dele (se a estrutura for inviável no unitário, registrar e avisar antes de reduzir o caso)
- [x] 2.4 Em `aplicarTextoNovo`, reescrever também `href="#lxEtaId{uuid}"` no texto da origem (D4); verificar com teste unitário de texto HTML com `href` obsoleto

> Nota de implementação (2.3/2.4): o preenchimento de `uuid2` ausente em `sincronizarEntrada` é in-place, preservando a identidade do objeto quando o `uuid` não muda (contrato já coberto por `sincronizarRemissoesComEstadoAtual.test`). O `href` é reescrito num passo próprio de `sincronizarEntrada`, sempre que o `targetUuid` é reancorado, e não dentro de `aplicarTextoNovo`: assim cobre também o caso D2, em que o id textual não muda e `aplicarTextoNovo` nem é chamado. O caso do artigo com alteração movido está em `reducer-atualiza-remissao-mover.test.ts` e passa a valer na 3.2.

## 3. Pipeline de sincronização

- [x] 3.1 Em `sincronizarRemissoesComEstadoAtual`/`sincronizarRemissoesPosAcao`, gravar entradas sob a chave do `sourceUuid` reancorado e emitir `AtualizaRemissaoInterna` para o `uuid` novo, considerando troca de chave na detecção de mudança (D3); verificar com teste unitário
- [x] 3.2 Incluir `MOVER_ELEMENTO_ACIMA`, `MOVER_ELEMENTO_ABAIXO` e `REJEITAR_REVISAO` em `ACOES_ESTRUTURAIS` (D6); verificar que todos os testes das tasks 1.1 e 1.2 passam (exceto os casos de undo/redo com alvo no caput, fora do escopo — marcar como pendentes com referência a `docs/sessao/PROMPT_BUG_CAPUT_UNDO.md`)

> Nota de implementação (grupo 3): a troca de chave também leva as entradas inválidas da mesma origem; para isso, o passo D5 grava o `sourceUuid2` delas (o `targetUuid2` continua só para as válidas). As resoluções por `uuid` e `uuid2` da c01 usam buscas locais (`buscarDispositivoPorUuid`/`buscarDispositivoPorUuid2`), e não `findDispositivoByUuid`, que não encontra incisos e parágrafos próprios de artigo com bloco de alteração (`docs/sessao/ACHADO_GETDISPOSITIVO_ARTIGO_COM_ALTERACAO.md`). Pela mesma lacuna em `buildListaDispositivos`, o mover não reconstrói os ids desses parágrafos. O caso "o texto acompanha a nova numeração" desse cenário ficou pendente (`it.skip`), com referência ao achado. Suíte completa em lotes: só falham os 4 casos `[TEMP]` da c02, que já falhavam antes.

## 4. Repintura no editor

- [x] 4.1 Em `renderizarRemissoesDoState` (`moduloRemissao.ts`), reformatar link existente também quando o `href` divergir do `targetUuid` da entrada (D4); verificar pelo E2E da task 6.1 (caso de artigo que troca de agrupador mantendo o número) ou por inspeção manual do `href` após mover

> Nota de implementação (4.1): a divergência de `href` só é considerada quando a entrada tem `targetLexmlId`, preservando a guarda existente contra entradas incompletas. Coberta por teste unitário em `moduloRemissao.test.ts`; a verificação no editor real é o CT-K-04 da 6.1.

## 5. Rejeição de revisão de movimentação

- [ ] 5.1 Adicionar ao arquivo da task 1.1 casos em modo revisão: mover atualiza remissões sem gerar revisão própria; rejeitar a movimentação restaura texto/destino, mantém o registry válido e não emite `RemissaoInvalidada` nem mensagem de remissão inválida; verificar que o caso de rejeição falha hoje
- [ ] 5.2 Implementar o sinalizador de supressão de eventos de remissão em `removeElemento` e enviá-lo em `rejeitaInclusao` apenas para revisão de movimentação (D7); verificar que os testes da task 5.1 passam (exceto rejeição com alvo no caput, marcada como pendente com referência a `docs/sessao/PROMPT_BUG_CAPUT_UNDO.md`) e que `reducer-invalida-restaura-remissao.test.ts` continua passando

## 6. E2E e regressão

- [ ] 6.1 Criar `cypress/e2e/remissao-interna/grupo-k-mover-dispositivo.cy.ts` (consultar `docs/guia-cypress.md` antes; não há helper de mover em `cypress/support/` — criar um ou acionar pelo menu de contexto) com: CT-K-01 mover o destino atualiza texto e link; CT-K-02 mover a origem mantém o link funcional (popup abre e navega para o destino); CT-K-03 undo do movimento restaura o texto; CT-K-04 artigo movido para outro agrupador mantendo o número tem o `href` do link atualizado (verificação da 4.1); verificar com `npm run cy:run:local` restrito ao spec. Se algum caso se mostrar inviável, registrar a decisão aqui e cobrir o risco com teste unitário equivalente
- [ ] 6.2 Rodar `npm test` completo e as suítes E2E de remissão interna (`grupo-g-atualizacao`, `grupo-h-referencia-enxuta`, `grupo-j-deteccao-blur`, `grupo-i-proposicao-grande`) e verificar ausência de regressões

## 7. Documentação

- [ ] 7.1 Atualizar `docs/referencia/REMISSAO_INTERNA.md` e `docs/guias/TREINAMENTO_REMISSAO_INTERNA.md` com o comportamento ao mover e ao rejeitar revisão de movimentação, e o invariante de identidade por `uuid2`; verificar por leitura que as seções de atualização por renumeração citam mover
