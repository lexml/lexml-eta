## Context

Veja proposal.md (Why). Depende da c01 (`2026-11-08-c01-comentarios-articulacao`): a sequência da articulação tem `uuid2Dispositivo`, e o dispositivo excluído em revisão **não está na articulação**. Só o elemento guardado na revisão de exclusão pendente o mantém, com o mesmo `uuid2`.

O que a c03 deixou (item 27 do `CLAUDE.md`):

- `DadosLexEdit.comentarios` (só escrita) leva as sequências ao montador. `montaMetadadoLexEdit` grava só as que têm trecho, pelos `trechosComentados` da varredura da justificação, com o ref no fragmento `_1`. Os autores vão por `montaUsuarios`, e a pendência é `PENDENCIA_COMENTARIOS`, na ordem fixada.
- `lerComentarios` descarta a sequência cujo ref não tem prefixo `_tc` (`idSequenciaDoRef`). O componente raiz filtra as lidas pelos ids presentes no editor da justificação.
- `getDocumentoArticulado` não envia comentários no anexo de parecer.

O `id` gravado de um dispositivo vivo é o `dispositivo.id` no momento de salvar. O de um excluído em revisão é calculado em `montaRevisoesArticulacao` (`_<base>-exc<n>`, com `reescreveIds` na subárvore). Ao abrir, `reconstroiRevisoes` + `aplicarRevisoesAction` recriam as revisões de exclusão em `abrirDocumentoArticulado`, depois de `aguardarCarregamentoDasLinhas()`.

## Goals / Non-Goals

**Goals:**

- Cada `id` gravado tem uma única origem: dispositivo vivo pela articulação, excluído pela montagem das revisões, trecho pela varredura da justificação. Nada é recalculado numa segunda função.
- Ida e volta estável, inclusive com dispositivo excluído em revisão.

**Non-Goals:**

- Mudar o `lexedit.xsd` ou o formato das revisões.
- Comentários em dispositivo de documento referenciado ou em anexo.

## Decisions

### O ref da articulação é resolvido no montador, a partir de mapas prontos

`montaMetadadoLexEdit` passa a montar as sequências de dois tipos:

- **justificação**: como hoje, pelos `trechosComentados`;
- **articulação**: pelo `uuid2Dispositivo`, procurando primeiro no documento que está sendo serializado com `buscarDispositivoComentado` (`model/comentario/dispositivoComentado.ts`, da c01), que cobre a ementa, o preâmbulo e os parágrafos de artigo com bloco de alteração. A `findDispositivoByUuid2` não serve: não acha a ementa nem o preâmbulo, nem esses parágrafos (invariante (bk) do item 27 do `CLAUDE.md`). Para artigo, usa o `id` do caput. Se não achar, procura no mapa `idsGravadosDosExcluidos: Map<uuid2, id>`.

Esse mapa é devolvido pela própria `montaRevisoesArticulacao`, no mesmo laço que calcula `_<base>-exc<n>` e reescreve os ids da subárvore. Ele cobre o excluído e seus descendentes, pela correspondência entre o elemento da subárvore e o id reescrito. O mapa chega ao montador por `DadosLexEdit` (só escrita), como as revisões. É a mesma regra da invariante ap/bc: o id sai de quem o calcula.

Alternativa considerada: calcular de novo o id do excluído no montador de comentários. Rejeitada porque duas varreduras podem divergir (lição da c03).

Uma sequência da articulação que não se resolve (dispositivo que não existe mais) não é gravada, como a da justificação sem trecho. Na ordem de `Comentarios`, vêm primeiro as da articulação, na ordem do texto, seguidas das da justificação, na ordem do primeiro fragmento. **A ordem vem do componente raiz:** `getDocumentoArticulado` entrega as sequências já ordenadas com `ordenarSequencias(…, 'ordem-no-texto', getPosicaoComentario)`, a mesma ordem da aba, que já põe o excluído em revisão antes da próxima linha viva. O montador grava na ordem recebida e não recalcula a posição, pela mesma regra de "uma origem só" (invariantes ap e bc).

### Envio também no anexo de parecer

`getDocumentoArticulado` passa a enviar `comentarios` nos dois modos. No anexo de parecer não há justificação, então não há `trechosComentados`, e só as sequências da articulação são gravadas. A pendência e `Usuarios` seguem a mesma regra.

### Leitura em duas etapas: metadado e depois o dispositivo

`lerComentarios` deixa de descartar o ref sem prefixo `_tc` e devolve duas coleções em `DadosLexEdit` (só leitura):

- `comentariosLidos`, as da justificação por id da sequência, que não muda;
- `comentariosArticulacaoLidos: Array<{ refId, sequencia }>`, as da articulação, na ordem gravada, com um id de sequência novo.

`abrirDocumentoArticulado` liga as da articulação **depois** de aplicar as revisões do arquivo, porque só então o excluído em revisão existe na sessão. Para cada ref, resolve nesta ordem:

1. dispositivo da articulação com esse `id`. Se o ref for `<artigo>_cpt`, usa o artigo (sem `buscaDispositivoById`, que trata `_cpt` como sinônimo do artigo por outro motivo; mesma cautela de `resolveCaputSeNecessario`);
2. revisão de exclusão reconstruída que representa esse id gravado. **Decisão de 16/11/2026, tomada na implementação:** o reconstruído **não guarda** o id gravado. O `lexmlId` volta a ser o id base (`art1_par1u`, e não `_art1_par1u-exc1`), e o `uuid2` é novo. Por isso, `reconstroiRevisoes` passou a informar, num mapa opcional (`revisaoPorIdNoArquivo`), o id gravado de cada excluído e de cada descendente, e o id da revisão reconstruída. É o mesmo `idNoArquivo` que já devolvia a situação "Existente/Novo" ("uma origem só"). `aplicarRevisoesDoArquivo` devolve esse mapa, e a ligação pega o `uuid2` da revisão no estado. O ref do caput de um artigo excluído vale o artigo, porque o caput não tem revisão própria. Foram descartados: casar pela dedução do id base e pela ordem, que erraria com duas exclusões no mesmo lugar; e não religar, o que contrariaria a spec.

O passo 1 usa a busca por `id` da ementa, do preâmbulo e da articulação, com a mesma cobertura da `buscarDispositivoComentado`. As sequências da articulação são **somadas** às da justificação: hoje `abrirDocumentoArticulado` substitui a lista pelas da justificação, filtradas por `getIdsComentarios()`, e esse filtro continua valendo só para elas. O ícone no editor não precisa de código novo, porque a c01 já o atualiza quando a lista muda.

Com o `uuid2` encontrado, a sequência ganha `uuid2Dispositivo`. Sem ele, é descartada, e um segundo ref para o mesmo `uuid2` também. Em seguida, o alerta é reavaliado (invariante an).

### Prova com o conversor antes do resto

A primeira tarefa monta à mão um documento com refs de dispositivo vivo e de excluído em revisão e faz a ida e volta pelo CLI real (`JSONIX_LEXML_CLI`, 2.4.0), conferindo a existência do arquivo de saída e validando pelo `lexedit.xsd`, como na task 1.1 da c03.

**Resultado (16/11/2026):** com o CLI 2.4.0 real e o `lexedit.xsd`, um documento com `Comentarios` de refs `art2_cpt` (caput), `art1_cpt_inc1` (inciso), `_art1-exc1_par1` (parágrafo de um artigo excluído em revisão) e `ementa` passou pelo `toxml` com os quatro refs no XML, foi válido pelo XSD e voltou pelo `tojson` com os `Comentarios` idênticos. Nada é descartado, e o `id` gravado na revisão de exclusão é aceito como ref.

## Risks / Trade-offs

- [O id do excluído em revisão é recalculado a cada salvamento e pode mudar se outras exclusões entrarem antes dele] → o ref sai do mesmo mapa, no mesmo salvamento, então ref e revisão sempre coincidem no arquivo. Teste de ida e volta com duas exclusões no mesmo pai.
- [Ao reabrir, o excluído em revisão reconstruído pode não ter o `lexmlId` igual ao id gravado] → a prova e um teste de componente confirmam a correspondência antes da integração. Se não houver, usar a ordem das revisões reconstruídas e registrar a decisão neste design antes de seguir.
- [Documento de outra versão com ref para `..._pena` ou para dispositivo de bloco de alteração] → valem as mesmas regras: resolve pelo `id`, ou descarta.
- [O ref de uma sequência de artigo gravada antes da regra do caput (`art2`)] → aceito na leitura; salvar de novo grava `art2_cpt`.
