## Why

A funcionalidade de salvar o documento articulado em Jsonix LexML já foi implementada e entregue nos commits de 15/09/2026 (`4f530a85`, `05c4392c`, `2833facd`, `8a1c3945`), fora da metodologia OpenSpec. Este change traz essa entrega para a metodologia, documentando o contrato de arquivo e o comportamento já implementados e testados, antes que o conhecimento fique preservado apenas em dois documentos soltos (`docs/extensao-formato-lexml/analise-plano-00-01.md` e `implementacao-00-01.md`, na raiz) que serão excluídos assim que seu conteúdo for absorvido pelos artefatos desta change.

## What Changes

- Define o contrato do arquivo de intercâmbio `documento-articulado.json`: raiz Jsonix `LexML`, com `Metadado/Identificacao/URN`, `ProjetoNorma/Norma/ParteInicial` (Epígrafe, Ementa, Preâmbulo) e `Articulacao`, conforme o XSD LexML e as especificações 00 e 01.
- Introduz identificação provisória por sentinelas (ano `9999`, número `999999`, na ordem `:ano;número`) para proposições ainda não numeradas, preservando integralmente a URN recebida (autoridade, data, evento) quando já definitiva.
- **BREAKING** (para o formato de arquivo da demonstração): o arquivo passa a ter a raiz Jsonix `LexML` diretamente, sem o invólucro `Proposicao` usado anteriormente pela demonstração. Arquivos antigos salvos pelo formato descontinuado não são compatíveis com o novo contrato de leitura (tratado na capability irmã `abrir-documento-articulado`).
- Expõe `getDocumentoArticulado()` (sincroniza a edição pendente e retorna um objeto independente), `salvarArquivoDocumentoArticulado()`, `serializarDocumentoArticulado()` e `NOME_ARQUIVO_DOCUMENTO_ARTICULADO` como APIs reutilizáveis por aplicações consumidoras.
- Adapta o botão Salvar da demonstração (`demo/components/demoview.ts`) para usar o novo fluxo.
- Corrige o exemplo invertido de URN provisória na especificação 01 (`:9999;999999`, e não `:999999;9999`).

Esta change não propõe trabalho futuro: descreve, com requisitos e cenários, o comportamento já implementado e coberto por testes automatizados (`test:documento-articulado`) e de integração com o conversor Jsonix real e o XSD (`test:documento-articulado:xml`).

## Capabilities

### New Capabilities
- `salvar-documento-articulado`: contrato do arquivo de intercâmbio `documento-articulado.json`, geração da identificação provisória/definitiva, serialização dos cinco grupos suportados (identificação, epígrafe, ementa, preâmbulo, articulação) e os seletores de arquivo usados para salvar (nativos ou download, com cancelamento e propagação de erros).

### Modified Capabilities
(nenhuma — `remissao-interna`, `remissao-externa` e `paginacao-articulacao` continuam com os mesmos requisitos; seus dados são apenas consumidos, já prontos, na serialização da articulação.)

## Impact

- **Código novo**: [documentoArticulado.ts](../../../src/model/lexml/documento/documentoArticulado.ts) (contrato, validação estrutural, serialização), [arquivoDocumentoArticulado.ts](../../../src/util/arquivoDocumentoArticulado.ts) (seletores de arquivo).
- **Código alterado**: [urnUtil.ts](../../../src/model/lexml/documento/urnUtil.ts) (`ANO_PROVISORIO`, `NUMERO_PROVISORIO`, `buildUrnProposicao`), [buildJsonixFromProjetoNorma.ts](../../../src/model/lexml/documento/conversor/buildJsonixFromProjetoNorma.ts) (parágrafos do preâmbulo), [lexml-eta-proposicao.component.ts](../../../src/components/lexml-eta-proposicao.component.ts) e [lexml-eta.component.ts](../../../src/components/lexml-eta.component.ts) (`getDocumentoArticulado()`, preservação da URN recebida), [src/index.ts](../../../src/index.ts) (exportação das novas APIs), [demoview.ts](../../../demo/components/demoview.ts) (botão Salvar).
- **Documentação**: `docs/extensao-formato-lexml/01-identificacao-provisoria-e-urn.md` corrigida; os dois documentos soltos que registravam esta entrega serão excluídos após esta change e a `2026-09-15-c02-abrir-documento-articulado` absorverem seu conteúdo.
- **Testes**: `test/model/documento/documentoArticulado.test.ts`, `test/util/arquivoDocumentoArticulado.test.ts`, `test/componente/lexml-eta/documentoArticulado.component.test.ts`, `test/integracao/documentoArticulado.integration.ts`, `web-test-runner.documento-articulado.config.mjs`, `scripts/ValidarDocumentoLexml.java`, `test/schemas/lexml/*` (XSD fixados na revisão `3f570910f6034d09e1bfb657b7e15ef2c6717012` do `jsonix-lexml`).
- **Sem impacto** em `eta-backend-services`, geração de PDF, ou nas especificações 02 a 13 — permanecem fora de escopo.
