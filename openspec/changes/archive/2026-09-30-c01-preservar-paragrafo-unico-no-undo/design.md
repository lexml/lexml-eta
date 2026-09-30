## Context

Ver `proposal.md` - Why. Resumo técnico necessário às decisões:

- `buildId`/`buildHref` (`src/model/lexml/util/idUtil.ts`) só emite o sufixo `1u` quando `informouParagrafoUnico === true`, e a sincronização de remissões deriva o texto do id. A change arquivada `2026-09-22-c01-corrigir-remissao-paragrafo-unico` (#1003) fez `createRotulo` (`numeracaoParagrafo.ts`) gravar no flag a contagem viva de parágrafos, e só ele — mas `createRotulo` só roda dentro de `renumeraFilhos()` do pai.
- Desfazer, refazer e rejeitar revisão recriam dispositivos pelo mesmo caminho: `incluir()` (`undoRedoReducerUtil.ts`), chamado por `undo.ts`, `redo.ts` e `rejeitaRevisao.ts`. Ele recria cada `Elemento` com `redodDispositivoExcluido`, que usa `criaDispositivo` (flag nasce `false`) e copia `id`, número e `rotulo`; depois chama `renumeraFilhos()` **só no pai do primeiro elemento** e `updateIdDispositivoAndFilhos`.
- Isso produz duas falhas opostas, confirmadas pelo teste de caracterização `test/redux/remissao/reducer-undo-remissao-paragrafo-unico.test.ts`:
  - **Pai do primeiro elemento é a articulação** (undo/redo de mover artigo, rejeitar revisão de movimentação): o parágrafo não é renumerado, o flag fica `false`, o rótulo copiado continua "Parágrafo único." e o id sai `par1` — rótulo e id divergem.
  - **Pai do primeiro elemento é o artigo** (undo de remover o parágrafo): `createRotulo` reconta e grava `true` mesmo quando o autor redigiu "§ 1º" — rótulo e id mudam juntos para "único".
- Nos dois casos, a forma correta está disponível: o `rotulo` do `Elemento` registrado.

## Goals / Non-Goals

**Goals:**
- Um único ponto de correção, comum a undo, redo e rejeição de revisão.
- Fidelidade ao estado registrado: a forma "único"/numerada do parágrafo recriado é a que ele tinha quando o `Elemento` foi capturado.

**Non-Goals:**
- Não altera `createRotulo`, `buildId`/`buildHref` nem a regra de contagem ao vivo da #1003 para as demais ações estruturais.
- Não altera "artigo único" (`informouArtigoUnico`), fora de escopo pelo mesmo motivo registrado na #1003.
- Não trata a restauração de remissão ao rejeitar revisão de remoção (ver proposal - Impact).

## Decisions

**D1. Reaplicar a forma registrada em `incluir()`, depois de `pai.renumeraFilhos()` e antes de `updateIdDispositivoAndFilhos`.** Para cada parágrafo recriado: se o seu artigo tem exatamente um parágrafo, o flag passa a `/[uú]nico/i.test(elemento.rotulo)` (mesma regra de `createNumeroFromRotulo`) e o rótulo é regerado a partir do flag ("Parágrafo único." ou "§ 1º"), sem recontagem. Com mais de um parágrafo, prevalece o que `renumeraFilhos`/`createRotulo` já decidiram (ou, se o artigo não foi renumerado, o flag fica `false`).

- Tem que ser depois de `renumeraFilhos`, porque é ele que sobrescreve a forma do autor quando o pai renumerado é o artigo; e antes de `updateIdDispositivoAndFilhos`, para o id sair com o sufixo certo e a sincronização de remissões ler o id certo.
- O rótulo é regerado, não copiado do `Elemento`, para não reaproveitar um número obsoleto (ex.: "§ 2º" registrado num artigo que agora tem um só parágrafo).

*Alternativa considerada: guardar o flag num campo novo do `Elemento`* (padrão da c02 do caput). Descartada: o `rotulo` registrado já carrega a mesma informação, e o campo sozinho não corrige o undo de remover, que ainda precisaria da mesma reaplicação depois de `renumeraFilhos`. Derivar do `rotulo` também funciona com `Elemento`s capturados antes da mudança (histórico e revisões já existentes).

*Alternativa considerada: renumerar o artigo de cada parágrafo recriado.* Descartada: recontar é justamente o que produz a falha do "§ 1º" carregado. A #1003 já mostrou, com corpus real, que a contagem não prevê a forma escolhida pelo autor.

**D2. A trava "exatamente um parágrafo" usa a contagem viva após a recriação.** Evita que um `Elemento` registrado como "único" force essa forma num artigo que, no estado corrente, tem outros parágrafos (ex.: rejeição de uma revisão antiga depois de novos parágrafos). Só nesse caso a contagem decide; com um parágrafo só, a forma registrada decide.

## Risks / Trade-offs

- [Bloco de alteração: `createRotulo` tem ramos distintos para dispositivo de alteração novo e não-novo] → D1 vale para os dois, porque em ambos a forma registrada é a do autor; o teste de caracterização ganha um caso de parágrafo em bloco de alteração se o cenário for reproduzível em reducer.
- [`Elemento` sem `rotulo` (ex.: capturado de forma incompleta)] → sem rótulo, a regra de D1 dá flag `false`, que é o comportamento de hoje; nenhum caso piora.
- [Outros dispositivos recriados pelo mesmo `incluir()` e descendentes do parágrafo (incisos do parágrafo)] → o `updateIdDispositivoAndFilhos` já existente reconstrói seus ids a partir do id do parágrafo, então herdam o sufixo corrigido.
