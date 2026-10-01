## Why

As opções de impressão escolhidas pelo usuário (brasão, texto do cabeçalho, tamanho da letra, espaço entre linhas) se perdem ao salvar e reabrir o `documento-articulado.json`: o arquivo não as registra e, ao abrir, o formulário volta sempre aos valores padrão. É o tíquete 2 do roteiro de `docs/extensao-formato-lexml/issues.md` (issue #988), especificado em `docs/extensao-formato-lexml/02-opcoes-de-impressao.md` e na fixture `scripts/fixtures-lexedit/02-opcoes-de-impressao.xml`.

É também o primeiro grupo de metadados do LexEdit que vem de um formulário do editor (e não da articulação, como as remissões internas inválidas). Por isso, esta change fixa o padrão de salvar e abrir que os próximos grupos (fecho, autoria, anexos...) vão seguir, sabendo que o formato do contrato será revisto quando o novo executável `jsonix-lexml` estiver pronto.

## What Changes

- Ao salvar, o documento passa a conter o grupo `opcoesImpressao` em `MetadadoProprietario`/`lexedit`, sempre com os quatro atributos (`imprimirBrasao`, `textoCabecalho`, `reduzirEspacoEntreLinhas`, `tamanhoFonte`). Com isso, todo documento salvo pelo editor passa a ter `MetadadoProprietario`.
- Ao abrir, as opções lidas do arquivo são aplicadas ao formulário de opções de impressão. Atributo ausente ou inválido assume o padrão da classe `OpcoesImpressao`. Arquivo sem o grupo mantém o comportamento atual.
- A montagem e a leitura de `lexedit` passam a ser compostas por grupo (um montador e um leitor por grupo, reunidos num único ponto), sem mudar o formato já gravado pelas remissões internas inválidas.
- O `OpcoesImpressaoComponent` e o `lexml-eta.component.ts` deixam de usar o `OpcoesImpressao` legado de `model/emenda/emenda.ts` e passam a usar o de `model/proposicao/proposicao.ts`.
- A suíte de integração com o CLI real deixa de comparar o conteúdo de `lexedit` na ida e volta, porque o CLI atual o descarta. Ganha um cenário dedicado para as opções de impressão (`toxml` + XSD).

## Capabilities

### New Capabilities

(nenhuma)

### Modified Capabilities

- `salvar-documento-articulado`: passa a serializar as opções de impressão do documento em edição.
- `abrir-documento-articulado`: passa a recuperar as opções de impressão, com padrão por atributo quando ausente ou inválido.
- `metadados-lexedit`: o cenário de emissão condicional passa a refletir que todo documento salvo pelo editor tem ao menos o grupo de opções de impressão.

## Impact

- Código: `src/model/lexml/documento/documentoArticulado.ts`, `conversor/buildJsonixFromProjetoNorma.ts`, `conversor/buildProjetoNormaFromJsonix.ts`, `src/components/lexml-eta.component.ts`, `src/components/lexml-eta-proposicao.component.ts`, `src/components/opcoesImpressao/opcoesImpressao.component.ts`.
- API pública: `criarDocumentoArticulado` ganha um parâmetro opcional com os dados de metadados do LexEdit. Quem não informar continua recebendo o mesmo documento de hoje.
- Testes: unitários de montar/ler, `test/integracao/documentoArticulado.integration.ts` e um novo spec Cypress de abertura com fixture em `demo/doc/`.
- Fora do escopo: migrar o formato `lexedit` para o que o novo executável `jsonix-lexml` vier a gerar, e ajustar esse executável (repositório irmão).
