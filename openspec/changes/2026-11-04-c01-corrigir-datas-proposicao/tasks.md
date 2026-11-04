# Tasks

## 1. Modelo e componente

- [x] 1.1 Em `src/model/proposicao/proposicao.ts`, criar `data = ''` e inicializar `dataUltimaModificacao` com `formatDateTimeToIso(formatDateTime(new Date()))`, no bloco de metadados padronizados (D1, D2). Verificar com o `tsc` sem erros.
- [x] 1.2 Em `src/components/lexml-eta.component.ts`, `getProposicao` passa a preencher `data` com `this._lexmlData.data ?? ''` e não atribui mais nada a `dataUltimaModificacao`; `setProposicao` lê `proposicao.data`; saem as sobrescritas para `''` em `resetaProposicao` e `descartarDocumentoAtual` (D3). Verificar com `grep dataUltimaModificacao` em `src/`: restam só o modelo, o metadado do LexEdit e `dataUltimaModificacaoDocumento`.
- [x] 1.3 Ajustar o comentário de `normalizarDataFecho` (`urnUtil.ts`), que deixa de citar a classe (D4).
- [x] 1.4 Atualizar `test/componente/lexml-eta/lexml-eta-data.test.ts` e `lexml-eta-anexo-parecer.test.ts`:
  - a data de impressão é lida em `data`, e "Não informar" dá `''`;
  - novos casos com `congelarRelogio()`: `dataUltimaModificacao` é o instante da obtenção (com e sem documento) e não muda com o campo "Data" nem com a data lida do arquivo (cenários da spec `campo-data-documento`).
  - Procurar comparações com `deep.equal` de `Proposicao` inteira que passem a depender do relógio.
  - Verificar com o `npm test` desses arquivos passando.
- [x] 1.5 No `CLAUDE.md`, reescrever a invariante (w), já que o campo "Data" não recebe mais o timestamp da classe, e acrescentar ao item 23 a distinção entre `Proposicao.data` e `Proposicao.dataUltimaModificacao`. Verificar relendo os dois trechos.

## 2. Documentação para o host

- [x] 2.1 Em `docs/api-componente-lexml-eta.md`:
  - seção 4.2: campos preenchidos, anexo de parecer, e o parágrafo da data reescrito para as duas datas;
  - seção 8: `data` e `dataUltimaModificacao` comentados na classe `Proposicao`.
  - Verificar que não sobrou o aviso "apesar do nome".
- [x] 2.2 Em `docs/migracao-interface-lexml-eta.md`, criar a seção **BREAKING** "Datas da proposição (#1034)" e o item correspondente no checklist do `lexeditweb-editor`. Verificar relendo a seção e o checklist.

## 3. E2E

- [x] 3.1 Criar `cypress/e2e/documento-articulado/datas-proposicao.cy.ts` (D5), seguindo `docs/guia-cypress.md` e usando `export {};`:
  - abrir `demo/doc/teste_fecho_com_data.json` pelo `#fileUpload` e conferir em `getProposicao()` o `data` com a data do fecho do arquivo e o `dataUltimaModificacao` na forma de `xsd:dateTime` com fuso;
  - marcar "Não informar" e conferir `data` igual a `''`.
  - Verificar com o spec passando no Cypress com o servidor de desenvolvimento na porta 8000.

## 4. Verificação integrada

- [x] 4.1 Rodar o `npm test` completo (com o servidor de desenvolvimento parado) e o Cypress de `documento-articulado/*`. As únicas falhas aceitas são as que já existem na `develop` (`abertura-pena.cy.ts`).
- [x] 4.2 Rodar `openspec validate 2026-11-04-c01-corrigir-datas-proposicao --strict`, que deve passar sem erros.
