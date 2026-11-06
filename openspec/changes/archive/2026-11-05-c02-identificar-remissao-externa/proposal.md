# Proposal

## Why

O hospedeiro precisa poder desligar a detecção automática de remissão externa pela configuração do componente.

## What Changes

- Novo campo `identificarRemissaoExterna` em `LexmlEtaConfig`, booleano, padrão `true`. Com `true`, nada muda.
- Com `false`, o editor não roda a detecção automática de remissão externa, e o worker do lexml-linker nem é criado.
- Continuam funcionando com `false`:
  - a detecção automática de remissão interna;
  - a criação e a edição manual de remissão externa pelo diálogo;
  - a colagem de link de remissão externa;
  - as remissões externas já existentes no documento aberto, que continuam sendo exibidas e gravadas.
- Documentação do campo em `docs/api-componente-lexml-eta.md`.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `remissao-externa`: novo requisito para desligar a detecção automática pela configuração do componente.

## Impact

- `src/model/lexmlEtaConfig.ts`: campo novo.
- `src/components/editor/editor.component.ts`: `coordenarDeteccaoExterna` passa a respeitar o campo.
- Testes: unitário em `test/components/editor/deteccaoRemissaoBlur.test.ts` e E2E em `cypress/e2e/remissao-externa/`.
- `docs/api-componente-lexml-eta.md`: tabela da seção 5 e receita "Detecção de remissões".
- Compatível: hospedeiros que não informam o campo continuam com a detecção ligada.
