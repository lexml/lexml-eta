# Proposal

## Why

A especificação 13 prevê em `lexedit:Metadado` atributos gerais do arquivo que o editor ainda não grava. Entre eles está `dataUltimaModificacao`, que diz quando o documento foi salvo pela última vez. Sem ela, o host não sabe, a partir do próprio arquivo, quando a proposição foi modificada. Esta é a issue #997 (item 11 de `docs/extensao-formato-lexml/issues.md`), a última pendente dos atributos de `lexedit:Metadado`: `anexoParecer` e `urnDocumentoReferenciado` já são gravados.

## What Changes

- Ao salvar, o editor grava `dataUltimaModificacao` (`xsd:dateTime`) com o instante do salvamento, em ISO 8601 com o fuso local.
- Ao abrir, o editor lê `dataUltimaModificacao` de forma tolerante (ausente ou inválido equivale a não informado) e a expõe numa propriedade pública somente leitura do componente, para o host. Salvar de novo grava sempre o novo instante.
- `aplicacao` e `versaoAplicacao` não são gravados por enquanto e são ignorados ao abrir.
- A ida e volta pelo conversor `jsonix-lexml` passa a incluir `dataUltimaModificacao`, validada com `schemas/lexedit.xsd`. Salvar de novo um documento reaberto só difere do original nesse atributo.
- **Fora do escopo:** `substitutivo`. O texto da issue #997 no GitHub ainda o cita, mas ele já foi retirado do esquema (#1017, registrado em `issues.md`). A spec mantém o requisito "Flag de substitutivo fora do formato salvo", e a #1056 passou a derivar o substitutivo da URN (`isSubstitutivo`).

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `metadados-lexedit`: novo requisito de gravação e leitura de `dataUltimaModificacao` (com `aplicacao` e `versaoAplicacao` omitidos), novo requisito da propriedade pública com a data lida, e exceção de `dataUltimaModificacao` no requisito de ida e volta pelo conversor.

## Impact

- **Código:** `documentoArticulado.ts` (`MetadadoLexEdit`, `DadosLexEdit`), `buildJsonixFromProjetoNorma.ts` (`montaMetadadoLexEdit`), `buildProjetoNormaFromJsonix.ts` (`lerMetadadoLexEdit`), `lexml-eta.component.ts` (`getDocumentoArticulado`, `abrirDocumentoArticulado`, `descartarDocumentoAtual` e a nova propriedade).
- **API pública:** uma propriedade nova, somente leitura, em `LexmlEtaComponent`, documentada em `docs/api-componente-lexml-eta.md`. Não é uma mudança que quebre o host.
- **Formato do arquivo:** `lexedit:Metadado` ganha `dataUltimaModificacao` nos arquivos salvos pelo editor. Arquivos antigos abrem sem ela.
- **Testes:** os testes de componente que salvam duas vezes e comparam os arquivos passam a congelar o relógio. Os de modelo e de integração não mudam, porque a data lida é regravada.
- **Documentação:** especificação 13, tabela do `00-especificacao-esquema-lexedit.md` e `CLAUDE.md`.
