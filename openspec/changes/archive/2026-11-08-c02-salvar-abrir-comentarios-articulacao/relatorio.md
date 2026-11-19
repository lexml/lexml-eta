# Relatório — salvar e abrir os comentários da articulação (c02)

## Revisão antes de aplicar (16/11/2026)

A c02 foi revista diante do que a c01 (`2026-11-08-c01-comentarios-articulacao`, arquivada em 16/11/2026) implementou. A spec não mudou: os formatos e os cenários de gravar e abrir batem com `docs/extensao-formato-lexml/08-comentarios.md`. Mudaram o design e as tasks:

| # | Ajuste | Motivo |
|---|---|---|
| A1 | O dispositivo vivo é buscado por `buscarDispositivoComentado` (c01), e não por `findDispositivoByUuid2` | A `findDispositivoByUuid2` não acha a ementa nem o preâmbulo (a spec tem o cenário da ementa), nem os parágrafos de artigo com bloco de alteração (invariante (bk) do item 27 do `CLAUDE.md`). |
| A2 | Ao abrir, o excluído em revisão é localizado pela função nova `buscarElementoExcluidoEmRevisaoPorLexmlId` (**substituída no grupo 3**: ver abaixo) | É a irmã, por `lexmlId`, da `buscarElementoExcluidoEmRevisao` da c01. O risco de o id gravado não bater com o reconstruído já estava no design e é testado na task 1.1. |
| A3 | A ordem de `Comentarios` vem do componente raiz (`ordenarSequencias` com `getPosicaoComentario`) | É a mesma ordem da aba, que já posiciona o excluído em revisão. O montador não recalcula (regra de "uma origem só", invariantes ap e bc). |
| A4 | Ao abrir, as sequências da articulação são somadas às da justificação | Hoje `abrirDocumentoArticulado` substitui a lista pelas da justificação, filtradas por `getIdsComentarios()`. O ícone já é atualizado pela c01 quando a lista muda. |
| A5 | Nada a portar do lexml-emenda | O lexml-emenda grava os comentários no JSON da própria emenda, e não em LexML. Ele liga pelo id do dispositivo, que é a mesma ideia da c02. |
| A6 | Ambiente da integração registrado na task 4.1 | CLI `jsonix-lexml` 2.4.0 em `C:/Users/ruan.oliveira/DEV/git/lexeditweb/lexeditweb-editor/jsonix-lexml-win.exe` (por restrição da máquina, o executável só pode ficar nessa pasta) e o Java 17 do PATH (Temurin). O `--version` foi confirmado a partir do lexml-eta. |

`openspec validate 2026-11-08-c02-salvar-abrir-comentarios-articulacao --strict`: válida.

## Grupo 1 — prova com o conversor (16/11/2026)

**Tasks:** 1.1 concluída. Progresso da change: 1/12.

### O que foi feito

Não houve mudança de código. A prova foi rodada por um script descartável no scratchpad (`prova.mjs`):

1. **Montagem do documento.** A base foi `demo/doc/teste_revisoes_hierarquia.json`, que tem um artigo excluído em revisão com o id `_art1-exc1`. Foi acrescentado um grupo `Comentarios` com quatro sequências:
   - `art2_cpt`: caput de artigo;
   - `art1_cpt_inc1`: inciso;
   - `_art1-exc1_par1`: parágrafo do artigo excluído em revisão;
   - `ementa`.

   O grupo entrou na ordem do `lexedit.xsd`, antes de `RevisoesArticulacao`, com a pendência "Remover comentários.".
2. **Ida e volta.** O documento foi convertido com `toxml` e de volta com `tojson`, pelo CLI real (`jsonix-lexml-win.exe` 2.4.0, na pasta do lexeditweb-editor). Em cada etapa foi conferida a existência do arquivo de saída, porque o CLI sai com 0 mesmo quando falha.
3. **Validação.** O XML foi validado com `scripts/ValidarDocumentoLexml.java` e o `schemas/lexedit.xsd`, no Java 17 do PATH.

### Resultado

- **`toxml`:** gerou o XML com os quatro `refIdElementoComentado`.
- **XSD:** **válido**.
- **`tojson`:** os `Comentarios` voltaram **idênticos** aos gravados, na mesma ordem.
- **Conclusão:** nada é descartado. O `id` gravado na revisão de exclusão e o `ementa` são aceitos como ref. O design ficou como estava, com o resultado registrado.
- **CLI:** o executável, que fica na pasta do lexeditweb-editor, rodou a partir do lexml-eta, com os arquivos de entrada e saída no scratchpad.

### Em tela

Sem efeito visível neste grupo.

## Grupo 2 — gravação (16/11/2026)

**Tasks:** 2.1, 2.2 e 2.3 concluídas. Progresso da change: 4/12.

### O que mudou

- **`src/model/lexml/documento/documentoArticulado.ts`:** `RevisoesLexEdit` ganhou `idsGravadosDosExcluidos`, um mapa do `uuid2` para o id gravado na revisão.
- **`src/model/lexml/documento/conversor/revisaoArticulacao.ts`:**
  - `coletaIdsGravados` monta o mapa do excluído e de cada descendente;
  - roda no mesmo laço que reescreve os ids (`_<base>-exc<n>`), então o ref do comentário e o id da revisão não podem divergir;
  - no artigo, o mapa aponta para o id do caput, como no artigo vivo;
  - o mapa só é devolvido quando há exclusão.
- **`src/model/lexml/documento/conversor/buildJsonixFromProjetoNorma.ts`:**
  - `montaMetadadoLexEdit` recebe a articulação;
  - as sequências da articulação (`sequenciasDaArticulacaoGravadas`) entram antes das da justificação, na ordem recebida;
  - o ref (`refDoDispositivo`) sai assim:
    - do dispositivo vivo, por `buscarDispositivoComentado`, com o id que o próprio conversor grava (`buildId`): o do caput no artigo, `ementa`, `preambulo`;
    - senão, do mapa dos excluídos;
    - a sequência sem dispositivo não é gravada;
  - os autores entram em `Usuarios`, e a pendência "Remover comentários." vale para os dois tipos de sequência.
- **`src/components/lexml-eta.component.ts`:** `getDocumentoArticulado` envia as sequências ordenadas como na aba (`ordenarSequencias` com `getPosicaoComentario`), também no anexo de parecer. A justificação continua fora do anexo.
- **Testes:**
  - `test/model/documento/revisaoArticulacao.test.ts`, quatro casos do mapa:
    - artigo com filhos: o artigo aponta para o caput, e os descendentes para o próprio id;
    - inciso excluído;
    - duas exclusões no mesmo pai;
    - sem exclusão, não há mapa.
  - `test/model/documento/comentariosArticulacaoSalvar.test.ts` (novo, 8 casos):
    - inciso, com autor e pendência;
    - artigo → caput;
    - renumeração (`art3` → `art4_cpt`);
    - ementa;
    - excluído em revisão (`_art6-exc1_par1`);
    - dispositivo inexistente;
    - ordem articulação → justificação;
    - anexo de parecer.
  - `test/componente/lexml-eta/comentariosArticulacao.component.test.ts`, dois casos pela tela:
    - ordem da aba (`art1_cpt`, `art1_par1u`, depois a da justificação);
    - anexo de parecer.

### Testes

- **Novos e afetados** (`comentariosArticulacaoSalvar`, `revisaoArticulacao`, `comentariosSalvar`): **56 de 56 passaram.**
- **Componente da articulação:** **23 de 23 passaram.**
- **Regressão** de `test/model/documento/**`, `test/componente/**` e `test/model/comentario/*` (85 arquivos): **1939 de 1939 passaram.**
- **Lint:** `eslint` e `prettier --check` nos arquivos alterados, sem erros e sem avisos.

### Roteiro em tela

1. Comente o art. 1º e um trecho da justificação, e clique em "Salvar".
2. Abra o `.json` baixado e procure `refIdElementoComentado`. Deve aparecer primeiro `art1_cpt` e depois o `_tc…_1` da justificação.
3. Reabrir o arquivo ainda não traz o comentário da articulação: isso é o grupo 3.

## Grupo 3 — leitura (16/11/2026)

**Tasks:** 3.1 e 3.2 concluídas. Progresso da change: 6/12.

### Decisão tomada com o usuário neste grupo

- **Excluído em revisão ao reabrir.** O dispositivo excluído, depois de reconstruído, **não guarda** o id gravado: o `lexmlId` volta a ser o id base e o `uuid2` é novo. Por isso, a busca pelo `lexmlId` prevista na revisão (A2) não achava nada.
- **Opção A, escolhida:** `reconstroiRevisoes` informa, num mapa opcional, o id gravado de cada excluído e de cada descendente, e o id da revisão reconstruída. É o mesmo `idNoArquivo` que já devolvia a situação, então o id vem de uma origem só.
- **Descartadas:**
  - casar pela dedução do id base e pela ordem, que erraria com duas exclusões no mesmo lugar;
  - não religar a sequência, o que contrariaria a spec.
- O design foi atualizado.

### O que mudou

- **`buildProjetoNormaFromJsonix.ts`:**
  - `lerSequenciasComentario` é a leitura tolerante comum: autor sem registro vira um usuário com o próprio id, data inválida vira a da abertura, e cada `p` vira uma linha;
  - `lerComentarios` (justificação, ref `_tc`) não mudou de comportamento;
  - `lerComentariosArticulacao`, nova, devolve as sequências sobre dispositivo na ordem gravada, cada uma com id novo;
  - `lerMetadadoLexEdit` devolve `comentariosArticulacaoLidos`.
- **`documentoArticulado.ts`:** tipo `ComentarioArticulacaoLido` (`refId` e `sequencia`) e o campo `comentariosArticulacaoLidos`, só de leitura.
- **`reconstroiRevisoes.ts`:** parâmetro opcional `revisaoPorIdNoArquivo`, preenchido na reconstrução de cada exclusão.
- **`lexml-eta-proposicao.component.ts`:** `aplicarRevisoesDoArquivo` devolve o mapa.
- **`dispositivoComentado.ts`:** `resolverUuid2DoRefComentario`, nesta ordem:
  - `ementa` e `preambulo`;
  - dispositivo vivo por `buildId`, sem `buscaDispositivoById`; um caput vale o artigo;
  - excluído em revisão pelo mapa; o ref do caput do artigo excluído vale o artigo.
- **`lexml-eta.component.ts`, `abrirDocumentoLido`:**
  - depois das revisões do arquivo, liga as sequências da articulação (`ligarComentariosDaArticulacao`);
  - descarta a sequência sem dispositivo e, de duas no mesmo dispositivo, fica a primeira;
  - soma o resultado às da justificação, também no anexo de parecer;
  - o alerta e o ícone vêm do fluxo existente, quando a lista muda.
  - **Efeito colateral bom:** "Alterar dados básicos" e a importação passam pelo mesmo caminho, e agora preservam os comentários da articulação.
- **Teste da c03 atualizado** (`comentariosArquivo.component.test.ts`). O caso "sequência sobre dispositivo da articulação é descartada" registrava a regra antiga, que a c02 muda na spec ("Tolerância a comentários inconsistentes ao abrir"). Virou dois casos: dispositivo inexistente (`art99`) é descartado, e dispositivo existente é ligado.
- **Testes novos:**
  - `comentariosAbrir.test.ts`: três casos de `lerComentariosArticulacao`;
  - `reconstroiRevisoes.test.ts`: o mapa do excluído e dos descendentes;
  - `comentariosArticulacao.component.test.ts`, seis casos de abrir:
    - religar com ícone, identificação e alerta;
    - ref do artigo e ref da ementa;
    - ref inexistente e ref duplicado;
    - renumeração depois de abrir;
    - excluído em revisão, com rejeitar mantendo e aceitar removendo;
    - salvar, reabrir e salvar de novo com os mesmos `Comentarios` e `Usuarios`.

### Testes

- `comentariosArticulacao.component.test.js`: **29 de 29 passaram.**
- `reconstroiRevisoes.test.js`: **158 de 158 passaram.**
- `comentariosAbrir.test.js`: **17 de 17 passaram.**
- `comentariosArquivo.component.test.js`: **14 de 14 passaram.**
- **Regressão** de `test/model/documento/**`, `test/componente/**` e `test/model/comentario/*` (85 arquivos): antes do ajuste do teste da c03, **1948 passaram e 1 falhou**, justamente esse teste. Depois do ajuste, o arquivo passou inteiro.
- **Lint:** `prettier --check` sem erros. `eslint` sem erros, com avisos antigos em `reconstroiRevisoes.test.ts`: a contagem é igual à do código antes desta change.

### Roteiro em tela

1. Comente o art. 1º e o parágrafo único, salve e reabra o arquivo. Os dois ícones e as duas sequências voltam, com "No texto" e a identificação.
2. Com a revisão ativa, comente o parágrafo único, exclua-o, salve e reabra. O parágrafo volta riscado, com o ícone, e a sequência continua na aba. Rejeite a exclusão: a sequência continua.
3. Comente o art. 1º, salve, reabra e inclua um artigo antes dele. O card passa a "art. 2º".

## Grupo 4 — integração com o conversor (16/11/2026)

**Tasks:** 4.1 concluída. Progresso da change: 7/12.

### O que mudou

- **`test/integracao/documentoArticulado.integration.ts`:** cenário novo "os comentários da articulação (vivo, artigo, ementa e excluído em revisão) vão e voltam pelo CLI, validam no XSD e voltam ligados aos dispositivos".
  - **Montagem:** a base é a MPV 905/2019, com quatro sequências: ementa, art. 1º, inciso I do art. 6º e art. 2º. A revisão é ativada e o art. 2º é excluído.
  - **Gravação e conversão:** o documento é salvo, convertido em XML pelo CLI real, validado pelo `lexedit.xsd` e convertido de volta.
  - **Verificação:**
    - os refs gravados: `ementa`, `art1_cpt`, `art5_cpt_inc1` e `_art2-exc1_cpt`;
    - a pendência "Remover comentários.";
    - o `MetadadoProprietario` idêntico na volta;
    - reaberto do retorno do CLI, com as revisões reconstruídas, cada sequência ligada ao dispositivo certo, inclusive o artigo excluído, pelo mapa do grupo 3.
  - **Ponto não óbvio:** excluir o art. 2º em revisão o tira da articulação, e o art. 6º passa a ser o art. 5º. O ref do inciso acompanha o id atual (`art5_cpt_inc1`).

### Testes

- **Comando:** `wtr` com a configuração da integração (`web-test-runner.documento-articulado.config.mjs`), `JSONIX_LEXML_CLI` apontando para o `jsonix-lexml-win.exe` 2.4.0 do lexeditweb-editor e o Java 17 do PATH.
- **Resultado:** **39 de 39 passaram.**
  - Na primeira rodada, 1 falhou porque o próprio teste esperava `art6_cpt_inc1`, sem considerar a renumeração. Corrigido.
- **Limite de tempo, defeito anterior a esta change:**
  - `npm run test:documento-articulado:xml` não termina em 120 s, o `testsFinishTimeout` padrão do web-test-runner. Os 39 cenários chamam o CLI duas vezes e o Java uma vez cada.
  - A suíte rodou com uma configuração temporária no scratchpad, que só estende a do projeto com `testsFinishTimeout: 900000`. A configuração do projeto não foi alterada.
  - Fica a sugestão de aumentar esse limite em `web-test-runner.documento-articulado.config.mjs`, se o usuário quiser.
- **Lint:** `eslint` e `prettier --check` no arquivo, sem erros.

### Em tela

Sem efeito visível neste grupo.

## Grupo 5 — E2E (Cypress) (16/11/2026)

**Tasks:** 5.1 e 5.2 concluídas. Progresso da change: 9/12.

### O que mudou

- **`demo/doc/teste_comentarios_articulacao.json` (fixture nova):**
  - **Origem:** foi gerada pelo `getDocumentoArticulado()` real, por um teste descartável, já removido. A base é `demo/doc/teste_justificacao.json`, com um inciso acrescentado ao art. 1º.
  - **Comentários:** no art. 1º (`art1_cpt`), no inciso I (`art1_cpt_inc1`), no parágrafo único excluído em revisão (`_art1_par1u-exc1`) e num trecho da justificação (`_tc…_1`).
  - **Pendências:** "Remover comentários." e "Resolver marcas de revisão na articulação.".
- **`cypress/e2e/documento-articulado/abertura-comentarios-articulacao.cy.ts` (novo, 3 casos):**
  1. abrir a fixture: três ícones (inclusive o do parágrafo excluído), quatro sequências com o local ("No texto" e "Na justificação"), as identificações, os textos e o alerta;
  2. salvar o documento aberto devolve os mesmos refs e comentários, e a pendência;
  3. salvar pelo botão (blob de `URL.createObjectURL`), reabrir o arquivo gerado e conferir tudo de novo.

### Testes

- **Comando:** `npx cypress run --env envName=local --spec …`, com o novo spec e os três de comentários já existentes.
- **Resultado:** **14 de 14 passaram.**

  | Spec | Resultado |
  |---|---|
  | `abertura-comentarios-articulacao.cy.ts` (novo) | 3 de 3 |
  | `comentarios-articulacao.cy.ts` (c01) | 3 de 3 |
  | `comentarios-justificacao.cy.ts` | 5 de 5 |
  | `abertura-comentarios.cy.ts` | 3 de 3 |

- **Lint:** `eslint` e `prettier --check` no spec novo, sem erros.

### Em tela

Abra `demo/doc/teste_comentarios_articulacao.json` pelo botão de abrir. Devem aparecer:
- três balões na articulação, um deles no parágrafo riscado (excluído em revisão);
- quatro cards na aba "Comentários";
- o alerta na aba Avisos.

## Grupo 6 — documentação e fechamento (16/11/2026)

**Tasks:** 6.1, 6.2 e 6.3 concluídas. Progresso da change: 12/12.

### O que mudou

- **`docs/extensao-formato-lexml/08-comentarios.md`:**
  - "Implementado na justificação e na articulação";
  - seção nova "Id do dispositivo comentado": caput no artigo, `ementa`/`preambulo`, o id gravado na revisão de exclusão no excluído (`_art2-exc1_cpt`), e a sequência sem dispositivo não é gravada;
  - regras de leitura atualizadas: o caput vale o artigo, o id do artigo é aceito, o excluído é ligado depois das revisões, a sequência sem dispositivo é descartada e, de duas no mesmo dispositivo, vale a primeira.
- **`docs/extensao-formato-lexml/00-especificacao-esquema-lexedit.md`:** a linha "Comentários" da tabela passou a citar a articulação.
- **`scripts/fixtures-lexedit/08-comentarios.xml`:** duas sequências de dispositivo, uma em `art2_cpt` e outra em `_art3-exc1_par1`, antes da sequência da justificação.
- **`CLAUDE.md`, item 27:** trecho "Gravação e leitura da articulação", com as invariantes (bo) a (bq):
  - (bo): uma origem só para cada ref;
  - (bp): o excluído reconstruído não guarda o id gravado, e a ligação depois das revisões usa o mapa `revisaoPorIdNoArquivo`;
  - (bq): a leitura resolve o vivo por `buildId`, e nunca por `buscaDispositivoById`;
  - mais o limite de tempo da integração.

### Testes

- **`npm test` completo:** **"Todos os lotes passaram."**, sem falhas.
- **`npm run verify:xsd-lexedit`:** **15 de 15** exemplos válidos contra `schemas/lexedit.xsd`.
- **Lint:** `eslint` nos 16 arquivos `.ts` alterados, sem erros; os 26 avisos são todos de `reconstroiRevisoes.test.ts`, na mesma quantidade de antes desta change. `prettier --check`: sem erros.
- **`openspec validate 2026-11-08-c02-salvar-abrir-comentarios-articulacao --strict`:** válida.

### Em tela

Sem efeito visível neste grupo.
