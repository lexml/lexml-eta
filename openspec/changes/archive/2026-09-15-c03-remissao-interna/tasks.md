## 1. Detecção automática de referências

- [x] 1.1 Implementar passagem de detecção absoluta composta (até 4 níveis: artigo/parágrafo/inciso/alínea) em `adicionaRemissaoInterna.ts` — verificado por `test/model/remissao/` e `test/redux/elemento/reducer/reducer-deteccao-composta.test.ts`
- [x] 1.2 Implementar passagem de detecção de agrupadores (Capítulo/Seção/Subseção/Título/Livro/Parte, incluindo "único/única" com guarda anti-falso-positivo) — verificado por testes dedicados de agrupador
- [x] 1.3 Implementar passagem de detecção contextual ("deste artigo"/"desta Seção") via `buscarAncestralPorTipo` — verificado por `test/redux/remissao/reducer-deteccao-contextual.test.ts`
- [x] 1.4 Implementar passagem de detecção implícita sem qualificador ("§ 1º" bare, cascata de ancestrais por tipo) com lookahead negativo para não colidir com as passagens 1 e 3 — verificado por `test/redux/remissao/reducer-deteccao-contextual.test.ts` (CT-X28 a CT-X39, conforme `docs/planos/PLANO_DETECCAO_PARAGRAFO_IMPLICITA.md`)
- [x] 1.5 Implementar deduplicação por posição (match mais longo vence) em `detectarReferencias` — verificado pelos casos de sobreposição entre passagens
- [x] 1.6 Corrigir absorção do ordinal ("º") em remissão já criada, estendendo o blot existente em vez de pulá-lo incondicionalmente — `moduloRemissao.ts#renderizarRemissoesDoState`, conforme `docs/planos/PLANO_ORDINAL_REMISSAO.md`

## 2. Gatilho de criação (detecção híbrida por blur)

- [x] 2.1 Isolar o dispatch de criação de remissão do debounce de digitação, mantendo-o só na sincronização de texto — `editor.component.ts#atualizarTextoElemento`
- [x] 2.2 Disparar a criação ao trocar de linha dentro do editor (`observableSelectionChange`) via `detectarRemissoesAoSairDaLinha` — commit `d94db2ed`
- [x] 2.3 Disparar a criação ao sair do editor inteiro (`focusout`, critério de contenção pelo `blotConteudo` da linha ativa)
- [x] 2.4 Implementar `flushEdicaoPendente()` público e chamá-lo incondicionalmente em `getProjetoAtualizado()` antes de serializar — garante que o Salvar nunca perde uma remissão pendente
- [x] 2.5 Cobertura E2E do gatilho de blur (linha, painel lateral, aba, botão Salvar) — `cypress/e2e/remissao-interna/grupo-j-deteccao-blur.cy.ts`

## 3. Criação manual via diálogo

- [x] 3.1 Implementar diálogo de seleção manual com busca (`remissaoInternaDialog.ts`) — commit `d8348fe6` ("Reformula modal de edição de remissão")
- [x] 3.2 Unificar em diálogo com abas Interna/Externa (`remissaoDialog.ts`), compartilhado com a capability `remissao-externa`
- [x] 3.3 Desabilitar a ação de abrir o diálogo quando não há seleção de texto — commit `107df031`
- [x] 3.4 Suportar modo edição (dispositivo atual pré-selecionado) a partir do popup

## 4. Popup de ações

- [x] 4.1 Implementar componente de popup desacoplado de Quill/Redux (`src/components/popup-inline/popupInline.ts`)
- [x] 4.2 Exibir popup ao posicionar o cursor sobre o link (`getRemissaoNoCursor` em `moduloRemissao.ts`), sem exigir clique; remover navegação direta ao clicar
- [x] 4.3 Implementar ações "Ir para dispositivo", "Editar" e "Excluir" no popup, com `mousedown.preventDefault()` para não perder o foco do Quill
- [x] 4.4 Estado de alerta no popup para remissão inválida (rótulo não clicável, "Ir" desabilitado) — conforme `docs/planos/PLANO_POPUP_HOVER_REMISSAO.md`

## 5. Remoção de remissões

- [x] 5.1 Remover o formato do link preservando o texto original (`removerRemissao` em `moduloRemissao.ts`) — verificado por `test/components/editor/removerRemissao.test.ts`
- [x] 5.2 Suportar remoção de múltiplos links contidos em uma seleção
- [x] 5.3 Remoção em tempo real ao editar o interior de um link existente, com cache de texto por `refId` e filtro contra reconstruções estruturais do documento (`_removerRemissaoEditadaEmTempoReal`)

## 6. Atualização automática por renumeração

- [x] 6.1 Preservar uuid do dispositivo (e descendentes) na transformação de tipo — pré-requisito para resolver o alvo pela identidade estável (`converteDispositivo`/`criaDispositivo`)
- [x] 6.2 Implementar `sincronizarRemissoesComEstadoAtual`/`sincronizarEntrada` (`src/model/remissao/sincronizarRemissoes.ts`), recalculando o texto a partir do objeto atual em vez de diff textual entre lexmlId antigo/novo — commit `150f564f` ("centraliza sincronização de remissões após ações estruturais")
- [x] 6.3 Implementar os três estilos de atualização — qualificada (recalcula a cadeia inteira), enxuta (só muda se a posição no pai imediato mudar) e contextual (só o segmento antes do sufixo muda) — `textoCanonicoDoDispositivo`, `textoCanonicoLocal`, `textoCanonicoRelativoATipo` em `lexmlIdUtil.ts`, verificado por `test/model/remissao/sincronizarRemissoes-referenciaEnxuta.test.ts` (26 casos)
- [x] 6.4 Preservar texto editado manualmente via comparação de igualdade contra o último `textoRef` gravado (`foiEditadoManualmente`) e checagem de reconhecibilidade (`isTextoReconhecivel`), sinalizando revisão quando não é seguro atualizar sozinho
- [x] 6.5 Plugar o recálculo na cadeia de pós-processamento genérico do reducer, restrito a ações estruturais (`ADICIONAR_ELEMENTO`, `REMOVER_ELEMENTO`, `RENUMERAR_ELEMENTO`, `AGRUPAR_ELEMENTO`, `TRANSFORMAR_TIPO_ELEMENTO`, `TAB`/`SHIFT_TAB`, `UNDO`, `REDO`) — `sincronizarRemissoesPosAcao.ts`
- [x] 6.6 Remover as 5 implementações duplicadas de captura/emissão do mecanismo antigo (`adicionaElemento.ts`, `removeElemento.ts`, `renumeraElemento.ts`, `agrupaElemento.ts`, `undo.ts`)
- [x] 6.7 Validação de regressão via Cypress Grupo G (atualização por renumeração) — 9/9

## 7. Invalidação e restauração

- [x] 7.1 Marcar remissão como inválida (`valida:false`) e exibir mensagem de erro ao excluir o dispositivo de destino — commit `94bb5ab3` ("detecta e exibe remissões inválidas ao carregar proposição")
- [x] 7.2 Restaurar automaticamente a marcação e a mensagem ao desfazer (undo) a exclusão, sem nova detecção — commit `35b61a7f` ("Corrige remissão inválida no control + z")
- [x] 7.3 Suportar deleção lógica (tombstone) de remissão excluída manualmente pelo usuário, evitando recriação pela detecção automática — commit `ad516ef9`

## 8. Persistência (salvar/abrir)

- [x] 8.1 Serializar remissões como `<Remissao href="lexmlId">` no LexML, incluindo o sufixo `@revisar` e a sentinela `@invalido` quando aplicável — commits `e75d80c2`, `f807ad44`
- [x] 8.2 Completar o registro de remissões de dispositivos não editados na sessão antes de serializar (`completarRegistroRemissoes`)
- [x] 8.3 Reconstruir o registro de remissões ao abrir um documento, varrendo o texto (`inicializaRemissoesAoAbrir.ts`), sem depender de estado de sessão anterior
- [x] 8.4 Preservar o texto fixo (`textoFixo`) de remissões manuais através do ciclo salvar/abrir (`restauraTextoFixoRemissoes`)

## 9. Verificação e cobertura de testes

- [x] 9.1 Suíte unitária de remissão interna (detecção, registry, atualização, invalidação, persistência) — `test/model/remissao/`, `test/redux/elemento/reducer/`, `test/components/editor/`
- [x] 9.2 Suíte E2E Cypress — `cypress/e2e/remissao-interna/` (grupos A a J)
- [x] 9.3 Confirmar consistência entre `openspec/specs/remissao-interna/spec.md` (já existente, commit `59aaccc5`/`8c400c28`) e o delta desta change, incluindo o requisito de popup adicionado retroativamente por não ter sido documentado antes
