## Context

Ver proposal.md (Why). Reproduzido com Cypress (`digitarTextoRemissao` + `dispararDeteccaoRemissao`): com o mesmo texto, o Art. 1º ganha o link e a ementa não. Caminho da remissão externa e o que acontece com a ementa:

- Detecção (`editor.component.ts#coordenarDeteccaoExterna`): roda ao sair de qualquer linha, inclusive a ementa; depois do lexml-linker, `findDispositivoByUuid(articulacao, sourceUuid, true)` confere se o texto ainda é o mesmo. A ementa está em `articulacao.projetoNorma.ementa`, fora da árvore: a busca devolve `null` e a detecção é descartada.
- Registro (`adicionaRemissaoExterna`): só usa a articulação para preencher a norma alterada de um artigo; para a ementa não faz nada, e o registro fica certo.
- Desenho (`moduloRemissao.renderizarRemissoesExternasDoState`): acha a linha por `#texto__dispositivo<uuid>`, que a ementa tem.
- Gravação (`buildJsonixFromProjetoNorma.ts#montaParteInicial`): a ementa é serializada por `buildStructuredContent(projetoNorma.ementa, 'texto')`, sem as remissões externas; como o link da sessão só existe no Quill (CLAUDE.md, item 16), ele não chega ao arquivo.
- Abertura e desfazer (`inicializaRemissoesExternasAoAbrir`): já varrem a ementa.

## Goals / Non-Goals

**Goals:**
- A ementa tem remissão externa de ponta a ponta: detecção, gravação e abertura.

**Non-Goals:**
- Preâmbulo (sem cursor e, por decisão anterior, sem remissão: invariante (ag) do CLAUDE.md).
- Remissão interna na ementa.

## Decisions

**1. Na detecção, achar o dispositivo da linha também na ementa, por uma busca local.** Uma função que tenta a articulação (`findDispositivoByUuid`) e, sem resultado, a ementa pelo uuid, usada só na conferência do texto em `coordenarDeteccaoExterna`. A conferência de norma alterada logo abaixo continua só na articulação (só artigo tem bloco de alteração).
- Alternativa descartada: ensinar `findDispositivoByUuid` a devolver a ementa. Tem muitos consumidores (remissão interna, comentários, revisões) que assumem a árvore da articulação; a ementa apareceria, por exemplo, como destino de remissão interna.

**2. Na gravação, passar as remissões externas para a ementa.** `montaParteInicial(projetoNorma, remissoesExternas?)` repassa o registro ao `buildStructuredContent` da ementa, que já injeta os links cujo `sourceUuid` é o do dispositivo. O parâmetro é opcional, porque `dadosBasicos.ts` também monta a parte inicial (só epígrafe e preâmbulo).

## Risks / Trade-offs

- [Citação da ementa em documento aberto que nunca passou pela linha da ementa] → como nos dispositivos, o link só nasce na primeira saída da linha (a detecção externa não roda na abertura); igual ao corpo do texto, não muda aqui.
