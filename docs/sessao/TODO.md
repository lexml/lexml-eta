# TODO

Atualizado em 03/11/2026. Branch `feat/1034-correcao-datas` (a partir da `develop` em `c5fc7e52`).

## Em andamento

- **#1034 — correção de datas** (OpenSpec `2026-11-04-c01-corrigir-datas-proposicao`): implementada em 04/11/2026 (10/10 tasks; `npm test` completo e Cypress `documento-articulado/*` 66/67, com a falha conhecida do `abertura-pena`). Falta commitar e arquivar. Decisões do usuário: `Proposicao.data` guarda a data do campo "Data" e nasce vazia; `Proposicao.dataUltimaModificacao` passa a ser o instante da obtenção (`xsd:dateTime` com fuso). BREAKING para o `lexeditweb-editor`.

## Próximas

- **Cypress que já falha na `develop`:**
  - `abertura-pena.cy.ts` e `pena/pena.cy.ts`: o seletor `sl-dialog` casa também com o diálogo de anexos, e a `develop` só corrigiu isso no teste unitário (`0c5e12de`);
- **CLI `jsonix-lexml` 2.3.0:** instalar para os 2 cenários de `OutrosMetadados` da integração passarem. Só o 2.1.0 está em `C:/jsonix-lexml-win/desenv`.
- **Coordenação com o `lexeditweb-editor` antes de publicar a versão:**
  - `onchange` também emitido por edições na justificação, com `detail.origemEvento = 'justificativa'` (#1011);
  - marcas de revisão com `id-usuario` e `sigla-usuario` (#994);
  - propriedade nova somente leitura `dataUltimaModificacaoDocumento` (#997).
- **Issue a abrir: largura de tabela e coluna no plugin de tabelas.** Ao corrigir, retirar a exceção de largura das specs `abrir-documento-articulado` e `metadados-lexedit`.
- **Documentação vinda da `develop`:**
  - letras de invariantes repetidas ((ai)–(am)) nos itens 17–19 do `CLAUDE.md`;
  - `substitutivo` ainda listado na seção 4.2 de `docs/api-componente-lexml-eta.md`.
- **Arquivos de sessão:** decidir se `docs/sessao/` volta a ser ignorado nesta branch. O merge da `develop` o versionou de novo.

## Concluídas

- **#1030:** nota de rodapé com um só parágrafo (`7164e20e`, arquivada em `366d826d` com a spec nova `nota-rodape`, 29/10/2026). Enter e Shift+Enter ignorados com aviso; nota antiga abre unida; colar troca quebras por espaço.
- **#997:** data da última modificação no `lexedit:Metadado` (`93fbd504`, `0546f8cb`, arquivada em `a49a8bb8`, 29/10/2026).
- **Branch `feat/992-salvar-pendencias-jsonix` integrada à `develop`** (`c5fc7e52`, 03/11/2026).
- **Merge da `develop` (03/11/2026):** 15 commits, com a #1050 (componente de nova proposição, sem formulário de destino; o colegiado vem de `novaProposicao` ou do arquivo e é gravado também no anexo de parecer).
- **Merge da `develop`:** 170 commits, resolvido em `725bbb41`, 29/10/2026.
- **#994:** revisões de texto da justificação, com a correção do contador de revisões do texto rico (`17210119`..`29a2bdb4`, 27/10/2026).
- **#993:** notas de rodapé (`8df7f73e`).
- **#991:** justificação (`5f3e85b6`, `54167faf`).
- **#992 e #1011:** pendência e alerta de justificação (`a8375964`, `eae8d71d`).
- **#1026** (vocabulário de URN por autoridade): concluída e arquivada na `develop` (`f94cfd77`); chegou aqui pelo merge.
