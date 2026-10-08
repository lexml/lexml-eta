# Proposal

## Why

Em alteração de norma, o usuário pode renumerar manualmente um dispositivo (`RENUMERAR_ELEMENTO`, ex.: "§ 4º-A" para "§ 4º-B"). Hoje, porém, o editor nega a ação em dispositivo marcado como "Existente" na norma alterada ("Nessa situação, não é possível renumerar o dispositivo"), o que impede corrigir um engano comum: indicar o § 1º do art. 3º quando o correto era o § 2º. Em modo de revisão, a renumeração permitida gera uma revisão `ElementoModificado` com `revisao = "alterado"`, mesmo sem mudança de texto, o que registra a operação errada e grava no arquivo um conteúdo anterior idêntico ao atual. Além disso, **rejeitar essa revisão não devolve o rótulo, a numeração e o id anteriores**: a marca some e o dispositivo continua renumerado (comportamento confirmado por teste descartável com a MPV 1234/2024). A especificação `docs/extensao-formato-lexml/11-revisao-da-hierarquia.md` define a operação `alteracaoRotulo;<idOriginal>` para esse caso, e ela ficou fora da change `2026-10-06-c02-salvar-abrir-revisoes-hierarquia`, que a lê e ignora.

Há ainda um defeito anterior à revisão: ao renumerar, só o dispositivo (e o caput do artigo) tem o id recalculado. Os descendentes ficam com o id antigo (ex.: `..._par4-1_inc[sn:16]` sob o parágrafo `par4-2`), o que contamina o salvamento, as remissões e qualquer restauração do rótulo.

## What Changes

- Renumeração de dispositivo existente: em alteração de norma, passa a ser permitido renumerar manualmente também o dispositivo marcado como "Existente" (a cláusula de `existeNaNormaAlterada` deixa de bloquear a ação). O dispositivo renumerado continua "Existente"; só o rótulo muda. Filho de pai "Novo" continua sem renumeração manual (é numerado automaticamente).
- Produtor: em modo de revisão, a renumeração manual de um dispositivo pré-existente passa a gerar a operação `alteracaoRotulo;<idOriginal>`, onde `idOriginal` é o id imediatamente anterior à primeira renumeração. Combina-se com `alterado`, `movido` e `transformado` (ex.: `alteracaoRotulo;art1_cpt_alt1_art4_par4-1,alterado`). Renumerar de volta ao original remove a operação. Dispositivos criados na própria sessão de revisão continuam absorvidos por `adicionado`.
- Rejeitar: a revisão de `alteracaoRotulo` restaura número, rótulo e id do dispositivo, recalcula o id dos descendentes e sincroniza as remissões. Em revisão combinada, as demais operações são restauradas como hoje. Aceitar apenas remove a marca.
- Numeração automática: em alteração de norma, o rótulo calculado automaticamente (ex.: "Parágrafo único.") passa a valer só para filhos de dispositivo "Novo"; o primeiro nível de um dispositivo "Novo" sob pai "Existente" segue o número informado pelo usuário.
- Renumeração (em geral, com ou sem revisão): o id de **todos os descendentes** passa a ser recalculado, não só o do dispositivo e o do caput.
- Descrição da marca: uma revisão só de rótulo deixa de se descrever como "Texto do dispositivo foi alterado" e informa o rótulo anterior.
- Salvar: grava `alteracaoRotulo;<idOriginal>` em `lexedit:RevisaoArticulacao`; o parágrafo de conteúdo anterior continua só quando há `alterado`.
- Abrir: reconstrói a revisão, derivando o rótulo anterior do `idOriginal` (em alteração de norma, o sufixo de encaixe é letra: `par4-1` vira "§ 4º-A"), de modo que possa ser aceita e rejeitada.

Fora do escopo: o "Problema identificado" ao final de `11-revisao-da-hierarquia.md` (desfazer transformação sem excluir dispositivo subsequente), a renumeração automática dos irmãos (`ElementoRenumerado`), revisões textuais da justificação e comentários.

## Capabilities

### New Capabilities

- `renumeracao-dispositivo`: renumeração manual de dispositivo em alteração de norma, existente ou novo — quando é permitida, recálculo dos ids dos descendentes e o comportamento da revisão `alteracaoRotulo` em modo de revisão (gerar, combinar, reconciliar, aceitar, rejeitar, descrever).

### Modified Capabilities

- `salvar-documento-articulado`: serialização da operação `alteracaoRotulo` e do conteúdo anterior.
- `abrir-documento-articulado`: reconstrução da operação `alteracaoRotulo` (deixa de ser ignorada) e sua resolução por aceitar e rejeitar.

## Impact

- `src/model/lexml/numeracao/numeracaoUtil.ts` (`podeRenumerar`) e o aviso do editor em `editor.component.ts`.
- `src/redux/elemento/reducer/renumeraElemento.ts` (recálculo dos ids dos descendentes) e `atualizaRevisao.ts` (produtor e reconciliação), `rejeitaRevisao.ts` (restauração do rótulo, sem depender só do texto).
- `src/redux/elemento/util/revisaoUtil.ts` (operação `alteracaoRotulo`, derivação, descrição da marca) e `src/redux/elemento/reducer/aplicaRevisoes.ts`/`undo.ts`/`redo.ts` (coerência com o atributo `revisao`).
- `src/model/lexml/documento/conversor/revisaoArticulacao.ts`, `buildProjetoNormaFromJsonix.ts` (operação conhecida) e `reconstroiRevisoes.ts` (snapshot `antes` com o rótulo derivado do id).
- `docs/extensao-formato-lexml/plano-xsd-lexedit.md`: grupo 11 deixa de ter pendência.
- Testes: reducer (renumerar, aceitar, rejeitar, desfazer e refazer), unitários do conversor, integração com o `jsonix-lexml` real e E2E Cypress de abertura com a fixture do grupo de revisões.
