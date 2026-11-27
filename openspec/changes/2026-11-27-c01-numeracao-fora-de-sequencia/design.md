# Design

## Context

A numeração repetida (#1066) já tem toda a cadeia que esta mudança reaproveita:

- `numeracaoRepetida.ts` tem duas formas da mesma regra: `isNumeracaoRepetida(d)`, local, usada por `validaNumeracao` para a mensagem do dispositivo, e `getUuidsComNumeracaoRepetida(articulacao)`, numa passada só, usada pela passagem central.
- `sincronizarNumeracaoRepetida` (no `elementoReducer`, depois de cada ação) grava `state.numeracaoRepetida` (só uuids), mantém o alerta e emite `ElementoValidado` para quem entrou ou saiu do conjunto.
- `corrigeNumeracaoRepetida` (`autoFixElemento.ts`) renumera o grupo com `renumeraArtigos`/`renumeraFilhos` e guarda o par antes/depois no histórico com `renumeracaoAutomatica: true`.
- A pendência é montada em `lexml-eta.component.ts` a partir do mesmo estado.

O número de todo tipo de dispositivo fica guardado em arábico, com o complemento separado por hífen (`Art. 3º-A` → `3-1`, `III` → `3`, `Parágrafo único` → `1`). O número principal e a presença de complemento saem da string sem depender do tipo.

Requisitos: ver os deltas em `specs/`. Motivação: ver `proposal.md`.

## Goals / Non-Goals

**Goals:**
- Uma só regra de classificação por grupo, que devolve a irregularidade de cada dispositivo (repetida, complemento, lacuna, fora de ordem), usada tanto pela mensagem local quanto pela passagem central, para que não possam divergir.
- Reaproveitar sem mudança o algoritmo de correção e o histórico.

**Non-Goals:**
- Mudar `renumeraArtigos`/`renumeraFilhos` ou o momento em que a renumeração automática roda.
- Mudar as validações próprias do bloco de alteração (`validaNumeracaoDispositivoAlteracao`).
- Renomear arquivos, a capability ou os testes existentes de numeração repetida.

## Decisions

### D1. Uma classificação por grupo, com duas formas de uso

Uma função pura percorre um grupo na ordem e devolve a irregularidade de cada membro:

```
para cada membro participante, em ordem:
  repetida   -> id igual ao de um anterior (regra atual)          [todo grupo]
  senão, se o grupo é automático e não tem omissis:
    complemento -> numero tem parte após '-'
    lacuna      -> principal > maiorAnterior + 1   (maiorAnterior começa em 0)
    foraDeOrdem -> principal < maiorAnterior + 1
  maiorAnterior = max(maiorAnterior, principal), só para quem não tem complemento
```

- A forma local (`getIrregularidadeNumeracao(d)`) classifica o grupo de `d` e devolve a de `d`. É usada por `validaNumeracao`, que acrescenta a mensagem correspondente.
- A forma em lote (`getIrregularidadesNumeracao(articulacao)`) visita cada grupo uma vez. É usada pela passagem central.
- A repetição continua sendo detectada pelo id, em todo grupo, como hoje. Só os três casos novos dependem de grupo automático.

O membro que é repetido continua atualizando `maiorAnterior`, para que o seguinte não receba uma lacuna falsa. Exemplo: em `1, 2, 3, 2, 4`, o `4` continua sem erro.

**Alternativa considerada:** comparar cada dispositivo com o rótulo que a renumeração produziria pela posição. Foi descartada porque marca a cascata inteira: num documento com uma única lacuna no início, todos os artigos seguintes ganhariam erro.

### D2. Grupo e grupo automático

- **Grupo:** o artigo pertence aos artigos da articulação; os demais tipos, aos irmãos **do mesmo tipo** (agrupadores podem dividir o pai com artigos). Participam os mesmos dispositivos de hoje (sem `Caput`, omissis e pena), e os de `numero` indefinido ficam de fora da sequência (rótulo sem número).
- **Grupo automático:** artigo fora de bloco de alteração; ou, para os demais, `podeRenumerarFilhosAutomaticamente(pai)`, a mesma condição que define a oferta de "Corrigir agora" na repetição. Assim, os três casos novos só aparecem onde a correção existe, e por isso eles sempre oferecem a correção.
- **Omissis:** se algum irmão do grupo é omissis, só a repetição é avaliada nele.

### D3. O estado guarda o tipo, não só o uuid

`state.numeracaoRepetida: number[]` passa a ser `state.numeracaoIrregular`, um mapa de uuid para tipo de irregularidade. A diferença entre o estado anterior e o atual passa a considerar o par (uuid, tipo). Um dispositivo que muda de "repetida" para "fora de ordem" (por exemplo, depois de uma renumeração manual no bloco) precisa ser revalidado, porque a mensagem muda, e com só os uuids isso não seria percebido.

O resto de `sincronizarNumeracaoRepetida` não muda: o alerta é único e os eventos não são emitidos na abertura nem em lote iniciado por `AtualizacaoAlertas`.

### D4. Mensagens e correção

- O `AutoFix` ganha `NUMERACAO_COMPLEMENTO`, `NUMERACAO_LACUNA` e `NUMERACAO_FORA_DE_ORDEM`, com os textos da spec.
- `autoFixElemento` envia qualquer das quatro mensagens para a mesma correção (renomeada para `corrigeNumeracaoIrregular`), antes da guarda `hasFix`, e a checagem de "oferecida" aceita qualquer uma delas com `fix`.
- A correção não muda: `renumeraArtigos`/`renumeraFilhos` já numeram pela posição e sem complemento no grupo automático.

### D5. Alerta e pendência

- `MENSAGEM_NUMERACAO_REPETIDA` passa a ser `MENSAGEM_NUMERACAO_IRREGULAR` ("Existem dispositivos com numeração irregular.").
- O id do alerta passa a `alerta-global-numeracao-irregular`, que é interno ao componente.
- A pendência continua na mesma posição da lista e é lida do mesmo estado (D3). Ao abrir, nenhuma das duas versões do texto é lida.

### D6. Nomes de arquivo

Os arquivos `numeracaoRepetida.ts` e `sincronizarNumeracaoRepetida.ts` mantêm o nome, como a capability; só mudam os símbolos exportados que já não descrevem a regra. Renomear os arquivos tocaria muitos imports e testes sem mudar comportamento.

## Risks / Trade-offs

- **[Mensagens duplicadas no bloco de alteração com pai "Novo"]:** uma lacuna importada ali já recebe "É necessário uma linha pontilhada antes deste dispositivo" e "número menor/maior" da validação do bloco, e agora também o erro de lacuna ou de ordem. → Fica assim nesta mudança (a spec mantém as mensagens do bloco). A situação só nasce de documento importado, e "Corrigir agora" resolve as duas.
- **[Custo da forma local]:** `validaNumeracao` classifica o grupo inteiro a cada dispositivo, um custo quadrático na validação completa ao abrir. → É o mesmo custo de `isNumeracaoRepetida` hoje, e a classificação é aritmética simples. Se aparecer em documentos grandes, a validação ao abrir pode consultar o resultado em lote.
- **[A renumeração automática apaga as irregularidades sem o usuário pedir]:** incluir um artigo renumera todos os artigos e remove os erros do grupo. → É o comportamento de hoje (a spec da repetição já o descreve); o aviso existe para que o usuário veja o problema antes.
- **[Citação em texto puro]:** "art. 3º" no texto importado não acompanha a correção. → Fora do escopo; o erro específico ajuda o usuário a decidir entre mover o dispositivo e corrigir o número.
- **[Texto da pendência no host]:** o `lexeditweb-editor` pode exibir ou comparar o texto antigo. → Avisar na coordenação; o editor não lê nenhum dos dois ao abrir.

## Migration Plan

- Não há migração de dados. Arquivos com a pendência antiga abrem normalmente, porque a pendência é recalculada.
- Coordenação com o `lexeditweb-editor`, junto com a publicação: o texto da pendência mudou, e documentos com complemento, lacuna ou fora de ordem passam a ter alerta e pendência no modo flexível.
- Rollback: reverter a mudança. Nada fica gravado fora do texto da pendência.
