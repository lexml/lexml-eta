# Design

## Context

Ver proposal.md (Why). Fatos que moldam a solução:

- `removerLinhaQuill` trata o evento `ElementoRemovido` para qualquer exclusão (menu, teclado, desfazer). Depois de remover as linhas, lê a seleção do Quill e leva o cursor ao início do texto da linha em `range.index - 1`, com `setSelection(..., SILENT)` e `marcarLinhaAtual`.
- `marcarLinhaAtual` só marca linha editável (#1037), então, com a linha anterior não editável, a marcação é ignorada e a linha atual fica sendo a removida.
- `EtaKeyboard.linhaEditavel(linha, direcao)` já procura a próxima linha editável, mas é privado do teclado.

## Goals / Non-Goals

**Goals:**
- O cursor nunca fica numa linha não editável depois de uma exclusão.

**Non-Goals:**
- Mudar o destino quando a linha anterior é editável (dispositivo acima, inclusive a ementa quando não há preâmbulo).
- A exclusão de agrupador, que já marca o primeiro filho por `ElementoMarcado` depois deste ponto.

## Decisions

**1. Corrigir em `removerLinhaQuill`, não no reducer.** O reducer não decide a linha do cursor na exclusão; quem decide é o editor, por posição. A regra "linha não editável não recebe cursor" já é do editor (#1037).

**2. Próxima linha editável a partir da anterior.** Se a linha em `range.index - 1` não é editável, avança por `next` até a primeira editável e usa o início do texto dela. Um laço local de poucas linhas, em vez de expor `linhaEditavel` do teclado, que é privado e tem outra responsabilidade.
- Alternativa descartada: ir para a linha editável acima (ementa). Tira o usuário da articulação, onde ele estava (opção B da análise).

## Risks / Trade-offs

- [Não há linha editável abaixo] → não acontece na exclusão de artigo (o único artigo não pode ser excluído); por garantia, sem linha editável o código mantém o comportamento atual.
