## 1. Editor: autor completo na marca de revisão

- [x] 1.1 Em `moduloRevisao.ts`, estender o valor do formato para `usuario|date|id-revisao|id-usuario|sigla-usuario` (`RevisaoUtil.valueToAttributes`/`formats` e `buildAttributes`), com o módulo guardando o `Usuario` do estado. Em `editor-texto-rico.component.ts`, passar o `Usuario` nos dois pontos que hoje passam o nome (D3). Uma marca sem os campos novos deve continuar sendo lida. Verificar com os testes da 1.2.
- [x] 1.2 Testes de componente com o Quill real: a marca criada em modo de revisão tem `id-usuario` e `sigla-usuario` do usuário do estado; uma marca recebida sem esses atributos continua sendo marca de revisão; duas marcas vizinhas fundidas pelo `optimize` mantêm os atributos. Verificar com `npm test` passando.

## 2. Conversor: salvar as marcas

- [x] 2.1 Em `justificacao.ts`, gravar `INS`/`DEL` em `montaInline` como `ins`/`del` com `id` `_rt<id-revisao>_<n>` (D1), sem descartar `del` nem as notas dentro dele. A mesma varredura deve devolver as revisões encontradas (`id`, autor com id, nome e sigla, e data ISO com fuso, conforme D2 e D4), e a marca que só tem o cursor deve virar texto comum (D7). Ajustar o retorno de `montaJustificacao` e o chamador em `buildJsonixFromProjetoNorma.ts`. Verificar com os testes da 2.2.
- [x] 2.2 Testes unitários em `test/model/documento/justificacao.test.ts`, cobrindo os cenários de "Revisões de texto na justificação gravada" e os de "Registro de usuários das revisões" que falam de marcas:
  - inclusão e exclusão;
  - substituição (mesmo `id-revisao`) com ids distintos;
  - exclusão atravessando negrito;
  - nota dentro de `del`;
  - marca sem `id-revisao`;
  - marca sem `id-usuario`, que usa o nome;
  - marca só com o cursor;
  - data com fuso.

  Substituir os testes atuais que esperam o `del` descartado. Verificar com `npm test` passando.

## 3. Metadados: RevisoesTextuais, Usuarios e pendência

- [x] 3.1 Em `buildJsonixFromProjetoNorma.ts#montaMetadadoLexEdit`, gravar `RevisoesTextuais` no formato tipado do CLI 2.1.0 (`br_gov_lexml_lexedit__1.RevisoesTextuais`/`RevisaoTextual`). Gravar também `Usuarios` com a união por `idUsuario` dos usuários das revisões da hierarquia e das marcas (D5), e a pendência "Resolver marcas de revisão de texto." entre a de remissões inválidas e a de revisões da hierarquia (D6). Verificar com os testes da 3.2.
- [x] 3.2 Testes unitários do montador:
  - só revisões de texto, com `Usuarios` e sem `RevisoesArticulacao`;
  - mesmo usuário nos dois tipos de revisão, registrado uma vez com a sigla;
  - a ordem das quatro pendências;
  - sem marcas, sem `RevisoesTextuais` nem a pendência;
  - anexo de parecer sem justificação, sem o grupo.

  Verificar com `npm test` passando.

## 4. Conversor: abrir as marcas

- [x] 4.1 Em `buildProjetoNormaFromJsonix.ts`, ler `RevisoesTextuais` com os usuários (`lerUsuarios`) num mapa `refIdRevisao → {usuario, data}`, de forma tolerante, e compor em `lerMetadadoLexEdit`. Em `justificacao.ts#lerJustificacao`, recriar `ins`/`del` com os atributos do editor (D8), recompondo `id-revisao` do `id`. O `ins`/`del` sem metadado vira marca de "Anônimo" com a data da abertura, e o usuário não registrado usa o `refIdUsuario` como nome. Verificar com os testes da 4.2.
- [x] 4.2 Testes unitários:
  - leitura com autor registrado e não registrado;
  - marca sem `RevisaoTextual`;
  - `id` sem sufixo (exemplo da especificação 09);
  - grupo recomposto a partir de dois elementos;
  - ida e volta no modelo: `montaJustificacao(lerJustificacao(…))` igual ao gravado, com as mesmas revisões.

  Ajustar os testes atuais que esperam `ins`/`del` reduzidos a texto. Verificar com `npm test` passando.

## 5. Componente raiz

- [x] 5.1 Em `lexml-eta.component.ts#abrirDocumentoArticulado`, passar as revisões lidas a `lerJustificacao` e chamar `alertaGlobalRevisao()` do editor da justificação depois do `setContent` (D9). Verificar com os testes da 5.2.
- [x] 5.2 Testes em `test/componente/lexml-eta/documentoArticulado.component.test.ts`:
  - ida e volta com o Quill real, com inclusão, substituição e exclusão atravessando negrito e com nota;
  - depois de abrir, as marcas têm `usuario`, `date`, `id-revisao`, `id-usuario` e `sigla-usuario`, o contador indica os grupos e o alerta global de revisão está na aba Avisos;
  - rejeitar o grupo da exclusão em dois trechos, com `revisar` sobre os elementos de mesmo `id-revisao`, como faz a dica, devolve os dois trechos;
  - aceitar todas e salvar não grava `ins`, `del`, `RevisoesTextuais` nem a pendência;
  - salvar e reabrir dá o mesmo arquivo.

  Verificar com `npm test` passando.

## 6. Integração com o conversor real

- [x] 6.1 Em `test/integracao/documentoArticulado.integration.ts`, acrescentar ao cenário da justificação as marcas (inclusão, substituição, exclusão com negrito e com nota). Verificar:
  - o XML tem `ins`/`del` com `id` `_rt…` e um `lexedit:RevisaoTextual` para cada um;
  - o XML valida com `schemas/lexedit.xsd`, o que confere a unicidade dos `id`;
  - o documento convertido de volta é igual ao salvo, com `Usuarios` e a pendência.

  Verificar com `JSONIX_LEXML_CLI=C:/jsonix-lexml-win/desenv/jsonix-lexml-win.exe npm run test:documento-articulado:xml` passando.

## 7. E2E e documentação

- [x] 7.1 Gerar `demo/doc/teste_revisao_texto.json` pelo `getDocumentoArticulado()` real com o Quill real, não à mão, com uma inclusão, uma substituição e uma exclusão que atravessa um negrito e contém uma nota de rodapé (D10). Conferir o fixture com o CLI 2.1.0 (`toxml` + `lexedit.xsd`). Verificar abrindo o arquivo pelo demo.
- [x] 7.2 Criar `cypress/e2e/documento-articulado/abertura-revisao-texto.cy.ts`, com `export {};` no topo, seguindo `docs/guia-cypress.md`, sem download. O agrupamento pela dica fica no teste de componente da 5.2 (D10). Casos:
  - abrir `demo/doc/teste_revisao_texto.json` exibe no editor da justificação as marcas `ins`/`del` com o autor do arquivo, o contador de revisões da justificação e o alerta de marcas de revisão na aba Avisos;
  - depois de abrir, `getDocumentoArticulado()` devolve a mesma `Justificacao` e os mesmos `RevisoesTextuais` e `Usuarios` do arquivo;
  - aceitar todas as revisões da justificação deixa o editor sem marcas, e `getDocumentoArticulado()` fica sem `RevisoesTextuais` e sem a pendência "Resolver marcas de revisão de texto.".

  Verificar com `npx cypress run --env envName=local --spec cypress/e2e/documento-articulado/abertura-revisao-texto.cy.ts` passando.
- [x] 7.3 Rodar os specs `cypress/e2e/documento-articulado/*` e `cypress/e2e/revisao/*`, e a suíte `npm test` completa. Verificar que todos passam.
- [x] 7.4 Atualizar a documentação e verificar relendo os trechos alterados:
  - `docs/extensao-formato-lexml/09-revisao-de-texto.md`: id por elemento com sufixo `_<n>`, um `RevisaoTextual` por elemento, marca sem metadado ao abrir;
  - a linha `09` (e a `12`, que passa a incluir as revisões de texto) de `plano-xsd-lexedit.md`;
  - o item 20 de `CLAUDE.md`: fim da exceção, formato da marca e invariantes desta change;
  - `docs/sessao/TODO.md`: coordenação com o `lexeditweb-editor` sobre os atributos novos da marca.
