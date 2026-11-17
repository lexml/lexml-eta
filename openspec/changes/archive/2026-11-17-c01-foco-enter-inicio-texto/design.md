# Design

## Context

O Enter chega a `EditorComponent.adicionarElemento` (`editor.component.ts`). Com o cursor no início do texto, ele não divide a linha. Despacha a mesma ação do menu "Adicionar … antes" (`getActionAdicionarAntes`: `adicionarArtigoAntes`, `adicionarParagrafoAntes` etc., `posicao = 'antes'`) com texto vazio para o novo dispositivo.

Hoje o cursor vai para o dispositivo novo por dois caminhos:

1. `adicionaElemento.ts` sempre emite `ElementoMarcado [novo, atual]`, e `marcarLinha` (via `setTimeout(0)`) põe o cursor no início de `elementos[0]`.
2. `inserirNovoElementoNoQuill` seleciona a linha recém-inserida quando a linha atual tem texto. Isso acontece antes de `marcarLinha`, que tem a palavra final.

A ordem de `ElementoMarcado` também é lida pelo histórico:

- `undo.ts` filtra os elementos que ainda existem e marca `[elementos[1], elementos[0]]`. Depois de desfazer a inclusão, só o dispositivo atual existe, então ele é marcado em qualquer ordem.
- `redo.ts` repete o evento e seleciona `elementos[0]`.

## Goals / Non-Goals

**Goals:**
- Distinguir na ação o Enter no início do texto do "Adicionar … antes" do menu, e decidir a linha marcada no reducer, um ponto só e testável sem DOM.

**Non-Goals:**
- Remover a seleção momentânea da linha nova em `inserirNovoElementoNoQuill`, que já ocorre hoje e é corrigida por `marcarLinha`.
- Mexer na corrida entre `montarMenuContexto` e o clique (`docs/analises/ANALISE_CORRIDA_CLIQUE_MENU_CONTEXTO.md`).

## Decisions

**1. Propriedade `manterFocoNoAtual` na ação.** `adicionarElemento` despacha `{ ...actionAntes.execute(elemento, textoNovaLinha), manterFocoNoAtual: true }` só no ramo `posicao === 'antes'`. A assinatura de `AdicionarElemento.execute` não muda, e o menu, que chama `execute` sem a propriedade, segue como está.
- Alternativa descartada: um quinto parâmetro em `execute`. Ele aumenta uma assinatura que já tem parâmetro posicional opcional (`hasDesmembramento`) e afeta todos os chamadores.
- Alternativa descartada: corrigir só na tela com um `setTimeout` que remarca a linha original depois do dispatch (opção B da análise). Isso depende da ordem dos timers, monta o menu de contexto duas vezes e não fica gravado no histórico, então o refazer voltaria a marcar o novo.

**2. Reducer emite `ElementoMarcado [atual, novo]` com a propriedade.** Em `adicionaElemento.ts`, a linha que monta o evento passa a inverter a ordem quando `action.manterFocoNoAtual` é verdadeiro. A propriedade só vale com `posicao === 'antes'`; em outra posição é ignorada. Como a ordem fica gravada no `past`, o refazer seleciona o dispositivo com o texto sem nenhuma mudança em `redo.ts`. O desfazer continua marcando o dispositivo atual (único que sobra), sem mudança em `undo.ts`.

**3. Cursor no início do texto.** `marcarLinha` já posiciona no índice do `blotConteudo` da linha marcada, ou seja, no início do texto. Nada muda no componente além do despacho.

## Risks / Trade-offs

- [O agrupador ou a ementa recebem `manterFocoNoAtual` por engano] → A propriedade só é acrescentada no ramo `posicao === 'antes'`, e `getActionAdicionarAntes` só devolve ação com `posicao` para os cinco tipos; o reducer também ignora a propriedade fora de `'antes'`.
- [A linha nova pisca selecionada antes de `marcarLinha`] → Já ocorre hoje (com a ordem invertida); fica como está (non-goal).
- [Desmembramento: a linha foi editada antes do Enter] → O editor despacha `ATUALIZAR_TEXTO_ELEMENTO` antes da inclusão, como hoje; a inclusão em si não muda.
