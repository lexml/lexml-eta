## 1. Montador: pendências vindas do editor

- [x] 1.1 Em `src/model/lexml/documento/documentoArticulado.ts`, adicionar `pendencias?: string[]` a `DadosLexEdit`, com um comentário de uma linha dizendo que é só de escrita (D1).
- [x] 1.2 Em `montaMetadadoLexEdit` (`buildJsonixFromProjetoNorma.ts`), iniciar a lista com uma cópia de `dados?.pendencias ?? []`, antes da pendência de remissões (D1).
- [x] 1.3 Testes unitários do montador, num arquivo novo ao lado de `test/model/documento/localDataFecho.test.ts`/`opcoesImpressao.test.ts` (`test/model/documento/pendencias.test.ts`), via `criarDocumentoArticulado`, cobrindo também que a lista recebida do editor não é alterada:
  - só as pendências do editor geram `Pendencias` com elas;
  - pendências do editor mais remissão inválida saem na ordem editor, depois remissões;
  - `pendencias: []` sem outro grupo continua sem `pendencias`;
  - `lerMetadadoLexEdit` de um arquivo com a pendência de justificação continua sem `pendencias`.

  Verificar com `npm test` passando.

## 2. Componente raiz: texto único e coleta ao salvar

- [x] 2.1 Em `src/components/lexml-eta.component.ts`, criar `MENSAGEM_JUSTIFICACAO_NAO_INFORMADA` e usá-la em `disparaAlerta` e `getPendenciasPreenchimento` (D2).
- [x] 2.2 Em `getDocumentoArticulado`, passar `pendencias` com a mensagem quando `isJustificacaoNaoInformada(this._lexmlJustificativa.texto)` (D3).
- [x] 2.3 Testes em `test/componente/lexml-eta/documentoArticulado.component.test.ts`:
  - documento novo salvo com a justificação vazia tem a pendência;
  - com a justificação preenchida (stub de `_lexmlJustificativa.texto`, ou `setContent`), não tem;
  - com `anexoParecer`, não tem;
  - com `justificacaoObrigatoria = false`, não tem;
  - abrir um arquivo cuja lista de pendências tem a de justificação, preencher a justificação e salvar gera arquivo sem a pendência (a gravada não é lida).

  Atualizar o teste "abre os grupos do formato provisório…" (`:279`), cuja comparação por igualdade passa a ter a pendência de justificação antes da de remissões. Verificar com `npm test` passando.
- [x] 2.4 Ida e volta no componente, com a justificação vazia: abrir o documento salvo e salvar de novo gera `lexedit` igual, com a pendência. Exceção temporária: com a justificação preenchida, o segundo arquivo difere só por ganhar a pendência. Esse teste deve ter um comentário apontando para a #991, que vai invertê-lo. Verificar com `npm test`.

## 3. Integração com o conversor real

- [x] 3.1 Em `test/integracao/documentoArticulado.integration.ts`, cenário com `pendencias: ['Não foi informado um texto de justificação.']` e uma remissão inválida. O XML deve conter os dois `lexedit:Pendencia`, na ordem, validar com `schemas/lexedit.xsd`, e o `metadadoProprietario` deve voltar igual. Verificar com `npm run test:documento-articulado:xml`, que exige `JSONIX_LEXML_CLI`. Hoje a variável não está definida nesta máquina. Se continuar indisponível, pedir ao usuário o caminho do conversor e não marcar a task como feita sem rodar.
  - **Pendente (08/10/2026):** o único conversor disponível, `C:/jsonix-lexml-win/desenv/jsonix-lexml-win.exe`, é a versão `0.0.1`, de 18/09. Ela descarta o conteúdo de `lexedit`, e com ela a suíte atual já sai com 4 passando e 6 falhando, com ou sem esta change. Por decisão do usuário, o grupo 4 segue e esta task fica aberta até haver o conversor 2.0.0 (revisão `9c02a3d`). A change não deve ser arquivada como completa antes disso.
  - **Concluída (08/10/2026):** o executável no mesmo caminho foi substituído pela versão `2.0.0`. A base passou com 10 de 10 testes. Com o cenário novo, que confere também que a leitura não devolve `pendencias`, a suíte fica com 11 de 11. A revisão do binário (`9c02a3d`) não foi conferida, porque `--version` só informa `2.0.0`.

## 4. E2E e documentação

- [x] 4.1 Criar `cypress/e2e/documento-articulado/pendencia-justificacao.cy.ts`, seguindo `docs/guia-cypress.md` e D5, sem download. Casos:
  - `cy.novaProposicao()` e `getDocumentoArticulado()` chamado no elemento `lexml-eta`: os metadados têm a pendência de justificação;
  - depois de digitar na justificação pela aba (`sl-tab[panel="justificativa"]`), não têm;
  - ao abrir `demo/doc/teste_remissao_invalida.json` e salvar, as duas pendências aparecem na ordem.

  Verificar com `npx cypress run --env envName=local --spec cypress/e2e/documento-articulado/pendencia-justificacao.cy.ts` passando.
- [x] 4.2 Rodar os specs `cypress/e2e/documento-articulado/*` e `remissao-interna/abertura-remissao-invalida-persistida.cy.ts` e a suíte `npm test` completa.
- [x] 4.3 Registrar o estado da #992 em `docs/extensao-formato-lexml/plano-xsd-lexedit.md`, se a tabela de status tiver linha para o grupo `13`, e em `CLAUDE.md` (item 14 ou um novo item, com o caminho `DadosLexEdit.pendencias` e a exceção temporária). Registrar em `docs/sessao/TODO.md` que a #991 deve retirar a exceção da ida e volta (D4).
