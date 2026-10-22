# TODO

## Pendente fora deste repositório

- **#994 (revisões `ins`/`del`) na justificação:** ao implementar, retirar a exceção temporária restante (spec `salvar-documento-articulado`, requisito "Revisões de texto na justificação gravada", e a exceção do requisito de ida e volta de `metadados-lexedit`) e o `querySelectorAll('del')` de `montaJustificacao`. Corrigir também o nome do cenário "Exceção temporária com nota de rodapé ou revisão de texto" (o MODIFIED da #993 não pôde renomeá-lo; design D5 da change `2026-10-19-c02-salvar-abrir-notas-rodape`). A #993 já não tem exceção.
- **Issue a abrir — largura de tabela e coluna no plugin de tabelas:** `TableCellBlot`/`TableBlot` não guardam `width`/`style`, e `setContent` os descarta (também no caminho do host). Ao corrigir, retirar a exceção de largura das specs `abrir-documento-articulado` e `metadados-lexedit`.

- **Coordenação com o `lexeditweb-editor` (#1011):** o `onchange` de `lexml-eta` também é emitido por edições na justificação (1s após a última alteração), com `detail.origemEvento = 'justificativa'`. Antes, editar só a justificação não emitia nada. Avisar quem mantém o `lexeditweb-editor` antes de publicar a versão.

## Concluído

### #1011 — Alerta de justificação inexistente (08/10/2026)

Commit `a8375964`. Change arquivada em `openspec/changes/archive/2026-10-08-c01-alerta-justificacao-inexistente/`; nova spec `openspec/specs/pendencias-proposicao/` (título no formato do sync, `# pendencias-proposicao Specification`, diferente dos títulos em português das demais — renomear se o usuário pedir).

Para a #992: a condição da pendência já está centralizada em `isJustificacaoNaoInformada(justificativa)` (`lexml-eta.component.ts`), a mesma do alerta. A gravação em `lexedit:Pendencias` pode crescer na capability `pendencias-proposicao`.

## Em andamento

### #992 — Salvar pendência de justificação no jsonix (retomado em 08/10/2026)

Branch: `feat/992-salvar-pendencias-jsonix`. Change OpenSpec `2026-10-08-c02-salvar-pendencia-justificacao`: 11/11 tasks implementadas, `npm test` e Cypress (documento-articulado, abertura-remissao-invalida) passando. Integração com o CLI 2.0.0 (`C:/jsonix-lexml-win/desenv/jsonix-lexml-win.exe`) passando, 11/11. Commitada (`eae8d71d`) e arquivada em 19/10/2026, com os deltas sincronizados em `salvar-documento-articulado` e `metadados-lexedit` (sync + arquivo ainda não commitados).

Decisões: `DadosLexEdit.pendencias?: string[]` montada pelo componente (ordem: editor, depois remissões); texto único `MENSAGEM_JUSTIFICACAO_NAO_INFORMADA`; pendências não lidas ao abrir; limitação da ida e volta aceita até a #991, com `MODIFIED` explícito em `metadados-lexedit`.


## Próximo

### #993 — Salvar e abrir notas de rodapé (análise em 19/10/2026)

Especificação `07-notas-de-rodape.md`. Change `2026-10-19-c02-salvar-abrir-notas-rodape` proposta (proposal, specs de salvar, abrir e metadados-lexedit, design D1–D6, tasks em 5 grupos), `openspec validate --strict` ok. Em implementação: grupos 1 (salvar), 2 (abrir) e 3 (componente, aba "Notas") concluídos, 6/11 tasks; `ResizeObserver` intermitente voltou uma vez no teste de anexo de parecer (registrado na design). Grupos 4 (CLI real + XSD, 12/12) e 5 concluídos: 11/11 tasks. Fixture `demo/doc/teste_nota_rodape.json` gerado pelo caminho real e válido no XSD; spec `abertura-nota-rodape.cy.ts` 3/3; specs relacionados 19/19; `npm test` passando. Commitada (`8df7f73e`) em 20/10/2026. Merge de `develop` (252 commits: autoria, colegiado, revisões, CLI 2.1.0, #1016 sem `justificacaoObrigatoria`, #1022 fecho no anexo) resolvido em 20/10/2026, à espera do commit do usuário; delta de `metadados-lexedit` ajustado para 2.1.0. Arquivada em 20/10/2026, com os deltas sincronizados em `abrir-documento-articulado`, `salvar-documento-articulado` e `metadados-lexedit` (sync + arquivo ainda não commitados). Confirmado com o CLI 2.0.0 e o `lexedit.xsd`: `NotaDeRodape` é `genInline`, válido em `p`, `li` e `span` de célula; `tojson` devolve `{name: NotaDeRodape, value: GenInline com content}`. Editor: `<lexml-eta-nota-rodape id-lexml-eta-nota-rodape numero texto="HTML codificado">N</…>`, texto vindo do Quill do modal (b/i/u/link, pode ter vários `<p>`); aba "Notas" lê `_lexmlJustificativa.notasRodape`.

Proposta: salvar nota como `NotaDeRodape` inline (sem id e número); abrir gerando id novo e número pela ordem, passando a lista para `setContent` e atualizando a aba "Notas"; exceção da #991 fica só para `ins`/`del` (#994).

Decisão do usuário (19/10/2026): nota com vários parágrafos é gravada num só, unidos por espaço (segue o "segundo momento" da 07; a quebra se perde ao reabrir).

### #991 — Salvar e abrir a justificação (change proposta em 19/10/2026)

Change `2026-10-19-c01-salvar-abrir-justificacao`: proposal, specs (salvar, abrir, metadados-lexedit), design (D1–D8) e tasks (5 grupos) prontos, `openspec validate --strict` ok. Em implementação: grupos 1 (salvar), 2 (abrir) e 3 (componente, teste da #992 invertido) concluídos em 19/10/2026, 7/12 tasks, `npm test` passando; ida e volta com o Quill real ok sem ajuste no conversor; falha intermitente de `ResizeObserver` vista uma vez no teste de anexo de parecer (registrada no design). Grupo 4 (CLI real + XSD) concluído: 12/12 na integração, 8/12 tasks. Grupo 5 concluído em 19/10/2026: 12/12 tasks. Fixture `demo/doc/teste_justificacao.json` gerado pelo `getDocumentoArticulado()` real e válido no XSD; spec Cypress `abertura-justificacao.cy.ts` (3/3); specs relacionados 16/16; `npm test` completo e integração (12/12) passando. Decisão do usuário (opção A): largura de tabela e coluna é gravada, mas não volta ao editor (o plugin de tabelas não a guarda); exceção nas specs de abrir e ida e volta. Corrigidos no caminho: a largura da tabela vem em `style` (o conversor a descartava) e o teste de componente da ida e volta usava `ql-align-*` (sem efeito no `setContent`). Commitada (`5f3e85b6`) e arquivada em 19/10/2026, com os deltas sincronizados em `abrir-documento-articulado`, `salvar-documento-articulado` e `metadados-lexedit` (sync + arquivo ainda não commitados). Achados extras: imagem do Quill é bloco (`BlockEmbed`) e no LexML `img` é inline, então vai dentro de `p`; `setContent` não reconverte `indent-N` para `ql-indent-N` (resolvido no leitor); o OpenSpec não deixa MODIFIED retirar cenário, por isso o requisito de ida e volta foi trocado por REMOVED + ADDED. Ao implementar, retirar a exceção temporária da #992 em `metadados-lexedit` e inverter o teste de componente "Inverter na #991".

Achados confirmados com `lexedit.xsd` e o CLI 2.0.0: `tojson` devolve `justificacao[0].partePrincipal.agrupamentoHierarquicoOrDivOrAgrupamento` com blocos `{name, value: GenInline}`. O XSD rejeita `<p>` dentro de `td`, `td@width` e `table@width="100%"`. O Quill grava a largura como atributo `width="N%"` em `td`/`table` (`TableTrick.js:387`, `editor-texto-rico.component.ts:452`), ao contrário do que diz a especificação 06.

Decisões do usuário (19/10/2026):
- `p` dentro de célula vira `span class="p …"` ao salvar e volta a `p` ao abrir.
- Largura: atributo `width` do Quill ↔ `style="width: …"` no LexML; corrigir a especificação 06.
- Notas de rodapé (#993) e revisões `ins`/`del` (#994): exceção temporária explícita na spec (nota retirada, `ins` mantém o texto, `del` descartado).
- Imagens: investigar na design o que o Quill gera e incluir se couber no XSD; senão, registrar a limitação.
- Demais ajustes: `strong`/`em` → `b`/`i`, `href` ↔ `xlink:href` sem `rel`, sem `tbody`/`br`/`table_id`/`row_id`/`cell_id`/`td[merge_id]`, `id="_tabela<n>"`, classes mantidas, anexo de parecer não grava `Justificacao`.