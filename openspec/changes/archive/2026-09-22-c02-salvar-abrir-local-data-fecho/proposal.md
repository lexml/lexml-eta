## Why

O local e a data do fecho não são gravados no `documento-articulado.json`: ao reabrir o arquivo, a data escolhida pelo usuário se perde, e o documento LexML salvo não traz a representação textual `LocalDataFecho` prevista pelo padrão. É o tíquete 3 do roteiro de `docs/extensao-formato-lexml/issues.md` (issue #989), especificado em `docs/extensao-formato-lexml/03-fecho-local-e-data.md` e na fixture `scripts/fixtures-lexedit/03-fecho-local-e-data.xml`. Segue o padrão por grupo de metadados do LexEdit fixado pela change `2026-09-22-c01-salvar-abrir-opcoes-impressao`.

## What Changes

- Ao salvar, o documento passa a conter os atributos `local` e `data` de `lexedit:Metadado`. A `data` é omitida quando o usuário escolhe "Não informar", porque o tipo `xsd:date` não aceita texto vazio.
- Ao salvar, o documento passa a conter `ParteFinal/LocalDataFecho` com o texto do fecho: `<local>, <dia> de <mês> de <ano>.` quando há data, ou `<local>,` quando não há. O dia 1 é escrito `1º` e os demais sem zero à esquerda.
- Ao abrir, a data lida é aplicada ao campo "Data". Data ausente, vazia ou inválida corresponde a "Não informar".
- Ao abrir, o local lido é preservado e regravado ao salvar enquanto o destino não for alterado pelo usuário. Se o destino mudar, o local volta a ser derivado dele, como hoje.
- No modo anexo de parecer, local, data e `ParteFinal` não são gravados.
- O teste de integração com o CLI real passa a cobrir a ida e volta de `ParteFinal`, que é LexML e é transportado pelo conversor atual.

## Capabilities

### New Capabilities

(nenhuma)

### Modified Capabilities

- `salvar-documento-articulado`: passa a serializar local e data do fecho, estruturados e em texto.
- `abrir-documento-articulado`: passa a recuperar a data do fecho e preservar o local lido.

## Impact

- Código: `src/model/lexml/documento/documentoArticulado.ts`, `conversor/buildJsonixFromProjetoNorma.ts`, `conversor/buildProjetoNormaFromJsonix.ts`, `src/components/lexml-eta.component.ts` e um formatador de data por extenso para o fecho.
- API: `DadosLexEdit` ganha `local` e `data`; `criarDocumentoArticulado` não muda de assinatura.
- Testes: unitários, de componente, `test/integracao/documentoArticulado.integration.ts` e um novo spec Cypress de abertura com fixtures em `demo/doc/`.
- Fora do escopo: salvar o destino (`colegiadoApreciador`), sem especificação nem issue no roteiro; alinhar a grafia do local ("Sala das sessões" no código × "Sala das Sessões" na especificação); atualizar `ParteFinal`/`MetadadoProprietario` no caminho legado `getProjetoAtualizado()`; migrar o formato `lexedit` para o novo executável `jsonix-lexml`.
