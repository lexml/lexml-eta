## Context

Ver `proposal.md` - Why para a motivação e o diagnóstico completo. Resumo técnico necessário para as decisões abaixo:

- `createRotulo()` (`src/model/lexml/numeracao/numeracaoParagrafo.ts:48-66`) decide o rótulo exibido ("Parágrafo único." vs "§ Nº") recontando `pai.filhos.filter(isParagrafo).length` a cada renumeração — mas só em DUAS das suas três ramificações. A expressão `dispositivo.pai?.filhos.filter(f => isParagrafo(f)).length === 1` aparece duplicada, idêntica, na ramificação de bloco de alteração com dispositivo novo e na ramificação normal (fora de bloco de alteração). A terceira ramificação (bloco de alteração, dispositivo NÃO-novo — mod/sup em norma existente) usa `this.informouParagrafoUnico` em vez de recontar ao vivo.
- `buildHref`/`buildId` (`src/model/lexml/util/idUtil.ts:12-27`) decide o sufixo `1u` do `id`/`lexmlId` do dispositivo consultando exclusivamente o campo `informouParagrafoUnico`, setado ao fazer parse de um rótulo textual ("Parágrafo único.") vindo de arquivo carregado (`buildProjetoNormaFromJsonix.ts:190/259`, chamado logo após `criaDispositivo`) ou de renumeração manual digitada (`renumeraElemento.ts:46`). Esse campo tem default `false` e não é recalculado quando o `Dispositivo` é recriado ao vivo (TAB/SHIFT_TAB, transformação de tipo, criação ao vivo pela UI via `criaDispositivo`/`create()`).
- Todo o pipeline de texto de remissão (`src/model/remissao/lexmlIdUtil.ts`) deriva o texto a partir do `id` (via `parseLexmlId`), não do `rotulo` já calculado corretamente pelo `createRotulo`.

### Decisão A tentada e descartada — recontagem ao vivo em `buildHref`

A primeira tentativa desta change fazia `buildHref` recontar irmãos ao vivo (mesma lógica de `createRotulo`) em vez de consultar `informouParagrafoUnico`. Rodar a suíte completa contra o corpus real (`buildJsonixFromProjetoNorma.integracao.test.ts`, ~15 proposições reais: MPV 885/2019, MPV 905/2019, MPV 930/2020, MPV 1085/2021, MPV 1100/2022, PLP 68/2024, PL 4687/2023, PEC 48/2023) refutou essa abordagem, e a refutação foi bidirecional:

- **Fora de bloco de alteração**: PLP 68/2024 tem um artigo real com exatamente 1 parágrafo, redigido pelo autor como `"§ 1º"` — não `"Parágrafo único"`. Recontagem ao vivo gerou `par1u`, divergindo do id real do documento.
- **Dentro de bloco de alteração**: MPV 885/2019 tem um trecho de alteração cujo subconjunto local também tem exatamente 1 parágrafo, mas o texto real usa `"Parágrafo único"`. Excluir blocos de alteração da recontagem (replicando a ramificação de `createRotulo` que usa o flag) gerou `par1` nesse caso, também divergindo.

**Conclusão**: não existe nenhuma regra estrutural (contagem de irmãos, posição, dentro/fora de bloco de alteração) que preveja corretamente a forma "único" vs numerada para um dispositivo **carregado de um documento real**. É escolha autoral do redator da norma, sem correlação estrutural — só recuperável do texto original, que é exatamente o que `informouParagrafoUnico` captura ao fazer parse do rótulo no carregamento. `idUtil.ts` foi revertido ao original; a Decisão A não é viável em nenhuma variante.

## Goals / Non-Goals

**Goals:**
- Fazer o texto de remissão para um parágrafo refletir a mesma verdade que o rótulo exibido no próprio dispositivo, **sem** comprometer a fidelidade de round-trip de documentos reais carregados de arquivo (serialização idêntica ao original quando nenhuma edição ao vivo ocorreu).
- `informouParagrafoUnico` deve refletir a contagem viva de irmãos exatamente quando — e só quando — essa contagem muda por uma ação de edição ao vivo genuína (não por uma renumeração alheia em outra parte do documento).

**Non-Goals:**
- "Artigo único" (`informouArtigoUnico`, `numeracaoArtigo.ts`) fica fora de escopo. O código em `buildHref` já sugeria suporte (`isArtigo(dispositivo) || isParagrafo(dispositivo)`), mas nunca funcionou de fato (a condição só podia ser verdadeira para parágrafo) — e a evidência de corpus (PL 4687/2023, PEC 48/2023: artigos únicos reais rotulados "Art. 1º", não "Artigo único") confirma que reativar esse caminho quebraria round-trip real. Fica como está: código historicamente inerte, não tocado.
- Não mexe no propósito original de `informouParagrafoUnico` para o caminho de carregamento/renumeração manual — `createNumeroFromRotulo`, `parserReferenciaDispositivo.ts` e `renumeraElemento.ts:46` continuam exatamente como estão.
- Não revisita a regra de detecção de agrupador "único/única" (`buscarFilhoAgrupador`) — fora do escopo desta issue.
- Não corrige a ramificação de bloco de alteração não-novo em `createRotulo` (continua usando o flag para o rótulo exibido nesse caso específico) — nenhum sintoma da issue #1003 passa por esse caminho.
- Não altera `agrupaElemento.ts` — ver Risks/Trade-offs sobre a cascata ampla dessa ação.

## Decisions

**Decisão principal (revisão da Decisão A): persistir a contagem ao vivo DENTRO de `createRotulo`, não recalculá-la em `buildHref`.**

`buildHref`/`idUtil.ts` volta a ser exatamente o código original — só lê `informouParagrafoUnico`, sem recontagem, sem conhecimento de bloco de alteração. `createRotulo`, nas suas duas ramificações que já recontam ao vivo para decidir o rótulo exibido, passa também a gravar essa mesma resposta de volta em `this.informouParagrafoUnico` (hoje só é lida, nunca escrita por essas ramificações).

O que torna isso seguro — ao contrário da Decisão A — é **quando** `createRotulo` roda: exclusivamente dentro de `renumeraFilhos()` (`hierarquiaDispositivo.ts:48-60`, `filho.createRotulo(filho)`), que por sua vez:
- **nunca** é chamado durante o carregamento de um documento (`buildProjetoNormaFromJsonix.ts` não tem nenhuma chamada a `renumeraFilhos` — confirmado por busca no arquivo) — então o flag de um dispositivo carregado, mas ainda não tocado por nenhuma edição ao vivo, nunca é reescrito, permanecendo fiel ao texto original;
- quando chamado **ao nível de parágrafo** (`art.renumeraFilhos()`, distinto de `articulacao.renumeraFilhos()` que só renumera artigos), é disparado apenas pelo `pai` diretamente afetado por uma ação estrutural real — confirmado percorrendo todos os call sites de `renumeraFilhos()` nos reducers: `adicionaElemento.ts:125` (`novo.pai!.renumeraFilhos()`), `eventosUtil.ts:118/201-202` (remoção, via `removeElemento`), `moveElementoAcima.ts`/`moveElementoAbaixo.ts` (ambos os pais, antigo e novo, quando diferentes), `transformaTipoElemento.ts:61-62` (só quando `isParagrafoUnico(dispositivoAnteriorAtual)`, reaproveitando a mesma função de `hierarquiaUtil.ts`), `autoFixElemento.ts:72`, `undoRedoReducerUtil.ts:117/151` (undo/redo reaproveitam os mesmos helpers de inclusão/remoção — mesma granularidade). Em nenhum desses call sites o `pai` renumerado é escolhido "por precaução" — é sempre o container cuja lista de filhos mudou de fato.

Isso equivale, na prática, à regra que o usuário propôs em conversa: *"se criou um novo parágrafo, a remissão pode atualizar; se criou outro tipo de dispositivo em outro lugar, não atualiza"* — só que implementada no ponto de escrita do flag (que só é tocado quando o parágrafo do `pai` específico muda de verdade), em vez de precisar de um sinal explícito de "que ação disparou isto" passado para dentro da sincronização de remissão.

Alternativas consideradas:
- **(A, refutada por evidência de corpus)** Recontagem ao vivo em `buildHref` — ver seção Context acima.
- **(B, esta decisão)** Persistir o flag no ponto de escrita natural (`createRotulo`), aproveitando que esse ponto só é alcançado por ações de mutação real, já narrowly-scoped no código existente.
- **(C, descartada)** Sincronizar o flag explicitamente em cada reducer de mutação (adicionar/remover/mover/transformar), like originalmente cogitado. Descartada por ser estritamente mais código do que (B) para o mesmo resultado — `createRotulo` já roda em todos esses pontos via `renumeraFilhos()`; duplicar a lógica nos reducers welcomeria a mesma fragilidade (múltiplas superfícies para manter em dia) que a primeira versão deste design já queria evitar.

## Risks / Trade-offs

- **[Cascata ampla em `agrupaElemento.ts:145-146`]** Ao criar um novo agrupador (Capítulo/Seção/Título), esse reducer chama `novo.pai!.filhos.forEach(f => f.renumeraFilhos())` — renumera ao nível de parágrafo **todos** os filhos diretos de `novo.pai`, não só os efetivamente movidos para o novo agrupador. Se um desses filhos for um artigo carregado de arquivo com um parágrafo cujo flag foi fielmente lido como `false` (não-único, por escolha do autor), essa cascata dispararia `createRotulo` para ele e reescreveria o flag com a contagem viva (nesse caso coincidentemente `true`, já que há só 1 parágrafo). → Mitigação: aceito como risco conhecido, não como regressão desta mudança — o **rótulo exibido** (`.rotulo`) já sofre exatamente essa mesma "contaminação" hoje, nesse mesmo raio de ação, independente desta change. Estender `informouParagrafoUnico` ao mesmo alcance só torna o id consistente com o que a tela já mostra; não introduz uma superfície nova. Os testes de corpus (round-trip real) não são afetados porque nunca exercitam nenhum reducer ao vivo — carregam e serializam diretamente, sem passar por `agrupaElemento`.
- **[Teste existente `textoCanonicoDoDispositivo.test.ts` hoje afirma o comportamento incorreto como esperado]** → Corrigir a asserção como parte desta mudança (já feito na Task 1 desta change).
- **[Documentos salvos anteriormente podem ter `id`s com `1u` incorretamente ausente]** → Fora do escopo: a correção vale daqui pra frente. Um documento afetado se autocorrige na próxima vez que aquele parágrafo específico for genuinamente adicionado/removido/movido (o que atualiza seu `pai.renumeraFilhos()`) — não em qualquer reabertura ou renumeração alheia.

## Open Questions

(nenhuma — a decisão acima já resolve as ambiguidades identificadas na investigação, incluindo o risco de `agrupaElemento.ts`, explicitamente aceito acima)
