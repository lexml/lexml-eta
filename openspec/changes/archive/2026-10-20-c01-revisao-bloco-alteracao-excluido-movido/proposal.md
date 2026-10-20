# Proposal

## Why

Em modo de revisão, excluir ou mover um artigo que altera norma (com bloco de alteração) gera marcas de revisão erradas e perde conteúdo ao salvar. Ao excluir o Art. 5 (com bloco de alteração de uma lei) e salvar, o arquivo contém só o caput do artigo; o bloco de alteração e seus dispositivos (ex.: "Art. 3º Existente" e "§ 2º Novo") não são gravados e, ao reabrir, não são recriados. Além disso, a sessão exibe duas marcas de revisão em vez de uma.

A causa é a mesma nas duas falhas: o pai do primeiro nível de um bloco de alteração é a articulação de alteração, não o artigo hospedeiro. A decisão "este dispositivo é filho de outro dispositivo revisado?" compara `hierarquia.pai.uuid` com os uuids dos revisados e nunca acha o artigo. O caminho de inclusão já trata esse caso; o de exclusão (e, por consequência, o de movimentação) não.

## What Changes

- Exclusão ou movimentação de um dispositivo que contém bloco de alteração passa a gerar uma única revisão principal; os dispositivos do bloco ficam associados a ela, como os demais descendentes.
- Ao salvar, a revisão `excluido` de um dispositivo com bloco de alteração grava o bloco completo (dispositivos, rótulos, textos e hierarquia), com identificadores derivados do identificador do excluído.
- Ao abrir, a revisão `excluido` reconstrói o bloco de alteração dentro do dispositivo excluído, na hierarquia salva.
- Movimentação de dispositivo com bloco de alteração: as operações se propagam corretamente aos descendentes do bloco, na sessão e ao reabrir.
- Regra única de "pai efetivo" do elemento (articulação de alteração sobe até o artigo hospedeiro), usada em todos os pontos que decidem vínculo entre revisões.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `salvar-documento-articulado`: a revisão de exclusão (e o identificador dos excluídos) passa a cobrir bloco de alteração; a revisão de movimentação passa a cobrir descendentes em bloco de alteração.
- `abrir-documento-articulado`: a reconstrução de dispositivos excluídos e das operações por revisão passa a cobrir bloco de alteração.

## Impact

- Código: `src/redux/elemento/reducer/atualizaRevisao.ts` (decisão de principal x filho), `src/redux/elemento/util/revisaoUtil.ts` (`identificarRevisaoElementoPai`, `findRevisaoElementoPrincipal`), `src/model/lexml/documento/conversor/revisaoArticulacao.ts` (`criaSubarvoreSolta`), `src/model/lexml/documento/conversor/reconstroiRevisoes.ts` (leitura).
- Sem mudança de formato: o bloco de alteração do excluído usa o mesmo elemento `Alteracao` já usado na articulação.
- Fora do escopo: a situação "Existente/Novo" dos dispositivos do bloco excluído (derivada da articulação viva) é tratada na change `2026-10-20-c02-situacao-norma-vigente-dispositivo-excluido`, que depende desta.
