## Context

- `montaMetadadoLexEdit` (`buildJsonixFromProjetoNorma.ts`) é o ponto único de composição de `lexedit`. Hoje ele monta `pendencias` só com "Corrigir remissões internas inválidas.", calculada ali a partir dos ids das remissões inválidas, e devolve `undefined` quando não há grupo.
- `DadosLexEdit` (`documentoArticulado.ts`) leva os dados de formulário do componente raiz até o montador: `local`, `data` e `opcoesImpressao`. É preenchido em `LexmlEtaComponent#getDocumentoArticulado` e repassado por `lexml-eta-proposicao#getDocumentoArticulado` a `criarDocumentoArticulado`.
- Desde a change `2026-10-08-c01`, a condição "justificação não informada" é `isJustificacaoNaoInformada(justificativa)`, no componente raiz. Ela é usada pelo alerta e por `getPendenciasPreenchimento`. O texto da mensagem aparece em dois literais: `disparaAlerta` e `getPendenciasPreenchimento`.
- `lerMetadadoLexEdit` não lê `pendencias`. Há teste que garante `{}` para um arquivo só com pendências (`test/model/documento/opcoesImpressao.test.ts`).
- O conversor `jsonix-lexml` 2.0.0 não está configurado nesta máquina: `JSONIX_LEXML_CLI` está vazia e não há o repositório irmão em `D:\Projetos`.

## Goals / Non-Goals

**Goals:**

- A pendência gravada usa a mesma condição e o mesmo texto do alerta.
- O caminho de pendências do editor até o montador serve, sem campo novo, para as próximas pendências calculadas no editor (#994, #996).

**Non-Goals:**

- Gravar `mensagensCritical`, que `getPendenciasPreenchimento` também inclui na proposição. Elas não fazem parte da especificação 13.
- Ler as pendências ao abrir.
- Mudar o cálculo da pendência de remissões internas inválidas.

## Decisions

### D1. `DadosLexEdit.pendencias?: string[]`, juntada no montador

`DadosLexEdit` ganha `pendencias?: string[]`, a lista de pendências calculadas pelo editor. `montaMetadadoLexEdit` inicia sua lista com uma cópia de `dados?.pendencias ?? []` e só depois acrescenta a de remissões. Isso dá a ordem do requisito "Ordem das pendências no arquivo salvo". O restante do montador não muda: com a lista vazia, `pendencias` continua omitido, e `MetadadoProprietario` continua aparecendo só quando há grupo.

- **Por que uma lista, e não um booleano `justificacaoNaoInformada`:** as pendências de revisão de texto (#994) e de revisão da hierarquia (#996) também nascem no editor. Com a lista, cada uma entra sem mudar o contrato de `DadosLexEdit` nem o montador.
- **Por que a de remissões fica no montador:** ela depende dos ids garantidos por `garantirIdsRemissoesInvalidas`, que só existem dentro de `buildJsonixFromProjetoNorma`.
- `DadosLexEdit` é o tipo que `lerMetadadoLexEdit` devolve, mas `pendencias` é um campo só de escrita. O leitor não o preenche, e um comentário curto no campo registra isso.

### D2. Texto da justificação num único ponto

Criar no módulo do componente raiz a constante `MENSAGEM_JUSTIFICACAO_NAO_INFORMADA = 'Não foi informado um texto de justificação.'`, usada por `disparaAlerta`, `getPendenciasPreenchimento` e `getDocumentoArticulado`. Ela não é exportada, porque os três usos estão no mesmo componente. Os testes continuam usando o literal, que é o contrato visível ao usuário e ao arquivo.

### D3. Coleta em `getDocumentoArticulado`, sem reaproveitar `getPendenciasPreenchimento`

`getDocumentoArticulado` passa `pendencias: this.isJustificacaoNaoInformada(this._lexmlJustificativa.texto) ? [MENSAGEM_JUSTIFICACAO_NAO_INFORMADA] : []`. O anexo de parecer e a obrigatoriedade desligada já são tratados por `isJustificacaoNaoInformada`, então o `fecho` condicional que já existe não precisa de outro ramo.

- **Alternativa descartada:** reaproveitar `getPendenciasPreenchimento`. Ela inclui `mensagensCritical` (ver Non-Goals) e depende de uma `Proposicao` montada, que `getDocumentoArticulado` não constrói.

### D4. Exceção temporária da ida e volta

O requisito "Ida e volta dos metadados do LexEdit pelo conversor" ganha uma exceção explícita, delimitada a "justificação preenchida, enquanto a justificação não for gravada" (spec delta de `metadados-lexedit`). A #991 deve retirar a exceção e o cenário "Exceção temporária com justificação preenchida". O cenário deve virar "a justificação volta e o arquivo é igual". Isso fica registrado também em `docs/sessao/TODO.md`.

### D5. E2E sem download

O projeto não tem infraestrutura de download no Cypress, como já decidido na change `2026-09-16-c01`. O spec E2E chama `getDocumentoArticulado()` no elemento `lexml-eta` via `cy.get(...).then($el => ...)`, depois de interagir pela UI real. Assim ele cobre o caminho real (justificação digitada no Quill, depois o salvar) sem precisar baixar o arquivo.

## Risks / Trade-offs

- [Testes que comparam os metadados salvos por igualdade passam a ter a pendência] → Atualizar os afetados, começando por `test/componente/lexml-eta/documentoArticulado.component.test.ts`, que abre e salva pelo componente com a justificação vazia. Os testes do montador que não passam `pendencias` não mudam.
- [Conversor real indisponível nesta máquina] → A task de integração (`npm run test:documento-articulado:xml`) depende de `JSONIX_LEXML_CLI`. Se o conversor não for disponibilizado, a task fica pendente e registrada, não marcada como feita. O formato de `Pendencias` já tem ida e volta pelo CLI coberta pela change `2026-09-23-c01`; o que muda aqui é só a quantidade de itens.
- [Arquivo salvo diferente do aberto (exceção D4)] → Aceito e delimitado até a #991, que é a próxima a ser implementada.
