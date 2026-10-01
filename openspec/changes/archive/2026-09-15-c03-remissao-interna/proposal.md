## Why

A funcionalidade de remissão interna (detecção, criação, atualização, remoção, invalidação e persistência de referências cruzadas entre dispositivos do mesmo documento) já foi implementada e entregue em várias ondas entre 27/02/2026 e 24/07/2026, fora da metodologia OpenSpec — `openspec/specs/remissao-interna/spec.md` já existe (commit `59aaccc5`/`8c400c28`), mas nunca passou pelo ciclo `changes/` → `changes/archive/` correspondente. Esta change traz essa entrega para a metodologia, documentando o comportamento já implementado e testado, antes que o conhecimento fique preservado apenas em documentos soltos de planejamento (`docs/planos/PLANO_DETECCAO_BLUR.md`, `PLANO_DETECCAO_PARAGRAFO_IMPLICITA.md`, `PLANO_SIMPLIFICACAO_ATUALIZACAO_REMISSAO.md`, `PLANO_POPUP_HOVER_REMISSAO.md`, `PLANO_ORDINAL_REMISSAO.md`, e `docs/referencia/REMISSAO_INTERNA.md`/`docs/guias/REMISSAO_INTERNA_GUIA_TESTES.md`), que não são versionados no repositório principal.

## What Changes

- Detecção automática de referências no texto de um dispositivo, em 4 passagens: absoluta composta (até 4 níveis: artigo/parágrafo/inciso/alínea), agrupadores (Capítulo/Seção/..., incluindo "único/única"), contextual ("deste artigo"/"desta Seção") e implícita sem qualificador ("§ 1º" bare, resolvida pelo contexto estrutural).
- Deduplicação por posição quando mais de uma passagem casa no mesmo trecho — mantém o match mais longo, priorizando detecção explícita sobre implícita.
- Criação manual via diálogo com busca, compartilhado com a aba de remissão externa (capability irmã `remissao-externa`); exige seleção de texto não-vazia como pré-requisito.
- Popup de ações (Ir / Editar / Excluir) ao posicionar o cursor sobre o link, substituindo o antigo botão de toolbar de remoção em lote — comportamento cursor-based, sem navegação direta ao clicar no link.
- Remoção de remissão (individual ou por seleção contendo múltiplos links) preservando o texto original como texto simples.
- Atualização automática do texto do link em qualquer ação estrutural (adicionar, remover, agrupar, transformar tipo, TAB/SHIFT_TAB, undo/redo), resolvendo o alvo pela identidade estável (uuid) em vez de diff textual entre lexmlId antigo/novo — com três estilos de recálculo (qualificada: sempre recalcula a cadeia inteira; enxuta: só muda se a posição no pai imediato mudar; contextual: só o segmento antes do sufixo literal muda).
- Preservação de texto editado manualmente (heurística de reconhecimento + comparação de igualdade contra o último texto gravado), com sinalização de revisão quando não é seguro atualizar sozinho.
- Invalidação visual (vermelho/tachado) e mensagem de erro ao excluir o dispositivo de destino; restauração automática ao desfazer a exclusão.
- Persistência: serialização como `<Remissao href="lexmlId">` no LexML salvo, reconstrução integral do registro ao reabrir (varrendo o texto, sem depender de estado de sessão anterior), e preservação de texto fixo (`textoFixo`) de remissões manuais através do ciclo salvar/abrir.
- Criação automática restrita ao momento em que o usuário sai do dispositivo em edição (troca de linha no editor ou foco saindo do editor inteiro) — nunca a cada pausa de digitação — com flush determinístico force antes de serializar o documento (garante que o botão Salvar nunca perca uma remissão pendente).

Esta change não propõe trabalho futuro: descreve, com requisitos e cenários, o comportamento já implementado e coberto por testes automatizados (unitários e Cypress E2E).

## Capabilities

### New Capabilities
- `remissao-interna`: detecção, criação (automática e manual), remoção, atualização por renumeração, invalidação/restauração e persistência de referências cruzadas entre dispositivos do mesmo documento legislativo.

### Modified Capabilities
(nenhuma — `remissao-externa` continua com os mesmos requisitos; esta capability apenas compartilha o diálogo de criação e o mecanismo de popup com ela, sem alterar seu contrato.)

## Impact

- **Código principal**: [adicionaRemissaoInterna.ts](../../../src/redux/elemento/reducer/adicionaRemissaoInterna.ts) (4 passagens de detecção), [sincronizarRemissoes.ts](../../../src/model/remissao/sincronizarRemissoes.ts) (recálculo por uuid), [lexmlIdUtil.ts](../../../src/model/remissao/lexmlIdUtil.ts) (texto canônico/contextual/enxuto), [moduloRemissao.ts](../../../src/components/editor/moduloRemissao.ts) (módulo Quill: renderização, remoção em tempo real), [eta-blot-remissao-interna.ts](../../../src/util/eta-quill/eta-blot-remissao-interna.ts) (blot), [remissaoInternaDialog.ts](../../../src/components/editor/remissaoInternaDialog.ts) e [remissaoDialog.ts](../../../src/components/editor/remissaoDialog.ts) (diálogo), [popupInline.ts](../../../src/components/popup-inline/popupInline.ts) (popup compartilhado), [editor.component.ts](../../../src/components/editor/editor.component.ts) (gatilhos de blur, flush, handlers de popup/toolbar), [inicializaRemissoesAoAbrir.ts](../../../src/redux/elemento/reducer/inicializaRemissoesAoAbrir.ts) (bootstrap ao abrir), [removeElemento.ts](../../../src/redux/elemento/reducer/removeElemento.ts) (invalidação).
- **Sem impacto** em `remissao-externa` (capability irmã, compartilha diálogo/popup mas mantém contrato próprio), `paginacao-articulacao`, ou nos fluxos de salvar/abrir documento articulado além de consumir o registro de remissões já pronto na serialização/deserialização da articulação.
- **Documentação**: `docs/referencia/REMISSAO_INTERNA.md` e `docs/guias/REMISSAO_INTERNA_GUIA_TESTES.md` (não versionados no git) continuam como referência técnica/QA detalhada; esta change consolida o contrato observável em `specs/remissao-interna/spec.md`.
- **Testes**: suíte unitária (`test/model/remissao/`, `test/redux/elemento/reducer/`, `test/components/editor/`) e Cypress (`cypress/e2e/remissao-interna/`, grupos A–J).
