# Design

## Context

- **Hoje:**
  - `Proposicao.dataUltimaModificacao` nasce com `new Date().toISOString()`, um timestamp em UTC.
  - O componente usa esse campo como valor do campo "Data": `setProposicao` copia o campo para o formulário, e `getProposicao` devolve `_lexmlData.data || undefined`.
  - Para que o documento novo nasça em "Não informar", `resetaProposicao` e `descartarDocumentoAtual` zeram o campo para `''` antes de chamar `setProposicao`.
  - `normalizarDataFecho` (`urnUtil.ts`) converte um timestamp que chegue ao campo para a data local (invariante (w) do `CLAUDE.md`).
- **Já existe:** o arquivo LexML grava o instante do salvamento em `lexedit:Metadado@dataUltimaModificacao` desde a #997 (invariante (ar)). Esse instante nasce em `getDocumentoArticulado` com `formatDateTimeToIso(formatDateTime(new Date()))`. A data lida do arquivo fica em `dataUltimaModificacaoDocumento`.
- **Quem cria a proposição:** `getProposicao` sempre cria um objeto novo, com `new Proposicao()`, seja direto (sem documento), seja por `montarProposicaoPorUrn`.

A motivação está em `proposal.md`, e os requisitos, nas specs delta `campo-data-documento` e `modo-anexo-parecer`.

## Goals / Non-Goals

**Goals:**

- Separar a data de impressão (`data`) do instante de modificação (`dataUltimaModificacao`) na `Proposicao` entregue ao host.
- Remover o timestamp padrão que o componente tinha de zerar.

**Non-Goals:**

- Mudar o arquivo LexML, `DadosLexEdit` ou `dataUltimaModificacaoDocumento`.
- Preencher `aplicacao` e `versaoAplicacao` (continuam vazios, como na #997).
- Aceitar `dataUltimaModificacao` como data de impressão numa `Proposicao` vinda do host. A `Proposicao` só sai do componente, e `setProposicao` é privado.

## Decisions

### D1. O instante nasce no inicializador do campo da classe

`Proposicao.dataUltimaModificacao = formatDateTimeToIso(formatDateTime(new Date()))`, no próprio campo da classe.

- **Por quê:** `getProposicao` sempre cria uma `Proposicao` nova, então o instante da criação é o instante da obtenção, sem código no componente. O formato é o mesmo do arquivo (invariante (ar)), e o host recebe uma só forma de data e hora.
- **Alternativa descartada:** atribuir o instante em `getProposicao`. É mais explícito, mas o caminho sem documento (`return new Proposicao()`) precisaria da mesma linha. O padrão da classe ficaria então num formato diferente (UTC), o que é pior.
- **Sem conflito com a invariante (ar):** ela vale para o conversor, que precisa ser determinístico. A `Proposicao` não passa pelo conversor: é a interface com o host.

### D2. `data` nasce vazia e é sempre string

`Proposicao.data = ''`. `getProposicao` devolve `this._lexmlData.data ?? ''`, então "Não informar" chega como `''`, e não mais como `undefined`.

- **Por quê:** a mudança já é **BREAKING** pelo nome, e um tipo só (`string`) evita que o host trate dois valores vazios. Para quem testa só se o valor existe, `''` e `undefined` se comportam igual.
- **Alternativa descartada:** manter `undefined` para "Não informar", como hoje. Aí o padrão da classe (`''`) e o valor entregue divergiriam.

### D3. Saem as sobrescritas de `resetaProposicao` e `descartarDocumentoAtual`

Com `data = ''` na classe, as duas linhas que zeravam o campo deixam de ser necessárias. `setProposicao` passa a ler `proposicao.data`.

### D4. `normalizarDataFecho` continua tolerante a timestamp

A função continua aceitando timestamp, como rede de segurança barata. Só o comentário muda, porque deixa de citar a classe. A invariante (w) do `CLAUDE.md` é reescrita: o campo "Data" não recebe mais timestamp da classe.

### D5. O E2E lê a proposição pelo elemento do demo

Um spec Cypress abre `demo/doc/teste_fecho_com_data.json` pelo `#fileUpload` e lê `getProposicao()` direto do elemento `lexml-eta`, como `abertura-data-ultima-modificacao.cy.ts` já faz com a propriedade. O spec confere que `data` traz a data do fecho do arquivo e que `dataUltimaModificacao` tem a forma de `xsd:dateTime` com fuso. Depois de marcar "Não informar" no campo, confere que `data` fica `''`.

O valor exato do instante fica para o teste de componente, com `congelarRelogio()`.

## Risks / Trade-offs

- **[Risco]** O host continua lendo `dataUltimaModificacao` como data de impressão e não percebe a mudança, porque o campo ainda existe e é string. → **Mitigação:** uma seção **BREAKING** em `docs/migracao-interface-lexml-eta.md`, com o item no checklist do `lexeditweb-editor`, e a seção 8 da API com os dois campos comentados.
- **[Trade-off]** `new Proposicao()` passa a depender de `util/date-util`. → É aceitável: o modelo já importa esse módulo nos conversores, e não há ciclo.
- **[Risco]** Algum teste compara `Proposicao` inteira com `deep.equal` e passa a depender do relógio. → **Mitigação:** procurar esses casos ao implementar e usar `congelarRelogio()`. Hoje só o fixture `test/assets/altera_norma_trava_editor` traz o campo, e esse teste usa apenas o `projetoNorma`, então fica intocado.

## Migration Plan

O host precisa trocar a leitura da data de impressão de `dataUltimaModificacao` para `data`, antes de consumir a versão publicada com esta change. Não há migração de arquivo. Para reverter, basta reverter o commit.
