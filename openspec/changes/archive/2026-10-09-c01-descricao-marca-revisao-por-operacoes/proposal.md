# Proposal

## Why

A marca de revisão (o "F" laranja ao lado do dispositivo) mostra, no tooltip, uma descrição da ação, como "Dispositivo movido (antes era "Artigo Art. 3º")". Hoje essa descrição é montada em pontos diferentes do código, com regras diferentes, e falha em dois casos:

- **Operações combinadas não são descritas.** Um artigo movido e depois alterado mostra só "Dispositivo movido (...)": o "texto alterado" não aparece, embora a revisão registre `movido;3,alterado`. A spec `abrir-documento-articulado` já exige que as marcas "descrevam todas as operações", e isso não vale nem na sessão de edição.
- **A descrição se perde ao salvar e reabrir.** Verificado com um teste de ida e volta (MPV 905/2019, artigo 3 movido duas vezes e alterado duas vezes): a revisão é salva e lida corretamente (`movido;3,alterado`) e reaplicada com as mesmas operações, mas o tooltip do documento reaberto diz "Dispositivo adicionado". A causa está em `reconstroiRevisoes.ts` (change `2026-10-06-c02-salvar-abrir-revisoes-hierarquia`): `buildDescricaoRevisaoFromStateType` só reconhece "movido" quando o número do dispositivo difere entre `antes` e `apos`, e o snapshot `antes` reconstruído ao abrir tem o mesmo número do atual.

Relato do usuário que motivou a change: moveu um artigo, alterou o texto, moveu de novo, alterou de novo, salvou, abriu o arquivo, e o tooltip passou de "Dispositivo movido" para "Dispositivo adicionado".

## What Changes

- Uma única função monta a descrição da marca **a partir das operações registradas** em `revisao` (`adicionado`, `excluido`, `alterado`, `movido`, `transformado`, `alteracaoRotulo`), usada tanto na sessão de edição quanto ao reabrir o arquivo, de modo que a mesma revisão tenha a mesma descrição nos dois casos.
- As descrições das operações isoladas `adicionado`, `excluido` (`"Dispositivo removido"`, string que o editor compara literalmente), `alterado` e `alteracaoRotulo` não mudam.
- Movimentação e transformação passam a informar o que o próprio atributo `revisao` guarda. Fora de alteração de norma, `movido;<n>` vira `Dispositivo movido (antes era "<tipo> <rótulo>")`, com o rótulo derivado da posição original (o rótulo de texto de proposição é sequencial), o mesmo texto que a sessão mostra hoje; em alteração de norma, onde o rótulo não é função da posição, vira "Dispositivo movido (posição original n)". `transformado;<tipo>` vira `Dispositivo transformado (antes era "<tipo>")`. Operações combinadas somam os trechos, por exemplo `Dispositivo movido (antes era "Artigo Art. 3º") e texto alterado`.
- A descrição é recalculada sempre que as operações da revisão mudam (nova operação, operação descartada pela reconciliação), e não só na criação.
- **Texto do tooltip em alteração de norma:** a movimentação de um dispositivo de alteração de norma deixa de citar o rótulo anterior e passa a citar a posição original, porque o arquivo não grava o rótulo anterior nem o indicador "Novo/Existente" (`existeNaNormaAlterada`), que seria necessário para saber se o rótulo é automático; assim o texto é o mesmo na sessão e ao reabrir. Fora de alteração de norma o texto não muda.

Fora do escopo: gravar o rótulo anterior ou o indicador "Novo/Existente" no arquivo (exigiria mudar o formato e o XSD do LexEdit; poderia dar rótulo preciso também em alteração de norma, em change própria), descrição das revisões de justificação, e o erro de console de `selecionaElemento` relatado em outra ocasião.

## Capabilities

### New Capabilities

- `descricao-marca-revisao`: o texto que descreve cada revisão da articulação na marca de revisão: composição a partir das operações, consistência entre a sessão de edição e o documento reaberto, e as strings que outros pontos do editor comparam literalmente.

### Modified Capabilities

- `abrir-documento-articulado`: o requisito "Reconstrução das operações de cada revisão" ganha o critério verificável de que a descrição da marca reaberta é a mesma da sessão de edição.

## Impact

- `src/redux/elemento/util/revisaoUtil.ts`: nova função de descrição por operações; `buildDescricaoRevisaoElemento` e `buildDescricaoRevisaoFromStateType` passam a delegar a ela quando a revisão tem o atributo `revisao`.
- `src/redux/elemento/reducer/atualizaRevisao.ts`: recalcular a descrição nos pontos em que as operações da revisão são criadas ou alteradas (movimentação/transformação, modificação, reconciliação).
- `src/model/lexml/documento/conversor/reconstroiRevisoes.ts` (`novaRevisao`): usar a mesma função.
- Testes: unitários da função, reducer (cenário do relato), ida e volta com igualdade de descrição entre sessão e reaberto, E2E Cypress no spec de abertura de revisões.
- `CLAUDE.md` (item 13) e a spec principal `abrir-documento-articulado`, no fechamento.
