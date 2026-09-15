## Why

A funcionalidade de abrir o documento articulado (`documento-articulado.json`) já foi implementada nos mesmos commits de 15/09/2026 que a de salvar (`05c4392c`, `2833facd`, `8a1c3945`), fora da metodologia OpenSpec. Esta change completa a captura retroativa iniciada em `2026-09-15-c01-salvar-documento-articulado` — que definiu o contrato do arquivo — documentando agora o comportamento de leitura. Depois desta change, os dois documentos soltos que registravam a entrega (`docs/extensao-formato-lexml/analise-plano-00-01.md` e `implementacao-00-01.md`, na raiz) são excluídos, já com o conteúdo absorvido pelas duas changes.

## What Changes

- Implementa `abrirDocumentoArticulado()`, `abrirArquivoDocumentoArticulado()`, `lerDocumentoArticulado()` e `lerArquivoDocumentoArticulado()` como APIs de leitura.
- Valida estruturalmente o documento recebido (raiz `LexML`, formato da URN, listas de dispositivos, IDs não repetidos) antes de substituir o documento em edição — rejeitando o formato antigo com invólucro `Proposicao` usado pela demonstração anterior.
- Preserva a URN recebida ao abrir, inclusive quando provisória, e recupera identificação, parte inicial (epígrafe, ementa e preâmbulo com todos os parágrafos, não apenas o primeiro) e articulação completos.
- Preserva caracteres literais (aspas retas) no novo caminho de abertura, distinto do caminho legado de inicialização de novo documento, que mantém a normalização tipográfica padrão.
- Adapta os comandos Abrir da demonstração (seleção de arquivo e seletor nativo) para usar o novo fluxo.

Esta change não propõe trabalho futuro: descreve, com requisitos e cenários, o comportamento já implementado e coberto pelos mesmos testes automatizados e pela suíte de integração com o XSD citados em `2026-09-15-c01-salvar-documento-articulado`.

## Capabilities

### New Capabilities
- `abrir-documento-articulado`: leitura e validação estrutural do arquivo de intercâmbio definido pela capability irmã `salvar-documento-articulado`, reconstrução do documento no editor, seletores de abertura e tratamento de cancelamento e erros.

### Modified Capabilities
(nenhuma — `salvar-documento-articulado` não muda; esta capability apenas consome o contrato que ela define.)

## Impact

- **Código reaproveitado (já criado por c01)**: [documentoArticulado.ts](../../../src/model/lexml/documento/documentoArticulado.ts) (`lerDocumentoArticulado`, `validarDocumentoArticulado`), [arquivoDocumentoArticulado.ts](../../../src/util/arquivoDocumentoArticulado.ts) (`abrirArquivoDocumentoArticulado`, `lerArquivoDocumentoArticulado`).
- **Código alterado**: [lexml-eta.component.ts](../../../src/components/lexml-eta.component.ts) (`abrirDocumentoArticulado()`, `inicializarEdicao` com `preservarTextoDocumento`), [lexml-eta-proposicao.component.ts](../../../src/components/lexml-eta-proposicao.component.ts) (`inicializarEdicao`/`loadProjetoNorma` com `preservarTextoDocumento`), [buildProjetoNormaFromJsonix.ts](../../../src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix.ts) (`preservarTexto`, `escaparTextoJsonix`, leitura completa da parte inicial), [demoview.ts](../../../demo/components/demoview.ts) (comandos Abrir).
- **Documentação**: consome o contrato definido por `2026-09-15-c01-salvar-documento-articulado`; após esta change, `docs/extensao-formato-lexml/analise-plano-00-01.md` e `implementacao-00-01.md` (raiz) são excluídos.
- **Testes**: mesmos arquivos de teste listados em `2026-09-15-c01-salvar-documento-articulado` (suíte compartilhada entre salvar e abrir), com os casos específicos de leitura (entrada inválida, cancelamento na abertura, preservação literal de aspas retas).
- **Sem impacto** em `eta-backend-services`, geração de PDF, ou nas especificações 02 a 13 — permanecem fora de escopo.
