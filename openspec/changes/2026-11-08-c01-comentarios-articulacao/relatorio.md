# Relatório — comentários na articulação (c01)

## Etapa 0 — comparação com o lexml-emenda (11/11/2026)

O visual e o comportamento dos comentários da justificação foram alinhados ao lexml-emenda na change `2026-11-11-c01-alinhar-comentarios-justificacao-lexml-emenda` (arquivada; commits `0c8a0327` e `6ccedd3b`). Em relação ao alinhamento anterior (`e5c0e4fd`), mudaram:

- o ícone da aba;
- o markup e o CSS da aba e dos modais, valor por valor;
- os textos da confirmação;
- o destaque dentro de exclusão em revisão;
- a limpeza da seleção ao trocar de aba;
- a rolagem até a sequência;
- o comportamento em telas pequenas: modal da lista e botão até 992px, painel lateral oculto até 768px.

Os detalhes estão no `design.md` da change arquivada e no item 24 do `CLAUDE.md`.

Esta etapa compara a parte da articulação do lexml-emenda com o que a c01 especifica. Não houve mudança de código.

### Já coincide com o lexml-emenda

| Item | lexml-emenda | c01 |
|---|---|---|
| Botão na barra do texto articulado | `.button-comentario-articulacao`, ícone `iconeComentario`, `aria-label` "Adicionar comentário" | igual |
| Título do botão já comentado | "Este dispositivo já possui comentário" | igual |
| Uma sequência por dispositivo | sim | sim |
| Ícone na linha | `EtaBlotOpcoesComentario`, por último no contêiner de revisão ou, sem ele, no de opções | igual |
| Clique no ícone | posiciona o cursor no dispositivo e exibe a lista com a sequência destacada | igual |
| Cursor ↔ aba | o cursor num dispositivo comentado destaca a sequência e rola; clicar na sequência exibe a aba "Texto" e posiciona o cursor | igual |
| Excluir o dispositivo | remove a sequência; desfazer não a recria | igual |
| Aba no anexo de parecer | exibida | igual |
| Ordem no texto | articulação (0) antes da justificação (1) | igual |

### Diferenças

| # | Item | lexml-emenda | c01 | Proposta |
|---|---|---|---|---|
| D1 | Bloqueio do botão | só sem `lexmlId`, a articulação e o já comentado; demais casos: "Selecione um dispositivo para adicionar comentário" | também omissis e excluído em revisão | decidir |
| D2 | Excluído em revisão | a sequência sai assim que o dispositivo sai da articulação | a sequência fica até a revisão ser aceita; rejeitar a mantém | decidir |
| D3 | Card da articulação | identificação dentro do mesmo bloco do trecho (aspas, uma linha, reticências); selo "No texto" com classe `--texto` | "no lugar do trecho" | seguir o lexml-emenda |
| D4 | Modal de adicionar | rótulo "Trecho selecionado" com a identificação no bloco | "no lugar do trecho selecionado" | seguir o lexml-emenda |
| D5 | Texto da identificação | "inciso I do § 2º do art. 3º"; bloco de alteração: "Inciso I do art. 5º citado no art. 2º"; ementa: "ementa" | ementa: "Ementa"; bloco de alteração: "dentro da norma alterada seguida do artigo hospedeiro" | seguir o lexml-emenda |
| D6 | Telas pequenas | botão "Comentários" em `.mobile-buttons` da barra do texto articulado (até 768px, só ícone até 640px), que abre o modal da lista | não previsto | incluir; estender os requisitos "Sequência atual ao trocar de aba" e "Comentários em telas pequenas", arquivados em 11/11 |
| D7 | Linha sem contêiner de opções | cria `EtaContainerOpcoes` só com o comentário (`criarContainerOpcoes(elemento, incluirDiff, incluirComentario)`, getter `vazio`) e o mantém quando o diff sai (`indicadorTextoModificado`) | não detalhado | incluir no design e nas tasks 3.2 |
| D8 | Âncora | `lexmlId`, corrigido a cada renumeração, mais um mapa de `uuid2` | `uuid2Dispositivo` | manter a c01 (menos pontos de falha) |

### CSS a portar do lexml-emenda (`src/assets/css/editor.css.ts`)

- **`#lx-eta-barra-ferramenta .button-comentario-articulacao`:** `color: #444444`. O `svg` com 16×16 e `vertical-align: -2px`, `.ql-fill` com `fill: currentColor`. Desabilitado (inclusive no hover): `color: #b9b9b9; cursor: default; opacity: 0.65`.
- **`.blot__opcoes_comentario`:** parte da regra compartilhada com `.blot__opcoes_diff`, mas zera `padding`, `border`, `border-radius` e `background`, com `display: inline-block; position: relative`.
  - Foco e `active` sem `outline`, `border` nem sombra.
  - `::before` e `::after` com 1rem, centralizados e máscaras SVG do balão: o fundo `#fff8c5` e o contorno `#111827`.
  - No hover e em `.container__elemento--ativo`, o fundo passa a `#fdd663`.
- **Telas pequenas:**
  - `.mobile-button.btn-comentarios sl-icon { transform: translateY(2px) }`;
  - no `@media (max-width: 768px)`: `.container__linha > .container__menu, .container__revisao, .container__opcoes { align-self: center }`.
- **Fora do CSS, no `eta-quill.ts`:** `EtaBlotOpcoesComentario` entra, com o `EtaBlotOpcoesDiff`, na lista de blots cujo clique não move o cursor do editor.

### Riscos de regressão já identificados

- `sincronizarSequenciasComentario`, o filtro ao abrir (`getIdsComentarios()`) e `excluirSequenciaComentario` precisam olhar só as sequências sem `uuid2Dispositivo`. Sem isso, apagam as da articulação.
- `selecionarSequenciaComentario` hoje sempre exibe a aba da justificação. Para a articulação, a aba é "Texto", também com a flag `preservarSequenciaNaTrocaAba`.
- Transformar um artigo em parágrafo gera `ElementoRemovido` e `ElementoIncluido` com o mesmo uuid no mesmo lote. A conferência precisa olhar o lote inteiro.

### Decisões (11/11/2026)

- **D1, D2 e D8:** mantida a c01. Bloqueio de omissis e de excluído em revisão; sequência mantida até a revisão de exclusão ser aceita; âncora pelo `uuid2`.
- **D3:** incluídas as telas pequenas na articulação, estendendo os requisitos "Sequência atual ao trocar de aba" e "Comentários em telas pequenas".
- **D4 a D7:** seguido o lexml-emenda.
- Artefatos revisados: `proposal.md`, `design.md`, `tasks.md` (novas 3.4 e 4.4) e o delta da spec. `openspec validate --strict` sem erros.

## Grupo 1 — modelo, identificação e ordenação (11/11/2026)

**Tasks:** 1.1, 1.2 e 1.3 concluídas. Progresso da change: 3/16.

### O que mudou

- **`src/model/comentario/comentario.ts`:** `SequenciaComentario` ganhou `uuid2Dispositivo?`, presente só nas sequências da articulação.
- **`src/model/comentario/comentarioUtil.ts`:**
  - `criarSequenciaComentarioDispositivo(usuario, texto, uuid2)` e `isSequenciaDaArticulacao`;
  - em "Ordem no texto", `ordenarSequencias` passou a usar a chave (local, posição): articulação 0, justificação 1, e sem posição vai para o fim do próprio local. "Mais recentes" não mudou.
- **`src/model/comentario/identificacaoDispositivo.ts` (novo):**
  - `identificarLexmlId(lexmlId)` serve ao dispositivo vivo, pelo `buildId` atual, e ao excluído em revisão, pelo `lexmlId` guardado na revisão;
  - `identificarDispositivoComentado(dispositivo)` calcula a identificação do dispositivo atual, sem guardar texto, e por isso acompanha a renumeração;
  - o formato é o do lexml-emenda:
    - "inciso I do § 2º do art. 3º" e "caput do art. 3º";
    - "ementa", "preâmbulo" e "Capítulo II";
    - pena pelo dono ("pena do art. 1º", "pena da alínea “a” …");
    - bloco de alteração: "Inciso I do art. 5º citado no art. 2º".
  - **Decisão não óbvia:** a base é `lexmlIdParaTextoCanonico`, das remissões, e o arquivo dela (`lexmlIdUtil.ts`) não foi alterado. A alínea sai de lá como "alínea b)" e é convertida para "alínea “b”", como no lexml-emenda; o item fica "item 1" nos dois.
  - **Divergência do design:** a identificação parte do id (`buildId`) para os dois casos (vivo e excluído em revisão), e não de `textoCanonicoDoDispositivo` mais um complemento. O resultado é o mesmo e há um caminho só.
- **Testes:** `test/model/comentario/comentarioUtil.test.ts` (criação da sequência de dispositivo, articulação antes da justificação, "Mais recentes" com os dois locais) e `test/model/comentario/identificacaoDispositivo.test.ts` (novo).

### Testes

- `npx wtr out-tsc/test/model/comentario/*.test.js`: **23 de 23 passaram.**
- Regressão dos comentários da justificação (`test/components/comentarios`, `test/componente/lexml-eta/comentarios*`, `test/model/documento/comentarios*`): **88 de 88 passaram.**
- `eslint` e `prettier --check` em `src/model/comentario/` e `test/model/comentario/`: sem erros.

### Em tela

Sem efeito visível neste grupo.

## Grupo 2 — aba de comentários (11/11/2026)

**Tasks:** 2.1 e 2.2 concluídas. Progresso da change: 5/16.

### O que mudou

- **`src/components/comentarios/comentarios.component.ts`:**
  - o selo de local passa a vir da sequência: "No texto" (`comentario-sequencia__origem--texto`) para a articulação e "Na justificação" (`--justificativa`) para a justificação;
  - a identificação do dispositivo vai no mesmo bloco do trecho;
  - sem identificação, o card diz "Dispositivo comentado", como o lexml-emenda.
- **Modal de adicionar:** sem mudança de código. O rótulo continua "Trecho selecionado", com o texto recebido em `abrirModalAdicionar(trecho)`. No grupo 4, o componente raiz passa a identificação do dispositivo.
- **`src/components/comentarios/comentarios.css.ts`:** `--texto` usa os mesmos valores de `--justificativa`, como no lexml-emenda.
- **`src/components/lexml-eta.component.ts`:**
  - a aba "Comentários" e o `lexml-eta-comentarios` passam a existir também no modo anexo de parecer; só "Notas" continua fora;
  - **decisão não óbvia:** no anexo de parecer, a aba da direita aberta por padrão passa de "Atalhos" para "Comentários", como no lexml-emenda (`nomeAbaDireita = 'comentarios'`).
- **Testes:**
  - `test/components/comentarios/comentarios.component.test.ts`: card da articulação com o selo, a identificação e a mesma cor do selo da justificação, e o aviso "Dispositivo comentado";
  - `test/componente/lexml-eta/comentarios.component.test.ts`: o teste "não existe no modo anexo de parecer" passou a "existe também no modo anexo de parecer, aberta por padrão".

### Testes

- `test/components/comentarios/*` e `test/componente/lexml-eta/*`, 17 arquivos: **255 passaram e 1 falhou.**
  - A falha foi em `vocabularioCasaEditor.component.test.ts`, "SF: recusa a URN da Câmara sem alterar o documento em edição".
  - Rodado sozinho, o arquivo passou duas vezes, **11 de 11** nas duas.
  - A falha é intermitente e anterior a esta change: o teste compara dois `getDocumentoArticulado()` sem congelar o relógio, e o `dataUltimaModificacao` muda de segundo quando a máquina está carregada.
- `eslint` e `prettier --check` nos arquivos alterados: sem erros.

### Roteiro em tela

1. Abra um documento em modo anexo de parecer. O painel da direita deve abrir em "Comentários", com "Não há comentários registrados.", e a aba "Notas" não deve aparecer.
2. Fora do anexo de parecer, nada muda: os comentários da justificação continuam com o selo "Na justificação".
3. O card da articulação só fica visível depois do grupo 4, quando passa a ser possível comentar um dispositivo.

## Grupo 3 — editor da articulação (11/11/2026)

**Tasks:** 3.1, 3.2, 3.3 e 3.4 concluídas. Progresso da change: 9/16.

### Decisões tomadas com o usuário neste grupo

- **Transformação troca o `uuid2`.** Ao transformar (parágrafo em artigo, artigo em parágrafo), o reducer recria o dispositivo com o mesmo `uuid` e um `uuid2` novo, contrariando a premissa do design. Decidido: a reconciliação dos comentários (task 4.3) passa a sequência para o novo `uuid2` quando o lote remove e inclui o mesmo `uuid`. O reducer e as remissões não mudam. O lexml-emenda perde o comentário nesse caso. O design e a spec (cenário "Transformação") foram atualizados.
- **Ordem do ícone.** O contêiner de revisão fica antes do de opções (diferenças). O lexml-emenda põe o comentário no de revisão, e ele ficaria antes das diferenças. Decidido: o ícone vai no contêiner que vier por último na linha, então fica sempre depois das diferenças, como diz a spec.

### O que mudou

- **`src/util/eta-quill/eta-blot-opcoes-comentario.ts` (novo):** cópia do blot do lexml-emenda. É um botão com `data-uuid2-dispositivo` que emite `exibir-comentario-dispositivo`; o título foi acentuado ("Exibir comentário").
- **`eta-container-opcoes.ts` e `eta-container-revisao.ts`:**
  - getter `blotBotaoComentario` nos dois, e `vazio` em opções;
  - o elemento atualizado é repassado ao blot.
- **`eta-quill-util.ts`:** `criarContainerOpcoes(elemento, incluirDiff = true, incluirComentario = false)` cria a linha só com o comentário.
- **`eta-container-table.ts`:** getter `containerOpcoes`, igual ao do lexml-emenda.
  - Antes, as chamadas existentes a `linha.containerOpcoes` não tinham efeito, porque o getter não existia, e a remoção era feita só pelo DOM.
  - Agora o diff existente é atualizado no lugar, sem ser recriado.
- **`eta-quill.ts`:** o clique no blot do comentário não move o cursor do editor, como já acontecia no de diferenças.
- **`configure-private-quill.ts`:** registro do `EtaBlotOpcoesComentario`.
- **`src/components/editor/editor.component.ts`:**
  - propriedade `uuid2DispositivosComentados`, que o componente raiz vai alimentar no grupo 4;
  - botão "Adicionar comentário" na barra:
    - habilitação: precisa de `lexmlId` e `uuid2`; não pode ser a articulação, o omissis, dispositivo excluído em revisão nem dispositivo já comentado;
    - títulos da spec;
    - evento `abrir-modal-comentario-dispositivo`.
  - ícone reaplicado em todas as linhas depois do carregamento, de cada lote de eventos e de mudança na lista. As linhas são recriadas por várias ações (transformar, rejeitar, desfazer);
  - quando o ícone de diferenças sai, o contêiner com comentário fica (`indicadorTextoModificado`);
  - clique no ícone: posiciona o cursor e emite `comentario-dispositivo-selecionado` com `abrirAbaComentarios`;
  - cursor: cada `ElementoSelecionado` emite `comentario-dispositivo-selecionado` com o `uuid2`;
  - método público `posicionarCursorNoDispositivo(uuid2)`;
  - botão "Comentários" (`btn-comentarios`) nos botões de telas pequenas, que emite `abrir-modal-lista-comentarios`.
- **`src/assets/css/editor.css.ts`:** CSS do botão, do ícone (máscaras SVG), do `btn-comentarios` e do `align-self` até 768px. Comparado regra por regra com o lexml-emenda: **idêntico**.
- **`test/componente/lexml-eta/comentariosArticulacaoEditor.component.test.ts` (novo):** 14 casos.
  - botão: presença, habilitado, ementa, já comentado, bloqueios;
  - ícone: aparece e some, último no contêiner de revisão, depois do de diferenças, linha recriada ao desfazer e ao transformar, clique;
  - cursor e `posicionarCursorNoDispositivo`;
  - botão de telas pequenas.

### Testes

- `comentariosArticulacaoEditor.component.test.js`: **14 de 14 passaram.**
- Regressão de todos os testes de componente (`test/componente/**` e `test/components/**`, 35 arquivos): **723 de 723 passaram.**
- `prettier --check` nos arquivos alterados: sem erros.
- `eslint`: sem erros e 6 avisos ("Missing return type") em `editor.component.ts`, todos já existentes antes desta change (mesma contagem no código original).

### Roteiro em tela

O botão e o ícone já aparecem, mas criar o comentário depende do grupo 4. Até lá, o botão só emite o evento.

1. No texto articulado, ponha o cursor num artigo. O botão de comentário da barra fica habilitado, com o título "Adicionar comentário".
2. Ponha o cursor num omissis ou num dispositivo excluído em revisão. O botão fica desabilitado, com o título "Selecione um dispositivo para adicionar comentário".
3. A 700px de largura, a barra do texto articulado mostra o botão "Comentários" junto de "Dicas" e "Atalhos"; a 600px, só o ícone.

## Grupo 4 — integração no componente raiz (12/11/2026)

**Tasks:** 4.1, 4.2, 4.3 e 4.4 concluídas. Progresso da change: 13/16.

### O que mudou

- **`src/model/comentario/dispositivoComentado.ts` (novo):** funções puras sobre o estado.
  - `buscarDispositivoComentado`: procura na ementa, no preâmbulo e na articulação. Usa a mesma busca por `uuid2` das remissões (`buscarDispositivoPorUuid2`), que cobre caput, parágrafos e bloco de alteração; a `findDispositivoByUuid2` de `hierarquiaUtil` não cobre os parágrafos de artigo com alteração.
  - `buscarElementoExcluidoEmRevisao`: busca o elemento numa revisão `ElementoRemovido` pendente. Cada dispositivo excluído, inclusive os descendentes, tem revisão própria.
  - `isDispositivoComentadoVivo`, `identificarPorUuid2` e `getOrdemDosDispositivos`.
- **`src/components/lexml-eta.component.ts`:**
  - **Criar:** o modal recebe a identificação como trecho. Ao confirmar, a sequência é criada com o `uuid2`, a aba (até 992px, o modal da lista) é exibida e a sequência fica destacada. Um dispositivo já comentado não ganha a segunda sequência.
  - **Identificação e posição:** `getTrecho` e `getPosicao` resolvem a sequência da articulação pelo `uuid2`. A posição segue a ordem do texto; o excluído em revisão fica antes da próxima linha viva.
  - **Cursor e aba:** o cursor num dispositivo comentado destaca a sequência. O cursor num dispositivo sem comentário só desfaz a seleção se ela for da articulação.
  - **Clicar numa sequência da articulação:** exibe a aba "Texto", sem desfazer a seleção, e posiciona o cursor no dispositivo.
  - **Reconciliação depois do lote inteiro** com `ElementoRemovido` ou `RevisaoAceita`:
    - a sequência continua se o dispositivo existe ou está numa revisão de exclusão pendente;
    - se o lote removeu e incluiu o mesmo `uuid` (transformação), a sequência passa para o novo `uuid2`;
    - nos demais casos, a sequência é descartada.
  - **Proteção da justificação:**
    - a reconciliação `comentarios-alterados` ignora as sequências da articulação;
    - excluir uma sequência da articulação não chama o editor da justificação.
  - **Editor:** a lista de `uuid2` comentados desce para o editor a cada mudança nas sequências.
- **`src/components/lexml-eta-proposicao.component.ts`:** repassa `atualizarDispositivosComentados`, `posicionarCursorNoDispositivo` e `getUuid2sDasLinhas` ao editor.
- **`src/components/editor/editor.component.ts`:** `getUuid2sDasLinhas()`, para a posição do excluído em revisão.
- **Divergência do design, registrada nele:** o conjunto `uuid2DispositivosDescartados` não foi criado. Na articulação não há marcação no texto que o desfazer traga de volta, então o conjunto seria código sem efeito. O comportamento ("desfazer não recria") é coberto por teste.
- **Testes:**
  - `test/componente/lexml-eta/comentariosArticulacao.component.test.ts` (novo, 20 casos):
    - criar, cancelar, ementa, responder e excluir, sem duplicata;
    - cursor e aba, clique na sequência, ícone, tela pequena, ordem no texto;
    - excluir com desfazer, excluir o pai com o alerta, exclusão em revisão aceita e rejeitada, transformação com desfazer;
    - regressão da justificação com as duas listas.
  - Nos dois arquivos de teste da articulação, o `afterEach` cancela o `onchange` agendado pelo editor (1 s), que disparava com o Quill do teste já destruído.

### Testes

- `comentariosArticulacao.component.test.js`: **20 de 20 passaram.**
- Regressão de todos os testes de componente, mais o modelo de comentários e a gravação e leitura dos comentários (40 arquivos): **789 de 789 passaram.**
- `prettier --check` nos arquivos alterados: sem erros.
- `eslint`: sem erros e os mesmos 6 avisos que já existiam em `editor.component.ts`.

### Roteiro em tela

1. Ponha o cursor no parágrafo único do art. 1º e clique no botão de comentário da barra. O modal mostra "Trecho selecionado" com "parágrafo único do art. 1º".
2. Escreva e confirme. O ícone de balão aparece à direita da linha, e a aba "Comentários" mostra a sequência destacada, com "No texto" e a identificação.
3. Ponha o cursor em outro dispositivo; o destaque sai. Volte ao parágrafo; o destaque volta.
4. Exiba a aba "Justificação" e clique na sequência. A aba "Texto" é exibida, com o cursor no parágrafo.
5. Transforme o parágrafo em artigo (Shift+Tab). A sequência passa a "art. 2º", com o ícone. Desfaça, e ela volta a "parágrafo único do art. 1º".
6. Com a revisão ativa, exclua o parágrafo. A sequência e o ícone continuam. Rejeite, e o parágrafo volta com o ícone. Exclua de novo e aceite: a sequência some.
7. Sem revisão, exclua o parágrafo comentado. A sequência some, e desfazer devolve o parágrafo sem o ícone.
8. Comente um trecho da justificação e um artigo. Em "Ordem no texto", o artigo vem primeiro, e editar a justificação não apaga a sequência do artigo.

## Grupo 5 — E2E (Cypress) (12/11/2026)

**Tasks:** 5.1 concluída. Progresso da change: 14/16.

### O que mudou

- **`cypress/e2e/comentarios/comentarios-articulacao.cy.ts` (novo):** usa a fixture `demo/doc/teste_justificacao.json`, que tem o art. 1º com um parágrafo único. Três casos:
  1. comentar o parágrafo pela barra:
     - confere o modal, o ícone, a aba, o selo "No texto", a identificação e o texto do comentário;
     - o botão fica desabilitado no dispositivo já comentado;
     - um artigo incluído antes do art. 1º renumera o dispositivo para "parágrafo único do art. 2º";
     - com a aba "Notas" aberta, o clique no ícone volta para "Comentários" com a sequência destacada;
  2. excluir o parágrafo remove a sequência, e desfazer o devolve sem ícone e sem sequência;
  3. a 700px, o botão "Comentários" da barra do texto articulado abre o modal da lista.
- **Dois defeitos encontrados neste grupo e corrigidos:**
  - **Identificação desatualizada depois de renumerar** (achado pelo E2E). A identificação é calculada ao desenhar a aba, e renumerar não muda a lista de sequências, então a aba não se redesenhava.
    - Correção em `lexml-eta.component.ts`: com sequências da articulação, um lote de eventos estruturais (incluir, remover, renumerar, modificar, mudar a situação, aceitar e rejeitar revisão) pede o redesenho da aba.
    - Teste de componente novo: "renumerar atualiza a identificação exibida na aba".
  - **Ícone fora de ordem em revisão** (achado pelo usuário na tela). Num dispositivo comentado antes de ser alterado em revisão, o ícone de diferenças era criado depois da passada que posiciona o comentário, e ficava aceitar, rejeitar, informações, **comentário**, diferenças.
    - Correção em `editor.component.ts`: uma segunda passada agendada (`setTimeout` 0) depois de cada lote, com o temporizador cancelado em `disconnectedCallback`.
    - Na ementa alterada em revisão, o ícone de comentário nem aparecia; a mesma correção resolveu isso.
    - Dois testes de componente novos fixam a ordem completa: aceitar, rejeitar, informações, diferenças, comentário.

### Testes

- **E2E** (`npx cypress run --env envName=local --spec …`):
  - `comentarios/comentarios-articulacao.cy.ts`: **3 de 3 passaram.** Na primeira rodada, 1 falhou pela identificação desatualizada, o defeito acima, que foi corrigido.
  - Regressão da justificação: `comentarios/comentarios-justificacao.cy.ts` com **5 de 5** e `documento-articulado/abertura-comentarios.cy.ts` com **3 de 3**. Os dois rodaram depois da correção do ícone e antes da correção do redesenho, que só age quando há sequências da articulação.
- **Unitários e de componente:** todos os testes de componente mais o modelo de comentários (38 arquivos), **769 de 769 passaram.**
- `prettier --check`: sem erros. `eslint`: sem erros e os mesmos 6 avisos que já existiam em `editor.component.ts`.

### Roteiro em tela

1. Comente um parágrafo e ative a revisão. Altere o texto do parágrafo. Os botões à direita da linha ficam nesta ordem: aceitar, rejeitar, informações, diferenças e, por último, o comentário.
2. Faça o mesmo com a ementa. O ícone de comentário aparece por último.
3. Comente o parágrafo único do art. 1º e inclua um artigo antes do art. 1º. Na aba, a identificação passa a "parágrafo único do art. 2º" na hora.
