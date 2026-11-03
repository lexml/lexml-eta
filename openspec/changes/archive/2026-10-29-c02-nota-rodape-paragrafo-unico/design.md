## Context

A nota de rodapé da justificação é editada em `NotaRodapeModal` (`src/components/editor-texto-rico/nota-rodape-modal.ts`). O modal fica anexado ao `document.body`, fora do editor, e tem um Quill 1.3.7 próprio (`PrivateQuill`, formatos `bold`, `italic`, `underline` e `link`).
- `open()` copia o HTML da nota para `quill.root.innerHTML`.
- `save()` envia `quill.root.innerHTML` no evento `NOTA_RODAPE_INPUT_EVENT`. Antes, compara o HTML com `textoInicialNotaRodape` para não salvar quando nada mudou.
- `shouldClose()` usa a mesma comparação para decidir se pede confirmação de descarte.

Hoje:
- Enter e Shift+Enter criam linhas, que viram `<p>` novos.
- Colar texto com quebras gera vários `<p>`.
- Uma nota já salva com vários `<p>` abre com todos eles.

Na gravação (`montaNotaRodape`, `justificacao.ts`, #993), os parágrafos da nota viram um só:
- os parágrafos vazios são descartados;
- os demais são unidos por um espaço;
- os espaços das pontas são removidos.

No Quill, um "parágrafo" é uma linha do documento, delimitada por `\n`. Os formatos inline ficam nos trechos de texto, e não no `\n`.

## Goals / Non-Goals

**Goals:**
- O editor da nota tem sempre uma só linha, qualquer que seja a origem do texto: teclado, colar, arrastar ou abertura.
- Enter e Shift+Enter são ignorados e geram um aviso no modal.
- A união segue o mesmo critério da gravação.

**Non-Goals:**
- Mudar a gravação no LexML ou o formato do atributo `texto` da nota.
- Ajustes visuais (`min-height` do editor) e limpeza (`console.log` de `shouldClose`), por decisão do usuário.
- Mudar o editor da justificação em si, que continua aceitando parágrafos.

## Decisions

**D1. Uma só função de união, aplicada à abertura e a toda edição.** `unirLinhas(delta)` é pura e devolve o mesmo conteúdo em uma linha:
- percorre as linhas do Delta (`eachLine`) e descarta as vazias;
- une as demais com um `' '` sem formato;
- remove os espaços das pontas;
- mantém os formatos inline dos trechos.

É o mesmo critério de `montaNotaRodape`, então o que o modal mostra é o que será gravado. *Alternativa:* tratar só Enter e colar. Ficariam de fora arrastar e soltar e outras inserções, e a regra teria várias implementações.

**D2. Rede de segurança no `text-change`.**
- A cada `text-change` com `source === 'user'`, se o documento tiver mais de uma linha, o modal aplica `unirLinhas`.
- O resultado entra com `setContents(…, 'api')`, e o cursor é reposicionado no mesmo deslocamento de texto, descontadas as quebras removidas. A fonte `'api'` (e não `'silent'`) faz o histórico do Quill fundir a união com a edição do usuário num só passo, e o Ctrl+Z desfaz os dois juntos. Com `'silent'`, o histórico registraria o colar sem a união, e o desfazer seria aplicado sobre um documento diferente. Não há laço, porque o handler só reage a `source === 'user'`.
- Com isso, colar (inclusive HTML com formatação) e arrastar caem na mesma regra sem um matcher de clipboard próprio.

*Alternativa:* um matcher em `quill.clipboard`. Ele cobre só o colar, e no Quill 1.3.7 a ordem dos matchers em relação aos de bloco é frágil.

**D3. Enter e Shift+Enter.**
- O Quill do modal ganha um atalho `{ key: 13, shiftKey: null }` nas opções de `keyboard.bindings`. No Quill 1.3.7, os atalhos das opções são registrados antes dos padrões.
- O atalho devolve `false`, então nada é inserido, e chama `exibirAvisoParagrafoUnico()`.
- O aviso é um elemento do modal com `role="status"`, com o texto "A nota de rodapé admite um só parágrafo.". Ele some depois de 4 segundos, e não na próxima edição: a spec exige o aviso visível depois de o usuário continuar digitando.
- O atalho não interfere no Escape (fecha o modal) nem no tooltip de link do Quill, que usa um `input` próprio.

**D4. Nota antiga ao abrir, fechar e salvar.**
- `open()` carrega o HTML e aplica `unirLinhas` com `'silent'`.
- Só quando houve união, o HTML resultante vira a **base de comparação** (`textoInicialNotaRodape`). Assim, fechar sem alterar não pede confirmação.
- O indicador `uniuAoAbrir` faz `save()` enviar a nota unida mesmo sem outra alteração (decisão do usuário).
- Notas de um parágrafo mantêm a base e a comparação de antes. Isso evita mudar comportamento fora do escopo: uma nota nova vazia continua sendo enviada ao salvar, como hoje.
- *Alternativa descartada:* comparar com o HTML recebido. O Quill pode reescrever o HTML de uma nota de um parágrafo sem mudar o conteúdo, e salvar enviaria uma nota inalterada.
- Fechar sem salvar mantém a nota como estava no documento. O LexML já a grava unida.

*Alternativa:* comparar só com o HTML recebido. Fechar uma nota antiga sem mexer pediria confirmação de descarte, sem o usuário ter alterado nada.

**D5. Testes.**
- **Componente**, com o Quill real em `test/components/editor-texto-rico/` (arquivo novo `nota-rodape-modal.test.ts`). O modal é construído direto, com um `domNode` de teste que escuta `NOTA_RODAPE_INPUT_EVENT`. Casos:
  - Enter e Shift+Enter, disparando `keydown` no `quill.root`;
  - colar com `clipboard.dangerouslyPasteHTML(…, 'user')`;
  - abrir uma nota antiga;
  - fechar e salvar sem alterar;
  - preservação de negrito e link.
- **E2E Cypress** (`docs/guia-cypress.md` §4 e §7): abre o fixture `demo/doc/teste_nota_rodape.json`, edita uma nota pela aba "Notas" (`sl-button[title="Editar nota de rodapé"]`, clicado com `dispatchEvent`), tecla `{enter}` no `.ql-editor` do modal, confere o aviso e um só `<p>`, e salva.
- Colar e a nota antiga ficam no teste de componente. Colar no Cypress depende de clipboard nativo, sem precedente no projeto. Uma nota com dois parágrafos não existe no fixture, que já foi gravado unido.

## Risks / Trade-offs

- **[Risco] Reposicionar o cursor depois da união pode errar por um caractere** quando uma linha vazia é descartada: ao colar, o Quill reposiciona o cursor depois do handler, pelo tamanho original do trecho colado. → Mitigação: sem linhas vazias o tamanho não muda, e há um teste que digita depois de colar.
- **[Trade-off] Notas antigas só mudam quando são salvas no modal.** Fechar sem salvar preserva o HTML de vários parágrafos no editor. O arquivo LexML não muda, porque a gravação já une.
- **[Risco] HTML do host com elementos de bloco fora de `<p>`** (por exemplo, `<div>`). → Mitigação: o Quill converte blocos em linhas ao carregar, e `unirLinhas` age sobre as linhas, não sobre as tags.
