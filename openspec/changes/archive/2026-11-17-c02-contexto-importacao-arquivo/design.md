# Design

## Context

Ver `proposal.md`. O fluxo de importação é `continuarTela2` → `importarArquivo` → `importarPeloCallback` ou `importarPelaUrl`. A URN e a referência já são calculadas por `montaUrnNovaProposicao(this.dados, this.numeroOriginal)`, também usada em `montarResultado`. No SF o substitutivo não tem tipo próprio: a URN é a da proposição referenciada com o sufixo `@apresentacao.substitutivo`. Na CD o tipo é `SBT` ou `SSP` (`tipoSubstitutivo`). Na proposição referenciada, a sigla sozinha não distingue lei ordinária de complementar (`tipoProposicaoResolvido`).

## Goals / Non-Goals

**Goals:**
- Um único contexto, calculado uma vez no clique de **Continuar**, usado igualmente pelo callback e pela URL.
- Sem **BREAKING**: o segundo parâmetro do callback e os placeholders são aditivos.

**Non-Goals:**
- Importação no modo de edição (não existe) e importação de `.json` (lido localmente, sem host).
- Descartar resultado obsoleto com contador, como na Tela 2b: o bloqueio de **Voltar** e **Cancelar** basta.
- Corrigir o parser do host; o componente só informa o contexto.

## Decisions

**Contexto montado por uma função pura.** Uma função em módulo próprio recebe `DadosIdentificacao`, o número original e as URNs de `montaUrnNovaProposicao` e devolve `ContextoImportacaoArquivo`. Fica fora do componente para ser testada sem DOM. Alternativa descartada: montar dentro de `importarPeloCallback`, o que duplicaria a lógica para a URL.

**URN e dados decompostos, os dois.** A URN é a fonte da verdade (resolve lei complementar e o SF); os dados decompostos evitam que o host faça parse da URN. Não se expõe `urnTipoDocumento` (ex.: `projeto.lei;pl`): o host o extrai do segmento de tipo da URN, e um terceiro formato seria mais uma coisa a manter.

**`siglaDocumento` sempre preenchido.** É a do documento criado (`tipoSubstitutivo` na CD; `tipoProposicao` nos demais). No substitutivo do SF coincide com a da proposição referenciada. `documentoReferenciado` existe sempre que houver `urnDocumentoReferenciado`, o que inclui o PLV (a MPV).

**Sigla do documento referenciado vem do tipo resolvido** (`tipoProposicaoResolvido`), para que PLS/PLC complementares apareçam com a sigla certa; a URN referenciada mantém `projeto.lei.complementar`.

**Placeholders por substituição simples**, como em `montaUrlProposicao`, em `urlsNovaProposicao.ts`, com `encodeURIComponent` e texto vazio para valor ausente. Alternativas descartadas: query string fixa (nomes impostos ao host e tratamento de `?` existente) e headers (o host teria de lê-los; sem ganho, já que o `Content-Type` do corpo já exige preflight).

**Tipo do callback com o contexto obrigatório.** `(arquivo: File, contexto: ContextoImportacaoArquivo) => ...`. Um callback com menos parâmetros continua atribuível, e o componente sempre envia o contexto; opcional forçaria o host a tratar `undefined` sem necessidade. O objeto é congelado (`Object.freeze`) para impor o somente leitura também em JS.

**Bloqueio de navegação em `processando`.** `?disabled=${this.processando}` em **Voltar** e **Cancelar** das Telas 2 e 2b. É a correção mais simples para a corrida existente (voltar à Tela 1, mudar a espécie e concluir com resultado de uma conversão feita com contexto antigo) e vale também para `buscarTexto` e a Tela 2b. O diálogo de confirmação do modo de edição não está envolvido.

## Risks / Trade-offs

- [Host da URL sem os placeholders continua convertendo como PL] → aviso na documentação; o `lexeditweb-editor` (SF) precisa atualizar a URL.
- [Host que nunca resolve a promise deixa **Voltar** e **Cancelar** desabilitados] → já bloqueia **Continuar** hoje; callback rejeitado ou falha de rede zera `processando`.
- [URN com `;` e `@` em query string] → codificação por `encodeURIComponent`; o servidor decodifica normalmente.
- [Contexto ignorado pelo host] → comportamento atual, sem regressão.
