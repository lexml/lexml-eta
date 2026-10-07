# Design

## Context

Ver proposal.md (Why). Segue o padrão por grupo de metadados do LexEdit (`CLAUDE.md`, item 13): campo em `DadosLexEdit`, montador composto em `montaMetadadoLexEdit`, leitor tolerante composto em `lerMetadadoLexEdit`, coleta em `getDocumentoArticulado` e aplicação ao abrir **depois** de `inicializarEdicao`. Fatos do estado atual que moldam a abordagem:

- **Modelo de revisão:** cada `RevisaoElemento` (`state.revisoes`) guarda `stateType`, `usuario`, `dataHora` (`YYYY-MM-DD HH:mm:ss`, horário local, sem fuso) e dois snapshots de `Elemento`: `elementoAntesRevisao` (preservado desde a primeira operação) e `elementoAposRevisao` (substituído a cada operação). Revisões de filhos de um dispositivo incluído ou excluído apontam para a revisão principal por `idRevisaoElementoPrincipal`. Não há atributo que registre quais operações foram aplicadas, nem a ordem.
- **Produtor:** `atualizaRevisao.ts` funde operações num único `RevisaoElemento` por elemento. Movimentação e transformação chegam como `ElementoIncluido` + `ElementoRemovido` no mesmo lote; `isRevisaoDeMovimentacao`/`isRevisaoDeTransformacao` distinguem pelo tipo de `antes` e `apos`. A renumeração manual (`RENUMERAR_ELEMENTO`) não gera revisão (`processaEventosDeRenumeracao` está comentado), portanto `alteracaoRotulo` não tem produtor.
- **Posição dos excluídos:** `atualizarPosicaoDeElementosEmRevisoes` e `atualizarLexmlIdEmElementosDeRevisoes` já mantêm `hierarquia.posicao` e `hierarquia.pai.lexmlId` das revisões de exclusão a cada inclusão ou remoção. Dispositivos excluídos não estão na articulação (`Articulacao`), apenas nos snapshots.
- **Guardas existentes:** `removeElemento.ts` (`existeFilhoExcluidoOuAlteradoDuranteRevisao`) e as duas funções de mover (`existeFilhoExcluidoDuranteRevisao`) já impedem excluir ou mover um pai com filho excluído ou alterado em revisão. Logo, cada exclusão principal contém exatamente os descendentes removidos na mesma ação.
- **Reaplicação:** `aplicaRevisoes.ts` reconstrói `uuid`/`uuid2` e as relações de pai a partir de `lexmlId` e dos snapshots, e posiciona excluídos por `elementoAnteriorNaSequenciaDeLeitura`. Hoje é disparado por `setRevisoes` com um `setTimeout` de 1 s a partir de `Proposicao.revisoes`.
- **Serialização:** `buildNode`/`buildTree` em `buildJsonixFromProjetoNorma.ts` serializam um `Dispositivo` (não um `Elemento`); `buildStructuredContentWithInlineElements(html)` converte HTML em conteúdo inline LexML. O leitor correspondente está em `buildProjetoNormaFromJsonix.ts`.
- **Esquema:** `schemas/lexedit.xsd` já define `RevisoesArticulacao`, `RevisaoArticulacao` (um `choice` com os dispositivos LexML ou `p`, no máximo um filho) e `Usuarios`. O grupo `Pendencias` já é composto em `montaMetadadoLexEdit` (remissão inválida).
- **Datas e usuário:** `Usuario` tem `id: any`, `nome` (padrão `Anônimo`) e `sigla?`; o `id` é fornecido pelo host.

## Goals / Non-Goals

**Goals:**
- Salvar e abrir as revisões da hierarquia (adicionado, excluido, alterado, movido, transformado, inclusive combinadas) sem perda na ida e volta, inclusive pelo CLI real, aproveitando `atualizaRevisao.ts` como produtor.
- Manter a articulação salva na versão atual e abrir de modo que as revisões possam ser aceitas e rejeitadas.

**Non-Goals:**
- `alteracaoRotulo`: o formato aceito é só lido e ignorado ao abrir; nenhum produtor novo.
- O "Problema identificado" de `11-revisao-da-hierarquia.md` (desfazer transformação sem excluir dispositivo subsequente): nova change.
- Revisões textuais da justificação, comentários e o fluxo de `Proposicao.revisoes` do host (apenas deixa de ser enviado ao backend; não é removido do código).
- Mudar o comportamento de edição em revisão (as guardas de excluir e mover pai com filho revisado já existem).

## Decisions

### 1. Atributo `revisao` armazenado em `RevisaoElemento`

`RevisaoElemento` ganha `revisao?: string`, com a gramática do spec (`operacao ("," operacao)*`, argumentos após `;`). `atualizaRevisao.ts` **anexa** a operação nova a cada evento processado, sem recalcular a partir de `antes`/`apos`:
- inclusão sem `antes` → `adicionado`;
- remoção → `excluido`;
- modificação de texto → `alterado`;
- movimentação → `movido;<posicaoOriginal>`, com a posição vinda de `antes` (artigo: sequencial global entre artigos; demais: posição entre todos os filhos do pai, de qualquer tipo);
- transformação → `transformado;<tipoOriginal>`, com o tipo vindo de `antes`.

Uma operação já presente não se repete, e o argumento é o da primeira ocorrência. Operações revertidas (ex.: texto de volta ao original, tipo de volta ao original) são descartadas pela reconciliação descrita em Riscos. Operações em dispositivos adicionados na própria revisão (`adicionado`) não acumulam `alterado`, como hoje (a revisão de inclusão absorve a modificação).

- **Por que armazenar:** só o registro mantém a **ordem** das operações (`movido;3,alterado` vs `alterado,movido;3`), exigida por "o histórico deve conservar todas as operações"; derivar de `antes` x `apos` perderia a ordem e dependeria de heurística para cada combinação.
- **Alternativa descartada:** derivar sempre da comparação `antes`/`apos` ao salvar. Mais simples de manter coerente, mas não preserva a ordem e é frágil nas combinações.
- **Compatibilidade:** o campo existe só em memória; como `Proposicao.revisoes` não é mais enviado ao backend, não há mudança de contrato Java a coordenar além de o host passar a ler as revisões do arquivo.

### 2. `refIdDispositivo` derivado, não armazenado

`refIdDispositivo` é `elementoAposRevisao.lexmlId`, já mantido por `atualizarLexmlIdEmElementosDeRevisoes` a cada inclusão/remoção. Para um artigo, é o id do artigo (não o do caput). Armazenar um segundo campo duplicaria o dado e exigiria sincronização a cada renumeração.

### 3. Mapeador puro em arquivo próprio

Um módulo novo em `src/model/lexml/documento/conversor/` (por exemplo `revisaoArticulacao.ts`) concentra as duas direções, para não crescer `buildJsonixFromProjetoNorma.ts`/`buildProjetoNormaFromJsonix.ts`:
- salvar: `state.revisoes` + articulação → `MetadadoLexEdit.revisoesArticulacao` (`{ TYPE_NAME, revisaoArticulacao: [...] }`) e `usuarios`;
- abrir: grupo lido do arquivo → lista de `RevisaoElemento`, passada ao reducer.

Fica no padrão por grupo: `DadosLexEdit` ganha o campo das revisões, coletado por `getDocumentoArticulado` (o componente de proposição lê `state.revisoes` e `state.usuario` direto do store) e composto em `montaMetadadoLexEdit`; `lerMetadadoLexEdit` devolve as revisões lidas.

### 4. Id dos excluídos calculado ao salvar

O id (`_<base>-exc<seq>`) não é guardado: é função de `hierarquia.pai.lexmlId` e `hierarquia.posicao` do snapshot, campos que já são recalculados a cada operação. O `lexmlId` do próprio snapshot de uma exclusão **não** é mantido (`atualizarLexmlIdEmElementosDeRevisoes` ignora exclusões) e não serve de base.

**Regra final (tarefa 1.3):**
- **Base** = o identificador que o dispositivo receberia se fosse **reincluído agora** no seu slot (`pai.lexmlId` + `posicao`), o mesmo cálculo que o undo e a rejeição já fazem. Obtém-se criando um dispositivo-sonda do mesmo tipo na posição do pai real (com a mesma chamada de `redodDispositivoExcluido`: inciso vai para o caput do artigo), chamando `renumeraFilhos` no pai, lendo `buildId` e removendo a sonda e renumerando de novo, em `try/finally`. Isso cobre sem aritmética própria artigo, parágrafo único vs numerado, inciso do caput e último filho.
- **Sequencial**: os excluídos principais com o mesmo `pai.lexmlId` e `posicao` formam um grupo; a ordem dentro do grupo segue a cadeia `elementoAnteriorNaSequenciaDeLeitura`: `b` vem depois de `a` quando o anterior de `b` é o próprio `a` ou um descendente dele (uuids da revisão principal e das associadas). Ordenar por `posicao` não basta (dois excluídos podem ter a mesma posição) e por `uuid` também não (dispositivos adicionados depois têm uuid maior que o de vizinhos que os antecedem).

Validado com a MPV 905/2019, usando as ações reais do reducer em modo de revisão:

| Cenário | Resultado |
| --- | --- |
| Excluir `art2` e depois o novo `art2` | `_art2-exc1`, `_art2-exc2` |
| Excluir `art2` e depois `art1` | `_art1-exc1` (antigo art. 1), `_art1-exc2` (antigo art. 2) |
| Excluir o último artigo do capítulo e depois o penúltimo | `_art17-exc1` (art. 17), `_art17-exc2` (art. 18) |
| Excluir `art6_par1` e depois o parágrafo que virou único | `_art6_par1u-exc1`, `_art6_par1u-exc2` (a base volta a ser a do parágrafo único, porque não resta parágrafo no artigo) |
| Excluir o parágrafo único `art1_par1u` | `_art1_par1u-exc1` |
| Excluir o inciso do caput `art6_cpt_inc1` | `_art6_cpt_inc1-exc1` |

Não exercitados no spike: artigo com número composto (`1-A`), agrupador, dispositivo em bloco de alteração.

**Refinamentos da implementação (tarefa 3.3):**
- **Bloco de alteração:** o id do dispositivo sai do rótulo, não da posição (a sonda devolve `art[sn:...]`). A base é o id da subárvore solta com o prefixo do artigo hospedeiro temporário trocado pelo id do hospedeiro real (ex.: `art25_cpt_alt1_art1`).
- **Agrupamento:** os excluídos são agrupados pela base final (e não por pai e posição); dentro do grupo, ordenam-se por pai, posição e, no empate, pela cadeia de leitura.
- **Agrupador excluído** (capítulo) funciona pelo mesmo caminho, com a propriedade `capitulo` em `RevisaoArticulacao`. Artigo `1-A` só ocorre em bloco de alteração, coberto pelo caso acima.- **Por que não gravar o id na exclusão:** exclusões posteriores deslocam a base de excluídos anteriores (`_art2-exc1` vira `_art1-exc2` ao excluir o artigo 1 depois). Guardar o id exigiria atualizá-lo em toda operação que muda a posição relativa (exclusão, inclusão, mover, transformar, undo/redo, aceitar/rejeitar); derivar não exige gancho novo.
- Os filhos do excluído usam o id do excluído como prefixo (`_art3-exc1_cpt`, `_art3-exc1_par1`...).
- Ao abrir, a posição se deduz do id: o excluído entra antes do dispositivo de id `<base>` e depois do que o antecede, na ordem do sequencial.

### 5. Dispositivo excluído como subárvore reconstruída dos snapshots

Cada exclusão principal reúne seus descendentes pelas revisões com `idRevisaoElementoPrincipal` igual à dela (a árvore é fechada pelas guardas existentes). Ao salvar, monta-se um `Dispositivo` solto a partir dos snapshots e reaproveita-se `buildNode` para gerar o jsonix, reescrevendo os ids (Decisão 4). Ao abrir, o jsonix do excluído é lido pelo leitor de dispositivos existente em um `Dispositivo` solto e convertido em snapshots com `createElemento`.

- **Alternativa descartada:** guardar a subárvore já serializada na revisão. Os ids internos dependem da posição final e teriam de ser reescritos de qualquer forma, e o dado ficaria desatualizado; não simplifica a leitura, que também precisa produzir snapshots.
- **Resultado do spike (tarefa 1.2), sobre a MPV 905/2019:** a subárvore é simétrica nos dois sentidos para artigo com parágrafo único e incisos (art. 1), artigo com incisos no caput e alíneas (art. 9, 14 snapshots), artigo com incisos e parágrafos numerados (art. 6) e artigo de bloco de alteração com omissis e parágrafos (art. 25, `art25_cpt_alt1_art1`). Em todos, tipos, rótulos, numeração, textos e posição entre irmãos voltam idênticos após snapshot → `Dispositivo` solto → jsonix → `Dispositivo` solto → `Elemento`. Ressalvas que viram requisitos da implementação:
  - **Reuso:** `incluir` (`undoRedoReducerUtil.ts`) funciona como construtor da árvore solta (via `redoDispositivosExcluidos`), mas está acoplado ao `State` e a uma referência de posição (quebra se o excluído não é o primeiro filho). A implementação deve extrair e exportar a parte que cria os dispositivos a partir dos snapshots, sem renumerar nem calcular referência.
  - **Rótulo e numeração:** montar a árvore dentro de uma `Articulacao` temporária a renumera (o artigo único vira "Artigo único."). Depois de criar, o rótulo e o `numero` de cada dispositivo devem ser reaplicados dos snapshots (`rotulo`, `hierarquia.numero`), casando por `uuid`.
  - **Ids:** os ids saem relativos à articulação temporária (`art1`, `art1_cpt_inc1`...), não os originais. O prefixo é reescrito para `_<base>-exc<seq>` (Decisão 4); os filhos mantêm o sufixo relativo ao artigo.
  - **Bloco de alteração:** o excluído precisa de um artigo hospedeiro com `alteracoes` na articulação temporária e de `pai.uuid`/`uuidAlteracao` apontando para ele; os nós ficam em `caput.value.alteracao.content`. O `href` e `abreAspas` já saem corretos. O id do hospedeiro é um marcador (`art[sn:...]`) que a reescrita de prefixo também precisa cobrir.
  - **Fora do spike:** exclusão de **agrupador** (capítulo, seção) e artigo com `alteracoes` próprias não foram exercitadas; ficam cobertas por teste na tarefa 3.3.
- **Risco (mitigado pelo spike 1.2):** a simetria `Dispositivo` solto ↔ `Elemento` foi verificada nos casos abaixo; agrupador excluído e artigo excluído com alterações próprias seguem sem verificação.

### 6. Conteúdo anterior em `alterado`

O texto de `elementoAntesRevisao.conteudo.texto` (HTML) vira um `p` filho de `RevisaoArticulacao`, via `buildStructuredContentWithInlineElements`. Ao abrir, o `p` é convertido de volta em HTML por `buildContent`. Vale para `alterado` isolado ou combinado.

### 7. Data e usuário

- Data: `dataHora` local (`YYYY-MM-DD HH:mm:ss`) → ISO 8601 com o fuso da máquina na data da revisão (`-03:00`); na leitura, o instante é convertido para o horário local no formato interno. Não se persiste o fuso original da revisão: ele é o do navegador que salva.
- Usuário: `refIdUsuario = usuario.id` fornecido pelo host; sem `id`, usa-se `nome`. `Usuarios` lista os distintos, com `sigla` quando houver. Ao abrir, cada revisão recebe `new Usuario(nome, idUsuario, sigla)`; `refIdUsuario` sem registro vira usuário com o próprio id como id e nome.

### 8. Aplicação ao abrir

`abrirDocumentoArticulado` converte as revisões lidas em `RevisaoElemento` (com `revisao`, snapshots `antes`/`apos` e relações de pai/principal) e despacha `aplicarRevisoesAction` **imediatamente depois de `inicializarEdicao`**, sem o `setTimeout` de 1 s de `setRevisoes`. Os snapshots só preenchem o que `aplicaRevisoes.ts` não recompõe (`uuid`, `uuid2` e pais são recalculados a partir de `lexmlId`). O arquivo prevalece sobre `Proposicao.revisoes`: o caminho de abertura de documento articulado não usa `setRevisoes`. Como em `lexml-eta.component.ts#inicializarEdicao`, a ordem importa: o `aplicarRevisoes` deve vir depois de qualquer limpeza de estado (`resetaProposicao`, `limparAlertas`).

### 9. Pendência

`montaMetadadoLexEdit` já compõe `pendencias`. Acrescenta-se "Resolver marcas de revisão na articulação." quando há ao menos uma revisão principal (`getQuantidadeRevisoes > 0`), sem tocar nos demais itens.

### 10. Integração com o CLI real

Novo cenário em `documentoArticulado.integration.ts`: documento com as cinco operações e uma combinada, ida e volta `toxml` → `lexedit.xsd` → `tojson` exigindo `lexedit.revisoesArticulacao` e `usuarios` iguais. O conteúdo filho dos dispositivos excluídos é validado pelo `choice` tipado de `RevisaoArticulacao` (diferente de `RemissoesInternasInvalidas`, que é descartado pelo CLI por estar em `xsd:any`).

## Risks / Trade-offs

- **[Risco] Undo/redo e aceitar/rejeitar com o atributo `revisao`.** Mapeado por leitura do código (tarefa 1.1). O atributo só precisa ser mantido em `atualizaRevisao.ts`; aceitar e rejeitar apenas **removem** revisões (por `filter`), sem editá-las. O ponto frágil é a **reversão parcial**: o código atual retém a revisão quando uma operação é desfeita mas outra continua válida, e o atributo ficaria com uma operação que já não vale. → Decisão 1 ganha uma etapa de reconciliação (abaixo) e testes cobrem cada linha da tabela.

  | Ação | Ponto de código | Efeito sobre as revisões | Manutenção do atributo `revisao` |
  | --- | --- | --- | --- |
  | Nova inclusão | `processaEventosDeInclusao` | cria `RevisaoElemento` sem `antes` | `adicionado` |
  | Nova remoção | `processaEventosDeRemocao` | cria `RevisaoElemento` (`antes` = `apos`) | `excluido` |
  | Alterar texto (sem revisão prévia) | `processaEventosDeModificacao` | cria revisão com `antes` | `alterado` |
  | Alterar texto (revisão prévia) | `processaEventosDeModificacao` | só atualiza `apos`, `usuario` e `dataHora` | anexa `alterado` se a revisão não for de inclusão; **reconciliar** (se `apos.texto` voltar a ser igual a `antes.texto`, o código já remove só a revisão de modificação pura; em combinada, descartar `alterado`) |
  | Mover ou transformar (sem revisão prévia) | `processaEventosDeMoverOuTransformar` → `montarNovaRevisao` | cria revisão com `antes` e `apos` | `movido;<pos>` e/ou `transformado;<tipo>`, conforme `antes` x `apos` |
  | Mover ou transformar (revisão prévia) | mesmo, ramo `else` | converte a revisão em `ElementoIncluido`, substitui `apos`, mantém `antes` | anexa a operação nova; **reconciliar** o resultado |
  | Mover/transformar voltando ao estado original | mesmo, ramos `revisaoDeElementoComMesmo...` | remove as revisões | nada a manter |
  | Undo | `atualizaRevisao` repassa os eventos desfeitos pelos mesmos `processaEventosDe*` | uma inclusão desfeita vira remoção de revisão existente; uma modificação desfeita atualiza `apos` | já coberto pelas linhas acima; **reconciliar** em toda revisão retida |
  | Redo | idem, com os eventos refeitos | recria revisão como em "Nova ..." | idem |
  | Undo/redo de aceitar ou rejeitar | `isUndoDeRevisaoAceitaOuRejeitada`, `mergeEventos...` | restaura ou remove revisões em bloco | nenhuma edição do atributo (objetos de revisão são reaproveitados ou descartados inteiros) |
  | Aceitar / rejeitar | `aceitaRevisao`, `rejeitaRevisao` | removem a revisão e as associadas | nada a manter |
  | Aplicar revisões (abrir) | `aplicaRevisoes` | recebe revisões já montadas | o atributo vem do arquivo (Decisão 8) |

  **Reconciliação.** Depois de anexar a operação nova, e sempre que uma revisão é retida após undo/redo, `atualizaRevisao.ts` descarta do atributo as operações revertidas, mantendo a ordem das demais: `transformado` se `antes.tipo === apos.tipo`; `movido` se `antes` e `apos` têm o mesmo pai e a mesma posição entre os irmãos (artigo: mesma posição global); `alterado` se os textos são iguais. Revisão sem nenhuma operação restante é removida junto com as associadas (nada sobrou dela), inclusive quando a última reversão acontece numa ação posterior (ex.: mover de volta e depois restaurar o texto).
- **[Risco] Fórmula do id-base do excluído** em tipos de numeração especial (ex.: artigo `1-A`, parágrafo único, blocos de alteração) e quando é o último filho. → Regra fixada no spike 1.3 (Decisão 4); `1-A`, agrupador e bloco de alteração seguem para teste na tarefa 3.3.
- **[Risco] Sonda de id altera o modelo temporariamente.** O cálculo da base insere e remove um dispositivo no pai real durante a serialização. → Executa sincronamente, em `try/finally`, e a tarefa 3.3 verifica que a articulação, os `uuid` e a numeração ficam idênticos antes e depois de salvar.
- **[Risco] Simetria `Dispositivo` solto ↔ `Elemento`** (Decisão 5). → Verificada no spike 1.2 (artigo com parágrafo único, inciso, alínea, parágrafos numerados e bloco de alteração), com as ressalvas listadas na Decisão 5; agrupador excluído fica para teste na tarefa 3.3.
- **[Trade-off] Fuso horário.** A data volta no horário da máquina que abre, não no original da revisão; o instante é o mesmo.
- **[Trade-off] `alteracaoRotulo` não é produzida nem aplicada.** Arquivos que a contêm abrem sem esta operação.
- **[Risco] Rejeitar após abrir** depende de `elementoAntesRevisao` reconstruído corretamente (posição original, tipo original, texto original). → Testes de aceitar/rejeitar cada operação sobre documento reaberto, e E2E de abertura.
- **[Risco] Descendentes de um dispositivo adicionado, movido ou transformado.** Só a revisão principal é serializada, mas cada descendente tem a sua `RevisaoElemento` em memória e a rejeição reinclui os `antes` de todos. Ao abrir, os descendentes precisam ser reconstruídos assim: *excluído* — já vêm na subárvore da revisão; *adicionado* — são os descendentes presentes na articulação (sem `antes`); *movido* — o conteúdo, os tipos e a posição relativa não mudam, então o `antes` se sintetiza dos descendentes atuais com o lugar de origem da principal; *transformado* — `converteFilhos` também troca o tipo dos descendentes e o arquivo guarda só o tipo original da principal, então o tipo original de cada descendente teria de ser inferido pela hierarquia (um nível abaixo a cada profundidade). → Tarefas 4.2 e 4.4 verificam transformação e movimentação com filhos por teste real (TAB em inciso com alíneas e itens). Se a inferência não for confiável, estender o `11-revisao-da-hierarquia.md` para registrar os tipos originais dos descendentes, antes de seguir.
- **[Coordenação] Host Java** deixa de receber `Proposicao.revisoes` e passa a ler as revisões do arquivo; a mudança no host é externa a este repositório.
