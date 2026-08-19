# Usuários

## Necessidade informacional

Identificar usuários responsáveis por revisões e comentários no texto.

## Representação proposta

Uma lista de usuários em `lexedit:Metadado/lexedit:Usuarios` com identificador de negócio, nome e sigla opcional. Esses usuários são alvo de referência com o atributo `refIdUsuario` em outros elementos do esquema LexEdit.

Exemplo:

```xml
<lexedit:Metadado>
    <lexedit:Usuarios>
        <lexedit:Usuario
            idUsuario="sf:fragomeni"
            nome="Marcos Fragomeni"
            sigla="MF"/>
    </lexedit:Usuarios>
</lexedit:Metadado>
```

## Decisão pendente

- Seria necessário definir uma URN para identificação de usuários?
