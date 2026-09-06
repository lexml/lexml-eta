# Notas de rodapé

## Necessidade informacional

O editor deve preservar a posição exata da referência e armazenar o conteúdo textual.

## Representação proposta

No texto rico, será utilizado o elemento `NotaRodape` recém adicionado ao LexML.

Os texto da nota fica inline e a numeração será recalculada na abertura do arquivo.


```xml
<p>
    O conceito é definido em regulamento<NotaRodape>Texto <b>formatado</b> da nota de rodapé.</NotaRodape>.
</p>
```

Obs: em um segundo momento podemos tratar parágrafos nas notas de rodapé.