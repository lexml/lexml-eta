# TODO

Atualizado em 29/10/2026. Branch `feat/992-salvar-pendencias-jsonix`.

## Em andamento

- Nada em andamento. Todas as changes da branch estão implementadas e arquivadas; `a49a8bb8` (arquivamento da #997) ainda sem push.

## Próximas

- **Cypress que já falha na `develop`:**
  - `abertura-pena.cy.ts` e `pena/pena.cy.ts`: o seletor `sl-dialog` casa também com o diálogo de anexos, e a `develop` só corrigiu isso no teste unitário (`0c5e12de`);
  - `anexo-parecer-data-fecho.cy.ts`: o checkbox do demo só vale para nova proposição, e o fixture não tem `anexoParecer`.
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

- **#997:** data da última modificação no `lexedit:Metadado` (`93fbd504`, arquivada em `a49a8bb8`, 29/10/2026).
- **Merge da `develop`:** 170 commits, resolvido em `725bbb41`, 29/10/2026.
- **#994:** revisões de texto da justificação, com a correção do contador de revisões do texto rico (`17210119`..`29a2bdb4`, 27/10/2026).
- **#993:** notas de rodapé (`8df7f73e`).
- **#991:** justificação (`5f3e85b6`, `54167faf`).
- **#992 e #1011:** pendência e alerta de justificação (`a8375964`, `eae8d71d`).
- **#1026** (vocabulário de URN por autoridade): concluída e arquivada na `develop` (`f94cfd77`); chegou aqui pelo merge.
