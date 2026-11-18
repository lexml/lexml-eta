# Design

## Context

Ver proposal.md (Why). Fatos que moldam a solução:

- `onTeclaArrowDown`/`onTeclaArrowUp` (`eta-keyboard.ts`) recebem o `keydown` antes da ação padrão do navegador. Hoje só cancelam a tecla no fim (↓) ou no início (↑) do texto, ou sobre omissis, e então usam `irParaInicio`/`irParaFim` com `linhaEditavel` (que pula epígrafe e preâmbulo).
- `quill.getBounds(índice)` devolve a posição de um índice mesmo fora da área visível; `document.caretRangeFromPoint` só funciona dentro da janela, e o dispositivo vizinho pode estar fora dela.
- `setIndex(..., USER)` passa por `setSelection`, que já rola o cursor para a área visível.

## Goals / Non-Goals

**Goals:**
- ↓/↑ nunca pulam o dispositivo editável vizinho, mantendo a posição horizontal quando possível.

**Non-Goals:**
- Shift+↓/Shift+↑ (seleção): continuam com o navegador.
- Mudar ↓ no fim do texto e ↑ no início (vão ao início/fim do vizinho, requisito "Setas pulam as linhas não editáveis") e o caminho de omissis.
- ←/→, que já tratam o início e o fim do texto.

## Decisions

**1. Detectar a linha visual por `getBounds`.** O cursor está na última linha visual quando o topo de `getBounds(cursor)` é igual (com tolerância de meia linha) ao do fim do texto; na primeira, quando é igual ao do início. Só nesse caso, e sem Shift, o editor cancela a tecla e escolhe o destino; caso contrário a tecla segue para o navegador.
- Alternativa descartada: deixar o navegador mover e corrigir depois, no `selection-change`, quando o destino pulou um dispositivo. Depende da ordem dos eventos e mostraria o cursor por um instante no lugar errado.

**2. Posição horizontal pelo índice mais próximo, em `getBounds`.** O destino é `linhaEditavel(linha, 'next'|'prev')`. Entre os índices do texto do destino que estão na primeira linha visual (↓) ou na última (↑), escolhe o de `left` mais próximo do `left` do cursor; texto vazio dá o início. Se nenhum índice da linha chega à posição, o mais próximo é o último dela (fim do texto, numa linha só). Funciona com o destino fora da área visível.
- Alternativa descartada: `caretRangeFromPoint` na coordenada do destino. Falha quando o destino está fora da janela, que é o caso comum ao descer até a borda da área do editor.

**3. Ponto único nos dois handlers.** Um método privado (ex.: `irParaVizinhoNaMesmaColuna(direcao)`) usado por ↓ e ↑, depois dos testes existentes de fim/início e omissis, que continuam primeiro.

## Risks / Trade-offs

- [Texto longo do destino: `getBounds` por caractere tem custo] → só os índices de uma linha visual do destino são comparados (parar ao mudar de linha), e é um cálculo por tecla.
- [Cursor exatamente na quebra entre duas linhas visuais, onde o navegador pode desenhá-lo no fim de uma ou no início da outra] → a tolerância de meia linha decide pela linha de `getBounds`; no pior caso ↓ desce uma linha a mais dentro do mesmo texto, sem pular dispositivo.
- [Dispositivo com aspas ou nota de alteração (bloco de alteração)] → o destino é o texto (`blotConteudo`) do vizinho; o E2E cobre artigos comuns e um teste de componente cobre a escolha do índice.
