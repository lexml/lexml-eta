## Why

Ao criar um artigo de alteração, o editor cria a cabeça do bloco (o artigo da norma alterada) já com o alerta "Numere o dispositivo — Corrigir agora". Ao clicar, aparece o aviso "Nessa situação, não é possível renumerar o dispositivo". O alerta oferece uma correção que o próprio editor recusa: a validação de numeração e a regra que autoriza a renumeração usam critérios independentes e se contradizem justamente na cabeça recém-criada.

## What Changes

- A cabeça de um bloco de alteração com rótulo ainda não informado **pode ser numerada**: "Corrigir agora" abre o diálogo de numeração e o número informado vira o rótulo, sem aviso de erro.
- Passa a valer a coerência **alerta ⇔ ação**: o alerta "Numere o dispositivo" só oferece "Corrigir agora" quando a renumeração está disponível para aquele dispositivo. Os dois usam a mesma regra.
- Dispositivos de alteração marcados como já existentes na norma alterada, com rótulo informado, continuam sem poder ser renumerados (comportamento atual preservado).

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `bloco-alteracao-norma`: numeração da cabeça do bloco de alteração e coerência entre o alerta de numeração e a ação disponível.

## Impact

- Código: `podeRenumerar` (`numeracaoUtil.ts`), validação de numeração de dispositivo de alteração (`numeracaoValidator.ts`), possivelmente `renumeraElemento.ts` e o ponto de entrada em `editor.component.ts` (`renumerarElemento`).
- Sem mudança de formato de arquivo nem de API pública.
- Independente da change `2026-10-14-c01-base-alteracao-por-remissao-externa` (remissão e norma alterada).
