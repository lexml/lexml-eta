# Design

## Context

- **Epígrafe:** é a linha da `Articulacao`. Ela nasce com `editavel = false` (`createElemento`, `elementoUtil.ts`), e `EtaBlotConteudo` grava `contenteditable="false"` no conteúdo. `EtaQuill.marcarLinhaAtual` ignora a linha por **tipo** (`tipo !== 'Articulacao'`).
  - Hoje só a `Articulacao` tem `editavel = false`; o setter `EtaContainerTable.editavel` não mexe no DOM.
- **Preâmbulo:** é um dispositivo `Preambulo` com `bloqueado = true` e `editavel = true`. Recebe o cursor pelo clique, pelas setas e pelo menu da linha. Só existe quando tem texto (item 15 do `CLAUDE.md`).
- **Setas** (`eta-keyboard.ts`, `onTeclaArrowUp/Down/Left/Right`): na borda do conteúdo, movem para `linha.prev`/`linha.next` com `setIndex`, sem olhar se essa linha é editável.
- **`verificarMudouLinha`** (`eta-quill.ts`): já redireciona a seleção que cai no rótulo, no menu ou em blots auxiliares para o conteúdo da linha, e trata o índice 0, que é a primeira linha. É o ponto único por onde passa toda mudança de seleção.

A motivação está em `proposal.md`, e os requisitos, em `specs/navegacao-cursor-editor` e `specs/preambulo-proposicao`.

## Goals / Non-Goals

**Goals:**

- Uma regra só, por `editavel`, para todas as linhas que não podem receber o cursor.
- Pular essas linhas nas quatro setas.
- Impedir o cursor nelas qualquer que seja a origem da seleção.

**Non-Goals:**

- PageUp/PageDown, Ctrl+Home/End e Tab ganharem comportamento próprio. Se levarem a seleção a uma linha não editável, a regra de D3 a devolve.
- Mudar a aparência do preâmbulo ou da epígrafe.
- Mudar a seleção de texto com o mouse por várias linhas (seleção não colapsada).

## Decisions

### D1. O preâmbulo nasce não editável

`createElemento` passa a calcular `editavel: !isArticulacao(dispositivo) && !isPreambulo(dispositivo)`. Com isso, `EtaBlotConteudo` grava `contenteditable="false"`, e o navegador deixa de pôr o cursor no texto ao clicar, como já acontece com a epígrafe.

- **Alternativa descartada:** um teste por tipo `'Preambulo'` no editor. Repetiria o padrão de `marcarLinhaAtual` e não serviria a uma próxima linha somente leitura.

### D2. As setas procuram a próxima linha editável

Um auxiliar em `eta-keyboard.ts` percorre `prev`/`next` a partir da linha atual até achar uma linha com `editavel`.

- ↓ e → vão ao início do conteúdo dessa linha; ↑ e ← vão ao fim, como hoje.
- Se não houver linha editável, o evento é cancelado e o cursor fica onde está. É o que já acontece hoje quando não há `prev`/`next`.
- As condições de borda (offset 0, fim do conteúdo, omissis) e o `isProcessandoMudancaLinha` ficam como estão.

### D3. A seleção que cai numa linha não editável volta

Em `verificarMudouLinha`, antes dos redirecionamentos de rótulo e menu, quando a seleção colapsada (`length === 0`) cai numa linha sem `editavel`:

- com `oldRange`, o editor volta para ele (`setSelection(oldRange.index, 0, SILENT)`) e trata como "não mudou de linha", como já faz no caso do índice 0;
- sem `oldRange` (foco vindo de fora do editor), o editor vai para o início do conteúdo da linha atual, se houver.

`marcarLinhaAtual` passa a testar `linhaCursor.editavel` no lugar do tipo `'Articulacao'`. É a mesma regra, agora genérica.

- **Por que antes dos redirecionamentos:** o clique no menu ou no rótulo do preâmbulo é redirecionado ao conteúdo dele. Testar depois deixaria o cursor no preâmbulo.
- **Por que só a seleção colapsada:** não altera a seleção de texto por várias linhas com o mouse (fora do escopo).
- **Alternativa descartada:** confiar só no `contenteditable="false"` de D1. O root do Quill continua editável, e o navegador ainda pode colocar a seleção na fronteira da linha, ou o próprio editor pode posicioná-la pelo menu. D3 fecha esses caminhos de forma determinística.

### D4. Testes

- **Componente:** um teste novo com o Quill real abre `novoDocumentoArticulado()` (que tem preâmbulo) e simula:
  - as setas, com `keydown` no `quill.root`; `eta-keyboard` lê `ev.key`;
  - a seleção caindo no preâmbulo e na epígrafe, com `quill.setSelection(índice, 'user')`.
  - Ele confere a linha atual e o índice do cursor. É o teste que cobre o clique, porque o clique sintético do Cypress não dispara `selection-change` (item 15 do `CLAUDE.md`).
- **Unitário:** `createElemento` devolve `editavel` falso para o preâmbulo e para a articulação, e verdadeiro para os demais.
- **E2E:** um spec novo cobre as setas pela UI real, com a ementa marcada como atual e as setas digitadas no editor, e confere o `contenteditable="false"` do preâmbulo.
  - O caso "é bloqueado" de `abertura-preambulo.cy.ts` digitava com o cursor no preâmbulo, o que deixa de ser possível. Ele passa a conferir que o preâmbulo não é editável e que digitar não altera o texto.

## Risks / Trade-offs

- **[Risco]** Algum fluxo depende de marcar o preâmbulo como linha atual, como remissões, revisão ou mensagens. → **Mitigação:** o preâmbulo não tem ações, é excluído dos diálogos de remissão e não é validado (invariante (ag)). O Cypress de `documento-articulado/*` e o `npm test` completo conferem.
- **[Risco]** `setSelection` silencioso em D3, chamado dentro do handler de `selection-change`, gera uma corrida parecida com a invariante (s). → **Mitigação:** é o mesmo padrão já usado no caso do índice 0 e no redirecionamento do rótulo, que rodam no mesmo handler.
- **[Trade-off]** ↑ e ← no início da ementa deixam de entrar na epígrafe. É uma decisão do usuário (regra genérica) e muda o comportamento atual da epígrafe.
