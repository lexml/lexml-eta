## Why

A funcionalidade de paginação de articulação (divisão de documentos legislativos grandes em múltiplas páginas virtuais) já foi implementada e entregue — núcleo em 06-07/06/2024 (branch `feat/paginacao`), com correções e evoluções posteriores (caso de emenda onde couber em 27/06/2024, número do artigo final na combo em 07/02/2025, migração de testes e uma otimização de busca em 26/08–06/09/2026) — fora da metodologia OpenSpec. `openspec/specs/paginacao-articulacao/spec.md` já existe (commit `59aaccc5`/`8c400c28`), mas nunca passou pelo ciclo `changes/` → `changes/archive/` correspondente. Esta change traz essa entrega para a metodologia, documentando o comportamento já implementado e testado, antes que o conhecimento fique preservado apenas em `docs/referencia/PAGINACAO.md`, não versionado no repositório principal.

## What Changes

- Divisão automática da articulação em páginas por um limite configurável de dispositivos (padrão 1250, contando toda a hierarquia — artigo, caput, parágrafos, incisos, alíneas, itens), calculada no carregamento do documento.
- Configuração por ranges explícitos de artigos, que sobrepõe o limite automático quando fornecida.
- Quebra sempre em fronteira de artigo — o cálculo automático nunca separa um artigo de seus próprios filhos; agrupadores (Livro/Título/Capítulo/Seção) entre o último artigo de uma página e o primeiro da seguinte são preservados na página seguinte.
- Localização de um dispositivo em sua página por identidade estável (uuid), não pelo identificador textual (que muda ao renumerar).
- Navegação entre páginas recarrega o conteúdo do editor com os dispositivos da página selecionada — não é scroll.
- Atualização incremental da paginação após ações estruturais (adicionar, remover, mover dispositivo), sem recalcular todas as páginas do zero; movimentação entre páginas leva o usuário automaticamente à nova página quando a seleção muda de página.
- Inclusão de dispositivos marcados como excluídos em modo de revisão, mantendo-os navegáveis dentro da paginação mesmo fora da articulação ativa.
- Caso de documento vazio (emenda "onde couber"): página única sem dispositivos e sem seletor, que passa a receber conteúdo conforme adicionado.

Esta change não propõe trabalho futuro: descreve, com requisitos e cenários, o comportamento já implementado e coberto por testes automatizados (unitários e Cypress E2E).

## Capabilities

### New Capabilities
- `paginacao-articulacao`: divisão de documentos legislativos grandes em múltiplas páginas virtuais, cálculo automático ou por ranges explícitos, atualização incremental e navegação, com suporte a modo de revisão e ao caso de documento vazio.

### Modified Capabilities
(nenhuma — `remissao-interna`, `remissao-externa`, `salvar-documento-articulado` e `abrir-documento-articulado` continuam com os mesmos requisitos; a paginação opera sobre a árvore já construída por eles, sem alterar seus contratos.)

## Impact

- **Código principal**: [paginacao.ts](../../../src/model/paginacao/paginacao.ts) (interfaces `ConfiguracaoPaginacao`, `PaginaArticulacao`, `RangeArtigos`), [paginacaoUtil.ts](../../../src/redux/elemento/util/paginacaoUtil.ts) (lógica core: `configurarPaginacao`, `paginarArticulacao`, `paginarArticulacaoByNumerosArtigos`, `findPaginaByIdDispositivo`/`findPaginaByUuidDispositivo`), [loadArticulacao.ts](../../../src/redux/elemento/reducer/loadArticulacao.ts) (inicialização), [selecionaPaginaArticulacao.ts](../../../src/redux/elemento/reducer/selecionaPaginaArticulacao.ts) (navegação), [atualizaPaginacao.ts](../../../src/redux/elemento/reducer/atualizaPaginacao.ts) (atualização incremental), [selecionarPaginaArticulacaoAction.ts](../../../src/model/lexml/acao/selecionarPaginaArticulacaoAction.ts), [editor.component.ts](../../../src/components/editor/editor.component.ts) (seletor de página, handlers de navegação).
- **Sem impacto** em `remissao-interna`/`remissao-externa` (operam sobre dispositivos independentemente de qual página os contém) ou nos fluxos de salvar/abrir documento articulado (serializam/deserializam a articulação completa, não por página).
- **Documentação**: `docs/referencia/PAGINACAO.md` (não versionado no git) continua como referência técnica detalhada (arquitetura, fluxos de dados com diagramas, 9 casos de borda documentados); esta change consolida o contrato observável em `specs/paginacao-articulacao/spec.md`.
- **Testes**: suíte unitária (`test/redux/elemento/util/paginacaoUtil.test.ts`, `test/redux/elemento/reducer/`) e Cypress (`paginacao-plp-68.cy.ts` e demais specs de paginação).
