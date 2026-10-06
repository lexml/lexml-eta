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

Uma operação já presente não se repete, e o argumento é o da primeira ocorrência. Operações em dispositivos adicionados na própria revisão (`adicionado`) não acumulam `alterado`, como hoje (a revisão de inclusão absorve a modificação).

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

O id (`_<base>-exc<seq>`) não é guardado: é função de `hierarquia.pai.lexmlId` e `hierarquia.posicao` do snapshot, campos que já são recalculados a cada operação. A base é o identificador que o dispositivo ocuparia na posição final em que aparece na edição (o do dispositivo presente que o segue, ou o próximo identificador livre, se for o último); o sequencial numera, por posição, os excluídos de mesma base.

- **Por que não gravar o id na exclusão:** exclusões posteriores deslocam a base de excluídos anteriores (`_art2-exc1` vira `_art1-exc2` ao excluir o artigo 1 depois). Guardar o id exigiria atualizá-lo em toda operação que muda a posição relativa (exclusão, inclusão, mover, transformar, undo/redo, aceitar/rejeitar); derivar não exige gancho novo.
- Os filhos do excluído usam o id do excluído como prefixo (`_art3-exc1_cpt`, `_art3-exc1_par1`...).
- Ao abrir, a posição se deduz do id: o excluído entra antes do dispositivo de id `<base>` e depois do que o antecede, na ordem do sequencial.

### 5. Dispositivo excluído como subárvore reconstruída dos snapshots

Cada exclusão principal reúne seus descendentes pelas revisões com `idRevisaoElementoPrincipal` igual à dela (a árvore é fechada pelas guardas existentes). Ao salvar, monta-se um `Dispositivo` solto a partir dos snapshots e reaproveita-se `buildNode` para gerar o jsonix, reescrevendo os ids (Decisão 4). Ao abrir, o jsonix do excluído é lido pelo leitor de dispositivos existente em um `Dispositivo` solto e convertido em snapshots com `createElemento`.

- **Alternativa descartada:** guardar a subárvore já serializada na revisão. Os ids internos dependem da posição final e teriam de ser reescritos de qualquer forma, e o dado ficaria desatualizado; não simplifica a leitura, que também precisa produzir snapshots.
- **Risco:** a simetria `Dispositivo` solto ↔ `Elemento` (caput, blocos de alteração) não foi verificada; é a primeira tarefa (spike) da change.

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

- **[Risco] Undo/redo e aceitar/rejeitar com o atributo `revisao`.** `atualizaRevisao.ts` trata UNDO/REDO por ramos próprios e pode reconstruir revisões sem passar pelos pontos onde o atributo é anexado. → Spike inicial mapeia esses caminhos; testes cobrem mover → undo → redo e alterar → rejeitar.
- **[Risco] Fórmula do id-base do excluído** em tipos de numeração especial (ex.: artigo `1-A`, parágrafo único, blocos de alteração) e quando é o último filho. → Spike com casos reais; se não for determinística, fixar a regra no spec antes de seguir.
- **[Risco] Simetria `Dispositivo` solto ↔ `Elemento`** (Decisão 5). → Spike com árvore de três níveis (artigo com parágrafo, inciso e alínea).
- **[Trade-off] Fuso horário.** A data volta no horário da máquina que abre, não no original da revisão; o instante é o mesmo.
- **[Trade-off] `alteracaoRotulo` não é produzida nem aplicada.** Arquivos que a contêm abrem sem esta operação.
- **[Risco] Rejeitar após abrir** depende de `elementoAntesRevisao` reconstruído corretamente (posição original, tipo original, texto original). → Testes de aceitar/rejeitar cada operação sobre documento reaberto, e E2E de abertura.
- **[Coordenação] Host Java** deixa de receber `Proposicao.revisoes` e passa a ler as revisões do arquivo; a mudança no host é externa a este repositório.
