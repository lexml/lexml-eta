## Context

Ver proposal.md (Why). Fatos que moldam a solução, verificados no navegador com teclas nativas (`mpv_905_2019`, 6 linhas com `(NR)`):

- `eta-keyboard.ts` só trata End com Ctrl (`onTeclaEnd`, fim da proposição). End e Shift+End sem Ctrl ficam com o navegador, que leva o cursor ao fim da linha visual.
- O fecho de aspas (`EtaBlotFechaAspas`) e a nota (`EtaBlotNotaAlteracao`) vêm depois do texto, na mesma célula, com `contenteditable="false"`. Quando o texto termina na mesma linha visual que eles, o navegador não pode deixar o cursor ali e o põe na posição editável seguinte: o início do dispositivo de baixo (5 de 6 linhas), ou dentro da nota. Com Shift, a seleção vai até esse ponto.
- `verificarMudouLinha` (`eta-quill.ts`) já devolve o cursor sem seleção que cai no fecho ou na nota para o fim do texto, mas não alcança o caso em que o cursor sai da linha nem a seleção estendida.
- `Selection.modify('move' | 'extend', 'forward', 'lineboundary')` cai nos mesmos pontos que a tecla nas 12 tentativas (End e Shift+End).

## Goals / Non-Goals

**Goals:**
- End e Shift+End sem Ctrl nunca passam do fim do texto do dispositivo atual.

**Non-Goals:**
- Clique depois do `(NR)` e ↓/→ no fim do texto: já têm tratamento próprio e não estão na issue.
- Ctrl+Shift+End e Cmd+→ no Mac.

## Decisions

**1. Reproduzir o movimento do navegador e limitar o resultado ao texto.** No `keydown` de End sem Ctrl, Alt e Meta, cancelar o evento, mover a seleção nativa com `Selection.modify(…, 'lineboundary')` (`extend` com Shift) e conferir se o foco continua dentro do texto da linha atual (`blotConteudo.domNode`). Se continuar, só atualizar a seleção do Quill; se não, levar o foco ao fim do texto: sem Shift, cursor no fim; com Shift, `Selection.extend` até o fim, que mantém a âncora e o sentido. A seleção nativa é corrigida no mesmo `keydown`, antes do `selectionchange`, então o Quill nunca vê a linha seguinte e não dispara a mudança de linha.
- Alternativa descartada: comparar a linha visual do cursor com a do fim do texto (`getBounds`, como na #1072) e, na última, ir ao fim do texto. Depende da geometria, e no ponto de quebra entre duas linhas visuais `getBounds` pode cair na linha de baixo, levando ao fim do texto quem estava no fim de uma linha do meio.
- Alternativa descartada: corrigir depois, em `verificarMudouLinha`. A seleção já teria chegado à linha seguinte e disparado a mudança de linha (gravação do texto, detecção de remissões), e não há como distinguir esse caso de uma ↓.

**2. Valer para toda linha, não só para as com nota.** A correção só age quando o foco sairia do texto, o que hoje só acontece com o fecho e a nota; restringir por tipo de linha deixaria de fora outros elementos não editáveis que venham depois do texto.

## Risks / Trade-offs

- [`Selection.modify` não é padrão] → é suportado pelos navegadores em uso (Chrome, Edge, Firefox); sem ele (`typeof modify !== 'function'`), o evento segue para o navegador, como hoje.
- [Foco fora do texto antes do End, como na linha bloqueada sem cursor no texto] → sem foco dentro do texto da linha atual, o evento segue para o navegador, como hoje.
