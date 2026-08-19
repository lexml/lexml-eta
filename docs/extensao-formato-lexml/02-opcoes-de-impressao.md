# Opções de impressão

## Necessidade informacional

O editor precisa preservar escolhas que controlam a apresentação impressa sem alterar o significado jurídico do texto.

## Representação proposta

As opções ficam nos metadados Lexedit.

```xml
<lexedit:Metadado>
  <lexedit:OpcoesImpressao
      imprimirBrasao="true"
      textoCabecalho=""
      reduzirEspacoEntreLinhas="false"
      tamanhoFonte="14"/>
</lexedit:Metadado>
```

A ausência de uma opção significa o comportamento padrão da aplicação, e não necessariamente `false`.
