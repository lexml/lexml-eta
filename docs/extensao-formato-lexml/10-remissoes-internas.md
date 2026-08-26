# Remissões internas

## Necessidade informacional

Uma remissão deve conservar seu último destino conhecido mesmo quando alterações na articulação a tornarem  inválida.

## Representação proposta

O destino continua em xlink:href e o estado fica em lexedit:situacao.

Exemplo:

```xml
<Remissao xlink:href='art3' lexedit:situacao='invalida'>art. 3º</Remissao>
```

## Definições pendentes

- Confirmar com o João Lima o uso de span ou Remissao. 
- Avaliar a opção de usar alguma informação no href como uma versão inválida ou algo parecido. Teríamos que verificar a necessidade de seguir o modelo de URN do LexML; Ex: “art3?invalido” ou “art3@2026-05-13;excluido”


