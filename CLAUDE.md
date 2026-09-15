# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Workflow e Gestão de Contexto

Este projeto utiliza três arquivos principais para gestão de contexto e continuidade do desenvolvimento:

### 1. CLAUDE.md (este arquivo)
- Mantém todo o contexto do projeto que raramente mudará
- Inclui objetivos de alto nível e casos de uso do aplicativo
- Detalhes do ambiente de desenvolvimento e arquitetura
- **Diretrizes de comportamento do Claude:**
  - **NÃO comece imediatamente a mudar código quando o usuário explicar um problema**
  - **Analise o problema primeiro e apresente opções ao usuário**
  - Espere confirmação antes de implementar mudanças significativas
  - Para bugs ou problemas, sempre proponha a abordagem antes de executar
  - **PROIBIDO fazer git commit sem solicitação explícita do usuário em um prompt específico para isso — nunca comite por iniciativa própria, mesmo após um fix bem-sucedido**
  - **Comentários de código devem ser sempre concisos e essenciais** — em português do Brasil, preferencialmente uma linha. Só comente o que não é óbvio pelo código em si (o "porquê", uma invariante não-óbvia, um workaround); nunca descreva o "o quê". Evite blocos de várias linhas quando uma frase resolve.

### 2. docs/sessao/TODO.md
- **Pipeline de desenvolvimento** com recursos atuais, futuros e concluídos
- **DEVE ser atualizado pelo menos uma vez a cada 30 minutos** com o estado atual e deve ser atualizado sempre que uma nova tarefa foi designada para a sessão do claude.
- Inclui qualquer solução de problemas em andamento
- Rastreia tarefas pendentes, em progresso e concluídas
- Serve como checkpoint do progresso do desenvolvimento

### 3. docs/sessao/HANDOFF_SUMMARY.md
- Atualizado quando:
  - A sessão de chat precisa ser encerrada
  - O contexto restante antes da compressão atinge cerca de 10%
- Permite transição suave entre sessões sem perda de informações
- Documenta decisões importantes, problemas encontrados e próximos passos
- O usuário solicitará explicitamente a atualização deste arquivo quando necessário

## docs/sessao/ — continuidade entre sessões

`docs/` existe no projeto, mas é de uso pessoal do usuário — não é uma convenção que eu preciso seguir ou organizar, exceto pela pasta `docs/sessao/`, que segue os 3 arquivos de continuidade descritos acima (`TODO.md`, `HANDOFF_SUMMARY.md`, `NEXT_SESSION_HANDOFF_PROMPT.md`). `docs/` não é versionado no repositório principal — não por regra de `.gitignore` (não há nenhuma), mas por convenção de nunca dar `git add docs/`.

A skill global `backup-docs` (`~/.claude/skills/backup-docs/SKILL.md`) sincroniza `docs/sessao/` (e o restante de `docs/`) para um repositório git dedicado e irmão deste projeto (`../bkp-ia/lexml-eta`), acionada dizendo algo como "backup dos docs". A skill `session-handoff` (também global) usa `docs/sessao/` para os arquivos de continuidade. Nenhuma das duas tem override local neste projeto.

### Documentos arquiteturais de referência

- `docs/estrutura-lexml.md` — engenharia reversa completa do formato LexML (mapeamento de tipos/`TYPE_NAME`, hierarquia de dispositivos, sistema de IDs, URN, sistema de remissões externas/internas/via-alteração), com base na documentação oficial (Partes 1-3) e no corpus real de proposições. Consultar antes de mexer em qualquer código de serialização/parsing LexML (`src/model/lexml/documento/`, `buildJsonixFromProjetoNorma.ts`, `buildProjetoNormaFromJsonix.ts`).
- `docs/guia-cypress.md` — guia de testes E2E Cypress, organizado por tópico (config, Shadow DOM, race conditions com LitElement, menu de contexto dinâmico, seletores, setup de documentos, edição de texto, diagnóstico de falhas). Cada tópico traz cenário de uso e arquivos relacionados (`cypress/support/commands.ts`, `cypress/support/remissao-commands.ts`, specs de exemplo). Consultar antes de escrever ou depurar qualquer spec em `cypress/e2e/`. Versão completa/íntegra com todo o histórico de descobertas: `docs/guias/GUIA_CYPRESS.md`.

## OpenSpec (`openspec/`)

### Definição

Desde 14/09/2026, o projeto usa o [OpenSpec](https://github.com/Fission-AI/OpenSpec) (`@fission-ai/openspec`, CLI global + skills/comandos `/opsx:*` em `.claude/`) para especificação e rastreamento de mudanças voltado a desenvolvimento colaborativo com IA — é o padrão do projeto para esse tipo de documentação, substituindo o que antes seria `docs/planos/PLANO_X.md`. **`openspec/` é versionado no repositório principal** — é o próprio ponto do OpenSpec (spec revisada junto com o código, no mesmo diff).

- `openspec/specs/<capability>/spec.md` — comportamento atual, em requisitos testáveis (`### Requirement:` + `#### Scenario:` com `WHEN`/`THEN`). **Não é gerado em massa**: só existe para capabilities já pilotadas manualmente (em 14/09/2026: `remissao-interna`, `remissao-externa`) ou criadas via um `changes/` arquivado.
- `openspec/changes/<slug>/` — toda mudança nova nasce aqui via `/opsx:propose`, com `proposal.md`/`design.md`/`tasks.md`/specs delta (`## ADDED/MODIFIED/REMOVED Requirements`).
- `openspec/changes/archive/<data>-<slug>/` — mudanças concluídas, com o delta já mesclado nas specs principais.
- `openspec/config.yaml` — `schema: spec-driven`, `Language: pt-BR` (conteúdo em português; headings estruturais `## Purpose`/`## Requirements`/`### Requirement:` e a palavra `SHALL`/`MUST` ficam em inglês por convenção do próprio OpenSpec — confirmado por leitura do validador: só os headings estruturais são obrigatórios em inglês, `SHALL`/`MUST` é recomendado mas não bloqueia, `WHEN`/`THEN` é livre).

### Convenção de nomes para changes do OpenSpec

As changes do OpenSpec neste projeto seguem o padrão:

```
<aaaa>-<mm>-<dd>-c<xx>-<nome-da-change>
```

- `aaaa-mm-dd`: data de criação da change (ano-mês-dia).
- `c<xx>`: contador sequencial de duas casas (`c01`, `c02`, ...), reiniciado a cada dia diferente — a primeira change criada em um novo dia sempre começa em `c01`, mesmo que o dia anterior tenha chegado a um número maior.
- `<nome-da-change>`: nome descritivo em kebab-case.

Exemplos: `2026-09-15-c01-salvar-documento-articulado`, `2026-09-15-c02-abrir-documento-articulado`.

## Project Overview

**LexML-ETA** (Editor de Texto Articulado - Legislative Text Editor) is a web component-based application for editing legislative documents and amendments (emendas) for the Brazilian Senate. It provides structured editing of legal texts with support for LexML format.

**Key Technologies:**
- LitElement web components
- Redux for state management
- Quill.js for rich text editing
- Shoelace UI components
- TypeScript

## Development Commands

### Build and Development
```bash
npm start                # Start dev server with watch mode
npm start:cache          # Start dev server with cache
npm run build            # Compile TypeScript to out-tsc/
npm run clean            # Clean build artifacts (out-tsc/, prod/)
```

### Library Build (for npm distribution)
```bash
npm run prepublish       # Build distribution to dist/ (uses rollup.config.dist.js)
npm run copy:assets      # Copy assets to dist/
```

### Demo Build
```bash
npm run build:demo       # Build demo to prod/ folder
npm run deploy:demo      # Deploy demo to gh-pages
```

### Testing
```bash
npm test                 # Run all tests with coverage
npm run test:watch       # Run tests in watch mode

# Run specific test suites
npm run test:watch:comando-emenda    # Watch emenda command tests

# E2E tests with Cypress
npm run cy:open:local    # Open Cypress interactive mode
npm run cy:run:local     # Run Cypress headless
```

### Linting and Formatting
```bash
npm run lint             # Check ESLint and Prettier
npm run format           # Auto-fix ESLint and Prettier issues
```

**Note:** Pre-commit hooks run lint-staged automatically on staged TypeScript files.

## Architecture

### Component Structure

The application follows a **LitElement-based web component architecture**:

- **Main Components** (`src/components/`):
  - `lexml-eta.component.ts` - Root container component, manages Redux state and coordinates child components
  - `lexml-eta-proposicao.component.ts` - Wraps the editing interface for a specific proposicao
  - `editor/editor.component.ts` - Core structured editor for dispositivo (legal device) manipulation
  - `editor-texto-rico/editor-texto-rico.component.ts` - Rich text editor wrapper around Quill.js
  - `articulacao.component.ts` - Displays the hierarchy of legal devices
  - `elemento/elemento.component.ts` - Individual legal device component (article, paragraph, etc.)
  - `autoria/`, `destino/`, `data/` - Form components for amendment metadata
  - `alertas/`, `ajuda/`, `opcoesImpressao/` - UI components

### State Management (Redux)

Redux store defined in `src/redux/store.ts`:
- **elementoReducer**: Manages the document structure (Articulacao/Elemento tree) and all editing operations
- **appReducer**: Currently a placeholder for future app-level state

**Action Pattern**: Actions are defined in `src/model/lexml/acao/` with naming convention `[action]Action.ts`. Each action exports a constant and action creator function.

**Key Actions**:
- `ADICIONAR_ELEMENTO`, `REMOVER_ELEMENTO` - Add/remove legal devices
- `ATUALIZAR_TEXTO_ELEMENTO` - Update device content
- `RENUMERAR_ELEMENTO` - Automatic renumbering
- `SUPRIMIR_ELEMENTO`, `RESTAURAR_ELEMENTO` - Mark as removed/restore
- `VALIDAR_ELEMENTO`, `VALIDAR_ARTICULACAO` - Validation logic
- `UNDO`, `REDO` - History management
- Revision actions: `ATIVAR_DESATIVAR_REVISAO`, `ACEITAR_REVISAO`, `REJEITAR_REVISAO`

**State Events**: State changes emit events through `StateType` enum (`src/redux/state.ts`), which components listen to via Redux `connect()`.

### Domain Models

**Core Model Hierarchy** (`src/model/`):

1. **Dispositivo** (`src/model/dispositivo/dispositivo.ts`):
  - Base interface combining: Tipo, Hierarquia, Numeracao, Conteudo, BlocoAlteracao, Genero, Regras, Situacao, Validacao
  - Represents legal devices (artigo, paragrafo, inciso, alinea, item)
  - `Articulacao` extends Dispositivo - root container for all articles

2. **Elemento** (`src/model/elemento/elemento.ts`):
  - Lightweight representation of Dispositivo for UI rendering
  - Contains hierarchy info, state, revision data, and possible actions
  - Used in Redux state instead of full Dispositivo to reduce complexity

3. **Emenda** (`src/model/emenda/emenda.ts`):
  - Represents an amendment with metadata, authorship, destination, justification
  - Contains `DispositivosEmenda` with arrays for added/modified/suppressed devices
  - Modes: EMENDA, EMENDA_ARTIGO_ONDE_COUBER, EMENDA_TEXTO_LIVRE, EMENDA_SUBSTITUICAO_TERMO

4. **LexML Model** (`src/model/lexml/`):
  - `tipo/` - Device type definitions and hierarchy rules
  - `hierarquia/` - Parent-child relationship management
  - `numeracao/` - Automatic numbering logic
  - `regras/` - Validation rules for each device type
  - `situacao/` - Device state (original, novo, modificado, suprimido)
  - `conteudo/` - Text content and omission handling
  - `documento/` - ProjectNorma (URN parsing) and LexML conversion
  - `acao/` - Redux action creators (40+ actions)

### Rich Text Editing (Quill.js)

Custom Quill implementation in `src/util/eta-quill/`:
- **EtaQuill** - Extended Quill with legislative editing features
- **EtaBlot*** - Custom Quill blots for:
  - `eta-blot-rotulo` - Device label (e.g., "Art. 1º")
  - `eta-blot-conteudo` - Editable content area
  - `eta-blot-menu` - Action menu for each device
  - `eta-blot-revisao` - Revision tracking UI
  - `eta-blot-omissis` - Omission markers
- **Modules** (`src/components/editor-texto-rico/`):
  - `moduloRevisao.ts` - Track/accept/reject changes
  - `moduloNotaRodape.ts` - Footnote management
  - `moduloAspasCurvas.ts` - Smart quote conversion

### Revision System

Revision tracking (`src/model/revisao/`):
- Tracks text changes with user identification
- `Revisao` and `RevisaoElemento` model changes
- Accept/reject workflow for collaborative editing
- Toggle via `ativarDesativarRevisaoAction`

## File Organization Patterns

### Action Files (`src/model/lexml/acao/`)
- Export: `export const ACTION_NAME = 'ActionName';`
- Export: `export const actionNameAction = (params: any) => ({ type: ACTION_NAME, ...params });`

### Reducer Operations (`src/redux/elemento/reducer/`)
- Pure functions handling state transformations
- Named after action: `adicionaElemento()`, `removeElemento()`, etc.
- Import action constants from `src/model/lexml/acao/`

### Components (`src/components/`)
- Use `@customElement('tag-name')` decorator
- Extend `LitElement` or `connect(rootStore)(LitElement)` for Redux
- CSS modules: `*.component.css.ts` for scoped styles

### Model Files (`src/model/`)
- Interfaces for data structures
- Utility functions for model operations
- No UI logic

## Key Concepts

### Device Hierarchy (Hierarquia)
Brazilian legislative text follows a strict hierarchy:
- Articulacao (root)
  - Agrupador (livro, titulo, capitulo, secao, subsecao)
  - Artigo
    - Caput (main text of article)
      - Inciso (Roman numerals: I, II, III...)
        - Alinea (lowercase letters: a), b), c)...)
          - Item (numbers: 1, 2, 3...)
    - Paragrafo (§ 1º, § 2º...)
      - (same structure as caput)

### Numbering (Numeracao)
- Automatic renumbering on add/remove/transform
- Supports compound numbers (e.g., "1-1" for unique IDs)
- Different formats per device type (Roman vs Arabic numerals)

### Block Alterations (BlocoAlteracao)
- Multiple devices can be grouped in modification blocks
- Dispositivos within a block share a single `notaAlteracao`

### Device States (Situacao)
- **original** - exists in original text, no changes
- **novo** - newly added
- **modificado** - content changed from original
- **suprimido** - marked for deletion (may still exist in editor)

13. **Validador de XSD client-side do jsonix (10-11/09/2026, implementado e testado ponta a ponta):** `src/util/lexml-schema-validator/` — verifica se o jsonix do documento (gerado pelo editor ou aberto de arquivo) está de acordo com `lexml-br-rigido.xsd`, ativado pelo botão "Validar XSD" em `demo/components/demoview.ts`. Feature de demo/QA, **não exportada de `src/index.ts`**. Documentação viva completa: `docs/referencia/LEXML_SCHEMA_VALIDATOR_MAPPING.md` (marshalling) e `docs/referencia/LEXML_SCHEMA_VALIDATOR_XSD.md` (validação XSD). **Achado central da investigação:** o formato "jsonix" já produzido por `buildJsonixFromProjetoNorma.ts` (`TYPE_NAME: 'br_gov_lexml__1.*'`) é literalmente o formato de marshalling da biblioteca real `jsonix` (npm), a mesma usada em produção pelo repo irmão público `lexml/jsonix-lexml` — por isso o marshalling jsonix→XML vendoriza essa biblioteca real + um mapping gerado 1x via `jsonix-schema-compiler` (precisa Java **8**, não 17 — `ClassNotFoundException: javax.activation.DataSource` no 17), em vez de reimplementar um serializer. A validação estrutural em si usa `xmllint-wasm` (libxml2/WASM) rodando 100% no browser contra os XSDs reais vendorizados de `lexml-xml-schemas` (repo irmão), sem backend. Só `TipoSchema.RIGIDO` implementado; `FLEXIVEL`/`OAI`/`EMENDA` reservados para extensão futura. **Invariantes/achados críticos:** (a) o `jsonix@3.0.0` publicado no npm tem 2 bugs de atribuição implícita a variável não declarada (`sourceIsEvt`, `p`) que quebram em modo estrito — todo ES module é estrito, então sem patch `new Jsonix.Context(...)` já lança `ReferenceError` na primeira chamada; corrigido vendorizando uma cópia patcheada (`vendor/jsonix/jsonix.js`, 3 patches documentados no próprio arquivo: os 2 `var` + um `export { Jsonix }` acrescentado, já que o pacote original não expõe nenhum `export` ES, só CommonJS/AMD/global). O mapping gerado (`vendor/jsonix-mapping/*.js`) tem o mesmo problema de ausência de `export` ES e recebeu o mesmo tipo de patch (append de `export { ... }`). (b) `lexml-br-rigido.xsd`/`lexml-base.xsd` importam `xml.xsd` e a árvore `mathml2/**` por **URL absoluta** (não caminho relativo) — testado empiricamente que basta registrar essas URLs literais como `fileName` no `preload` do `xmllint-wasm`, **sem** precisar patchear os XSDs (continuam byte-idênticos ao repo irmão, verificados por `npm run verify:xsd-vendorizado`); como a URI-base de `mathml2.xsd` vira essa URL absoluta, todo `xs:include` relativo dentro da árvore mathml2 cascunha a partir dela — cada arquivo do preload é chaveado pela URL absoluta correspondente, nunca por caminho local/basename (há colisões reais de nome, ex. `tokens.xsd` em `content/` e `presentation/`). (c) `index-browser.d.ts` do `xmllint-wasm` propositalmente **não** é vendorizado — o tipo mínimo usado é declarado à mão em `validarJsonixContraXsd.ts`, para não reformatar (e assim descasar do byte-a-byte contra `node_modules/xmllint-wasm/` que `verify:xmllint-wasm-vendor` garante) um `.d.ts` de terceiros só para satisfazer o Prettier do projeto. (d) diferente do `lexml-linker` (item 11), `xmllint-wasm` já embrulha seu próprio Worker — não há `.worker.ts`/`tsconfig.worker-*.json` dedicados aqui. (e) `index-browser.mjs` (xmllint-wasm) é carregado via `import()` dinâmico com `new URL(..., import.meta.url)` explícito, nunca `import` estático — evita que o Rollup inlineie o `.mjs` vendorizado no bundle e quebre a resolução do Worker interno; verificado que o Rollup (`@open-wc/building-rollup`) rebaseia corretamente cada `new URL(x, import.meta.url)` de um módulo alcançado por `import()` dinâmico para o caminho-fonte original (`out-tsc/src/util/lexml-schema-validator/<arquivo>.js`), não para a URL do chunk final hasheado — achado que corrigiu uma suposição errada do plano original (`rollup.config.js` não precisou de nenhum `copy()` novo). (f) `copy:xsd-validator-vendor-demo` (`package.json`) precisa de `mkdir -p` do diretório pai antes do `cp -r`, porque (diferente do `lexml-linker`) este módulo não tem uma etapa de `tsc`/`copy()` própria rodando antes que já crie `prod/out-tsc/src/util/lexml-schema-validator/` — sem isso, falha com "No such file or directory". **Verificado ponta a ponta:** testes unitários com documento real (via `criaDispositivo`/`createArticulacao`, numeração/rótulo setados à mão já que essas fixtures de teste não passam por renumeração automática) validando `Válido` e rejeitando `id` fora do padrão; `npm run build:demo` + `prod/` servido localmente + Playwright/Chromium real, carregando a MPV 885/2019 (documento real com dezenas de artigos) e confirmando "Válido" sem nenhum 404 nos assets vendorizados.

## Testing Patterns

Tests use `@open-wc/testing` with Mocha:
- Unit tests in `test/` mirror `src/` structure
- Use `createArticulacao()` and `criaDispositivo()` for test fixtures
- Redux reducer tests: `test/redux/elemento/reducer/`
- Component tests: `test/componente/`

**Note:** Some slow tests are excluded from default run (see `web-test-runner.config.mjs`).

## Build Output

- **out-tsc/** - TypeScript compilation output (dev)
- **dist/** - NPM package output (library distribution)
  - `index.js` - ES module bundle
  - `index.min.js` - Minified bundle
- **prod/** - Demo/SPA build for deployment
- **assets/** - Static assets (CSS, fonts, third-party JS)

## Quirks and Gotchas

1. **CSS Modules**: Imported as `*.css.ts` - returns template strings for LitElement's `static styles`

2. **Quill Custom Blots**: Registered in `src/util/eta-quill/` - must match DOM structure exactly

3. **Redux State**: Only `Elemento` objects in state, not `Dispositivo` - conversion happens in reducer operations

4. **Referências**: Elements reference others via `uuid` (internal) or `lexmlId` (from source)

5. **Aspas**: Smart quote management is complex - `moduloAspasCurvas` handles opening/closing quotes

6. **Test Files**: Must be in `out-tsc/test/` after compilation - test runner compiles with TypeScript first

7. **Copy Commands**: `copy:quill1table` copies third-party Quill table extension JS to build output

8. **State Events**: After state changes, components emit events via `StateType` enum for parent components to listen

9. **Pagination**: Large documents use `ConfiguracaoPaginacao` to split articulacao across multiple pages

10. **Revision Tracking**: When active, all text changes create `Revisao` objects that must be accepted/rejected

11. **Remissão Interna (branch `feat/remissao-interna`)**: Remissões internas entre dispositivos. Arquivos-chave: `src/model/remissao/lexmlIdUtil.ts` (análise de ID + geração de texto canônico), `src/components/editor/moduloRemissao.ts` (módulo Quill que gerencia criação/atualização/remoção de links), `src/redux/elemento/reducer/adicionaRemissaoInterna.ts` (detecção automática). **Arquitetura de detecção (FASE 1 completa — Etapas 1.1+1.2+1.3+1.4+1.4-U):** `detectarReferencias()` orquestra três passagens: (1) `detectarReferenciasAbsolutas()` — regex composta com âncora explícita de artigo; (2) `detectarReferenciasAgrupadores()` — detecta Parte/Livro/Título/Capítulo/Seção/Subseção por número romano OU "único/única", incluindo cadeias como "Seção II do Capítulo I"; (3) `detectarReferenciasContextuais()` — resolve padrões relativos como "§ 2º deste artigo", "Seção I deste Capítulo", "caput deste artigo" via `buscarAncestralPorTipo()`. Todas as passagens retornam `ReferenciaEncontrada[]` com `dispositivoDestino` já resolvido. **Invariantes críticos:** (a) O registry (`remissaoRegistry[uuid]`) deve sempre ser **substituído, nunca acumulado**. (b) Em `renderizarRemissoesDoState`, sempre restringir a busca ao blot do dispositivo específico — nunca usar `quill.getText()` globalmente. (c) Para atualizar texto de link no Quill, sempre usar `quill.updateContents(delta, 'silent')` dentro de `setTimeout(0)`. (d) `adicionaElemento.ts` emite `RemissaoRenumerada` recursivamente via `capturarComDescendentes`, independentemente de `action.posicao`. (e) `construirSinteseAteArtigo` retorna null para contexto de agrupador (sem artigo ancestral) — o fallback em `detectarReferenciasContextuais` chama `buscarAgrupadorFilhoPorPrefixo` diretamente. (f) Caso especial caput: prefixText === "caput" → retorna `artigo.caput` diretamente. (g) **textoFixo**: remissões manuais têm `textoFixo: true`; `data-texto-fixo="true"` no DOM persiste através de undo/redo; `atualizarReferencias()` preserva o texto quando `textoFixo=true`. (h) Botão "Remover remissão" fica `disabled` sem remissão no cursor — `temRemissaoNaCursorOuSelecao()` em `onSelectionChange`. (i) **Agrupadores únicos**: `buscarFilhoAgrupador` com número "único/única" valida que existe exatamente 1 filho do tipo com `numero='1'` — retorna null se houver mais de um (guarda anti-falso-positivo). `P_NUM_AGRUPADOR = '(?:[uú]nic[ao]|[MDCLXVI]+...)'` centralizado. **FASE 1 completa — todos os CTs (A–H) passaram em 17/03/2026. 189 testes de remissão passando.** **FASE 3 em andamento — Testes E2E Cypress.** Plano de E2E: `docs/PLANO_E2E_REMISSAO_INTERNA.md`. Guia geral de Cypress: `docs/guias/GUIA_CYPRESS.md`. **Grupo A completo (CT-A-01 a CT-A-04 passando em 22/03/2026).** Próximo: Grupo B (detecção contextual). **Invariantes E2E críticos:** (j) NÃO usar `alterarTextoDoDispositivo` — bypassa Quill, `quill.getText()` retorna vazio. Usar `digitarTextoRemissao()` + `dispararDeteccaoRemissao()`. (k) Links só são criados quando `dispositivoDestino` existe — criar estrutura completa antes de detectar. (l) Nome de menu: posição `'filho'` é omitida da descrição — artigo usa `'Adicionar parágrafo'` (não `'depois'`), parágrafo usa `'Adicionar parágrafo depois'`. (m) Após click em `sl-dropdown`, quebrar a cadeia: duas chamadas `container.find()` separadas para evitar detach do sl-dropdown durante retry. **Sub-feature "Remissão Inválida com Mensagem" (24/03/2026, Etapas 1+2 concluídas):** quando dispositivo destino é excluído, `removeElemento.ts` marca `valida:false` em `state.remissoes` e emite `StateType.RemissaoInvalidada`. `createElementoValidadoComExtras` em `elementoUtil.ts` permite injetar mensagens extras além do validador. **Invariante preserve-invalids:** `adicionaRemissaoInterna` NÃO deve sobrescrever entradas `valida:false` ao reconstruir o registry — elas só são removidas pela nova ação `REMOVER_REMISSAO_INVALIDA`. Plano completo: `docs/PLANO_REMISSAO_INVALIDA_MENSAGEM.md`. **Save/Load LexML (08/04/2026 — Etapa 1 concluída):** plano em `docs/PLANO_REMISSAO_SAVE_LOAD.md`. Etapa 1 (serialização): ao salvar, `getProjetoAtualizado()` chama `completarRegistroRemissoes(articulacao, remissoes)` para preencher o registry com dispositivos não editados na sessão, depois `buildJsonixFromProjetoNorma` injeta links `<a data-lexml-ref>` via `injetarLinksRemissaoNoTexto`, que são convertidos para nós `<Remissao href>` pelo conversor. **Invariante crítico (n): caput nunca está em `artigo.filhos`** — `findDispositivoByUuid` deve ser chamado com `incluiCaput=true` para localizar caput pelo UUID (`elementoUtil.ts:255`). **Invariante (o): `completarRegistroRemissoes` é obrigatório antes de serializar** — sem ele, dispositivos não editados na sessão não têm registry populado. Usa `percorreHierarquiaDispositivos` (inclui caput). Etapa 2 (deserialização) é o próximo passo: `buildProjetoNormaFromJsonix.ts` deve converter `<Remissao href="id">` → `<a data-lexml-ref="id" class="lexml-remissao-interna">` em `montaTag`. **Exclusão de remissão — deleção lógica (tombstone) e exclusão por edição (08/07/2026):** `RemissaoInternaValue` ganhou `excluidaManualmente?: true`. Ao clicar "Excluir" no popup, a entrada correspondente não é removida do registry — é marcada com esse flag via `excluirRemissaoManualAction`/`src/redux/elemento/reducer/excluirRemissaoManual.ts`; `adicionaRemissaoInterna.ts` passa a pular a recriação quando o trio `(targetLexmlId, inicio, textoRef)` bate com um tombstone, e descarta o tombstone assim que o texto mudar naquele ponto (comparação pela chave tripla, não só posição). **Nova feature — exclusão em tempo real ao editar:** `moduloRemissao.ts` ganhou um listener (`_removerRemissaoEditadaEmTempoReal`) que remove o formato imediatamente quando uma edição atinge o interior de um link já existente. Usa **cache de texto por refId** (não aritmética de posição do delta — comprovadamente diverge do índice real de `getLeaf()`/`blot.offset(scroll)` neste documento, que tem muitos blots estruturais como rótulo/menu) e um filtro `pareceEdicaoPontual` que distingue digitação real de **reconstruções estruturais do documento inteiro** (ex.: adicionar/renumerar dispositivo), que também chegam como `source: 'user'` e quase causaram uma regressão no fluxo de renumeração (Grupo G de testes E2E) na primeira versão da implementação. **Invariante (p):** `RemissaoInternaBlot.format()` (`eta-blot-remissao-interna.ts`) deve limpar `data-lexml-ref`/`data-ref-id` do DOM **antes** de chamar `super.format(name, false)` — sem isso, o Quill "resgata" esses atributos (via `AttributorStore.copy`) para um `<span>` genérico ao desembrulhar o `<a>`, deixando resíduo sujo no DOM que corrompe a serialização (aparece como texto literal no JSONIX). **Invariante (q):** o fechamento do popup de remissão é centralizado em `fecharPopupRemissao()` (`editor.component.ts`), chamado pelo listener compartilhado `listenerRemoveRemissao` **e** novamente via `setTimeout(0)` — depender só do `selection-change` nativo falha por uma corrida assíncrona (o popup podia reabrir com dados obsoletos). **Bug do TAB corrigido (16-17/07/2026):** transformar um Artigo em Parágrafo (ou vice-versa) fazia o dispositivo sumir visualmente do editor, mesmo com o estado/remissão corretos — causado por um efeito colateral da preservação de uuid entre tipos (Fase 0): `ElementoIncluido` e `ElementoRemovido` no mesmo lote de eventos carregam o MESMO uuid, e `removerLinhaQuill` apagava a linha que `inserirNovoElementoNoQuill` acabara de (re)inserir. Corrigido **só na camada de DOM** (`editor.component.ts`): `processarStateEvents` calcula `uuidsIncluidosNoLote` e passa para `removerLinhaQuill`, que ignora uuids presentes nesse set; `inserirNovoElementoNoQuill` só reaproveita a linha existente (`atualizarElemento`) quando o `tipo` bate — caso contrário remove e recria via `criarContainerLinha` (rebuild de classes CSS). Uma primeira tentativa de corrigir isso no reducer (filtrando `removidos` em `transformaTipoElemento.ts`) **quebrou o undo/redo** (que precisa da lista completa de elementos removidos para reconstruir o estado anterior) e foi revertida — não repetir essa abordagem. Guard adicional em `eta-container-table.ts#desativarBorda()` (`this.children?.head`) para não quebrar ao processar uma linha recém-removida. **D4 implementado (17/07/2026) — "referência enxuta" não ganha qualificador ao renumerar artigo alheio:** três regras de decisão em `sincronizarEntrada` (`src/model/remissao/sincronizarRemissoes.ts`): (1) **contextual** ("deste/desta X") já tratado — só muda se a posição relativa ao ancestral compartilhado mudar; (2) **enxuta** (sem "do X"/"da X", ex.: "inciso I" sozinho) — nunca ganha uma cadeia que não tinha, só corrige o segmento local (`textoCanonicoLocal`) se a posição do alvo dentro do seu PAI IMEDIATO mudou; (3) **qualificada** ("do art. N") ou referência ao artigo inteiro — sempre recalcula por inteiro (`textoCanonicoDoDispositivo`), refletindo qualquer mudança em qualquer nível da cadeia, mesmo renumeração de ancestral alheio. Detecção de qual regra aplicar via `possuiQualificadorExplicito()` (regex `\bd[ao]\b`) em `lexmlIdUtil.ts`. Corrigido de brinde um bug pré-existente em `textoCanonicoRelativoATipo`: quando o pai imediato é um Caput e o tipo-de-parada contextual é 'art', a função não reconhecia "já estou no nível de parada" (Caput.tipo !== 'Artigo') e gerava "inciso I do caput" em vez de "inciso I" — corrigido tratando Caput como transparente (`paiEfetivamenteNoTipoParar`). Testes: `test/model/remissao/sincronizarRemissoes-referenciaEnxuta.test.ts` (26 casos, matriz completa validada em conversa com o usuário, independente do arquivo JSON) e `cypress/e2e/remissao-interna/grupo-h-referencia-enxuta.cy.ts` (CT-H-01/02). **Bug de resolução de CAPUT ao carregar documento (17-18/07/2026):** uma remissão contextual "caput deste artigo" virava "art. Nº" (o artigo inteiro) ao renumerar um artigo alheio, só em documentos CARREGADOS de arquivo (não criados ao vivo pela UI). Causa raiz: `buscaDispositivoById` (`hierarquiaUtil.ts`) trata o id `"art{N}_cpt"` como sinônimo do próprio Artigo — comportamento intencional para o fluxo de aplicação de emendas mod/sup (2022), mas `inicializaRemissoesAoAbrir.ts` (bootstrap de remissões ao abrir arquivo) reusava essa mesma função, fazendo `targetUuid` apontar para o Artigo em vez do Caput. Corrigido com `resolveCaputSeNecessario()` em `inicializaRemissoesAoAbrir.ts` (redireciona para `artigo.caput` quando o id é exatamente `"{artigoId}_cpt"`), **sem tocar em `buscaDispositivoById`** (função compartilhada por 8+ consumidores, incluindo o fluxo de emendas que depende do comportamento atual). Um teste unitário pré-existente (`reducer-bootstrap-remissoes.test.ts`) tinha **codificado o bug como esperado** (`targetUuid` igual ao do Artigo) — corrigido junto. **Arquivo de teste manual completo:** `docs/teste-atualizacao-remissoes-completo.json` — proposição com 8 artigos, um exemplo de cada tipo de contexto de atualização (enxuta, absoluta simples, cadeia qualificada, cadeia composta, contextual em 3 variantes, manual não-canônica); usar via "Abrir proposição" no app para testes manuais de renumeração. **Cuidado de teste E2E:** `alterarTextoDoDispositivo` (bypassa o Quill, seta DOM direto) seguido de um clique de menu no MESMO elemento quebra com `IndexSizeError` no `selection-change` do Quill (bug pré-existente, não relacionado a este trabalho, reproduzido isoladamente) — sempre clicar no menu ANTES de editar o texto do mesmo dispositivo dentro do mesmo `beforeEach`/teste, ou intercalar com edição de um elemento diferente. **Detecção Híbrida por Blur (branch `feat/refactor-atualiza-remissao`, implementada 18-24/07/2026):** a criação de remissão deixou de depender do debounce de 1s de digitação — agora só é criada quando o usuário SAI do dispositivo (Gatilho A: troca de linha no editor, via `observableSelectionChange`; Gatilho B: foco sai do editor inteiro, via `focusout` do DOM) ou quando `getProjetoAtualizado()` é chamado (flush determinístico, cobre o botão Salvar mesmo sem sair da linha). A remoção de remissão ao editar o link continua em tempo real, sem mudança. Plano completo: `docs/planos/PLANO_DETECCAO_BLUR.md`. Documentação funcional: `docs/referencia/REMISSAO_INTERNA.md` §3.1/§4.5/§6.20. Treinamento: `docs/guias/TREINAMENTO_REMISSAO_INTERNA.md` Módulo 2 (três caminhos A/B/C) e §2.8 (flush). **Invariantes críticos (r):** o guard `somenteFormatoMudouNaLinha()` (`editor.component.ts`) DEVE ser calculado ANTES de `atualizarTextoElemento()` rodar — o dispatch Redux reseta `blotConteudo.alterado` como efeito colateral (via `elementoSelecionado.notify()`), então `detectarRemissoesAoSairDaLinha()` recebe esse booleano pronto como parâmetro e nunca reavalia `alterado` sozinho. **(s)** o flush do Gatilho B (`onFocusoutEditor`) precisa rodar dentro de `setTimeout(0)` — chamado de forma síncrona, corrompe a seleção do Quill em restauração de cursor (`leaf.position is not a function` em `moduloRemissao.ts`) e quebra o fluxo de renumeração (Grupo G). **(t)** `EditorComponent.flushEdicaoPendente()` é o único método público novo, chamado por `lexml-eta-proposicao.component.ts#getProjetoAtualizado()` incondicionalmente, antes de qualquer serialização. **Investigação — Detecção Automática de Remissão Externa via lexml-linker/WASM (branch `feat/refactor-atualiza-remissao`, 13/08/2026, Fase 0 concluída):** avalia integrar o `lexml-linker` (parser Haskell compilado para `wasm32-wasi`, do repo irmão `lexml-linker`, branch `linker-wasm32`) para detectar e criar remissões externas automaticamente, complementando o fluxo hoje 100% manual de `docs/planos/PLANO_REMISSAO_EXTERNA.md` (já implementado/integrado). Plano completo, com 9 achados verificados por teste real (não só leitura de código) e 11 riscos catalogados: `docs/planos/PLANO_INTEGRACAO_LEXML_LINKER_WASM.md`. **Achado que afeta o código já existente:** `REGEX_ABSOLUTA` (detecção de remissão interna acima) não tem guarda contra ser seguida de citação de norma externa — falso positivo pré-existente, exposto (não causado) por esta investigação; tratamento proposto no plano (§4.3) é coordenação assíncrona no gatilho de blur, não regex adicional. **Nenhum código alterado ainda** — sessão puramente investigativa; próximo passo é decidir com o usuário se inicia a Fase 1 (empacotamento do artefato WASM). **Bug real de criação de remissão corrigido (14/08/2026, QA da branch):** durante teste manual guiado por um roteiro de QA produzido na mesma sessão (`docs/guias/ROTEIRO_QA_REFACTOR_BLUR_E_ATUALIZACAO.md`), o usuário encontrou que o gatilho de criação por blur não disparava quando o debounce de keystroke (1s) rodava **antes** do usuário sair da linha — comportamento humano normal, não uma exceção. Causa raiz: `atualizarTextoElemento()` é compartilhada entre o debounce e os gatilhos de saída; o dispatch que ela faz reseta `blotConteudo.htmlAnt` como efeito colateral síncrono (via `atualizarAtributos`, reagindo ao evento `ElementoSelecionado`), apagando o sinal de "mudança pendente" antes do gatilho de saída poder lê-lo. **Corrigido** com um parâmetro `preservarHtmlAnt` em `atualizarTextoElemento`, usado só pela chamada do debounce (`emitirEventoOnChange`) — captura `htmlAnt` antes do dispatch e restaura depois, sem tocar em nenhum outro caminho de sincronização. **Invariante (u):** a base de comparação de `verificarSomenteFormatoMudou` deve ser `blotConteudo.htmlAnt`, nunca uma âncora paralela nem o texto já sincronizado no Redux — uma primeira tentativa de correção introduziu uma segunda âncora (`htmlAntRemissao`), que quebrou `CT-G-08`/`CT-H-01` porque caminhos de sincronização direta (ex.: comando de teste `sincronizarTextoComQuill`, que despacha `ATUALIZAR_TEXTO_ELEMENTO` sem passar pelo componente) nunca a atualizavam, causando falsos positivos de "remissão pendente" que sobrescreviam links manuais/enxutos — não repetir essa abordagem. Novo teste de regressão: `CT-J-07` em `grupo-j-deteccao-blur.cy.ts`. **Segundo bug encontrado, documentado mas deliberadamente NÃO corrigido** (decisão do usuário): uma condição de corrida pré-existente entre `montarMenuContexto()` (remonta o blot do menu de contexto toda vez que uma ação Redux termina em `ElementoSelecionado`, mudando o comprimento do documento Quill) e o cálculo de posição de um clique físico do usuário — quando coincidem muito próximos no tempo, o clique de saída de linha deixa de ser reconhecido como mudança de linha pelo Quill. Confirmado pré-existente via `git stash` (reproduzido com o código de antes desta sessão). Provavelmente explica por que Enter se comporta diferente de seta ao sair de um dispositivo. Análise completa, com evidências e caminhos de correção sugeridos: `docs/analises/ANALISE_CORRIDA_CLIQUE_MENU_CONTEXTO.md`. `CT-J-07` foi marcado `it.skip` (não removido) apontando para essa análise — critério de aceite de uma correção futura. **Fases 1-7 do plano de remissão externa via WASM implementadas e commitadas (17-18/08/2026, branch `feat/wasm32-remissao-externa`).** Fase 1-2: `.wasm`/`.mjs`/shim vendorizados em `src/util/lexml-linker/vendor/`, Worker (`lexml-linker.worker.ts`) + cliente (`lexmlLinkerClient.ts`) + parser de offsets (`parseHtmlDecorado.ts`). Fase 3: `coordenarDeteccaoExterna()` (`editor.component.ts`) fire-and-forget a partir de `detectarRemissoesAoSairDaLinha`; achado #4 (falso positivo interno) resolvido por reconciliação via redespacho + remoção explícita do blot interno obsoleto (bug real de link duplicado no DOM, corrigido). Fase 4: lookup reverso de nome de norma no dialog de edição via `autocomplete-norma`/`urnInicial`. Fase 5: paridade CLI-nativa-vs-WASM 25/25 idênticos; suíte de corpus real (27 casos extraídos de proposições reais via `buildProjetoNormaFromJsonix`, `test/util/lexml-linker/lexmlLinkerClient.corpusReal.test.ts`) achou um gap real do parser upstream (faixa "art. X a art. Y e art. Z" perde o primeiro item). Fase 6: documentação viva `docs/referencia/REMISSAO_EXTERNA.md` + `docs/guias/TREINAMENTO_REMISSAO_EXTERNA.md`, seguindo a mesma convenção/regra de evolução conjunta da dupla de remissão interna. Fase 7: decisão de compressão Brotli do `.wasm` (0,88 MB vs 6,9 MB cru) — opção escolhida foi `Content-Encoding: br` estático via `EncodedResourceResolver` do Spring no lado do host (não descompressão client-side, não compressão dinâmica), confirmado por decompilação do bytecode exato do `spring-webmvc` usado pelo `lexeditweb-editor`; `.wasm.br` gerado/vendorizado com regeneração automatizada (`npm run generate:wasm-br`/`verify:wasm-br`, este último plugado em `npm test` — falha a suíte se o `.br` ficar desatualizado em relação ao `.wasm`). **Bloqueador real encontrado e corrigido na mesma sessão:** `dist/` publicado não incluía nem o `.wasm` nem o Worker (ambos só referenciados via `new URL(...)` em runtime, invisíveis ao grafo do Rollup) — `rollup-plugin-copy` resolve os assets estáticos, mas compilar o Worker via um entry point Rollup próprio **travava o processo em OOM** (~4GB) ao processar os `.mjs` vendorizados minificados, mesmo marcados `external`; contornado compilando esse arquivo à parte via `tsc` puro (`tsconfig.worker-dist.json`, script `build:lexml-linker-worker-dist`, encadeado em `prepublish`) — verificado ponta a ponta com smoke test real (Worker servido de `dist/`, detectando citação de verdade). Plano completo com todo o histórico de decisão: `docs/planos/PLANO_INTEGRACAO_LEXML_LINKER_WASM.md` (§8.1-§8.11). **Trabalho restante fica em outro repositório:** plano de implementação do lado `lexeditweb-editor` (config Spring, `angular.json`, regerar/reinstalar o `.tgz`) em `docs/planos/PLANO_INTEGRACAO_WASM_LEXEDITWEB.md` naquele repo — nada a fazer aqui até essa sessão retornar.
