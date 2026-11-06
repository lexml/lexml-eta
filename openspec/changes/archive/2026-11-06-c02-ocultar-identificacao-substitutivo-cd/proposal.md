# Proposal

## Why

Na `CD`, o grupo "Identificação do substitutivo (ou da subemenda substitutiva)" da Tela 1 do componente de nova proposição pede uma sigla, o número `s/n` e o ano. Não há escolha real a fazer: o vocabulário da `CD` tem um único tipo ativo para cada espécie (`SBT` para substitutivo e `SSP` para subemenda substitutiva) e o ano é, na prática, sempre o corrente. O grupo só acrescenta um passo ao usuário.

## What Changes

- Na `CD`, quando a espécie é Substitutivo ou Subemenda substitutiva, o grupo de identificação do documento novo (`np-g2`) **deixa de ser exibido**.
- O tipo do documento passa a ser derivado da espécie: `SBT` para Substitutivo e `SSP` para Subemenda substitutiva, resolvidos pela sigla no vocabulário da casa. Se a sigla não existir no vocabulário, o componente falha de forma explícita.
- O ano do documento novo passa a ser o ano corrente, sem campo de edição.
- No modo de edição de dados básicos, o ano é o da URN inicial (preservado, inclusive quando o usuário troca a espécie entre Substitutivo e Subemenda substitutiva); só a criação usa o ano corrente.
- A exigência de sigla e ano do substitutivo em **Continuar** deixa de existir.
- O `SF` não muda: o grupo já não é exibido nessa casa e a URN do substitutivo continua montada a partir da proposição identificada.
- O contrato do evento de resultado e o formato da URN não mudam.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `nova-proposicao`: os requisitos "Identificação do substitutivo na CD", "Continuar na Tela 1", "URN do novo documento" e o cenário "Subemenda substitutiva na Câmara" de "Tela 1 preenchida a partir dos dados iniciais" mudam.

## Impact

- Código: `src/components/nova-proposicao/` (`nova-proposicao.component.ts`, `siglasNovaProposicao.ts` e, no modo de edição, o uso de `lerDadosIdentificacao.ts`); `montaUrnNovaProposicao.ts` e `tiposNovaProposicao.ts` mantêm o contrato.
- Testes: `test/componente/nova-proposicao/novaProposicao.component.test.ts` e `alterarDadosBasicos.component.test.ts`; E2E `cypress/e2e/nova-proposicao/nova-proposicao.cy.ts` (dois casos da `CD`).
- Documentação: `docs/requisitos/componente-nova-proposicao.md` (g2, RN-01, RN-06, RN-12, regra de ano) e `docs/requisitos/layout-tela-1-componente-nova-proposicao.txt`.
- Host (`lexeditweb-editor`): sem impacto na API do componente.
