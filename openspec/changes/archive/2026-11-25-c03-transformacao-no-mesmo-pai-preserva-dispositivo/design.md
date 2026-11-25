## Context

Ver proposal.md (Why). Reproduzido no `mpv_905_2019` (Art. 627 da alteração, incisos I a IV, §§ 1º a 4º):

- Tela: "Omitir Incisos" no inciso I põe o omissis (mesmo `uuid` do inciso) depois do § 4º.
- Evento: o `ElementoIncluido` chega com a referência § 4º e o omissis sem `elementoAnteriorNaSequenciaDeLeitura`.
- Modelo (reducer `transformaTipoElemento` direto, sem tela): depois da ação, o caput tem só os incisos II a IV; o omissis não está na árvore. O inverso ("omissis → inciso" num caput com omissis) também deixa o inciso fora da árvore.

Caminho: `converteDispositivo` (`dispositivoLexmlUtil.ts`), no grupo de casos que fica no mesmo pai (`transformar*EmOmissis*`, `transformarOmissisEm*`, `transformarDispositivoGenericoEm*`), faz `criaDispositivo(paiAtual, tipo, undefined, paiAtual.indexOf(atual), atual.uuid)` e, no fim, para todos os casos, `paiAtual.removeFilho(atual)`. Todo `removeFilho` das hierarquias (`HierarquiaDispositivo`, `HierarquiaAgrupador`, `HierarquiaArtigo` via caput ou parágrafos) filtra por `uuid`, então remove os dois. Sem o dispositivo novo no pai, `ajustaReferencia` cai em `getUltimoFilho` (o último filho do artigo) e a tela insere a linha ali.

Nos casos que mudam de pai, o dispositivo novo está em outro pai (ou em outra lista do artigo), e a remoção por `uuid` no pai antigo não o atinge.

## Goals / Non-Goals

**Goals:**
- O dispositivo novo fica no lugar do antigo e na árvore, nas transformações no mesmo pai.

**Non-Goals:**
- Mudar `removeFilho` das hierarquias.
- Juntar omissis vizinhos ou mudar as regras de quando cada omissão é oferecida.
- Mudar as transformações que mudam de pai.

## Decisions

**1. No grupo do mesmo pai, remover o antigo antes de criar o novo.** O caso guarda a posição (`paiAtual.indexOf(atual)`), remove `atual` do pai e cria o novo nessa posição; a remoção geral do fim deixa de valer para esse grupo, senão levaria o novo. O resto do fluxo (texto, rótulo, validação, renumeração, `converteFilhos`) não muda.
- Alternativa descartada: `removeFilho` remover pelo próprio objeto em todas as hierarquias. Tem muitos chamadores, e alguns podem passar outro objeto com o mesmo `uuid` (eventos, desfazer); o risco é bem maior que o de um ajuste local.
- Alternativa descartada: deixar de preservar o `uuid` nesse grupo. Remissões e comentários dependem da preservação (bug do TAB, `68225295`).

## Risks / Trade-offs

- [Rótulo do dispositivo novo calculado com o antigo ainda no pai] → com a remoção antes, o novo é rotulado já na posição final, sem o antigo como irmão; é o estado em que o rótulo deveria ser calculado.
- [Desfazer e refazer] → passam pelos eventos de inclusão e remoção, que continuam os mesmos; cobertos por teste.
