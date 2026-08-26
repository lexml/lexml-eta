# Assinaturas

## Necessidade informacional

Além da estrutura LexML de assinaturas de pessoa, grupo e texto livre, o editor precisa dos dados de apresentação usados na composição e na impressão.

## Representação proposta

O LexML mantém a estrutura da assinatura; a extensão acrescenta tipo, identificação institucional e, quando aplicável, sexo, partido e UF.

Exemplo de assinatura de parlamentar:

```xml
<AssinaturaGrupo 
    lexedit:tipo='Parlamentar'
    lexedit:imprimirPartidoUF='true'>
  <Assinatura 
    lexedit:identificador='senador-123'
    lexedit:sexo='M'
    lexedit:siglaPartido='UNIAO'
    lexedit:UF='AP'>
    <NomePessoa>Davi Alcolumbre</NomePessoa>
    <Cargo>Presidente do Congresso Nacional</Cargo>
  </Assinatura>
</AssinaturaGrupo>
```

Exemplo de assinatura de comissão:

```xml
<AssinaturaGrupo 
    lexedit:tipo='Comissão'
    lexedit:identificador='comissao-123'>
  <AssinaturaTexto>
    <p>Comissão de Assuntos Econômicos</p>
  </AssinaturaTexto>
</AssinaturaGrupo>
```

`identificacao` é chave do cadastro institucional, não uma nova identificação LexML.

