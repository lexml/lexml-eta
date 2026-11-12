# Design

## Context

A epígrafe é a linha da `Articulacao` sem pai, acima da ementa, não editável (`bloqueado`/`editavel` falso). O texto do dispositivo guarda o `<br/>` (#1053), e `textoParaExibicao` (`elementoUtil.ts`), chamado por `createElemento`, entrega ao `Elemento` uma cópia para a tela, com o `<br/>` trocado por `<br class="eta-quebra-linha">` (blot `EtaBlotQuebraLinhaEpigrafe`). Pela leitura do CSS (`editor.css.ts`, `eta-container-table.ts`), nenhuma regra põe a epígrafe em negrito hoje.

## Goals / Non-Goals

**Goals:**
- Negrito na primeira linha da epígrafe e nenhum nas demais, só na tela.

**Non-Goals:**
- Mudar o texto da epígrafe no modelo, no arquivo ou na `Proposicao`.
- Retirar formatação vinda do host ou do arquivo.
- Estilo da epígrafe fora do editor (impressão, componente de nova proposição).

## Decisions

### D1. Negrito em `textoParaExibicao`, com `<b>`

Na mesma função que já trata o `<br/>` da epígrafe, o trecho anterior ao primeiro `<br/>` (ou o texto inteiro, sem `<br/>`) é envolvido em `<b>…</b>`; o restante segue como está. O `<b>` é o formato nativo de negrito do Quill, então não há blot nem CSS novo, e a cópia para a tela continua separada do `texto` do dispositivo, como já acontece com a quebra.

Alternativas descartadas:
- **CSS `::first-line`**: o blot de quebra é um `<br>` dentro de um `display: inline` (`.texto__dispositivo`), e `::first-line` só vale para bloco; mudar o display da linha mexeria no layout de todos os dispositivos.
- **`span` com classe + regra de CSS**: o Quill descarta `span` desconhecido; exigiria um blot inline novo, sem ganho sobre o `<b>`.
- **Gravar o `<b>` no texto da epígrafe**: mudaria o arquivo e o que o host recebe, contra a issue (apresentação).

### D2. Formatação existente e casos de borda

- `<b>`/`<i>` já presentes ficam onde estão; o `<b>` novo só envolve a primeira linha (um `<b>` dentro de outro não muda a exibição).
- Primeira linha vazia (epígrafe começando com `<br/>`) ou epígrafe vazia: nada é envolvido (sem `<b></b>` vazio).
- Uma tag aberta na primeira linha e fechada depois do `<br/>` (ex.: `<i>a<br/>b</i>`) geraria aninhamento inválido; o parser do Quill o normaliza, e o caso não ocorre nos modelos do vocabulário. Não há tratamento especial.

## Risks / Trade-offs

- [O `Elemento` da epígrafe passa a diferir do `texto` do dispositivo também pelo `<b>`] → a linha não é editável e o Quill nunca a sincroniza de volta; o teste de componente confere que salvar e `getProposicao()` devolvem o texto sem `<b>`.
- [Helpers de E2E que comparam `previousSibling` do `br` agora encontram o `<b>`] → `textContent` do `<b>` é o mesmo texto; o helper `epigrafeExibidaDeve` segue válido e ganha a conferência do negrito.
