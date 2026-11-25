## Context

Ver proposal.md (Why). Caminho do rótulo do artigo:

- Regra (`numeracaoArtigo.ts#createRotulo`): fora de bloco de alteração, a articulação com um só artigo dá "Artigo único." e as demais dão "Art. Nº". Só roda na renumeração (incluir, excluir, mover, desfazer).
- Abertura (`buildProjetoNormaFromJsonix.ts#buildDispositivo`): copia o `rotulo` do documento e deriva o número com `createNumeroFromRotulo`, sem passar pela regra. Documentos reais com um só artigo já trazem "Artigo único." (como `test/doc/exemplo-artigo-unico.ts`).
- Documento vazio (`documentoPadrao.ts`, `DOCUMENTO_PADRAO`): um artigo `art1` com `rotulo: 'Art. 1º'` e caput vazio. É o documento da nova proposição com texto vazio (`montaDocumentoNovaProposicao` sem modelo) e da carga sem documento (`loadProjetoNorma`).

## Goals / Non-Goals

**Goals:**
- A proposição com texto vazio começa com "Artigo único.", como depois da renumeração.

**Non-Goals:**
- Recalcular o rótulo de documento aberto de arquivo, modelo ou importação.
- Mudar a regra de numeração ou a renumeração.

## Decisions

**1. Corrigir o rótulo no documento padrão.** `DOCUMENTO_PADRAO` passa a trazer `rotulo: 'Artigo único.'`. `createNumeroFromRotulo` já reconhece o rótulo (número `1`, `informouArtigoUnico`), e `buildHref` mantém o id `art1` (o sufixo `1u` só vale para parágrafo). A renumeração seguinte ignora `informouArtigoUnico` fora de bloco de alteração, então incluir um artigo dá "Art. 1º" e "Art. 2º".
- Alternativa descartada: recalcular o rótulo ao abrir todo documento com um só artigo. Mudaria a tela e o arquivo salvo de documentos abertos sem ação do usuário e exigiria separar os blocos de alteração. Fica para outra issue, se for o caso.

**2. Ensinar o comando Cypress a achar o artigo único.** `getContainerArtigoByNumero(1)` passa a aceitar também "Artigo único.". Os specs que começam com `cy.novaProposicao()` continuam sem mudança, e o comando localiza o artigo 1 nos dois rótulos, como o usuário o vê.

## Risks / Trade-offs

- [Spec que compare o rótulo literal "Art. 1º" logo depois de `cy.novaProposicao()`] → rodar os 41 specs que usam `cy.novaProposicao()` e comparar com as falhas já conhecidas (TODO).
- [Remissão interna ao artigo único criada na sessão] → o texto canônico de remissão já trata "artigo único" (`lexmlIdUtil.ts`); igual ao documento com "Artigo único." aberto de arquivo, não muda aqui.
