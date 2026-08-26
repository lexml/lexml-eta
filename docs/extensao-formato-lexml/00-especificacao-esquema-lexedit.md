# Proposta de extensões Lexedit para documentos LexML

## Objetivo e escopo

Este documento reúne as considerações gerais da proposta. As definições de cada grupo de elementos ficam em arquivos próprios, referenciados no [índice de especificações](#especificações-por-grupo-de-elementos).

O Lexedit precisa preservar informações necessárias à edição, revisão e apresentação de uma proposição legislativa estruturada em LexML. A proposta não define um XSD: registra o comportamento esperado por meio de exemplos XML, para orientar a implementação do editor e um futuro esquema auxiliar.

O documento continua sendo LexML. A extensão Lexedit armazena somente as informações complementares; a estrutura normativa, os dispositivos e as estruturas já previstas pelo LexML devem continuar sendo representados pelos elementos LexML existentes.

O escopo inicial compreende a identificação provisória do documento, elementos de apresentação e parte final, conteúdo textual enriquecido, anotações, revisões de texto e revisões estruturais.

### Premissa sobre o arquivo do editor de textos legislativos articulados

O componente lexml-eta será utilizado em um editor de textos legislativos articulados e manipulará uma versão jsonix do arquivo lexml. Esse jsonix será convertido pelo editor em um arquivo 'documento.xml' que, junto com demais documentos anexos, será embutido em um PDF de apresentação do texto.

## Convenções gerais

### Namespace e localização dos dados

Os elementos e atributos novos usam o namespace Lexedit:

```xml
xmlns:lexedit=http://www.lexml.gov.br/lexedit/1.0
```

Dados que não pertencem a um trecho específico do documento ficam em `Metadado/MetadadoProprietario`, mecanismo já previsto no LexML.

[?] Seria melhor subir `lexedit:Metadado` para `Metadado`, ou até subir ao nível do documento. Talvez não se encaixe na definição de "ponto  de  extensão para registro de metadados  não considerados no atual esquema."

```xml
<Metadado>
  <!-- demais metadados LexML -->
  <MetadadoProprietario>
    <lexedit:Metadado>
      <!-- dados globais do Lexedit -->
    </lexedit:Metadado>
  </MetadadoProprietario>
</Metadado>
```

Quando o dado se refere a um dispositivo ou a uma marca no texto rico, o elemento LexML recebe um atributo `lexedit:*` que aponta para o registro correspondente nos metadados. Assim, o conteúdo normativo não é duplicado.

Os identificadores de dispositivos continuam sendo os `id` do LexML. Os identificadores internos do Lexedit devem ser únicos no documento e estáveis enquanto o objeto a que se referem existir. Nos exemplos são usados os prefixos `nr` (nota de rodapé) e `sc` (sequência de comentários).

Datas e horas devem ser serializadas em ISO 8601, utilizando os tipos xsd:date ou xsd:dateTime, com fuso horário quando houver hora, por exemplo `2026-05-11T15:51:00-03:00`.

A versão do esquema auxiliar deverá prever expressamente os pontos do LexML que aceitam atributos `lexedit:*`.

## Especificações por grupo de elementos

| Grupo | Definição específica |
| --- | --- |
| Identificação provisória e URN | [01-identificacao-provisoria-e-urn.md](01-identificacao-provisoria-e-urn.md) |
| Opções de impressão | [02-opcoes-de-impressao.md](02-opcoes-de-impressao.md) |
| Fecho com local e data | [03-fecho-local-e-data.md](03-fecho-local-e-data.md) |
| Assinaturas | [04-assinaturas.md](04-assinaturas.md) |
| Anexos | [05-anexos.md](05-anexos.md) |
| Justificação e conteúdo rico | [06-justificacao-e-conteudo-rico.md](06-justificacao-e-conteudo-rico.md) |
| Notas de rodapé | [07-notas-de-rodape.md](07-notas-de-rodape.md) |
| Comentários | [08-comentarios.md](08-comentarios.md) |
| Revisão de texto | [09-revisao-de-texto.md](09-revisao-de-texto.md) |
| Remissões internas | [10-remissoes-internas.md](10-remissoes-internas.md) |
| Revisão da hierarquia | [11-revisao-da-hierarquia.md](11-revisao-da-hierarquia.md) |
| Registro de usuários | [12-registro-usuarios.md](12-registro-usuarios.md) |

Cada arquivo descreve a necessidade informacional, a representação proposta e as decisões ainda necessárias para aquele grupo. As convenções deste documento aplicam-se a todos eles.

## Decisões pendentes

- Tipo para valores booleanos (xsd:boolean, s/n...)
- Será necessário especificar uma URN para identificadores institucionais? Algo como `sf:parlam:codParlamentar:1234`.

## Dúvida sobre a adição de metadados a elementos textuais do LexML

Em casos como o do elemento `LocalDataFecho`, previsto como elemento textual no LexML temos a opção de adicionar os metadados do LexEdit diretamente no elemento ou no `lexedit:Metadado`. A primeira opção tem a vantagem de concentrar toda a informação em um único elemento e a desvantagem de tornar o esquema mais complexo.

**Primeira opção: metadados no elemento LexML**

```xml
<LocalDataFecho
    lexedit:local='Sala das Sessões'
    lexedit:data='2026-04-24'>
    <p>Sala das Sessões, 24 de abril de 2026.</p>
</LocalDataFecho>
```

**Segunda opção: metadados separados do elemento**

```xml
<lexedit:Metadado>
  <lexedit:LocalData
      local='Sala das Sessões'
      data='2026-04-24'/>
</lexedit:Metadado>
```

```xml
<LocalDataFecho>
    <p>Sala das Sessões, 24 de abril de 2026.</p>
</LocalDataFecho>
```


