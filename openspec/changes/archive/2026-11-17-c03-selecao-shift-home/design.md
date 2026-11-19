# Design

## Context

Ver proposal.md (Why). Fatos que moldam a solução:

- `verificarMudouLinha` (`eta-quill.ts`) olha só o começo da seleção (`getLine(range.index)`). Se ele cai no rótulo, espaço, menu, mensagens, abre aspas, tipo de omissis ou existência, chama `setSelection(início do texto, 0, SILENT)`, que descarta o tamanho da seleção.
- O `range` do Quill é sempre normalizado (`index` = menor ponta), sem o sentido. O sentido só existe na seleção nativa (`anchor` depois de `focus` = para trás).
- `setSelection`/`setNativeRange` do Quill 1.3.7 sempre criam a seleção nativa para frente (`setStart`/`setEnd`).
- Depois da #1077, o `focus` do root que o Quill chama nesse caminho não rola mais a tela.

## Goals / Non-Goals

**Goals:**
- Preservar a seleção que alcança o rótulo, recortada no início do texto e no mesmo sentido.

**Non-Goals:**
- Mudar o alcance do Shift+Home (continua indo ao início da linha visual) ou interceptar teclas.
- Tratar o fim da seleção que alcance as aspas de fechamento ou a nota de alteração: hoje só o começo é redirecionado, e nenhum caso conhecido falha ali.
- Mudar o tratamento do cursor sem seleção.

## Decisions

**1. Recorte em `verificarMudouLinha`, no mesmo ponto do redirecionamento.** Quando `range.length > 0` e o começo cai num dos elementos já listados, o novo começo é o início do `blotConteudo` daquela linha; o fim continua o mesmo. Se o fim também não passar do início do texto (seleção toda dentro do rótulo), vale o comportamento de hoje (cursor no início do texto).
- Alternativa descartada: interceptar Shift+Home em `eta-keyboard.ts`. Só cobre essa tecla (não o Shift+↑ nem o mouse) e teria de reproduzir a regra de linha visual do navegador.

**2. O sentido vem da seleção nativa e é reaplicado nela.** Antes do recorte, o editor lê se a seleção nativa está para trás. Converte o novo intervalo em nós do DOM (`selection.rangeToNative`) e aplica com `Selection.setBaseAndExtent`, com a âncora no fim quando a seleção era para trás. Depois atualiza a seleção do Quill de forma silenciosa, para o `range` dele refletir o recorte sem disparar outro `selection-change` de usuário.
- Alternativa descartada: `quill.setSelection(início, tamanho)`. Inverte uma seleção feita para trás: o Shift+→ seguinte moveria o fim, e não o começo.

## Risks / Trade-offs

- [O `selection-change` gerado pelo recorte entrar de novo em `verificarMudouLinha`] → a atualização é silenciosa, e o novo começo já está no texto, então um novo passe não recortaria nada.
- [Seleção que começa em outra linha e termina no rótulo desta (Shift+↓ de cima para baixo)] → não é afetada: o recorte só olha o começo, que está no texto da linha de cima.
- [Navegador posiciona o fim de um arrasto no menu ou nas aspas de fechamento] → fora do escopo (Non-Goals); o E2E do arrasto confere o caso comum.
