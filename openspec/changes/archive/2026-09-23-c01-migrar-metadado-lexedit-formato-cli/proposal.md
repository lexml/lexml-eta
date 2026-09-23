## Why

O conversor `jsonix-lexml` 2.0.0 (publicado em 23/09/2026) passou a transportar o conteúdo de `MetadadoProprietario` usando os mapeamentos gerados a partir de `schemas/lexedit.xsd`. Ele espera o `lexedit:Metadado` dentro de `any[]`, como elemento nomeado. O editor ainda grava o formato provisório `lexedit: {...}`, criado quando o CLI descartava esse conteúdo. Com isso, o CLI novo ignora os metadados sem avisar e gera `<MetadadoProprietario fonte="..."/>` vazio: foi o que aconteceu com o arquivo salvo da MPV 905/2019. Há um caso mais grave: com remissão interna inválida, o `refIdsRemissoesInternas` sai como array, o CLI quebra (`must be a string`) e não gera o XML.

## What Changes

- **BREAKING (formato do arquivo):** ao salvar, o conteúdo do LexEdit passa a ser gravado em `metadadoProprietario[0].any[0]`, com `name` igual a `{http://www.lexml.gov.br/lexedit/1.0}lexedit:Metadado` e `value` tipado (`TYPE_NAME` `br_gov_lexml_lexedit__1.*`), como em `docs/extensao-formato-lexml/documento-articulado-exemplo.json`. A chave `lexedit` deixa de ser gravada.
- `refIdsRemissoesInternas` passa a ser gravado como uma string com os ids separados por espaço (`xsd:string` em `lexedit.xsd`), não como array.
- `pendencias` passa a ser gravado como `{ pendencia: [...] }`, que é o formato que o CLI devolve no `tojson`.
- Ao abrir, o editor lê o formato novo. Continua lendo também o formato provisório `lexedit`, para não perder os metadados dos arquivos já salvos.
- O teste de integração com o CLI real deixa de fixar a limitação antiga e passa a exigir ida e volta completa do `lexedit` (`toxml` → `tojson` → abrir → salvar dá o mesmo documento). A validação XSD passa a usar `schemas/lexedit.xsd` como entrada, para validar também o conteúdo dos metadados.
- As fixtures de `demo/doc/` usadas pelo E2E são geradas de novo no formato novo.
- O item 13 do `CLAUDE.md` e o plano do XSD passam a registrar o formato definitivo.

Fora do escopo:
- Grupos do LexEdit ainda não implementados (autoria, anexos etc.).
- A correção do CLI que devolve código 0 quando o `toxml` falha. Ela pertence ao repositório `jsonix-lexml` e fica registrada como recomendação.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `metadados-lexedit`: define o formato do ponto de extensão no arquivo (elemento nomeado `lexedit:Metadado` dentro de `any`, compatível com o conversor `jsonix-lexml` 2.0.0, com as formas de `refIdsRemissoesInternas` e `pendencias`), exige ida e volta pelo conversor real e passa a aceitar a leitura do formato provisório `lexedit` como legado.

## Impact

- **Código:**
  - `src/model/lexml/documento/conversor/buildJsonixFromProjetoNorma.ts` (`montaMetadadoLexEdit`, `montaMetadadoProprietario`);
  - `src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix.ts` (`lerMetadadoLexEdit`, `lerIdsRemissoesInvalidas`);
  - `src/model/lexml/documento/documentoArticulado.ts` (tipos `MetadadoLexEdit` e `MetadadoProprietarioLexEdit`).
- **Testes:**
  - unitários de `opcoesImpressao`, `localDataFecho`, `buildProjetoNormaFromJsonix` e `buildJsonixFromProjetoNorma.content`;
  - de componente, `documentoArticulado.component.test.ts`;
  - de integração, `test/integracao/documentoArticulado.integration.ts` e `web-test-runner.documento-articulado.config.mjs`.
- **Fixtures:** `demo/doc/teste_opcoes_impressao.json`, `teste_fecho_com_data.json`, `teste_fecho_sem_data.json` e `teste_remissao_invalida.json`.
- **Dependência externa:** os testes de integração passam a exigir o `jsonix-lexml` 2.0.0 em `JSONIX_LEXML_CLI`, porque a versão 1.0.0 descarta o conteúdo.
- **Consumidores:** o `lexeditweb-editor` recebe o JSON no formato novo. O binário que ele já traz (`jsonix-lexml-win.exe` 2.0.0) é justamente o que espera esse formato.
