## Context

Veja proposal.md (Why). O que a justificação deixou pronto (`openspec/specs/comentarios/spec.md`, item 24 do `CLAUDE.md`):

- O modelo `SequenciaComentario { id, comentarios }` e `Comentario { usuario, data ISO com fuso, texto }` (`src/model/comentario/`), com as regras de autoria, edição, exclusão e ordenação em `comentarioUtil.ts`.
- As sequências ficam em `LexmlEtaComponent.sequenciasComentario`, **fora do Redux**. O alerta e a pendência seguem `sequenciasComentario.length` (`updated`).
- A aba `lexml-eta-comentarios` só exibe e devolve as ações por eventos. Os modais são renderizados num contêiner no `body` (invariante aw). O componente recebe `getTrecho` e `getPosicao` do componente raiz.
- Na justificação, a âncora é a marcação `comentario` do Quill. O editor emite `comentarios-alterados` e o componente raiz reconcilia nos dois sentidos (invariante at), guardando os ids removidos para que desfazer não recrie o destaque (invariante au).

Na articulação, a âncora é o dispositivo, que vive no Redux. O dispositivo tem `uuid2` (gerado em `dispositivoLexmlFactory`), estável ao renumerar e ao mover, e volta igual ao desfazer. **Transformar não o preserva:** o reducer recria o dispositivo com o mesmo `uuid` e um `uuid2` novo (`dispositivoLexmlFactory.ts`, `dispositivo.uuid2 = generateUUID()`), o que foi verificado nos testes do grupo 3. O `lexmlId` muda com a renumeração. A linha do editor já tem `EtaContainerOpcoes`/`EtaContainerRevisao` com o ícone de diferenças (`EtaBlotOpcoesDiff`), e o lexml-emenda já fez o equivalente para comentários (`EtaBlotOpcoesComentario`).

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

- **identificação**: `textoCanonicoDoDispositivo` (`lexmlIdUtil.ts`, já usado pelas remissões) para artigos e desdobramentos, e um complemento para os elementos que a remissão não trata: ementa ("ementa"), preâmbulo ("preâmbulo"), agrupador ("Capítulo II", pelo rótulo), pena e dispositivo de bloco de alteração. O formato segue o lexml-emenda (`formatarIdentificacaoDispositivo`): no bloco de alteração, a identificação dentro da norma alterada, com a inicial maiúscula, seguida de "citado no" e do artigo do projeto ("Inciso I do art. 5º citado no art. 2º"). Como é calculada a cada renderização, a renumeração não exige atualizar nada.
- **posição**: o índice do dispositivo na ordem do texto, para "Ordem no texto". A ordenação passa a usar a chave `(local, posição)`: articulação = 0, justificação = 1, como `ordemLocal` no lexml-emenda. `ordenarSequencias` ganha esse primeiro critério e mantém o restante.

A aba ganha o rótulo do local ("No texto"/"Na justificação"). Como no lexml-emenda, a identificação do dispositivo vai no mesmo bloco do trecho (`comentario-sequencia__trecho`, entre aspas, numa linha, com reticências), e o selo "No texto" tem a classe `comentario-sequencia__origem--texto`, com os mesmos valores da `--justificativa`. No modal de adicionar, o rótulo continua "Trecho selecionado", com a identificação no bloco do trecho.

### Botão, ícone e eventos no editor da articulação

O `EditorComponent` ganha o botão na barra (`#lx-eta-barra-ferramenta`), com o mesmo ícone do botão da justificação. A habilitação é calculada pelo elemento selecionado (evento `ElementoSelecionado`), contra o conjunto de `uuid2` comentados recebido do componente raiz. Ficam desabilitados: o elemento sem `lexmlId`, a articulação, o omissis e o elemento com revisão de exclusão. O editor só emite eventos (`abrir-modal-comentario-dispositivo`, `comentario-dispositivo-selecionado`); quem cria, seleciona e remove sequências é o componente raiz, como na justificação.

O ícone é um blot (`EtaBlotOpcoesComentario`) inserido no contêiner, de revisão ou de opções, que vier por último na linha. O lexml-emenda prefere o de revisão, que fica antes do de diferenças; aqui o comentário fica sempre depois. O ícone é atualizado quando muda o conjunto de `uuid2` comentados e quando a linha é recriada (`atualizarElemento`, recriação de linha, desfazer e refazer). O clique emite o evento de seleção com o `uuid2`.

O cursor num dispositivo comentado (evento `ElementoSelecionado`) emite `comentario-dispositivo-selecionado`, e o componente raiz destaca a sequência, rolando só se a aba estiver visível, como no fluxo da justificação. Selecionar a sequência na aba exibe a aba "Texto" e posiciona o cursor no dispositivo pelo `uuid2`.

### Visual do lexml-emenda

Os valores vêm de `src/assets/css/editor.css.ts` do lexml-emenda (listados em `relatorio.md`, etapa 0) e vão para o `editor.css.ts` do eta:

- o botão `.button-comentario-articulacao` em `#lx-eta-barra-ferramenta`;
- o `.blot__opcoes_comentario`, com o balão em máscara SVG (fundo `#fff8c5`, `#fdd663` no hover e na linha ativa);
- `.mobile-button.btn-comentarios sl-icon`;
- o `align-self: center` dos contêineres da linha no `@media (max-width: 768px)`.

O `EtaBlotOpcoesComentario` entra, ao lado do `EtaBlotOpcoesDiff`, na lista de blots de `eta-quill.ts` cujo clique não move o cursor.

### Linha sem contêiner de opções

Uma linha sem ícone de diferenças não tem `EtaContainerOpcoes`. Como no lexml-emenda, `EtaQuillUtil.criarContainerOpcoes(elemento, incluirDiff = true, incluirComentario = false)` passa a criar o contêiner só com o comentário. `EtaContainerOpcoes` ganha os getters `blotBotaoComentario` e `vazio`, e `EtaContainerRevisao` ganha `blotBotaoComentario`. Os dois repassam o elemento atualizado ao blot. Quando o diff sai (`indicadorTextoModificado`), o contêiner com comentário é mantido, e só o blot de diferenças é removido.

### Telas pequenas na articulação

Os botões de telas pequenas da barra do texto articulado (`.mobile-buttons`, até 768px) ganham "Comentários" (`btn-comentarios`, ícone `chat-left-text`), que emite `abrir-modal-lista-comentarios`. O componente raiz já trata esse evento, que vem da justificação. O clique no ícone do dispositivo passa por `exibirSequenciaAtualNaLista`, que até 992px abre o modal da lista.

### Reconciliação com as remoções (decisões A e C)

Depois de cada lote de eventos do Redux que contenha `ElementoRemovido` ou `RevisaoAceita`, o componente raiz confere quais `uuid2` das sequências da articulação ainda estão **vivos** e descarta as sequências dos demais. Um `uuid2` está vivo quando o dispositivo existe na articulação (`findDispositivoByUuid2`, já usado por revisões e remissões) **ou** quando é o elemento de uma revisão de exclusão pendente em `state.revisoes` (o próprio excluído ou um descendente dele).

Excluir em revisão também tira o dispositivo da articulação. Só a revisão guarda o elemento, com o mesmo `uuid2`, e rejeitá-la o recria com esse `uuid2` (`redodDispositivoExcluido`). Por isso a segunda condição é o que mantém a sequência durante a revisão (C). Ao aceitar a revisão, ela sai de `state.revisoes`, e a mesma reconciliação descarta a sequência. Ao rejeitar, o dispositivo volta à articulação com o mesmo `uuid2`, e a sequência continua.

Para esse dispositivo, a identificação e a posição vêm do elemento guardado na revisão (`lexmlId` → `lexmlIdParaTextoCanonico`), não da articulação. A posição para "Ordem no texto" é a ordem das linhas do editor, que inclui os excluídos em revisão.

Desfazer a exclusão devolve o dispositivo com o mesmo `uuid2`, mas a sequência já saiu da lista e nada a recria: na articulação, ao contrário da justificação (invariante au), não existe marcação no texto que o desfazer traga de volta. Por isso o conjunto de `uuid2` descartados, previsto no início, não foi criado: seria código sem efeito. O comportamento é coberto pelo teste "excluir o dispositivo remove a sequência; desfazer não a recria".

Alternativa considerada: reconciliar só pelos `uuid` dos elementos do evento `ElementoRemovido`. Rejeitada porque o evento nem sempre lista todos os descendentes e porque `RevisaoAceita` também remove. Conferir contra a articulação é a fonte de verdade.

### Transformação: a sequência passa para o novo `uuid2`

Transformar (TAB, mudar o tipo) gera no mesmo lote `ElementoRemovido` e `ElementoIncluido` com o mesmo `uuid` e um `uuid2` novo. Antes de descartar as sequências sem dispositivo vivo, a reconciliação procura, para cada `uuid2` que deixou de existir, um elemento incluído no lote com o mesmo `uuid` do removido, e passa a sequência para o `uuid2` dele. Desfazer e refazer a transformação geram o mesmo padrão, então o caminho inverso funciona igual. A mudança fica só no lado dos comentários: o reducer e as remissões, que usam o `uuid2` como identidade, não são alterados. O lexml-emenda perde o comentário nesse caso.

Alternativas consideradas: preservar o `uuid2` no reducer de transformação, rejeitada pelo risco às remissões; aceitar a perda, rejeitada porque a spec pede que transformar mantenha a sequência.

### Aba no modo anexo de parecer

`tabIsVisible('comentarios')` deixa de depender da justificação. No anexo de parecer, a aba só tem sequências da articulação, porque não há justificação nem botão para comentá-la. `getDocumentoArticulado` continua sem enviar comentários no anexo de parecer até a c02.

## Risks / Trade-offs

- [O lote de eventos de uma ação estrutural (transformar artigo em parágrafo) traz `ElementoRemovido` e `ElementoIncluido` com o mesmo uuid (item 11 do `CLAUDE.md`)] → a reconciliação confere a articulação depois do lote inteiro, não evento a evento, e o `uuid2` preservado mantém a sequência.
- [O ícone da linha some quando a linha é recriada (tipo diferente, rejeitar revisão)] → atualizar os indicadores depois de cada lote de eventos que recrie linhas; teste de componente com transformação e rejeição.
- [Dispositivo excluído em revisão: não está na articulação, e o elemento do evento `RevisaoRejeitada` é uma cópia (invariante ai)] → a presença da sequência e a habilitação do botão consultam `state.revisoes` e a articulação, nunca a cópia do evento. Testes de componente para excluir em revisão, aceitar, rejeitar e desfazer a exclusão em revisão.
- [A reconciliação e os filtros da justificação apagariam as sequências da articulação] → `sincronizarSequenciasComentario`, o filtro por `getIdsComentarios()` em `abrirDocumentoArticulado` e `excluirSequenciaComentario` passam a olhar só as sequências sem `uuid2Dispositivo`. Testes de regressão com sequências dos dois locais na lista.
- [`selecionarSequenciaComentario` sempre exibe a aba da justificação] → para a articulação, exibir a aba "Texto", com a mesma flag `preservarSequenciaNaTrocaAba`, para a troca não desfazer a seleção.
- [A spec `comentarios` fala só da justificação no Purpose] → ajustar o Purpose da spec principal ao arquivar (editar `openspec/specs/comentarios/spec.md`).
