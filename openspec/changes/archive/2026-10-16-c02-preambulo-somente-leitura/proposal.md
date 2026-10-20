## Why

A issue [#999](https://github.com/lexml/lexml-eta/issues/999) pede que o preâmbulo da proposição apareça, somente leitura, entre a ementa e a articulação. Hoje o preâmbulo existe só como uma string que atravessa a abertura e o salvamento do documento, mas não é exibido no editor. Proposições novas também nascem sem o texto padrão do preâmbulo (por exemplo, "O CONGRESSO NACIONAL decreta:"), que depende do tipo da proposição.

## What Changes

- O preâmbulo passa a ser um dispositivo do tipo novo `Preambulo`, carregado do mesmo modo que a ementa e exibido entre a ementa e a articulação.
- O preâmbulo nasce bloqueado: não é editável e não oferece nenhuma ação (adicionar, remover, transformar, mover, renumerar).
- Quando o preâmbulo está vazio (proposição nova ou arquivo aberto) e o tipo da proposição tem texto padrão, o texto padrão é aplicado. Os textos ficam centralizados no `VOCABULARIO`, indexados pelo tipo da URN (sem o `;sigla`), com a autoridade como critério adicional quando o mesmo tipo tem textos diferentes.
- Preâmbulo vazio sem texto padrão é um cenário válido: nenhum dispositivo é criado e nenhuma linha é exibida.
- Normas exibem o preâmbulo que já tiverem, sem texto padrão.
- As operações que hoje tratam a ementa como "linha anterior ao primeiro artigo ou agrupador" passam a considerar o preâmbulo quando ele existe, para que novas linhas continuem sendo inseridas depois dele.
- Fora do escopo: edição do preâmbulo, detecção de remissões no texto do preâmbulo, e concordância nominal do texto padrão da MPV (registrada como pendência no `design.md`).

## Capabilities

### New Capabilities

- `preambulo-proposicao`: exibição somente leitura do preâmbulo como dispositivo entre a ementa e a articulação, e aplicação do texto padrão por tipo de proposição.

### Modified Capabilities

Nenhuma. O comportamento de ida e volta do preâmbulo com vários parágrafos, já especificado em `abrir-documento-articulado` e `salvar-documento-articulado`, é preservado sem alteração.

## Impact

- Modelo: `src/model/documento/index.ts` (`ParteInicial.preambulo`), `src/model/lexml/tipo/tipoDispositivo.ts`, `src/model/dispositivo/tipo.ts`, `src/model/lexml/dispositivo/dispositivoLexmlFactory.ts`, novo `src/model/lexml/regras/regrasPreambulo.ts`.
- Carga e serialização: `src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix.ts`, `src/model/lexml/documento/vocabulario.ts`, `src/model/lexml/documento/urnUtil.ts`. A serialização em `buildJsonixFromProjetoNorma.ts` já aceita um objeto com `texto`.
- Estado e reducers que referenciam a ementa: `elementoUtil.ts`, `hierarquiaUtil.ts`, `reducerUtil.ts`, `agrupaElemento.ts`, `removeElemento.ts`, `undoRedoReducerUtil.ts`, `paginacaoUtil.ts`, `navegaEntreDispositivosAlterados.ts`, `conteudoValidator.ts`.
- Interface: `editor.component.ts`, `eta-container-table.ts`, `eta-container-td-esquerdo.ts`, CSS do editor e os diálogos de remissão.
- Testes unitários que contam elementos de documentos com ementa e um novo spec E2E.
