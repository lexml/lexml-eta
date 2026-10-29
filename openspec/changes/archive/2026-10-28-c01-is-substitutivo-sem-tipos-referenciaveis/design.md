# Design

## Context

O vocabulário (`src/model/lexml/documento/vocabulario/`) já tem `tipoRelacaoSubstitutivo` por proposição e a lista de `eventos` com o marcador `substitutivo: 's'` (`apresentacao.substitutivo`, `aprovacao.substitutivo`, `aprovacao.substitutivo.decisao.terminativa`). `getTipo(urn)` (`urnUtil.ts`) resolve o tipo na visão completa pela autoridade exata. Não existe extrator do evento da URN: `getNumero` apenas descarta o trecho após `@`. `getTiposReferenciaveis`, `getRefGenericaProjeto` e o campo `substitutivo` (sempre `false`) não têm consumidor em `src/`. Ver proposal.md para a motivação.

## Goals / Non-Goals

**Goals:**
- Remover `tiposReferenciaveis` e tudo que dependia dele, sem alterar o comportamento do editor.
- Oferecer `isSubstitutivo(urn)` testado, sem consumidor por enquanto.

**Non-Goals:**
- Rever a change `2026-10-26-c01-especificar-componente-nova-proposicao` (será feita depois).
- Mudar epígrafe, preâmbulo ou nomes em função de substitutivo.

## Decisions

- **`isSubstitutivo` em `urnUtil.ts`**, ao lado de `getTipo`/`getSigla`, e não em `consultasVocabulario.ts`: parte de uma URN, logo usa a visão completa (regra da spec `vocabulario-urn`). Alternativa descartada: usar a visão da casa, que não resolveria a URN da outra casa.
- **Evento da URN**: é o trecho após o `@`, até o primeiro `;` (`...@apresentacao.substitutivo` e `...@data.evento;leitura;2019-03-19t14.00`), comparado por igualdade com a `urn` dos `eventos` do vocabulário comum. Fica como helper interno, não exportado. Alternativa descartada: `includes('substitutivo')` na URN, que erraria para eventos futuros e para tipos como `substitutivo;sbt`.
- **Decisão por `tipoRelacaoSubstitutivo`**: `é substitutivo` → verdadeiro; `aceita substitutivo` → depende do evento; demais, inclusive `é subemenda substitutiva` → falso. Tipo não resolvido → falso, sem lançar erro.
- **Remoção do campo `substitutivo`**: sai de `ParametrosEdicao`, de `Proposicao` e das cópias em `lexml-eta.component.ts`. `getRefGenericaProjeto` sai com o `TODO`; `NomeComGenero` e os imports `generoMasculino`/`generoFeminino` só saem se, conferido por busca, ficarem sem uso.
- **Validação da mesclagem**: some a verificação de `tiposReferenciaveis` (inexistente / não aceita substitutivo); `aceitaComoReferencia` perde a razão de existir.

## Risks / Trade-offs

- [Host serializa ou lê `Proposicao.substitutivo`] → registrar no CLAUDE.md como mudança a comunicar ao `lexeditweb-editor`; o valor era sempre `false`.
- [`isSubstitutivo` sem consumidor pode apodrecer] → coberto por testes unitários e pela spec.
- [A change `2026-10-26-c01-...` cita `tiposReferenciaveis` e fica defasada] → aceito; será revista depois, como combinado.
