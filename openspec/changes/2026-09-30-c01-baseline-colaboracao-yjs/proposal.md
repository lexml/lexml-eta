# Proposal

## Why

A edição colaborativa (multiusuário, via Yjs/CRDT) foi construída na branch `feat/yjs-editor` entre 28/07 e 06/08/2026 sem OpenSpec: 52 commits, ~1.300 linhas em `src/collab/` e fiação no editor, com o comportamento documentado apenas no plano `docs/plano-editor-colaborativo-yjs.md` (§9). Com o merge de `develop` (que traz o OpenSpec) a funcionalidade passa a conviver com o fluxo de specs, mas `openspec/specs/` não diz nada sobre ela. Sem uma baseline, as mudanças futuras (sidecar, persistência durável, revisão × colaboração, sincronização da detecção externa de remissão) não têm contra o que ser comparadas como deltas.

## What Changes

- Registra, como specs, o comportamento da colaboração **já implementado** e coberto por testes (unitários em Node e E2E com Playwright em dois navegadores). Não há mudança de código de produção; as tarefas podem acrescentar testes para os cenários que ainda não têm cobertura.
- Divide o comportamento em 7 capabilities pequenas, uma por responsabilidade, no mesmo estilo de `remissao-interna` e `remissao-externa`.
- Registra no `design.md` a arquitetura e as decisões que sustentam as specs (Redux como verdade nas fronteiras de commit, Yjs como overlay opcional, anti-eco, undo por modo).
- Não especifica o que ainda não existe neste repositório (sidecar, controle de acesso e token de sala no host, persistência durável, Fase 6). Cada um vira change próprio.
- Não especifica supressão/restauração de dispositivos: o `develop` removeu o conceito de situação, e a sincronização correspondente foi retirada da colaboração no merge.

## Capabilities

### New Capabilities
- `colaboracao-identidade-seed`: identidade global `gid` por dispositivo, tabela `gid` ↔ `uuid` local e conversão determinística entre `ProjetoNorma` e `Y.Doc` (seed byte-idêntico entre clientes).
- `colaboracao-transporte`: ligar/desligar a colaboração como overlay opcional, degradação graciosa (o `Y.Doc` local permanece vivo se o transporte cair), reconexão e invariante "colaboração desligada = aplicação idêntica à de antes".
- `colaboracao-estrutura`: sincronização de inclusão, remoção, reordenação de irmãos, transformação de tipo (TAB) e nota de alteração entre o estado Redux e o `Y.Array`, com anti-eco.
- `colaboracao-texto`: co-edição de texto por dispositivo (`Y.Text`), tradução de delta escopada por linha, formatação inline e delegação do artigo ao caput.
- `colaboracao-presenca`: presença e cursores remotos via Awareness, com posição estável por `{gid, índice local}`.
- `colaboracao-undo`: desfazer/refazer por modo, com `Y.UndoManager` que desfaz só as ações do próprio usuário, em texto e em estrutura.
- `colaboracao-remissao`: re-detecção de remissão interna ao receber texto remoto e sincronização da exclusão manual (tombstone) entre clientes.

### Modified Capabilities

<!-- Nenhuma: a baseline só acrescenta capabilities novas. -->

## Impact

- **Código de produção:** nenhum. Esta change acrescenta `openspec/changes/…` (e, ao ser arquivada, as 7 specs em `openspec/specs/`) e pode acrescentar testes em `test/collab/` e `e2e-collab/`.
- **Fontes que as specs descrevem:** `src/collab/*`, a fiação em `src/components/editor/editor.component.ts` e `src/components/lexml-eta-proposicao.component.ts`, e os desvios de undo/redo em `src/util/eta-quill/eta-quill.ts`.
- **Testes de referência:** `test/collab/*` (harness Node, `npm run test:collab`) e `e2e-collab/*` (Playwright, `npm run e2e:collab`).
- **Fora do repositório:** o sidecar Node e a Etapa L (controle de acesso e token de sala) vivem no host e não são especificados aqui.
