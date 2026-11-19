# Design

## Context

Motivação e escopo: ver `proposal.md`.

- A #1059 (change arquivada `2026-11-13-c01-importar-documento-nova-proposicao`) criou um caminho próprio para o documento importado: `detail.documentoImportado` na `nova-proposicao` e `novaProposicaoImportada` no `lexml-eta`, que abre o arquivo pelo `abrirDocumentoLido` e traz justificação, revisões, autoria e demais metadados. A #1102 manda voltar ao caminho do modelo.
- O caminho do modelo é `novaProposicao` com `documentoModelo`: `lerDocumentoArticulado` (que valida a casa da URN do arquivo) e `montaDocumentoNovaProposicao`, que troca a parte inicial, apaga a parte final e tenta apagar os metadados com `delete valor.metadadoProprietario`. Como os metadados ficam em `valor.metadado.metadadoProprietario`, o `delete` não apaga nada. Em `lexml-eta-proposicao.component.ts#loadProjetoNorma`, `lerIdsRemissoesInvalidas` e `lerSituacaoNaNormaVigente` leem esse documento, e por isso a situação Existente/Novo e as remissões inválidas do modelo são aplicadas. A justificação (`projetoNorma.justificacao`) também fica no documento: não é exibida, porque `novaProposicao` não chama `setContent`, mas não deveria estar lá.
- O lexml-emenda não valida a casa da URN do documento recebido: a casa vem do host (`inicializaCasaLegislativa`). No ETA, a recusa de documento da outra casa (#1026) existe para não **editar** um documento com identidade da outra casa; no modelo, a URN do arquivo é sempre trocada pela informada.

## Goals / Non-Goals

**Goals:**
- Um só caminho para criar a partir de documento existente (importado, referenciado ou de outra proposição), que aproveita apenas ementa e articulação.
- Garantir, por teste, que nenhum metadado do modelo chega ao documento novo.

**Non-Goals:**
- Mudar a importação em si (URL, callback, `.json`, alertas de 400/500, serviço simulado da demo).
- Mudar o "Abrir" e o "Alterar dados básicos", que continuam aproveitando todo o documento.

## Decisions

### 1. Remover o caminho próprio da importação, não adaptá-lo

`detail.documentoImportado`, `DadosNovaProposicao.documentoImportado` e `novaProposicaoImportada` saem; o importado vai em `detail.texto`, e o host o passa em `documentoModelo`.

- Alternativa descartada: manter `documentoImportado` e fazê-lo cair no modelo dentro do `lexml-eta`. Manteria dois nomes para a mesma coisa e a coordenação com o host, que hoje trata só `texto`.

### 2. Limpar o modelo em `montaDocumentoNovaProposicao`

O ponto único de montagem passa a apagar `valor.metadado.metadadoProprietario` (todos os grupos, não só os do LexEdit, porque nada do modelo deve sobreviver além de ementa e articulação) e `valor.projetoNorma.justificacao`. O `delete valor.metadadoProprietario` atual, sem efeito, é trocado.

- Alternativa descartada: filtrar na leitura (`loadProjetoNorma`). Espalharia a regra por cada leitor de metadado, e um leitor novo voltaria a vazar.

### 3. Não validar a casa da URN do modelo

`novaProposicao` lê o modelo com `lerDocumentoArticulado(…, { verificarCasa: false })`, opção criada na #1059 e mantida. A URN informada continua passando por `verificarUrnDaCasaDoEditor` e `verificarUrnParaNovaProposicao`. Com isso, a demo deixa de usar `derivarParaCamara` no `texto` (a função continua servindo à lista de documentos da Câmara).

### 4. Retirar o que só servia ao alerta de anexos

As opções `variante`/`duracao`/`icone` do `alertarInfo` voltam ao formato anterior (sem parâmetro de opções); saem a regra `sl-alert[variant='warning']` de `editor.component.ts`, a classe `alerta--botao-centralizado` de `alertas.component.ts` e a constante `ALERTA_ANEXOS_NAO_RECUPERADOS` de `model/alerta/alerta.ts`. Nenhum outro ponto usa essas peças.

## Risks / Trade-offs

- [Host que já tivesse adotado `documentoImportado`] → nenhum host conhecido adotou; o `lexeditweb-editor` ainda não configurou a importação.
- [Documento de outra casa com articulação que referencia normas ou dispositivos da outra casa] → ementa e articulação são aproveitadas como texto, como já acontecia com o modelo da demo derivado para a Câmara.
- [Remissões internas do modelo] → os links no texto da articulação continuam (fazem parte dela); só a lista de inválidas do arquivo deixa de ser aplicada, e a detecção ao abrir recalcula as que não resolvem.

## Migration Plan

Avisar o `lexeditweb-editor` de que `documentoImportado` não existe mais: o documento importado chega em `texto` e vai para `documentoModelo`.
