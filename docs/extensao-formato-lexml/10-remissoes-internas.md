# Remissões internas

## Necessidade informacional

Uma remissão deve conservar seu último destino conhecido mesmo quando alterações na articulação a tornarem  inválida.

## Representação proposta

Utilizamos o elemento `Remissao` do LexML com o id do dispositivo referenciado pelo atributo `xlink:href`. Remissões inválidas recebem um id com prefixo `_ri` (remissão interna) e são listadas nos metadados do LexEdit.

Exemplo:

```xml
<Remissao xlink:href='art3' id='_ri13481093417'>art. 3º</Remissao>
```

Nos metadados do LexEdit:

```xml
<lexedit:Metadado>
    <lexedit:RemissoesInternasInvalidas refIdsRemissoesInternas='_ri13481093417 _ri6987698768 ...'/>
<lexedit:Metadado>
```

