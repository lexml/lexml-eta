# Proposal

## Why

O vocabulário de URN (`src/model/lexml/documento/vocabulario.ts`) é uma estrutura plana: a lista de tipos de documento não tem autoridade, e a relação sigla → autoridade → tipo está espalhada entre `tiposDocumento`, `siglas` e `fakeUrns`, com entradas mortas e inconsistentes. Isso impede evoluir o vocabulário como pede a issue #1026 (tipos ativos/inativos por sigla+autoridade, sigla da casa, relação com substitutivo), porque nenhum desses atributos tem onde morar sem a autoridade como dimensão do vocabulário. Esta change faz só o primeiro passo da issue — separar o vocabulário por autoridade — sem introduzir os atributos novos.

## What Changes

- Quebrar `vocabulario.ts` em `vocabulario/` com uma constante por autoridade (`federal`, `senado`, `camara`, `congresso`) e uma comum (`atalhosUrn` e `eventos`), mescladas por uma função em um único `VOCABULARIO` interno (não exportado no `index` do pacote).
- A mesclagem carimba `urnAutoridade` nos itens das constantes de autoridade; os itens do vocabulário comum não são carimbados.
- Redistribuir `tiposDocumento`, `siglas`, `fakeUrns` e `preambulosPadrao` entre as autoridades (distribuição completa no `design.md`); tipos usados por mais de uma autoridade (`decreto.legislativo`, `regimento.interno`, `resolucao`, `pec`, `pl`, `plp`, `prs`) são duplicados.
- `getTipo` e `getTipoDocumentoUrn` passam a considerar a autoridade da URN, com fallback para qualquer entrada de mesma URN de tipo; `getSigla` passa a preferir a entrada da autoridade da URN.
- **BREAKING (URN gerada para proposição nova)**: `MPV` passa de `urn:lex:br:senado.federal:medida.provisoria;mpv` para `urn:lex:br:federal:medida.provisoria;mpv`, e `PLV` de `senado.federal` para `congresso.nacional`. Não há compatibilidade com a URN antiga de MPV (decisão do dono do produto); a URN de PLV antiga continua resolvendo pelo fallback.
- **BREAKING (texto padrão do preâmbulo)**: o preâmbulo padrão passa a depender da combinação tipo + autoridade da URN, e não mais só do tipo. `projeto.lei` vale para Senado, Câmara e Congresso; `projeto.lei.complementar` e `proposta.emenda.constitucional` para Senado e Câmara; `projeto.decreto.legislativo` para Senado, Câmara e Congresso; `projeto.lei.conversao` só para o Congresso; `medida.provisoria` só para `federal`; `projeto.resolucao` segue por Senado, Câmara e Congresso. Uma URN com combinação fora dessa tabela (ex.: `senado.federal:projeto.lei.conversao;plv`, `senado.federal:medida.provisoria;mpv`) deixa de receber texto padrão.
- Corrigir os fixtures `mpv_930_2020` e o teste de preâmbulo da MPV para a URN correta (já feito durante a exploração).

## Capabilities

### New Capabilities
- `vocabulario-urn`: organização do vocabulário de URN por autoridade, autoridade da URN gerada para proposição nova e resolução de tipo/sigla com preferência pela autoridade da URN.

### Modified Capabilities

- `preambulo-proposicao`: o texto padrão do preâmbulo passa a ser escolhido pelo tipo **e** pela autoridade da URN.

## Impact

- Código: `src/model/lexml/documento/vocabulario.ts` (vira a pasta `vocabulario/`), `src/model/lexml/documento/urnUtil.ts` (`getTipo`, `getTipoDocumentoUrn`, `getSigla`, `buildFakeUrn`, `getPreambuloPadrao`).
- Consumidores indiretos de `getTipo`: `buildProjetoNormaFromJsonix.ts`, `adicionaAlteracaoComAssistente.ts`, `atualizaReferenciaElemento.ts` (normas referenciadas, de autoridades variadas — daí o fallback).
- Testes: novo teste de caracterização do vocabulário; ajustes em `documentoArticulado.test.ts` (MPV) e em `preambuloPadrao.test.ts` (casos de PLV e MPV sob o Senado, que deixam de ter texto padrão).
- Host (`lexeditweb-editor`): quem criar proposição nova de MPV ou PLV por sigla passa a receber a URN com a nova autoridade.
- Fora de escopo (issue #1026, próximas changes): flag `ativo`, `tipoRelacaoSubstitutivo`, siglas antigas, sigla da casa legislativa e limpeza das entradas mortas de `siglas`.
