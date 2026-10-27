# Design

## Context

Ao renderizar a articulação no carregamento inicial (`src/components/editor/editor.component.ts`), o método agenda um `setTimeout` de 0ms para posicionar o foco no primeiro dispositivo editável (ementa). O posicionamento era feito via `quill.setSelection(..., PrivateQuill.sources.SILENT)`, o que intencionalmente suprime o evento `selection-change` do Quill.

Entretanto, como o `EtaQuill` escuta unicamente `selection-change` para atualizar `linhaAtual` e chamar `linha.ativarBorda()`, o silenciamento deixava `this.quill.linhaAtual` como `undefined`, sem a borda verde visual e sem registro no Redux, gerando erros em `src/util/eta-quill/eta-keyboard.ts`.

Ver `proposal.md` para motivação e `specs/foco-inicial-editor/spec.md` para requisitos normativos.

## Goals / Non-Goals

**Goals:**
- Ativar visualmente a ementa (borda verde e alça de controle) e registrar `linhaAtual` no carregamento inicial.
- Manter o silêncio de eventos no Quill (`sources.SILENT`) evitando disparos desnecessários de `observableSelectionChange` (rotinas de blur/sincronização de saída de linha).
- Preservar o guard que impede o roubo de foco caso o usuário já tenha interagido antes do `setTimeout`.
- Proteger os handlers de teclado contra `TypeError` caso `linhaAtual` esteja indefinida.

**Non-Goals:**
- Não alterar a lógica de paginação ou troca de página (onde o foco vai para a primeira linha da página selecionada).
- Não alterar a mecânica geral de eventos de clique do usuário em outros dispositivos.

## Decisions

### 1. Chamada explícita a `marcarLinhaAtual(el)` com `setSelection(..., SILENT)`
- **Decisão**: Em `editor.component.ts`, logo após `this.quill.setSelection(..., PrivateQuill.sources.SILENT)`, chamar `this.quill.marcarLinhaAtual(el)`.
- **Racional**: `marcarLinhaAtual` invoca `atualizarLinhaCorrente` (que define `_linhaAtual = el`, executa `el.ativarBorda()` e rola para o elemento) e emite `elementoSelecionado.notify(el.uuid)`. Isso configura completamente o estado sem emitir `observableSelectionChange`, seguindo o padrão documentado em `docs/guia-cypress.md` (§4) e já utilizado na linha 1260 de `editor.component.ts`.
- **Alternativa descartada**: Alterar o source para `PrivateQuill.sources.USER`. Descartada porque `USER` faria o Quill emitir `selection-change`, acionando `observableSelectionChange.notify(undefined)` e o listener de saída de linha desnecessariamente.

### 2. Preservação da trava de interação concorrente
- **Decisão**: Manter intacto o guard `if (!this.quill || !this.isConnected || this.quill.linhaAtual) return;`.
- **Racional**: O guard já é a proteção efetiva contra roubo de cursor quando o usuário ou testes automáticos assumem o controle antes do timeout assíncrono.

### 3. Blindagem com Optional Chaining em `eta-keyboard.ts`
- **Decisão**: Substituir acessos diretos `this.quill.linhaAtual.elemento.bloqueado` e `this.quill.linhaAtual.tipo` por acessos com safe navigation (`?.`).
- **Racional**: Evita que o editor quebre em estado irrecuperável com exceção no console caso algum evento de teclado ocorra antes ou durante transições de seleção.

## Risks / Trade-offs

- [Risco] A aba do editor pode ainda não estar visível no DOM quando `renderizarArticulacao` executa → Mitigação: Já coberto por `focarQuillQuandoVisivel()`, que reitera chamadas até `root.offsetParent` ser válido.
- [Risco] Documentos sem ementa (caso hipotético) → Mitigação: O fallback já existe no código (`el = elementoEmenta || primeiraLinhaDaPagina || elementos[1]`), garantindo que o primeiro dispositivo disponível seja selecionado.
