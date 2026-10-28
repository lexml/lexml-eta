# Proposal

## Why

Com o novo entendimento do componente de nova proposição, o atributo `tiposReferenciaveis` do vocabulário de tipos de documento deixa de ser necessário, e o `lexml-eta` não precisa mudar de comportamento por o documento ser ou não um substitutivo. Falta, porém, uma forma de saber, a partir da URN, se um documento é substitutivo, para uso posterior. Implementa a issue lexml/lexml-eta#1056.

## What Changes

- Remove `tiposReferenciaveis` do tipo de documento, de `vocabularioSenado`, da validação da mesclagem (RV-10) e de `aceitaComoReferencia`.
- Remove `getTiposReferenciaveis` (consultas do vocabulário) e seus testes.
- Cria `isSubstitutivo(urn): boolean`. A URN é substitutivo quando o `tipoRelacaoSubstitutivo` do seu tipo é `é substitutivo`, ou quando é `aceita substitutivo` e a URN apresenta um evento com `substitutivo='s'` (ex.: `urn:lex:br:senado.federal:projeto.lei;pl:2026;12@apresentacao.substitutivo`). Os demais tipos, inclusive a subemenda substitutiva, não são substitutivo.
- Remove código morto: o campo `substitutivo` de `ParametrosEdicao` e de `Proposicao` (e suas cópias em `lexml-eta.component.ts`) e `getRefGenericaProjeto` (sem uso), com o `TODO` que apontava para `UrnService.isSubstitutivo`, e `NomeComGenero` se ficar sem uso.
- Atualiza `docs/requisitos/vocabulario.md` e o item 18 do `CLAUDE.md`.
- **BREAKING** (pequeno): `Proposicao.substitutivo` deixa de existir no modelo; o host que o leia ou atribua precisa ser ajustado.
- Fora do escopo: a change `2026-10-26-c01-especificar-componente-nova-proposicao`, que será revista depois e hoje cita `tiposReferenciaveis`.

## Capabilities

### New Capabilities
<!-- Nenhuma. -->

### Modified Capabilities
- `vocabulario-urn`: remove o requisito "Tipos de referência de um substitutivo" e o atributo `tiposReferenciaveis` (modelo do tipo e validação da mesclagem); adiciona "Identificação de substitutivo pela URN".

## Impact

- Código: `src/model/lexml/documento/vocabulario/` (`tiposVocabulario.ts`, `mesclarVocabulario.ts`, `consultasVocabulario.ts`, `vocabularioSenado.ts`), `urnUtil.ts`, `src/model/dispositivo/genero.ts`, `src/model/proposicao/proposicao.ts`, `src/components/lexml-eta.component.ts`.
- Testes: `vocabulario.mesclar.test.ts` e `vocabulario.consultas.test.ts` perdem os casos de referenciáveis; novo teste de `isSubstitutivo`.
- Documentação: `docs/requisitos/vocabulario.md`, `CLAUDE.md`.
- Sem impacto no comportamento do editor: nenhum consumidor em `src/` usava `getTiposReferenciaveis`, `getRefGenericaProjeto` nem o valor de `substitutivo` (sempre `false`).
