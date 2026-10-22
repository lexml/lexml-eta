## Context

A #991 criou o conversor da justificação (`src/model/lexml/documento/conversor/justificacao.ts`): `montaJustificacao(html)` ao salvar e `lerJustificacao(documento)` ao abrir, baseados no DOM. Hoje `montaJustificacao` retira `lexml-eta-nota-rodape` antes de converter (exceção temporária).

No editor, a nota de rodapé é um embed inline (`NotaRodapeBlot`, `moduloNotaRodape.ts`), e o HTML de `texto` traz:

```html
regulamento<lexml-eta-nota-rodape class="lexml-eta-nota-rodape" contenteditable="false"
  id-lexml-eta-nota-rodape="nr1729…" numero="1" texto="&lt;p&gt;Texto &lt;b&gt;formatado&lt;/b&gt;&lt;/p&gt;">1</lexml-eta-nota-rodape>.
```

- `texto` é o `innerHTML` do Quill do modal (`nota-rodape-modal.ts`, formatos `bold`, `italic`, `underline` e `link`), codificado com `encodeHtml`. Pode ter mais de um `<p>` e `<p><br></p>`.
- Ao carregar com `setContent`, o matcher do clipboard (`addClipboardMatcher`) reaproveita `id-lexml-eta-nota-rodape`, `numero` e `texto` quando `isAbrindoTexto` é verdadeiro. `setContent` é silencioso, então `renumerarTodasNotas` não roda: o número exibido é o do atributo.
- A aba "Notas" (`renderNotasRodape`, `lexml-eta.component.ts`) usa `this.notasRodape` e `_lexmlJustificativa.notasRodape`, atualizados por `NOTA_RODAPE_CHANGE_EVENT`/`NOTA_RODAPE_REMOVE_EVENT` (via `updateNotasRodape` → `getNotasRodape()`).

Verificado antes desta change com o CLI 2.0.0 e o `lexedit.xsd`: `NotaDeRodape` é `genInline`, aceito dentro de `p`, `li` e `span` de célula, com `b`, `i`, `a` e `span` dentro. `tojson` devolve `{ name: NotaDeRodape, value: { TYPE_NAME: 'br_gov_lexml__1.GenInline', content: [...] } }`.

## Goals / Non-Goals

**Goals:**

- Nota gravada no ponto exato da referência, com o texto inline, válida no XSD.
- Ida e volta estável: salvar, abrir e salvar de novo gera a mesma `Justificacao`.
- Numeração e aba "Notas" corretas logo depois de abrir.

**Non-Goals:**

- Parágrafos dentro da nota (a especificação 07 deixa para um segundo momento).
- Revisões de texto (#994): o texto excluído em revisão continua descartado, com as notas que estiverem nele.
- Mudar o HTML ou a lista de notas entregues ao host (`getProposicao()`).

## Decisions

### D1. Gravação: `NotaDeRodape` inline, sem número nem id

Em `montaInline`, o elemento `LEXML-ETA-NOTA-RODAPE` vira `NotaDeRodape` com o `content` montado a partir de `texto`: `decodeHtml`, parse em `<template>` e o mesmo `montaInline` já usado nos parágrafos (`strong`/`b` → `b`, `em`/`i` → `i`, `u`, `a` sem `rel`, `br` retirado). O texto filho do elemento (o número exibido) é ignorado, e `id-lexml-eta-nota-rodape` e `numero` não são gravados. A retirada de `lexml-eta-nota-rodape` no início de `montaJustificacao` sai; a de `del` fica (#994).

Alternativa: gravar o id como `id` do `NotaDeRodape` (o XSD aceita `xsd:ID`). Descartada: a ida e volta não precisa dele, porque o id é recriado ao abrir e não aparece no arquivo.

### D2. Parágrafos da nota unidos por espaço

Decisão do usuário (19/10/2026). Cada `p` do `texto` da nota contribui com o seu conteúdo inline. Entre dois `p` com conteúdo, entra o texto `' '`; os `p` vazios são ignorados. Os espaços nas pontas da nota são retirados para que `<p>Primeiro.</p><p>Segundo.</p>` dê exatamente `Primeiro. Segundo.`. A alternativa `<span class="p">` (sem perda, validada no XSD) foi apresentada e não escolhida; fica registrada para o "segundo momento".

### D3. Leitura: elemento do editor com id novo e número pela ordem

Em `criaInline`, `NotaDeRodape` deixa de ser lido como texto e vira `<lexml-eta-nota-rodape id-lexml-eta-nota-rodape="nr…" numero="N" texto="…">N</lexml-eta-nota-rodape>`. O `texto` é `<p>` + o HTML inline do `content` (o mesmo `criaInline`), codificado com `encodeHtml`, no formato que o modal produz. `N` começa em 1 e segue a ordem de leitura do documento, que é a ordem do texto (o leitor percorre os blocos e o inline em ordem, inclusive dentro de listas e células). O id segue o formato de `gerarId` (`nr` + timestamp), com o índice da nota acrescentado para ser único entre as notas lidas de uma vez.

Alternativa: deixar o número para `renumerarTodasNotas` depois do `setContent`. Descartada como única fonte: `setContent` é silencioso, e chamar a renumeração exigiria mexer no módulo e na seleção do Quill. O leitor já conhece a ordem.

### D4. Componente: lista de notas e aba "Notas"

Em `abrirDocumentoArticulado`, depois do `setContent`, o componente lê a lista de notas do módulo (`quill.notasRodape.getNotasRodape()`, a mesma usada por `updateNotasRodape`) e a atribui a `_lexmlJustificativa.notasRodape` e a `this.notasRodape`, que alimentam a aba "Notas". Não é preciso passar a lista ao `setContent` (que só a usa em `associar`): o blot já guarda a nota no nó (`domNode.notaRodape`) ao ser criado. Sem nota no documento, a lista fica vazia. A aba "Notas" não ganha foco ao abrir (só ao alterar uma nota, como hoje).

### D5. Spec de ida e volta

O requisito "Ida e volta do documento salvo pelo conversor" é `MODIFIED`. O OpenSpec não deixa um `MODIFIED` renomear cenário, então o cenário "Exceção temporária com nota de rodapé ou revisão de texto" mantém o nome, mas o conteúdo passa a tratar só da revisão de texto. O nome é corrigido na #994, quando a exceção sair.

### D6. Testes

- **Unitários** (`test/model/documento/justificacao.test.ts`): gravação no meio do parágrafo, em lista e em célula; formatação e link; dois parágrafos unidos; nota vazia; número e id não gravados; nota dentro de `del` descartada. Leitura: elemento do editor com `numero` 1, 2 na ordem, `texto` decodificável com a formatação; ida e volta no modelo.
- **Componente** (`documentoArticulado.component.test.ts`): ida e volta com o Quill real, carregando um HTML de `texto` com notas por `setContent`; a aba "Notas" e `_lexmlJustificativa.notasRodape` refletem o documento aberto; abrir um documento sem notas esvazia a lista.
- **Integração** (`documentoArticulado.integration.ts`): o cenário da justificação ganha notas (parágrafo, lista e célula); o XML contém `NotaDeRodape` e valida no `lexedit.xsd`, e o documento convertido de volta é igual ao salvo.
- **E2E**: fixture `demo/doc/teste_nota_rodape.json` gerado pelo `getDocumentoArticulado()` real (como o `teste_justificacao.json`), não à mão. O spec abre o arquivo, confere as referências numeradas no editor e a aba "Notas", e que `getDocumentoArticulado()` devolve a mesma `Justificacao`. Sem download (sem precedente no projeto, `docs/guia-cypress.md`).

## Risks / Trade-offs

- [Nota com vários parágrafos perde a quebra ao reabrir] → decisão do usuário (D2); a spec registra o comportamento, e a ida e volta continua estável (a nota reaberta já tem um parágrafo só).
- [O `texto` gerado pelo leitor difere do que o modal produziria (por exemplo, `b` em vez de `strong`)] → o Quill do modal normaliza o HTML ao editar, e a gravação aceita as duas formas. A ida e volta com o Quill real cobre o caso.
- [Id recriado a cada abertura] → o id só é usado dentro da sessão (aba "Notas", localizar e editar a nota) e não vai para o arquivo.
- [Nota dentro de texto excluído em revisão é descartada] → continua a exceção da #994.
- [Falha intermitente `ResizeObserver loop completed with undelivered notifications` no teste de componente de anexo de parecer, já registrada na #991] → voltou uma vez na task 3.2, na suíte completa (`npm test`); a nova execução da suíte e seis execuções isoladas do arquivo passaram. É aviso do navegador, não do editor; a saída prevista na #991 (tratar o aviso no teste) fica como proposta ao usuário.
- [`numeroInicial` do módulo diferente de 1] → hoje o editor da justificação usa o padrão 1; o leitor numera a partir de 1.

## Migration Plan

Nada a migrar. Arquivos salvos antes desta change não têm `NotaDeRodape` e abrem como hoje.
