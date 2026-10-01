## 1. Tipos do ponto de extensão

- [x] 1.1 Em `src/model/lexml/documento/documentoArticulado.ts`, fazer `MetadadoLexEdit` descrever o `value` tipado do `lexedit:Metadado`: `TYPE_NAME`, `refIdsRemissoesInternas: string` e `pendencias: { TYPE_NAME; pendencia: string[] }`. `MetadadoProprietarioLexEdit` passa a ter `any: [{ name, value }]` no lugar de `lexedit`. Criar um tipo de legado para o formato provisório e manter `DadosLexEdit` sem mudança (design, Decisão 3). Conferir com `tsc` os pontos que quebram e só corrigi-los nas tasks seguintes.

## 2. Salvar no formato novo

- [x] 2.1 Em `buildJsonixFromProjetoNorma.ts`, fazer `montaMetadadoProprietario` gravar `any: [{ name: { namespaceURI, localPart: 'Metadado', prefix: 'lexedit', key, string }, value }]`. `montaMetadadoLexEdit` passa a gravar `TYPE_NAME` em `value` e nos grupos, `refIdsRemissoesInternas` com os ids separados por espaço e `pendencias` como `{ TYPE_NAME, pendencia }` (design, Decisões 1 e 2). O objeto gerado deve ser igual, campo a campo, ao do exemplo `docs/extensao-formato-lexml/documento-articulado-exemplo.json` para os mesmos grupos.
- [x] 2.2 Atualizar os testes unitários que leem `metadadoProprietario[0].lexedit`: `opcoesImpressao.test.ts`, `localDataFecho.test.ts`, `buildJsonixFromProjetoNorma.content.test.ts` e `documentoArticulado.component.test.ts`. Acrescentar testes para a string com dois ids, para `pendencias` no formato de objeto e para a ausência da chave `lexedit` no arquivo salvo.

## 3. Abrir os formatos novo e provisório

- [x] 3.1 Em `buildProjetoNormaFromJsonix.ts`, criar um ponto único que localiza o conteúdo do LexEdit: primeiro o item de `any[]` com o namespace do LexEdit e `localPart` `Metadado`, depois o `lexedit` do formato provisório. `lerMetadadoLexEdit` e `lerIdsRemissoesInvalidas` passam a usá-lo, e os ids são lidos de string (`split(/\s+/)`, descartando vazios) ou de array (legado) (design, Decisão 4).
- [x] 3.2 Testes unitários em `buildProjetoNormaFromJsonix.test.ts` para:
  - o formato novo com todos os grupos;
  - o formato provisório com todos os grupos;
  - os dois formatos no mesmo arquivo (vale o novo);
  - o formato novo sem `TYPE_NAME`;
  - string de ids com espaços extras.
- [x] 3.3 Testes de componente em `documentoArticulado.component.test.ts`: abrir um documento no formato provisório (opções de impressão, fecho e remissão inválida) e salvá-lo gera somente o formato novo, com os mesmos valores.

## 4. Integração com o CLI real, fixtures e E2E

- [x] 4.1 Em `web-test-runner.documento-articulado.config.mjs`:
  - validar com `schemas/lexedit.xsd` como entrada;
  - verificar se o arquivo de saída do CLI existe depois do `toxml`/`tojson`, e falhar com mensagem clara se não existir;
  - citar a versão 2.0.0 na mensagem de `JSONIX_LEXML_CLI`;
  - remover o comando `toxml-e-validar-lexml`.

  (design, Decisão 5.)
- [x] 4.2 Em `test/integracao/documentoArticulado.integration.ts`:
  - os cenários de opções de impressão e de fecho passam a exigir ida e volta completa (`deep.equal` com o salvo, sem remover `metadadoProprietario`);
  - o cenário de remissão inválida passa a usar `validar-documento-lexml` e a conferir `refIdsRemissoesInternas` no XML e os ids lidos de volta;
  - novo cenário com os quatro grupos no mesmo documento;
  - novo cenário negativo que confirma a detecção pelo XSD de um valor inválido dentro do `lexedit` (ex.: `tamanhoFonte` não numérico).

  Rodar com `JSONIX_LEXML_CLI` apontando para o `jsonix-lexml` 2.0.0.
- [x] 4.3 Antes de gerar as fixtures de novo, preservar a `demo/doc/teste_opcoes_impressao.json` atual (formato provisório) como `demo/doc/teste_metadado_lexedit_provisorio.json`. Depois, gerar de novo, via `criarDocumentoArticulado` e não à mão, `teste_opcoes_impressao.json`, `teste_fecho_com_data.json`, `teste_fecho_sem_data.json` e `teste_remissao_invalida.json`. Conferir as quatro com o CLI 2.0.0 (`toxml` com o `lexedit` preenchido).
- [x] 4.4 E2E (Cypress, consultar `docs/guia-cypress.md`):
  - em `abertura-opcoes-impressao.cy.ts`, novo caso que abre `teste_metadado_lexedit_provisorio.json` pela UI real e confere o formulário de opções de impressão;
  - rodar os specs de `cypress/e2e/documento-articulado/` e `abertura-remissao-invalida-persistida.cy.ts` com as fixtures novas, contra um servidor que sirva o build atual;
  - confirmar que o caso novo detecta a falha retirando temporariamente a leitura do formato provisório.

  O lado de salvar continua sem E2E (sem infraestrutura de download, mesma decisão das changes anteriores), coberto por 2.2, 3.3 e 4.2.

## 5. Regressão completa e documentação

- [x] 5.1 Rodar o `npm test` completo e a suíte de integração, e rodar de novo os specs Cypress da 4.4 depois do `npm test` (que apaga o `out-tsc`).
- [x] 5.2 Atualizar:
  - o item 13 do `CLAUDE.md`: formato definitivo, fim da "limitação do CLI atual", leitura do legado, validação com `lexedit.xsd` e o risco do código 0;
  - `docs/extensao-formato-lexml/plano-xsd-lexedit.md` (risco "CLI descarta o conteúdo" resolvido);
  - a recomendação ao repositório `jsonix-lexml` sobre o código de saída, que fica registrada no `design.md` e é informada ao usuário.
