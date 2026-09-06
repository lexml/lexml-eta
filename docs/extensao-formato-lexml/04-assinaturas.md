# Autoria

## Necessidade informacional

Na seção de autoria, o LexEdit armazena tipo, identificação institucional e, quando aplicável, sexo, partido e UF.

## Representação proposta

Dados estruturados na estrutura do LexEdit.

```xml
<!-- Autoria de parlamentares -->
<lexedit:Metadado>
    <lexedit:Autoria
      lexedit:tipo='Parlamentar'
      lexedit:imprimirPartidoUF='true'>
      <lexedit:Parlamentares>
        <lexedit:Parlamentar
          identificacao='1111'
          nome='Davi Alcolumbre'
          sexo='M'
          siglaPartido='UNIÃO'
          siglaUF='AP'
          siglaCasaLegislativa='SF'
          cargo='Presidente do Senado Federal'/>
        <lexedit:Parlamentar
          identificacao='2222'
          nome='Soraya Thronicke'
          sexo='F'
          siglaPartido='PSB'
          siglaUF='MS'
          siglaCasaLegislativa='SF'
          cargo=''/>
      </lexedit:Parlamentares>
    </lexedit:Autoria>
</lexedit:Metadado>
```

```xml
<!-- Autoria de comissão -->
<lexedit:Metadado>
    <lexedit:Autoria
      lexedit:tipo='Comissão'>
      <lexedit:ColegiadoAutor
        identificacao='4444'
        nome='Comissão de Assuntos Econômicos'
        sigla='CAE'/>
    </lexedit:Autoria>
</lexedit:Metadado>
```

Representação textual no LexML.

```xml
<!-- Assinatura de parlamentares -->
<AssinaturaTexto>
  <p><b>Senador Davi Alcolumbre</b></p>
  <p>(UNIÃO - AP)</p>
  <p>Presidente do Senado Federal</p>
</AssinaturaTexto>
<AssinaturaTexto>
  <p><b>Senadora Soraya Thronicke</b></p>
  <p>(PSB - MS)</p>
</AssinaturaTexto>
```

```xml
<!-- Autoria de comissão -->
<AssinaturaTexto>
  <p><b>Comissão de Assuntos Econômicos</b></p>
</AssinaturaTexto>
```

