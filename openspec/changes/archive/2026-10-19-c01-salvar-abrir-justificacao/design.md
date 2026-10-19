## Context

O HTML da justificação já existe pronto no editor: `_lexmlJustificativa.texto` (`editor-texto-rico.component.ts`, `ajustaHtml`) troca `ql-align-*`/`ql-indent` por `align-*`/`indent`, retira as células ocultas `td[merge_id]` e é o mesmo texto que o host recebe hoje em `getProposicao().justificativa`. `setContent` faz o caminho de volta só para `align-*`, e é totalmente `'silent'` (invariante y do `CLAUDE.md`).

Os metadados do LexEdit seguem o padrão do item 13 do `CLAUDE.md`: um campo em `DadosLexEdit`, um montador puro em `buildJsonixFromProjetoNorma.ts`, um leitor puro e tolerante, coleta em `getDocumentoArticulado` e aplicação em `abrirDocumentoArticulado`, depois de `inicializarEdicao`. O fecho já mostrou que `DadosLexEdit` pode levar dados que vão para o LexML, e não para `lexedit` (`local` → `ParteFinal`).

O que o conversor 2.0.0 e o `lexedit.xsd` aceitam foi verificado antes de escrever esta change, com XMLs de teste:

- `tojson` devolve `justificacao[0].partePrincipal.agrupamentoHierarquicoOrDivOrAgrupamento`, uma lista de `{ name, value }`. `p`, `td`, `th`, `span`, `b`, `i`, `u`, `sup`, `sub` e `a` são `GenInline` com `content`; `ul`/`ol` são `HTMLlist` com `li: [{ TYPE_NAME: 'br_gov_lexml__1.Li', content }]`; `table` é `Table` com `tr: [{ TYPE_NAME: 'br_gov_lexml__1.Tr', tableCellElement: [{ name, value }] }]`; `img` é `Img`.
- `class` vem como `clazz`, `xlink:href` como `href`, e `colspan`, `rowspan` e `border` como números.
- O XSD rejeita `<p>` dentro de `td`, `td@width` e `table@width="100%"`. Aceita `style` em todos esses elementos, `<span class="p …">` dentro de `td`, `<p><img src="data:…" style="width: 50%"/></p>` e `<p/>`.
- O editor grava a largura da coluna como atributo `width="N%"` (`TableTrick.changeWidthCol`) e a da imagem também (`alterarLarguraDaImagem`), mas a da tabela vai em `style="width:N%"` (`TableTrick.changeWidthTable`; corrigido na task 5.1, a primeira leitura supunha atributo). O plugin de tabelas não guarda nenhuma das duas no seu modelo (`TableCellBlot` só conhece ids, `colspan` e `rowspan`), então `setContent` as descarta. A imagem é um `BlockEmbed` (`image-blot.ts`), isto é, um bloco irmão dos parágrafos, e mantém a largura.

## Goals / Non-Goals

**Goals:**

- Conversor puro, testável sem o componente, nos dois sentidos.
- Ida e volta estável: o HTML lido do arquivo, carregado no Quill e lido de novo de `texto`, gera a mesma `Justificacao`.

**Non-Goals:**

- Notas de rodapé, revisões de texto e `textoAntesRevisao` (#993, #994).
- Mudar o HTML que o host recebe em `getProposicao().justificativa`.
- Ler `Justificacao` em `buildProjetoNormaFromJsonix`: o modelo de edição da norma continua sem ela.

## Decisions

### D1. A justificação chega ao montador por `DadosLexEdit.justificacao`

`DadosLexEdit` ganha `justificacao?: string`, com o HTML de `texto`. `montaProjetoNorma` acrescenta `justificacao: [montaJustificacao(html)]` ao `ProjetoNorma` quando o montador devolve algo. Como `pendencias`, o campo não é preenchido por `lerMetadadoLexEdit`: a leitura é feita por um leitor próprio, porque o dado não está em `lexedit`.

Alternativas: um parâmetro novo em `criarDocumentoArticulado`, que já tem cinco; ou um campo no modelo `ProjetoNorma`, que hoje descarta a justificação de propósito (teste "exporta somente identificação, parte inicial e articulação"). As duas espalham a mudança sem ganho.

### D2. Conversor próprio, baseado no DOM

Novo `src/model/lexml/documento/conversor/justificacao.ts`, com `montaJustificacao(html): any | undefined` e `lerJustificacao(documento): string`. O HTML é lido com o parser do navegador (`<template>`), percorrendo os nós. As funções dos dispositivos (`buildStructuredContent*`, `montaTag`) usam expressões regulares e só tratam conteúdo inline com remissões, sem blocos aninhados nem atributos de tabela. Todo o código e os testes rodam no navegador (Web Test Runner e Cypress), então o DOM está disponível.

`montaJustificacao` devolve `undefined` quando não sobra nenhum bloco com conteúdo (texto ou imagem). Parágrafos vazios entre outros são gravados como `p` sem `content`.

### D3. Texto escapado, como nos dispositivos

`criarDocumentoArticulado` aplica `decodificarTextoJsonix` e `preservarEspacosJsonix` ao documento inteiro, e a justificação passa por eles. O montador grava cada texto escapado (`&amp;`, `&lt;`, `&gt;`), como fazem os dispositivos; sem isso, um `&amp;` digitado viraria `&`. `preservarEspacosJsonix` é necessário também aqui: o conversor descarta texto só com espaços, como o espaço entre `<b>a</b> <i>b</i>`.

### D4. Mapeamento

| Editor (`texto`) | LexML gravado | Ao abrir |
|---|---|---|
| `p` na raiz, `class` | `p` com `clazz` igual | igual |
| `ul`/`ol` > `li`, `class="indent-N"` | `li` com `clazz` igual | `indent-N` vira `ql-indent-N` |
| `strong`/`b`, `em`/`i`, `u`, `sup`, `sub`, `span` | `b`, `i`, `u`, `sup`, `sub`, `span` | igual |
| `a href target rel` | `a` com `href` (`xlink:href`) e `target`, sem `rel` | `a href target` |
| `td`/`th` com `width="N%"` | `style="width: N%"` | atributo `width` (descartado pelo `setContent`) |
| `table` com `style="width:N%"` | `style="width: N%"` | `style` (descartado pelo `setContent`) |
| `table border` | `border` | igual |
| `table_id`, `row_id`, `cell_id`, `tbody` | retirados | o Quill recria |
| `id` da tabela | `_tabela<n>`, na ordem | não lido |
| `colspan`/`rowspan` igual a 1 | omitidos (o padrão do XSD é 1) | omitidos |
| `p` dentro de célula | `span` com `clazz` `p` mais as classes do parágrafo | `p` com as outras classes |
| `img` na raiz com `width`/`height` | `p` > `img`, com `src`, `alt` e `style` de largura e altura | `p` que só tem `img` vira `img` na raiz |
| `br` | retirado | — |
| `lexml-eta-nota-rodape` | retirada | — |
| `ins` | só o texto | — |
| `del` | retirado com o conteúdo | — |

As classes são mantidas como estão, inclusive `td-q` do plugin de tabelas e as de recuo, espaçamento e estilo (`ql-text-indent-0px`, `ql-margin-bottom-0px`, `estilo-*`). O XSD aceita qualquer `class`, e retirá-las arriscaria a ida e volta.

Elemento inline desconhecido é substituído pelo seu conteúdo. Bloco desconhecido (`div`, `Agrupamento` e outros que o editor não grava) é lido como parágrafos com o seu texto, para atender ao cenário de conteúdo fora do subconjunto sem impedir a abertura. Com mais de uma `Justificacao`, o leitor concatena todas, na ordem.

### D5. Recuo de lista convertido no leitor, não no componente

`setContent` não converte `indent-N` de volta para `ql-indent-N`, e `ajustaHtmlToEditor` não serve, porque troca qualquer `indent`, o que estragaria `ql-text-indent-0px`. O leitor devolve `ql-indent-N` só para a classe exata `indent-N` (`\bindent-(\d+)\b`), e `setContent` continua sem mudança. Achado da task 5.1: o editor da justificação não tem o formato `indent` (fora de `formatsOptions`), então hoje não produz recuo de lista; a conversão fica para conteúdo vindo de fora e não atrapalha. Fica fora desta change o mesmo problema no caminho do host (`setProposicao`), que já existe hoje.

### D6. Componente

- `getDocumentoArticulado` passa `justificacao: this.anexoParecer ? undefined : this._lexmlJustificativa.texto`, no mesmo objeto de dados de `pendencias`.
- `abrirDocumentoArticulado`, depois de `inicializarEdicao` e fora do modo anexo de parecer, chama `this._lexmlJustificativa.setContent(lerJustificacao(documento))` e em seguida `buildAlertaJustificativa()`. A segunda chamada é necessária porque `setContent` é silencioso, e o alerta avaliado no fim de `inicializarEdicao` refletiria o texto anterior.
- `lerJustificacao` não lança erro: um conteúdo que não consegue interpretar vira texto, como no item anterior.

### D7. Fim da exceção da #992

O teste "com a justificação preenchida, o documento reaberto difere só por ganhar a pendência" (`documentoArticulado.component.test.ts`) passa a esperar arquivos iguais e sem a pendência. O comentário "Inverter na #991" sai.

### D8. Testes

- **Unitários do conversor** (`test/model/documento/justificacao.test.ts`): cada linha da tabela de D4, nos dois sentidos, mais escape, espaços entre inline, justificação vazia e bloco desconhecido. Usam o HTML de `texto` como entrada, a partir do fixture de tabela de `test/components/editor-texto-rico/editor-texto-rico.test.ts`.
- **Componente**: ida e volta com o Quill real, carregando o HTML por `setContent`, salvando, abrindo e salvando de novo; anexo de parecer; documento sem `Justificacao`; alerta ao abrir.
- **Integração com o CLI real e o XSD**: um documento com todos os elementos de D4 sai válido e volta igual.
- **E2E**: o fixture `demo/doc/teste_justificacao.json` é gerado por `criarDocumentoArticulado`, como `teste_remissao_invalida.json`, e não escrito à mão. É aberto pela UI, e o teste confere o conteúdo no editor, a ausência do alerta, e que `getDocumentoArticulado()` devolve a mesma `Justificacao`. Sem download, pela mesma razão das changes anteriores (sem precedente no projeto, `docs/guia-cypress.md`).

## Risks / Trade-offs

- [O Quill normaliza o HTML de forma diferente ao reabrir: recria células ocultas, troca a ordem de atributos, acrescenta `colspan="1"`] → a ida e volta é verificada com o Quill real no teste de componente. As diferenças encontradas são resolvidas no conversor, por exemplo omitindo valores padrão, e não no Quill.
  - Resultado da task 3.2 (19/10/2026): a ida e volta com o Quill real passou sem ajuste no conversor, com tabela mesclada, larguras, lista com recuo, link e imagem. `setContent` não relê o Quill (`texto` fica com o HTML recebido), então o teste chama `updateApenasTexto()` depois de carregar, para comparar o HTML já normalizado pelo Quill, como numa edição real.
  - Correção na task 5.1: o HTML desse teste vinha com `ql-align-*`, mas `setContent` espera o formato de `texto` (`align-*`) e acrescenta `ql-`, então a classe virava `ql-ql-align-*` e sumia nos dois salvamentos; o teste passava sem alinhamento e sem larguras de tabela. Corrigido para o formato de `texto`, com asserções de alinhamento e largura de imagem no arquivo gravado.
- [Largura de tabela e de coluna não volta ao editor ao abrir: o plugin de tabelas não a guarda e `setContent` a descarta, o que já acontece hoje no caminho do host (`setProposicao`)] → decisão do usuário (19/10/2026): exceção explícita nas specs de abrir e de ida e volta, e issue à parte para o plugin. A largura é gravada ao salvar; salvar um documento reaberto a perde. Teste de componente "a largura de tabela e coluna é gravada, mas não volta ao abrir".
- [Falha intermitente no teste de anexo de parecer: numa execução de oito, o navegador lançou `ResizeObserver loop completed with undelivered notifications`, que o Mocha conta como erro, ao trocar a configuração para anexo de parecer e reabrir] → não se repetiu em cinco execuções isoladas nem na suíte completa. É um aviso do navegador, não do editor. Se voltar a aparecer, a saída é tratar esse aviso no teste, e não no componente.
- [Imagens em `data:` deixam o arquivo grande] → é o que o editor já produz, e o XSD aceita. Sem mudança nesta change.
- [Nota de rodapé e revisões se perdem ao salvar] → exceção explícita na spec, a retirar na #993 e na #994. O alerta de revisão já avisa que o documento não deve ser protocolado com marcas de revisão.
- [Um `span` com a classe `p` vindo de fora do editor, dentro de célula, vira parágrafo] → aceitável: o editor não produz esse `span`.
- [`isHtmlSemTexto` considera vazia uma justificação só com imagem] → a justificação é gravada, e a pendência continua. É o comportamento atual do alerta, e fica fora do escopo.

## Migration Plan

Nada a migrar. Arquivos salvos antes desta change não têm `Justificacao` e abrem com a justificação vazia, como hoje.
