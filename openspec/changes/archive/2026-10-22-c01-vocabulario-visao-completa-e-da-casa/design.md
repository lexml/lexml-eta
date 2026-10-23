## Context

Ver `proposal.md` (Why). Estado atual (change arquivada `2026-10-19-c02-separar-vocabulario-por-autoridade`):

- `montarVocabulario(casa)` mescla `federal`, a autoridade própria da casa e `congresso`; `index.ts` guarda **um** `Vocabulario` estático, (re)montado por `inicializarVocabulario(casa)`.
- As consultas por URN (`getTipo`, `getSigla`, `getAutoridade`, `getTipoDocumentoUrn`, `getPreambuloPadrao`, nomes por extenso, `validaUrn`, em `urnUtil.ts`) e as consultas sem autoridade (`consultasVocabulario.ts`) leem o mesmo vocabulário.
- `validaUrn` só é usado para norma citada ou alterada (`dispositivoValidator`, `adicionaAlteracaoComAssistente`, `atualizaReferenciaElemento`, `normaAlteradaDivergente`), nunca para o documento em edição.
- A URN do documento é resolvida em `LexmlEtaComponent.inicializaProposicao`: a URN recebida (arquivo, `params.urn`, `proposicao.urn`) é usada como está; só sem ela a URN é gerada pela sigla (`buildUrnProposicao` → `getTipoPorSigla`).
- Hoje um documento de outra casa falha por efeito colateral (sigla vazia, tipo indefinido), sem regra declarada.

## Goals / Non-Goals

**Goals:**
- Duas visões do mesmo conjunto de dados por autoridade, com a escolha da visão fixada por consulta, e não pelo chamador.
- A visão da casa continua impedindo, por construção, que uma consulta sem autoridade devolva tipo da outra casa.
- A recusa do documento de outra casa ocorre antes de qualquer alteração do editor.

**Non-Goals:**
- Mudar os dados das autoridades ou a forma de declará-los.
- Definir a casa do documento, as listas de parlamentares e comissões ou o tratamento para um documento da outra casa (fica para quando a abertura for suportada).
- Mudar a API pública do componente.

## Decisions

### D1. Duas visões no `index.ts`, montadas pela mesma `mesclar`

`index.ts` passa a expor `getVocabularioCompleto()` (montado uma vez, com as quatro autoridades, sem depender da casa) e `getVocabularioDaCasa()` (o atual, (re)montado por `inicializarVocabulario(casa)`). `montarVocabulario.ts` ganha a lista de todas as autoridades ao lado de `AUTORIDADES_POR_CASA`; `mesclar` não muda de assinatura.

`inicializarVocabulario` não remonta a visão da casa quando a casa efetiva (depois do padrão `SF` para valor inválido) é a mesma já montada: o componente a chama no construtor e a cada atribuição de `lexmlEtaConfig`, quase sempre com a mesma casa.

`getVocabulario()` é removido (e não mantido como sinônimo) para que cada consumidor escolha a visão explicitamente; os consumidores são poucos (`urnUtil.ts` e `consultasVocabulario.ts`).

*Alternativa considerada:* um vocabulário único com um filtro por casa em cada consulta sem autoridade. Rejeitada porque a proteção passaria a depender de disciplina (toda consulta nova teria de lembrar o filtro; `resolverReferencia` já tem um `?? candidatos[0]` que escaparia), e porque a validação de sigla ativa única teria de ser feita por casa de qualquer forma.

### D2. Distribuição das consultas

| Visão completa | Visão da casa |
|---|---|
| `getAutoridade`, `getTipo`, `getSigla`, `getTipoDocumentoUrn`, `getPreambuloPadrao`, `getNomeExtenso*`, `validaUrn`, `atalhosUrn` | `getTipoPorSigla` (e portanto `buildFakeUrn`/`buildUrnProposicao`), `getTiposDocumentoAtivos`, `getTiposDocumentoInativos`, `getTiposReferenciaveis` |

O preâmbulo padrão fica na visão completa por ser chaveado pela autoridade da URN. Com a recusa (D4) ele só é usado com documentos da casa, mas a consulta continua coerente quando a abertura de outra casa for suportada.

### D3. Validação da mesclagem

A sigla ativa única e as referências de `tiposReferenciaveis` são validadas **em cada visão de casa** (como hoje). A visão completa valida só a chave duplicada (`urnAutoridade:urn`), já que nela `PL`, `PLP` e `PEC` ativos se repetem entre Senado e Câmara. Para que um erro de dados apareça mesmo que o editor só use uma casa, a validação das duas visões de casa roda na montagem da visão completa (um teste também cobre as duas).

Implementação provável: `mesclar` recebe uma opção para pular a checagem de sigla ativa; fica a critério da implementação, desde que o erro continue descritivo.

### D4. Recusa do documento de outra casa

Uma função pura em `urnUtil.ts` verifica se a autoridade da URN pertence à visão da casa (`getVocabularioDaCasa().autoridades`) e lança `Error` com mensagem própria ("documento de outra casa legislativa não é suportado neste editor", com a autoridade). É chamada em dois pontos, porque a abertura tem duas portas:

1. `lerDocumentoArticulado` (`documentoArticulado.ts`), que já valida antes de alterar o editor e devolve mensagem ao usuário (`demoview` mostra o `message`). Mantém o contrato documentado em `docs/api-componente-lexml-eta.md` §4.4 ("editor segue intacto").
2. O início de `LexmlEtaComponent.inicializarEdicao`, **antes** de `this.projetoNorma = params.projetoNorma` e de qualquer outra atribuição, só quando a URN veio de fora (arquivo, `params.urn` ou `proposicao.urn`). O erro segue o caminho atual do `catch` (`fatalError` para o host).

A URN gerada pela sigla não passa pela checagem: ela sempre sai de um tipo da visão da casa.

*Alternativa considerada:* checar só em `inicializarEdicao`. Rejeitada porque, na abertura por arquivo, o `catch` despacha `errorInicializarEdicaoAction`, que altera o estado com uma mensagem genérica — contradiz o "editor intacto" de `abrirDocumentoArticulado`.

## Risks / Trade-offs

- [Uma URN de norma da outra casa passa a validar onde antes era recusada] → É o objetivo; não há consumidor que dependa da recusa (todos os usos de `validaUrn` são de norma citada ou alterada). Testes cobrem as duas casas.
- [A recusa barra um host que hoje envia, por engano, uma URN de outra casa e "funcionava pela metade"] → O erro passa a ser explícito pelo `fatalError`; registrar no item 18 do `CLAUDE.md` e avisar o `lexeditweb-editor`.
- [A ordem de `autoridades` na visão completa influencia `find` em consultas por URN] → As consultas por URN casam a autoridade exata, então a ordem não altera o resultado; um teste fixa um caso de tipo repetido (`resolucao`).
- [Custo de montar duas visões] → Desprezível (dezenas de tipos); a completa é montada uma vez.

## Migration Plan

Sem migração de dados nem de arquivos. Rollback: reverter a change (os dados por autoridade não mudam).
