## Context

O estado de revisão liga cada `RevisaoElemento` descendente à revisão principal por `idRevisaoElementoPrincipal`, calculado em `identificarRevisaoElementoPai`/`findRevisaoElementoPrincipal` a partir do pai do elemento. Para inclusão, `getUuidPai` já sobe da articulação de alteração até o artigo hospedeiro. Para exclusão, os mesmos pontos usam `elementoAntesRevisao.hierarquia.pai.uuid` direto. No primeiro nível do bloco de alteração esse uuid é o da articulação de alteração (`hierarquia.pai.tipo === Articulacao`), que nunca é um elemento revisado; o artigo hospedeiro está em `hierarquia.pai.uuidAlteracao`.

Pontos com a mesma decisão: `atualizaRevisao.ts` (criação, usa `uuidsElementos(Incluidos|Removidos).includes(e.hierarquia?.pai?.uuid)`), `identificarRevisaoElementoPai`, `findRevisaoElementoPrincipal`, `criaSubarvoreSolta` (monta o excluído para salvar) e `reconstroiRevisoes` (leitura).

## Goals / Non-Goals

**Goals:**
- Uma única revisão principal para exclusão/movimentação de dispositivo com bloco de alteração.
- Gravar e reconstruir o bloco de alteração do dispositivo excluído.
- Uma só regra de "pai efetivo", compartilhada.

**Non-Goals:**
- Gravar "Existente/Novo" dos dispositivos de bloco excluído: tratado na change `2026-10-20-c02-situacao-norma-vigente-dispositivo-excluido`.
- Alterar o formato do arquivo: usa o `Alteracao` já existente.
- Mudar o desfazer/refazer fora do necessário para manter os testes atuais.

## Decisions

1. **Auxiliar único de pai efetivo.** Uma função (ex.: `getUuidPaiEfetivoDoElemento(elemento)`) devolve `hierarquia.pai.uuidAlteracao` quando `hierarquia.pai.tipo` é Articulacao e há `uuidAlteracao`; caso contrário `hierarquia.pai.uuid`. Usada nos quatro pontos de leitura. Alternativa descartada: corrigir cada ponto com a sua condição (repete a regra e já divergiu uma vez).
2. **Montagem do excluído.** Em `criaSubarvoreSolta`, filho cujo `hierarquia.pai.tipo` é Articulacao é criado em `raiz.alteracoes` (que `redodDispositivoExcluido` cria quando o elemento tem `norma`), não em `raiz`. Pré-requisito: snapshots em ordem pai antes de filho.
3. **Identificadores.** `reescreveIds`/`updateIdDispositivoAndFilhos` já devem percorrer `alteracoes`; confirmar por teste, ajustando só se necessário.
4. **Leitura.** `reconstroiRevisoes` recria `Alteracao` dentro do excluído e associa os dispositivos do bloco à revisão do excluído; `operacaoDoDescendente` passa a tratar o bloco como descendente.
5. **Movimentação.** Sem regra própria: depende da decisão 1, porque exclusão e inclusão do movido passam pelos mesmos pontos. Validar por teste, sem código específico se não houver diferença.

## Risks / Trade-offs

- Mudar o vínculo altera o número de marcas em documentos com exclusões de bloco já existentes na sessão: efeito desejado, mas pode afetar testes que codificam duas marcas.
- Ordem dos snapshots associados depende da ordem de `state.revisoes`; se não garantir pai antes de filho, ordenar pela hierarquia antes de montar.
- Arquivos já salvos com o erro (sem bloco) continuam sem o bloco; não há como recuperar o conteúdo.
