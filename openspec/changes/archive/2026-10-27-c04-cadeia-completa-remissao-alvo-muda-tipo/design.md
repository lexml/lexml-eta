## Context

`sincronizarEntrada` (`src/model/remissao/sincronizarRemissoes.ts`) escolhe a regra de texto olhando só para o texto atual do link:

```
sufixo contextual e ancestral compartilhado --> textoCanonicoRelativoATipo + sufixo
sem sufixo e sem "do/da"                    --> textoCanonicoLocal      (enxuta, D4)
demais                                      --> textoCanonicoDoDispositivo (cadeia completa)
```

Uma remissão a artigo ("art. 2º") nunca tem "do X", então sempre cai na regra enxuta. Enquanto o destino é artigo, o segmento local coincide com a cadeia completa, e o problema não aparece. Quando o TAB transforma o artigo em parágrafo, o uuid é preservado (o link segue certo), mas o segmento local vira "parágrafo único".

A matriz D4 (`sincronizarRemissoes-referenciaEnxuta.test.ts`) aceita texto enxuto apontando para fora do contexto da origem (caso da linha 531: "parágrafo único" escrito no art. 2º, alvo no art. 1º). Por isso o critério não pode ser "o destino está no contexto da origem".

## Goals / Non-Goals

**Goals:**
- Texto inequívoco quando o tipo do destino muda, sem alterar o comportamento D4 nos demais casos.

**Non-Goals:**
- Cadeia mínima (omitir o artigo quando origem e destino estão no mesmo artigo). Exigiria uma guarda do caput ("inciso I do caput" citado de um parágrafo), a exclusão de blocos de alteração e de 12 a 15 casos de teste. Fica descartada por decisão do usuário.
- A lacuna pré-existente em que a **origem** sai do contexto de uma referência enxuta (ex.: o § 2º que cita "parágrafo único" vira art. 2º). O gatilho desta change olha só o destino; corrigir a origem exige rever a D4.

## Decisions

**D1. O gatilho é a mudança de tipo do destino, detectada pelos ids.** A função compara o tipo do último segmento de `entry.targetLexmlId` (id gravado antes da sincronização, ex.: `art2`) com o de `destino.id` (ex.: `art1_par1u`). A regra enxuta só se aplica quando os dois tipos são iguais.
- Uma alternativa seria inferir o tipo pelo texto do link (regex sobre "art."/"§"/"inciso"). Foi descartada porque duplica parsing que já existe e é frágil com variações de grafia.
- Outra alternativa seria guardar o tipo do destino na entrada do registro. Foi descartada porque muda o formato do registro sem necessidade: o id antigo já carrega o tipo.

**D2. O tipo do segmento vem do prefixo alfabético do último trecho do id** (`art1_cpt` dá `cpt`, `art1_par1u` dá `par`, `art1_pena` dá `pena`), e não de `parseLexmlId`, que descarta o segmento `cpt` (não tem dígito). Isso fica numa função auxiliar em `lexmlIdUtil.ts`.

**D3. Sem `targetLexmlId` gravado, mantém o comportamento atual (enxuta).** Não dá para afirmar que o tipo mudou, e a mudança se limita ao caso comprovado.

**D4. Quando o tipo muda, usa `textoCanonicoDoDispositivo`**, o mesmo da referência qualificada. Depois disso o texto passa a ter "do X" e segue a regra qualificada nas renumerações seguintes (ex.: inserir um artigo antes passa "do art. 1º" para "do art. 2º"). Esse é o comportamento esperado.

## Risks / Trade-offs

- [Redundância quando a origem está no mesmo artigo do destino ("...no parágrafo único do art. 1º" no caput do art. 1º)] → Aceita: o texto é correto e inequívoco; o usuário pode encurtá-lo, e a edição manual é preservada.
- [A referência deixa de ser enxuta depois da transformação, e um undo devolve "art. 2º"] → Coberto: o undo muda o tipo de novo (`par` para `art`), e a cadeia completa do artigo é "art. 2º". Cenário na spec e teste dedicado.
- [Ids de dispositivos em bloco de alteração (`..._alt1_art5`)] → O último segmento continua indicando o tipo; nenhum tratamento especial.
