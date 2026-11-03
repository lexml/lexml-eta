## 1. Conversor da justificação: salvar

- [x] 1.1 Criar `src/model/lexml/documento/conversor/justificacao.ts` com `montaJustificacao(html)`, baseado no DOM (D2), aplicando o mapeamento de gravação de D4 e o escape de D3. Devolve `undefined` para justificação vazia ou só com parágrafos vazios. Verificar com os testes da 1.3.
- [x] 1.2 Em `documentoArticulado.ts`, adicionar `justificacao?: string` a `DadosLexEdit`, com um comentário de uma linha (vai para o LexML, não para `lexedit`; não é preenchido por `lerMetadadoLexEdit`). Em `montaProjetoNorma` (`buildJsonixFromProjetoNorma.ts`), acrescentar `justificacao: [ … ]` quando `montaJustificacao` devolver conteúdo (D1). Verificar com os testes da 1.3.
- [x] 1.3 Testes unitários em `test/model/documento/justificacao.test.ts`, via `criarDocumentoArticulado`, cobrindo cada linha de gravação da tabela de D4, os cenários de "Adaptação do conteúdo rico da justificação ao LexML" e de "Notas de rodapé e revisões na justificação gravada", mais: `&amp;` digitado continua `&amp;` no texto decodificado; espaço entre dois inline é preservado; justificação vazia não gera `justificacao`; `dados` sem `justificacao` gera o mesmo documento de hoje. Usar como entrada o HTML no formato de `texto` (fixture de tabela de `test/components/editor-texto-rico/editor-texto-rico.test.ts`). Verificar com `npm test` passando.

## 2. Conversor da justificação: abrir

- [x] 2.1 Em `justificacao.ts`, criar `lerJustificacao(documento)`, que não lança erro, aplicando o caminho inverso de D4, o recuo de lista de D5, a concatenação de várias `Justificacao` e a leitura tolerante de bloco e inline desconhecidos. Verificar com os testes da 2.2.
- [x] 2.2 Testes unitários no mesmo arquivo: cada linha de leitura de D4; `indent-1` vira `ql-indent-1` sem tocar `ql-text-indent-0px`; documento sem `Justificacao` devolve `''`; `div` e `Remissao` dentro da justificação preservam o texto; ida e volta no modelo, `montaJustificacao(lerJustificacao(…))` igual ao gravado. Verificar com `npm test` passando.

## 3. Componente raiz

- [x] 3.1 Em `lexml-eta.component.ts`, passar `justificacao` em `getDocumentoArticulado` e carregar a justificação em `abrirDocumentoArticulado`, seguida de `buildAlertaJustificativa()`, nos dois casos fora do modo anexo de parecer (D6). Verificar com os testes da 3.2.
- [x] 3.2 Testes em `test/componente/lexml-eta/documentoArticulado.component.test.ts`:
  - salvar com a justificação preenchida grava `Justificacao`; a alteração depois de salvar não muda o documento já obtido;
  - modo anexo de parecer não grava nem carrega `Justificacao`;
  - abrir um documento com justificação carrega o texto no editor e não exibe o alerta; abrir um documento sem `Justificacao`, com o editor preenchido antes, deixa o editor vazio e exibe o alerta;
  - ida e volta com o Quill real: `setContent` com o HTML da 1.3 (tabela mesclada, larguras, lista com recuo, link, imagem), salvar, abrir e salvar de novo gera documento igual. Se o Quill normalizar algo de outro jeito, ajustar o conversor (D4) e registrar o achado no `design.md`;
  - inverter o teste "com a justificação preenchida, o documento reaberto difere só por ganhar a pendência": passa a esperar documento igual e sem a pendência, e o comentário "Inverter na #991" sai (D7).

  Verificar com `npm test` passando.

## 4. Integração com o conversor real

- [x] 4.1 Em `test/integracao/documentoArticulado.integration.ts`, cenário com uma justificação que tem todos os elementos de D4. O XML deve conter `Justificacao` e validar com `schemas/lexedit.xsd`, e o documento convertido de volta deve ser igual ao salvo (`criarDocumentoArticulado` do reaberto com os mesmos dados, usando `lerJustificacao`). Verificar com `npm run test:documento-articulado:xml` passando, com `JSONIX_LEXML_CLI=C:/jsonix-lexml-win/desenv/jsonix-lexml-win.exe`.

## 5. E2E e documentação

- [x] 5.1 Gerar `demo/doc/teste_justificacao.json` via `criarDocumentoArticulado`, não à mão, com uma justificação que tem texto formatado, lista, link e tabela, e conferi-lo com o CLI 2.0.0 (`toxml` com `Justificacao` preenchida). Verificar abrindo o arquivo pelo demo.
- [x] 5.2 Criar `cypress/e2e/documento-articulado/abertura-justificacao.cy.ts`, com `export {};` no topo, seguindo `docs/guia-cypress.md` e D8, sem download. Casos:
  - abrir `demo/doc/teste_justificacao.json` exibe o texto e a tabela no editor da justificação (aba por `sl-tab[panel="justificativa"]`) e não exibe o alerta de justificação;
  - depois de abrir, `getDocumentoArticulado()` no elemento `lexml-eta` devolve a mesma `Justificacao` do arquivo;
  - abrir `demo/doc/teste_remissao_invalida.json`, que não tem justificação, depois de digitar uma, deixa o editor vazio e exibe o alerta.

  Verificar com `npx cypress run --env envName=local --spec cypress/e2e/documento-articulado/abertura-justificacao.cy.ts` passando.
- [x] 5.3 Rodar os specs `cypress/e2e/documento-articulado/*` e `remissao-interna/abertura-remissao-invalida-persistida.cy.ts`, e a suíte `npm test` completa. Verificar que todos passam.
- [x] 5.4 Corrigir `docs/extensao-formato-lexml/06-justificacao-e-conteudo-rico.md` (exemplo `<td width>` inválido, sentido da conversão de largura, `p` em célula como `span`, `img` em parágrafo) e atualizar a linha `06` de `plano-xsd-lexedit.md`. Registrar em `CLAUDE.md` (novo item) o conversor da justificação, a decisão sobre `indent-N` (D5) e a exceção de notas de rodapé e revisões, e em `docs/sessao/TODO.md` que a #993 e a #994 devem retirar essa exceção. Verificar relendo os trechos alterados.
