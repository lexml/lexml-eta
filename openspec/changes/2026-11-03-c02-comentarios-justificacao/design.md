## Context

A referência é o `lexml-emenda` (commits de 18/05 a 20/08/2026), anterior ao formato LexEdit: vale para o comportamento, não para os dados. Lá, os comentários vivem fora do Redux, no componente raiz (`sequenciasComentario`), e o componente raiz concentra a aba, os modais e a coordenação (cerca de 640 ocorrências num arquivo de 3.300 linhas). O editor de texto rico e o `moduloRevisao` do `lexml-eta` divergem bastante dos da emenda (cerca de 950 e 470 linhas), então a portagem é por trecho, não por cópia.

No `lexml-eta`:

- O texto da justificação vive no Quill do `lexml-eta-editor-texto-rico`, fora do Redux; o componente raiz (`lexml-eta.component.ts`) lê `_lexmlJustificativa.texto` para a proposição e para o documento.
- O usuário atual está em `state.usuario` (`Usuario`: `nome`, `id`, `sigla`), definido pelo host em `lexmlEtaConfig.usuario`; `getIdUsuario` já é usado pelas revisões.
- O painel da direita (`tabs-direita`) mostra só "Notas" e "Atalhos" (`tabIsVisible`); no celular o painel fica oculto.
- O evento `onchange` do editor não carrega o texto; o host lê a justificação por `getProposicao()`.
- A c01 deixa as marcas de revisão sem cor de fundo e com o traço da exclusão por imagem de fundo, o que permite combinar com o fundo amarelo do comentário.

## Goals / Non-Goals

**Goals:**

- Comportamento equivalente ao da emenda na justificação, com dados já no modelo que a c03 vai gravar (`08-comentarios.md`): data com fuso, autor como `Usuario`, texto em linhas.
- Não concentrar tudo no componente raiz.

**Non-Goals:**

- Articulação, celular, persistência em arquivo (c03) e PDF.
- Redux para os comentários.

## Decisions

### Estado no componente raiz, interface num componente próprio

As sequências ficam numa propriedade do `LexmlEtaComponent`, como na emenda. O texto comentado está no Quill da justificação, fora do Redux, e o desfazer do Quill é que decide se o trecho volta; um estado no Redux teria de ser reconciliado com esse histórico sem ganho. A articulação (change futura) vai reagir a eventos do Redux, mas pode consultar a mesma lista.

A aba e os modais vão para um componente novo, `lexml-eta-comentarios` (`src/components/comentarios/`), que recebe as sequências, o usuário atual e a sequência destacada por propriedade e emite eventos (adicionar, responder, editar, excluir, selecionar). O componente raiz trata os eventos e conversa com o editor. Isso evita repetir o arquivo de 3.300 linhas da emenda.

Alternativa considerada: tudo no componente raiz, como na emenda. Facilita a portagem literal, mas dificulta o teste e a manutenção.

### Modelo e regras puras separados da interface

`src/model/comentario/comentario.ts` define `SequenciaComentario { id, comentarios }` e `Comentario { usuario: Usuario, data, texto }`. Não há `local` nem `idDispositivo`: o local é deduzido (hoje sempre a justificação) e a articulação acrescentará o seu vínculo. Ordenação, autoria (`isComentarioDoUsuario`), permissões (editar e excluir) e formatação da data ficam em funções puras (`comentarioUtil.ts`), testadas sem DOM.

- **Id da sequência**: `generateUUID()`, como o `id-revisao`. A c03 converte para `_tc<id>_<n>`.
- **Data**: ISO 8601 com fuso (`formatDateTimeToIso(formatDateTime(new Date()))`), o tipo que a c03 grava; a aba exibe dd/mm/aaaa hh:mm. A emenda usava `aaaa-mm-dd hh:mm:ss` sem fuso.
- **Texto**: string com quebras de linha; a c03 transforma cada linha num `p`.
- **Autoria**: compara `getIdUsuario` quando o autor tem id; sem id, compara o nome (spec "Autoria do comentário").

### Marcação no Quill: módulo da emenda portado

`moduloComentario.ts` é portado quase sem mudança: blot inline `comentario` com o atributo `id-sequencia-comentario`, cópia e colagem sem a marcação, e as consultas por id (existe, posição, texto, intervalos). É registrado em `configure-private-quill.ts`, como o de notas de rodapé. Um mesmo id pode ocupar vários elementos (o trecho é dividido por parágrafo ou por uma revisão), e todas as consultas tratam o conjunto. A tag fica só no editor; a c03 converte para `span` ao gravar.

### Editor de texto rico expõe uma API pequena

O editor ganha métodos públicos usados pelo componente raiz: `adicionarComentario(id, range)`, `removerComentario(id)`, `possuiComentario(id)`, `getTextoComentario(id)`, `getIndiceComentario(id)`, `posicionarCursorComentario(id)`, `registrarComentarioRemovido(id)` e `destacarComentario(id)`. Ele emite `abrir-modal-comentario` (com o trecho e o intervalo) e `comentario-selecionado` (id sob o cursor ou indefinido), e trata internamente o botão da barra, o destaque sob o cursor e o ícone ao fim do trecho.

### Remoção e desfazer: conjunto de ids removidos

Como na emenda (`9a727c57`): a cada mudança de texto, o componente raiz verifica se cada sequência ainda tem marcação; as que não têm são removidas da aba e o id vai para um conjunto do editor. A cada `text-change`, o editor retira a formatação dos ids desse conjunto (fonte `silent`). Assim o desfazer devolve o texto, mas não o destaque, e a sequência não volta. O conjunto é limpo em `setContent`.

### Revisão: portar `1a50302d` sobre a c01

O `moduloRevisao` ganha o botão "Adicionar comentário" no quadro (oculto se algum trecho da revisão já tiver comentário), que seleciona todos os trechos da revisão e emite `abrir-modal-comentario`. A aceitação e a rejeição de revisão dentro do trecho comentado passam a preservar a formatação de comentário (a emenda usa um caminho por delta quando a revisão tem comentário, `revisarComDeltaSeguro`). O CSS combina `comentario` com `ins`/`del`: o fundo amarelo fica no `comentario` e o traço da exclusão é repetido nele, como na emenda.

### Texto ao host sem marcação

`getProposicao()` entrega a justificação com as tags `comentario` desembrulhadas (o texto fica), usando a mesma rotina da colagem. `_lexmlJustificativa.texto` continua com a marcação, porque a c03 precisa dela para gravar o arquivo. `getDocumentoArticulado` não muda nesta change.

### Alerta e pendência

O alerta segue o padrão do alerta de revisão de texto (`TipoMensagem.INFO`, `podeFechar: true`, id `alerta-global-comentarios`), reavaliado a cada mudança na lista de sequências. A pendência "Remover comentários." entra em `getPendenciasPreenchimento`. A gravação dessa pendência no arquivo (`lexedit:Pendencias`) fica na c03, calculada no montador como a de revisões de texto.

### Aba e reinício

`tabIsVisible('comentarios')` é verdadeiro fora do anexo de parecer, e a aba entra antes de "Notas". `descartarDocumentoAtual` zera as sequências e o estado de destaque. A aba inicial do painel da direita continua "Notas".

## Risks / Trade-offs

- [O `moduloRevisao` local diverge do da emenda, e a parte de revisão foi a que mais rendeu código e testes lá] → portar por comportamento, guiado pelos testes de revisão da emenda (`editor-texto-rico.test.ts`, de "manter comentario quando trecho comentado for marcado como excluido" a "Nao deveria exibir botao de adicionar comentario no tooltip"), e manter os testes de revisão já existentes passando.
- [O ícone ao fim do trecho é posicionado sobre o editor e pode ficar fora do lugar ao rolar ou redimensionar] → reposicionar em `resize`, rolagem e mudança de texto, como a emenda (`agendarAtualizacaoIconesComentariosTexto`).
- [Até a c03, comentários se perdem ao salvar e reabrir] → c02 e c03 devem ser publicadas juntas; a c02 sozinha não é liberada para o host.
- [Marcação deixada no Quill sem sequência (ex.: falha no meio de uma operação)] → a mesma verificação a cada mudança de texto retira, sem gerar histórico, a marcação cujo id não tem sequência.
