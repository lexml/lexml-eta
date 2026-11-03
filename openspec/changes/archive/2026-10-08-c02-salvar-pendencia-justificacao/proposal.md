## Why

O arquivo salvo registra em `lexedit:Pendencias` as condições que impedem o protocolamento da proposição, mas hoje só grava a de remissões internas inválidas. A falta de justificação já é sinalizada na aba Avisos e já entra na lista de pendências de preenchimento (change `2026-10-08-c01-alerta-justificacao-inexistente`), mas não chega ao arquivo. É o tíquete 6 do roteiro de `docs/extensao-formato-lexml/issues.md` (issue #992), especificado em `docs/extensao-formato-lexml/13-outros-metadados-do-lexedit.md`.

## What Changes

- Ao salvar, quando a justificação é obrigatória e não tem texto, o documento passa a conter, em `lexedit:Pendencias`, a pendência "Não foi informado um texto de justificação.". A condição é a mesma do alerta da aba Avisos. No modo anexo de parecer, ou com a obrigatoriedade desligada, a pendência não é gravada.
- Os dados de metadados do LexEdit que o componente raiz passa ao salvar (`DadosLexEdit`) ganham uma lista de pendências calculadas pelo editor. O montador de `lexedit` junta essa lista com a pendência de remissões internas inválidas, que continua calculada por ele. A ordem fica: primeiro as pendências do editor, depois a de remissões.
- O texto da pendência de justificação passa a existir num único ponto, usado pelo alerta, pela pendência de preenchimento e pelo salvar.
- Ao abrir, as pendências continuam sem ser lidas: são recalculadas a partir do documento em edição.
- **Limitação temporária, até a #991:** a justificação ainda não é gravada no arquivo. Um documento salvo com justificação preenchida sai sem a pendência, abre com a justificação vazia e, salvo de novo, passa a ter a pendência. O requisito de ida e volta dos metadados do LexEdit ganha uma exceção explícita para esse caso, a ser retirada pela #991, que é a próxima a ser implementada.

## Capabilities

### New Capabilities

(nenhuma)

### Modified Capabilities

- `salvar-documento-articulado`: passa a gravar a pendência de justificação não informada, ao lado da pendência de remissões internas inválidas, na ordem definida.
- `metadados-lexedit`: o requisito de ida e volta pelo conversor ganha a exceção temporária para documento com justificação preenchida.

## Impact

- Código: `src/model/lexml/documento/documentoArticulado.ts` (`DadosLexEdit.pendencias`), `src/model/lexml/documento/conversor/buildJsonixFromProjetoNorma.ts` (`montaMetadadoLexEdit`) e `src/components/lexml-eta.component.ts` (`getDocumentoArticulado`, constante do texto).
- API pública: `criarDocumentoArticulado` aceita `pendencias` no parâmetro opcional de dados. Quem não informar recebe o mesmo documento de hoje.
- Comportamento: todo documento salvo pelo editor com a justificação obrigatória e vazia passa a ter `Pendencias` em `lexedit:Metadado`. Até a #991, isso inclui todo documento aberto de arquivo e salvo sem que o usuário digite uma justificação.
- Testes: unitários do montador e do componente. Testes de componente que comparam os metadados salvos por igualdade passam a incluir a pendência. Integração com o CLI real (`npm run test:documento-articulado:xml`) e E2E.
- Fora do escopo: gravar e abrir a justificação (#991) e as demais pendências (revisão de texto #994, revisão da hierarquia #996, comentários).
