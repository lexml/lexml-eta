# Outros metadados do LexEdit

## Necessidade informacional

Além dos grupos de elementos já especificados, o LexEdit precisa preservar alguns dados gerais sobre o arquivo e sobre a proposição legislativa que ele representa: quando o arquivo foi modificado pela última vez, qual aplicação (e versão) o gerou, qual documento a proposição referencia e se o documento será utilizado como anexo de parecer. Também registra a situação, na norma vigente, dos dispositivos de bloco de alteração.

## Representação adotada

Atributos do próprio elemento `lexedit:Metadado`.

```xml
<lexedit:Metadado
    dataUltimaModificacao='2026-05-12T10:15:00-03:00'
    aplicacao='LexEdit'
    versaoAplicacao='1.0.0'
    urnDocumentoReferenciado='urn:lex:br:senado.federal:projeto.lei:888888;2020'
    anexoParecer='false'>
    ...
</lexedit:Metadado>
```

`dataUltimaModificacao` é do tipo xsd:dateTime e registra o instante do salvamento, com o fuso horário local (por exemplo, `2026-10-29T10:15:30-03:00`). Cada salvamento grava o seu próprio instante, mesmo sem alteração no documento. Ao abrir, o valor é lido como gravado e exposto ao host na propriedade `dataUltimaModificacaoDocumento` do componente; ausente ou inválido equivale a não informado. `aplicacao` e `versaoAplicacao` ainda não são gravados pelo LexEdit e são ignorados ao abrir. `anexoParecer` é do tipo xsd:boolean: o LexEdit sempre o grava (`true` no modo de anexo de parecer, `false` no modo normal) e, ao abrir, trata o atributo ausente ou inválido como `false`. `urnDocumentoReferenciado` é do tipo xsd:string, opcional, e guarda a URN do documento ao qual a proposição se refere; é gravado só quando há documento referenciado, e o valor vazio ou ausente significa que não há referência.

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

Um documento de tipo não suportado (URN que não é de proposição de uma autoridade com casa responsável — `senado.federal`, `camara.deputados` ou `congresso.nacional` —, como uma medida provisória ou uma norma) recebe a pendência "Este tipo de documento não é completamente suportado pelo editor.". Ela é recalculada pela URN a cada salvamento e não é lida ao abrir.

## Situação dos dispositivos na norma vigente

### Necessidade informacional

Em bloco de alteração de norma, cada dispositivo pode ser indicado como existente na norma vigente ou como novo. Essa indicação não consta no texto do dispositivo e precisa ser preservada.

### Representação adotada

Elemento `lexedit:SituacaoNaNormaVigente`, com duas listas de ids de dispositivos, separados por espaço: `refIdsDispositivosExistentes` e `refIdsDispositivosNovos`. Ambos os atributos são opcionais e do tipo xsd:string. Constam apenas dispositivos de bloco de alteração com situação informada, e o elemento é omitido quando as duas listas estão vazias.

```xml
<lexedit:Metadado>
    <lexedit:SituacaoNaNormaVigente
        refIdsDispositivosExistentes='art1_cpt_alt1_art5 art1_cpt_alt1_art5_par1'
        refIdsDispositivosNovos='art1_cpt_alt1_art5-1'/>
</lexedit:Metadado>
```
