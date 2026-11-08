## Context

Veja proposal.md (Why). O que a justificação deixou pronto (`openspec/specs/comentarios/spec.md`, item 24 do `CLAUDE.md`):

- O modelo `SequenciaComentario { id, comentarios }` e `Comentario { usuario, data ISO com fuso, texto }` (`src/model/comentario/`), com as regras de autoria, edição, exclusão e ordenação em `comentarioUtil.ts`.
- As sequências ficam em `LexmlEtaComponent.sequenciasComentario`, **fora do Redux**. O alerta e a pendência seguem `sequenciasComentario.length` (`updated`).
- A aba `lexml-eta-comentarios` só exibe e devolve as ações por eventos. Os modais são renderizados num contêiner no `body` (invariante aw). O componente recebe `getTrecho` e `getPosicao` do componente raiz.
- Na justificação, a âncora é a marcação `comentario` do Quill. O editor emite `comentarios-alterados` e o componente raiz reconcilia nos dois sentidos (invariante at), guardando os ids removidos para que desfazer não recrie o destaque (invariante au).

Na articulação, a âncora é o dispositivo, que vive no Redux. O dispositivo tem `uuid2` (gerado em `dispositivoLexmlFactory`), estável na sessão: não muda ao renumerar, mover ou transformar e volta igual ao desfazer. O `lexmlId` muda com a renumeração. A linha do editor já tem `EtaContainerOpcoes`/`EtaContainerRevisao` com o ícone de diferenças (`EtaBlotOpcoesDiff`), e o lexml-emenda já fez o equivalente para comentários (`EtaBlotOpcoesComentario`).

## Goals / Non-Goals

**Goals:**

- Comentar dispositivos reaproveitando o modelo, a aba, os modais, o alerta e a pendência da justificação, sem um segundo fluxo de comentários.
- A âncora da sessão não depende de id que muda com a renumeração.

**Non-Goals:**

- Gravar e abrir no arquivo (change `2026-11-08-c02-salvar-abrir-comentarios-articulacao`).
- Comentar um trecho de texto dentro do dispositivo: o formato só prevê o dispositivo inteiro.
- Levar os comentários ao host ou ao PDF.

## Decisions

### Âncora: um discriminador na própria sequência

`SequenciaComentario` ganha `uuid2Dispositivo?: string`. Uma sequência com esse campo é da articulação; sem ele, é da justificação, e o trecho continua sendo achado pelo `id` da sequência na marcação do Quill. Assim a lista continua única (`sequenciasComentario`), e alerta, pendência, aba, ordenação e descarte ao trocar de documento funcionam sem mudança.

Alternativas consideradas: (a) guardar o `lexmlId`, como o lexml-emenda (`idDispositivo`), rejeitada porque exige corrigir o id após cada renumeração (`atualizarIdDispositivoSequenciaComentario`) e falha quando o id muda sem evento claro; (b) uma segunda lista só para a articulação, rejeitada porque duplicaria o alerta, a pendência e a ordenação. O `lexmlId` só é necessário para gravar, e quem o calcula é a c02.

### Identificação e posição derivadas do dispositivo atual

A aba recebe do componente raiz, como hoje recebe `getTrecho`/`getPosicao`, funções que resolvem a sequência pelo `uuid2`:

- **identificação**: `textoCanonicoDoDispositivo` (`lexmlIdUtil.ts`, já usado pelas remissões) para artigos e desdobramentos, e um complemento para os elementos que a remissão não trata: ementa, preâmbulo, agrupador ("Capítulo II", pelo rótulo), pena e dispositivo de bloco de alteração. Como é calculada a cada renderização, a renumeração não exige atualizar nada.
- **posição**: o índice do dispositivo na ordem do texto, para "Ordem no texto". A ordenação passa a usar a chave `(local, posição)`: articulação = 0, justificação = 1, como `ordemLocal` no lexml-emenda. `ordenarSequencias` ganha esse primeiro critério e mantém o restante.

A aba ganha o rótulo do local ("No texto"/"Na justificação") e, para a articulação, mostra a identificação no lugar do `blockquote` do trecho. No modal de adicionar, a identificação aparece no lugar do "Trecho selecionado".

### Botão, ícone e eventos no editor da articulação

O `EditorComponent` ganha o botão na barra (`#lx-eta-barra-ferramenta`), com o mesmo ícone do botão da justificação. A habilitação é calculada pelo elemento selecionado (evento `ElementoSelecionado`), contra o conjunto de `uuid2` comentados recebido do componente raiz. Ficam desabilitados: o elemento sem `lexmlId`, a articulação, o omissis e o elemento com revisão de exclusão. O editor só emite eventos (`abrir-modal-comentario-dispositivo`, `comentario-dispositivo-selecionado`); quem cria, seleciona e remove sequências é o componente raiz, como na justificação.

O ícone é um blot (`EtaBlotOpcoesComentario`) inserido por último no contêiner de opções ou de revisão da linha, atualizado quando muda o conjunto de `uuid2` comentados e quando a linha é recriada (`atualizarElemento`, recriação de linha, desfazer e refazer). O clique emite o evento de seleção com o `uuid2`.

O cursor num dispositivo comentado (evento `ElementoSelecionado`) emite `comentario-dispositivo-selecionado`, e o componente raiz destaca a sequência, rolando só se a aba estiver visível, como no fluxo da justificação. Selecionar a sequência na aba exibe a aba "Texto" e posiciona o cursor no dispositivo pelo `uuid2`.

### Reconciliação com as remoções (decisões A e C)

Depois de cada lote de eventos do Redux que contenha `ElementoRemovido` ou `RevisaoAceita`, o componente raiz confere quais `uuid2` das sequências da articulação ainda estão **vivos** e descarta as sequências dos demais. Um `uuid2` está vivo quando o dispositivo existe na articulação (`findDispositivoByUuid2`, já usado por revisões e remissões) **ou** quando é o elemento de uma revisão de exclusão pendente em `state.revisoes` (o próprio excluído ou um descendente dele).

Excluir em revisão também tira o dispositivo da articulação. Só a revisão guarda o elemento, com o mesmo `uuid2`, e rejeitá-la o recria com esse `uuid2` (`redodDispositivoExcluido`). Por isso a segunda condição é o que mantém a sequência durante a revisão (C). Ao aceitar a revisão, ela sai de `state.revisoes`, e a mesma reconciliação descarta a sequência. Ao rejeitar, o dispositivo volta à articulação com o mesmo `uuid2`, e a sequência continua.

Para esse dispositivo, a identificação e a posição vêm do elemento guardado na revisão (`lexmlId` → `lexmlIdParaTextoCanonico`), não da articulação. A posição para "Ordem no texto" é a ordem das linhas do editor, que inclui os excluídos em revisão.

O conjunto de `uuid2` descartados (`uuid2DispositivosDescartados`) impede que desfazer devolva a sequência. O dispositivo volta com o mesmo `uuid2`, mas a sequência já saiu da lista e não é recriada. Esse conjunto é zerado em `descartarDocumentoAtual`, como o conjunto de ids removidos da justificação (invariante au).

Alternativa considerada: reconciliar só pelos `uuid` dos elementos do evento `ElementoRemovido`. Rejeitada porque o evento nem sempre lista todos os descendentes e porque `RevisaoAceita` também remove. Conferir contra a articulação é a fonte de verdade.

### Aba no modo anexo de parecer

`tabIsVisible('comentarios')` deixa de depender da justificação. No anexo de parecer, a aba só tem sequências da articulação, porque não há justificação nem botão para comentá-la. `getDocumentoArticulado` continua sem enviar comentários no anexo de parecer até a c02.

## Risks / Trade-offs

- [O lote de eventos de uma ação estrutural (transformar artigo em parágrafo) traz `ElementoRemovido` e `ElementoIncluido` com o mesmo uuid (item 11 do `CLAUDE.md`)] → a reconciliação confere a articulação depois do lote inteiro, não evento a evento, e o `uuid2` preservado mantém a sequência.
- [O ícone da linha some quando a linha é recriada (tipo diferente, rejeitar revisão)] → atualizar os indicadores depois de cada lote de eventos que recrie linhas; teste de componente com transformação e rejeição.
- [Dispositivo excluído em revisão: não está na articulação, e o elemento do evento `RevisaoRejeitada` é uma cópia (invariante ai)] → a presença da sequência e a habilitação do botão consultam `state.revisoes` e a articulação, nunca a cópia do evento. Testes de componente para excluir em revisão, aceitar, rejeitar e desfazer a exclusão em revisão.
- [Identificação de dispositivo de bloco de alteração pode ficar longa ou ambígua] → usar a identificação dentro da norma alterada seguida do artigo hospedeiro; ajustar com o usuário na revisão do grupo de interface, se necessário.
- [A spec `comentarios` fala só da justificação no Purpose] → ajustar o Purpose da spec principal ao arquivar (editar `openspec/specs/comentarios/spec.md`).
