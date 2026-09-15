# CLAUDE.md

## Convenção de nomes para changes do OpenSpec

As changes do OpenSpec neste projeto seguem o padrão:

```
<aaaa>-<mm>-<dd>-c<xx>-<nome-da-change>
```

- `aaaa-mm-dd`: data de criação da change (ano-mês-dia).
- `c<xx>`: contador sequencial de duas casas (`c01`, `c02`, ...), reiniciado a cada dia diferente — a primeira change criada em um novo dia sempre começa em `c01`, mesmo que o dia anterior tenha chegado a um número maior.
- `<nome-da-change>`: nome descritivo em kebab-case.

Exemplos: `2026-09-15-c01-salvar-documento-articulado`, `2026-09-15-c02-abrir-documento-articulado`.
