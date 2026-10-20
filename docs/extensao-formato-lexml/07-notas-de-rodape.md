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

Obs: em um segundo momento podemos tratar parágrafos nas notas de rodapé.

Detalhes da implementação (issue #993, change OpenSpec `2026-10-19-c02-salvar-abrir-notas-rodape`, `src/model/lexml/documento/conversor/justificacao.ts`):
- O `NotaDeRodape` fica no ponto exato da referência, também dentro de item de lista e de parágrafo de célula (`<span class="p">…<NotaDeRodape>…</NotaDeRodape></span>`).
- O texto da nota aceita negrito, itálico, sublinhado e link (`xlink:href`, sem `rel`).
- Enquanto parágrafos não forem tratados, uma nota com mais de um parágrafo é gravada num só, com os parágrafos unidos por um espaço; a quebra não volta ao abrir.
- O número e o identificador interno da nota não são gravados; ao abrir, as notas são numeradas pela ordem do texto e recebem um id novo, válido só na sessão.
- Uma nota dentro de texto excluído em revisão (`del`) é descartada junto com ele, enquanto as revisões não forem gravadas (`09`, issue #994).