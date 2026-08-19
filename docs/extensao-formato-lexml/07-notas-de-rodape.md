# Notas de rodapé

## Necessidade informacional

O editor deve preservar a posição exata da referência e armazenar o conteúdo textual.

## Representação proposta

No texto rico, utiliza-se o elemento sup com referência ao texto da nota como no exemplo abaixo:


```xml
<p>
    O conceito é definido em regulamento<sup lexedit:refIdNotaRodape='nr1777387565991'>1</sup>.
</p>
```

O conteúdo fica em lexedit:Metadado/NotasRodape/NotaRodape, por exemplo:

```xml
<lexedit:Metadado>
    <lexedit:NotasRodape>
        <lexedit:NotaRodape idNotaRodape='nr1777387565991' numero='1'>
            <p>Texto da nota de rodapé.</p>
        </lexedit:NotaRodape>
    </lexedit:NotaRodape>
</lexedit:Metadado>
```

O número é somente a forma de apresentação. O vínculo efetivo é refIdNotaRodape; o editor pode renumerar chamadas sem modificar o identificador da nota.

## Decisão pendente

- Decidir necessidade de mais de um parágrafo e se é necessário utilizar o tag `<p>` mesmo se for um único parágrafo a exemplo de algumas estruturas LexML.
- Talvez não seja necessário o atributo NotaRodape.numero pela redundância no texto.
