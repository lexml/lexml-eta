# Design

## Context

`VOCABULARIO` (`vocabulario.ts`) é um objeto único e plano, consumido só por `urnUtil.ts`. Hoje:

- `tiposDocumento` (32 entradas) não tem autoridade; `getTipo`/`getTipoDocumentoUrn` casam apenas o segundo segmento da URN (`partes[1]`).
- `fakeUrns` (15) mapeia sigla → autoridade + tipo e é a **única** origem da URN de proposição nova (`buildFakeUrn`, chamado por `buildUrnProposicao` a partir da sigla que o host informa em `lexml-eta.component.ts:423/426`). Também é o fallback de `getSigla`.
- `siglas` tem quatro entradas que nunca casam (`PLN`, `PLS` duas vezes e `PLC`, com `urnTipoDocumento` sem `;sigla`, enquanto `getSigla` compara com `tipo.urn`, que inclui a sigla).
- `preambulosPadrao` casa por tipo sem `;sigla` e, quando há, por autoridade; a de maior precedência é a que tem a autoridade da URN, e a sem autoridade serve de fallback (`getPreambuloPadrao`).
- `getTipo` também resolve **normas referenciadas** (`adicionaAlteracaoComAssistente`, `atualizaReferenciaElemento`), de autoridades variadas (`federal:lei`, `congresso.nacional:decreto.legislativo`, `senado.federal:resolucao`...), sem relação com `fakeUrns`.

Restrições: o formato mesclado não é API pública (decisão do dono do produto: não entra no `index` do pacote); a URN gravada em arquivos de proposição existentes continua precisando abrir, com a única exceção deliberada da URN antiga de MPV.

## Goals / Non-Goals

**Goals:**
- Um módulo de dados por autoridade, mais um comum, mesclados em um `VOCABULARIO` com o mesmo formato de hoje acrescido de `urnAutoridade` nos tipos.
- Redistribuir os dados sem perder nenhuma entrada, exceto as consequências deliberadas (autoridade de MPV e de PLV na URN nova e a distribuição dos preâmbulos por autoridade, D4).
- `getTipo`/`getTipoDocumentoUrn`/`getSigla` sensíveis à autoridade, com fallback que mantém o comportamento atual para qualquer URN que hoje resolve.
- Provar que é reorganização por um teste de caracterização escrito **antes** de mover os dados.

**Non-Goals:**
- Flag `ativo`, `tipoRelacaoSubstitutivo`, siglas antigas, sigla da casa legislativa (itens seguintes da issue #1026).
- Limpar as quatro entradas mortas de `siglas` ou deduplicar `siglas` × `fakeUrns`.
- Mudar `eventos` e `atalhosUrn`.
- Qualquer alteração de UI ou de formato de arquivo salvo.

## Decisions

### D1 — Estrutura de arquivos e mesclagem

`vocabulario.ts` vira a pasta `vocabulario/` (o import `./vocabulario` de `urnUtil.ts` continua válido via `index.ts`):

```
vocabulario/
  tipos.ts        // VocabularioAutoridade, VocabularioComum, tipos dos itens
  comum.ts        // atalhosUrn, eventos
  federal.ts      // autoridade 'federal'
  senado.ts       // 'senado.federal'
  camara.ts       // 'camara.deputados'
  congresso.ts    // 'congresso.nacional'
  mesclar.ts      // função pura de mesclagem
  index.ts        // export const VOCABULARIO = mesclar(...) — não reexportado no index do pacote
```

Cada constante de autoridade declara `autoridade` (`urn`, `descricao`) e arrays opcionais `tiposDocumento`, `siglas`, `fakeUrns`, `preambulosPadrao`, cujos itens **não** trazem `urnAutoridade` (tipados com `Omit<..., 'urnAutoridade'>`). `mesclar` carimba a autoridade e concatena na ordem fixa **comum, federal, senado, camara, congresso**. Em `siglas`/`fakeUrns` o campo já existente `urnAutoridade` é o mesmo carimbado; em `tiposDocumento` é campo novo. Itens do comum (`atalhosUrn`, `eventos`) passam sem carimbo; `atalhosUrn` mantém o `urnAutoridade` explícito que já tem.

Alternativa descartada: um único arquivo com todas as autoridades em uma lista — não separa nada e mantém o conflito de merge em um arquivo grande.

### D2 — Distribuição dos dados

| Constante | `tiposDocumento` | `siglas` | `fakeUrns` |
|---|---|---|---|
| **comum** | — | — | — |
| **federal** | `lei`, `lei.complementar`, `lei.delegada`, `decreto.lei`, `decreto`, `consolidacao.leis.trabalho`, `constituicao`, `ato.disposicoes.constitucionais.transitorias`, `emenda.constitucional`, `emenda.constitucional.revisao`, `medida.provisoria`, `medida.provisoria;mpv` | `MPV` (`medida.provisoria`) | `MPV` |
| **senado** | `decreto.legislativo`, `regimento.interno`, `resolucao`, `proposta.emenda.constitucional;pec`, `projeto.lei;pl`/`;pls`/`;plc`, `projeto.lei.complementar;plp`/`;pl`/`;pls`/`;plc`, `projeto.resolucao;prs`, `projeto.decreto.legislativo;pds`/`;pdl`, `substitutivo.projeto.lei.senado;scd`, `emenda.projeto.lei.senado;ecd` | `PLS` (`projeto.lei`), `PLS` (`projeto.lei.senado.federal`) — mortas | PEC, PL, PLS, PLP, PLC, PRS, PDS, PDL, SCD, ECD |
| **camara** | `decreto.legislativo`, `regimento.interno`, `projeto.resolucao;prc`, e cópias de `pec`, `projeto.lei;pl`, `projeto.lei.complementar;plp`, `projeto.resolucao;prs` | `PLC` (`projeto.lei`) — morta | PRC |
| **congresso** | `decreto.legislativo`, `resolucao`, `projeto.decreto.legislativo;pdn`, `projeto.resolucao;prn`, `projeto.lei.conversao;plv` | `PLN` (`projeto.lei`) — morta, `MPV` (`medida.provisoria`), `PDN`, `PRN` | PDN, PRN, PLV |

Totais a conferir: 32 tipos distintos (mais as cópias: `decreto.legislativo` ×3, `regimento.interno` ×2, `resolucao` ×2, `pec`/`pl`/`plp`/`prs` ×2 cada), 15 `fakeUrns` (11 + 1 + 3 = 15 com MPV em `federal`, PRC na Câmara e PLV no Congresso: 10 Senado + 1 federal + 1 Câmara + 3 Congresso = 15).

Pontos de decisão do dono do produto, já tomados:
- Tipos de norma genéricos vão para `federal`; `medida.provisoria` e `;mpv` também.
- As cópias de `pec`, `pl`, `plp` e `prs` na Câmara são só de tipo; **as siglas continuam únicas em `fakeUrns`** (PEC, PL, PLP, PRS ficam no Senado), porque o host informa só a sigla e uma sigla duplicada tornaria `buildFakeUrn` ambíguo.
- `projeto.lei.complementar;pl`/`;pls`/`;plc` ficam no Senado (candidatos a inativos na etapa do flag `ativo`).
- O `decreto.legislativo` do Congresso é `congresso.nacional:decreto.legislativo`; as cópias de Senado e Câmara permanecem como pedido antes.

### D3 — Resolução de tipo e sigla pela autoridade (com fallback)

Um helper interno `procurarPorAutoridade(itens, autoridadeDaUrn, predicado)` devolve a primeira entrada que satisfaz o predicado **e** tem `urnAutoridade === autoridadeDaUrn`; sem ela, a primeira que satisfaz o predicado (ordem de mesclagem de D1). Usado por:

- `getTipo` e `getTipoDocumentoUrn` — predicado: `t.urn === partes[1]`;
- `getSigla` — predicado: `urnTipoDocumento === tipo.urn`, em `siglas` e depois em `fakeUrns`, cada um com a mesma preferência.

Mesmo padrão já usado por `getPreambuloPadrao` (autoridade exata, depois fallback), o que mantém um só modelo mental. O fallback é indispensável: normas referenciadas chegam com combinações de autoridade+tipo que nenhum dado declara (ex.: `camara.deputados:lei`), e `validaUrn` exige tipo resolvido. `getAutoridade` não muda.

### D4 — Preâmbulos distribuídos por autoridade (decisão do dono do produto)

Cada entrada de `preambulosPadrao` passa a ser declarada só nas autoridades abaixo; o lookup (`getPreambuloPadrao`) casa tipo sem `;sigla` **e** autoridade da URN, sem fallback para entrada sem autoridade (não existe mais nenhuma):

| Tipo | `federal` | `senado` | `camara` | `congresso` |
|---|---|---|---|---|
| `projeto.lei` | — | sim | sim | sim |
| `projeto.lei.complementar` | — | sim | sim | — |
| `projeto.lei.conversao` | — | — | — | sim |
| `projeto.decreto.legislativo` | — | sim | sim | sim |
| `proposta.emenda.constitucional` | — | sim | sim | — |
| `medida.provisoria` | sim | — | — | — |
| `projeto.resolucao` | — | sim (Senado) | sim (Câmara) | sim (Congresso) |

Isto **muda o comportamento atual**, em que o texto dependia só do tipo (exceto `projeto.resolucao`). URNs de combinação fora da tabela deixam de ter preâmbulo padrão; os casos conhecidos são `senado.federal:projeto.lei.conversao;plv` e `senado.federal:medida.provisoria;mpv`, além de combinações que não existem na prática (ex.: `federal:projeto.lei`, que aparece só em URNs sintéticas de testes de round-trip). Por isso o comportamento está na delta de `preambulo-proposicao` e o teste de caracterização (D6) registra cada diferença como expectativa explícita.

Alternativa descartada: duplicar todos os preâmbulos nas quatro autoridades para preservar o comportamento (era a versão anterior desta decisão). Foi preterida porque a intenção do dono do produto é que o texto padrão reflita quem de fato apresenta cada tipo.

### D5 — MPV e PLV mudam de autoridade na URN nova

`fakeUrns` de MPV vai para `federal` (a URN real é `urn:lex:br:federal:medida.provisoria;mpv:...`) e o de PLV para `congresso.nacional`. Sem compatibilidade com a URN antiga de MPV por decisão do dono do produto. Para PLV, a URN antiga `senado.federal:...;plv` continua resolvendo por D3. Fixtures `mpv_930_2020` (4 arquivos) e `preambuloPadrao.test.ts` já foram corrigidos para `federal`.

### D6 — Teste de caracterização antes da migração

Um teste percorre o `VOCABULARIO` **atual** e fixa as saídas de `getTipo`, `getSigla`, `getAutoridade`, `getPreambuloPadrao` e `buildFakeUrn` para cada entrada (e para URNs de autoridade cruzada que hoje resolvem). Deve passar antes de mover os dados e depois de movê-los; as únicas expectativas que mudam, explicitadas no próprio teste, são `buildFakeUrn('MPV')` e `buildFakeUrn('PLV')` e os textos padrão de preâmbulo das combinações fora da tabela de D4. Também verifica invariantes do vocabulário mesclado: uma só entrada por sigla em `fakeUrns`, e nenhuma entrada de `tiposDocumento` sem `urnAutoridade`.

## Risks / Trade-offs

- **Ordem de mesclagem muda qual `find` ganha** → D1 fixa a ordem; D6 detecta qualquer diferença nas saídas de `getSigla`/`getTipo`.
- **Cópias de tipo divergirem** (`decreto.legislativo` ×3 etc.) → ficam em constantes diferentes e podem se separar; mitigado pelo teste de caracterização e por D3, que devolve a primeira, então a descrição/gênero das cópias devem ser idênticas (o teste confere).
- **URN nova de MPV/PLV muda para quem integra** → comunicar ao `lexeditweb-editor` (também o item de nota no `CLAUDE.md`); não há migração de arquivos.
- **Preâmbulo some em combinações antes atendidas** (D4) → intencional e coberto pela delta; os testes e fixtures afetados são ajustados na tarefa 4.2 e a lista de casos acima deve ser conferida na caracterização.
- **Dados mortos em `siglas` agora ficam espalhados por autoridade** → deliberado; limpeza fica para a change de `siglas`.
- **Importação circular/tamanho**: `mesclar` roda uma vez na carga do módulo; o custo é desprezível (menos de 200 itens).

## Open Questions

- `decreto.legislativo` e `regimento.interno` realmente devem permanecer em Senado e Câmara além do Congresso (`regimento.interno` só tem atalho no Congresso e no Senado)? Mantido como pedido; reavaliar na limpeza.
