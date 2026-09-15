# Outros metadados do LexEdit

## Necessidade informacional

Além dos grupos de elementos já especificados, o LexEdit precisa preservar alguns dados gerais sobre o arquivo e sobre a proposição legislativa que ele representa: quando o arquivo foi modificado pela última vez, qual aplicação (e versão) o gerou, e se a proposição é um substitutivo.

## Representação adotada

Atributos do próprio elemento `lexedit:Metadado`.

```xml
<lexedit:Metadado
    dataUltimaModificacao='2026-05-12T10:15:00-03:00'
    aplicacao='LexEdit'
    versaoAplicacao='1.0.0'
    substitutivo='false'>
    ...
</lexedit:Metadado>
```

`dataUltimaModificacao` é do tipo xsd:dateTime. `substitutivo` é do tipo xsd:boolean.

## Pendências

### Necessidade informacional

O LexEdit sinaliza ao usuário condições do documento que, enquanto não resolvidas, impedem que a proposição seja protocolada. Isso inclui tanto pendências de preenchimento — como a ausência de um texto de justificação — quanto outras pendências, como a existência de remissões internas inválidas, de comentários não removidos ou de marcas de revisão de texto ainda não aceitas ou rejeitadas.

### Representação adotada

Lista de strings no elemento `lexedit:Pendencias`, cada uma em um elemento `lexedit:Pendencia`.

```xml
<lexedit:Metadado>
    <lexedit:Pendencias>
        <lexedit:Pendencia>Não foi informado um texto de justificação.</lexedit:Pendencia>
        <lexedit:Pendencia>Corrigir remissões internas inválidas.</lexedit:Pendencia>
        <lexedit:Pendencia>Remover comentários.</lexedit:Pendencia>
        <lexedit:Pendencia>Resolver marcas de revisão de texto.</lexedit:Pendencia>
        <lexedit:Pendencia>Resolver marcas de revisão na articulação.</lexedit:Pendencia>
    </lexedit:Pendencias>
</lexedit:Metadado>
```

