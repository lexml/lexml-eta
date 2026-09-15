## Context

Ver proposal.md para a motivação completa (backfill de uma capability já implementada e entregue). Este documento resume as decisões técnicas com base em `docs/referencia/PAGINACAO.md` (não versionado no git) e no histórico de commits da branch `feat/paginacao`.

Cronologia: núcleo entregue em 06-07/06/2024 (`9b3a15de` "paginação de dispositivos da proposição", `27efea01` "parametrizando a configuração da paginação", `aaf59308` fix inicial); caso de emenda onde couber corrigido em 27/06/2024 (`a4496146`); ajuste no cálculo do artigo final da combo em 07/02/2025 (`edd1e18b`); migração de testes para o modo proposição e uma otimização de busca por página (evita busca linear) em 26/08–06/09/2026 (`a4a7b557`, `6ad23700`) — esta última uma melhoria de desempenho recente, sem mudança de comportamento observável, portanto sem efeito nos requisitos.

## Goals / Non-Goals

**Goals:**
- Documentar, como requisitos testáveis, o comportamento observável da paginação — cálculo inicial, navegação, atualização incremental, e os casos de borda que já têm tratamento explícito no código.
- Registrar as decisões arquiteturais com efeito observável duradouro (fronteira de artigo, identidade por uuid, recarregamento em vez de scroll).
- Registrar as limitações e problemas conhecidos, ainda não corrigidos, listados na própria documentação de referência (§6 de `PAGINACAO.md`), para que não se percam com a migração para OpenSpec.

**Non-Goals:**
- Não propõe nenhuma correção para as limitações listadas abaixo — são documentadas como estão.
- Não cobre a interação com `remissao-interna`/`remissao-externa` além de constatar que a paginação opera sobre a árvore de dispositivos já montada, sem depender de nem afetar o registro de remissões.
- Não cobre serialização/deserialização do documento (capabilities `salvar-documento-articulado`/`abrir-documento-articulado`) — a paginação é puramente uma divisão de exibição em memória, nunca persistida no LexML salvo.

## Decisions

**Cálculo no carregamento, não "passar para a próxima página".** A paginação é derivada uma vez ao carregar o documento (`configurarPaginacao`, a partir de `LOAD_ARTICULACAO`) e depois mantida incrementalmente — não é recalculada do zero a cada ação. Cada página guarda sua própria lista completa de dispositivos (`PaginaArticulacao.dispositivos`), não apenas um range.

**Quebra sempre em fronteira de artigo.** O cálculo automático (`getArtigoFinal`) usa uma heurística para encontrar o último artigo completo que cabe no limite configurado — nunca separa um artigo de seus filhos (caput, parágrafos, incisos, alíneas, itens). Consequência aceita: o número real de dispositivos por página pode variar significativamente do limite configurado, já que um artigo com muitos filhos pode empurrar a contagem bem além do limite antes de fechar a página.

**Localização por uuid, não por lexmlId.** `findPaginaByUuidDispositivo` busca pela identidade estável do dispositivo, não pelo id textual (que muda ao renumerar) — decisão simétrica à mesma escolha feita em `remissao-interna` (resolução de remissões por uuid, não por diff de id).

**Navegação recarrega o editor, não faz scroll.** Trocar de página limpa o Quill (`quill.setText('')`) e renderiza do zero os dispositivos da página selecionada — escolha deliberada para manter apenas uma "janela" de dispositivos montada no editor por vez, preservando a performance que motivou a feature.

**Dispositivos entre páginas (agrupadores) vão para a página seguinte.** Quando um Livro/Título/Capítulo/Seção fica entre o último artigo de uma página e o primeiro da próxima, ele é incluído na página seguinte (`getDispositivosEntreUltimoArtigoAnteriorEPrimeiroArtigoDaPagina`) — mantém o contexto hierárquico visível para quem abre aquela página, em vez de ficar "perdido" na página anterior.

**Modo de revisão mantém dispositivos excluídos navegáveis.** Um dispositivo marcado como excluído em modo de revisão continua tendo seu id presente na paginação (`adicionaIdsDeDispositivosRemovidosEmModoDeRevisao`), mesmo não fazendo mais parte da articulação ativa — permite ao usuário navegar até ele para revisar a exclusão.

## Risks / Trade-offs

- [Limitação conhecida, não corrigida] Há casos extremos, sinalizados como TODO no próprio código (`atualizaPaginacao.ts`), onde dispositivos podem ficar "órfãos" da paginação — sem garantia formal de que todo dispositivo da articulação (ou todo dispositivo removido em modo de revisão) esteja em alguma página.
- [Limitação conhecida, não corrigida] O algoritmo de busca do "dispositivo anterior que já está em alguma página" (`findPaginaDoDispositivoAnterior`) é um loop que pode ser ineficiente em documentos muito grandes com muitos dispositivos consecutivos sendo inseridos na mesma operação.
- [Limitação conhecida, não corrigida] O cálculo de limite por página não é preciso — como a contagem inclui toda a hierarquia de filhos e a quebra respeita fronteira de artigo, o número final de dispositivos por página pode variar significativamente do limite configurado (1250 por padrão).
- [Problema conhecido, não corrigido] Em operações de movimentação múltipla ou undo/redo complexo, dispositivos podem temporariamente ficar na página incorreta até a próxima atualização de paginação.
- [Problema conhecido, não corrigido] A paginação não recalcula ranges após mudanças drásticas no tamanho do documento — se um documento com 1000 artigos é reduzido para 100, a estrutura de páginas original é mantida (podendo resultar em páginas vazias), em vez de recalcular a divisão.
- [Trade-off, comportamento intencional mas pode confundir] Quando um dispositivo é movido para outra página, o usuário é levado automaticamente para a nova página — decisão deliberada para manter o dispositivo selecionado visível, mas pode ser inesperada se o usuário não previa ser redirecionado.

## Migration Plan

Não aplicável — este documento formaliza retroativamente uma funcionalidade já em produção há mais de um ano (núcleo de 06/2024), sem nenhuma mudança de comportamento ou dado a migrar.
