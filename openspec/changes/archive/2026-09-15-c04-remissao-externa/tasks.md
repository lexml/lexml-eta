## 1. Modelo de dados e configuração (fluxo manual)

- [x] 1.1 Definir `RemissaoExternaValue` em `src/model/remissao/remissao.ts` (compartilhada com o formato de remissão interna)
- [x] 1.2 Adicionar `urlPortalNormas` a `LexmlEtaConfig` (`src/model/lexmlEtaConfig.ts`)
- [x] 1.3 Adicionar `remissoesExternas` ao estado Redux (`src/redux/state.ts`), indexado por `refId`, separado do registro de remissões internas
- [x] 1.4 Criar actions `ADICIONAR_REMISSAO_EXTERNA`/`REMOVER_REMISSAO_EXTERNA` e reducers correspondentes (`adicionaRemissaoExterna.ts`, `removeRemissaoExterna.ts`) — verificado por `test/redux/elemento/reducer/reducer-remissao-externa.test.ts`

## 2. Diálogo unificado e criação/edição manual

- [x] 2.1 Unificar `remissaoInternaDialog.ts` em `remissaoDialog.ts` com aba "Externa" (autocomplete de norma + campo de dispositivo em texto livre) — verificado por `docs/guias/REMISSAO_EXTERNA_GUIA_TESTES.md` CT-E-01/CT-E-02
- [x] 2.2 Validar formato do dispositivo digitado via `validaDispositivoAssistente`, rejeitando entradas impossíveis de parsear — verificado por CT-E-04
- [x] 2.3 Exigir seleção de texto não-vazia para habilitar a confirmação (diferente da remissão interna) — verificado por CT-E-03
- [x] 2.4 Suportar modo edição com a aba correta conforme o tipo da remissão (`'interna' | 'externa'`), populando os campos a partir do valor existente — verificado por CT-E-07

## 3. Blot Quill e renderização

- [x] 3.1 Implementar `eta-blot-remissao-externa.ts` (class `lexml-remissao-externa`, atributos `data-ref-id`/`data-urn`/`data-fragmento`), mesmo estilo visual da remissão interna
- [x] 3.2 Implementar métodos de `moduloRemissao.ts` para externa: `criarRemissaoExterna`, `adicionarRemissaoExterna` (edição), `removerRemissaoExternaPorId`, `getRemissaoExternaEmCursor`, `renderizarRemissoesExternasDoState`

## 4. Popup de ações

- [x] 4.1 Estender o popup compartilhado com a remissão interna para detectar o tipo pelo elemento (`lexml-remissao-interna` vs `lexml-remissao-externa`) — `getRemissaoExternaEmCursor` em `moduloRemissao.ts`, wiring em `editor.component.ts`
- [x] 4.2 Implementar ação "Abrir" (constrói URL a partir de `urlPortalNormas` + URN, sem deep link de dispositivo) — verificado por `docs/guias/REMISSAO_EXTERNA_GUIA_TESTES.md` §5
- [x] 4.3 Implementar ações "Editar" (reabre diálogo na aba Externa) e "Excluir" (`removerRemissaoExternaPorId`) — verificado por CT-E-07/CT-E-08

## 5. Detecção automática via lexml-linker (WASM)

- [x] 5.1 Vendorizar o artefato `lexml-linker.wasm`/`.mjs` e o shim `browser_wasi_shim`, com commit upstream pinado (`93b57ce`/`b0fa5d6`), em `src/util/lexml-linker/vendor/`
- [x] 5.2 Implementar o Worker de inicialização/execução do WASM (`lexml-linker.worker.ts`) e o cliente da thread principal (`lexmlLinkerClient.ts`), com descarte de respostas obsoletas por contador de revisão — verificado por `test/util/lexml-linker/lexmlLinkerClient.test.ts`
- [x] 5.3 Implementar extração de offsets a partir do HTML decorado (`outputType: "html"`) em `parseHtmlDecorado.ts` — verificado por `test/util/lexml-linker/parseHtmlDecorado.test.ts` (7 casos: match único, múltiplos, adjacentes, entidades HTML, Unicode, href sem fragmento)
- [x] 5.4 Confirmar paridade entre a CLI nativa (`linkertool`) e a chamada via WASM — 25/25 casos idênticos, 0 divergências
- [x] 5.5 Validar contra corpus real de proposições (`demo/doc/`) — 27/27 casos passando; achado de gap de cobertura do parser (faixa de 3+ artigos) registrado como limitação conhecida, não corrigido

## 6. Coordenação com detecção de remissão interna

- [x] 6.1 Orquestrar a chamada ao Worker a partir do mesmo gatilho de blur da remissão interna (`detectarRemissoesAoSairDaLinha`/`flushEdicaoPendente`), sem gatilho próprio adicional — `coordenarDeteccaoExterna` em `editor.component.ts`
- [x] 6.2 Excluir da detecção interna os spans já reivindicados pela externa, lendo direto de `state.remissoesExternas` (sem parâmetro novo na action) — verificado por `test/redux/elemento/reducer/reducer-exclusao-span-externo.test.ts`
- [x] 6.3 Reconciliar remissão interna conflitante criada antes da externa resolver, removendo o blot obsoleto tanto do registro quanto do editor
- [x] 6.4 Regressão completa dos Grupos A–I de E2E de remissão interna sem mudança de resultado esperado — 49/49, repetido 2x
- [x] 6.5 Criação em lote de remissões externas automáticas, reaproveitando a action/reducer de criação individual em loop, sem action/reducer novo

## 7. Resolução de nome amigável de norma

- [x] 7.1 Aceitar `targetNomeNorma` vazio na criação automática (popup degrada para o texto do link) — verificado por CT-E-05/CT-E-06
- [x] 7.2 Implementar busca reversa de nome por URN ao abrir uma remissão automática para edição, reaproveitando `autocomplete-norma`/`urnInicial` já existente

## 8. Colagem de link (clipboard)

- [x] 8.1 Reconhecer link já no formato de remissão externa colado no editor, preservando-o — verificado por `test/.../clipboardMatcherUrnLex.test.ts`
- [x] 8.2 Converter link legado com URN direta no `href` (sem os atributos do formato próprio) para o formato de remissão externa

## 9. Persistência (salvar/abrir)

- [x] 9.1 Serializar remissão externa no mesmo elemento `<Remissao>` da remissão interna, com `href` = URN (+ fragmento após `!` quando disponível) em `buildJsonixFromProjetoNorma.ts`
- [x] 9.2 Deserializar detectando `href` que começa com `urn:lex:` em `buildProjetoNormaFromJsonix.ts`, distinguindo de um id local de dispositivo (remissão interna) sem ambiguidade
- [x] 9.3 Reconstruir o registro de remissões externas ao abrir um documento, varrendo o texto (`inicializaRemissoesExternasAoAbrir.ts`), sem depender de estado de sessão anterior — verificado por `test/.../roundTripRemissaoExterna.test.ts`
- [x] 9.4 Forçar a detecção pendente da última linha editada antes de serializar (`flushEdicaoPendente`), reaproveitando a mesma cadeia determinística da remissão interna
- [x] 9.5 Recomputar o registro do zero a partir do texto em undo/redo, em vez de reverter incrementalmente — remissão externa não precisa de recálculo por renumeração

## 10. Verificação e cobertura de testes

- [x] 10.1 Suíte unitária — `test/model/remissao/`, `test/redux/elemento/reducer/`, `test/components/editor/`, `test/util/lexml-linker/` (2940/2940 testes totais, sem regressão)
- [x] 10.2 Suíte E2E Cypress — `cypress/e2e/remissao-externa/` (grupo-a-deteccao-automatica, grupo-b-coexistencia-interna)
- [x] 10.3 Confirmar consistência entre `openspec/specs/remissao-externa/spec.md` (já existente, commit `59aaccc5`/`8c400c28`) e o delta desta change, incluindo o requisito de popup adicionado retroativamente por não ter sido documentado antes
- [x] 10.4 Registrar, no design.md desta change, os riscos e limitações conhecidos e ainda não corrigidos (R9-R12 do parser upstream, corrida de assentamento em proposição nova, janela residual de save fire-and-forget, artefato WASM ausente do pacote publicado) — não é trabalho pendente desta change, é documentação de estado real
