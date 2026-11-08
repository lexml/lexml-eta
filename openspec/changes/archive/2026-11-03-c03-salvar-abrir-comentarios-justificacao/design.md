## Context

A c02 mantém as sequências no componente raiz (`SequenciaComentario { id, comentarios }`, `Comentario { usuario, data ISO com fuso, texto }`) e marca o trecho no Quill com a tag `comentario` e o atributo `id-sequencia-comentario`. `_lexmlJustificativa.texto` traz essa tag; `getProposicao()` não.

O precedente direto é a revisão de texto (#994, `2026-10-22-c01-salvar-abrir-revisoes-texto-justificacao`):

- `montaJustificacao(html)` (`conversor/justificacao.ts`) faz uma única varredura do HTML e devolve o conteúdo LexML **e** as marcas encontradas (`RevisaoTextualMontada[]`), com os ids `_rt<id-revisao>_<n>` calculados ali (invariante "ap" do CLAUDE.md: não recalcular ids numa segunda função).
- `montaMetadadoLexEdit` monta `RevisoesTextuais`, `Usuarios` (`montaUsuarios`, união por `idUsuario`) e a pendência.
- Ao abrir, `lerMetadadoLexEdit` devolve as revisões por id e `lerJustificacao(documento, revisoesTextuais)` recria as marcas no formato do editor.

Hoje um `<comentario>` é desembrulhado pela montagem (tag desconhecida vira só conteúdo), e um `span` lido volta como `span` comum, sem o `id`.

## Goals / Non-Goals

**Goals:**

- Gravar e ler `lexedit:Comentarios` exatamente como em `08-comentarios.md`, completado pela regra dos fragmentos.
- Ida e volta estável: salvar, abrir e salvar de novo produz o mesmo `Comentarios` e a mesma `Justificacao`.

**Non-Goals:**

- Comentários na articulação (o `refIdElementoComentado` de dispositivo é descartado ao abrir).
- Mudar o `lexedit.xsd`.

## Decisions

### Trechos comentados na mesma varredura das revisões

`VarreduraRevisoes` ganha a contagem por sequência (`porSequencia: Map<string, number>`) e a lista `trechosComentados: { idSequencia, id }[]`. Em `montaInline`, um elemento `COMENTARIO` com `id-sequencia-comentario` vira `span` com `id` `_tc<id>_<n>` e o conteúdo montado recursivamente (o que mantém `ins`/`del`, formatação e notas de rodapé dentro dele). `montaJustificacao` passa a devolver também `trechosComentados`. Os ids dos `span` e dos `ins`/`del` são calculados na mesma passada, pela mesma razão das revisões.

Um `comentario` vazio (só o caractere de cursor do Quill) não gera `span`, como `ehMarcaVazia` faz com as revisões. O id da sequência precisa caber num NCName depois do prefixo; um id fora do padrão recebe um substituto estável na varredura, como `idRevisaoEfetivo`, e o substituto é usado também no `refIdElementoComentado`.

Alternativa considerada: gravar o `span` só com `_tc<id>` quando há um fragmento. Rejeitada para ter uma regra só, igual à de `_rt`; a leitura aceita os dois.

### Sequências ao montador por `DadosLexEdit.comentarios`

`DadosLexEdit` ganha `comentarios?: SequenciaComentario[]`, preenchido por `getDocumentoArticulado` com as sequências do componente raiz (fora do anexo de parecer). `montaMetadadoLexEdit` recebe `trechosComentados` da varredura e grava só as sequências que têm trecho no texto, na ordem do primeiro fragmento, com `refIdElementoComentado` igual ao id do fragmento `_1`. Cada comentário vira `Comentario { refIdUsuario: getIdUsuario(usuario), data, p: linhas }`; uma linha vazia vira `p` vazio.

A pendência "Remover comentários." é calculada no montador, quando houver ao menos uma sequência gravada, e entra depois da de remissões internas inválidas e antes da de revisões de texto, como em `13-outros-metadados-do-lexedit.md`. Os autores entram em `montaUsuarios`, que passa a receber também os usuários dos comentários; a união continua por `idUsuario`.

### Leitura: metadado primeiro, depois o texto

`lerMetadadoLexEdit` ganha `lerComentarios(lexedit)`, tolerante como `lerRevisoesTextuais`: descarta sequência sem `refIdElementoComentado` de prefixo `_tc` e sem nenhum `Comentario`; autor sem registro em `Usuarios` vira `Usuario` com o próprio id; data inválida vira o instante da abertura; o texto é a junção dos `p` por quebra de linha. O resultado vai para `DadosLexEdit.comentariosLidos`, indexado pelo id da sequência (o ref sem `_tc` e sem o sufixo `_<n>`).

`lerJustificacao(documento, revisoesTextuais, comentariosLidos)` cria, para cada `span` de id `_tc…` cuja sequência existe, um elemento `comentario` com `id-sequencia-comentario`; os demais `span` `_tc` viram só conteúdo. A função devolve o HTML como hoje; o componente raiz confere quais sequências realmente têm trecho no editor (pela API da c02, `possuiComentario`) e descarta as demais, o que cobre a sequência cujo ref aponta para outro elemento.

### Ordem em `abrirDocumentoArticulado`

Depois de `setContent` da justificação: definir as sequências lidas, descartar as sem trecho e reavaliar o alerta de comentários (o `setContent` é silencioso, como já acontece com o alerta de revisão de texto). Isso fica depois de `inicializarEdicao`, que zera as sequências (`descartarDocumentoAtual`) e os alertas.

### Documentação do formato

`08-comentarios.md` ganha a seção "Id de cada fragmento" (no molde de `09-revisao-de-texto.md`) e os casos particulares de leitura; a tabela de `00-especificacao-esquema-lexedit.md` passa a "Implementado" para a justificação; a fixture `scripts/fixtures-lexedit/08-comentarios.xml` ganha um trecho em dois fragmentos.

## Risks / Trade-offs

- [O CLI `jsonix-lexml` pode descartar parte de `Comentarios` (já aconteceu com `Pena` no 2.1.0)] → a primeira tarefa é a prova de ida e volta com o CLI real e a validação pelo `lexedit.xsd`, antes do resto.
- [Um `span` `_tc` dentro de uma célula de tabela convive com o `span` de classe `p` que representa o parágrafo da célula] → a leitura distingue pelo id (`_tc`) e pela classe (`p`); teste com comentário dentro de tabela.
- [Documento de outra versão com comentários na articulação perde esses comentários ao ser salvo de novo nesta versão] → aceito até a change da articulação; registrado na spec de abertura.
- [Mudar a ordem das pendências afeta quem compara a lista literalmente] → só acrescenta um item no meio; os cenários existentes da ordem continuam válidos.
