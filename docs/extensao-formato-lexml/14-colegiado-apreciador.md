# Colegiado apreciador

## Necessidade informacional

O editor precisa preservar o destino da proposição — a casa legislativa e o colegiado que a apreciará (Plenário ou uma comissão) — para restaurá-lo ao abrir o arquivo. O local do fecho (ver [Fecho com local e data](03-fecho-local-e-data.md)) é derivado desse destino.

## Representação adotada

Elemento `lexedit:ColegiadoApreciador`, filho de `lexedit:Metadado`, com atributos.

```xml
<lexedit:Metadado>
    <lexedit:ColegiadoApreciador
        siglaCasaLegislativa='SF'
        tipoColegiado='Plenário'/>
</lexedit:Metadado>
```

Para uma comissão, `siglaComissao` informa a sigla escolhida.

```xml
<lexedit:ColegiadoApreciador
    siglaCasaLegislativa='SF'
    tipoColegiado='Comissão'
    siglaComissao='CCJ'/>
```

`siglaCasaLegislativa` é `SF`, `CD` ou `CN`. `tipoColegiado` é `Plenário` ou `Comissão`. `siglaComissao` é opcional (xsd:string) e só aparece quando há comissão informada. Um documento usado como anexo de parecer não registra este elemento.
