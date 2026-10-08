# Proposal

## Why

A configuração `justificacaoObrigatoria` de `LexmlEtaConfig` permite desligar a exigência de justificação fora do anexo de parecer. Essa opção não tem uso previsto: a justificação deve ser sempre obrigatória, exceto no modo `anexoParecer`, que já não possui justificação. Manter a flag só acrescenta um ramo de comportamento a documentar e testar.

## What Changes

- Remover `justificacaoObrigatoria` de `LexmlEtaConfig` e do uso na demo.
- A justificação passa a ser sempre obrigatória quando `anexoParecer` é `false` (pendência de preenchimento e alerta global); em `anexoParecer`, continua não sendo exigida.
- Atualizar a documentação da API e os testes que exercitam a flag.
- **BREAKING** (aceito): consumidores que atribuem `justificacaoObrigatoria` deixam de compilar; a quebra da API pública não é uma preocupação desta change.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

Nenhuma. O comportamento padrão já era "obrigatória" (`true`); a change só elimina a opção de desativá-la, sem alterar requisitos de nenhuma spec existente. Por isso a change usa `skip_specs: true`.

## Impact

- `src/model/lexmlEtaConfig.ts`, `src/components/lexml-eta.component.ts` (`isJustificacaoObrigatoria()`), `demo/components/demoview.ts`.
- `docs/api-componente-lexml-eta.md` (descrição de `pendenciasPreenchimento` e tabela de config).
- Testes: `test/componente/lexml-eta/lexml-eta.component.test.ts` e `lexml-eta-anexo-parecer.test.ts`.
- Sem impacto no formato LexML salvo nem na issue #992 (que depende da pendência de justificação continuar existindo).
