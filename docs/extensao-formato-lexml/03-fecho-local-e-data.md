# Fecho com local e data

## Necessidade informacional

O editor precisa preencher, validar e atualizar local e data do fecho sem interpretar a redação em linguagem natural exibida no documento.

## Representação adotada

Dados estruturados na estrutura do LexEdit.

```xml
<lexedit:Metadado
    local='Sala das Sessões'
    data='2026-04-24'>
    ...
</lexedit:Metadado>
```
Representação textual no LexML.

```xml
<LocalDataFecho>
    <p>Sala das Sessões, 24 de abril de 2026.</p>
</LocalDataFecho>
```

O atributo `data` é opcional, podendo também aparecer com valor vazio.

Caso a data não seja informada, o texto apresentará apenas o local, seguido por vírgula (ex: "Sala das Sessões,")
