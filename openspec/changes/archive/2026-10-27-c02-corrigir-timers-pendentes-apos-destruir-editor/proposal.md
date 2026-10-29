# Proposal

## Why

A change `2026-10-27-c01-selecionar-ementa-inicializacao-proposicao` passou a chamar `quill.marcarLinhaAtual()` no foco inicial do editor. Essa chamada agenda dois timers (`scrollToElemento` e `Observable.notify`, 1 ms) que disparam depois que o componente já foi destruído, o que acontece nos testes de componente que montam e desmontam o `lexml-eta` logo após carregar. O resultado são erros não capturados (`reading 'linhaAtual'` e `reading 'getBoundingClientRect'`) que derrubam hooks `beforeEach` e produziram 65 falhas no Lote 1 do `npm test`. O defeito de fundo já existia: `Observable.notify` só checa o cancelamento da inscrição no momento do agendamento, não na execução do callback.

## What Changes

- `Observable.notify` passa a reavaliar `isCanceled()` dentro do `setTimeout`, de modo que uma inscrição cancelada depois do agendamento não execute o callback.
- `EtaQuill.scrollToElemento` passa a obter o elemento dentro do timeout e a sair sem erro quando ele não existe mais (editor destruído ou linha removida).
- `EditorComponent.elementoSelecionado` ignora a chamada quando o Quill já foi destruído.
- Testes de regressão: unitário do `Observable` e de componente (montar e destruir o editor imediatamente após o carregamento, sem erro não capturado).

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `foco-inicial-editor`: novo requisito de tolerância a destruição do editor com rotinas assíncronas de seleção e rolagem pendentes.

## Impact

- Código: `src/util/observable.ts`, `src/util/eta-quill/eta-quill.ts`, `src/components/editor/editor.component.ts`.
- Testes: `test/util/` (Observable) e `test/componente/` (montagem e destruição do editor); validação com `npm test` completo e avaliação de E2E.
- Sem mudança de API pública nem de formato de arquivo. O `Observable` é compartilhado por vários módulos; a mudança só afeta callbacks de inscrições já canceladas.
