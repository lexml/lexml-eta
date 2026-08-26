# Anexos

## Necessidade informacional

O editor precisa referenciar anexos de forma interoperável, preservando o nome e o tipo do arquivo original para apresentação e manipulação.

## Representação proposta

Usar Anexos/ReferenciaAnexo, com FonteURN e AlvoURN. O anexo deve ter URN mesmo quando estiver encapsulado em PDF; nome de arquivo e tipo de mídia são extensões de apresentação.

Exemplo:

```xml
<Anexos>
    <ReferenciaAnexo
        FonteURN='xxx'
        AlvoURN='xxx'
        lexedit:descricao='Laudo técnico'
        lexedit:tipoMidia='application/pdf'/>
</Anexos>
```

## Definições pendentes

- Como seriam as URNs de fonte e alvo considerando um arquivo que será embutido em um PDF junto ao lexml?
- É importante termos um nome de arquivo, algo como laudo-técnico.pdf, que poderia estar em uma dessas URNs ou em atributo específico.
