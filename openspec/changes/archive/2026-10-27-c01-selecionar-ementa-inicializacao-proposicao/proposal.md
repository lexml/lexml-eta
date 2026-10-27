# Proposal

## Why

Ao iniciar uma nova proposição ou carregar um documento articulado no editor, o cursor físico é posicionado na ementa, mas a linha da ementa não é efetivamente marcada como selecionada (`_linhaAtual` permanece indefinida e a borda verde com a alça de controle não é renderizada). Nesse estado inválido, o usuário consegue digitar, mas o texto não entra no estado do componente e ocorrem erros de `TypeError` no console decorrentes do acesso a propriedades de `linhaAtual` indefinida em `eta-keyboard.ts`.

É necessário que, ao carregar a proposição, a ementa inicie com o cursor e com a linha devidamente marcada/selecionada no componente e no editor.

## What Changes

- No carregamento inicial do editor (`editor.component.ts`), após posicionar o cursor de texto na ementa via `setSelection(..., SILENT)`, aciona explicitamente `marcarLinhaAtual(el)` na linha da ementa, ativando visualmente o container (borda verde e alça), definindo `_linhaAtual` e notificando a seleção para a aplicação/Redux.
- Preserva a proteção existente que impede roubo de cursor caso o usuário já tenha interagido ou selecionado outro dispositivo antes da execução assíncrona do foco inicial.
- Adiciona proteção defensiva com optional chaining em `eta-keyboard.ts` para evitar `TypeError` caso eventos de teclado sejam recebidos em situações transitórias onde `linhaAtual` esteja indefinida.

## Capabilities

### New Capabilities
- `foco-inicial-editor`: define o comportamento de seleção e foco inicial do primeiro dispositivo editável (ementa) ao carregar uma proposição ou documento articulado no editor.

### Modified Capabilities
<!-- Nenhuma capability existente tem requisitos alterados. -->

## Impact

- Afeta `src/components/editor/editor.component.ts` no método de renderização da articulação (rotina assíncrona de foco inicial).
- Afeta `src/util/eta-quill/eta-keyboard.ts` para navegação segura contra `undefined`.
- Não afeta contratos públicos da API nem quebra compatibilidade com consumidores do host.
