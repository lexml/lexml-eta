## Context

Ver `proposal.md` (Why). Causa identificada por leitura do código (confirmar com teste, task 1.1):

- `adicionaElemento.ts` marca toda cabeça de alteração com `existeNaNormaAlterada = true` (ela designa um artigo que já existe na norma alterada) e cria o rótulo genérico, que dispara o alerta de numeração.
- `validaNumeracaoDispositivoAlteracao` emite `AutoFix.RENUMERAR_DISPOSITIVO` com `fix: true` quando o rótulo termina com o tipo, **sem consultar** se a renumeração é permitida.
- `podeRenumerar` (`numeracaoUtil.ts`) nega a renumeração de qualquer dispositivo de alteração com `existeNaNormaAlterada = true`. O "Corrigir agora" chama `renumerarElemento()` (`editor.component.ts`), que consulta `podeRenumerar` e exibe o aviso.
- Há um bloco comentado em `podeRenumerar` com uma regra anterior, mais permissiva.

## Goals / Non-Goals

**Goals:**
- Permitir numerar a cabeça de alteração com rótulo pendente.
- Garantir que o alerta só ofereça a correção quando ela funciona.

**Non-Goals:**
- Não alterar a renumeração de dispositivos de alteração já numerados e marcados como existentes na norma.
- Não alterar a numeração automática dos demais dispositivos.
- Não alterar a norma alterada nem remissões (change `2026-10-14-c01-base-alteracao-por-remissao-externa`).

## Decisions

**D1. A cabeça com rótulo pendente é numerável (opção a).**
O usuário precisa informar qual artigo da norma está sendo alterado ("Art. 5º"); sem isso a cabeça não tem identidade. A regra de `podeRenumerar` passa a admitir a renumeração de dispositivo de alteração com rótulo pendente mesmo com `existeNaNormaAlterada = true`; com rótulo já informado e `existeNaNormaAlterada = true`, continua negando.
**Decisão confirmada em 19/10/2026** pelo responsável pela change, após exploração do código: segue-se a opção (a). O assistente de alteração já cria a cabeça numerada, mas o menu "Adicionar alteração de norma" a cria sem número, e esse fluxo precisa de um caminho para numerá-la.
Alternativa (b): não emitir `fix` no alerta quando a renumeração não é permitida. Elimina a contradição, mas deixa a cabeça sem caminho para ser numerada. Só se aplicaria se a confirmação indicar que a cabeça nunca deve ser numerada à mão.

**D2. Uma única regra para alerta e ação.**
O validador passa a decidir `fix` com o mesmo critério de `podeRenumerar` (função compartilhada, sem duplicar a condição). Assim a invariante "alerta com correção ⇒ ação disponível" vale por construção, também para dispositivos filhos de alteração com `existeNaNormaAlterada = true` e rótulo pendente, que sofrem do mesmo conflito.
O validador é puro e não recebe o `Elemento`; o critério será expresso sobre o `Dispositivo` (rótulo pendente, tipo, `existeNaNormaAlterada`), e `podeRenumerar` passa a chamá-lo.

**D3. Viabilidade dos E2E (task 3.1).**
Viáveis, com o mesmo padrão dos specs de `cypress/e2e/alteracao-norma/`: o cursor é posicionado na cabeça por `quill.setSelection` (o clique em "Corrigir agora" e o menu agem na linha do cursor), o diálogo é preenchido pelo valor do `sl-input` e confirmado pelo `onclick` do botão primário. O spec cobre o fluxo completo (alerta, diálogo, rótulo, ausência de erro) e a recusa da renumeração da cabeça já numerada pelo menu; falha sem a correção. O cenário "alerta sem Corrigir agora" não tem caminho na tela (o alerta só existe com rótulo pendente, que agora é sempre numerável), então fica coberto por teste unitário de validação.

## Risks / Trade-offs

- [Liberar numeração de dispositivo existente na norma pode permitir rótulo incoerente] → só vale com rótulo pendente; a validação de rótulo inválido (zero à esquerda, formato) continua no reducer.
- [Mudar o critério pode afetar outros fluxos que usam `existeNaNormaAlterada`] → o campo não é alterado; só a decisão de renumerar muda. Cobrir com testes de reducer e de validação para cabeça, filhos e dispositivos já numerados.
- [Condição de corrida do menu de contexto no editor (`docs/analises/ANALISE_CORRIDA_CLIQUE_MENU_CONTEXTO.md`) pode tornar o E2E instável] → ancorar sincronização conforme `docs/guia-cypress.md`.
