# Metadados genéricos

## Necessidade informacional

As aplicações hospedeiras do editor têm dados próprios que precisam acompanhar o documento (por exemplo, um título a imprimir antes da epígrafe) e que não pertencem a nenhum dos grupos já especificados. Em vez de exigir um novo grupo no esquema a cada dado, o LexEdit oferece pares chave/valor livres, que o editor preserva sem interpretar.

## Representação adotada

Elemento `lexedit:OutrosMetadados`, filho de `lexedit:Metadado`, com um `lexedit:OutroMetadado` por par: a chave no atributo `chave` e o valor como conteúdo de texto.

```xml
<lexedit:Metadado>
    <lexedit:OutrosMetadados>
        <lexedit:OutroMetadado chave='tituloAntesDaEpigrafe'>COMISSÃO XPTO</lexedit:OutroMetadado>
        <lexedit:OutroMetadado chave='jsonDadosComissao'>{"id":1,"ativa":true}</lexedit:OutroMetadado>
    </lexedit:OutrosMetadados>
</lexedit:Metadado>
```

`chave` é obrigatória (xsd:string) e **única** dentro de `lexedit:OutrosMetadados`; o esquema rejeita chaves repetidas. O conteúdo é do tipo xsd:string e pode ser vazio. Não há limite de tamanho nem restrição de caracteres para chave ou valor.

O valor é sempre texto. Para dados estruturados, o host grava um texto serializado (por exemplo, um JSON) em uma chave própria, como `jsonDadosComissao` acima, e o interpreta ao ler.

O elemento é omitido quando não há nenhum par, e o grupo não gera pendência. Ao contrário do colegiado apreciador, é gravado também em documento usado como anexo de parecer.

### Leitura

O editor lê o grupo de forma tolerante: descarta a entrada sem `chave`, com `chave` vazia ou com valor que não seja texto, e mantém a primeira ocorrência de uma chave repetida, sem invalidar o documento nem os demais grupos.

### Uso pelo host

O componente `lexml-eta` expõe a propriedade `outrosMetadados` (`Record<string, string>`). `getDocumentoArticulado()` grava o valor corrente, e `abrirDocumentoArticulado()` o substitui pelos pares do arquivo (vazio se o arquivo não tiver o grupo). Ver [referência da API](../api-componente-lexml-eta.md).
