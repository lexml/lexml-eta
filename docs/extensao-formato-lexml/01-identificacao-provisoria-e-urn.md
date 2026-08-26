# Identificação provisória e URN

## Necessidade informacional

Enquanto a proposição não tiver número definitivo, o editor precisa identificar o documento de forma estável para intercâmbio e referência.

## Representação proposta

Para edição de projetos/propostas ainda não numerados, o Lexedit deve guardar uma URN provisória na identificação seguindo o modelo de URN do LexML utilizando os números `999999` e o ano `9999` para os respectivos campos ainda não definidos, conforme exemplo:

```xml
<Identificacao URN="urn:lex:br:senado.federal:projeto.lei:999999;9999"/>
```
