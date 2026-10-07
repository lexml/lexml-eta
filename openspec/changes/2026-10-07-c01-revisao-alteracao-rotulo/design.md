# Design

## Context

Ver proposal.md (Why). Fatos do estado atual, confirmados no código e por um teste descartável com a MPV 1234/2024 (parágrafo `art1_cpt_alt1_art4_par4-1`, "§ 4º-A", com um inciso, criado antes do modo de revisão):

- **Caminho da renumeração manual:** `RENUMERAR_ELEMENTO` só é permitido em alteração de norma. Hoje `podeRenumerar` também o nega para dispositivo marcado como "Existente" na norma alterada (`existeNaNormaAlterada`), e as regras de cada tipo o omitem quando o pai é "Novo" (filhos numerados automaticamente). `renumeraElemento.ts` troca número, rótulo e id (do dispositivo e, se artigo, do caput) e emite `ElementoModificado` para o dispositivo; não emite `ElementoRenumerado` (esse evento é da renumeração automática dos irmãos, que `atualizaRevisao.ts` não processa).
- **Produtor atual:** `processaEventosDeModificacao` trata esse `ElementoModificado` como qualquer modificação. Dispositivo pré-existente: cria uma revisão `ElementoModificado` com `revisao = "alterado"`, `antes` com o id e o rótulo antigos (`par4-1`, "§ 4º-A.") e `apos` com os novos (`par4-2`, "§ 4º-B."). Dispositivo criado na sessão de revisão: a revisão `adicionado` absorve a mudança. Renumerar de volta ao original remove a revisão, porque `revisaoDeElementoComMesmoUuid2RotuloEConteudo` já compara o rótulo.
- **Rejeitar:** `rejeitaModificacao` só chama `atualizaTextoElemento` com o snapshot `antes`; rótulo, número e id **não** são restaurados (o dispositivo continuou `par4-2`, "§ 4º-B."). Aceitar só remove a marca.
- **Ids dos descendentes:** após renumerar, o inciso filho ficou com `art1_cpt_alt1_art4_par4-1_inc[sn:16]` sob o pai `par4-2`: o id dos descendentes não é recalculado.
- **Remissões:** `RENUMERAR_ELEMENTO` e `REJEITAR_REVISAO` já pertencem a `ACOES_ESTRUTURAIS` em `sincronizarRemissoesPosAcao.ts`, então a sincronização das remissões já roda nas duas ações.
- **Persistência (change anterior):** `revisao` é uma string `operacao(","operacao)*` em `RevisaoElemento`; salvar grava o parágrafo de conteúdo anterior só quando há `alterado`; o leitor descarta operações desconhecidas (inclui `alteracaoRotulo`) e `reconstroiRevisoes.ts` monta os snapshots `antes`/`apos` a partir do arquivo.
- **Formato:** `alteracaoRotulo;<idOriginal>` em `docs/extensao-formato-lexml/11-revisao-da-hierarquia.md`; em alteração de norma o sufixo de encaixe no rótulo é letra (`par4-1` corresponde a "§ 4º-A"), embora o id use número.

## Goals / Non-Goals

**Goals:**
- Permitir renumerar manualmente também o dispositivo "Existente" em alteração de norma, sem alterar o selo.
- A renumeração manual em revisão produz `alteracaoRotulo;<idOriginal>`, combinável com as demais operações, reconciliada quando revertida, e rejeitável com restauração real de número, rótulo e ids.
- Os ids dos descendentes acompanham toda renumeração, com ou sem revisão.
- Salvar e abrir a operação sem perda na ida e volta, inclusive pelo `jsonix-lexml` real.

**Non-Goals:**
- O "Problema identificado" de `11-revisao-da-hierarquia.md` (desfazer transformação sem excluir dispositivo subsequente).
- Revisão para a renumeração automática dos irmãos (`ElementoRenumerado`).
- Migrar arquivos já salvos em que a renumeração foi gravada como `alterado`: continuam abrindo como estão.

## Decisions

### 1. Operação armazenada em `revisao`, argumento = id anterior à primeira renumeração

`alteracaoRotulo` é mais uma operação do atributo `revisao`, com a mesma regra das demais: não se repete, e o argumento é o da primeira ocorrência (o id **antes da primeira renumeração**, não da última). Constante `OPERACAO_ALTERACAO_ROTULO` em `revisaoUtil.ts`.

### 2. Produtor em `processaEventosDeModificacao`

O gatilho é a modificação em que o rótulo do dispositivo muda entre o elemento anterior (`getElementoAntesModificacao`) e o novo, com o mesmo tipo. Só `RENUMERAR_ELEMENTO` (e o desfazer/refazer dela) produz esse caso em `ElementoModificado`; movimentação e transformação chegam como `ElementoIncluido`/`ElementoRemovido`, cujo rótulo muda por natureza e não deve gerar `alteracaoRotulo`.
- **Sem revisão prévia:** a revisão nasce com as operações derivadas do evento (`alteracaoRotulo;<antes.lexmlId>` se o rótulo mudou; `alterado` se o texto mudou), em vez do `alterado` fixo de hoje.
- **Com revisão prévia (inclusive movida ou transformada):** anexa `alteracaoRotulo;<id antes desta renumeração>` quando o rótulo mudou, ao lado do `alterado` já tratado, sem repetir.
- **Dispositivo `adicionado`:** inalterado; a inclusão absorve a mudança.

`derivarOperacoesRevisao` (revisões vindas de `Proposicao.revisoes`, sem o atributo) passa a distinguir rótulo de texto no caso `ElementoModificado`.

### 3. Reconciliação por identificador

`reconciliarOperacoesRevisao` descarta `alteracaoRotulo;<id>` quando o `lexmlId` atual do dispositivo é igual a `<id>`. Comparar o id (e não só o rótulo) evita falsos descartes em dispositivos movidos ou transformados, cujo rótulo difere do original por outra causa. Sem operações restantes, a revisão e as associadas já são removidas pelo caminho existente.

### 4. Rejeitar restaura número, rótulo e ids

`rejeitaModificacao` passa a tratar `alteracaoRotulo` antes do texto: obtém o dispositivo atual, devolve `numero` do snapshot `antes`, recalcula o rótulo (`createRotulo`) e os ids do dispositivo e dos descendentes (`updateIdDispositivoAndFilhos`), e só então aplica a restauração do texto quando houver `alterado`. Os eventos devolvidos incluem o dispositivo e os descendentes para o editor redesenhar rótulos e ids. A sincronização das remissões já é feita pela ação `REJEITAR_REVISAO`. A rejeição entra no histórico (`montarEventosDeModificacaoParaHistorico`) como as demais modificações.

### 5. Ids dos descendentes recalculados na renumeração

`renumeraElemento.ts` troca a atribuição manual de `id` (dispositivo e caput) por `updateIdDispositivoAndFilhos(dispositivo)`, que já cobre o caput, o bloco de alteração e todos os descendentes. Vale para todas as renumerações, com ou sem revisão (decisão do usuário). Os elementos dos descendentes entram no evento emitido para que as linhas do editor, as revisões de descendentes (`elementoAposRevisao.lexmlId`) e os `refIdDispositivo` salvos não fiquem com o id antigo.

### 6. Descrição da marca

`buildDescricaoRevisaoFromStateType` (e o ramo por `actionType`) passa a ler `revisao`: só `alteracaoRotulo` descreve "Rótulo do dispositivo foi alterado (antes era "§ 4º-A")"; combinada com `alterado`, cita os dois. O rótulo anterior sai do snapshot `antes`.

### 7. Salvar

`montaRevisaoDeDispositivo` já grava `revisao` e só inclui o parágrafo anterior quando há `alterado`; o leitor passa a **reconhecer** `alteracaoRotulo` (argumento obrigatório e não vazio), em `lerRevisoesArticulacao`. Nenhuma mudança de esquema: `revisao` é `xsd:string` em `lexedit.xsd`.

### 8. Abrir

`reconstroiRevisoesDeDispositivo` ganha o ramo de `alteracaoRotulo`, hoje inexistente: o snapshot `antes` recebe `lexmlId = <idOriginal>`, `numero` e `rotulo` derivados do id. A derivação usa uma sonda temporária do mesmo tipo e pai, aplicando o número do último segmento do id e `createRotulo` (que em alteração de norma converte o complemento numérico em letra: `4-1` vira "§ 4º-A"). Id que não corresponde ao tipo do dispositivo descarta a revisão, sem impedir as demais. A combinação com `alterado` reaproveita o texto anterior do `p`.

### 9. Desfazer e refazer da renumeração restauram número, rótulo e ids

Achado da spike 1.1: hoje desfazer a renumeração **não** devolve o rótulo (ver tabela abaixo). `renumeraElemento.ts` grava no `past` um evento com um só elemento, o anterior (`buildUpdateEvent(dispositivo)` antes da troca), e `processarModificados` (`undoRedoReducerUtil.ts`) só restaura texto, `existeNaNormaAlterada` e nota de alteração. A correção segue o padrão do texto (`[valor do UNDO, valor do REDO]`): o `past` passa a guardar `[antes, depois]`, e `processarModificados` aplica número, rótulo e ids (do dispositivo e dos descendentes, com `updateIdDispositivoAndFilhos`) quando o snapshot difere do dispositivo atual. Os descendentes também são emitidos em `SituacaoElementoModificada`. É o que sustenta o requisito "Reversão da renumeração remove a operação" (desfazer) da spec `renumeracao-dispositivo`.

### 10. Renumerar dispositivo existente na norma alterada

O usuário precisa poder corrigir o rótulo de um dispositivo "Existente" (ex.: o § 1º do art. 3º indicado por engano em vez do § 2º). Os bloqueios, confirmados no código:
- `podeRenumerar` (`numeracaoUtil.ts`) nega quando `isDispositivoAlteracao && existeNaNormaAlterada`; é o único ponto que produz o aviso "Nessa situação, não é possível renumerar o dispositivo" (o editor o chama antes de abrir o popup). A cláusula é removida; permanecem as guardas de estar em alteração de norma e de não ser omissis.
- As regras de cada tipo (`regrasParagrafo`, `regrasInciso`, `regrasAlinea`, `regrasItem`) já oferecem a ação quando o pai não é "Novo"; essa guarda fica, porque os filhos de um pai "Novo" são numerados automaticamente. `regrasArtigo` e `regrasAgrupadores` não têm guarda de existência.

O dispositivo renumerado continua com `existeNaNormaAlterada` e o selo "Existente": só o rótulo muda. A revisão segue o mesmo caminho das Decisões 1 a 4: um dispositivo existente renumerado em revisão gera `alteracaoRotulo;<idOriginal>`, o caso do exemplo da `11-revisao-da-hierarquia.md` (`art2_cpt_alt1_art3` para `art4`). A validação de numeração em alteração não muda: se o novo número exigir um omissis antes, o editor continua sugerindo o autofix.

### 11. Numeração automática só nos filhos de dispositivo novo

Achado em teste manual: o único parágrafo marcado como "Novo" sob um artigo "Existente", renumerado para `2`, virava "Parágrafo único.". Causa: `NumeracaoParagrafo.createRotulo` (`numeracaoParagrafo.ts`) testa `isDispositivoNovoNaNormaAlterada(dispositivo)` e, nesse caso, recalcula `informouParagrafoUnico` com `isParagrafoUnico(dispositivo)`, sobrescrevendo o número informado. O gatilho correto é o **pai** ser "Novo" (mesmo critério de `podeRenumerarFilhosAutomaticamente` e `renumeraFilhos`): o primeiro nível de um dispositivo "Novo" é numerado pelo usuário; só os filhos são automáticos. A correção troca o teste para `isDispositivoNovoNaNormaAlterada(dispositivo.pai)`, com guarda para pai indefinido. Só o parágrafo tem esse desvio; as demais classes de numeração não têm teste equivalente. Marcar um dispositivo como "Novo" não renumera (`informaExistenciaDoElementoNaNorma` só alterna o indicador).

## Resultados das spikes (tarefas 1.1 e 1.2)

Ambas sobre a MPV 1234/2024, parágrafo `art1_cpt_alt1_art4_par4-1`, com e sem modo de revisão.

| Ação | Hoje | Ponto de código | Mudança desta change |
|---|---|---|---|
| Renumerar | Eventos `ElementoModificado` (só o renumerado) e `ElementoValidado` (irmãos). Id do inciso filho fica `..._par4-1_inc[sn:..]` | `renumeraElemento.ts` | Recalcular ids dos descendentes; emiti-los em `SituacaoElementoModificada` (o editor atualiza o `lexmlId` da linha em `EtaContainerTable.atualizarElemento`, e `atualizaRevisao.ts` só processa `ElementoModificado`, então não nasce `alterado`) |
| Desfazer | Texto restaurado, mas rótulo, número e ids permanecem (`par4-2`, "§ 4º-B."). Em revisão, a revisão some e o rótulo continua trocado | `undo.ts` → `processarModificados` | Decisão 9 |
| Refazer | Sem efeito sobre o rótulo; em revisão a revisão reaparece | `redo.ts` → `processarModificados` | Decisão 9 |
| Rejeitar | Revisão removida; rótulo e id não voltam | `rejeitaRevisao.ts` | Decisão 4 |
| Aceitar | Só remove a marca | `aceitaRevisao.ts` | Nenhuma |

Derivação do rótulo a partir do id (spike 1.2): o número gravado no último segmento do id é o próprio `numero` do dispositivo (`par4-1`, `inc2-2`, `ite3-4`), e `createRotulo` com esse número reproduz o rótulo que o dispositivo ganhou na renumeração real em parágrafo (`4-1` vira "§ 4º-A."), inciso ("II-B –") e item ("3-D."). Não houve caso divergente. Não verificados: alínea (a renumeração testada com `c-C` não foi aceita pelo editor, então não gerou comparação) e agrupadores; a derivação reaproveita a mesma `createRotulo`, e os testes da tarefa 4.2 cobrem esses dois tipos.

## Risks / Trade-offs

- **[Risco] Mensagens de numeração após renumerar um dispositivo existente.** O validador de alteração pode apontar omissis antes ou número fora de ordem; é o comportamento já existente para qualquer renumeração, mas passa a aparecer em dispositivos "Existente". Cobrir com teste de reducer e confirmar que a renumeração não é bloqueada por elas.
- **[Risco] Dispositivos "Novo" sob pai "Existente" que dependiam do "único" automático (Decisão 11).** Cobrir com testes de adicionar, remover e validação de numeração.
- **[Risco] Eventos dos descendentes em `ElementoModificado` criariam revisões `alterado` indevidas.** Os descendentes devem ser emitidos por um evento que `atualizaRevisao.ts` não processa (como `ElementoRenumerado` ou `SituacaoElementoModificada`). Verificar na spike da tarefa 1.1 qual evento atualiza o id das linhas do editor sem gerar revisão.
- **[Risco] Desfazer e refazer.** Hoje o `past` da renumeração guarda o elemento anterior; é preciso mapear como `undo.ts` e `redo.ts` restauram rótulo, número e ids (e se o estado de `revisao` volta coerente), e registrar no `design.md`. A reconciliação por id (Decisão 3) cobre o caso comum, mas a spike confirma.
- **[Risco] Revisões de descendentes com `lexmlId` desatualizado.** Descendentes com revisão própria (ex.: um inciso adicionado na sessão) guardam `elementoAposRevisao.lexmlId`; precisam ser atualizados na renumeração, senão o `refIdDispositivo` salvo aponta para um id que não existe mais.
- **[Risco] Derivação do rótulo a partir do id.** Cobre artigo, parágrafo, inciso, alínea e item; agrupadores renumerados também usam `RENUMERAR_ELEMENTO` (`regrasAgrupadores`) e entram no mesmo caminho. A spike deve confirmar o rótulo de cada tipo, incluindo "único" e sufixos com mais de uma letra.
- **[Trade-off] Arquivos antigos.** Documentos já salvos com a renumeração gravada como `alterado` abrem como antes (rejeitar restaura só o texto, que é idêntico). Não há migração.
- **[Trade-off] Combinar por id e não por rótulo** exige guardar o id original como argumento, que a especificação já define; o custo é recalcular o id dos descendentes em toda renumeração (Decisão 5), aceito pelo benefício geral.
