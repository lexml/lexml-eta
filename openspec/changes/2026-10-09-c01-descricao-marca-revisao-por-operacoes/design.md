# Design

## Context

Ver proposal.md (Why). Fatos do estado atual, confirmados no código e por um teste de ida e volta com a MPV 905/2019 (artigo 3 movido duas vezes e alterado duas vezes, em modo de revisão):

- **Onde a descrição nasce.** `RevisaoElemento` calcula `descricao` no construtor (`buildDescricaoRevisao`), quando o atributo `revisao` ainda não foi preenchido. O resultado depende só do `actionType` (`mapperActionTypeToDescricao`) ou do `stateType` (`mapperStateTypeToDescricao`): `ElementoIncluido` vira "Dispositivo adicionado", `ElementoModificado` vira "Texto do dispositivo foi alterado", `ElementoRemovido` vira "Dispositivo removido". Movimentação só é reconhecida em `buildDescricaoRevisaoFromStateType` quando `antes.numero !== apos.numero`, e então diz `Dispositivo movido (antes era "<tipo> <rotulo>")`.
- **Quem recalcula depois.** `atualizaRevisao.ts` recalcula a descrição em pontos isolados: ao criar a revisão de movimentação/transformação (antes de a operação ser gravada em `revisao`), ao reaproveitar uma revisão numa nova movimentação, e, desde a change `2026-10-07-c01-revisao-alteracao-rotulo`, na modificação de revisões `ElementoModificado`. Uma revisão `ElementoIncluido` que depois recebe `alterado` **não** tem a descrição atualizada.
- **Resultado na sessão.** O teste mostrou `revisao = "movido;3,alterado"` e descrição `Dispositivo movido (antes era "Artigo Art. 3º")`: a operação `alterado` não aparece.
- **Resultado ao reabrir.** O arquivo traz `movido;3,alterado` e o leitor devolve as duas operações, mas `reconstroiRevisoes.ts#novaRevisao` monta o snapshot `antes` a partir do atual (mesmo número e rótulo); `buildDescricaoRevisaoFromStateType` não vê diferença de número e devolve "Dispositivo adicionado".
- **Quem lê a descrição.** A marca (`eta-blot-revisao.ts`) só a exibe. Dois pontos a comparam literalmente com "Dispositivo removido": `editor.component.ts` e `editarNotaAlteracaoDialog.ts`.
- **O que o arquivo guarda.** Só as operações e seus argumentos (`movido;<posição>`, `transformado;<tipo>`, `alteracaoRotulo;<idOriginal>`) e o texto anterior. O rótulo anterior de um dispositivo movido **não** está no arquivo. O indicador "Novo/Existente" (`existeNaNormaAlterada`) também não: o documento carregado de arquivo não o traz, e o editor só o define quando o usuário informa a norma (ver `test/redux/elemento/reducer/renumera-dispositivo-existente.test.ts`).
- **Quando o rótulo é função da posição.** Em texto de proposição (fora de alteração de norma) o rótulo é sequencial: artigo "Art. nº" ("Art. n." a partir de 10), parágrafo "§ nº", inciso em romano, alínea em letra, item "n.". Em alteração de norma só os filhos de dispositivo "Novo" têm rótulo automático; os demais têm o número informado pelo usuário (com letras, lacunas, linhas pontilhadas entre eles), e `movido;<n>` conta todos os filhos do pai, de qualquer tipo.

## Goals / Non-Goals

**Goals:**
- A descrição da marca nasce de uma só regra, a partir do atributo `revisao`, e é a mesma na sessão e no documento reaberto.
- Operações combinadas aparecem todas na descrição.
- A descrição acompanha qualquer mudança nas operações da revisão.

**Non-Goals:**
- Gravar o rótulo anterior ou o indicador "Novo/Existente" no arquivo (mudaria o formato e o XSD do LexEdit; ver Decisão 3).
- Mudar a descrição de revisões de justificação e de texto livre, que não são de dispositivo.
- O erro de console de `selecionaElemento` relatado separadamente.

## Decisions

### 1. Função única, a partir das operações

`buildDescricaoPorOperacoes(revisao)` em `revisaoUtil.ts` lê `revisao.revisao` (`getOperacoesRevisao`) e devolve o texto. Regras:
- Revisão sem o atributo `revisao` (vinda de `Proposicao.revisoes`) mantém o caminho atual (`actionType`/`stateType`); a função devolve `undefined` e quem chama usa o legado.
- Operação isolada `adicionado`, `excluido` ("Dispositivo removido"), `alterado` e `alteracaoRotulo` (com ou sem `alterado`) mantêm exatamente as descrições de hoje, já cobertas por testes e pela spec `renumeracao-dispositivo`.
- Revisão com `movido` ou `transformado`: "Dispositivo " + trechos na ordem do atributo, ligados por ", " e, no último, " e ": `movido (antes era "<tipo> <rótulo>")` ou, em alteração de norma, `movido (posição original <n>)` (Decisão 3); `transformado (antes era "<tipo>")`, `texto alterado`, `rótulo alterado (rótulo antes era "<rótulo>")` (o parêntese do rótulo some se o rótulo anterior é desconhecido).
- O tipo de `transformado;<tipo>` (minúsculo e sem acento no arquivo) é exibido pela descrição do tipo em `TipoDispositivo` em minúsculas ("alínea"), com o valor cru como reserva.

`buildDescricaoRevisaoElemento` passa a chamar essa função primeiro e cair no mapeamento atual só quando ela devolve `undefined`; o ramo de rótulo que existe hoje nesse ponto é absorvido por ela.

### 2. Recalcular em um só lugar da sessão

Em vez de espalhar chamadas por `processaEventosDeModificacao`, `processaEventosDeMoverOuTransformar` e a reconciliação, `atualizaRevisao` chama, no fim (depois de `state.revisoes.push(...)` e de todas as reconciliações), um laço que reatribui `descricao` para cada revisão de elemento que tenha o atributo. O custo é linear no número de revisões, desprezível. As chamadas pontuais de `buildDescricaoRevisaoFromStateType` e `buildDescricaoRevisaoElemento` em `atualizaRevisao.ts` deixam de ser necessárias e saem. Isso cobre de uma vez a operação acrescentada depois e a operação descartada pela reconciliação.

### 3. Rótulo anterior derivado da posição fora de alteração de norma; posição original dentro dela

Hoje a movimentação diz `(antes era "Artigo Art. 3º")`, usando o rótulo do snapshot `antes`. Ao reabrir, o snapshot `antes` é reconstruído a partir do atual e não tem o rótulo anterior. Para que sessão e reaberto digam o mesmo (spec `descricao-marca-revisao`), a descrição não lê o snapshot: usa só dados que o arquivo guarda (tipo do dispositivo, argumento `<n>` de `movido;<n>` e se o dispositivo está em alteração de norma).

- **Fora de alteração de norma:** o rótulo anterior é derivado da posição `<n>` e do tipo (artigo, parágrafo, inciso, alínea, item), pela formatação de rótulo de cada tipo; `rotuloDoTipo` em `reconstroiRevisoes.ts` já converte inciso, alínea e item, e ganha artigo e parágrafo (sem recorrer a "Parágrafo único", que depende dos irmãos). O texto sai idêntico ao de hoje: `antes era "Artigo Art. 3º"`, com o mesmo `<tipo>` que a sessão usa hoje.
- **Em alteração de norma:** `(posição original <n>)`. A derivada não serve: o rótulo vem do número informado pelo usuário, e a exceção dos filhos de dispositivo "Novo" (automáticos) não pode ser aplicada porque o "Novo/Existente" não está no arquivo; uma heurística pela numeração dos irmãos erraria quando há linhas pontilhadas, que `movido;<n>` também conta. Um rótulo falso no tooltip é pior que a posição.

Alternativas descartadas: gravar o rótulo anterior ou o "Novo/Existente" em `RevisaoArticulacao`/no dispositivo (formato, XSD e contrato com o CLI; possível change futura, que daria rótulo preciso também em alteração de norma); usar a posição em todos os casos (perde o texto de hoje fora de alteração de norma sem necessidade).

### 4. `reconstroiRevisoes` usa a mesma função

`novaRevisao` deixa de ter o ramo próprio (`ElementoIncluido` com `antes` → `buildDescricaoRevisaoFromStateType`; `ElementoModificado` → `buildDescricaoRevisaoElemento`): depois de gravar `revisao.revisao`, chama `buildDescricaoRevisaoElemento`, que delega à função da Decisão 1. A correção do tooltip reaberto sai da mesma regra da sessão, sem lógica duplicada.

## Risks / Trade-offs

- **[Risco] Texto do tooltip muda na movimentação em alteração de norma.** O rótulo anterior real some e entra a posição original. Fora de alteração o texto não muda. Nenhum teste existente verifica o texto atual (busca em `test/` e `cypress/`); registrar no `CLAUDE.md`.
- **[Risco] Rótulo derivado diferente do real fora de alteração de norma.** Vale enquanto a numeração é sequencial por posição; cobrir com testes de ida e volta comparando a descrição da sessão com a reaberta para artigo, parágrafo, inciso, alínea e item, e artigo a partir da décima posição ("Art. 10.").
- **[Risco] Comparações literais.** `"Dispositivo removido"` é comparado em `editor.component.ts` e `editarNotaAlteracaoDialog.ts`; a regra mantém essa string para `excluido`, com teste dedicado.
- **[Risco] Revisões criadas por `UNDO`/`REDO`.** O `actionType` delas aponta para `buildDescricaoRevisaoFromStateType`; como o laço da Decisão 2 sobrescreve a descrição quando há atributo `revisao`, o resultado é o mesmo. Cobrir com um teste de desfazer e refazer da movimentação.
- **[Trade-off] Reatribuir a descrição de todas as revisões a cada ação.** Aceito pela simplicidade e pela garantia de que nunca fica desatualizada.
