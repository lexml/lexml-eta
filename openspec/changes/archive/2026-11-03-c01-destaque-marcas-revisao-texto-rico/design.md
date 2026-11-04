## Context

O editor de texto rico (`lexml-eta-editor-texto-rico`) só é usado na justificação (`modo="justificativa"`). As marcas de revisão são os blots `ins`/`del` do `moduloRevisao`, com os atributos `usuario`, `date`, `id-revisao`, `id-usuario` e `sigla-usuario`. Uma mesma revisão pode gerar vários elementos com o mesmo `id-revisao`: a substituição gera um `del` e um `ins`, e a exclusão que atravessa uma formatação gera um `del` por trecho.

O estilo atual (`editor-texto-rico.css.ts`) usa `.ql-editor ins`/`.ql-editor del` com cor de fundo. A regra não tem escopo: vale para qualquer `.ql-editor` da página, porque o CSS é injetado no light DOM.

O `lexml-emenda` já fez essa mudança (commits `f5743bff`, `b24fcd8a` e o trecho de fragmentos contíguos de `1a50302d`). Ela é a referência de implementação. A motivação está no proposal.md.

## Goals / Non-Goals

**Goals:**

- Portar o visual e a moldura da emenda com o mínimo de diferença, para que a portagem dos comentários (c02) encontre a mesma base.
- Manter o texto entregue (`texto`, `getDocumentoArticulado`) idêntico ao de hoje.

**Non-Goals:**

- Estilos de comentário sobre revisão (ex.: `comentario del`). Ficam na c02.
- Mudar o tooltip da revisão, aceitar, rejeitar ou o desfazer.
- Marcas de revisão da articulação, que usam outro mecanismo.

## Decisions

### Traço da exclusão por imagem de fundo, não por `text-decoration`

O `del` usa `background-image: linear-gradient(...)` com 2px de altura a 55% da linha, e `text-decoration: none`. É o que a emenda adotou depois do primeiro ajuste (`b24fcd8a`). O `text-decoration` herdado não pode ser recolorido nem afinado nos filhos (negrito, referência de nota de rodapé), e na c02 o fundo amarelo do comentário dentro do `del` cobriria um traço desenhado pelo ancestral. Com a imagem de fundo, o traço é uniforme e pode ser repetido no comentário.

Alternativa considerada: `text-decoration-color`/`text-decoration-thickness`, usada no primeiro commit da emenda e abandonada por isso.

### Escopo pelo contêiner do editor, sem `data-modo`

As regras passam a usar `.lexml-eta-editor-texto-rico .ql-editor ins|del`. A emenda condiciona a `data-modo` porque o mesmo componente tem modos que mantêm o visual antigo. Aqui só há a justificação, então o atributo seria só cerimônia. O escopo pelo contêiner também corrige o vazamento atual das regras sem escopo.

### Moldura por classes no DOM, atualizada na mudança de seleção

Em `onSelectionChange` (que já roda num `setTimeout(0)`), o editor:

1. remove `revisao-selecionada`, `revisao-fragmento-continua-anterior` e `revisao-fragmento-continua-proximo` de todos os elementos;
2. localiza o `ins`/`del` sob o cursor: na seleção vazia olha o caractere depois e o antes do cursor; na seleção com texto, o primeiro e o último caractere;
3. marca com `revisao-selecionada` todos os elementos de mesma tag e mesmo `id-revisao` (sem `id-revisao`, só o próprio);
4. ordena esses elementos pela posição no Quill e marca os pares contíguos (fim de um igual ao início do próximo), para que o CSS suprima as bordas laterais entre eles.

A moldura usa `border-top`/`border-bottom` com `box-decoration-break: clone` e pseudo-elementos `::before`/`::after` de 2px como bordas laterais curtas (sem `border-left/right`, que deslocariam o texto). A cor vem da variável `--cor-moldura-revisao`.

Filtrar pela mesma tag faz a substituição emoldurar só o lado sob o cursor, como na emenda.

### Atributos e classes só de tela não chegam ao texto entregue

O `del` recebe `spellcheck="false"` ao carregar (`setContent`) e a cada atualização (`updateTexto`, `updateApenasTexto`). `ajustaHtml` passa a retirar esse atributo **e** as três classes da moldura. A emenda retira só o `spellcheck`: lá, uma atualização com o cursor numa marca grava `class="revisao-selecionada"` no texto. Aqui a retirada da classe é exigida pela spec ("Destaque restrito à tela").

## Risks / Trade-offs

- [Mudar a classe ou o atributo de um blot dispara o `MutationObserver` do Quill] → as mudanças são feitas fora de `text-change` e não alteram o delta (classe e `spellcheck` não são formatos do Quill). O teste de componente confere que o histórico de desfazer não ganha passos por mover o cursor.
- [Traço por imagem de fundo some na impressão do navegador] → a impressão do documento é feita pelo host a partir do arquivo, não pela tela do editor.
- [O verde e o vermelho sem fundo têm menos contraste para quem não distingue cores] → o traço da exclusão continua distinguindo exclusão de inclusão, e o tooltip da revisão descreve a operação. É o visual definido no requisito #250356.
