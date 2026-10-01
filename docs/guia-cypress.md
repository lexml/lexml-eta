# Guia de Testes Cypress — LexML-ETA

> Cópia reestruturada por tópicos de `docs/guias/GUIA_CYPRESS.md` (fonte completa, com todo o
> histórico de descobertas e o texto original íntegro). Esta versão organiza o mesmo conteúdo por
> **tópico → cenário → arquivos relacionados**, para consulta rápida a partir do `CLAUDE.md`.

**Aplicação:** Todos os testes E2E do projeto (`cypress/e2e/`), independentemente da funcionalidade testada.

---

## Índice

1. [Execução e Configuração](#1-execução-e-configuração)
2. [Shadow DOM e Web Components](#2-shadow-dom-e-web-components)
3. [Race Conditions com LitElement](#3-race-conditions-com-litelement)
4. [Menu de Contexto Dinâmico (`sl-dropdown`)](#4-menu-de-contexto-dinâmico-sl-dropdown)
5. [Seletores CSS dos Dispositivos](#5-seletores-css-dos-dispositivos)
6. [Setup de Documentos de Teste](#6-setup-de-documentos-de-teste)
7. [Edição de Texto — Três Mecanismos](#7-edição-de-texto--três-mecanismos)
8. [Acesso a Estado Interno via `cy.window()`](#8-acesso-a-estado-interno-via-cywindow)
9. [Sincronização — Âncoras em vez de `cy.wait`](#9-sincronização--âncoras-em-vez-de-cywait)
10. [Comandos Customizados Disponíveis](#10-comandos-customizados-disponíveis)
11. [Padrões e Anti-padrões](#11-padrões-e-anti-padrões)
12. [Diagnóstico de Falhas Comuns](#12-diagnóstico-de-falhas-comuns)
13. [Técnicas de Diagnóstico Avançado](#13-técnicas-de-diagnóstico-avançado)
14. [Comportamentos do Editor que Afetam Qualquer E2E](#14-comportamentos-do-editor-que-afetam-qualquer-e2e)

---

## 1. Execução e Configuração

**Cenário:** antes de rodar ou escrever qualquer spec novo — entender como a suíte é executada e as duas armadilhas de configuração do projeto.

- `testIsolation: false` (`cypress.config.ts`) — o estado do browser **persiste entre blocos `it()`** do mesmo `describe()`. Todo `describe()` precisa de um `beforeEach()` que reconstrói o documento; sem isso um teste contamina o seguinte. O `before()` global (`cypress/support/e2e.ts`) visita a página uma única vez para toda a suíte.
- Specs `.cy.ts` **compilam junto com `src`/`test`** (`tsconfig.json` inclui `**/*.ts` sem excluir `cypress/`). Um `.cy.ts` sem `import`/`export` no topo vira **script global** — um `const` de nível superior pode colidir com o mesmo nome em outro `grupo-*.cy.ts`, mesmo que nunca rodem juntos no Cypress. O erro só aparece no `tsc` (build falha em silêncio, sem `out-tsc/`), nunca isolado no `cypress run`. Antes de criar um spec, confira com `grep -rn "^const NOME" cypress/e2e/`; prefira sufixos específicos (`SEL_LINK_J`) a nomes genéricos já usados em vários grupos (ex.: `SEL_LINK` colidiu entre `grupo-h-referencia-enxuta.cy.ts` e `grupo-j-deteccao-blur.cy.ts`).
- Um `wds` (`web-dev-server`) iniciado manualmente (fora do `npm start`) **não sobrevive** a `rm -rf out-tsc && npx tsc` — continua servindo build velho, sem erro visível. Diagnóstico: `curl -s http://localhost:8000/out-tsc/src/arquivo.js | grep "trecho-novo"`. Solução: matar o processo antigo e subir um novo antes de rodar o Cypress (não esquecer `npm run copy:quill1table` depois do `tsc`).

```bash
npm run cy:open:local   # interativo (requer `npm start` em outro terminal)
npm run cy:run:local    # headless
npx cypress run --spec "cypress/e2e/caminho/spec.cy.ts" --config baseUrl=http://localhost:8000/demo
```

**Arquivos relacionados:** `cypress.config.ts`, `cypress/support/e2e.ts`, `cypress/config/cypress.env.local.json`, `tsconfig.json`.

---

## 2. Shadow DOM e Web Components

**Cenário:** um seletor `cy.get()` não encontra um elemento que claramente existe no DOM visual — provável Shadow DOM do Shoelace.

- **Light DOM** (acessível direto, sem shadow piercing): todo o conteúdo do editor de articulação (containers, rótulos, parágrafos editáveis, menus), links de remissão (`a.lexml-remissao-interna`), `sl-dropdown`/`sl-menu`/`sl-menu-item` (Shoelace, mas no light DOM), botões de toolbar.
- **Shadow DOM** (requer `.shadow()`): interior de `sl-button` (o `<button>` real fica dentro), `sl-dialog` em alguns casos, `<input>` real de `sl-input`.

```typescript
cy.get('sl-button').shadow().find('button').click();
cy.get('#busca-int').shadow().find('input').type('texto a buscar'); // id mudou de #busca-dispositivo em 04980188 (14/05/2026)
```

**Regra prática:** comece sem `.shadow()`; se não encontrar, inspecione o DOM e adicione `.shadow()` só onde necessário.

**Arquivos relacionados:** qualquer spec que interaja com botões/diálogos Shoelace, ex. `cypress/e2e/paginacao/paginacao-plp-68.cy.ts` (uso de `sl-dialog`).

---

## 3. Race Conditions com LitElement

**Cenário:** clicar num container de dispositivo e, na sequência, um clique filho (ex. menu) falha com `element has been detached from the DOM`.

**O problema:** após clicar num dispositivo, o LitElement agenda `requestUpdate()` (microtask), que pode desconectar o node original enquanto o Cypress ainda aguarda actionabilidade de um filho.

**Solução (três mecanismos combinados):**

1. **Re-consultar por ID estável** após o primeiro clique — descartar a referência original:
   ```typescript
   const elementId = subject[0]?.id;
   cy.wrap(subject).click();
   const container = elementId ? cy.get('#' + elementId) : cy.wrap(subject);
   container.find('div.container__menu > sl-dropdown').click({ force: true });
   ```
2. **`{ force: true }`** em cliques imediatamente subsequentes a um re-render (bypassa verificações de visibilidade/cobertura/detached).
3. **Nunca encadear `find()` depois de `click()` em `sl-dropdown`** — o `find()` seguinte pode ser retried contra um node já detachado pelo re-render do container pai. Quebrar a cadeia com duas chamadas `.find()` separadas no mesmo container:
   ```typescript
   // ✅ re-consulta o container estável na segunda find()
   container.find('div.container__menu > sl-dropdown').click({ force: true });
   container.find('sl-menu > sl-menu-item').contains(opcao).click({ force: true });
   ```

**Quando aplicar:** após `cy.wrap(subject).click()` em qualquer container, ao interagir com menus logo após clicar no pai, quando um `beforeEach` adiciona dispositivos em sequência via menu.

**Arquivos relacionados:** `cypress/support/commands.ts` (`selecionarOpcaoDeMenuDoDispositivo`), qualquer spec de `cypress/e2e/remissao-interna/`.

---

## 4. Menu de Contexto Dinâmico (`sl-dropdown`)

**Cenário:** `cy.get('#id div.container__menu > sl-dropdown')` retorna 0 elementos, mesmo em um dispositivo visível — o menu ainda não foi montado.

**O problema:** o `sl-dropdown` é criado por `montarMenuContexto()` (`editor.component.ts`) só quando o Quill registra `StateType.ElementoSelecionado`. Um dispositivo recém-criado não tem `sl-dropdown` até o usuário clicar nele.

**A solução implementada** em `selecionarOpcaoDeMenuDoDispositivo` (`cypress/support/commands.ts`):

```typescript
cy.get('#' + id).click({ force: true });
cy.get('#' + id).find('p.texto__dispositivo').click({ force: true });

cy.window().then(win => {
  const quill = win.document.querySelector('lexml-eta-proposicao-editor')?.quill;
  const blot  = quill.constructor.find(p);           // EtaBlotConteudo
  const linhaAlvo = blot.parent?.parent?.parent;      // EtaContainerTable
  (quill as any).desmarcarLinhas?.();
  (quill as any).marcarLinhaAtual(linhaAlvo);         // monta o menu sem selection-change
});

cy.get('#' + id + ' div.container__menu > sl-dropdown').should('exist');
cy.get('#' + id + ' sl-button[slot="trigger"]').click({ force: true }); // trigger, não o host sl-dropdown
cy.contains('sl-menu-item', opcao).click({ force: true }); // seletor global — Shoelace pode "içar" o painel
```

**Por que `marcarLinhaAtual` e não `setSelection('user')`:** `setSelection('user')` dispara `observableSelectionChange.notify(linhaAtualAux)`; se esse blot for stale (de um teste anterior), `atualizarTextoElemento` pode disparar ações Redux com dados inválidos. `marcarLinhaAtual` chama diretamente `atualizarLinhaCorrente` + `elementoSelecionado.notify` sem efeitos colaterais.

Outras pegadinhas relacionadas:
- **`sl-input`** (shadow DOM) — digitar via `cy.get('#id').shadow().find('input').type(...)`, nunca `.type()` direto no host.
- **`sl-button.disabled`** — Lit atualiza o shadow DOM de forma assíncrona; `slButton.click()` delega para `this.button.click()`, ignorado pelo browser se o atributo `disabled` do shadow ainda não caiu. Aguardar `cy.get('#btn').shadow().find('button').should('not.have.attr', 'disabled')`, ou, para qualquer `@state()`/`@property()` do Lit em geral, `await editorEl.updateComplete` antes de interagir (resolve antes de qualquer `setTimeout`, mesmo `0ms`).

**Regra prática se o menu não abre:** o dispositivo foi clicado antes? `p.texto__dispositivo` tem `contenteditable`? É recém-criado (então precisa de `marcarLinhaAtual`, não de um segundo clique)? Na dúvida, use o menu do dispositivo **pai** (mais robusto, criado na inicialização).

**Arquivos relacionados:** `cypress/support/commands.ts`, `src/components/editor/editor.component.ts` (`montarMenuContexto`).

---

## 5. Seletores CSS dos Dispositivos

**Cenário:** localizar um container de dispositivo específico (artigo, parágrafo, inciso, alínea) no DOM.

```
div.container__elemento.elemento-tipo-{tipo}[id="lxEtaId{N}"]
  ├── div.container__texto.container__texto--nivel{N}
  │     ├── label                                              ← rótulo ("Art. 1.", "§ 1º", "I –")
  │     └── p.texto__dispositivo[id="texto__dispositivo{uuid}"] ← texto editável
  └── div.container__menu
        └── sl-dropdown > sl-menu > sl-menu-item               ← opções do menu de contexto
```

| Dispositivo | Seletor do container |
|-------------|---------------------|
| Artigo (proposição) | `div.container__elemento.elemento-tipo-artigo div.container__texto--nivel0` |
| Artigo (norma) | `div.container__elemento.elemento-tipo-artigo div.container__texto--nivel1` |
| Parágrafo (norma) | `div.container__elemento.elemento-tipo-paragrafo div.container__texto--nivel2` |
| Inciso (norma) | `div.container__elemento.elemento-tipo-inciso div.container__texto--nivel3` |
| Alínea (norma) | `div.container__elemento.elemento-tipo-alinea div.container__texto--nivel4` |

Na prática, prefira os comandos prontos (`cy.getContainerArtigoByNumero`, etc. — ver §10) a montar o seletor à mão.

**Arquivos relacionados:** `cypress/support/commands.ts`.

---

## 6. Setup de Documentos de Teste

**Cenário:** início de qualquer `beforeEach` — criar o documento sobre o qual o teste vai operar.

```typescript
// Proposição em branco
cy.novaProposicao();
cy.getContainerArtigoByNumero(1).should('exist'); // âncora de sync

// Emenda sobre proposição existente
cy.novaEmenda({ projetoNormaSelectValue: 'mpv_905_2019', modoEmendaSelectValue: 'emenda' });

// Emenda de fixture JSON
cy.abrirEmenda({ fixtureEmendaJson: 'fixtures/minha-emenda.json' });
```

**Adicionar dispositivos via menu:** a `descricao` do menu é `'Adicionar {tipo} {posicao}'`; quando a posição é `'filho'`, ela é **omitida** (ex.: artigo → `'Adicionar parágrafo'`, não `'...depois'`); parágrafo/inciso usam `'depois'`/`'antes'` explícitos quando aplicável. Ver `cypress/support/commands.ts` para a tabela completa de opções por tipo de dispositivo clicado.

```typescript
cy.getContainerArtigoByNumero(1).selecionarOpcaoDeMenuDoDispositivo('Adicionar artigo depois');
cy.getContainerArtigoByNumero(2).should('exist'); // sempre ancorar após adicionar
```

**Texto de preenchimento (filler):** dispositivos que existem só para completar a estrutura (destinos de remissão, artigos extras) nascem sem texto. Use `alterarTextoDoDispositivo` (bypassa Quill, seguro para dispositivos que não são o foco da detecção) no final do `beforeEach`. **Nunca** use filler no dispositivo de origem de uma detecção testada dentro do `it()` — isso interfere com `digitarTextoRemissao`, que insere no delta Quill em branco.

**Arquivos relacionados:** `cypress/support/commands.ts`, `cypress/fixtures/`, exemplos completos em `cypress/e2e/remissao-interna/grupo-i-proposicao-grande.cy.ts` (documento grande) e `cypress/e2e/remissao-externa/grupo-a-deteccao-automatica.cy.ts`.

---

## 7. Edição de Texto — Três Mecanismos

**Cenário:** escolher a forma certa de "digitar" texto num dispositivo depende do que o teste precisa verificar.

| Mecanismo | Quando usar | Quando NÃO usar |
|-----------|-------------|------------------|
| `.alterarTextoDoDispositivo(texto)` | Testa Redux/estado (revisão, contadores) — escreve direto no DOM, **bypassa o Quill** (`quill.getText()` fica vazio) | Testes que dependem do delta do Quill (detecção de remissão) |
| `.digitarTextoRemissao(texto)` | Testa detecção/renderização de remissão interna — `quill.insertText(..., 'silent')` + atualiza `quill.linhaAtual` | Quando se quer simular digitação real (não dispara eventos) |
| `.digitarNoDispositivo(texto)` | Simular teclas de controle (`{Enter}`, `{End}`, `{ctrl}z`) via `cy.type()` | Inserir texto comum — **não confiável** (ver abaixo) |

**`cy.type()` não insere texto de forma confiável em `p.texto__dispositivo`** (descoberta de 24/07/2026, Grupo J): pode não inserir nenhum caractere, silenciosamente, sem erro — reproduzido até com `git stash` (não é bug de produto, é limitação do ambiente Cypress + Quill + `contenteditable`). Isso explica testes como `CT-F-08` (`grupo-f-invalidacao-restauracao.cy.ts`) que só passam porque a asserção não depende do texto realmente ter sido digitado.

**Alternativa que funciona — digitação "de verdade":** `quill.insertText(indice, texto, 'user')` via `cy.window()` — atualiza DOM e dispara eventos reais (`text-change`, `selection-change`):

```typescript
cy.window().then((win: any) => {
  const quill = win.document.querySelector('lexml-eta-proposicao-editor').quill;
  const blot = (quill.constructor as any).find(p);
  const indice = blot.offset(quill.scroll);
  quill.setSelection(indice, 0, 'user');
  quill.insertText(indice, 'Conforme o art. 1º.', 'user');
});
```

Duas pegadinhas dessa técnica: (a) `insertText`/`setSelection` **não** atualizam `quill.linhaAtual` sozinhos — chamar `quill.atualizarLinhaCorrente(linha)` explicitamente; (b) um pipeline assíncrono zera `blotConteudo.htmlAnt` ~200ms depois da seleção — se a ação seguinte (ex. sair da linha) tiver algum delay do Cypress, reforçar `htmlAnt = ''` imediatamente antes, depois de um `cy.wait(300)` que deixe o reset assíncrono se assentar primeiro.

**Arquivos relacionados:** `cypress/support/remissao-commands.ts` (`digitarTextoRemissao`, `dispararDeteccaoRemissao`), `cypress/e2e/remissao-interna/grupo-j-deteccao-blur.cy.ts` (CT-J-02, técnica `insertText('user')`).

---

## 8. Acesso a Estado Interno via `cy.window()`

**Cenário:** o teste precisa da instância do Quill, do estado do Redux, ou de qualquer método "privado" de um web component.

```typescript
cy.window().then(win => {
  const editorEl = win.document.querySelector('lexml-eta-proposicao-editor') as any;
  const quill = editorEl?.quill;
  editorEl.emitirEventoOnChange?.('cypress');           // TS "private" não faz name mangling em runtime
  const blot = (quill.constructor as any).find(domElement); // Quill.find() estático
  const position = blot.offset(quill.scroll);
});
```

**Importante:** o callback roda de forma síncrona no browser, mas o Cypress o enfileira como comando assíncrono. Não misturar `cy.get()` direto dentro do callback — usar `cy.wrap()` para devolver controle ao Cypress.

**Arquivos relacionados:** qualquer spec sob `cypress/e2e/remissao-interna/` e `cypress/e2e/remissao-externa/` usa este padrão extensivamente.

---

## 9. Sincronização — Âncoras em vez de `cy.wait`

**Cenário:** qualquer ponto do teste onde é preciso esperar o app reagir a uma ação.

`cy.wait(número)` fixo é anti-padrão — lento e frágil (timing varia entre máquinas/CI). Usar assertions como âncora:

```typescript
// ❌
cy.get('#projetoNorma').select('novo');
cy.wait(1000);
cy.getContainerArtigoByNumero(1).click();

// ✅
cy.get('#projetoNorma').select('novo');
cy.getContainerArtigoByNumero(1).should('exist');
cy.getContainerArtigoByNumero(1).click();
```

Exceção: `cy.wait('@alias')` para aguardar requisições de rede é correto.

**Arquivos relacionados:** padrão usado em todos os specs; ver `cypress/e2e/remissao-interna/grupo-a-deteccao-absoluta.cy.ts` para exemplos simples.

---

## 10. Comandos Customizados Disponíveis

**Cenário:** referência rápida antes de escrever um comando novo — provavelmente já existe.

**Setup e navegação** (`cypress/support/commands.ts`): `cy.novaProposicao(selectValue?)`, `cy.novaEmenda({...})`, `cy.abrirEmenda({...})`, `cy.abrirProposicao(fixtureJson)`, `cy.irParaPagina(numeroPagina)`, `cy.ignorarErro(text)`.

**Localização de dispositivos** (`cypress/support/commands.ts`): `cy.getContainerArtigoByNumero`, `cy.getContainerArtigoNormaByNumero`, `cy.getContainerArtigoByRotulo`, `cy.getContainerArtigoNormaByRotulo`, `cy.getContainerParagrafoNormaByRotulo`, `cy.getContainerIncisoNormaByRotulo`, `cy.getContainerAlineaNormaByRotulo`.

**Interação com dispositivos** (`cypress/support/commands.ts`, prevSubject): `.selecionarOpcaoDeMenuDoDispositivo(opcao)`, `.alterarTextoDoDispositivo(texto)`, `.digitarNoDispositivo(texto, replace?)`, `.getTextoDoDispositivo()`, `.focusOnConteudo()`.

**Revisão** (`cypress/support/commands.ts`): `cy.ativarRevisaoDispositivo()`, `cy.desativarRevisaoDispositivo()`, `cy.getSwitchRevisaoDispositivo()`, `.getCheckRevisao()`, `.getContadorRevisao()`.

**Remissão interna** (`cypress/support/remissao-commands.ts`): `.digitarTextoRemissao(texto)`, `.dispararDeteccaoRemissao()`, `.sincronizarTextoComQuill()`, `.posicionarCursorNoDispositivo()`, `cy.forcarSaidaDoEditor()` (simula o Gatilho B de blur), `cy.clicarAdicionarRemissao()`, `cy.clicarRemoverRemissao()`, `cy.getBotaoAdicionarRemissao()`, `cy.getBotaoRemoverRemissao()`, `cy.getLinksRemissao()`, `cy.getLinksRemissaoInvalidos()`, `cy.getLinkRemissaoPorRefId(refId)`, `cy.getDestinoRemissaoDestacado()`.

**Arquivos relacionados:** `cypress/support/commands.ts`, `cypress/support/remissao-commands.ts`.

---

## 11. Padrões e Anti-padrões

**Cenário:** checklist rápido ao revisar ou escrever um spec.

**✅ Faça:**
- `beforeEach` reconstruindo o estado antes de cada `it()`.
- `.should('exist')` como âncora após criar dispositivos.
- Re-consultar por ID estável após interações que disparam re-render do LitElement.
- `{ force: true }` em cliques imediatamente subsequentes a um re-render.
- Acessar APIs internas via `cy.window().then()`.
- Comentar em português o *porquê* de abordagens não-óbvias.
- Antes de investigar fundo uma falha após várias mudanças, checar com `git stash` se já existia antes (§13.1).
- Se um seletor de texto/label "sempre funcionou" e agora falha, `grep` pelo texto atual em `src/` — pode ser um refactor de produto, não um bug de mecanismo.

**❌ Não faça:**
- `cy.wait(número)` fixo.
- `alterarTextoDoDispositivo` em testes que dependem do delta do Quill.
- `cy.type()` para texto comum em `p.texto__dispositivo` — use `quill.insertText(idx, texto, 'user')` (§7).
- Assumir que um `@state()`/`@property()` do Lit já mudado em JS já está no DOM — aguardar `updateComplete` (§4).
- Declarar `const`/`function` de nível superior num `.cy.ts` novo sem checar colisão de nome global (§1).
- Guardar referências a nodes DOM que podem ser re-renderizados pelo LitElement.
- `quill.setSelection(x, 0, 'user')` em `cy.window()` para forçar menu — usar `marcarLinhaAtual` (§4).
- Escrever em `(quill as any)._linhaAtual` — só tem getter; usar `marcarLinhaAtual`.

---

## 12. Diagnóstico de Falhas Comuns

**Cenário:** um teste falha com um erro reconhecível — antes de investigar do zero, checar esta tabela.

| Erro / Sintoma | Causa provável | Solução |
|------|----------------|---------|
| `element has been detached from the DOM` | LitElement re-renderizou após clique | Re-consultar por ID estável + `{force: true}` (§3) |
| `cy.find() failed because the page updated` após clicar `sl-dropdown` | Cadeia encadeada; dropdown detachado durante retry | Duas chamadas `.find()` separadas (§3) |
| `Expected to find content: 'Adicionar X depois'` | Nome de menu incorreto — posição `'filho'` é omitida | Ver tabela do §6 |
| `Timed out retrying: Expected to find element` | Seletor errado ou elemento no shadow DOM | Inspecionar DOM; tentar `.shadow()` (§2) |
| Link de remissão não criado (0 links) | `dispositivoDestino` não existe na articulação | Criar a estrutura completa antes de detectar |
| Link de remissão criado na posição errada / não criado após `digitarTextoRemissao` | `quill.getText()` vazio, ou `linhaAtual` desatualizada | Não usar `alterarTextoDoDispositivo`; checar `atualizarLinhaCorrente` |
| Menu de contexto não abre | Re-render desconectou `sl-dropdown`, ou dispositivo recém-criado | Padrão de re-consulta (§3); `marcarLinhaAtual` (§4) |
| `btnConfirmar.click()` não fecha diálogo Shoelace | `disabled` attribute ainda presente no shadow (Lit async) | Aguardar `.shadow().find('button').should('not.have.attr', 'disabled')` |
| Campo `sl-input` não responde a `.type()` | `<input>` real está no shadow DOM | `.shadow().find('input').type(texto)` — id `#busca-int` desde 14/05/2026 |
| `cy.type()` "roda" sem erro mas texto não aparece | Limitação do ambiente para `p.texto__dispositivo` | `quill.insertText(idx, texto, 'user')` (§7) |
| Botão fica `disabled` mesmo com `@state()` já `true` | Lit atualiza DOM de forma assíncrona | `await editorEl.updateComplete` antes de interagir (§4) |
| `TypeError: leaf.position is not a function` (dentro de `setTimeout` de `setSelection`) | Índice capturado ficou inválido porque algo reconstruiu um blot estrutural antes do timeout disparar | No produto: `try/catch` ao redor de `setSelection` restaurado (best-effort). No teste: medir *taxa* de falha antes de concluir causa (§13.4) |
| Falha só aparece após várias mudanças em `src/`, incerto se é regressão | — | `git stash` para isolar (§13.1) |

**Arquivos relacionados:** tabela consolidada a partir de descobertas em `cypress/e2e/remissao-interna/*` e `cypress/e2e/remissao-externa/*`.

---

## 13. Técnicas de Diagnóstico Avançado

**Cenário:** uma falha não tem causa óbvia e as âncoras de sincronização (§9) não bastam para entender o que está acontecendo no browser.

### 13.1 Isolar regressão vs. pré-existente: `git stash`
```bash
git stash
rm -rf out-tsc && npx tsc && npm run copy:quill1table
npx cypress run --spec "cypress/e2e/.../spec-suspeito.cy.ts"
# se falhar igual: é pré-existente
git stash pop
```
`git stash` só afeta arquivos **tracked** — specs de debug novos (untracked) continuam intactos. Sempre `git status` antes/depois.

### 13.2 Specs de debug descartáveis com `throw new Error(...)`
Um `throw` com os valores internos que se quer inspecionar aparece formatado na saída do `cypress run`, sem precisar de debugger interativo. Prefixar `zzz-debug.cy.ts` e **apagar ao final** — nunca commitar.

### 13.3 Espionar (monkey-patch) um método via `cy.window()`
```typescript
const original = editorEl.flushEdicaoPendente.bind(editorEl);
editorEl.flushEdicaoPendente = (): void => {
  (win as any).__chamadas.push({ uuid: editorEl.quill?.linhaAtual?.uuid, quando: Date.now() });
  original();
};
```
`private` do TypeScript não faz name mangling em runtime — qualquer método é substituível a partir do teste.

### 13.4 Isolar flakiness pré-existente: comparar *taxas* de falha
Para falhas intermitentes (race conditions), uma única execução de cada lado não prova nada. Rodar a spec **5+ vezes** com e sem a mudança (`git stash`) e comparar contagens de falha, não um único resultado. Taxas parecidas → flakiness pré-existente; diferença clara e consistente → regressão real.

### 13.5 Capturar logs que sobrevivem a um crash não tratado
Suprimir a falha automática (`Cypress.on('uncaught:exception', () => false)`), capturar `console.log` num array em `window` via `window:before:load`, e gravar em arquivo no `afterEach` — independente do teste ter passado. **Temporário**: remover a instrumentação e o diretório de logs ao final.

### 13.6 Rastrear a origem de uma chamada assíncrona via stack trace no agendamento
Quando vários `setTimeout` competem, capturar `new Error().stack` no momento do **agendamento** (não só onde o callback executa), com timestamp — reconstrói a sequência causal de uma race entre timers.

---

## 14. Comportamentos do Editor que Afetam Qualquer E2E

> Descobertos no E2E colaborativo (Playwright, `e2e-collab/`), mas são comportamentos do **editor**, não do framework de teste — valem igualmente para Cypress.

**Cenário:** testes que disparam atalhos de teclado ou testam transformação de tipo de dispositivo (TAB/Shift+TAB) logo após uma operação estrutural.

- **14.1 Rebuild estrutural solta o foco:** undo/redo, transformação TAB, adicionar/remover dispositivo reconstroem o DOM via `processarStateEvents`, soltando o foco. Um atalho de teclado disparado logo depois (Ctrl+Z, Ctrl+Y, Tab) chega sem foco no editor → vira navegação do browser, no-op silencioso. Mitigação: preferir botão de toolbar (chama `quill.undo()/redo()` direto) ou re-focar o dispositivo antes de disparar a tecla.
- **14.2 Seletores por `title` colidem entre os dois editores:** o editor de articulação e o `editor-texto-rico` têm botões com o **mesmo `title`** (ex. `"Refazer (Ctrl+y)"`). Usar classe única: `.lx-eta-btn-desfazer` / `.lx-eta-btn-refazer`.
- **14.3 Nem toda transformação TAB é permitida — no-op silencioso:** `isAcaoTransformacaoPermitida` bloqueia sem erro. Usar um caso comprovadamente permitido (ex.: Shift+Tab promovendo um inciso → parágrafo). Ver `cypress/e2e/transformacao/tab-artigo-em-paragrafo.cy.ts`.
- **14.4 (Playwright/colaboração) Instrumentar a camada de sync:** `console.log` temporário em `src/collab/*` + captura por página (`page.on('console', ...)`, prefixos `A>`/`B>`) localiza em qual lado e passo o fluxo de convergência quebra.

**Arquivos relacionados:** `cypress/e2e/transformacao/tab-artigo-em-paragrafo.cy.ts`, `cypress/e2e/revisao/revisao.cy.ts`, `src/components/editor/editor.component.ts` (`processarStateEvents`).

---

## Referência completa

Esta é uma versão condensada e reorganizada. Para o texto integral, com todo o histórico de descobertas, datas e a narrativa completa de cada investigação, ver `docs/guias/GUIA_CYPRESS.md`.
