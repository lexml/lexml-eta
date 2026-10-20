## 1. Conversor: salvar notas de rodapé

- [x] 1.1 Em `justificacao.ts`, gravar `LEXML-ETA-NOTA-RODAPE` como `NotaDeRodape` em `montaInline`, com o `content` montado do `texto` decodificado (D1) e os parágrafos unidos por espaço (D2), sem número nem id. Retirar `lexml-eta-nota-rodape` da remoção inicial de `montaJustificacao`, mantendo `del`. Verificar com os testes da 1.2.
- [x] 1.2 Testes unitários em `test/model/documento/justificacao.test.ts`, cobrindo os cenários de "Notas de rodapé na justificação gravada" e "Revisões de texto na justificação gravada": nota no meio do parágrafo, com negrito e link (sem `rel`), dois parágrafos unidos, nota em lista e em célula, nota vazia, número e id ausentes, nota dentro de `del` descartada. Substituir o teste atual que espera a nota retirada. Verificar com `npm test` passando.

## 2. Conversor: abrir notas de rodapé

- [x] 2.1 Em `justificacao.ts`, ler `NotaDeRodape` em `criaInline` como o elemento do editor, com id novo e `numero` pela ordem do documento, e `texto` codificado no formato do modal (D3). Verificar com os testes da 2.2.
- [x] 2.2 Testes unitários: notas em parágrafo, lista e célula numeradas 1, 2, 3 na ordem; ids distintos; `texto` decodificado com a formatação; ida e volta no modelo (`montaJustificacao(lerJustificacao(…))` igual ao gravado). Ajustar o teste atual que lê `NotaDeRodape` só como texto. Verificar com `npm test` passando.

## 3. Componente raiz

- [x] 3.1 Em `lexml-eta.component.ts#abrirDocumentoArticulado`, depois do `setContent`, atualizar `_lexmlJustificativa.notasRodape` e `this.notasRodape` com a lista do módulo de notas (D4). Verificar com os testes da 3.2.
- [x] 3.2 Testes em `test/componente/lexml-eta/documentoArticulado.component.test.ts`: ida e volta com o Quill real a partir de um HTML de `texto` com notas (parágrafo, lista e célula); depois de abrir, as notas no editor têm os números 1, 2, 3 e a lista de notas tem os mesmos textos; abrir um documento sem notas, com uma nota antes no editor, esvazia a lista. Verificar com `npm test` passando.

## 4. Integração com o conversor real

- [x] 4.1 Em `test/integracao/documentoArticulado.integration.ts`, acrescentar notas (parágrafo com formatação e link, lista, célula, nota de dois parágrafos) ao cenário da justificação. O XML deve conter `NotaDeRodape`, validar com `schemas/lexedit.xsd`, e o documento convertido de volta deve ser igual ao salvo. Verificar com `npm run test:documento-articulado:xml` passando, com `JSONIX_LEXML_CLI=C:/jsonix-lexml-win/desenv/jsonix-lexml-win.exe`.

## 5. E2E e documentação

- [x] 5.1 Gerar `demo/doc/teste_nota_rodape.json` pelo `getDocumentoArticulado()` real (componente com o Quill real, como o `teste_justificacao.json`), não à mão, com duas notas de rodapé (uma com negrito), e conferi-lo com o CLI 2.0.0 (`toxml` + `lexedit.xsd`). Verificar abrindo o arquivo pelo demo.
- [x] 5.2 Criar `cypress/e2e/documento-articulado/abertura-nota-rodape.cy.ts`, com `export {};` no topo, seguindo `docs/guia-cypress.md` e D6, sem download. Casos:
  - abrir `demo/doc/teste_nota_rodape.json` exibe no editor da justificação as referências 1 e 2, na ordem, e a aba "Notas" lista as duas notas;
  - depois de abrir, `getDocumentoArticulado()` no elemento `lexml-eta` devolve a mesma `Justificacao` do arquivo;
  - abrir em seguida `demo/doc/teste_justificacao.json`, que não tem notas, deixa o editor sem notas e a aba "Notas" sem notas registradas.

  Verificar com `npx cypress run --env envName=local --spec cypress/e2e/documento-articulado/abertura-nota-rodape.cy.ts` passando.
- [x] 5.3 Rodar os specs `cypress/e2e/documento-articulado/*` e `remissao-interna/abertura-remissao-invalida-persistida.cy.ts`, e a suíte `npm test` completa. Verificar que todos passam.
- [x] 5.4 Complementar `docs/extensao-formato-lexml/07-notas-de-rodape.md` (parágrafos unidos, nota em lista e célula, número e id não gravados) e atualizar a linha `07` de `plano-xsd-lexedit.md` e o item 16 de `CLAUDE.md` (exceção só para revisões). Em `docs/sessao/TODO.md`, registrar que a #994 deve retirar a exceção restante e corrigir o nome do cenário "Exceção temporária com nota de rodapé ou revisão de texto" (D5). Verificar relendo os trechos alterados.
