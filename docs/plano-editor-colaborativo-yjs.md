# Documento de Análise e Planejamento Técnico — Editor Multi-Usuário (Yjs/CRDT) no LexML-ETA

| Item | Detalhes |
|------|----------|
| **Status** | 📐 Planejamento (blueprint) |
| **Branch** | `feat/yjs-editor` |
| **Autor** | Análise técnica assistida (Claude) + validação com o time |
| **Data** | 27/07/2026 |
| **Decisões do time** | (1) Co-edição em tempo real, CRDT fino (caractere-a-caractere). (2) Servidor Yjs em sidecar Node (y-websocket) **com degradação graciosa obrigatória**. |

> **Aviso de leitura.** Este documento **corrige a premissa central do prompt original**. A decisão que o prompt colocou como primária (migrar Quill 2.x por causa do `document.getSelection()` no Shadow DOM vs. mitigar CSS no Light DOM) **é falsa para esta base de código**: o editor já roda 100% em Light DOM. A decisão que realmente domina o projeto é outra e está na §2 (ADR-001).

---

## 1. Sumário Executivo

### 1.1 Estado atual do LexML-ETA (o que a varredura revelou)

O LexML-ETA é um web component Lit 2.x que edita a articulação de proposições legislativas. Cinco fatos de código determinam todo o resto:

| # | Fato de código | Evidência | Impacto no projeto |
|---|----------------|-----------|--------------------|
| F1 | **O editor já roda em Light DOM.** | `editor.component.ts:157`, `editor-texto-rico.component.ts:112`, `lexml-eta.component.ts:480`, `lexml-eta-proposicao.component.ts:33`, `articulacao.component.ts:20` — todos `createRenderRoot() { return this; }`. | O "problema Shadow DOM + getSelection" que motivava a ADR do prompt **não existe aqui**. A "Abordagem B" já é o status quo. |
| F2 | **O Quill é uma _view_, não o modelo.** | Fonte da verdade = Redux (árvore `Elemento`/`Dispositivo`). Redux→Quill via `processarStateEvents`/`StateType` (`editor.component.ts:812`); Quill→Redux via `ATUALIZAR_TEXTO_ELEMENTO` (`editor.component.ts:1518`). | As referências (Velotio/NeelParihar) assumem que o documento Quill **é** o modelo compartilhado. Aqui isso é falso. É o eixo de risco nº 1. |
| F3 | **Só um pedaço do documento está no Quill.** | Paginação carrega um _range_ de artigos por vez (`docs/paginacao.md`; `paginacaoUtil.ts`). | O CRDT precisa sincronizar o **documento inteiro**, mas o Quill só tem uma página no DOM. Binding não pode ser "Quill inteiro ↔ Y.Doc". |
| F4 | **Identidade do dispositivo é local.** | `dispositivo.uuid = Counter.next()` (`reducerUtil.ts:34`) — contador monotônico por cliente. | Sob concorrência, dois clientes geram uuids colidentes. Identidade precisa virar id global compartilhado. |
| F5 | **Alto acoplamento ao Parchment 1.x.** | ~21 `EtaBlot*` + `quill1-table` (3rd-party) + `EtaQuill` (480 linhas) + módulos (revisão, nota de rodapé, remissão, aspas) + `eta-keyboard.ts` (19KB) + layout `<table>` (`eta-container-table.ts`). | Migrar para Quill 2.x = reescrever a camada de blots (semanas, alto risco). E o Delta nem muda. |

Fatos adicionais úteis:
- **Awareness já tem insumo pronto:** `LexmlEtaParametrosEdicao.usuario` (`Usuario {nome, id, sigla}`, `lexml-eta.component.ts:77`) já é passado hoje para marcas de revisão.
- **Aplicação hospedeira:** o `lexml-eta` é embutido por uma aplicação host (por exemplo, o `lexeditweb`), que autentica o usuário e carrega/salva o documento. Sem WebSocket hoje.
- **Ponto de flush já existe:** `getProjetoAtualizado()` chama `flushEdicaoPendente()` (`lexml-eta-proposicao.component.ts:52`) — a arquitetura de "detecção por blur" já desacopla o tempo-de-tecla do tempo-de-commit no Redux. Isso é reaproveitado pelo binding CRDT (§3.3).

### 1.2 Objetivo da integração

Permitir que múltiplos usuários editem a mesma proposição simultaneamente, incluindo **dois usuários digitando no mesmo dispositivo ao mesmo tempo**, com resolução de conflitos por CRDT (Yjs), presença/cursores por usuário, e **degradação graciosa**: se o sidecar Node estiver indisponível, o editor continua funcionando em modo single-user, sem perda de funcionalidade e sem bloquear carregar/salvar.

### 1.3 A tese arquitetural (resumo de uma frase)

> **O Redux é a fonte da verdade nas fronteiras de commit (estrutura, numeração, carregar/salvar); o Yjs é um _overlay_ anexável que espelha o domínio (não o Delta do Quill). O texto ganha um caminho rápido `Y.Text` por dispositivo; a estrutura viaja por ações Redux marcadas como remotas. Se o overlay não anexa, o app é exatamente o de hoje.**

> **Precisão sobre "fonte da verdade" (uma distinção que importa).** A frase acima vale **nas fronteiras de commit** (blur/flush e salvar). **Durante a digitação ativa de um dispositivo, o valor vivo e autoritativo do texto é o `Y.Text` compartilhado** — o Redux guarda apenas uma cópia materializada, atualizada no _flush_ por blur (§3.3). Ou seja: o `Y.Text` fica tipicamente à frente do Redux para a linha em edição. O Redux é a verdade para **estrutura, numeração e o ciclo carregar/salvar** (que passa pelo host); o `Y.Text` é a verdade para o **conteúdo textual enquanto ele é co-editado**. Não há "texto do usuário A" vs "texto do usuário B": há um único documento convergido, idêntico em todas as réplicas e no sidecar (ver a semântica de undo na §3.6).

---

## 2. Análise de Viabilidade e Decisões Arquiteturais (ADRs)

### ADR-001 — O que é sincronizado por CRDT: o domínio (Redux), não o Delta do Quill

**Contexto.** O padrão das referências é `new QuillBinding(ytext, quill)`: liga **um** editor Quill a **um** `Y.Text`, tratando o Delta como o documento. Aqui isso quebra por F2 (Quill é view do Redux), F3 (só uma página no Quill) e pelas features que assumem mutação sequencial (revisão, remissão, numeração automática, undo/redo).

**Opções avaliadas.**

| Opção | Descrição | Veredito |
|-------|-----------|----------|
| **A. `y-quill` puro** | Liga o Quill da página a um `Y.Text`/`Y.XmlFragment` único. | ❌ **Rejeitada.** Cria 3 fontes de verdade (Yjs, Redux, Quill) que brigam com o render Redux→Quill; sincroniza só a página visível; ignora revisão/remissão/numeração. |
| **B. Tornar o Quill a fonte da verdade** | Reescrever o domínio para derivar de um `Y.XmlFragment` estilo ProseMirror. | ❌ **Rejeitada.** Reescreve todo o `src/model` e os 40+ reducers. Meses de trabalho; joga fora numeração/remissão/revisão maduros. |
| **C. Binding domínio↔Yjs, Redux como verdade** | Y.Doc espelha a árvore da articulação (`Y.Array`/`Y.Map`), com **`Y.Text` por dispositivo** para o texto. Estrutura viaja por ações Redux; texto por caminho rápido. | ✅ **Escolhida.** Alinha com a arquitetura atual, viabiliza degradação graciosa, preserva o domínio. Custo: construir a camada de binding e reforçar identidade/undo/numeração sob concorrência. |

**Decisão.** Opção C. Detalhes de modelo em ADR-004 e §3.

---

### ADR-002 — Manter Quill 1.3.7; migração para 2.x fica FORA do escopo desta feature

**Contexto.** O prompt tratou "Quill 2.x vs Light DOM" como a decisão primária, movida pelo `document.getSelection()` no Shadow DOM.

**Análise crítica.**
- Por **F1**, o editor já é Light DOM. O `getSelection()` funciona hoje (usado em `eta-clipboard.ts`, `eta-keyboard.ts`, `eta-blot-menu-item.ts`). **Não há problema de Shadow DOM a resolver.**
- O único motivo remanescente para 2.x seria compatibilidade com `y-quill`/`quill-cursors`. Mas em ADR-001 **não usamos o `QuillBinding` de prateleira** — usamos um binding customizado por linha (§3.4). Logo, a compatibilidade de versão do `y-quill` deixa de ser fator.
- Por **F5**, migrar 2.x reescreve ~26 blots + tabela + keyboard. Acoplar isso ao projeto de colaboração multiplica o risco sem benefício direto.

**Decisão.** **Permanecer em Quill 1.3.7** durante todo o projeto de colaboração. `quill-cursors` é compatível com 1.3.x. Uma eventual migração 2.x é um projeto **independente**, avaliado depois, por razões de manutenção — nunca como pré-requisito desta feature.

> **Correção explícita ao prompt:** a dicotomia "Abordagem A (Quill 2.x) vs Abordagem B (Light DOM)" está **resolvida por evidência**: já estamos em B, e A não é necessária. Nenhuma das duas é a decisão difícil.

---

### ADR-003 — Servidor de sincronização: sidecar Node (y-websocket), com o host como autoridade de persistência e de acesso, e degradação graciosa

**Contexto.** Não existe implementação madura do protocolo binário de sync/awareness do Yjs em Java. O time optou por um sidecar Node com degradação graciosa.

**Topologia.**

```
+----------------+   carrega/salva JSON   +-----------------------+
| Aplicação host |<---------------------->| Backend do host       |
| <lexml-eta>    |                        | (autoridade de        |
+-------+--------+                        |  persistência/acesso) |
        |                                 +-----------+-----------+
        | WebSocket (y-websocket)                     | seed/snapshot
        v                                             v
+----------------------------------------------------------------+
| Servidor de sincronização (sidecar Node, y-websocket)          |
| - salas por documento                                          |
| - mantém o Y.Doc vivo em memória                               |
| - persistência de curta duração                                |
| - snapshot periódico -> backend do host                        |
+----------------------------------------------------------------+
```

**Divisão de responsabilidades.**
- **Backend do host = autoridade de persistência e de acesso.** O documento durável continua sendo o LexML/JSON no banco do host (fluxo atual). O sidecar **não** é o dono do dado.
- **Sidecar = estado vivo do Y.Doc.** Ao criar a sala, o sidecar busca o _seed_ no host (JSON da proposição → conversão determinística para update Yjs, §3.7), garantindo que todos os clientes convirjam sobre a mesma base. Periodicamente e ao esvaziar a sala, devolve um snapshot ao host.
- **Acesso.** O handshake do WebSocket carrega um token de sala; o sidecar o valida antes de admitir o cliente (ver "Acesso à sala e token de sala"). Dados de proposição não podem trafegar sem controle de acesso.

**Degradação graciosa (requisito do time) — como é garantida por construção.**
Como o Redux é a verdade (ADR-001) e carregar/salvar passa pelo host (não pelo sidecar), o overlay Yjs é estritamente **opcional**:

1. `inicializarEdicao()` carrega o JSON → Redux e renderiza — **igual a hoje**, sem tocar em Yjs.
2. Em paralelo, a `YjsCollabService` tenta conectar ao sidecar com _timeout_ curto.
3. **Sucesso:** entra na sala e **puxa o `Y.Doc` já semeado pela sala** (ancestralidade compartilhada — **sem seed local**, evita o Caso B da §3.10.2). Liga cursores/awareness, badge "Colaboração ativa".
4. **Falha/timeout/queda:** desconecta-se **apenas o `WebsocketProvider`**. Se o `Y.Doc` já existia (caiu depois de conectar), ele **permanece vivo**; se nunca conectou (cold-start), **semeia-se um `Y.Doc` local** determinístico a partir do mesmo LexML. Em ambos os casos o `Y.Doc` local (persistido em `y-indexeddb`) passa a **lastrear edição e undo**; o app opera como single-user e `getProjetoAtualizado()`/salvar continuam lendo o Redux. **(Nunca se desanexa o `Y.Doc` — §3.10.1.)**
5. **Reconexão:** ao voltar, o Yjs faz o sync padrão por _state vector_ e mescla **automaticamente** as edições offline (caso "reconnect morno", §3.10.2-A). O único caso que exige política explícita é o **cold start** (sidecar indisponível já na abertura) — tratado em §3.10.3.

**Acesso à sala e token de sala.**

O navegador nunca é autoridade de acesso: tudo no `lexml-eta` é adulterável pelo cliente. A decisão fica no servidor, em três papéis distintos:

| Papel | Quem | Observação |
|---|---|---|
| **Decidir** quem pode entrar na sala | backend do host | fonte única da decisão |
| **Impor o gate** (recusar antes de qualquer sync) | sidecar, no handshake | com base no token de sala |
| **Consumir** a decisão (habilitar ou esconder "colaborar") | `lexml-eta` | apenas UX, nunca o gate |

**Contrato do token de sala (host ↔ componente ↔ sidecar).** Quando o host decide que o usuário pode colaborar naquele documento, passa ao componente `params.colaboracao = { roomId, wsUrl, token }`:

- `roomId`: identifica a sala (derivada do documento);
- `wsUrl`: endereço do servidor de sincronização;
- `token`: credencial **opaca**, emitida pelo host, que comprova que a sessão do usuário está autorizada naquela sala. O `lexml-eta` **não a interpreta nem a valida**: só a repassa ao servidor, como parâmetro do handshake. O servidor a valida e **recusa totalmente** quem não estiver autorizado (sem leitura parcial na v1);
- a identidade usada em presença e cursores (nome, id, sigla) vem da **validação do token no servidor**, nunca de `params.usuario` (§3.5);
- sem `colaboracao` nos parâmetros, ou sem identidade estável do usuário (anônimo), a colaboração fica **desligada** e o editor opera como single-user;
- formato, validade e renovação do token são definidos pelo host e pelo servidor, fora deste repositório.

> **Antipadrão a recusar:** deixar o `lexml-eta` decidir o acesso "para simplificar". A segurança depende de o gate estar no servidor.

**Decisão.** Sidecar Node y-websocket; host como autoridade de persistência e de acesso; overlay opcional que nunca está no caminho crítico de load/save; gate no handshake com token de sala; usuário sem identidade estável sempre em single-user.

---

### ADR-004 — Modelo de dados no Y.Doc

**Estrutura compartilhada (esboço).**

```
Y.Doc
 └─ Y.Array "articulacao"          // ordem de leitura dos dispositivos (flat, como paginaçãoUtil já trabalha)
      └─ Y.Map (por dispositivo)
           ├─ "gid": string         // id global estável (substitui uuid local, F4)
           ├─ "tipo": string        // 'Artigo' | 'Paragrafo' | 'Inciso' | ...
           ├─ "paiGid": string      // referência hierárquica (pai)
           ├─ "conteudo": Y.Text    // ⟵ caractere-a-caractere (co-edição fina)
           └─ "meta": Y.Map         // situacao, notaAlteracao, abreAspas, etc.
 └─ Y.Map "documento"               // ementa, preâmbulo, epígrafe (também Y.Text)
```

**Princípios.**
1. **`Y.Text` por dispositivo** é o que habilita dois usuários no mesmo dispositivo. Formatação inline (negrito/itálico) e **remissões** viram atributos/embeds no `Y.Text` (delta com atributos), não texto plano.
2. **Identidade = `gid` global.** Gerado com `crypto.randomUUID()` por quem cria o dispositivo, propagado pelo Y.Map. O `uuid` numérico local do Redux passa a ser um índice derivado do `gid` (tabela `gid↔uuid` no cliente). Corrige F4.
3. **Numeração é DERIVADA, nunca sincronizada.** `rotulo`/`id`(lexmlId)/`numero` são recomputados localmente por cada cliente a partir da estrutura (a numeração automática já é função da posição). Assim, renumeração nunca gera conflito CRDT — cada cliente recalcula após a estrutura convergir. A remissão, que depende de lexmlId, é re-sincronizada pelo `sincronizarRemissoes` existente após a convergência.
4. **`meta` como Y.Map** para campos de baixa frequência **não-deriváveis** — `situacao`, `notaAlteracao`, `abreAspas`/`fechaAspas`, `textoOmitido` (o conjunto exato vem da §3.6.3); resolução last-writer-wins do Yjs é aceitável aí. **Revisão NÃO entra no `meta` na v1** (modo exclusivo, §7.1).

---

## 3. Arquitetura da Solução

### 3.1 Visão geral: dois caminhos de dados

O ponto não-óbvio: **texto** e **estrutura** têm requisitos opostos e por isso trafegam por caminhos diferentes.

| Aspecto | Frequência | Caminho | Por quê |
|---------|-----------|---------|---------|
| **Texto** (digitação) | altíssima (por tecla) | **Rápido:** Quill blot ↔ `Y.Text` (binding por linha, §3.4). Redux é atualizado só no _flush_/blur. | Rotear cada tecla por Redux + re-render seria lento e brigaria com o CRDT. Reusa a "detecção por blur" já existente. |
| **Estrutura** (add/remover/mover/tipo/renumerar) | baixa | **Redux:** ação local → op no `Y.Array`; op remota → `dispatch(acao, {origem:'remote'})`. | Estrutura precisa passar pela lógica de domínio (numeração, paginação, situação…) que já vive nos reducers. |

> **Corolário sobre a fonte da verdade (ver também §1.3).** Por causa do caminho rápido do texto, o `Y.Text` de um dispositivo em edição fica **à frente** do Redux até o próximo _flush_ por blur. Logo, o texto autoritativo **enquanto se digita** é o `Y.Text`; o Redux só é a cópia canônica **nas fronteiras de commit**. Isso não quebra nada porque remissão/numeração/salvar só leem o texto no _flush_ (nunca per-keystroke de um dispositivo que outro usuário está digitando).

### 3.2 A camada de binding: `YjsCollabService`

Novo módulo (ex.: `src/collab/yjsCollabService.ts`) responsável por:
- Gerenciar `Y.Doc`, `WebsocketProvider`, `Awareness`, `UndoManager`.
- **Estrutura:** observar `Y.Array "articulacao"` → traduzir para ações Redux remotas; e assinar o store Redux → traduzir mutações estruturais locais para ops no `Y.Array`.
- **Texto:** instanciar/rebindar os bindings por linha (§3.4) conforme dispositivos entram/saem do Quill (paginação, §3.8).
- **Ciclo de vida:** `attach()`, `detach()`, `onConnLost()`, `onReconnect()` — o coração da degradação graciosa.

**Anti-eco (invariante crítico):** toda mutação originada de um evento remoto deve ser marcada (`origem:'remote'`) para **não** ser reenviada ao Yjs. Sem isso, loop infinito. Padrão Yjs: usar `transact(doc, fn, origin)` e filtrar por `origin` nos observers.

### 3.3 Fluxo do texto e o reaproveitamento do flush por blur

Hoje: digitação → `onTextChange` (`eta-quill.ts:178`) → no blur, `flushEdicaoPendente()` → `ATUALIZAR_TEXTO_ELEMENTO` no Redux → remissão/numeração/save leem o Redux.

Com colaboração:
- Digitação local → binding por linha aplica no `Y.Text` do dispositivo (fonte viva do texto) **e** o Quill renderiza (o próprio Yjs ecoa de volta).
- No **blur** (`flushEdicaoPendente`, já existe): copia o conteúdo do `Y.Text` → `ATUALIZAR_TEXTO_ELEMENTO` no Redux, para que remissão/numeração/`getProjetoAtualizado` continuem corretos.
- Texto **remoto** → o binding aplica o delta no blot correto; um _debounce_ leva ao Redux (mesma porta do blur) para manter o Redux fresco sem re-render a cada tecla remota.

> Alinhamento feliz: a arquitetura de "detecção híbrida por blur" (`docs/PLANO_DETECCAO_BLUR.md`) já separou tempo-de-tecla de tempo-de-commit. O binding CRDT encaixa nesse mesmo ponto de flush.

### 3.4 Binding por linha (por que não dá para usar o `QuillBinding` de prateleira)

O `QuillBinding` liga **um** `Y.Text` a **um** editor Quill inteiro. Aqui, uma página do Quill tem **N** dispositivos, cada um com seu `Y.Text`, dentro de um layout de `<table>` com blots estruturais (rótulo, menu). Precisamos de um binding que:
- Mapeie **o intervalo (range) de um blot de conteúdo** ↔ um `Y.Text` específico.
- Local: capture o sub-delta que caiu **dentro** daquele range e aplique no `Y.Text` correspondente (traduzindo índices absolutos do Quill → índices relativos do `Y.Text`, como o `y-quill` faz internamente).
- Remoto: aplique o delta do `Y.Text` via `quill.updateContents(delta, 'silent')` **restrito ao range daquele dispositivo** — exatamente o invariante que a feature de remissão já exige (nunca usar `getText()` global; ver `CLAUDE.md` invariante (b)/(c)).

Isso é, na prática, reimplementar a tradução Delta↔Y.Text **escopada por linha**. É trabalho real, mas delimitado, e reusa lógica bem entendida.

### 3.5 Awareness e cursores

- **Identidade server-authoritative (anti-impersonação):** hoje `LexmlEtaParametrosEdicao.usuario` é **fornecido pelo cliente** (`lexml-eta.component.ts:289`) — inofensivo para marca de revisão single-user, mas sob colaboração deixaria um usuário **se passar por outro** nos cursores/atribuição. Portanto, a identidade usada em awareness deve vir da **validação da sessão pelo host** (embutida no token de sala, ADR-003), **não** do `params.usuario`. O sidecar recebe a identidade (`{nome, id, sigla}`) da validação — nunca confia no que o cliente diz ser — e o cliente publica `{..., cor}` no `awareness.setLocalStateField('user', ...)` a partir dela.
- Cursores: `quill-cursors` (compatível com 1.3.7). Cuidado específico: como o layout é `<table>` e há blots estruturais (rótulo/menu), a posição do cursor remoto precisa ser resolvida via o mesmo mapeamento range↔`Y.Text` do §3.4, não por índice global do Quill.
- Presença estrutural: além do cursor no texto, exibir "quem está em qual dispositivo" (útil mesmo quando não estão no mesmo `Y.Text`).

### 3.6 Undo/Redo isolado por usuário

Este é um dos pontos mais difíceis (ver Riscos R3). Hoje o undo é um histórico Redux customizado (`undoRedoReducerUtil.ts`) que reconstrói o estado anterior — **global**, não por usuário.

#### 3.6.1 Semântica de undo colaborativo (o que "isolado" quer dizer)

**"Isolado" não significa que cada usuário tem uma cópia separada do texto.** Há um único `Y.Text` compartilhado, replicado de forma idêntica em cada cliente e no sidecar; a garantia central do CRDT é que todas as réplicas convergem para o mesmo estado. Portanto **não existe "texto do usuário A" vs "texto do usuário B" como fontes concorrentes** — há um só documento convergido.

O `Ctrl+Z` **não** reverte o documento para um snapshot anterior (isso seria o undo ingênuo — e seria _errado_, pois apagaria o trabalho do outro). O `Y.UndoManager` gera uma **operação inversa apenas das mudanças que o próprio usuário fez**, identificadas pela **identidade CRDT de cada caractere** (não por posição). Essa inversa é uma **operação CRDT nova e normal**, que se propaga para todos os peers e para o sidecar como qualquer edição. É o mesmo comportamento do Google Docs — é a semântica **correta** para colaboração, não uma limitação.

**Exemplo com edições entrelaçadas (o caso que importa):**
1. A digita `foo`. Estado compartilhado: `foo`.
2. B insere `x` no meio → `fxoo`. Ambos veem `fxoo`.
3. **A dá `Ctrl+Z`:** o UndoManager de A remove só os caracteres que A inseriu (`f`, `o`, `o`). Sobra `x`.
4. Essa remoção sincroniza para B e para o sidecar. **B continua vendo o seu `x`**; só o que A inseriu sumiu. Ambos permanecem convergentes.

O undo de A **não** desfez nada de B, e não houve "escolha de vencedor". **Redo** funciona igual, na direção oposta: o `UndoManager` mantém a pilha de redo e reaplica a operação, também como update CRDT propagado.

Respostas diretas: (a) o undo desfaz **só** as contribuições do próprio usuário; (b) o texto do outro é preservado (salvo dependência estrutural direta); (c) **sim**, o desfazer é sincronizado com o sidecar e demais peers — não há estado local secreto; (d) a fonte da verdade do conteúdo, enquanto co-editado, é o `Y.Text` convergido (ver §1.3), não "o texto de um dos dois".

#### 3.6.2 Como o undo estrutural convive com o histórico Redux atual

Esta é a parte do plano com maior risco de retrabalho escondido. Ela exige entender **como o undo funciona hoje** — porque o modelo atual é fundamentalmente incompatível com concorrência, e a decisão de coexistência decorre disso.

##### (a) O modelo de undo atual (fatos do código)

O undo/redo do LexML-ETA **não** é baseado em diffs nem em `Y.UndoManager`-style. É um **histórico de eventos (event-sourced), global e linear**:

| Propriedade | Evidência | Descrição |
|-------------|-----------|-----------|
| **Event-sourced** | `stateReducerUtil.ts:6` (`buildPast`) | Cada ação estrutural empilha em `state.past` um **clone profundo** (`JSON.parse(JSON.stringify(events))`) do lote de `StateEvent`s que emitiu. `state.past: StateEvent[][]`, idem `state.future`. |
| **Inverso por tipo de evento** | `undo.ts:86-87` | O undo mapeia cada evento ao seu inverso: `ElementoIncluido`→`remover()`, `ElementoRemovido`→`incluir()`, `ElementoModificado`→`processarModificados(...,'UNDO')`, `ElementoRenumerado`→recomputa, `ElementoSuprimido`/`Restaurado`→inverte situação, revisão→inverte. |
| **Baseado em snapshot** | `undoRedoReducerUtil.ts:83-115` (`redodDispositivoExcluido`) | O inverso reconstrói o dispositivo **a partir do snapshot `Elemento`** guardado (texto, numero, rotulo, lexmlId, situação). Assume que a árvore está em forma compatível no momento do undo. |
| **Global e linear (LIFO)** | `undo.ts:29` (`state.past.pop()`) | `Ctrl+Z` desfaz **a última ação, de quem quer que seja** — não há noção de autoria no histórico. |
| **Redux é o executor** | `undo.ts:32-47` | O undo **muta `state.articulacao` diretamente** e emite eventos de render. Não é "intenção"; é execução que precisa passar pela lógica de domínio (numeração, remissão, paginação). |

##### (b) Por que isso quebra sob concorrência

Três incompatibilidades, todas consequência direta de (a):

1. **LIFO global** (`state.past.pop()`): se A adiciona um artigo e B adiciona outro, o `Ctrl+Z` de A desfaria a ação de **B** — é exatamente o _hazard_ clássico de undo colaborativo que o `Y.UndoManager` evita para o texto.
2. **Snapshot sobre árvore divergida**: o inverso reconstrói a partir de um snapshot com `lexmlId`/`numero`/`uuid` do momento da gravação. Se outro usuário renumerou/moveu/removeu nesse meio-tempo, `getDispositivoFromElemento` pode não achar o alvo, ou a reinserção reintroduz numeração obsoleta → corrupção silenciosa.
3. **Identidade local**: o histórico referencia `uuid` do contador local (F4), que sob concorrência colide entre clientes.

##### (c) Duas estratégias avaliadas

| Estratégia | Descrição | Veredito |
|-----------|-----------|----------|
| **1. Incremental: filtrar o histórico Redux** | Manter `past`/`future`, mas (i) só empilhar ações de origem local; (ii) refatorar `undo()`/`redo()` para **emitir a op inversa no `Y.Array`/`Y.Text`** em vez de mutar `articulacao` direto. | ⚠️ **Rejeitada como alvo.** Ainda sofre da corrupção "snapshot sobre árvore divergida" (b.2) — o cenário que a colaboração cria. Exige separar "calcular inverso" de "aplicar" em `undo.ts` (refatoração intrusiva) sem eliminar o risco de correção. |
| **2. Unificar no `Y.UndoManager`** | Em modo colaborativo, **um único `Y.UndoManager`** cobre `Y.Array "articulacao"` + `Y.Text` por dispositivo + `meta` Y.Map, com `trackedOrigins = {origemLocal}`. `Ctrl+Z` desfaz texto **e** estrutura do próprio usuário, operacionalmente sobre o CRDT (imune a b.2). Redux vira projeção. | ✅ **Escolhida para o modo colaborativo.** É a mesma semântica per-usuário do texto, estendida à estrutura, sem o problema de snapshot. |

##### (d) Decisão: **undo por modo** (as duas pilhas nunca coexistem)

O ponto que torna a convivência limpa é que os dois regimes **nunca coexistem** — e a chave é a **feature de colaboração estar ligada para o documento**, **não** a conectividade no momento (por causa do keep-local-Y.Doc, §3.10.1, existe `Y.Doc` local mesmo offline):

| Regime | Autoridade de undo | Histórico Redux (`past`/`future`) | Comportamento |
|--------|--------------------|-----------------------------------|---------------|
| **Colaboração OFF** (feature desligada p/ o documento) | `undo()`/`redo()` Redux **atuais, intocados** | ativo | **Exatamente como hoje.** Zero mudança, zero risco. Não há `Y.Doc`. |
| **Colaboração ON** (há `Y.Doc` local — inclusive offline) | `Y.UndoManager` (texto + estrutura) | **suspenso** (`undo()`/`redo()` desviados) | `Ctrl+Z`/`Ctrl+Y` → `undoManager.undo()/redo()`. Vale **mesmo com o sidecar fora** (o `Y.Doc` local está vivo). |

> **Consequência (elimina a ambiguidade "degradado"):** uma queda de rede **não** troca a autoridade de undo — o `Y.Doc` local continua vivo (§3.10.5). A degradação permanece transparente: o que muda é apenas que o undo é servido pelo Yjs local em vez do Redux, o que é invisível ao usuário. Redux-undo só volta a ser autoridade se a **feature** estiver desligada para o documento.

##### (e) O insight que torna tratável: undo colaborativo **não é caso especial**

Não reescrevemos `undo.ts`/`redo.ts`. Em modo colaborativo eles são **desabilitados**. O `Y.UndoManager` produz mudanças no `Y.Doc`; essas mudanças disparam os **mesmos observers da Fase 2** (§3.2), que as traduzem em ações Redux marcadas `origem:'remote'` → o Redux se re-projeta (recomputa numeração, remissão, paginação) pela máquina já existente. **Undo é apenas mais uma origem de ops "remotas".** Isso reaproveita 100% do trabalho da sincronização estrutural — não há um segundo caminho de aplicação.

##### (f) Requisitos de modelagem que isso impõe

1. **Todo estado estrutural desfazível precisa estar no `Y.Doc`** (`Y.Array` + `meta` Y.Map). O que existir **só** no Redux (ex.: uma mudança de situação que não seja espelhada em `meta`) **não** será restaurado pelo undo Yjs. Isso força disciplina: a mutação de domínio e a mutação do Y.Doc andam juntas.
2. **1 ação do usuário = 1 passo de undo.** Uma ação estrutural hoje emite um **lote** de eventos (incluir artigo + renumerar irmãos + validar). No Yjs, envolver toda a mutação em **um** `Y.transact(doc, fn, origemLocal)` e chamar `undoManager.stopCapturing()` entre ações (ou `captureTimeout: 0`) para o `UndoManager` tratar o lote como uma unidade.
3. **Identidade por `gid`** (ADR-004): o `UndoManager` opera sobre a identidade CRDT dos itens, não sobre `uuid` local — elimina b.3.

##### (g) Transições sensíveis (consequências de UX a validar)

- **Cold-start → entrada na sala:** se a feature estava ON mas offline (Y.Doc local semeado), ao finalmente entrar na sala a reconciliação (§3.10.2-B) pode **trocar a base do doc** → a pilha de undo **reinicia** (no doc compartilhado, não se desfazem ações feitas antes do join). Idem no fallback descartar-e-recarregar (§3.10.3.3).
- **Queda transitória de rede (já conectado):** o `Y.Doc` e o `UndoManager` **permanecem vivos** (só o transporte cai, §3.10.1) → a queda **NÃO zera o undo**; a continuidade é preservada no reconnect morno (§3.10.5).

##### (h) O que fica fora do undo colaborativo na primeira versão

- **Revisão concorrente** (aceitar/rejeitar): desfazer a aceitação de uma revisão feita por outro usuário é questão de **produto**, não só técnica (§7.1). Mantê-la fora do escopo do `UndoManager` inicialmente (não incluir os campos de revisão de `meta` nos `trackedOrigins`, ou tratar revisão como não-desfazível cross-user) até a semântica ser definida na Fase 6.

> **Resumo de uma frase:** com colaboração OFF, o undo é o de hoje, intocado; com colaboração ON (mesmo offline), a autoridade passa para um `Y.UndoManager` per-usuário que trata texto e estrutura de forma uniforme, e cujo resultado re-entra no Redux pela mesma porta das ops remotas — desde que todo estado desfazível viva no `Y.Doc`.

#### 3.6.3 Mapa dos efeitos colaterais estruturais fora da árvore (concretização do requisito f.1)

Toda ação estrutural, além de mutar `state.articulacao`, dispara um **pós-processamento comum** no `elementoReducer` e escreve em slices de state que **não** são a árvore. Estes são os candidatos a "estado desfazível que precisa viver no `Y.Doc`" — ou a serem classificados como deriváveis/locais. Fatos do pipeline:

**Pós-processamento que roda após TODA ação estrutural** (`elementoReducer.ts`):

| Etapa | Linha | Escreve em | Natureza |
|-------|-------|-----------|----------|
| `atualizaRevisao` | 315 | `state.revisoes` (push `RevisaoElemento`) | **Não-derivável, por-usuário** |
| `sincronizarRemissoesPosAcao` | 316 | `state.remissoes` (registry) | Misto (ver abaixo) |
| `adicionaDiffMenuOpcoes` | 317 | opções de menu diff (UI) | Derivável |
| `atualizaPaginacao` | 318 | `state.ui.paginacao` | Derivável |
| set `numEventosPassadosAntesDaRevisao` | 290 | contador base de revisão | Não-derivável, por-sessão |

**Classificação dos efeitos colaterais** (o que fazer sob undo Yjs):

| Efeito colateral | Onde vive | Gerado por | Derivável da estrutura+texto? | Tratamento sob undo colaborativo |
|------------------|-----------|-----------|-------------------------------|----------------------------------|
| **Numeração** (`numero`/`rotulo`/`id`) | no dispositivo | `renumeraFilhos`/`updateIdDispositivoAndFilhos` | ✅ Sim | **Não vai ao `Y.Doc`.** Recomputa localmente após a op remota. |
| **Validação** (`mensagens`) | no dispositivo | `validaDispositivo` | ✅ Sim | Recomputa. Não persistir. |
| **`ui.paginacao`** | `state.ui` | `atualizaPaginacao` | ✅ Sim | Recomputa (reusa `atualizaPaginacao`). Não persistir. |
| **`ui.alertas`** (validação/limite) | `state.ui` | vários reducers | ✅ Sim (maioria) | Recomputa a partir da validação. Não persistir. |
| **Opções de menu diff** | UI | `adicionaDiffMenuOpcoes` | ✅ Sim | Recomputa. Não persistir. |
| **`situacao`** (`original`/`novo`/`modificado`/`suprimido`) | no dispositivo | reducers de supressão/restauração/modificação | ❌ **Não** | **Vai para `meta` Y.Map.** Sem isso, desfazer uma supressão via Yjs não restaura a situação. |
| **`notaAlteracao`** (`NR`/`AC`/`RV`) | no dispositivo (bloco alteração) | `atualizaNotaAlteracao`, agrupamento | ❌ **Não** | **Vai para `meta` Y.Map.** |
| **`abreAspas`/`fechaAspas`, `textoOmitido`** | no dispositivo (alteração) | reducers de alteração | ❌ **Não** | **Vai para `meta` Y.Map.** |
| **Remissão — flags não-deriváveis** (`textoFixo`, `excluidaManualmente`/tombstone, `valida:false`) | `state.remissoes` | `sincronizarRemissoesPosAcao`, `excluirRemissaoManual`, `removeElemento` | ❌ **Não** | **Precisam de representação compartilhada** (embed no `Y.Text` + `meta`). O corpo da remissão é re-detectável; estes flags **não**. Ponto delicado (ver §3.9). |
| **`state.revisoes`** (`RevisaoElemento` de inclusão/exclusão/modificação) | `state.revisoes` | `atualizaRevisao.ts:63-72` | ❌ **Não**, e **por-usuário** | **Fora do escopo do undo colaborativo na v1** (§3.6.2.h). Semântica concorrente é questão de produto (§7.1). |
| **`numEventosPassadosAntesDaRevisao`** | `state` | `elementoReducer:290` | ❌ Não (contador) | Ligado a revisão → mesmo tratamento (fora da v1). |
| **`emRevisao` / `modo` / `usuario`** | `state` | `atualizaUsuario`, toggle | n/a — **por-sessão/usuário** | **Nunca desfazível nem compartilhado.** Estado local do cliente; permanece só no Redux. |

**Leitura do mapa (o veredito prático):**

1. **A maioria dos efeitos é derivável** (numeração, validação, paginação, alertas, menu-diff) — não precisa ir ao `Y.Doc`; recomputa após a op remota. Isso é a boa notícia e já estava previsto na §3.9.
2. **O núcleo não-derivável que precisa entrar no `meta` Y.Map** é pequeno e bem-definido: **`situacao`, `notaAlteracao`, `abreAspas`/`fechaAspas`, `textoOmitido`**. Este é o trabalho concreto de modelagem para o undo Yjs funcionar em documentos de emenda/alteração.
3. **Os flags de remissão não-deriváveis** (`textoFixo`, tombstone, `valida:false`) são o ponto genuinamente espinhoso: o *texto* da remissão é re-detectável, mas esses três flags não — precisam de embed compartilhado no `Y.Text`/`meta`. Recomendo tratá-los junto da Fase 3 (remissão como atributo do `Y.Text`), não na Fase 5.
4. **Revisão é deliberadamente adiada** — é não-derivável, por-usuário e de semântica concorrente indefinida. Enquanto a §7.1 não for decidida, **co-edição e modo de revisão não devem estar ativos na mesma sessão** (é a mitigação mais segura para a v1).

> **Consequência para o roadmap:** o requisito f.1 se resolve modelando **4 campos** (`situacao`, `notaAlteracao`, `abreAspas`/`fechaAspas`, `textoOmitido`) no `meta` Y.Map + os **3 flags de remissão** como embed compartilhado. Tudo o mais é derivável ou local. O retrabalho real é menor do que parecia — **desde que revisão fique fora da sessão colaborativa na v1**.

### 3.7 Persistência e _seeding_

- **Seed da sala:** ao primeiro cliente entrar, o sidecar pede ao host o JSON da proposição → conversor **determinístico** `ProjetoNorma → Y.Doc update` (novo, espelha `buildJsonixFromProjetoNorma.ts`/`buildProjetoNormaFromJsonix.ts`). Determinismo é essencial: dois seeds diferentes = divergência permanente.
- **Snapshot:** periodicamente e ao esvaziar a sala, sidecar → host com o estado (preferir persistir o **LexML derivado** para manter compatibilidade do acervo; opcionalmente também o update binário Yjs para retomar sessões sem re-seed).
- **Salvar (usuário clica salvar):** continua `getProjetoAtualizado()` → Redux → LexML → host. O Redux está fresco por causa do flush (§3.3). O save **não depende do sidecar**.

### 3.8 Paginação sob colaboração

Problema (F3): o Y.Doc tem o documento inteiro; o Quill só tem uma página. Um dispositivo pode ser co-editado por outro usuário enquanto está **fora** da sua página local.

- **Estrutura:** o `Y.Array` inteiro é observado sempre → mudanças estruturais em qualquer página atualizam a paginação Redux (reusa `atualizaPaginacao.ts`), mesmo sem render.
- **Texto:** bindings por linha (§3.4) só existem para os dispositivos **atualmente renderizados**. Ao trocar de página (`carregarPaginaArticulacao`), destruir os bindings antigos e criar os da nova página. Edições de texto remotas em dispositivos fora da página continuam vivas no `Y.Text` (não se perdem); só não são renderizadas até a página ser aberta.
- **Navegação automática entre páginas** (já existe em `atualizaPaginacao`) precisa considerar que a mudança pode ter origem remota.

### 3.9 Interação com features existentes (matriz de compatibilidade)

| Feature | Interação com CRDT | Ação necessária |
|---------|--------------------|-----------------|
| **Numeração automática** | Derivada da estrutura; recomputada localmente pós-convergência. | Garantir recomputação após aplicar ops remotas do `Y.Array`. |
| **Remissão interna** | Depende de lexmlId (que muda na renumeração) e do registry. | Rodar `sincronizarRemissoes` após convergência estrutural remota; remissão como atributo do `Y.Text`. Ponto delicado. |
| **Revisão (aceitar/rejeitar)** | `emRevisao` global; track-changes ("propor→adjudicar") conflita com merge imediato do CRDT. | **v1: modo exclusivo** (revisão XOR colaboração, §7.1). Não co-editar em modo revisão; entrar em colaboração exige revisões adjudicadas. "Sugestões coletivas" (v2) fica adiado. |
| **Blocos de alteração / omissis** | Estrutura aninhada. | Representar no mesmo modelo hierárquico (`paiGid`). |
| **Tabela (quill1-table)** | Blots estruturais complexos. | Co-edição **dentro** de célula = escopo avançado; fase posterior. |

### 3.10 Reconciliação pós-offline (ataque ao R5)

**Descoberta ao atacar o R5: o R5 difícil é, em boa parte, autoinfligido pela forma como a ADR-003 especificou a degradação.** A versão original dizia que, na queda do sidecar, o overlay **desanexa** e, na volta, "as edições offline precisam ser reproduzidas para o Y.Doc". Esse _replay_ Redux→Y.Doc é justamente a operação corrupção-propensa. O Yjs foi feito para **local-first**: ele não precisa de rede para registrar edições. Portanto a mitigação certa é **não desanexar o Y.Doc — desanexar só o transporte**.

#### 3.10.1 Refinamento da degradação (substitui o "desanexa" da ADR-003)

Na queda do sidecar, **mantém-se o `Y.Doc` e o binding vivos localmente; apenas o `WebsocketProvider` desconecta.** O usuário continua editando; as edições continuam entrando no `Y.Doc` local (e no Redux via flush, como sempre — **mesmo caminho de dados, sem code path especial de "offline"**). Persistir o `Y.Doc` em **`y-indexeddb`** para sobreviver a reload de página durante a queda. Isso satisfaz o requisito do time (a **função** multiusuário — ver os outros, cursores — fica indisponível; o app funciona), e converte o reconnect no cenário dominante de "sync padrão do Yjs".

#### 3.10.2 A decomposição que resolve o R5: dois casos, não um

| Caso | Situação | Ancestralidade compartilhada? | Reconciliação |
|------|----------|-------------------------------|---------------|
| **A — Reconnect morno** | Cliente **já esteve conectado** à sala e caiu. As edições offline acumulam **no mesmo `Y.Doc`** (derivado do seed da sala). | ✅ Sim | **Automática e segura.** Na volta, o provider troca _state vectors_ e o Yjs faz merge/dedup nativo. **Nenhum código bespoke.** Este é o caso dominante. |
| **B — Cold start** | Sidecar estava **indisponível ao abrir** o documento; cliente semeou um `Y.Doc` **local** a partir do LexML (Fase 0). Quando o sidecar sobe e o cliente entra na sala, existem **dois `Y.Doc` semeados independentemente**. | ❌ **Não** (por padrão) | **Não pode auto-mergear** — Yjs identifica itens por `(clientID, clock)`; dois seeds independentes do mesmo "Artigo 1" viram **dois itens distintos → duplicação**. Precisa de política explícita (abaixo). |

#### 3.10.3 Resolvendo o Caso B: seed de ancestralidade compartilhada + guarda de versão

1. **Seed determinístico até a identidade dos itens Yjs.** O conversor `ProjetoNorma → Y.Doc` (Fase 0) deve semear dentro de uma transação com **`clientID` reservado e fixo** (ex.: `0` = "origem-seed") e inserir em **ordem canônica**. Assim, dois seeds independentes do **mesmo documento-base** produzem **estado-base byte-idêntico** → passam a compartilhar ancestralidade → as edições offline (feitas sob o `clientID` real) mergeiam limpo por cima. Isto **reaproveita** o requisito de determinismo do seed que já era necessário para convergência (§3.7) — o mesmo investimento resolve dois problemas.
2. **Guarda de versão-base (hash).** O merge do Caso B só é seguro se o seed local e o da sala forem da **mesma versão** do documento. Ao entrar na sala, comparar um **hash da versão-base**. Se bater → merge seguro (item 1). Se **não** bater (ex.: alguém salvou nova versão no host nesse meio-tempo) → cair no fallback.
3. **Fallback seguro (versão divergente): descartar-e-recarregar, sem perda silenciosa.** Antes de descartar o `Y.Doc` local, **serializar as edições offline** (Redux → LexML/patch) e **entregá-las ao usuário** (download / "copiar minhas alterações offline"), avisando que não puderam ser mescladas automaticamente; então recarregar do `Y.Doc` da sala. Lossy, mas **nunca perde dado em silêncio**.

#### 3.10.4 Reconciliação semântica pós-merge (vale para A e B)

Merge CRDT garante convergência **estrutural**, não coerência **de domínio**. Após qualquer merge:
- **Numeração/remissão:** recomputar (numeração é derivada, ADR-004; `sincronizarRemissoes` roda em seguida). Sem conflito de numeração mesmo se ambos renumeraram.
- **Órfãos (edge clássico "editar container deletado"):** se A (offline) removeu o Artigo 3 e B (online) inseriu um filho nele, o merge pode deixar um filho cujo `paiGid` não existe mais. **Detectar órfãos** (todo não-raiz precisa de `paiGid` existente) e decidir política: reparentar para o ancestral vivo mais próximo **ou** descartar com aviso. Testar explicitamente.
- **Checagem de invariantes:** pós-merge, rodar guardas — nenhum `gid` duplicado; todo `paiGid` resolve; validação de domínio. Se um invariante quebrar, **superficializar erro recuperável** (não corromper em silêncio).

#### 3.10.5 Efeito colateral positivo no undo (relaxa §3.6.2.g)

Como o `Y.Doc` e o `Y.UndoManager` **permanecem vivos** durante a queda (só o transporte cai), uma **queda transitória de rede não zera o histórico de undo** — o Caso A preserva a continuidade do undo. O reset de undo passa a valer **só** para (i) cold start seguido de entrada na sala e (ii) o fallback descartar-e-recarregar. Isto **melhora** a experiência descrita em §3.6.2.g.

> **Resumo do ataque:** trocar "desanexar o Y.Doc" por "desanexar só o transporte + `y-indexeddb`" transforma o R5 dominante (reconnect morno) em **sync padrão do Yjs, automático**. Sobra o cold-start (Caso B), resolvido por **seed de ancestralidade compartilhada + guarda de versão**, com **fallback sem perda silenciosa**. O replay Redux→Y.Doc — a parte perigosa — **é eliminado**.

---

## 4. Roadmap de Implementação (Faseado)

Cada fase é entregável e testável isoladamente. Fases 0–3 já entregam valor observável.

### Fase 0 — Fundação e identidade global (sem rede)
- **Objetivo:** preparar o domínio para concorrência sem ainda ligar Yjs.
- Introduzir `gid` global (`crypto.randomUUID`) e a tabela `gid↔uuid` (`reducerUtil.ts`, criação de dispositivo). Corrige F4.
- Extrair o conversor determinístico `ProjetoNorma ↔ Y.Doc` (novo módulo em `src/collab/`), com testes de round-trip.
- **Determinismo até a identidade dos itens Yjs** (§3.10.3.1): semear sob `clientID` reservado fixo + ordem canônica, para que seeds independentes do mesmo base sejam byte-idênticos (habilita merge de cold-start). Teste: dois seeds independentes → `Y.encodeStateAsUpdate` idêntico.
- **Entregável:** identidade estável + conversor determinístico testado. Zero impacto visível ao usuário.

### Etapa L — Trabalho no host (backend) — pré-requisito da Fase 1
Trilha paralela no backend do host, fora deste repositório. Sem ela, não há gate de acesso e a Fase 1 não pode admitir ninguém com segurança.
- **Controle de acesso por documento:** o host mantém a lista de quem pode colaborar em cada documento e decide "este usuário pode entrar nesta sala?".
- **Gestão da lista:** o host oferece o meio de montar e manter essa lista.
- **Token de sala:** cunhagem pelo host e validação pelo servidor de sincronização, carregando a **identidade validada** do usuário (§3.5).
- **Entregável:** o host decide e emite o token; a base está pronta para o gate do sidecar.
- Detalhes de modelagem e de implementação desse controle ficam em documento local, fora deste repositório.

### Fase 1 — Setup do transporte e degradação graciosa
- Sidecar Node y-websocket (repo/serviço próprio): salas por documento, seed a partir do host.
- **Gate de acesso no handshake (§ADR-003):** o sidecar valida o token de sala **antes de qualquer sync** e **recusa totalmente** quem não estiver autorizado (sem leitura parcial na v1). `lexml-eta` só recebe/carrega o token — zero lógica de acesso.
- **Degradação por keep-local-Y.Doc (§3.10.1):** só o `WebsocketProvider` desconecta; o `Y.Doc`/binding permanecem vivos; persistência local em `y-indexeddb`. Nada de desanexar o Y.Doc nem de replay Redux→Y.Doc.
- **Guarda de versão-base (§3.10.3.2)** no join da sala; fallback descartar-e-recarregar com export das edições offline (sem perda silenciosa).
- `YjsCollabService.attach/detach` com _timeout_ de conexão; badge de status; **garantir que falha do sidecar não afeta load/save** (teste explícito: matar o sidecar e editar/salvar).
- **Entregável:** conecta/desconecta com segurança; app 100% funcional offline; **reconnect morno mescla automático**. Ainda sem co-edição.

### Fase 2 — Sincronização estrutural (Redux ↔ Y.Array)
- Observers bidirecionais estrutura ↔ `Y.Array`, com anti-eco (`origem:'remote'`).
- Recomputação de numeração e `atualizaPaginacao` após ops remotas.
- **Entregável:** add/remover/mover/tipo de dispositivo aparecem em tempo real entre dois clientes (o texto ainda não é co-editável na mesma linha).

### Fase 3 — Co-edição de texto (`Y.Text` por dispositivo)
- Binding por linha (§3.4): tradução Delta↔`Y.Text` escopada por range de blot.
- Flush por blur → Redux (§3.3); rebinding na troca de página (§3.8).
- Remissão/formatação como atributos do `Y.Text`.
- **Entregável:** dois usuários digitando no mesmo dispositivo, convergindo.

### Fase 4 — Awareness e cursores
- `Awareness` com dados de `usuario`; `quill-cursors`; presença estrutural.
- **Entregável:** cursores e "quem está onde".

### Fase 5 — Undo por modo e persistência durável
- **Undo por modo (§3.6.2):** em colaboração, `Y.UndoManager` único cobre texto + estrutura + `meta` com `trackedOrigins={origemLocal}`; `undo()`/`redo()` Redux suspensos e roteados para o `UndoManager`; resultado re-entra pela porta das ops remotas (Fase 2). Com colaboração OFF, o undo Redux atual fica **intocado**.
- Envolver cada mutação estrutural em um `Y.transact(..., origemLocal)` + `stopCapturing()` para "1 ação = 1 passo de undo".
- Snapshot sidecar→host (§3.7).
- **Entregável:** `Ctrl+Z` só desfaz o próprio (texto e estrutura); degradação preserva o undo de hoje; sessões sobrevivem a reinício do sidecar.
- **Pré-requisito de modelagem:** todo estado desfazível precisa estar no `Y.Doc` (§3.6.2.f) — verificar antes de iniciar a fase.

### Fase 6 — Reconciliação de features e casos de borda
- **Modo exclusivo revisão×colaboração (§7.1):** implementar o modo compartilhado no Y.Map raiz; bloquear entrada em COLABORATIVO com revisões pendentes; desligar co-edição em modo REVISÃO. (Não é "suportar revisão concorrente" — é impedir a sobreposição.)
- Blocos de alteração; edição concorrente em tabela; **política de órfãos pós-merge** (§3.10.4: reparentar vs. descartar). (A reconciliação offline em si já está na Fase 1/§3.10.)
- **Entregável:** paridade de features sob colaboração, com revisão e co-edição nunca ativas juntas.
- **Fora do escopo (v2):** "Sugestões coletivas" (track-changes em tempo real, §7.1) — só se produto confirmar o workflow de múltiplos revisores simultâneos.

**Arquivos/métodos mais impactados (mapa rápido):**
`src/collab/*` (novo), `editor.component.ts` (`processarStateEvents`, `carregarArticulacao`, `inserirNovoElementoNoQuill`, `removerLinhaQuill`, `atualizarTextoElemento`, `flushEdicaoPendente`), `eta-quill.ts` (`onTextChange`), `reducerUtil.ts` (identidade), reducers estruturais (`adicionaElemento.ts`, `removeElemento.ts`, `transformaTipoElemento.ts`, `atualizaPaginacao.ts`), `undoRedoReducerUtil.ts`, `sincronizarRemissoes.ts`, `lexml-eta.component.ts`/`lexml-eta-proposicao.component.ts` (`inicializarEdicao`/`getProjetoAtualizado` + novo `params.colaboracao`). **Fora do repo `lexml-eta`:** sidecar Node (novo serviço) e o host (Etapa L: controle de acesso e cunhagem/validação do token de sala).

---

## 5. Matriz de Riscos

| ID | Risco | Prob. | Impacto | Mitigação |
|----|-------|-------|---------|-----------|
| R1 | **Impedância Quill-view vs CRDT-model** (F2): três fontes de verdade brigando. | Alta | Crítico | ADR-001 (Redux = verdade; Yjs = overlay); anti-eco rigoroso; binding por linha escopado. |
| R2 | **Numeração/remissão divergentes** após renumeração concorrente. | Alta | Alto | Numeração **derivada** (nunca sincronizada); `sincronizarRemissoes` pós-convergência; testes de convergência determinística. |
| R3 | **Undo/redo**: histórico Redux atual é global, linear e baseado em snapshot (`undo.ts:29`, `undoRedoReducerUtil.ts:83`) — corrompe sob árvore divergida. | Alta | Alto | **Undo por modo (§3.6.2):** colaboração OFF usa o Redux atual intocado; ON troca a autoridade para `Y.UndoManager` (imune a snapshot divergido), com resultado re-entrando pela porta das ops remotas. Requisito: todo estado desfazível no `Y.Doc`. |
| R4 | **Seed não-determinístico** → divergência permanente. | Média | Crítico | Conversor determinístico testado com round-trip (Fase 0); sidecar único faz o seed a partir do host. |
| R5 | **Reconciliação pós-offline** (edições locais durante queda do sidecar). | ~~Média~~ **Baixa** (morno) / Média (cold) | Alto | **Atacado (§3.10).** Não desanexar o Y.Doc, só o transporte + `y-indexeddb` → reconnect morno é sync Yjs **automático**. Cold-start resolvido por seed de ancestralidade compartilhada + guarda de versão; fallback descartar-e-recarregar **sem perda silenciosa**. Replay Redux→Y.Doc **eliminado**. |
| R6 | **Paginação**: dispositivo co-editado fora da página local. | Média | Médio | Estrutura sempre observada; bindings de texto só para renderizados; rebinding na troca de página (§3.8). |
| R7 | **Segurança/compliance**: dados de proposição no transporte. | Média | Crítico | Token de sala validado no handshake WS; sidecar interno à rede da organização; TLS; sem terceiros gerenciados. |
| R8 | **Operação de mais um serviço** (sidecar Node). | Média | Médio | Degradação graciosa reduz criticidade; observabilidade; deploy junto ao host. |
| R9 | **Layout `<table>` + cursores**: posicionamento incorreto. | Média | Médio | Cursor via mapeamento range↔`Y.Text`; testes visuais. |
| R10 | **Acesso fraco**: entrada não-autorizada na sala (vazamento de proposição) ou **impersonação** em cursores/atribuição. | Média | Crítico | Decisão de acesso no servidor (host decide, sidecar impõe no handshake **antes** do sync); usuário sem identidade ⇒ OFF; identidade de awareness vinda do token validado, **nunca** do `params.usuario` (ADR-003, §3.5). `lexml-eta` sem lógica de acesso. |

---

## 6. Estratégia de Testes

| Nível | Escopo | Ferramenta/abordagem |
|-------|--------|----------------------|
| **Convergência (headless)** | Dois+ `Y.Doc` em Node aplicando ops concorrentes → assert de igualdade final. | Testes Node puros com `yjs` (sem browser). Base do "está correto sob concorrência?". |
| **Binding por linha** | Delta↔`Y.Text` escopado: edição no meio da linha, com remissão, com formatação. | Unit (web-test-runner, como hoje). |
| **Degradação graciosa** | Matar/derrubar o sidecar em cada fase do ciclo; editar e salvar. Deve funcionar single-user. | E2E Cypress + controle do processo do sidecar. |
| **E2E concorrente** | Dois `BrowserContext` na mesma sala; digitar no mesmo dispositivo; renumerar em um e ver no outro. | Cypress com dois contextos, ou Playwright (melhor para multi-contexto) só para os cenários colaborativos. |
| **Partição de rede (reconnect morno)** | Desconectar o provider, editar dos dois lados, reconectar, assert de convergência. | Simular `provider.disconnect()`/`connect()`. |
| **Cold-start sem duplicação (R5-B)** | Dois clientes semeiam `Y.Doc` **independentemente** do mesmo base; editam offline; entram na sala; assert de **zero duplicação** de dispositivos e de invariantes (`gid` único, `paiGid` resolve). Repetir com **versão-base divergente** → assert do fallback (export + reload, sem perda). | Headless Node + verificação de invariantes pós-merge (§3.10.4). Caso mais crítico do R5. |
| **Órfãos pós-merge** | A (offline) remove Artigo; B (online) insere filho nele; merge; assert da política de órfão (reparent/descartar) (§3.10.4). | Headless Node. |
| **Persistência** | Seed determinístico (round-trip `ProjetoNorma↔Y.Doc`); snapshot/restore de sala. | Unit + integração com o sidecar. |
| **Regressão single-user** | Toda a suíte atual (remissão, revisão, paginação) roda **com colaboração OFF** (feature desligada) e **com colaboração ON, cliente único**. | Reusar suíte existente; matriz "feature on/off". |

> Recomendação: para os cenários **multi-cliente de browser**, avaliar **Playwright** em paralelo ao Cypress atual — dois `BrowserContext` isolados são nativos no Playwright e sofríveis no Cypress. Cypress permanece para a suíte single-user existente.

---

## 7. Questões em Aberto (decisões pendentes de produto/infra)

### 7.1 Revisão concorrente — ✅ DECIDIDA (v1) + direção v2

**Fatos que restringem a decisão (código):** `emRevisao` é um booleano **global** (`state.ts:69`), alternado por `ativaDesativaRevisao`; cada `RevisaoElemento` carrega autoria (`usuario`), timestamp e snapshots antes/depois; `aceitaRevisao` **não valida autoria** (qualquer um aceita qualquer marca). O modelo é moldado para **sessão única global**. Conceitualmente, revisão é _track-changes_ ("**propor → adjudicar**"), um modelo de colaboração **fundamentalmente diferente** do CRDT ("**merge imediato, sem estado pendente**").

**Decisão v1 — Revisão e co-edição são MODOS MUTUAMENTE EXCLUSIVOS por documento, com modo compartilhado:**
- Um documento está em modo **COLABORATIVO** (tempo real, revisão OFF) **ou** em modo **REVISÃO** (track-changes de editor único, como hoje). Nunca os dois ao mesmo tempo.
- O **modo é estado compartilhado** (campo no Y.Map raiz do `Y.Doc` / metadado da sala no sidecar), para que todos os clientes concordem — e a troca de modo é ela mesma sincronizada.
- **`emRevisao` permanece GLOBAL**, nunca por-usuário. A alternativa por-usuário (A edita direto enquanto B "sugere" no mesmo `Y.Text`) exigiria atribuição de revisão **por caractere** com estados comprometido/pendente entrelaçados — inviável na v1 e de accept/reject por-range.
- **Entrar em COLABORATIVO exige documento sem revisões pendentes** (todas adjudicadas). Regra dura: se o texto que uma marca referencia muda sob co-edição, a marca fica obsoleta/corrompida. Adjudicar antes elimina o hazard.
- Em modo **REVISÃO**, a co-edição em tempo real fica **desligada**: comporta-se como hoje (um editor ativo; demais em presença/somente-leitura, opcionalmente com _soft-lock_).

**Por quê:** revisão é "propor então adjudicar"; CRDT é "merge imediato". Forçar a escolha evita de uma vez (a) o interleaving comprometido/pendente por caractere, (b) a semântica indefinida de accept/reject concorrente, e (c) marcas obsoletas por edição do texto-base. Alinha com o fato de `emRevisao`/`numEventosPassadosAntesDaRevisao` serem construtos globais de sessão única — **não brigamos com a arquitetura atual** — e **entrega na v1**. É também a concretização da mitigação já apontada em §3.6.3 (revisão fora da sessão colaborativa).

**Direção v2 (só se o workflow exigir) — "Sugestões coletivas" (_Suggesting mode_):** modelar revisões como **objetos CRDT de primeira classe** (Y.Map por id de revisão: autor, posições relativas, antes/depois) sobre o `Y.Text`; `emRevisao` global compartilhado; toda edição vira revisão atribuída ao autor; accept/reject como op CRDT sobre o objeto revisão, com **conflito accept×reject da mesma marca resolvido por "reject vence"** (conservador: não aplicar mudança sem aceitação inequívoca) e accept×accept/reject×reject idempotentes. É um **milestone grande, explicitamente adiado**.

**Fallback** se a regra dura de "adjudicar antes de colaborar" for restritiva demais na prática: permitir COLABORATIVO com revisões pendentes **congeladas read-only** (accept/reject desabilitado até voltar a REVISÃO), **assumindo o risco de _staleness_** das marcas. Menos seguro; só se produto exigir.

**O único fato que inverteria esta decisão:** se o workflow real da organização tiver como caso **primário** "múltiplos revisores marcando simultaneamente em tempo real" (e não "autor co-edita → revisor adjudica depois"), então v2 deixa de ser opcional e vira **requisito de v1** — e o projeto cresce substancialmente. **Isto precisa ser confirmado com produto** antes de fechar o escopo.

### 7.2 Demais questões em aberto

1. ~~**Reconciliação pós-offline (R5)**~~ — ✅ **DECIDIDA (§3.10):** transporte desanexa mas Y.Doc permanece vivo + `y-indexeddb`; reconnect morno = sync Yjs automático; cold-start = seed de ancestralidade compartilhada + guarda de versão-base, com fallback descartar-e-recarregar sem perda silenciosa. Resta validar a **política de órfãos** (§3.10.4: reparentar vs. descartar) com produto.
2. **Autoridade de conteúdo no seed:** confirmar que o host sempre tem o JSON canônico para semear a sala (e não o próprio Y.Doc como fonte primária).
3. **Escopo de undo estrutural cross-user** na primeira versão: desabilitado, limitado ao próprio, ou completo?
4. **Co-edição dentro de tabelas** (`quill1-table`): escopo desta feature ou adiado?
5. **Deploy do sidecar:** mesmo ambiente do host? Estratégia de sessão/sticky para salas?

### 7.3 Controle de acesso e usuário sem identidade — ✅ DECIDIDA

- **Decisão 1 — lista dedicada.** A lista de quem pode colaborar é nova e vive no host; não é derivada de permissões existentes.
- **Decisão 2 — não autorizado é recusado totalmente.** Sem leitura parcial na v1.
- **Decisão 3 — responsabilidades.** O host decide, o sidecar impõe o gate no handshake e o `lexml-eta` só consome (ADR-003).
- **Decisão 4 — usuário sem identidade estável (anônimo) ⇒ colaboração desligada**, imposto no servidor e refletido no cliente (single-user).

**Ainda aberto (produto):** quem administra a lista de colaboradores e como grupos de usuários são tratados. Os detalhes ficam em documento local.

---

## 8. Conclusão

O trabalho difícil deste projeto **não é** Quill 2.x, Shadow DOM ou Lit — esses são não-problemas ou secundários por evidência de código. O trabalho difícil é sincronizar, sob concorrência de caractere, um **modelo de domínio estruturado governado pelo Redux**, com paginação e com features (revisão, remissão, numeração, undo) que hoje pressupõem edição sequencial. A escolha de co-edição fina (CRDT) maximiza o valor, mas concentra o risco em R1–R3; a exigência de degradação graciosa, longe de ser um custo extra, **valida** a arquitetura de overlay sobre um Redux que continua sendo a verdade. O caminho é viável e faseável, com valor observável já a partir da Fase 2.

---

## 9. Histórico de Implementação (o que foi feito e por quê)

> Registro das descobertas e decisões tomadas durante a construção, fase a fase. Complementa o roadmap (§4) com o que **só apareceu ao codar**. Tudo em `src/collab/` (novo). **Estado:** Fases 0, 1 (fatia cliente), 2 (a–d), 3 (texto + 3c flags), 4 (cursores), 5 (undo por modo) e a **Trilha A** (fechamento do modelo no cliente: nota, transform, remissão) concluídas e commitadas na branch `feat/yjs-editor`. Nada empurrado ao remoto. Sidecar Node e Etapa L (lexeditweb) permanecem fora deste repositório.

### 9.0 Infraestrutura de testes — harness Node puro

O projeto só testava no browser (web-test-runner/Playwright). A convergência CRDT, porém, é melhor testada headless. Criou-se um **harness Node puro** (`tsconfig.collab-test.json` + `npm run test:collab`) usando **`node:test`/`node:assert` embutidos do Node 20** — zero dependências de teste novas.

- **Descoberta:** o grafo de domínio (`dispositivoLexmlFactory`, `hierarquiaUtil`) é Node-safe, mas puxa transitivamente `revisaoUtil` (via `Elemento → Revisao`), que referencia `sl-dialog` do Shoelace. No build largo o Shoelace augmenta `HTMLElementTagNameMap`; no recorte do harness não. **Decisão:** um shim mínimo de tipos (`test/collab/shoelace-shim.d.ts`) declara só o `sl-dialog` que `revisaoUtil` usa.
- **Descoberta:** `test/collab` precisou ser **excluído do build principal** (senão o wtr tentaria rodar `node:test` no browser, e o shim conflitaria com o Shoelace). Como o `tsconfig` derivado herda o `exclude` do base, o harness precisou de `exclude` próprio; e o ESLint ganhou um `override` apontando `test/collab` ao tsconfig do harness (senão o pre-commit falha ao parsear).

### 9.1 Fase 0 — Identidade global `gid` e conversor determinístico

- **Descoberta que mudou o desenho:** já existia um `uuid2: string` (UUID via `Math.random`) por dispositivo, **mais estável que o `uuid` numérico** (não é resetado por `resetUuidTodaArvore`). **Decisão:** introduzir um campo **`gid` novo** (não reusar `uuid2`, para não desestabilizar a camada de editor/Quill que depende dele); `gid` ao vivo = `crypto.randomUUID()` **com fallback para `generateUUID`** fora de secure-context (a fábrica roda sempre, inclusive com colaboração OFF — não pode quebrar o app).
- **A tensão central:** estabilidade (o `gid` não muda em renumeração) **vs.** determinismo do seed (dois seeds independentes têm que dar `Y.encodeStateAsUpdate` byte-idêntico). **Decisão:** o seed grava `gid` **determinístico por índice canônico** (`s:000000`), congelado depois; dispositivos criados ao vivo usam `randomUUID`. A ordem canônica reusa `percorreHierarquiaDispositivos` (inclui caput, desce em alterações) — a mesma da serialização LexML.
- **Estrutura do Y.Doc (ADR-004):** `Y.Array "articulacao"` plano de `Y.Map { gid, tipo, paiGid, conteudo:Y.Text, meta:Y.Map }`. **Decisão de escopo:** `meta` no nível de domínio guarda `situacao`/`notaAlteracao`/`cabecaAlteracao`; `abreAspas`/`fechaAspas`/`textoOmitido` são conceitos de **Elemento (view)**, não do Dispositivo (`textoOmitido` viaja no próprio texto via `TEXTO_OMISSIS`). Situações `Modificado`/`Suprimido` carregam snapshot `Elemento` no construtor → seu round-trip completo ficou adiado.
- **Determinismo até a identidade Yjs:** o seed roda sob **`clientID = 0` fixo** + ordem canônica. **Teste-chave** (dois seeds independentes → bytes idênticos) passou.

### 9.2 Fase 1 — Transporte e degradação graciosa (fatia cliente)

- **Arquitetura para não contaminar o app OFF:** o `YjsCollabService` é **puro** (só `yjs` + conversor); transporte/persistência entram por **injeção**. O transporte real (`y-websocket`/`y-indexeddb`) fica em `transporteReal.ts`, **carregado dinamicamente** só quando a colaboração liga — assim nunca entra no grafo estático do componente. Gate de UX `deveLigar`: sem params ou anônimo ⇒ OFF, nenhum `Y.Doc`.
- **Degradação keep-local-Y.Doc:** na queda do transporte, só o `WebsocketProvider` desconecta; o `Y.Doc` **nunca** é desanexado — elimina o replay Redux→Y.Doc perigoso da ADR-003.
- **Bug pego por teste (reconnect morno):** o seed fixa `clientID = 0`; se o cliente continuar editando sob `clientID = 0`, dois clientes **colidem na identidade CRDT** e perdem dados no merge. **Correção (§3.10.3.1):** o cliente **adota um `clientID` único** para as edições ao vivo, logo após o seed. O determinismo do seed (itens sob `clientID = 0`) permanece intacto.
- **Percalço de ambiente:** `@web/test-runner-playwright` nunca esteve declarado no `package.json` (era extraneous); um `npm install` o podou e a suíte browser parou de rodar. **Decisão:** declará-lo como `devDependency` (fix de reprodutibilidade, commitado à parte da feature).

### 9.3 Fase 2a — Sincronização estrutural: inclusão e remoção

- **Anti-eco sem tocar em reducers:** um flag síncrono `aplicandoRemoto` (o `dispatch` do Redux é síncrono, o subscriber dispara logo após) + o `origin` da transação Yjs (`ORIGEM_LOCAL`). Mais simples e menos intrusivo do que adicionar `origem` ao `StateEvent`/reducers.
- **Correção de consistência (herança da Fase 0):** os dispositivos semeados tinham na memória o `gid` **aleatório da fábrica**, mas o Y.Doc usava o **determinístico** — divergiam, quebrando o `paiGid` de filhos inseridos ao vivo. **Correção:** `projetoNormaToYDoc` grava o `gid` determinístico **de volta** na árvore. Extraiu-se `dispositivoParaYMap` (seed e inserção ao vivo usam o mesmo formato).
- **`gid` no `Elemento`:** os eventos estruturais carregam `Elemento` (leve), que não tinha `gid`. Adicionou-se (aditivo, como `uuid2`), populado em `createElemento`.
- **A direção difícil (R1, remoto→Redux):** um `Y.Map` novo vira `adicionarElementoAction`, que espera **Elemento de referência + posição**. Reconstrução via `paiGid` → pai, `Y.Map` predecessor → irmão. O dispositivo recém-criado no remoto (uuid local novo) **adota o `gid` remoto** — identidade compartilhada entre clientes.

### 9.4 Fase 2b — Supressão e restauração (via `meta.situacao`)

- **Não é add/remove:** suprimir/restaurar mudam `situacao`. **Local→Y.Array:** `ElementoSuprimido`/`Restaurado` setam `meta.situacao` no `Y.Map` do gid. **Remoto:** um shadow `gid→situacao` detecta a mudança e despacha `suprimirElementoAction`/`restaurarElementoAction`.
- **Decisão:** **não** copiar o objeto `situacao` (que carrega snapshot `Elemento`) — despachar a **ação** e deixar o reducer reconstruir a situação corretamente.

### 9.5 Fase 2c — Reordenação de irmãos (mover up/down)

- **Descoberta (investigação do reducer):** `moveElementoAbaixo`/`Acima` movem o **mesmo objeto** (`resetUuidTodaArvore` + `removeFilho`/`addFilhoOnPosition`): novo `uuid`, **`gid` preservado**. Emitem `ElementoRemovido`+`ElementoIncluido`+`ElementoRenumerado`.
- **Bug latente corrigido:** o lote de "mover" emite `ElementoIncluido` **antes** de `ElementoRemovido` com os **mesmos gids**. Processar na ordem duplicaria o gid transitoriamente. **Correção:** processar **removes antes de includes** no lote (também torna o mover local correto).
- **O gap era só o remoto:** como o `gid` é preservado, o diff por *conjunto* (2a) e por situação (2b) não veem o mover — só a **ordem** mudou. **Solução:** shadow `gid→paiGid` + `diffReorder`, que agrupa filhos por pai e acha o irmão que "desceu" (mesmo conjunto, ordem diferente), reproduzindo via `moverElementoAbaixo`. Re-registra os gids↔novos uuids depois.

### 9.6 Fase 2d — "Reparent" (TAB/Shift+TAB): descoberta e validação

- **Descoberta que dissolveu a fase:** **não existe reparent puro** neste editor. TAB/Shift+TAB → `modificaTipoElementoWithTab` → `transformaTipoElemento`, que via `converteDispositivo` chama `criaDispositivo(paiNovo, novoTipo, …, atual.uuid)` — cria um **dispositivo novo** (a fábrica dá **gid novo**), preservando só o `uuid`, sob um **novo pai**. Ou seja: TAB é **transformação de tipo** (Artigo↔Parágrafo, Inciso→Alínea…), que sempre muda tipo **e** pai, com gid novo.
- **Consequência:** o transform já é coberto pela **Fase 2a** — remove `G_old`, adiciona `G_new` sob o novo pai; no remoto vira `removerElemento`+`adicionarElemento`. O `remove-antes-de-include` da 2c garante que o `uuid` compartilhado entre os dois eventos não causa duplicação.
- **Decisão:** a Fase 2d foi **validação** (testes que exercitam o fluxo transform local e remoto), sem novo caminho de código. O efeito colateral `SituacaoElementoModificada` (um vizinho vira `Modificado`) **não** é tratado aqui: `Modificado` nasce de edição de texto e se resolve naturalmente na **Fase 3**.

### 9.7 Fase 3 — Co-edição de texto (`Y.Text` por dispositivo)

- **Binding por linha:** `textoBinding.ts` (tradução **pura** Delta↔`Y.Text`, escopada por range de blot — testável headless) + `TextoSincronizador` (observadores dos `Y.Text` renderizados, anti-eco por origin `TEXTO_LOCAL`). `onTextChangeColab` só reage a `source='user'`; `pareceEdicaoDeTexto` descarta deltas estruturais que também chegam como `'user'` (rótulo, menu, embeds/blots) — só texto puro + formatação inline entra no `Y.Text`.
- **Delegação artigo→caput:** a linha de artigo renderiza o texto do **caput**; `rangesRenderizados` mapeia a linha ao `gid` do caput (o `Y.Text` real é o dele).
- **Fase 3c — flags de remissão (`remissaoMetaBinding.ts`, puro):** sincroniza só os flags **não-deriváveis** por identidade semântica (`inicio`, `targetLexmlId`, `textoRef`); o corpo do link é re-detectado localmente em cada cliente. **Escrito e testado aqui, mas fiado só na Trilha A/A2.b** (ver 9.10).

### 9.8 Fase 4 — Awareness e cursores

- `PresencaSincronizador` sobre a `Awareness` do provider (o `WebsocketProvider` já a sincroniza); `quill-cursors` para os cursores remotos. Identidade de awareness vem do host (`params.usuario`) — a validação server-side é da Etapa L.
- Cursor traduzido index↔{gid, offset} (`presencaSincronizador`), para a posição sobreviver a divergências de numeração/estrutura entre clientes.

### 9.9 Fase 5 — Undo por modo (`Y.UndoManager`)

- `UndoColaboracao`: um `Y.UndoManager` sobre o `Y.Array "articulacao"` (tracked origins `ORIGEM_LOCAL`+`TEXTO_LOCAL`, `captureTimeout: 0`). Undo desfaz **só o próprio** e re-entra pela porta das ops remotas (Fase 2). `captureTimeout: 0` é **load-bearing** — garante "1 ação estrutural = 1 passo" (duas inclusões seguidas não se fundem; provado por teste unitário). Trade-off aceito: undo de texto por transação (granularidade fina).
- **Bug grave da fiação (revisitado na Trilha A):** o wiring inicial interceptava em `undoRedoEstrutura`, **a jusante** de dois filtros de `EtaQuill.undo()/redo()` — a história interna do Quill e o gate de `Redux.future`. Consequência: **redo inalcançável** (em colaboração o `future` nunca é populado, pois o `UndoAction` do Redux é suspenso) e **undo de texto ignorava o `Y.UndoManager`** (era consumido pela história do Quill). **Correção:** `EtaQuill.undo()/redo()` desviam direto para o bridge quando `undoRedoColaboracaoAtivo`, pulando história + gate.
- **Bug de redo estrutural exposto pelo E2E:** o rebuild do DOM no undo fazia o mutation observer do Quill emitir um text-change `source='user'` **espúrio** (ex.: `delete` da linha removida), que `pareceEdicaoDeTexto` não filtrava ⇒ poluía o `Y.Text`/`Y.UndoManager` e o redo virava no-op. **Correção:** guard `reconstruindoEstruturaColab` (ativado **só** em lotes com `ElementoIncluido`/`ElementoRemovido`, durante o tick + a microtask do Quill) no `onTextChangeColab`. Estreitar o gatilho foi necessário — a primeira versão (guard em todo `processarStateEvents`) quebrou a co-edição de texto.
- **Nota de teste E2E:** o Ctrl+Y por teclado depende do editor ter foco (o rebuild do undo o solta); o botão Redo da toolbar não. O `title` do Redo é duplicado (o `editor-texto-rico` também tem "Refazer (Ctrl+y)") ⇒ adicionou-se a classe `lx-eta-btn-refazer` como seletor estável.

### 9.10 Trilha A — fechamento do modelo colaborativo no cliente

Quatro incrementos que fecham a paridade de features sob colaboração. Cada um começou por uma **análise que revisou premissas do plano**, e entregou unit (harness Node) + E2E (Playwright dois-navegadores), com commits `feat`/`test` separados.

- **A1 — `notaAlteracao` ao vivo (`sincronizadorEstrutural`):** o plano (§ADR-004) listava nota/aspas/omissão como `meta` a sincronizar; o código mostrou que **só `notaAlteracao` é não-derivável e limpo** — `abreAspas`/`fechaAspas` são **derivados** (`isDispositivoCabecaAlteracao`, `elementoUtil.ts`), e `textoOmitido`/omissis é conteúdo de texto (blot), não `meta`. Detecção local→Y por `ElementoModificado` comparando `elementos[0].notaAlteracao !== [1]` (O(1); distingue de edição de texto, que não muda a nota); escreve na cabeça-de-alteração. Y→Redux por `diffNotas` + `AtualizarNotaAlteracao` (anti-eco pelo `aplicandoRemoto`; `''` limpa a nota).
- **A3 — convergência do transform (TAB):** o E2E revelou que a promoção (que a **9.6 dava como "coberto"**) **não convergia** — B **crashava** (`isDispositivoCabecaAlteracao(undefined)` no `adicionaElemento`) ao reconstruir a inclusão `'antes'` de um **Omissis**, e o elemento **sumia** em B. Causa raiz específica da camada de colaboração (o app single-user usa `transformaTipoElemento`, não `adicionaElemento`). **Correções:** (a) blindagem em `aplicarInclusaoRemota` — `tentarAdicionar` nunca propaga exceção e confirma que produziu `ElementoIncluido`; fallback para inserir sob o `paiGid` real; (b) **Omissis não é referência de inserção válida** — `ehReferenciavel` pula `Omissis` ao escolher predecessor/sucessor de mesmo pai. Resultado: **A == B byte-exato**. Lição: a premissa "transform = add/remove, logo coberto" era verdadeira só para folhas isoladas; promoções restruturam vizinhos.
- **A2.a — re-detecção de remissão na co-edição:** o reducer `adicionaRemissaoInterna` lê o texto de `dispositivo.texto` (**Redux**), mas em colaboração o texto remoto chega só ao **Quill** (Redux defasa até o flush por blur). Novo callback `redetectarRemissoes(gid)` no `TextoSincronizador.onYTextChange`; no editor, sobe o texto pro Redux (`atualizarTextoElementoAction` direto, pois o update `'silent'` não marca `blotConteudo.alterado`) + detecta — tudo anti-eco. Sem isso o link só apareceria quando o receptor interagisse.
- **A2.b — sync do tombstone de remissão:** dos três flags não-deriváveis, só o **tombstone** (`excluidaManualmente`) precisa viajar — `valida:false` **re-deriva** (o `removeElemento` de cada cliente marca as remissões ao alvo removido) e `revisao` não ocorre (revisão × colaboração são exclusivos). E ele importa **porque** o A2.a re-detecta: sem o tombstone, um link removido manualmente reapareceria no outro cliente. `RemissaoMetaSincronizador` fia o `remissaoMetaBinding` (9.7) e **compartilha o `GidRegistry`** do sync estrutural. No receptor, `aplicarTombstonesRemotos` reusa o fluxo existente — acha o `refId` **local** pela identidade semântica → `removerRemissaoPorId` (DOM, guardado por `aplicandoTombstoneRemoto`) + `excluirRemissaoManualAction` (state). Filtro do observer pega tanto a mudança **dentro** do sub-mapa `remissoes` (path) quanto sua **criação** (`keysChanged`).

### 9.11 Estado atual e próximos passos

Modelo colaborativo no cliente **fechado**: estrutura (add/remove, suprimir/restaurar, reorder, type-transform), texto, cursores, undo/redo, nota de alteração e remissão (detecção + tombstone) convergem entre dois clientes, com anti-eco e cobertura **unit (73/73, harness Node)** + **E2E (9/9, Playwright dois-navegadores)**. Invariante sagrado preservado: **colaboração OFF = app idêntico ao de hoje** (browser **2890/2890**, sem regressão).

- **Gaps conhecidos (registrados):** reparent **mesmo-gid** via `agrupar`/`desagrupar` (`SituacaoElementoModificada` — blindado contra crash, mas **não converge**; candidato à Fase 6); co-edição **simultânea do mesmo dispositivo** (possível aspereza de cursor pelo `atualizarQuill` no `ElementoModificado` — ADR-001, não regressão).
- **Fora deste repo (bloqueio de produção):** **Etapa L** (host — controle de acesso e token de sala) + **sidecar Node** real + **persistência durável** (snapshot sidecar→host, parte não-undo da Fase 5). É o que falta para validar ponta-a-ponta com dois clientes reais e virar produto.

### 9.12 Trilha B (host) — integração no host: build de lib + embed resiliente

Início da Trilha B: o build colaborativo do `lexml-eta` passou a ser empacotado como lib (`npm run prepublish` → `npm pack`) e consumido pela aplicação host. O grosso da Trilha B (sidecar Node, autoridade de persistência no host e Etapa L) vive **no repositório do host**, numa sessão própria; aqui ficam só os ajustes do lado `lexml-eta`.

- **Build de dist destravado (2 regressões latentes da colaboração):** o `prepublish` nunca fora rodado desde que a colaboração entrou. (1) `test/collab/shoelace-shim.d.ts` augmenta `HTMLElementTagNameMap['sl-dialog']` para um `SlDialogLike` reduzido (necessário no harness Node); como `tsconfig.dist.json` incluía `**/*.ts` e só excluía `*.d.ts` da raiz, o shim entrava no programa da biblioteca e sobrepunha o Shoelace → `TS2345`. Fix: `exclude` += `"test"` (build de lib não type-checa testes). (2) Os `import()` dinâmicos de `transporteReal`/`quill-cursors` (lazy-load da colaboração) geram chunks, incompatíveis com o `output.file` do `index.min.js`. Fix: `inlineDynamicImports: true` **só** no min; o entry `dist/index.js` (`output.dir`) segue code-split e preserva o lazy-load (invariante "OFF intocado").
- **Embed resiliente (crash de init num host oculto/assíncrono):** `inicializarEdicao` revelava a articulação com `document.querySelector('lexml-eta-articulacao')!['style']` **síncrono**. Um host que chama `inicializarEdicao` no mesmo tick em que revela o container (troca de estado do framework) pega o **Light DOM ainda não renderizado** — o topo `lexml-eta` já criou o `lexml-eta-proposicao` (por isso o fluxo entra no método), mas o `render()` da proposição, que emite `lexml-eta-articulacao`, é uma atualização assíncrona separada que ainda não flushou. **Não é visibilidade** (`display:none` não some do `querySelector`), é ciclo de render. Fix: `revelarArticulacao()` aguarda `this.updateComplete` e acessa guardado/escopado; **hardening** `aguardarEditor()` desce a cadeia (proposicao→articulacao→**neto** editor) antes de `ligarColaboracao` usar `this.editorComponent` — importante porque `ligarColaboracao` roda em `try/catch` que **engole** a falha do editor-não-pronto (sem o guard, o crash somiria mas a colaboração não ligaria silenciosamente). Guard espelho no host: `customElements.whenDefined` + `updateComplete` + `setTimeout(0)` antes do init.
- **Estado da Trilha B no host (informativo):** sidecar, autoridade de persistência e Etapa L já estão commitados no repositório do host. Falta: validar o embed ponta-a-ponta (o teste de usuário no host caiu no meio) e a política de órfãos/cold-start real.
