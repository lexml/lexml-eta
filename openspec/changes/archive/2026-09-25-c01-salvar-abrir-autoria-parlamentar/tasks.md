## 1. Modelo e texto da assinatura

- [x] 1.1 Em `documentoArticulado.ts`, acrescentar `autoria?: Autoria` a `DadosLexEdit` e `autoria?` (formato do conversor, design.md, Contexto) a `MetadadoLexEdit`, e verificar que `npx tsc` compila sem erros.
- [x] 1.2 Criar a função pura `tratamentoParlamentar(sexo, siglaCasaLegislativa)` (design.md, Decisão 3) e verificar com testes unitários: SF/M → "Senador", SF/F → "Senadora", CD/M → "Deputado", CD/F → "Deputada" e valor fora de SF/CD com o padrão de `CD`.

## 2. Salvar a autoria de parlamentares

- [x] 2.1 Implementar `montaAutoria` em `buildJsonixFromProjetoNorma.ts`, composto em `montaMetadadoLexEdit` (design.md, Decisão 2). Verificar com testes unitários:
  - dois parlamentares na ordem, com os sete atributos, `cargo: ''` quando vazio e `tipo: 'Parlamentar'`;
  - `imprimirPartidoUF` falso;
  - parlamentar com campos extras (gravados só os sete atributos);
  - lista vazia ou só com parlamentares sem `identificacao` (sem autoria e, sem outro grupo, sem `MetadadoProprietario`);
  - convivência com fecho, opções de impressão e remissões inválidas no mesmo `lexedit`.
- [x] 2.2 Estender `montaParteFinal` com `assinaturaTexto` (design.md, Decisão 3). Verificar com testes unitários:
  - senador com cargo (três parágrafos, o primeiro com `b`);
  - senadora sem cargo (dois parágrafos);
  - deputada;
  - cargo só com espaços;
  - `imprimirPartidoUF` falso (sem o parágrafo de partido e UF);
  - fecho e assinaturas juntos (ordem `localDataFecho` → `assinaturaTexto`);
  - só assinaturas, sem local (`ParteFinal` sem `localDataFecho`);
  - nem local nem autoria (sem `ParteFinal`);
  - o documento gerado passa em `validarDocumentoArticulado`;
  - para os dados do exemplo da especificação, `parteFinal` fica igual ao de `docs/extensao-formato-lexml/documento-articulado-exemplo.json`.
- [x] 2.3 Em `getDocumentoArticulado` do componente raiz, repassar `autoria: this._lexmlAutoria.getAutoriaAtualizada()` fora do modo anexo de parecer (design.md, Decisão 1). Verificar com testes de componente: autoria com dois parlamentares chega ao arquivo; linha em branco é descartada; no modo anexo de parecer não há autoria nem `AssinaturaTexto`.

## 3. Abrir a autoria de parlamentares

- [x] 3.1 Implementar `lerAutoria` em `buildProjetoNormaFromJsonix.ts`, composto em `lerMetadadoLexEdit` (design.md, Decisão 4). Verificar com testes unitários:
  - dois parlamentares;
  - `parlamentar` como objeto único;
  - `imprimirPartidoUF` ausente ou não booleano (padrão);
  - `sexo` e `siglaCasaLegislativa` inválidos (padrão de `Parlamentar`);
  - parlamentar sem `identificacao` ou sem `nome` (descartado);
  - nenhum parlamentar válido, `tipo: 'Comissão'`, sem `autoria` e sem `MetadadoProprietario` (todos devolvem `undefined`);
  - convivência com os demais grupos e com um grupo desconhecido;
  - assinaturas adicionais em 0.
- [x] 3.2 Em `abrirDocumentoArticulado`, depois de `inicializarEdicao`, aplicar `dados.autoria` ao `lexml-eta-autoria` quando houver (design.md, Decisão 5). Verificar com testes de componente:
  - abrir com autoria exibe os parlamentares do arquivo, com o partido registrado mesmo quando a lista do host tiver outro;
  - abrir sem autoria mantém a autoria padrão do editor (vazia: `abrirDocumentoArticulado` não recebe `autoriaPadrao` do host);
  - abrir outro documento sem autoria em seguida não herda a anterior.
- [x] 3.3 Verificar com teste unitário a ida e volta pelo código do editor: criar com autoria → serializar → ler → `lerMetadadoLexEdit` devolve a mesma autoria, e criar de novo produz o mesmo `lexedit.autoria` e o mesmo `ParteFinal`.

## 4. Testes de integração e E2E

- [x] 4.1 Em `documentoArticulado.integration.ts`, adicionar um cenário que cria o documento com local, data e parlamentares (SF e CD, M e F, com e sem cargo) e faz a ida e volta pelo CLI real (`toxml` + XSD `lexedit.xsd` + `tojson`). Deve verificar no XML `<lexedit:Autoria tipo="Parlamentar" ...>` e os `<AssinaturaTexto>` com `<b>`, e exigir `lexedit.autoria` e `parteFinal` iguais no JSON de volta (design.md, Decisão 6). Repetir com `imprimirPartidoUF` falso. Verificar rodando `npm run test:documento-articulado:xml` com `JSONIX_LEXML_CLI=C:\Users\ruan.oliveira\DEV\git\lexeditweb\lexeditweb-editor\jsonix-lexml-win.exe`.
- [x] 4.2 Gerar via `criarDocumentoArticulado` (não à mão) a fixture `demo/doc/teste_autoria_parlamentares.json`, com dois parlamentares, um deles com cargo, e `imprimirPartidoUF` falso. Adicionar o spec Cypress `cypress/e2e/documento-articulado/abertura-autoria-parlamentar.cy.ts`, consultando antes `docs/guia-cypress.md` (Shadow DOM). O spec abre a fixture pela UI real (`cy.get('#fileUpload').selectFile(...)`) e verifica em `lexml-eta-autoria`:
  - os nomes nos autocompletes, na ordem do arquivo;
  - o cargo do primeiro;
  - "Imprimir partido e UF para os signatários" desmarcado.

  O lado de salvar segue sem E2E (sem infraestrutura de download, mesma decisão das changes anteriores) e fica coberto por 2.1-2.3, 3.3 e 4.1. Verificar rodando o spec contra um servidor que sirva o build atual.

## 5. Regressão e fechamento

- [x] 5.1 Rodar `npm test` e os specs Cypress de `cypress/e2e/documento-articulado/` e `abertura-remissao-invalida-persistida.cy.ts`, e confirmar que nada regrediu.
- [x] 5.2 Registrar o fechamento:
  - em `docs/extensao-formato-lexml/plano-xsd-lexedit.md`, o grupo `04` passa a "Implementado (parlamentares; comissão pendente)", com `ParteFinal/AssinaturaTexto` no LexML;
  - no item 13 do `CLAUDE.md`, o que for específico da autoria: tratamento por casa e sexo, texto montado do mesmo objeto do `lexedit`, assinaturas adicionais não persistidas e o risco da revalidação no blur.
