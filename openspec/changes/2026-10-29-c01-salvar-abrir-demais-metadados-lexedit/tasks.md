# Tasks

## 1. Conversor: gravar e ler `dataUltimaModificacao`

- [x] 1.1 Declarar `dataUltimaModificacao?: string` em `MetadadoLexEdit` e em `DadosLexEdit` (`documentoArticulado.ts`). Em `montaMetadadoLexEdit` (`buildJsonixFromProjetoNorma.ts`), gravar o valor recebido em `dados` e omitir sem ele (D1). Não gravar `aplicacao` nem `versaoAplicacao`. Verificar com os testes da 1.3.
- [x] 1.2 Em `lerMetadadoLexEdit` (`buildProjetoNormaFromJsonix.ts`), ler `dataUltimaModificacao` de forma tolerante (forma de `xsd:dateTime` e `Date.parse` válido) e devolvê-la como gravada em `DadosLexEdit` (D3). Ignorar `aplicacao`/`versaoAplicacao`. Verificar com os testes da 1.3.
- [x] 1.3 Testes unitários em `test/model/documento/` (arquivo novo `dataUltimaModificacao.test.ts`):
  - grava o valor recebido;
  - omite sem dados e sem o campo;
  - não grava `aplicacao`/`versaoAplicacao`;
  - lê valor com fuso, com `Z` e com frações;
  - valor ausente, vazio ou inválido vira indefinido sem afetar outro grupo (ex.: opções de impressão);
  - ignora `aplicacao`/`versaoAplicacao` lidos;
  - ida e volta no modelo (`criarDocumentoArticulado(reaberto, …, dados)` igual ao salvo).

  Verificar com `npm test` passando.
- [x] 1.4 Atualizar a documentação do formato e verificar relendo os trechos:
  - `docs/extensao-formato-lexml/13-outros-metadados-do-lexedit.md`: `dataUltimaModificacao` é o instante do salvamento, com fuso, e `aplicacao`/`versaoAplicacao` ainda não são gravados;
  - a linha `13` da tabela do `00-especificacao-esquema-lexedit.md`.

## 2. Componente: gravar ao salvar e expor ao abrir

- [x] 2.1 Em `lexml-eta.component.ts`, `getDocumentoArticulado` passa `dataUltimaModificacao: formatDateTimeToIso(formatDateTime(new Date()))` (D2). Criar o getter público somente leitura `dataUltimaModificacaoDocumento` sobre um campo privado, preenchido em `abrirDocumentoArticulado` depois de `inicializarEdicao` e zerado em `descartarDocumentoAtual` (D4). Verificar com os testes da 2.2.
- [x] 2.2 Testes em `test/componente/lexml-eta/documentoArticulado.component.test.ts`, com o relógio congelado por `sinon.useFakeTimers({ now, toFake: ['Date'] })` e restaurado no `afterEach` (D6):
  - salvar grava o instante congelado, com fuso;
  - salvar de novo, depois de avançar o relógio, grava o novo instante;
  - abrir arquivo com a data preenche a propriedade, e obter o documento não a altera;
  - abrir arquivo sem a data, ou com data inválida, deixa a propriedade indefinida, e o documento abre com os demais metadados;
  - `novaProposicao` e `fecharDocumento` deixam a propriedade indefinida.

  Ajustar os testes existentes que salvam duas vezes e comparam os arquivos (`documentoArticulado.component.test.ts` e `anexos.component.test.ts`) para usar o relógio congelado, e o que compara o `lexedit` inteiro para incluir a data. Verificar com `npm test` passando.
- [x] 2.3 Documentar e verificar relendo os trechos:
  - `docs/api-componente-lexml-eta.md`: a propriedade `dataUltimaModificacaoDocumento` na tabela de propriedades, ao lado da explicação de que `Proposicao.dataUltimaModificacao` é o campo "Data" do fecho, e a menção em `abrirDocumentoArticulado`;
  - `CLAUDE.md`: novo item com o padrão D1 (data gerada no componente, conversor determinístico) e o nome da propriedade.

## 3. Integração com o conversor real

- [x] 3.1 Em `test/integracao/documentoArticulado.integration.ts`, incluir `dataUltimaModificacao` no cenário que reúne os grupos do LexEdit. Conferir:
  - o XML gerado traz o atributo em `lexedit:Metadado` e valida com `schemas/lexedit.xsd`;
  - o `MetadadoProprietario` convertido de volta é igual ao salvo;
  - o documento reaberto e salvo de novo com os dados lidos é igual ao original.

  Se o CLI normalizar o valor, registrar no design e levar a decisão ao usuário antes de seguir. Verificar com `JSONIX_LEXML_CLI=C:/jsonix-lexml-win/desenv/jsonix-lexml-win.exe npm run test:documento-articulado:xml`: os cenários desta change passam, e as falhas já conhecidas, que dependem do CLI 2.3.0, ficam registradas.

## 4. E2E

- [x] 4.1 Gerar `demo/doc/teste_data_ultima_modificacao.json` pelo `getDocumentoArticulado()` real, não à mão (D7), e conferi-lo com o CLI (`toxml` + `lexedit.xsd`). Verificar abrindo o arquivo pelo demo.
- [x] 4.2 Criar `cypress/e2e/documento-articulado/abertura-data-ultima-modificacao.cy.ts`, com `export {};` no topo, seguindo `docs/guia-cypress.md`, sem download. Casos:
  - abrir o fixture pela UI deixa `dataUltimaModificacaoDocumento` com o valor do arquivo;
  - `getDocumentoArticulado()` devolve um `dataUltimaModificacao` com fuso e posterior ao do arquivo, e a propriedade não muda;
  - abrir em seguida um fixture sem o atributo (ex.: `demo/doc/teste_justificacao.json`) deixa a propriedade indefinida.

  Verificar com `npx cypress run --env envName=local --spec cypress/e2e/documento-articulado/abertura-data-ultima-modificacao.cy.ts` passando.

## 5. Verificação final

- [x] 5.1 Rodar a suíte `npm test` completa e os specs `cypress/e2e/documento-articulado/*`. Verificar que passam, salvo as falhas que já existem na `develop` (`anexo-parecer-data-fecho.cy.ts` e os specs de pena), que devem continuar registradas sem piorar.
