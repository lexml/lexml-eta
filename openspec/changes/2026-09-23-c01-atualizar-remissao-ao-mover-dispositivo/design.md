## Context

Ver proposal.md — Why. Estado atual relevante:

- **Pipeline de sincronização**: `sincronizarRemissoesPosAcao` roda no pós-processamento de `elementoReducer` apenas para ações em `ACOES_ESTRUTURAIS` (hoje sem `MOVER_ELEMENTO_ACIMA/ABAIXO` e sem `REJEITAR_REVISAO`). Para cada entrada, `sincronizarEntrada` resolve destino e origem por `findDispositivoByUuid(targetUuid/sourceUuid)`; se não encontrar, devolve a entrada intacta.
- **Mover troca a identidade de sessão**: `moveElementoAcima/Abaixo` chamam `resetUuidTodaArvore(atual)` — o dispositivo movido e seus descendentes (exceto o caput, que não está em `filhos`) recebem `uuid` novo. Existe desde 2021 e protege a camada de DOM, que reaproveita linhas por `uuid`.
- **`uuid2`** é um GUID gerado na criação de todo dispositivo (`dispositivoLexmlFactory.ts`), inclusive caput e dispositivos carregados de arquivo. Não é alterado por `resetUuidTodaArvore`, é copiado na recriação do undo/redo (`redodDispositivoExcluido`) e já é usado como identidade estável no fluxo de revisão (`findDispositivoByUuid2`). Não é persistido — é identidade de sessão, como o `uuid`.
- **O `uuid` também vive no HTML do link**: `href="#lxEtaId{targetUuid}"`, tanto no DOM do Quill (gerado por `RemissaoInternaBlot.valueToAttributes`) quanto em `dispositivo.texto` após sincronização. O save (`corrigirLexmlRefsObsoletosNoTexto`) usa esse `href` para localizar o destino atual: um `href` com `uuid` obsoleto faz o save tratar o destino como **excluído**.
- **Rejeição de revisão de movimentação**: `rejeitaInclusao` chama `removeElemento(..., { isRejeitandoRevisao: true })` e aproveita só `.ui.events`. O registry devolvido é descartado (continua válido), mas os eventos `RemissaoInvalidada` e `ElementoValidado` com mensagem de erro chegam ao editor — a tela passa a mostrar a remissão como inválida, divergindo do registry.

## Goals / Non-Goals

**Goals:**
- Resolver destino e origem das entradas do registry por uma identidade que sobreviva a mover, undo/redo e rejeição de revisão, sem alterar os reducers de mover nem a camada de DOM.
- Manter `href`/`data-lexml-ref` do link (DOM e `dispositivo.texto`) coerentes com a identidade reancorada.

**Non-Goals:**
- Preservar o `uuid` no movimento (opção avaliada e descartada — ver Decisões).
- Corrigir a perda de identidade do caput quando o undo recria um artigo (issue à parte).
- Alterar regras de decisão de texto (D4/D6) — paridade total.
- Gerar revisão para a atualização de texto de remissão em modo revisão.

## Decisions

### D1 — Fallback por `uuid2` com reancoragem (em vez de remapear ou preservar `uuid`)

Cada entrada do registry passa a carregar `targetUuid2` e `sourceUuid2`. Em `sincronizarEntrada`, quando `findDispositivoByUuid(targetUuid)` falha, tenta localizar o dispositivo pelo `targetUuid2`; se encontrar, a entrada é **reancorada** (`targetUuid` ← `uuid` atual). Idem para a origem.

A busca por `uuid2` é local ao módulo de remissão, baseada em `percorreHierarquiaDispositivos` (mesmo percurso de `completarRegistroRemissoes`), e **não** usa `findDispositivoByUuid2`/`getDispositivoByUuid2` (`hierarquiaUtil.ts`), que tem duas lacunas: nunca encontra um caput (percorre `filhos`, que exclui o caput) e, em artigo com bloco de alteração, percorre apenas `alteracoes.filhos`, ignorando os incisos e parágrafos próprios do artigo. A função compartilhada fica intocada — é usada pela revisão (`aplicaRevisoes.ts`) e sua correção é tratada à parte (`docs/sessao/ACHADO_BUSCA_UUID2_C02.md`).

Alternativas consideradas:
- **Remapear `uuid` antigo → novo dentro dos reducers de mover** (capturar a subárvore antes/depois do reset): funciona, mas espalha conhecimento do registry por mais dois reducers e exigiria remapeamento reverso no undo. Descartado.
- **Não resetar o `uuid` ao mover**: com o `uuid` preservado, o editor reaproveitaria a linha existente no lugar antigo (guarda `uuidsIncluidosNoLote` + reaproveitamento por tipo em `inserirNovoElementoNoQuill`) — o dispositivo não se moveria visualmente. Exigiria mudar o contrato reducer↔DOM do mover, com a mesma classe de risco da regressão do TAB. Descartado, e não registrado como débito (o reset não é um bug).
- **Fallback por `targetLexmlId`**: após mover, o id textual antigo aponta para outro dispositivo — falso positivo. Descartado.

### D2 — Reancoragem precisa acontecer antes do atalho "nada mudou"

Hoje `sincronizarEntrada` retorna cedo quando `destino.id === entry.targetLexmlId`. Há movimentos que trocam o `uuid` sem trocar o id textual (ex.: último artigo de um Capítulo movido para baixo, para dentro do Capítulo seguinte, mantendo o número). A reancoragem (`targetUuid`/`sourceUuid`) e a correção do `href` no texto da origem devem ocorrer mesmo nesse caminho, e a entrada deve ser considerada "mudou" para emitir `AtualizaRemissaoInterna`.

### D3 — Chave do registry acompanha a origem reancorada

O registry é indexado por `sourceUuid`. `sincronizarRemissoesComEstadoAtual` passa a gravar as entradas sob a chave do `sourceUuid` reancorado, e `sincronizarRemissoesPosAcao` emite `AtualizaRemissaoInterna` para o `uuid` **novo** da origem (é por ele que o editor localiza `#texto__dispositivo{uuid}`). A comparação "antes × depois" para decidir quais origens mudaram deve considerar a troca de chave.

### D4 — `href` reescrito junto com `data-lexml-ref`

- Em `dispositivo.texto` (origem): ao reancorar ou atualizar uma entrada localizada via HTML, `aplicarTextoNovo` também reescreve `href="#lxEtaId{uuid}"` para o `targetUuid` atual. Sem isso, o save interpretaria o destino como excluído.
- No DOM: `renderizarRemissoesDoState` (`moduloRemissao.ts`) hoje só reformata um link existente se texto ou `data-lexml-ref` mudarem. Deve também reformatar quando o `href` do link divergir do `targetUuid` da entrada (caso de D2).

### D5 — Preenchimento de `uuid2` como pré-passo, não em cada ponto de criação

Entradas nascem em muitos lugares (reducer de detecção, bootstrap ao abrir, diálogos de criação manual, blot/módulo do Quill). Em vez de alterar todos, um pré-passo no `elementoReducer` — antes do `switch`, apenas para ações em `ACOES_ESTRUTURAIS` — preenche `targetUuid2`/`sourceUuid2` ausentes resolvendo os `uuid` atuais (ainda válidos nesse momento, pois o reducer ainda não rodou). Complementarmente, `sincronizarEntrada` preenche o `uuid2` quando resolve pelo `uuid` e ele estiver ausente.

Alternativa: gravar `uuid2` em cada ponto de criação — mais explícito, porém com superfície maior e risco de esquecer um ponto novo no futuro. O pré-passo garante a invariante "toda entrada válida tem `uuid2` antes de uma ação estrutural" num único lugar. Custo: mesma ordem do próprio sync (O(entradas × árvore)), só em ações estruturais.

### D6 — `MOVER_ELEMENTO_ACIMA/ABAIXO` e `REJEITAR_REVISAO` em `ACOES_ESTRUTURAIS`

`ACEITAR_REVISAO` fica fora: não altera a estrutura (`aceitaRevisao.ts` não remove, reinsere nem renumera).

### D7 — Rejeição de movimentação não emite invalidação de remissão

`removeElemento` passa a aceitar um sinalizador (ex.: `suprimirInvalidacaoRemissao`) que omite os eventos de remissão (`RemissaoInvalidada` e o `ElementoValidado` com mensagem de remissão inválida). `rejeitaInclusao` o envia apenas quando a revisão é de movimentação (há `elementoAntesRevisao`). Rejeição de uma inclusão pura continua como hoje. A reinclusão feita por `rejeitaExclusao` usa o `uuid2` original e é reancorada por D1 no pós-processamento de `REJEITAR_REVISAO`.

Alternativa: filtrar os eventos no retorno dentro de `rejeitaInclusao` — mais frágil (depende de reconhecer o `ElementoValidado` específico da remissão entre outros). Descartado.

## Risks / Trade-offs

- [`uuid2` ausente em alguma entrada no momento do mover (ex.: entrada criada fora do fluxo previsto)] → pré-passo D5 roda antes do reducer em toda ação estrutural; teste unitário cobre entrada criada sem `uuid2`.
- [Troca de chave do registry quebrar consumidores que guardam `sourceUuid` (popup, ações de excluir/marcar revisão da remissão)] → esses consumidores leem o `uuid` do DOM/estado no momento da ação, após a repintura; E2E cobre abrir o popup de um link contido no dispositivo movido.
- [`href` obsoleto no DOM se a repintura não disparar] → D4 compara `href` explicitamente; teste unitário do save após mover (link salvo apontando para o destino correto, não como excluído).
- [Caput perde a identidade sempre que o artigo é recriado] → undo, redo e rejeição de revisão de movimentação reincluem o artigo por `incluir` → `redodDispositivoExcluido`, que copia `uuid`/`uuid2` de todos os Elementos de `getElementos`, mas o caput não está em `filhos` e `criaDispositivo` gera um novo (novos `uuid` e `uuid2`). Os cenários da spec "Desfazer e refazer o movimento" e "Rejeitar a movimentação do dispositivo referenciado" não são garantidos por esta change quando o alvo é um caput. Demais tipos movíveis não são afetados. Fora do escopo (`docs/sessao/PROMPT_BUG_CAPUT_UNDO.md`); a limitação desaparece quando a correção preservar a identidade do caput na recriação.
- [Custo do pré-passo em documentos grandes] → restrito a ações estruturais, mesma ordem do sync já existente; `grupo-i-proposicao-grande` serve de verificação de regressão.

## Migration Plan

Sem migração: `uuid2` e `targetUuid2`/`sourceUuid2` são estado de sessão, não persistidos; o formato LexML salvo não muda. Rollback = reverter o commit.
