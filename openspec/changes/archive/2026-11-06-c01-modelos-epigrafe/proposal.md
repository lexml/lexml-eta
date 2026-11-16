# Proposal

## Why

A epígrafe de uma nova proposição é sempre a do caso padrão (`<TIPO> Nº   , DE <ANO>`, `epigrafePadrao.ts`), o que está errado para substitutivo (SF e CD), subemenda substitutiva e PLV, cujas epígrafes citam o documento referenciado e, no Senado, o colegiado. A issue #1053 define modelos de epígrafe por autoridade no vocabulário e o serviço `montaEpigrafe`, que a especificação do componente de nova proposição já previa.

## What Changes

- Cada autoridade do vocabulário pode declarar `modelosEpigrafe` (código + modelo com placeholders). Os tipos de documento ganham os atributos opcionais `modeloEpigrafe` e `modeloEpigrafeSubstitutivo`. A mesclagem valida as referências e os códigos.
- Modelos iniciais: `substitutivo` (Senado); `substitutivo` e `subemenda.substitutiva` (Câmara); `plv` (Congresso). Os tipos do Senado que aceitam substitutivo apontam `modeloEpigrafeSubstitutivo` para `substitutivo`. O SBT e o PEP da Câmara apontam `modeloEpigrafe` para os seus modelos, e o PLV aponta `modeloEpigrafe` para `plv`.
- Novo serviço `montaEpigrafe(urn, urnDocumentoReferenciado?, sufixo?)`, exportado pelo pacote:
  - escolhe o modelo pelo tipo da URN;
  - substitui os placeholders da URN e do documento referenciado;
  - formata números com separador de milhar;
  - troca o número provisório por espaços e o ano provisório por vazio;
  - codifica em XML a descrição e o sufixo;
  - usa o modelo padrão como fallback.
- O componente de nova proposição passa a usar `montaEpigrafe`, com o sufixo já especificado: `- PLEN` ou `- <comissão>` no SF, nenhum na CD. O gerador provisório `montaEpigrafePadrao` é removido.
- A epígrafe passa a aceitar a quebra de linha `<br/>` ponta a ponta, **só na epígrafe**:
  - o documento da nova proposição grava o elemento `br`;
  - ao abrir um arquivo, o `br` é preservado (hoje é descartado);
  - a linha da epígrafe exibe a quebra no editor;
  - ao salvar, sai o elemento `br`, não o texto `<br/>` escapado.

  Ementa e dispositivos não mudam.

## Capabilities

### New Capabilities
- `epigrafe-proposicao`: montagem da epígrafe a partir dos modelos do vocabulário (seleção do modelo, placeholders, formatação, fallback) e preservação da quebra de linha da epígrafe ao criar, abrir, exibir e salvar o documento.

### Modified Capabilities
- `vocabulario-urn`: modelos de epígrafe por autoridade, atributos de modelo nos tipos de documento e validação dessas referências na mesclagem.
- `nova-proposicao`: a epígrafe do resultado passa a vir do serviço `montaEpigrafe`. Deixa de existir o caso provisório "serviço ainda não implementado".

## Impact

- Código:
  - vocabulário: `src/model/lexml/documento/vocabulario/` (tipos, dados das autoridades, mesclagem);
  - serviço: `src/model/lexml/documento/urnUtil.ts`, ou um módulo vizinho;
  - nova proposição: `src/components/nova-proposicao/` (remove `epigrafePadrao.ts`; `concluir()` passa a usar o serviço);
  - montagem do documento: `src/model/lexml/documento/modelo/montaDocumentoNovaProposicao.ts`;
  - conversores da epígrafe: `buildProjetoNormaFromJsonix.ts` e `buildJsonixFromProjetoNorma.ts`;
  - exibição da linha da epígrafe no Quill: `src/model/elemento/elementoUtil.ts` e `src/util/eta-quill/`;
  - export em `src/index.ts`.
- API pública: novo export `montaEpigrafe`, sem quebra. A epígrafe entregue pelo componente de nova proposição muda de texto nos casos com modelo e passa a poder conter `<br/>`. Avisar o `lexeditweb-editor`.
- Documentação: `docs/requisitos/vocabulario.md`, `docs/api-componente-lexml-eta.md`.
- Fora do escopo:
  - a descrição da PEC ("Proposta de Emenda Constitucional" × "Proposta de Emenda à Constituição" do exemplo da issue) segue a do vocabulário, para tratar em outra issue;
  - o `br` em ementa e dispositivos.
