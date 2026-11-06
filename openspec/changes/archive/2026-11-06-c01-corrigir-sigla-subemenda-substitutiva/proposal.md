# Proposal

## Why

O vocabulário da Câmara dos Deputados declara a subemenda substitutiva com a sigla `PEP`, mas a sigla correta é `SSP`. Como a URN do tipo é calculada a partir da sigla, a URN gerada para uma subemenda substitutiva nova (`subemenda.substitutiva;pep`) também está errada.

## What Changes

- Trocar a sigla do tipo `subemenda.substitutiva` da autoridade `camara.deputados` de `PEP` para `SSP`; a URN do tipo passa a ser `subemenda.substitutiva;ssp`.
- Atualizar os testes, os requisitos em `docs/requisitos/vocabulario.md` e o cenário da spec `vocabulario-urn` que citam `PEP`/`;pep`.
- **BREAKING**: uma URN com `subemenda.substitutiva;pep` deixa de resolver (autoridade e tipo exatos) e o documento falha na validação. Não há decisão de manter `PEP` como sigla inativa: confirmado que nenhum arquivo ou proposição com `;pep` existe, nem foi enviado ao host.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `vocabulario-urn`: o cenário "Subemenda substitutiva" do requisito "Identificação de substitutivo pela URN" passa a usar `subemenda.substitutiva;ssp`.

## Impact

- Código: `src/model/lexml/documento/vocabulario/vocabularioCamara.ts` (uma linha).
- Testes: `vocabulario.porCasa.test.ts`, `urnUtil.test.ts`, `modulosNovaProposicao.test.ts` e `novaProposicao.component.test.ts`.
- Documentação: `docs/requisitos/vocabulario.md` (seções 3.5 e 6) e a spec `vocabulario-urn`.
- A sigla exibida na lista de substitutivo do componente de nova proposição (espécie Subemenda substitutiva, só na `CD`) e a URN gerada mudam para `SSP`/`;ssp`; nenhum ajuste de código no componente.
- A change `2026-11-05-c01-alterar-dados-basicos-proposicao` cita `PEP` num cenário de exemplo; o texto deve acompanhar a nova sigla.
- Host (`lexeditweb-editor`): sem coordenação necessária, conforme decidido.
