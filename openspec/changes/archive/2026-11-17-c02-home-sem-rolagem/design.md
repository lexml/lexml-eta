# Design

## Context

Ver proposal.md (Why) para a sequência reproduzida. Fatos que moldam a solução:

- O `<p>` de conteúdo de cada dispositivo tem `contenteditable="true"` próprio, e `EtaQuill.customClickHandler` foca esse `<p>` ao clicar na linha atual. Por isso `document.activeElement` costuma ser o `<p>`, e não o root do Quill.
- `Selection.hasFocus()` do Quill 1.3.7 é `document.activeElement === this.root`. Com o foco no `<p>`, `setNativeRange` chama `this.root.focus()` a cada `setSelection`, inclusive com `SILENT`.
- O Chrome só rola nesse `focus` quando a seleção nativa está numa posição não editável (o rótulo, depois do Home). Isso explica o "às vezes" da issue.
- `Quill.focus()` já salva e restaura a rolagem em volta de `selection.focus()` e depois chama `scrollIntoView`: o próprio Quill não conta com a rolagem causada pelo `focus` do root.

Na investigação (25 tentativas de clique e Home nativos na MPV 905/2019), a rolagem caiu para 0 sempre que o `focus` do root rodou com o foco no `<p>`. Com `focus({ preventScroll: true })`, ela não mudou em nenhuma.

## Goals / Non-Goals

**Goals:**
- Eliminar a rolagem causada pelo `focus` que o Quill aplica ao root, em todos os caminhos, num ponto único.

**Non-Goals:**
- Mudar a regra de foco do `<p>` (`customClickHandler`) ou de `hasFocus()`.
- Mudar o destino do Home ou o comportamento de Ctrl+Home/Ctrl+End.

## Decisions

**1. `root.focus` sem opções passa a usar `preventScroll` (no construtor de `EtaQuill`).** A instância do root ganha um `focus` que repassa as opções recebidas e, quando não há nenhuma, usa `{ preventScroll: true }`. Cobre as chamadas do próprio Quill (`setNativeRange`, `selection.focus`), que são as que não passam opções.
- Alternativa descartada: salvar e restaurar a rolagem só em volta do redirecionamento em `verificarMudouLinha`. Deixa expostos os outros `setSelection` com o foco no `<p>` (devolução de linha não editável, correção do índice 0, `setSelection` do teclado).
- Alternativa descartada: `hasFocus()` aceitar o foco em qualquer elemento dentro do root. O módulo de teclado do Quill (`keyboard.js`) ignora as teclas quando `hasFocus()` é falso; mudá-lo ligaria os atalhos nativos do Quill (Enter, Backspace, Tab), que hoje não rodam com o foco no `<p>`.
- Alternativa descartada: salvar e restaurar `scrollTop` dentro do `focus` sobrescrito. `preventScroll` resolve na origem, sem um quadro com a tela no topo.

**2. Rolagem intencional continua explícita.** `Quill.focus()` segue chamando `scrollIntoView` depois do `focus`, e Ctrl+Home/Ctrl+End rolam com `scrollTo`. Nada depende da rolagem do `focus` do root.

## Risks / Trade-offs

- [Algum fluxo dependia da rolagem do `focus` para mostrar o cursor] → `quill.focus()` faz `scrollIntoView` em seguida; o foco inicial na ementa (`focarQuillQuandoVisivel`) passa por ele. Os testes de componente do foco inicial e a suíte completa conferem.
- [O E2E depende de eventos nativos por CDP, técnica nova no projeto] → Funciona no Electron e no Chrome do Cypress (Chromium); o comando fica documentado no `docs/guia-cypress.md`. Sem CDP, o `keydown` sintético não move o cursor nativo e não reproduz o bug.
