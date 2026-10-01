## 1. Modelo de dados e configuração

- [x] 1.1 Definir `ConfiguracaoPaginacao`, `PaginaArticulacao`, `RangeArtigos` em `src/model/paginacao/paginacao.ts`
- [x] 1.2 Definir `MAX_DISPOSITIVOS_PAGINA` (padrão 1250) e o estado Redux `Paginacao` (`paginasArticulacao`, `paginaSelecionada`) em `state.ui.paginacao`

## 2. Cálculo inicial de páginas

- [x] 2.1 Implementar `configurarPaginacao` como ponto de entrada, decidindo entre ranges explícitos e cálculo automático — `src/redux/elemento/util/paginacaoUtil.ts`
- [x] 2.2 Implementar `paginarArticulacao` (cálculo automático por limite): percorre a lista plana de dispositivos, calcula o número de páginas e encontra o último artigo completo que cabe em cada uma (`getArtigoFinal`) — commit `9b3a15de`
- [x] 2.3 Implementar `paginarArticulacaoByNumerosArtigos` (ranges explícitos): extrai dispositivos por range, adiciona pais/ementa na primeira página e agrupadores intermediários nas seguintes — commit `27efea01`
- [x] 2.4 Tratar caso de documento vazio (emenda onde couber) com `buildPaginaArticulacaoVazia` — commit `a4496146`
- [x] 2.5 Plugar a inicialização em `loadArticulacao.ts`, disparada por `LOAD_ARTICULACAO`, emitindo `StateType.DocumentoCarregado`

## 3. Navegação entre páginas

- [x] 3.1 Implementar `selecionarPaginaArticulacaoAction`/`SELECIONAR_PAGINA_ARTICULACAO` e o reducer `selecionaPaginaArticulacao.ts`, emitindo `StateType.PaginaArticulacaoSelecionada` com os elementos da página (incluindo excluídos em revisão)
- [x] 3.2 Implementar o seletor de página (dropdown) em `editor.component.ts`, oculto quando há só uma página (`isPaginaUnica`)
- [x] 3.3 Implementar o recarregamento do editor ao trocar de página (limpar Quill, renderizar só os dispositivos da página selecionada, destacar a primeira linha)

## 4. Atualização incremental

- [x] 4.1 Implementar `atualizaPaginacao.ts`: verifica se há paginação ativa, ignora a própria ação de seleção de página, e trata o caso de página única separadamente
- [x] 4.2 Implementar `incluiDispositivosNaPaginacao` para `ElementoIncluido`, determinando a página de destino a partir da ação (`ADICIONAR_ELEMENTO`, `MOVER_ELEMENTO_ABAIXO`/`ACIMA`) e removendo da página de origem em caso de movimento
- [x] 4.3 Implementar `removeDispositivosDaPaginacao` para `ElementoRemovido`, removendo o dispositivo de todas as páginas
- [x] 4.4 Implementar `findPaginaDoDispositivoAnterior` para resolver a página de um dispositivo inserido em lote cujo "anterior" também está sendo inserido na mesma operação
- [x] 4.5 Implementar `atualizaIdsDasPaginas` (reconstrução do índice `ids[]`) e `adicionaEventosDeMudancaDePaginaSeNecessario` (leva o usuário à nova página quando a seleção muda de página, após mover/undo/redo)
- [x] 4.6 Otimizar a busca de página por uuid para evitar busca linear — commit `6ad23700` (melhoria de desempenho, sem mudança de comportamento observável)
- [x] 4.7 Corrigir o número do artigo final exibido na combo de paginação — commit `edd1e18b`

## 5. Modo de revisão

- [x] 5.1 Implementar `insereElementosExcluidosEmModoDeRevisaoNaLista`, incluindo dispositivos excluídos na lista de elementos renderizados na posição correta
- [x] 5.2 Implementar `adicionaIdsDeDispositivosRemovidosEmModoDeRevisao`, adicionando os ids desses dispositivos à paginação para permitir navegação

## 6. Verificação e cobertura de testes

- [x] 6.1 Suíte unitária — `test/redux/elemento/util/paginacaoUtil.test.ts`, `test/redux/elemento/reducer/` (inicialização, seleção, atualização incremental)
- [x] 6.2 Suíte E2E Cypress — `paginacao-plp-68.cy.ts` e demais specs de paginação; migração para o modo proposição — commit `a4a7b557`
- [x] 6.3 Confirmar consistência entre `openspec/specs/paginacao-articulacao/spec.md` (já existente, commit `59aaccc5`/`8c400c28`) e o delta desta change — sem lacunas encontradas, réplica fiel
- [x] 6.4 Registrar, no design.md desta change, as limitações e problemas conhecidos documentados em `PAGINACAO.md` §6 (dispositivos potencialmente órfãos da paginação, busca de página anterior ineficiente em lote grande, cálculo de limite impreciso, página incorreta temporária em undo/redo complexo, ranges não recalculados após redução drástica do documento) — não é trabalho pendente desta change, é documentação de estado real
