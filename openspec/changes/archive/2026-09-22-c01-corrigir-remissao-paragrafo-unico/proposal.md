## Why

Uma remissão que aponta para "parágrafo único" é indevidamente atualizada para "§ 1º" mesmo quando nenhum segundo parágrafo foi criado e o dispositivo continua sendo o único parágrafo do artigo (issue [lexml-eta#1003](https://github.com/lexml/lexml-eta/issues/1003)). O rótulo exibido no próprio dispositivo (`Parágrafo único.`) permanece correto — o defeito está isolado no texto gerado para a remissão. Investigação de código confirmou a causa: existem duas fontes de verdade independentes para "este é o único parágrafo do artigo" — uma viva (recontagem de irmãos, usada pelo rótulo exibido) e uma estática (`informouParagrafoUnico`, usada pela geração do `id`/texto de remissão), que divergem sempre que o `Dispositivo` é recriado por um caminho estrutural (TAB/SHIFT_TAB, transformação de tipo) ou quando o parágrafo é criado ao vivo pela UI (nunca carregado de um arquivo já salvo). A spec `remissao-interna` já documenta, no requisito "Atualização automática do texto do link em renumeração", que uma referência sem qualificador explícito ("enxuta") só deve mudar se a posição do alvo dentro do pai imediato mudar — o que não é o caso aqui. O comportamento atual viola esse requisito já existente: é uma correção de bug, não uma nova capacidade.

Uma primeira abordagem (recontar irmãos ao vivo diretamente em `buildHref`) foi tentada e refutada por evidência de corpus real: documentos legislativos reais divergem nas duas direções (alguns usam forma numerada mesmo com 1 parágrafo; outros usam "único" mesmo dentro de um subconjunto local de bloco de alteração) — não há regra estrutural que preveja corretamente a forma para um documento carregado de arquivo, só o texto original importa. Ver `design.md` para o raciocínio completo e a decisão revisada (persistir a contagem ao vivo no ponto de escrita já existente do rótulo, não recalculá-la na geração do id).

## What Changes

- Manter `buildHref`/`buildId` (`src/model/lexml/util/idUtil.ts`) exatamente como estão hoje — continuam só lendo `informouParagrafoUnico`, sem recontagem própria.
- `createRotulo` (`src/model/lexml/numeracao/numeracaoParagrafo.ts`), nas duas ramificações que já recontam irmãos ao vivo para decidir o rótulo exibido, passa também a gravar essa mesma resposta em `informouParagrafoUnico` — hoje só lida, nunca escrita por essas ramificações. Como `createRotulo` só roda dentro de `renumeraFilhos()`, que nunca é chamado durante o carregamento de um documento e, ao nível de parágrafo, só é chamado pelo `pai` genuinamente afetado por uma mutação estrutural real (adicionar/remover/mover/transformar), o flag deixa de ficar defasado exatamente nos casos que a issue #1003 relata, sem tocar em documentos carregados intocados.
- Corrigir o teste que hoje codifica o bug como esperado (`test/model/remissao/textoCanonicoDoDispositivo.test.ts`, cenário "reflete mudança estrutural imediatamente") — já feito.
- Adicionar cobertura de teste dedicada para o caso "parágrafo único permanece único após sincronização de remissão" (hoje ausente em `test/model/remissao/`) — já feito.
- Explicitar, na spec `remissao-interna`, que o eixo "único ↔ numerado" (contagem de irmãos do mesmo tipo) é coberto pela mesma regra de estabilidade da referência enxuta, ao lado do eixo de posição ordinal já documentado.

## Capabilities

### New Capabilities
(nenhuma)

### Modified Capabilities
- `remissao-interna`: cenário "Referência 'enxuta' só muda se a posição local mudar" passa a cobrir explicitamente o caso de contagem de irmãos do mesmo tipo (único ↔ numerado), não só a posição ordinal.

## Impact

- `src/model/lexml/numeracao/numeracaoParagrafo.ts` (`createRotulo`) — único arquivo de produção alterado: passa a persistir `informouParagrafoUnico` nas duas ramificações que já recontam ao vivo.
- `src/model/lexml/util/idUtil.ts` — **não é alterado** (a primeira tentativa desta change chegou a modificá-lo; foi revertido ao original após a refutação por evidência de corpus — ver `design.md`).
- `src/model/remissao/lexmlIdUtil.ts` (`segmentoParaTexto`, `textoCanonicoDoDispositivo`, `textoCanonicoLocal`) — consumidores do `id`, sem mudança de lógica própria.
- Testes: `test/model/remissao/textoCanonicoDoDispositivo.test.ts`, `test/model/remissao/sincronizarRemissoes-referenciaEnxuta.test.ts` (novo caso dedicado), suíte completa incluindo `buildJsonixFromProjetoNorma.integracao.test.ts` (round-trip com corpus real) como verificação de não-regressão obrigatória.
- Sem mudança de schema de persistência (o `id` gerado já é o mesmo formato hoje esperado quando a contagem e o flag concordam; a mudança só corrige os casos em que divergiam por edição ao vivo).
