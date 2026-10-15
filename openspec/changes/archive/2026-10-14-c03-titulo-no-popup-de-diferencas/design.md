# Design

## Context

Ver proposal.md (Why). Estado atual do popup "Exibir diferenças":

- `editor.component.ts#exibirDiferencas` monta um `TextoDiff` só com `textoAtual`, `textoAntesRevisao` e `textoOriginal`; o título do dispositivo não é lido.
- `exibirDiferencaDialog.ts` desenha até duas abas ("Texto original", só para dispositivo de norma alterada; "Texto antes da revisão") e, em cada uma, três `sl-card` (antes, diferença, atual). A comparação roda duas vezes por aba, com o mesmo par de passos (`diffWords` e, depois, `diffChars` sobre o resultado sem espaços duplicados).
- A aba de revisão só existe quando `textoAntesRevisao` é verdadeiro; texto anterior vazio esconde a aba.
- O título anterior já está disponível em `revisao.elementoAntesRevisao.tituloDispositivo`, também em documento reaberto (change `persistir-revisao-titulo-dispositivo`). O título atual está em `elemento.tituloDispositivo`. O título é HTML restrito a itálico, sublinhado, subscrito e sobrescrito (`sanitizarTituloDispositivo`).
- O ícone de diferenças já aparece em revisão só de título, porque essa revisão é de modificação (`isRevisaoComTextoAlterado`).

## Goals / Non-Goals

**Goals:**
- Exibir e comparar o título nos três cards da aba de revisão, sem reescrever o layout do popup.
- Não esconder a aba de revisão quando só o título mudou e o texto anterior é vazio.

**Non-Goals:**
- Abas separadas para título e texto.
- Mudar a descrição da marca, o formato do arquivo, o modelo ou os reducers.
- Exibir título na aba "Texto original", que compara com a norma vigente.
- Corrigir limitações já existentes da comparação de texto com formatação HTML.

## Decisions

**D1. Título como linha acima do texto, dentro de cada card.**
Escolhido com o usuário entre três opções (título dentro dos cards; bloco separado acima; abas separadas). É a que mantém a leitura lado a lado e a que mexe menos no layout. O título é uma linha em negrito, como no editor, seguida do texto.

**D2. Estender `TextoDiff` com `tituloAtual` e `tituloAntesRevisao` (ambos opcionais) e com `comRevisao`.**
`undefined` significa "sem título", diferente de `''` (título vazio, estado válido do editor). `comRevisao` passa a decidir a existência da aba de revisão, no lugar de `!!textoAntesRevisao`; o editor o preenche a partir de `elemento.revisao`. Alternativa descartada: continuar inferindo pela presença de texto anterior, que falha para texto vazio.

**D3. Extrair a comparação em duas etapas para uma função local e usá-la no texto e no título.**
Hoje a sequência `diffWords` + `diffChars` está escrita duas vezes (aba "Texto original" e aba de revisão). Uma função `comparaHtml(antes, depois)` evita uma terceira cópia para o título. O resultado do texto não muda. Para o título, o lado ausente entra na comparação como `''`, de modo que título adicionado sai todo como inserido e título removido todo como removido, sem tratamento especial.

**D4. Marcador "Sem título" só na exibição.**
O texto "Sem título" (itálico, cinza) é desenhado nos cards "Texto antes da revisão" e "Texto atual" quando aquele lado não tem título e o outro tem; nunca entra na comparação. No card "Diferença" não há marcador: a ausência aparece como trecho inserido ou removido do outro lado.

**D5. Quando exibir a linha de título.**
Quando `tituloAtual` ou `tituloAntesRevisao` não é `undefined`. Sem título nos dois lados, o HTML do popup é o mesmo de hoje. Escolhido com o usuário (alternativa descartada: só quando o título mudou).

**D6. Sanitizar o título na exibição.**
O título passa por `sanitizarTituloDispositivo` antes de entrar no HTML do popup, como defesa em profundidade, já que o popup monta HTML por interpolação de string e o título pode vir de arquivo aberto. O texto atual continua como está (fora do escopo).

**D7. Estilo.**
Classe própria para a linha de título (negrito) e para o marcador (itálico, cinza `--sl-color-neutral-500`), no `<style>` que o popup já injeta, sem tocar em CSS global.

## Risks / Trade-offs

- [A comparação de HTML com `<i>` ou `<sub>` pode partir uma tag ao meio, como já pode ocorrer no texto] → Mesmo comportamento do texto; o título só aceita quatro formatações. Registrar como limitação, sem tratar agora.
- [A mudança de critério da aba (`comRevisao`) altera o popup de revisões com texto anterior vazio] → Passa a exibir uma aba que antes sumia, o que é o comportamento desejado; coberto por teste.
- [Título vazio (`''`) com texto igual] → Exibido como linha vazia; mesmo tratamento do editor, que o aceita com aviso.
- [Dependência do editor ter `elemento.revisao` preenchido] → Já é a premissa do popup atual; sem revisão o popup segue sem título.
