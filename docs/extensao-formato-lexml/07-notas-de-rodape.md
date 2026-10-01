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