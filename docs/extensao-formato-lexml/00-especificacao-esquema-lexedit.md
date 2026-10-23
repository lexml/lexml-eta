# Especificação de utilização do padrão LexML para documentos do LexEdit

## Objetivo e escopo

Este documento reúne as considerações gerais da especificação. As definições de cada grupo de elementos ficam em arquivos próprios, referenciados no [índice de especificações](#especificações-por-grupo-de-elementos).

### Premissa central

O padrão LexML não terá conhecimento de qualquer especificidade do LexEdit: nenhum elemento, atributo ou tipo do esquema LexML será criado ou alterado em função das necessidades do editor. Todos os metadados do LexEdit ficam concentrados em um único ponto de extensão já previsto pelo padrão — `MetadadoProprietario` — genérico o bastante para que o LexEdit, e presumivelmente outros editores de textos legislativos articulados, possam nele registrar informações próprias sem comprometer a validade nem a interoperabilidade do documento LexML resultante.

Quando um metadado do LexEdit se refere a um trecho específico do documento, o registro em `MetadadoProprietario` referencia o `id` desse elemento, atributo que já faz parte do padrão LexML. 

Um documento produzido segundo esta especificação é, sempre, um documento LexML válido e legível por qualquer consumidor do padrão. As informações específicas do LexEdit ficam isoladas em `MetadadoProprietario` e podem ser ignoradas por quem não as conhece.

O LexEdit precisa preservar informações necessárias à edição, revisão e apresentação de uma proposição legislativa estruturada em LexML. Este documento não define um XSD do LexML: registra, por meio de exemplos XML, como o LexEdit pretende ocupar os pontos de extensão identificados, para orientar a implementação do editor. O esquema auxiliar que formaliza esses exemplos já existe em [`schemas/lexedit.xsd`](../../schemas/lexedit.xsd) (ver [Esquema auxiliar](#esquema-auxiliar-lexeditxsd)).

A estrutura normativa, os dispositivos e as demais estruturas já previstas pelo LexML continuam sendo representadas exclusivamente pelos elementos LexML existentes; os pontos de extensão armazenam apenas as informações complementares que o padrão não contempla.

Será dada preferência para uso de elementos já previstos no próprio LexML quando adequados (ex: urn, articulação, justificação...).

Sempre que possível será gerada a representação textual prevista no LexML mesmo que essa não seja utilizada para a edição do texto por existirem metadados estruturados relacionados no esquema do LexEdit.

O escopo inicial compreende a identificação provisória do documento, elementos de apresentação e parte final, conteúdo textual enriquecido, anotações, revisões de texto e revisões estruturais.

**O LexEdit poderá abrir um arquivo LexML sem metadados específicos do LexEdit**, caso em que os dados não endereçados pelo LexML aparecerão com os valores padrão do editor.

### Premissa sobre o arquivo do editor de textos legislativos articulados

O componente lexml-eta será utilizado em um editor de textos legislativos articulados e manipulará uma versão jsonix do arquivo lexml. Esse jsonix será convertido pelo editor em um arquivo 'documento-articulado.xml' que, junto com demais documentos anexos, será embutido em um PDF de apresentação do texto.

## Convenções gerais

### O ponto de extensão: metadados globais em `MetadadoProprietario`

O esquema do LexML já prevê `MetadadoProprietario` como um ponto de extensão totalmente aberto, sem necessidade de qualquer alteração no padrão: é possível validar o esquema do LexEdit nos elementos nele contidos.

Dados que não pertencem a um trecho específico do documento ficam em `Metadado/MetadadoProprietario`:

Os elementos e atributos específicos do LexEdit usam um namespace próprio, que não pertence ao LexML:

```xml
<Metadado>
  <!-- demais metadados LexML -->
  <MetadadoProprietario fonte="http://www.lexml.gov.br/lexedit/1.0">
    <lexedit:Metadado xmlns:lexedit='http://www.lexml.gov.br/lexedit/1.0'>
      <!-- dados globais do Lexedit -->
    </lexedit:Metadado>
  </MetadadoProprietario>
</Metadado>
```

### Referência a elementos do LexML

Quando o dado se refere a um dispositivo ou a uma marca no texto rico, o registro correspondente em `lexedit:Metadado` traz um atributo próprio (por exemplo, `lexedit:refId`) cujo valor é o `id` do elemento LexML referenciado. 

### Identificadores e demais convenções

Convencionameos o prefixo `_` (underscore) para os `id`'s criados para necessidades especiais do LexEdit.

Os identificadores internos do Lexedit (para objetos que não têm correspondente direto no LexML, como notas e comentários) devem ser únicos no documento e estáveis enquanto o objeto a que se referem existir.

Datas e horas devem ser serializadas em ISO 8601, utilizando os tipos xsd:date ou xsd:dateTime, com fuso horário quando houver hora, por exemplo `2026-05-11T15:51:00-03:00`.

## Especificações por grupo de elementos

| Grupo | Definição específica | Salvar e abrir no editor |
| --- | --- | --- |
| Identificação provisória e URN | [01-identificacao-provisoria-e-urn.md](01-identificacao-provisoria-e-urn.md) | Implementado |
| Opções de impressão | [02-opcoes-de-impressao.md](02-opcoes-de-impressao.md) | Implementado |
| Fecho com local e data | [03-fecho-local-e-data.md](03-fecho-local-e-data.md) | Implementado, com `ParteFinal/LocalDataFecho` |
| Assinaturas | [04-assinaturas.md](04-assinaturas.md) | Implementado para parlamentares, com `ParteFinal/AssinaturaTexto`; comissão (`ColegiadoAutor`) pendente |
| Anexos | [05-anexos.md](05-anexos.md) | Não implementado |
| Justificação e conteúdo rico | [06-justificacao-e-conteudo-rico.md](06-justificacao-e-conteudo-rico.md) | Parcial (verificar) |
| Notas de rodapé | [07-notas-de-rodape.md](07-notas-de-rodape.md) | Não implementado |
| Comentários | [08-comentarios.md](08-comentarios.md) | Não implementado |
| Revisão de texto | [09-revisao-de-texto.md](09-revisao-de-texto.md) | Não implementado |
| Remissões internas | [10-remissoes-internas.md](10-remissoes-internas.md) | Implementado |
| Revisão da hierarquia | [11-revisao-da-hierarquia.md](11-revisao-da-hierarquia.md) | Implementado |
| Registro de usuários | [12-registro-usuarios.md](12-registro-usuarios.md) | Implementado para os usuários das revisões da hierarquia |
| Outros metadados do LexEdit | [13-outros-metadados-do-lexedit.md](13-outros-metadados-do-lexedit.md) | Parcial: `Pendencias` e `SituacaoNaNormaVigente`; os atributos de `lexedit:Metadado` deste grupo não são gravados |
| Colegiado apreciador | [14-colegiado-apreciador.md](14-colegiado-apreciador.md) | Implementado |
| Metadados genéricos dos hosts | [15-outros-metadados-dos-hosts.md](15-outros-metadados-dos-hosts.md) | Implementado |
| Exemplo completo | [99-exemplo-completo.md](99-exemplo-completo.md) | — |

Cada arquivo descreve a necessidade informacional, a representação adotada e as decisões ainda necessárias para aquele grupo. As convenções deste documento aplicam-se a todos eles. Ao concluir um grupo, atualize a coluna "Salvar e abrir no editor".

## Esquema auxiliar (`lexedit.xsd`)

[`schemas/lexedit.xsd`](../../schemas/lexedit.xsd) cobre o namespace `http://www.lexml.gov.br/lexedit/1.0` para todos os grupos, inclusive os ainda não implementados. O arquivo é uma cópia do esquema do conversor `jsonix-lexml` (ver [`schemas/README.md`](../../schemas/README.md)). Ele serve sobretudo de contrato para a conversão jsonix, e não de validador rígido: regras que o XSD expressa mal ficam para o código.

- Os elementos LexML são referenciados por `xs:import` de `lexml-simples.xsd`, sem cópia nem `xsd:any`.
- `lexedit:RevisaoArticulacao` aceita um único elemento entre os dispositivos dos grupos `LXhier` e `LXcontainers`, `Pena` e `p`. Ele serve tanto ao dispositivo excluído quanto ao estado anterior de um dispositivo alterado.
- `revisao` é `xsd:string`, sem `xsd:pattern`. A gramática das operações está em [11-revisao-da-hierarquia.md](11-revisao-da-hierarquia.md).
- `idUsuario`/`refIdUsuario` são `xsd:string`, não `xsd:ID`/`xsd:IDREF`, e por isso aceitam `sf:fulano`.
- `lexedit:Autoria` escolhe entre `Parlamentares` e `ColegiadoAutor` sem amarrar a escolha ao valor de `@tipo`.
- Enumerações: `sexo` (`M`, `F`), `Autoria/@tipo` (`Parlamentar`, `Comissão`), `siglaCasaLegislativa` (`SF`, `CD`, `CN`). `Anexo/@tipo` é texto livre e `Metadado/@data` é `xsd:date`.

As fixtures de `scripts/fixtures-lexedit/` (uma por grupo) e o fragmento `lexedit:Metadado` de [documento-articulado-exemplo.xml](documento-articulado-exemplo.xml) são validados contra o esquema por `npm run verify:xsd-lexedit`.


