## Why

A justificação ainda não é gravada no arquivo `documento-articulado.json`: ao salvar, o texto se perde, e ao abrir, uma `Justificacao` existente é ignorada. Isso também mantém a exceção temporária aberta pela #992, em que um documento com justificação preenchida, reaberto e salvo de novo, ganha a pendência "Não foi informado um texto de justificação.". É o tíquete 5 do roteiro de `docs/extensao-formato-lexml/issues.md` (issue #991), especificado em `docs/extensao-formato-lexml/06-justificacao-e-conteudo-rico.md`.

## What Changes

- Ao salvar, a justificação passa a ser gravada em `ProjetoNorma/Justificacao/PartePrincipal`, no subconjunto HTML do LexML. Justificação vazia e o modo anexo de parecer não gravam `Justificacao`.
- O conteúdo rico do Quill é adaptado ao esquema LexML ao salvar, e o caminho inverso é feito ao abrir:
  - `strong`/`em` viram `b`/`i`; `href` vira `xlink:href`, sem `rel`;
  - `tbody`, `br`, os atributos de controle do plugin de tabelas (`table_id`, `row_id`, `cell_id`) e as células ocultas de mesclagem saem; cada tabela recebe `id` `_tabela<sequencial>`, que não é lido ao abrir;
  - cada parágrafo dentro de célula de tabela vira `span` com a classe `p` (o LexML só aceita conteúdo inline em `td`/`th`) e volta a ser parágrafo ao abrir;
  - a largura de tabela, coluna e imagem vai para `style="width: …"` (o LexML não aceita `width` em `td` nem largura percentual em `table`/`img`), e volta como o editor a grava ao abrir; a de tabela e coluna não volta ao editor, porque o plugin de tabelas não a guarda (exceção registrada nas specs, a resolver numa issue do plugin);
  - a imagem, que no Quill é um bloco, é gravada dentro de um parágrafo, porque no LexML `img` é inline.
- Ao abrir, a justificação do arquivo é carregada no editor, e o alerta e a pendência de justificação passam a refletir o texto aberto.
- **Exceção temporária, até a #993 e a #994:** notas de rodapé e marcas de revisão de texto ainda não são gravadas. Ao salvar, a nota de rodapé é retirada, o texto incluído em revisão (`ins`) fica sem a marca e o texto excluído em revisão (`del`) é descartado. O requisito de ida e volta registra essa exceção.
- Retira a exceção temporária da #992 no requisito de ida e volta dos metadados do LexEdit: com a justificação preenchida, salvar o documento reaberto gera arquivo igual ao original.
- A especificação `06-justificacao-e-conteudo-rico.md` é corrigida: o exemplo `<td width='40%'>` não valida no esquema LexML, e a conversão de largura acontece no sentido inverso ao descrito.

## Capabilities

### New Capabilities

(nenhuma)

### Modified Capabilities

- `salvar-documento-articulado`: passa a gravar a justificação, com as adaptações do conteúdo rico ao LexML e a exceção temporária de notas de rodapé e revisões.
- `abrir-documento-articulado`: passa a carregar a justificação do arquivo no editor.
- `metadados-lexedit`: o requisito "Ida e volta dos metadados do LexEdit pelo conversor" é substituído por "Ida e volta do documento salvo pelo conversor", sem a exceção da #992, cobrindo também a justificação, com a exceção temporária de notas de rodapé e revisões. A troca é por remoção e inclusão porque o OpenSpec não permite retirar um cenário com MODIFIED.

## Impact

- Código: novo conversor de justificação em `src/model/lexml/documento/conversor/` (HTML do editor para Jsonix e de volta), `DadosLexEdit` e `montaProjetoNorma` (`documentoArticulado.ts`, `buildJsonixFromProjetoNorma.ts`) e `src/components/lexml-eta.component.ts` (`getDocumentoArticulado`, `abrirDocumentoArticulado`).
- API pública: `criarDocumentoArticulado` aceita a justificação no parâmetro opcional de dados. Quem não informar recebe o mesmo documento de hoje.
- Comportamento: arquivos salvos passam a conter `Justificacao`. Arquivos antigos, sem `Justificacao`, abrem com a justificação vazia, como hoje.
- Testes: unitários do conversor, de componente (inclusive a inversão do teste "Inverter na #991"), integração com o CLI real e o XSD (`npm run test:documento-articulado:xml`) e E2E.
- Documentação: `docs/extensao-formato-lexml/06-justificacao-e-conteudo-rico.md`, `plano-xsd-lexedit.md` e `CLAUDE.md`.
- Fora do escopo: notas de rodapé (#993), revisões de texto e o estado "antes da revisão" (#994), comentários em trechos da justificação e anexos.
