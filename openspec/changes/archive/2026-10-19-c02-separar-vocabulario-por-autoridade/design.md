# Design

## Context

Hoje o vocabulário (`vocabulario/`) é um objeto global montado por `mesclar` a partir de módulos por autoridade (primeira etapa, já commitada em `f6c69a11`), mas o modelo ainda é o antigo:

- `tiposDocumento[].urn` mistura tipo e sigla (`projeto.lei;pl`); `siglas` e `preambulosPadrao` usam o tipo sem sigla; `fakeUrns` mapeia sigla → tipo e é a **única** origem da URN de proposição nova (`buildFakeUrn`, chamado por `buildUrnProposicao`).
- `siglas` tem entradas que nunca casam em `getSigla` (comparação com `tipo.urn`, que inclui a sigla) e há duas tabelas para a mesma informação.
- `getTipo`/`getTipoDocumentoUrn`/`getSigla` casam só o segmento de tipo, e o trabalho em andamento (grupo 3 original) acrescentou um fallback por autoridade (`procurarPorAutoridade`), que esta revisão elimina.
- O editor tem dois modos: LexEdit (`SF`) e Infoleg Editor (`CD`), com vocabulários que não devem se misturar. O componente já tem `casaLegislativa` (casa do **documento**, com `CN`), que não serve para isso.

O modelo-alvo e os requisitos estão em `docs/requisitos/vocabulario.md`; aqui ficam as decisões de implementação.

Restrições: o vocabulário mesclado não é API pública; o editor admite uma única instância do componente por página; o host (`lexeditweb-editor`, Infoleg Editor) precisa informar a casa do editor.

## Goals / Non-Goals

**Goals:**
- Vocabulário mesclado **por casa** (`SF`/`CD`) a partir dos módulos por autoridade.
- Um só cadastro de tipos (`tiposDocumento`) com chave, `ativo`, `tipoRelacaoSubstitutivo` e `tiposReferenciaveis`; sem `fakeUrns` e sem `siglas`.
- Consultas: tipos ativos/inativos, tipo pela sigla, tipo pela URN, tipos de referência de substitutivo.
- Resolução sempre pela autoridade exata, sem fallback.
- Validação do vocabulário na mesclagem.

**Non-Goals:**
- Preencher `tiposReferenciaveis` do SF (negócio, depois).
- Tela de nova proposição que usa as consultas.
- Concordância de gênero do preâmbulo da MPV e texto padrão de SCD/ECD.
- Mudar `eventos` e `atalhosUrn` (seguem comuns).

## Decisions

### D1 — Casa do editor e mesclagem por casa

`LexmlEtaConfig.casaLegislativaEditor` (`'SF' | 'CD'`, padrão `'SF'`; já adicionado em `lexmlEtaConfig.ts`) escolhe a composição:

```
SF = mesclar(comum, [federal, senado, congresso])
CD = mesclar(comum, [federal, camara, congresso])
```

`mesclar` segue puro; a composição por casa fica em uma função `montarVocabulario(casa)`. A ordem dos módulos não importa mais para resolução (não há fallback), mas continua fixa para listagens determinísticas. `casaLegislativaEditor` é independente de `casaLegislativa` (casa do documento, colegiado apreciador); os dois campos não se influenciam, e a casa do editor nunca é derivada da URN (a sigla da URN depende do vocabulário).

Alternativa descartada: reaproveitar `casaLegislativa`. Ela é gravada no arquivo (`ColegiadoApreciador.siglaCasaLegislativa`), admite `CN` e filtra parlamentares; misturá-la com a seleção de vocabulário quebraria arquivos salvos.

### D2 — Modelo do tipo de documento

```ts
interface TipoDocumentoItem {
  urnTipoDocumento: string;                 // 'projeto.lei'
  sigla?: string;                           // 'PL' — só proposições
  descricao: string;
  genero: string;
  ativo?: boolean;                          // padrão true
  tipoRelacaoSubstitutivo?: TipoRelacaoSubstitutivo;
  tiposReferenciaveis?: string[];           // URNs de tipo (com sigla)
}
```

O mesclado acrescenta `urnAutoridade` e `urn` (calculada: `urnTipoDocumento` + `;` + sigla em minúsculas, ou só `urnTipoDocumento` sem sigla). `tiposReferenciaveis` guarda URNs de tipo na forma `projeto.lei;pls`, coerentes com a chave sem repetir autoridade: a referência é resolvida **dentro da mesma casa**, preferindo a autoridade do tipo que referencia e, se não houver, qualquer outra da casa que tenha essa URN de tipo e sigla (única por construção, ver D3). Esse é o único lugar onde uma URN de tipo é resolvida sem autoridade, e ocorre na mesclagem, não em consulta de URN do usuário.

`tipoRelacaoSubstitutivo` é um tipo união de quatro literais (`aceita substitutivo`, `não aceita substitutivo`, `é substitutivo`, `é subemenda substitutiva`); ausente em norma. Para proposição sem valor declarado, assume-se `não aceita substitutivo`.

### D3 — Validação na mesclagem

`montarVocabulario` valida e lança `Error` com mensagem descritiva quando: duas entradas têm a mesma chave; duas proposições **ativas** têm a mesma sigla; `tiposReferenciaveis` cita URN de tipo inexistente na casa ou de tipo cujo `tipoRelacaoSubstitutivo` não é `aceita substitutivo`/`é substitutivo`. Falhar ao montar é intencional: um vocabulário inválido é erro de dados, não de uso. Siglas repetidas entre inativos (ou entre ativo e inativo) são aceitas porque o vocabulário ainda guarda tipos legados.

### D4 — Consultas

Funções de módulo sobre o vocabulário estático (D5), em `vocabulario/consultas.ts`, reexportadas via `urnUtil.ts` onde já existiam:

| Consulta | Função | Resolve por |
|---|---|---|
| C1 | `getTiposDocumentoAtivos()`, `getTiposDocumentoInativos()` | flag `ativo`, só proposições |
| C2 | `getTipoPorSigla(sigla)` | sigla (sem caixa), tipo **ativo** |
| C3 | `getTiposReferenciaveis(tipo)` | `tipoRelacaoSubstitutivo` do tipo ativo |
| C4 | `getTipo(urn)`, `getTipoDocumentoUrn(urn)` | autoridade + segmento de tipo da URN |

`getSigla(urn)` passa a ser `getTipo(urn)?.sigla ?? ''`. `buildFakeUrn(sigla, numero, ano)` mantém a assinatura (usada por `buildUrnProposicao`) e passa a montar `buildUrn(tipo.urnAutoridade, tipo.urn, numero, ano)` a partir de `getTipoPorSigla`; o nome é mantido para limitar o diff, e a mensagem de sigla não encontrada continua a mesma. Sem fallback entre autoridades: `getTipo` devolve a entrada de mesma autoridade e URN de tipo, ou `undefined`. Exceção deliberada, dentro da mesma autoridade: segmento de tipo **sem sigla** que não é norma declarada (ex.: `medida.provisoria:2019-11-11;905`, formato comum em documentos e remissões) resolve para o tipo ativo com sigla que tem esse `urnTipoDocumento`.

C3 por tipo selecionado: `aceita substitutivo` → entradas de `tiposReferenciaveis`; `é substitutivo` → proposições (ativas e inativas) que aceitam substitutivo; `é subemenda substitutiva` → proposições que são substitutivas; demais e tipo inativo → `[]`.

### D5 — Vocabulário estático e inicialização

`vocabulario/index.ts` guarda a instância em variável de módulo (estática), exposta por `getVocabulario()` e `inicializarVocabulario(casa?: string)`. `inicializarVocabulario` normaliza a casa (`SF` por padrão, com `console.warn` para valor inválido), monta e guarda. `urnUtil` e as consultas leem `getVocabulario()`; antes de qualquer inicialização o vocabulário de `SF` é montado sob demanda, para que código de teste e utilitários isolados continuem funcionando.

`LexmlEtaComponent` chama `inicializarVocabulario(config.casaLegislativaEditor)` ao atribuir `lexmlEtaConfig` (setter ou `updated`, conforme o padrão já usado pelo componente), **antes** de `inicializarEdicao`, porque este método chama `getSigla` (`lexml-eta.component.ts:198` e `:346`). Atribuição repetida remonta o vocabulário. Como é estado global, os testes redefinem a casa em `beforeEach` (D7).

Alternativa descartada: passar o vocabulário por parâmetro às ~20 chamadas fora de `urnUtil` (reducers, conversores). Custo alto de propagação para uma instância por página; o estático foi decisão do dono do produto.

### D6 — Preâmbulos por tipo + autoridade, dentro da casa

`preambulosPadrao` mantém o formato (`urnTipoDocumento` sem sigla) e a distribuição por autoridade da tabela abaixo, sem fallback; como a mesclagem é por casa, a autoridade fora da casa não tem preâmbulo.

| Tipo | `federal` | `senado` | `camara` | `congresso` |
|---|---|---|---|---|
| `projeto.lei` | — | sim | sim | sim |
| `projeto.lei.complementar` | — | sim | sim | — |
| `projeto.lei.conversao` | — | — | — | sim |
| `projeto.decreto.legislativo` | — | sim | sim | sim |
| `proposta.emenda.constitucional` | — | sim | sim | — |
| `medida.provisoria` | sim | — | — | — |
| `projeto.resolucao` | — | sim | sim | sim |

`getPreambuloPadrao(urn)` lê autoridade e tipo da URN e procura em `vocabulario.preambulosPadrao`. Combinação fora da tabela devolve `undefined`.

### D7 — Testes por casa

O teste de caracterização atual descreve o modelo antigo (`fakeUrns`, `siglas`) e é **reescrito** para fixar o comportamento do modelo novo: para cada casa, as URNs que resolvem, as siglas e os textos de preâmbulo. Os testes de vocabulário, `urnUtil` e preâmbulo rodam para `SF` e `CD` com um helper que chama `inicializarVocabulario(casa)` em `beforeEach` e restaura `SF` no `afterEach`. As expectativas deliberadamente alteradas (MPV `federal`, PLV `congresso.nacional`, fim do fallback, preâmbulo por casa) ficam explícitas.

### D8 — Chamadores devem tolerar "não resolve"

Sem fallback e sem tipos de outra casa, `getTipo` devolve `undefined` com mais frequência (norma citada com autoridade não declarada, documento da outra casa). Decisão: **sem tratamento especial** — a URN fica sem resolver. A tarefa de migração confere cada chamador (`buildProjetoNormaFromJsonix`, `adicionaAlteracaoComAssistente`, `atualizaReferenciaElemento`, `colarUtil`, `dispositivoValidator`, `documentoArticulado`) para garantir que `undefined` não lança exceção não tratada.

## Risks / Trade-offs

- **Estado global mutável** (D5) → testes que não restauram a casa vazam entre si; mitigado pelo helper de D7 e por inicialização sob demanda de `SF`.
- **Quebra de documentos entre casas e de URN antiga de PLV/MPV** → decisão do dono do produto; avisar o host e registrar no `CLAUDE.md`.
- **Mesclagem que lança erro** (D3) → um dado errado derruba a inicialização do editor; mitigado por teste de vocabulário para as duas casas, que roda na suíte.
- **`tiposReferenciaveis` do SF vazios por enquanto** → C3 devolve `[]` para tipos do SF que aceitam substitutivo até o negócio preencher; documentado.
- **`ativo` ainda não definido pelo negócio** nos tipos legados (PLS, PLC...) → a marcação inicial segue o código atual (sigla ativa única por sigla) e é revista na tarefa de dados.
- **Dados mortos antigos** (`siglas`, `fakeUrns`) → removidos junto com a migração do modelo.
- **Ordem de inicialização** (D5) → coberta por teste do componente que atribui a configuração antes de abrir um documento.

## Open Questions

- Nenhuma bloqueante. Pendente fora desta change: lista de `tiposReferenciaveis` do SF e marcação definitiva de `ativo` pelo negócio.
