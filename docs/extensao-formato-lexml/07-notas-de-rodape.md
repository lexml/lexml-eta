# Notas de rodapé

## Necessidade informacional

O editor deve preservar a posição exata da referência e armazenar o conteúdo textual. Notas de rodapé poderão ser usadas apenas na justificação.

## Representação adotada

No texto rico, será utilizado o elemento `NotaDeRodape` recém adicionado ao LexML.

Os texto da nota fica inline e a numeração será recalculada na abertura do arquivo.

```xml
<p>
    O conceito é definido em regulamento<NotaDeRodape>Texto <b>formatado</b> da nota de rodapé.</NotaDeRodape>.
</p>
```

A nota de rodapé tem um só parágrafo (issue #1030). No modal de edição, Enter e Shift+Enter são ignorados, com o aviso "A nota de rodapé admite um só parágrafo."; texto colado com quebras de linha entra no mesmo parágrafo, com as quebras trocadas por espaço; e uma nota antiga com vários parágrafos abre unida, com o mesmo critério da gravação.

Detalhes da implementação (issue #993, change OpenSpec `2026-10-19-c02-salvar-abrir-notas-rodape`, `src/model/lexml/documento/conversor/justificacao.ts`):
- O `NotaDeRodape` fica no ponto exato da referência, também dentro de item de lista e de parágrafo de célula (`<span class="p">…<NotaDeRodape>…</NotaDeRodape></span>`).
- O texto da nota aceita negrito, itálico, sublinhado e link (`xlink:href`, sem `rel`).
- Uma nota com mais de um parágrafo (HTML vindo de fora, como do host) é gravada num só: parágrafos vazios são descartados e os demais são unidos por um espaço, sem espaços nas pontas. O modal de edição aplica o mesmo critério (#1030).
- O número e o identificador interno da nota não são gravados; ao abrir, as notas são numeradas pela ordem do texto e recebem um id novo, válido só na sessão.
- Uma nota dentro de texto excluído em revisão (`del`) é gravada dentro dele (`09`, issue #994).