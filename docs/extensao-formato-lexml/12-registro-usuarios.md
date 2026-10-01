# Usuários

## Necessidade informacional

Identificar usuários responsáveis por revisões e comentários no texto.

## Representação adotada

Uma lista de usuários em `lexedit:Metadado/lexedit:Usuarios` com identificador único de negócio, nome e sigla opcional. Esses usuários são alvo de referência com o atributo `refIdUsuario` em outros elementos do esquema LexEdit.

Exemplo:

```xml
<lexedit:Metadado>
    <lexedit:Usuarios>
        <lexedit:Usuario
            idUsuario="sf:fulano"
            nome="Fulano de Tal"
            sigla="FT"/>
    </lexedit:Usuarios>
</lexedit:Metadado>
```

