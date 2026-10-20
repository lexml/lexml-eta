## Context

Ver `proposal.md` - Why. Resumo técnico necessário às decisões, confirmado por teste de reducer e por Cypress em 01/10/2026:

- Mover atribui uuid novo à subárvore movida. O reducer emite `ElementoIncluido` (e `ElementoSelecionado`/`ElementoMarcado`) para o artigo com o novo uuid, montados por `createElemento` **antes** de `sincronizarRemissoesPosAcao` (`elementoReducer.ts`, pós-processamento genérico) rodar.
- `sincronizarRemissoesPosAcao` reescreve o registro de remissões e o `dispositivo.texto` da origem (`origem.texto = aplicarTextoNovo(...)`, mutação in-place em `sincronizarRemissoes.ts`), mas os elementos já empacotados nos eventos continuam com o texto antigo. Só o `AtualizaRemissaoInterna`, criado depois, carrega o texto novo.
- No editor, a linha do artigo movido é recriada a partir do `ElementoIncluido` (texto antigo, sem link). O `AtualizaRemissaoInterna` cai no ramo de criação de `renderizarRemissoesDoState`, que aplica o formato do link na posição `inicio` com o tamanho do `textoRef` novo: o link nasce com os atributos novos sobre o texto antigo (mesmo tamanho, "art. 2º" → "art. 3º"). Quando a origem não é recriada, o link já existe e o ramo "texto mudou" o reescreve, por isso o defeito só aparece com a origem movida.
- Desfazer, refazer e rejeitar revisão passam pelo mesmo `sincronizarRemissoesPosAcao`; a correção vale para todos.

## Goals / Non-Goals

**Goals:**
- Um único ponto de correção, no reducer, sem alterar o editor.
- Eventos do lote coerentes com o estado sincronizado: o texto enviado ao editor para uma origem é o mesmo texto que ficou no estado.

**Non-Goals:**
- Não altera `moduloRemissao.renderizarRemissoesDoState` nem as regras de atualização de texto (`sincronizarEntrada`).
- Não altera os eventos de remoção (outro uuid) nem o histórico de desfazer/refazer.
- Não trata remissões em origem não recriada, que já funcionam.

## Decisions

**D1. Em `sincronizarRemissoesPosAcao`, depois de atualizar o registro, reconciliar os eventos do lote com o texto atual da origem.** Para cada origem cujo `texto` mudou, os elementos dos eventos `ElementoIncluido`, `ElementoSelecionado` e `ElementoMarcado` com o mesmo `uuid` ganham `conteudo.texto` igual ao `dispositivo.texto` atual. O `AtualizaRemissaoInterna` já nasce com o texto novo e não é tocado.

- A origem é identificada pelo `uuid` resolvido da entrada (já usado para emitir `AtualizaRemissaoInterna`), não pela chave antiga do registro, que muda com o movimento.
- Os elementos são substituídos por cópia (`{ ...el, conteudo: { ...el.conteudo, texto } }`), preservando a imutabilidade dos eventos já publicados no estado anterior.

*Alternativa considerada: tratar no editor* (reescrever o texto no ramo de criação de `renderizarRemissoesDoState` quando o trecho em `inicio` difere do `textoRef`). Descartada: não há o tamanho do texto antigo, só o `textoRef` novo; só é testável por E2E; e edita a linha depois de renderizada.

*Alternativa considerada: emitir os eventos de inclusão depois da sincronização.* Descartada: reordena o pós-processamento de toda ação estrutural, com efeito amplo sobre undo/redo.

*Alternativa considerada: filtrar os eventos de remoção no reducer de mover.* Descartada: já se mostrou que quebra o desfazer (que precisa da lista completa de elementos removidos), ver nota na seção de remissão do `CLAUDE.md` sobre o bug do TAB.

## Risks / Trade-offs

- [O histórico de desfazer guarda os eventos da ação; alterar o texto de um `ElementoIncluido` poderia reconstruir mal um estado anterior] → só os elementos da origem com uuid novo são reescritos, nunca os de remoção; verificar `test/redux/undo`, o grupo K e o CT-M-03 com desfazer/refazer.
- [`ElementoSelecionado`/`ElementoMarcado` podem reescrever o conteúdo de uma linha existente no editor] → o texto novo é o mesmo do estado, então o efeito é idempotente; o E2E cobre a sequência completa mover/desfazer/refazer.
- [Origem com texto HTML (links já embutidos, documento aberto de arquivo) em vez de texto puro] → o texto enviado é o `texto` do estado, na mesma forma já usada pelo evento original; cobrir com caso de fixture carregada no E2E ou unitário.
