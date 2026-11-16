# Proposal

## Why

Na `CD`, o substitutivo e a subemenda substitutiva sempre pertencem a uma comissão, mesmo quando o destino é o Plenário (regra confirmada com a área de negócio). Hoje, com destino Plenário, a Tela 1 não pede comissão e o resultado não a informa, então o documento da Câmara nasce sem a comissão a que pertence.

## What Changes

- Na `CD`, em Substitutivo e Subemenda substitutiva, a Tela 1 passa a exigir **uma** comissão também quando o destino é Plenário. O seletor de comissão aparece com os dois destinos, e **Continuar** fica desabilitado sem comissão escolhida.
- O `detail` de `nova-proposicao-concluida` e de `dados-basicos-alterados` passa a poder trazer `colegiadoDestino` com `{ tipoColegiado: 'Plenário', siglaComissao }`.
- Trocar o destino entre Plenário e Comissão mantém a comissão escolhida nesses casos.
- A aba "Dados da proposição" exibe o colegiado como "Plenário (CCJC)" quando houver comissão.
- O modo "Alterar dados básicos" lê e preenche a comissão também no destino Plenário.
- Sem mudança: `SF`, Proposição na `CD`, formato do arquivo (`lexedit:ColegiadoApreciador` já grava `siglaComissao` com qualquer tipo), epígrafe (a `CD` não usa sufixo) e local do fecho.
- Sem seleção múltipla: é uma comissão, como no destino Comissão.

## Capabilities

### New Capabilities

### Modified Capabilities
- `nova-proposicao`: requisito "Destino do documento" (comissão obrigatória no Plenário, na `CD` em substitutivo e subemenda substitutiva) e o modo de edição de dados básicos.
- `dados-basicos-proposicao`: exibição do colegiado Plenário com comissão.

## Impact

- `src/components/nova-proposicao/nova-proposicao.component.ts` (validação do destino, seletor de comissão, resultado e modo de edição).
- `src/components/dados-basicos/dados-basicos.component.ts` (texto do colegiado).
- Testes de componente e E2E de nova proposição e de dados básicos.
- Host Infoleg Editor: passa a receber `siglaComissao` com destino Plenário; arquivos antigos da `CD` com Plenário e sem comissão continuam abrindo.
