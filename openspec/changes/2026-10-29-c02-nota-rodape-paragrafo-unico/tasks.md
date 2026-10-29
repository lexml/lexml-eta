# Tasks

## 1. Modal: um só parágrafo

- [x] 1.1 Em `nota-rodape-modal.ts`, criar a função pura `unirLinhas(delta)` (D1): descarta linhas vazias, une as demais com um espaço sem formato, apara as pontas e mantém os formatos inline. Verificar com os testes da 1.4.
- [x] 1.2 Aplicar `unirLinhas` no `text-change` com `source === 'user'` quando houver mais de uma linha, com `setContents(…, 'api')` e o cursor reposicionado (D2). No `open()`, aplicar a união à nota carregada e, quando houve união, usar o HTML unido como base de `textoInicialNotaRodape`; `save()` envia a nota unida mesmo sem outra alteração (`uniuAoAbrir`, D4). Verificar com os testes da 1.4.
- [x] 1.3 Registrar o atalho `{ key: 13, shiftKey: null }` em `keyboard.bindings` do Quill do modal: devolve `false` e exibe o aviso "A nota de rodapé admite um só parágrafo." num elemento `role="status"` do modal, que some depois de 4 segundos (D3). Verificar com os testes da 1.4.
- [x] 1.4 Testes de componente com o Quill real em `test/components/editor-texto-rico/nota-rodape-modal.test.ts` (D5):
  - Enter e Shift+Enter não criam linha e exibem o aviso;
  - digitar depois de Enter continua no mesmo parágrafo;
  - colar HTML com dois parágrafos e negrito vira um parágrafo, "Primeiro Segundo", com o negrito preservado;
  - `unirLinhas` descarta linhas vazias e apara as pontas;
  - nota com dois parágrafos abre unida, fechar não pede confirmação (`confirm` espionado) e salvar sem alterar envia a nota unida;
  - nota de um parágrafo com negrito e link, salva sem alterar, não envia evento.

  Remover o modal do `document.body` em cada `afterEach`. Verificar com `npm test` passando.
- [x] 1.5 Atualizar a documentação e verificar relendo os trechos:
  - `docs/extensao-formato-lexml/07-notas-de-rodape.md`: o editor aceita um só parágrafo, e a união na gravação fica só para HTML vindo de fora;
  - `CLAUDE.md`, item 22 (notas de rodapé): a regra do modal e `unirLinhas`.

## 2. E2E

- [x] 2.1 Criar `cypress/e2e/documento-articulado/edicao-nota-rodape.cy.ts`, com `export {};` no topo e seguindo `docs/guia-cypress.md`:
  - abrir `demo/doc/teste_nota_rodape.json` e editar a primeira nota pela aba "Notas" (`sl-button[title="Editar nota de rodapé"]` via `dispatchEvent`);
  - teclar `{enter}` no `.ql-editor` do modal: o modal exibe o aviso e o editor continua com um só `<p>`;
  - salvar: o atributo `texto` da nota no editor da justificação tem um só parágrafo.

  Colar e a nota antiga ficam no teste de componente (D5). Verificar com `npx cypress run --env envName=local --spec cypress/e2e/documento-articulado/edicao-nota-rodape.cy.ts` passando.

## 3. Verificação final

- [x] 3.1 Rodar a suíte `npm test` completa e os specs `cypress/e2e/documento-articulado/*`. Verificar que passam, salvo as falhas que já existem na `develop` (`abertura-pena.cy.ts`, `anexo-parecer-data-fecho.cy.ts`), sem piorar.
