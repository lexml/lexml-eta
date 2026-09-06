# Plano B — Remoção incremental do controle de situação

> Status: **em execução** — Etapas 0 a 3 concluídas, Etapa 4 em andamento.
> Branch: `feat/remove-controle-situacao-emenda`.
> Alternativa ao [Plano A](./plano-remocao-situacao-dispositivo.md), para comparação.

## 0. Estado atual

| Etapa | Estado | Commits |
| --- | --- | --- |
| 0 — migrar a suíte | **concluída** | `a4a7b557`, `83bf41b9`, `03d87e16` |
| 1 — re-*baselinar* revisão | **concluída** | `af6f1173`, `5cb34642` |
| 2 — remover o trio | **concluída** | `4b9349cb`, `262ad921`, `67b8a599`, `013e7822`, `4322ff09` |
| 3 — desacoplar `existeNaNormaAlterada` | **concluída** | `1c20d5d1` |
| 4 — colapsar `ADICIONADO` em `NOVO` | **em andamento** | `14b3a1f0`, `d0aea80d`, `64c5e52e`, `f57c73da`, `33aee7b7`, `7901698a`, `e71433b2`, `04db5831` |
| 5 — remover o campo `situacao` | não iniciada | |
| 6 — limpeza final | não iniciada | |

As ocorrências de `DISPOSITIVO_ADICIONADO` / `DISPOSITIVO_NOVO` em `src/` saíram de **61 para 38**.

### A Etapa 4 mudou de natureza

O plano a tratava como um refactor único de risco alto. Na prática ela está sendo executada em
fatias, guiadas por **teste manual no demo**: o usuário encontra um sintoma, localiza-se a cláusula
de situação responsável, corrige-se e escreve-se um teste que comprovadamente falha sem a correção.

O motivo é que a maioria dos pontos não era refactor, e sim **bug**. Como a situação não é
serializada, toda regra baseada nela funciona durante a sessão e para de funcionar ao reabrir o
documento. Esse é o teste decisivo para identificar resquício de emenda.

Bugs encontrados e corrigidos por esse método:

| Sintoma | Causa |
| --- | --- |
| Opções "Adicionar Parte/Livro/Título" duplicavam "Adicionar Título, Capítulo, Seção e outros" | resquício de lógica antiga; ambas iam ao mesmo reducer |
| "Remover" aparecia/sumia do menu de agrupador sem relação com a hierarquia | menu e reducer usavam critérios diferentes |
| Dois "Art. 2º" após usar o assistente de alteração | o reducer não emitia `ElementoRenumerado` |
| Aspas e "(NR)" no dispositivo errado após colagem | a função devolvia apenas o último e seu irmão imediato |
| Selo "Existente"/"Novo" ausente e impossível de alternar | quatro pontos exigiam situação `ADICIONADO` |

## 1. Em que difere do Plano A

| | Plano A | Plano B |
| --- | --- | --- |
| Objetivo | Remover o conceito de situação por completo | Remover o **controle de situação de emenda**; o resto vira continuação opcional |
| Ordem | Desacoplar dados → remover trio → colapsar → remover campo | Migrar a suíte → re-*baselinar* revisão → remover trio → **parar** → (opcional) colapsar → remover campo |
| Primeira entrega | Fase 1 (refactor de campo em código vivo) | Etapas 0–1 (só testes; `src/` intocado) |
| Ponto de parada | Nenhum — as 5 fases formam um bloco | **Sim**, ao fim da Etapa 2 |
| Compromisso inicial | Alto | Baixo e reversível arquivo a arquivo |
| Onde a descoberta acontece | No fim, ao adaptar os testes | **No início**, antes de apagar qualquer linha |

O conteúdo técnico é essencialmente o mesmo. O que muda é o **sequenciamento** e a existência de uma fronteira explícita entre o que é seguro e o que exige decisão.

## 2. Fundamento: os três estados de emenda são inalcançáveis hoje

Esta é a premissa que sustenta o plano. Cadeia de evidências:

1. `buildProjetoNormaFromJsonix(this.projetoNorma, false)` em `lexml-eta-proposicao.component.ts` — literal `false`, **único chamador**. `isEmendamento` nunca fica `true`, logo `DispositivoOriginal` nunca é criado por essa via.
2. `ArticulacaoParser.load()` não possui nenhum chamador em `src/` (apenas o default `emendamento = false`).
3. `dispositivosEmenda` em `lexml-eta-proposicao.component.ts` é `private`, **nunca atribuído** e sem *setter*. Os ramos `dispositivosSuprimidos` / `dispositivosModificados` / `dispositivosAdicionados` do reducer `aplicaAlteracoesEmenda` são inalcançáveis.
4. `MODIFICADO` e `SUPRIMIDO` só nascem **a partir de** `ORIGINAL`: `atualizaTextoElemento`, `atualizaElemento`, `atualizaReferenciaElemento`, `suprimeElemento` e `suprimeAgrupador` todos testam `ORIGINAL` antes de transicionar.
5. `restaurarSituacao` (undo/redo) apenas reconstrói estados que já existiam.

**Conclusão**: remover `ORIGINAL`, `MODIFICADO` e `SUPRIMIDO` é remoção de caminho morto, não alteração de comportamento.

### 2.1 Confirmação empírica (Etapa 0 — grupos `colar` e `agrupa`)

A premissa acima foi verificada em execução: 18 arquivos migrados para `emendamento = false`, **303 testes verdes**. Todas as falhas iniciais eram asserções sobre situação ou sobre numeração derivada dela — nenhuma quebra estrutural.

### 2.2 Ressalva: `ADICIONADO` também ocorre no texto principal

Uma versão anterior deste plano equiparava `DISPOSITIVO_ADICIONADO` a `isDispositivoAlteracao`. **Está errado.**

Em `test/redux/colar/reducer-colar-dispositivo-004.test.ts`, o artigo `art1-1` é de topo — texto principal, fora de qualquer bloco de alteração — e sua situação é `ADICIONADO`. Colar e agrupar criam `DispositivoAdicionado` no texto principal (`adicionaElementosFromClipboard.ts`, `agrupaElemento.ts`).

A distinção real entre `NOVO` e `ADICIONADO` é **como** o dispositivo foi criado (digitado vs. colado/agrupado/assistente), não **onde** ele está. Consequência: a Etapa 4 tem alcance maior do que o previsto — colapsar `ADICIONADO` em `NOVO` libera a ação "Agrupar" também para dispositivos colados no texto principal, e não só dentro de blocos de alteração.

### 2.3 Diferenças de comportamento já observadas

| Onde | Modo emenda | Modo proposição |
| --- | --- | --- |
| Inserir Capítulo antes do art. 6 | `cap1-1` / `CAPÍTULO I-1` | `cap2` / `CAPÍTULO II` |
| Colar substituindo sobre artigo com filhos | filhos marcados `SUPRIMIDO` | filhos **removidos** (`filhos.length === 0`) |

Ambas são o comportamento correto de proposição: o complemento (`I-1`) existe para não renumerar dispositivos originais de uma norma, e supressão só faz sentido sobre texto pré-existente.

### 2.4 Armadilhas encontradas na migração

- **Testes que passam por vacuidade.** `reducer-colar-dispositivo-007` afirmava `.every(d => d.situacao === 'Dispositivo Suprimido')` sobre um array **vazio** — verde sem verificar nada. Mesmo padrão em `003` (`filter(a => a.id === 'art56')` não casa nada). Ao migrar, revisar todo `.filter().every()`.
- **Asserções de situação escondidas.** Em `reducer-colar-dispositivo-002`, uma verificação de `descricaoSituacao` mora dentro de um teste chamado "Testando eventos". Buscar pelo nome do teste não basta.

### 2.5 A maior consequência: ids deixam de ser estáveis

Em modo emenda os dispositivos originais **não renumeram** — é justamente o papel do complemento (`art160-1`, `cap1-1`, `Art. 0`). Isso tornava os `lexmlId` estáveis após inserções e colagens, e boa parte da suíte se apoia nisso, localizando dispositivos por id *hardcoded*.

Em proposição tudo renumera. Depois de inserir ou colar, um id como `art8` passa a designar **outro** dispositivo, e `buscaDispositivoById` devolve o vizinho errado — ou `undefined`, gerando `TypeError: Cannot read properties of undefined`.

Dois arquivos esbarraram nisso e exigem reescrita estrutural, não re-*baseline*:

| Arquivo | Sintoma |
| --- | --- |
| `test/redux/paginacao/reducer-paginacao.test.ts` | procura `art160-1`, `art160-2`, `art159-1`; a sonda mostrou a sequência contínua `art150..art169` |
| `test/redux/dispositivo-bloqueado/dispositivo-bloqueado.test.ts` | após colar, `isBloqueado('art8')` vira `false` e `art8_par1` recebe o texto colado |

**Correção parcial**: capturar o `uuid` do dispositivo **antes** da operação e localizá-lo depois com `findDispositivoByUuid(articulacao, uuid)`, que já existe em `hierarquiaUtil`. Funciona — **mas só para inserção**.

### 2.6 Operações que renumeram reconstroem os dispositivos

Ao testar a abordagem por `uuid` nos dois arquivos, o resultado foi:

| Operação | Identidade preservada? | Evidência |
| --- | --- | --- |
| Inserir dispositivo | **Sim** | em `paginacao`, os 5 testes de inclusão passam com busca por `uuid` |
| Mover dispositivo | **Não** | `findDispositivoByUuid` devolve `null` após `MOVER_ELEMENTO_ACIMA` — 5 testes de movimentação falham |
| Colar substituindo (aplicada) | **Não** | em `dispositivo-bloqueado`, `findDispositivoByUuid` devolve `null` para 4 dos 5 alvos |
| Colar substituindo (rejeitada por bloqueio) | **Sim** | nada muda, os alvos continuam localizáveis |

Ou seja: em modo proposição, as operações que disparam renumeração **reconstroem** os dispositivos afetados. Nem o `lexmlId` nem o `uuid` sobrevivem. Em modo emenda isso não acontecia porque os originais não renumeram — os dispositivos eram alterados no lugar, mudando apenas a situação para `MODIFICADO`.

**Consequência para a migração**: testes que encadeiam operações sobre um mesmo dispositivo não podem rastreá-lo por identificador nenhum. Precisam ser **re-especificados** para afirmar sobre a estrutura resultante — por posição, por conteúdo ou por relação de parentesco.

Dois arquivos estavam nessa situação. Um deles deixou de ser problema (ver 2.7); resta:

| Arquivo | Situação |
| --- | --- |
| `test/redux/paginacao/reducer-paginacao.test.ts` | 5 de 10 testes migram com `uuid`; os 5 de movimentação precisam da especificação da seção 2.8 |

### 2.7 Dispositivo bloqueado é conceito exclusivo de emenda

Confirmado com a equipe: **não existe dispositivo bloqueado na edição de proposição.** O recurso servia para marcar, numa emenda, um dispositivo original da proposição que não poderia ser emendado de forma estruturada — suprimido ou modificado. Em proposição todos os dispositivos estão nascendo, e nada precisa ser protegido.

Isso elimina a pendência de `dispositivo-bloqueado` e a dúvida funcional que estava em aberto: o teste não precisa ser re-especificado, e sim **removido**. Feito na Etapa 0.

O recurso em si sai na Etapa 2. Ele tem alcance considerável — **26 arquivos** em `src/`:

- API pública: `DispositivoBloqueado` e `LexmlEtaParametrosEdicao.dispositivosBloqueados` (`lexml-eta.component.ts`)
- Modelo: `Dispositivo.bloqueado`, `Elemento.bloqueado`
- Regras: `isBloqueado` e `existeFilhoDesbloqueado` (`regrasUtil.ts`), usados nos 7 `regras*.ts`
- Reducers: `loadArticulacao.ts` (aplica o bloqueio), guardas em `atualizaElemento`, `atualizaTextoElemento`, `suprimeElemento` e `adicionaElementosNaProposicaoFromClipboard`
- Validação: `conteudoValidator.ts`, `dispositivoValidator.ts`
- UI: `eta-keyboard.ts`, `eta-clipboard.ts`, `eta-container-table.ts` e os seletores `[bloqueado='true']` em `editor.css.ts`
- E2E: `cypress/e2e/dispositivo-bloqueado/`

Dois pontos exigem verificação antes de remover, porque podem não ser bloqueio de emenda:

- `dispositivoLexmlFactory.ts` — `articulacao.bloqueado = !!texto`
- `numeracaoInciso.ts` — `this.bloqueado = true` (o comentário no código diz "Bloqueia e edição de emendas")

> **Executado com recorte menor** (commit `4322ff09`). Os dois pontos duvidosos foram verificados e
> **nenhum é bloqueio de emenda**: `createArticulacao` bloqueia articulação não estruturada vinda como
> texto livre, e `numeracaoInciso` bloqueia inciso com rótulo fora do padrão (`1º)`) — o comentário
> sobre emendas é enganoso. Como esses produtores sobrevivem, o campo `bloqueado`, `isBloqueado`,
> `existeFilhoDesbloqueado`, as guardas nos `regras*.ts` e o CSS **permanecem**.
>
> Saiu apenas a **entrada por parâmetro**: `bloqueiaDispositivos`/`getDispositivosBloqueados` em
> `loadArticulacao.ts` e o cenário `cypress/e2e/dispositivo-bloqueado/`. `DispositivoBloqueado` e
> `dispositivosBloqueados` seguem aceitos e marcados `@deprecated`, por decisão do usuário — logo,
> **não houve quebra de API**.

### 2.8 Especificação para os testes de movimentação e colagem

Definida com a equipe. A âncora de identidade passa a ser o **texto** do dispositivo, que sobrevive à reconstrução — não o `lexmlId` nem o `uuid`. Em ambos os casos, a validação se restringe aos **dispositivos envolvidos na operação**.

**Movimentação** — validar texto **e** estrutura dos dispositivos envolvidos. Ao mover o `art4` para cima:

- o antigo `art4` passa a ser `art3`, identificado pelo **texto**;
- toda a hierarquia acompanha o dispositivo movido: um filho que era `art4_inc1` passa a ser `art3_inc1`. Para isso, captura-se a estrutura **antes** da movimentação, ajustam-se os ids esperados e compara-se com a estrutura resultante;
- o antigo `art3` passa a ser `art4`, também identificado pelo texto;
- a **ordem** na articulação: sem agrupadores, os artigos são filhos diretos da `Articulacao`, então `art1` está no índice 0, `art2` no índice 1, e assim por diante.

**Colagem** — validar estrutura **e** renumeração dos dispositivos afetados. Ao colar um artigo após o `art2`, o colado vira `art3`, o antigo `art3` vira `art4`, e assim sucessivamente. O teste valida a renumeração de todos os dispositivos posteriores ao ponto de colagem e a ordem na articulação.

Os testes deixam de perguntar *"onde foi parar aquele dispositivo?"* e passam a perguntar *"a estrutura resultante está correta?"* — mais fiel à proposição, onde renumerar é a regra.

### 2.9 Especificação da revisão

Definida com a equipe. A revisão é **ortogonal à situação**: ela guarda dados e metadados do dispositivo afetado para permitir desfazer a mudança caso seja recusada. São cinco primitivas, e em todas **aceitar** apenas remove a revisão da lista — a articulação não muda.

| Primitiva | O que a revisão guarda | Rejeitar |
| --- | --- | --- |
| **Alteração de texto** | o texto anterior à revisão | devolve o texto anterior ao dispositivo |
| **Exclusão** | o dispositivo excluído | reinsere o dispositivo na posição em que estava |
| **Inclusão** | o registro da inclusão | remove o dispositivo da articulação |
| **Movimentação** | a posição anterior do dispositivo | devolve o dispositivo à posição original |
| **Transformação de tipo** | o tipo e a posição anteriores | reverte o dispositivo ao tipo original |

A transformação converte um dispositivo em outro tipo desde que a hierarquia permaneça coerente — um parágrafo em inciso, por exemplo. Como isso pode alterar o pai e a posição, o estado guardado precisa cobrir a hierarquia, não só o tipo.

Nada disso depende de `ORIGINAL`, `MODIFICADO` ou `SUPRIMIDO`. Em emenda, alterar o texto de um dispositivo original o transformava em `MODIFICADO` e a revisão se apoiava nisso; em proposição o dispositivo já é novo e continua novo — o que a revisão precisa guardar é apenas o **texto anterior**.

**Correção**: uma versão anterior deste plano listava `reducer-atualiza-revisao-dispositivo-modificado.test.ts` como candidato a remoção. Está errado — ele cobre a primitiva de **alteração de texto**, que é legítima em proposição. O arquivo deve ser re-*baselinado*, não removido.

Mapeamento dos 14 arquivos de `test/redux/revisao/`:

| Arquivo | Destino |
| --- | --- |
| `reducer-ativa-desativa-revisao` | migrar (só liga/desliga o modo) |
| `reducer-revisao` | migrar + re-*baseline* |
| `reducer-atualiza-revisao-dispositivo-modificado` | re-*baseline* como **alteração de texto** |
| `reducer-atualiza-revisao-dispositivo-inclusao` | re-*baseline* como **inclusão** |
| `reducer-atualiza-revisao-dispositivo-exclusao` | re-*baseline* como **exclusão** |
| `reducer-atualiza-revisao-dispositivo-movimentacao` | re-*baseline* como **movimentação** |
| `reducer-atualiza-revisao-dispositivo-transformado` | re-*baseline* como **transformação de tipo** |
| `reducer-aceita-revisao` | re-*baseline*: articulação intacta, revisão sai da lista |
| `reducer-rejeita-revisao` | re-*baseline*: desfaz conforme a primitiva |
| `reducer-rejeita-revisao-inclusao-undo-redo` | re-*baseline* (inclusão + undo/redo) |
| `reducer-rejeita-revisao-exclusao-undo-redo` | re-*baseline* (exclusão + undo/redo) |
| `reducer-revisao-inclusao-agrupador-undo-redo` | re-*baseline* (inclusão de agrupador) |
| `reducer-atualiza-revisao-dispositivo-suprimido` | **remover** — supressão não existe em proposição; o equivalente é exclusão, já coberta |
| `reducer-abrir-revisao-dispositivo-alterado-suprimido` | **remover** — carrega emenda com revisões de dispositivos alterados/suprimidos |

A suíte cobre exatamente as cinco primitivas, uma por arquivo de `atualiza-revisao-*`, mais os arquivos de aceitar, rejeitar e undo/redo. A especificação está completa.

**Regra adicional confirmada**: se o usuário redigitar exatamente o texto anterior, a revisão **desaparece da lista**. Isso já é implementado comparando o texto — `revisaoDeElementoComMesmoUuid2RotuloEConteudo` em `atualizaRevisao.ts` compara `lexmlId`, `rotulo` e `conteudo.texto`. O problema é que a chamada está **guardada** por uma comparação de situação:

```ts
if (revisao && revisao.elementoAntesRevisao?.descricaoSituacao === eAux.descricaoSituacao && revisaoDeElementoComMesmoUuid2RotuloEConteudo(revisao, eAux)) {
```

Em proposição a situação é constante, então a guarda deixa de discriminar e a decisão passa a se apoiar só no texto — que é exatamente o comportamento especificado. A guarda é resíduo de emenda e deve sair na Etapa 2.

### 2.10 A Etapa 1 depende de ajustes em `src/`

Ao migrar os 4 testes de revisão que não carregam emenda, o resultado foi **19 passaram, 26 falharam**. A maior parte das falhas é de asserções de situação — `expect(isModificado(d)).to.be.true` dentro de testes cujo nome trata de outra coisa —, mas há falhas genuinamente comportamentais:

```
Alterando texto fora do modo de revisão, ativando revisão, restaurando texto
  → Deveria possuir 1 revisão      expected 0 to equal 1
  → texto esperado 'menor aprendiz;'   veio 'texto modificado;'
```

Esse cenário só fazia sentido em emenda: editar fora da revisão tornava o dispositivo `MODIFICADO`, e restaurar o texto em modo revisão gerava uma revisão porque mudava a situação de volta para `ORIGINAL`. Em proposição não há "texto original" — editar fora da revisão é só editar.

**Consequência para o sequenciamento**: a Etapa 1 não fecha apenas com mudanças em testes, como o plano supunha. Ou os resíduos de situação em `atualizaRevisao.ts` e `rejeitaRevisao.ts` saem antes, ou os testes de revisão só ficam verdes depois da Etapa 2. A segunda opção é mais simples: **mover a Etapa 1 para depois da Etapa 2**, deixando a remoção do trio como próximo passo.

## 3. Por que o trio, e não apenas supressão e modificação

`ORIGINAL` é a raiz dos outros dois e precisa sair junto. Mantê-lo enquanto se removem seus sucessores deixaria um estado que nunca transiciona e cujo `getAcoesPermitidas` (`dispositivoOriginal.ts`) retira `AgruparElemento`, `RemoverElemento`, `Mover*`, `TransformarElemento`, `RenumerarElemento` e `InformarNorma` — e acrescenta justamente `suprimirElementoAction`, que estaria sendo removida. O resultado seria um dispositivo quase inerte.

Na ordem inversa é trivial: sem `ORIGINAL`, `MODIFICADO` e `SUPRIMIDO` ficam órfãos por construção.

## 4. Correção em relação ao Plano A

O Plano A manda "remover `aplicaAlteracoesEmenda.ts` / `aplicarAlteracoesEmenda.ts` / `setDispositivosERevisoesEmenda()`". **Isso quebraria o carregamento de revisões.**

O reducer tem quatro ramos; três são mortos (`dispositivosSuprimidos`, `dispositivosModificados`, `dispositivosAdicionados`), mas o quarto — `if (action.revisoes?.length) → processaRevisoes(...)` — é o **único caminho vivo** e é acionado por `lexml-eta.component.ts` via `setDispositivosERevisoesEmenda(proposicao.revisoes)`.

Tratamento correto: podar os três ramos mortos e **preservar** o de revisões, renomeando o reducer e a *action* para algo honesto (`aplicaRevisoes` / `aplicarRevisoesAction`).

## 5. A suíte de testes é o verdadeiro centro de custo

Levantamento do segundo argumento de `buildProjetoNormaFromJsonix(doc, emendamento)` nos testes:

| Modo de carregamento | Arquivos |
| --- | --- |
| `true` — emenda | **46** |
| `false` ou default — proposição | **10** |

A suíte exercita funcionalidades de **proposição** — agrupar, colar, mover, remover, paginar, validar — através de fixtures carregadas em **modo emenda**. O caso mais explícito é `test/redux/agrupa/agrupa-artigos-proposicao/`, que tem "proposicao" no nome e carrega `MPV_905_2019, true`.

Duas consequências:

1. **A rede de segurança é mais fraca do que aparenta.** A suíte verde hoje diz pouco sobre a corretude da proposição, porque valida um modo que está sendo removido.
2. **Reforça a premissa da seção 2**: os três estados praticamente só existem nos testes.

O trabalho real, portanto, não é apagar código em `src/` — é migrar esses 46 arquivos e re-*baselinar* expectativas. É lá que a descoberta de comportamento acontece, e por isso ela foi movida para o **início** do plano.

### 5.1 Inventário dos 46 arquivos

| Grupo | Arquivos | Tratamento |
| --- | --- | --- |
| `test/redux/aplicaEmenda/` | 6 | **Remover** — cenário genuíno de emenda |
| `test/redux/dispositivo-bloqueado/` | 1 | **Remover** — bloqueio é conceito de emenda (seção 2.7) |
| `test/redux/revisao/` | 14 | Re-*baseline* (Etapa 1, isolada) |
| `test/redux/agrupa/` | 11 | Migrar + re-*baseline* |
| `test/redux/colar/` | 7 | Migrar + re-*baseline* |
| `adiciona`, `atualiza`, `mover`, `remove`, `paginacao`, `valida` | 7 | Migrar + re-*baseline* |

Asserções a revisar: ~108 sobre `isOriginal` / `isModificado` / `isSuprimido` (5 arquivos) e ~63 sobre as strings `'Dispositivo Original'` / `'Dispositivo Modificado'` / `'Dispositivo Suprimido'` (15 arquivos).

---

## 6. Etapas

### Etapa 0 — Migrar a suíte para modo proposição (32 arquivos)

Objetivo: antecipar toda a descoberta de comportamento **antes** de tocar em `src/`. Nada é apagado de `src/` aqui.

1. Remover `test/redux/aplicaEmenda/*` (6 arquivos) e `test/doc/emendas/*` — cenários genuínos de emenda, sem equivalente em proposição.
2. Para cada um dos 32 arquivos restantes fora de `test/redux/revisao/`, trocar `buildProjetoNormaFromJsonix(DOC, true)` por `false` e rodar **apenas aquele arquivo**.
3. Triar cada resultado:

   | Resultado | Significado | Ação |
   | --- | --- | --- |
   | Passa | não dependia de estado de emenda | migrado |
   | Falha com expectativa deslocada | a proposição se comporta diferente ali | re-*baseline* consciente, registrando o porquê |
   | Falha estruturalmente | é teste de emenda disfarçado | remover |

4. Substituir as asserções sobre `isOriginal` / `isModificado` / `isSuprimido` e sobre as strings de situação pelo que passa a valer em proposição.

**Critério de saída**: nenhum arquivo fora de `test/redux/revisao/` carrega documento com `emendamento = true`, e `npm test` está verde.

### Etapa 1 — Re-*baselinar* os testes de revisão (14 arquivos)

Isolada por ser o maior bolso do trabalho. A revisão **é mantida**, mas hoje é testada inteiramente sobre a máquina de estados `ORIGINAL → MODIFICADO / SUPRIMIDO`. Em proposição ela passa a significar "controle de alterações sobre dispositivos novos".

5. Migrar os 14 arquivos de `test/redux/revisao/` para `emendamento = false`, seguindo o mapeamento da seção 2.9.
6. Re-*baselinar* as asserções conforme as três primitivas — alteração de texto, exclusão e inclusão — verificando, em cada caso, o que a revisão guarda e o que acontece ao aceitar e ao rejeitar.
7. Remover `reducer-atualiza-revisao-dispositivo-suprimido.test.ts` e `reducer-abrir-revisao-dispositivo-alterado-suprimido.test.ts` — cobrem cenários que deixam de existir.
8. Apagar `test/doc/emendas/`, que deixa de ter importadores ao fim desta etapa.

**Critério de saída**: `npm test` e `cypress/e2e/revisao` verdes, sem nenhuma referência aos três estados nos testes.

### Etapa 2 — Remover `ORIGINAL`, `MODIFICADO` e `SUPRIMIDO` de `src/`

Com as Etapas 0 e 1 concluídas, esta etapa é mecânica: a suíte já prova que ninguém depende dos três estados.

8. Remover a flag `emendamento` de `ArticulacaoParser.load()` e `isEmendamento` de `buildProjetoNormaFromJsonix.ts`.
9. Apagar `dispositivoOriginal.ts`, `dispositivoModificado.ts` e `dispositivoSuprimido.ts`.
10. Apagar os helpers `isOriginal`, `isModificado`, `isSuprimido`, `isModificadoOuSuprimido`, `isAntesDoPrimeiroDispositivoOriginal`, `hasIrmaoOriginalDepois`, `isSituacaoExclusivaDispositivoEmenda`, `isDispositivoEmenda`, `isAlteracaoIntegral` e o campo `dispositivoOriginal` de `TipoSituacao`. Simplificar cada ramo tratando o predicado como sempre-falso.
11. Remover as ações e reducers de supressão: `suprimirElemento.ts`, `suprimirAgrupador.ts`, `restaurarElemento.ts`, `suprimeElemento.ts`, `suprimeAgrupador.ts`, `restauraElemento.ts` e suas entradas em `acao/index.ts`, `elementoReducer` e `ActionType`.
12. Podar os três ramos mortos de `aplicaAlteracoesEmenda.ts`, **preservando** `processaRevisoes`; renomear reducer e *action* para `aplicaRevisoes` / `aplicarRevisoesAction` (ver seção 4). Remover os tipos `DispositivosEmenda` / `DispositivoEmenda*` de `src/model/emenda/emenda.ts` que ficarem órfãos.
13. Em `undoRedoReducerUtil.ts`, reduzir `getTipoSituacaoByDescricao` aos casos `NOVO` e `ADICIONADO`; simplificar `restaurarSituacao` e `processaSituacoesAlteradas`.
14. Limpar os ramos de `SUPRIMIDO` / `MODIFICADO` em `atualizaRevisao.ts` e `rejeitaRevisao.ts`, **preservando** a lógica de revisão; simplificar `atualizaTextoElemento.ts`, `atualizaElemento.ts` e `atualizaReferenciaElemento.ts` (a transição `ORIGINAL → MODIFICADO` desaparece).
15. Remover `adicionaDiffMenuOpcoes.ts`, o bloqueio por `SUPRIMIDO` em `eta-keyboard.ts` e as classes `.dispositivo--modificado` / `.dispositivo--suprimido` em `src/assets/css/editor.css.ts`.
16. Remover a verificação `'Dispositivo Original'` em `montaEMostraMensagensErro()` (`acaoUtil.ts`) e o motivo `MotivosOperacaoNaoPermitida.ORIGINAL` em `regrasUtil.ts`.
17. Remover o recurso de **dispositivo bloqueado** nos 26 arquivos listados na seção 2.7, verificando antes os dois pontos duvidosos (`dispositivoLexmlFactory.ts` e `numeracaoInciso.ts`).

**Resultado**: `DescricaoSituacao` fica com `NOVO` e `ADICIONADO`. O que sobra deixa de ser controle de estado de emenda e passa a ser apenas um marcador de "está em bloco de alteração" — redundante com `isDispositivoAlteracao`, mas inofensivo e estável.

---

## ⬛ PONTO DE PARADA

> **Ultrapassado.** A Etapa 2 foi concluída e o ponto de parada, avaliado. A Etapa 3 seguiu por ser
> mecânica, e a Etapa 4 começou por outro motivo que não o refactor: os testes manuais revelaram que
> boa parte dos pontos remanescentes são **bugs em produção**, não redundância inofensiva.

A demanda original — *remover o controle de situação de dispositivo (suprimido e alterado)* — está atendida aqui, com `ORIGINAL` de brinde. O componente é publicável neste estado, e a suíte passa a cobrir de fato o modo proposição — um ganho que independe do resto do plano.

As etapas seguintes tratam de **eliminar a redundância restante**. São desejáveis, mas não urgentes, e a Etapa 4 é a única do trabalho inteiro que mexe em comportamento vivo de proposição. Recomenda-se rodar a Etapa 2 em produção antes de decidir.

---

### Etapa 3 — Desacoplar `existeNaNormaAlterada` (pré-requisito da Etapa 4)

> **Correção**: uma versão anterior mandava mover os dois campos para a interface `BlocoAlteracao`.
> **Está errado** — ambos são atributos de **cada dispositivo**, não do bloco:
>
> - `informaExistenciaDoElementoNaNorma.ts` tem dois ramos: mudar de "existente" para "novo" propaga
>   o valor ao dispositivo **e a cada filho**; o sentido inverso altera **só o dispositivo**. Os ramos
>   só fazem sentido se dispositivos do mesmo bloco puderem divergir;
> - `verificaNaoPrecisaInformarSituacaoNormaVigente` (`hierarquiaUtil.ts`) lê o valor do **pai** e o
>   compara com o do filho, subindo a hierarquia;
> - `validaAlteracaoNovoParaExistente` proíbe marcar um dispositivo como "existente" quando um
>   superior é "novo" — regra vazia se o valor fosse único por bloco.
>
> `tipoEmenda` idem: é gravado por dispositivo (`adicionaElemento.ts`, `agrupaElemento.ts`,
> `parserReferenciaDispositivo.ts`) e lido em `numeracaoAgrupador.createRotulo`, que não tem acesso
> ao `state` — precisa seguir alcançável a partir do próprio dispositivo.

17. Mover `existeNaNormaAlterada?: boolean` de `DispositivoAdicionado` para a interface `Dispositivo` em `src/model/dispositivo/dispositivo.ts`.
18. Mover `tipoEmenda` para a mesma interface, renomeado para `classificacaoDocumento`.
19. Atualizar os pontos de leitura/escrita, hoje feitos via cast `(d.situacao as DispositivoAdicionado)`: `elementoUtil.ts`, `hierarquiaUtil.ts`, `parserReferenciaDispositivo.ts`, `numeracaoAgrupador.ts`, os 6 `regras*.ts` que oferecem `considerarElementoNovoNaNorma`, `adicionaAlteracaoComAssistente.ts`, `adicionaElemento.ts`, `adicionaElementosFromClipboard.ts`, `agrupaElemento.ts`, `autoFixElemento.ts`, `informaExistenciaDoElementoNaNorma.ts`, `undoRedoReducerUtil.ts`.

### Etapa 4 — Colapsar `ADICIONADO` em `NOVO` *(em andamento)*

> **O risco previsto não se confirmou como esperado.** O passo 21 dizia que o filtro de
> `AgruparElemento` "não é preservado", tratando isso como decisão pendente. O impasse se dissolveu:
> as opções de agrupamento por tipo eram redundantes com "Adicionar Título, Capítulo, Seção e outros"
> e foram removidas (`14b3a1f0`). Sem elas, o filtro ficou sem nada para filtrar, e
> `DispositivoAdicionado` hoje é **idêntica** a `DispositivoNovo` — só carrega um rótulo diferente.
> Apagá-la deixou de mudar comportamento.

20. Reavaliar **caso a caso** cada comparação `=== DISPOSITIVO_ADICIONADO` e `=== DISPOSITIVO_NOVO`. Parte vira `isDispositivoAlteracao(d)`, parte vira constante — ver a ressalva na seção 2.2.

| Local | Estado |
| --- | --- |
| `podemSerRenumerados` (`hierarquiaUtil.ts`) | removida — estava sem chamador |
| `calculaSequencialOmissis` (`idUtil.ts`) | feito — numera pela posição entre os irmãos |
| `podeRenumerar` (`numeracaoUtil.ts`) | feito — usa `existeNaNormaAlterada` |
| os 7 `regras*.ts` | feito — extraído para `adicionaAcoesDeExistenciaNaNorma` |
| `getClasseCSS` (`eta-blot-rotulo.ts`) | feito |
| `eta-quill-util.ts` | parcial — o selo de existência foi resolvido; as aspas de abertura, não |
| `podeEditarNotaAlteracao` (`elementoUtil.ts` e `hierarquiaUtil.ts`) | pendente — suspeita de impedir a edição do "(NR)" em bloco carregado |
| `podeInformarNumeracao` (`eta-blot-rotulo.ts`) | pendente — suspeita de impedir a numeração pelo rótulo |
| `adicionaElemento.ts`, `agrupaElemento.ts` | pendentes — só gravam `existeNaNormaAlterada` se `ADICIONADO` |
| `numeracaoAgrupador.ts`, `tipoArticulacao.ts`, `eventosUtil.ts` | pendentes |
| `verificaNaoPrecisaInformarSituacaoNormaVigente` (`hierarquiaUtil.ts`) | pendente |
| `atualizarLexmlIdEmElementosDeRevisoes` (`atualizaRevisao.ts`) | pendente — filtra revisões por `ADICIONADO`; em documento carregado o filtro esvazia e os `lexmlId` das revisões não são atualizados |
| `getDispositivosAdicionados`, `hasDispositivosBySituacao`, bloco no-op de `conteudoValidator.ts` | removidos — eram código morto |

21. Apagar `dispositivoAdicionado.ts`.

### Etapa 5 — Remover o campo `situacao`

22. Extrair a lógica de `DispositivoNovo.getAcoesPermitidas` para um helper puro em `acaoUtil.ts` — `filtrarEOrdenarAcoes(acoes: ElementoAction[]): ElementoAction[]`, sem o parâmetro `dispositivo` (que a implementação unificada não usa). Trocar as 9 chamadas no fim de cada `getAcoesPossiveis` das `regras*.ts`.
23. Remover o mixin `SituacaoDispositivo` dos 8 tipos em `dispositivoLexmlFactory.ts`.
24. Remover `Situacao` de `dispositivo.ts`; apagar `src/model/dispositivo/situacao.ts` e a pasta `src/model/lexml/situacao/`.
25. Remover `descricaoSituacao` de `elemento.ts` e de `Referencia`; ajustar `atualizarSituacao()` em `editor.component.ts` e o *getter*/*setter* em `eta-container-table.ts`.

### Etapa 6 — Limpeza final

26. Ajustar os testes afetados pelas Etapas 4–5 (`test/model/numeracao`, `test/redux/{undo,transforma}`) — bem menor que as Etapas 0–1, pois a maior parte já foi migrada.
27. Decidir sobre `cypress/e2e/abrir-emenda` e `nova-emenda` (portar para fixtures de proposição ou descartar).

## 7. Risco por etapa

| Etapa | O que toca | Risco | Reversível |
| --- | --- | --- | --- |
| 0 — migrar a suíte (32 arq.) | só testes | **Baixo**, mas é onde o esforço se concentra | Sim, arquivo a arquivo |
| 1 — re-*baselinar* revisão (14 arq.) | só testes | **Médio** — exige redefinir o que revisão significa | Sim, arquivo a arquivo |
| 2 — remover o trio | caminho morto em `src/` | **Baixo** (volume alto, comportamento nulo) | Sim |
| 3 — desacoplar campo | blocos de alteração | Baixo, mecânico | Sim |
| 4 — colapsar `ADICIONADO` | numeração, rótulo, id, "(NR)", CSS | **Alto** | Difícil |
| 5 — remover o campo | tudo, mas mecânico | Baixo | Sim |
| 6 — limpeza | suíte | Baixo | Sim |

Duas observações sobre a ordem:

- No Plano A, a Fase 1 (equivalente à Etapa 3 aqui) abre o trabalho mexendo em **código vivo**. Aqui ela foi movida para depois do ponto de parada, porque `existeNaNormaAlterada` vive em `DispositivoAdicionado`, que sobrevive intacto à Etapa 2 — ou seja, só é pré-requisito da Etapa 4.
- No Plano A, a adaptação dos testes é a **última** fase. Aqui ela é a **primeira**, porque a suíte atual não cobre o modo proposição (seção 5) e portanto não serve de rede de segurança para as etapas seguintes.

## 8. Verificação

1. `npm run build` (tsc) ao fim de cada etapa — o compilador guia a maior parte da cascata em `src/`.
2. Nas Etapas 0 e 1, rodar **por arquivo** durante a migração e `npm test` completo ao fechar a etapa.
3. `npm run lint` antes de fechar cada etapa.
4. Cypress: `paginacao` e `revisao` devem passar sem alteração funcional. `cypress/e2e/dispositivo-bloqueado` é removido junto com o recurso (seção 2.7).
5. Ao fim da Etapa 2, teste manual do **carregamento de revisões** (o ramo vivo do reducer podado) e do fluxo completo de proposição no demo: criar do zero, adicionar, renumerar, mover, transformar, agrupar, *undo*/*redo*.
6. Ao fim da Etapa 4, teste manual adicional de bloco de alteração: assistente, alternar "considerar elemento novo/existente na norma", nota "(NR)", aspas, edição de rótulo, numeração de *omissis*.
7. *Round-trip* de serialização: abrir `demo/doc/pl_4_2025.json`, editar e reexportar — o XML deve bater com o *baseline*, já que a situação nunca foi serializada.

## 9. Versionamento

- **Etapas 0–1**: só testes, nada a publicar.
- **Etapa 2**: as ações Suprimir/Restaurar somem do menu e `setDispositivosERevisoesEmenda` foi renomeada para `setRevisoes` → *breaking change*, **major**. O bloqueio por parâmetro **não** entrou na conta: foi depreciado, não removido.
- **Etapas 4–5**: alteram tipos exportados (`Elemento.descricaoSituacao`) → outro **major**, se publicadas separadamente.

Se a intenção for concentrar a quebra em uma única versão, vale executar 2–5 antes de publicar. Se a prioridade for reduzir risco, publique após a Etapa 2 e trate o resto como ciclo seguinte.

## 10. Pontos em aberto

1. **`existeNaNormaAlterada` não é persistido.** Nem `buildJsonixFromProjetoNorma` grava, nem
   `buildProjetoNormaFromJsonix` lê. Ao reabrir um documento, perde-se a distinção entre dispositivo
   que existe na norma e dispositivo novo — e com ela a regra de renumeração dos filhos e o selo
   "Existente"/"Novo". Como paliativo, o usuário pode informar o valor pelo menu (`04db5831`).
   **A ser discutido com a equipe**: gravar no XML ou derivar do complemento no id (`art60-1`).
2. **Aspas de abertura** (`eta-quill-util.ts`): a condição `elemento.abreAspas || isDispositivoAlteracaoAdicionado`
   abriria aspas em todo dispositivo adicionado do bloco, não só na cabeça. Hoje está inerte em
   documentos carregados; verificar se produz aspas indevidas nos criados durante a sessão.
3. **`StateType.SituacaoElementoModificada`** segue como evento genérico de "redesenhar elemento" (ementa, nota de alteração, aspas). Renomear para `ElementoAtualizado` na Etapa 5?
4. **Fixtures nascidas como proposição**: as atuais (`MPV_905_2019`, `MPV_885_2019` etc.) continuam válidas como documentos. Confirmar se convém acrescentar outras.
5. **Pendências fora do escopo, não commitadas**: `substituiAspasRetasPorCurvas` desativada em
   `buildProjetoNormaFromJsonix.ts` e `web-test-runner.config.mjs` ajustado localmente.

### Resolvidos ao longo da execução

- **Re-*baseline* de revisão**: as cinco primitivas foram definidas com a equipe (seção 2.9) e os 12 arquivos, reescritos.
- **`setDispositivosERevisoesEmenda`**: renomeada para `setRevisoes`, por decisão do usuário.
- **Agrupamento dentro de bloco de alteração**: deixou de ser questão — as opções de agrupamento por tipo eram redundantes e foram removidas.
- **Divergência entre reabrir e usar o assistente**: continua, e é exatamente o que torna visíveis os bugs de resquício; some quando a Etapa 4 terminar.
