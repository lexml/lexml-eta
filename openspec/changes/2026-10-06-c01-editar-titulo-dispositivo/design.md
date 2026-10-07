## Context

Ver `proposal.md` (Why). Estado atual do título de dispositivo, verificado no código:

```
LexML <tituloDispositivo> --buildProjetoNormaFromJsonix:336--> dispositivo.tituloDispositivo (string?)
dispositivo --createElemento (elementoUtil:112)--> elemento.tituloDispositivo
elemento --criarContainerLinha (eta-quill-util:37)--> EtaBlotTituloDispositivo (contenteditable=false)
dispositivo --buildJsonixFromProjetoNorma:405 (isValidText)--> <tituloDispositivo>
```

- Leitura, exibição e gravação já existem; falta a edição. Não há action, reducer, regra de menu nem validação do título.
- O blot do título só é criado **na construção da linha** (`if (elemento.tituloDispositivo)`) e `EtaContainerTable.atualizarAtributos` não conhece esse blot: hoje, mudar o título de uma linha existente não atualiza a tela.
- A edição de dados do dispositivo fora do texto já tem precedente: a nota de alteração "(NR)" usa um blot não editável que dispara um `CustomEvent` ao clique, o `editor.component` abre um `sl-dialog` (`editarNotaAlteracaoDialog`) e o resultado vira uma action Redux (`atualizaNotaAlteracao` emite `ElementoModificado` com o elemento antes e depois).
- A revisão é genérica por `ElementoModificado` (`atualizaRevisao.processaEventosDeModificacao`), mas **centrada em texto**: a descrição é fixa ("Texto do dispositivo foi alterado"), a detecção de "voltou ao original" (`revisaoDeElementoComMesmoUuid2RotuloEConteudo`) compara só `conteudo.texto`, a rejeição (`rejeitaModificacao`) chama `atualizaTextoElemento` (restaura só o texto) e o undo/redo (`processarModificados`) restaura só `texto`/norma/nota.
- Remissões (registry por uuid + posição, detecção por blur) e a injeção de links na serialização são específicas do campo `texto`.

## Goals / Non-Goals

**Goals:**
- Adicionar, alterar e remover o título pelo menu e pelo clique no título, via diálogo, com formatação restrita e validação informativa.
- Undo/redo atômico e revisão corretos, inclusive aceitar/rejeitar.
- Funcionar dentro de bloco de alteração.

**Non-Goals:**
- Edição inline do título na linha do Quill (descartada, ver Decisões).
- Remissão no título; título em agrupadores; mudança no formato LexML.
- Reaproveitar o `editor-texto-rico` (peso desproporcional).

## Decisions

### D1. Diálogo modal com ação Redux (e não edição inline)
Seguir o padrão da nota de alteração: blot do título dispara `CustomEvent` ao clique, o `editor.component` abre o diálogo, e o OK despacha `atualizarTituloDispositivoAction`.
- **Por quê:** cada operação vira um passo atômico do histórico; a sanitização fica na borda; não cria segunda região editável dentro da linha Quill (que já tem invariantes frágeis de seleção/índice e fluxo de debounce/blur do texto).
- **Alternativas:** (B) inline no blot — risco alto de conflito com Enter/Backspace/Tab e com o fluxo de sincronização do texto, e exigiria um debounce/blur próprio para o título; (C) linha separada — altera o modelo de linhas, numeração, paginação e navegação.

### D2. Mini-editor próprio no diálogo, e não `editor-texto-rico`
Um Quill leve dentro do `sl-dialog`, com `formats` e toolbar limitados a itálico, sublinhado, subscrito e sobrescrito, sem o módulo de remissão, de revisão, de aspas curvas nem de nota de rodapé.
- **Por quê:** `lexml-eta-editor-texto-rico` carrega anexos, tabelas, notas de rodapé e módulo de revisão — o dobro do necessário e com efeitos colaterais.
- O Quill do projeto emite `<em>` para itálico: normalizar para `<i>` na sanitização (mesmo critério do texto, que converte `strong`/`em` em `b`/`i` na serialização). A sanitização final (reducer) aceita só `i`, `u`, `sub`, `sup`, descartando as demais tags e mantendo o texto interno.

### D3. Action e reducer dedicados, com ciclo de histórico igual ao do texto
`ATUALIZAR_TITULO_DISPOSITIVO` carrega `atual` (Referencia) e `tituloDispositivo` (string; vazio/indefinido para remoção). O reducer: localiza o dispositivo (`getDispositivoFromElemento`, com caput), checa `isAcaoPermitida`/bloqueio, sanitiza, ignora se não mudou, cria `original` e `alterado` com `createElemento`, e emite `ElementoModificado` + `ElementoValidado`, com `buildPast` — como `atualizaNotaAlteracao`.
- **Alternativa:** reutilizar `ATUALIZAR_TEXTO_ELEMENTO` com um campo a mais — descartada: o fluxo de texto tem curto-circuito por `dispositivo.texto === textoAtual`, caminho de remissão e `somenteMarcacaoRemissao`, que não se aplicam ao título.

### D4. Ação no menu por regras de tipo
Uma nova classe de ação `AtualizarTituloDispositivo` (com variantes de rótulo "Adicionar título", "Editar título", "Remover título") adicionada nas regras de Artigo, Parágrafo, Inciso, Alínea e Item (`regrasArtigo` etc.), condicionada a: dispositivo editável, não bloqueado, não removido em revisão. A decisão de qual rótulo aparece depende de `tituloDispositivo` já existir. Dentro de bloco de alteração a regra é a mesma (sem exigência de cabeça de alteração, ao contrário da nota).

### D5. Ciclo de vida do blot do título no container
`EtaContainerTable` passa a guardar o blot do título e a criá-lo, atualizá-lo ou removê-lo em `atualizarAtributos`/`atualizarElemento` conforme `elemento.tituloDispositivo`. Alternativa de contingência: recriar a linha inteira via `criarContainerLinha` quando a presença do título mudar (precedente: reconstrução por mudança de tipo no `editor.component`, ver CLAUDE.md, item do bug do TAB).
- **Decisão a validar na implementação:** preferir o ciclo de vida no container; usar recriação de linha só se a inserção dinâmica no `etaTdTexto` se mostrar frágil.
- Um título vazio (`''`) é estado válido na sessão (ver D6): o blot deve ser exibido para `tituloDispositivo !== undefined`, e não só para string não vazia.

### D6. Validação como aviso no `validaDispositivo`
Nova checagem de título em `dispositivoValidator`, nível `TipoMensagem.WARNING`, sem bloquear: (a) título definido e vazio (após remover tags/espaços) → "Não foi informado um texto para o título do <tipo de dispositivo>."; (b) primeiro caractere de texto (ignorando tags e espaços) em minúscula → aviso de iniciar com maiúscula. Título `undefined` não é validado. A serialização continua omitindo título vazio (`isValidText`).
- **Interpretação adotada:** o OK com texto vazio é aceito (não bloqueia) e deixa o título vazio com aviso, lendo literalmente a issue (a mensagem existe porque o estado existe). "Remover título" é a ação explícita que leva a `undefined`. Se a intenção era tratar o OK vazio como remoção, só muda o reducer e um cenário de spec.

### D7. Revisão e undo/redo
- `atualizaRevisao`: descrição própria quando a modificação altera apenas o título (novo `actionType` mapeado em `mapperActionTypeToDescricao`); a comparação de "voltou ao original" passa a incluir `tituloDispositivo`.
- `rejeitaRevisao.rejeitaModificacao`: além do texto, restaurar o título do `elementoAntesRevisao` (despachando a mesma lógica do reducer de título, sem passo de histórico duplicado).
- `undoRedoReducerUtil.processarModificados`: restaurar `tituloDispositivo` junto com `texto`.
- **Cuidado documentado:** uma primeira tentativa de ajustar a lista de removidos no reducer quebrou undo/redo em outra mudança (ver CLAUDE.md, bug do TAB); aqui o ajuste fica restrito a copiar o campo do elemento, sem filtrar eventos.

### D8. Serialização
Nenhuma mudança de formato. `buildStructuredContent(dispositivo, 'tituloDispositivo', ...)` já converte HTML com `i`/`u`/`sub`/`sup` e não injeta remissão (só faz isso para `campo === 'texto'`). Acrescentar apenas testes (título formatado; título em bloco de alteração; título vazio não gravado) e conferir a normalização `em`→`i`.

## Risks / Trade-offs

- **Revisão é texto-cêntrica em vários pontos** (comparação, rejeição, undo/redo, descrição) → cobrir cada ponto com teste unitário próprio e um cenário E2E de revisão.
- **Ciclo de vida do blot dentro de uma linha existente** → mitigação: contingência de recriar a linha, validar com teste de DOM e E2E.
- **`sl-select`/componentes Shoelace assíncronos** (invariante v do CLAUDE.md) → o diálogo usa apenas botões e um Quill; se surgir `sl-select`, aplicar o mesmo cuidado.
- **Condição de corrida do menu de contexto** (pré-existente, ver `docs/analises/ANALISE_CORRIDA_CLIQUE_MENU_CONTEXTO.md`) pode afetar um E2E que clique no menu logo após outra ação → intercalar passos no teste, como orienta `docs/guia-cypress.md`.
- **Título com remissão vindo de arquivo antigo** → a leitura continua entregando HTML com `<a>`; a sanitização só age ao editar. Aceito: renderizar como hoje até o usuário editar.
- **Tipos de mensagem**: usar `WARNING` pode ter peso visual diferente de `ERROR` nos alertas globais → conferir na implementação como o editor trata `WARNING` na linha e no painel de alertas.
