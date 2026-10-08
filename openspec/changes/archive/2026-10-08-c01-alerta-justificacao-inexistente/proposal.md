## Why

A aba Avisos deveria sinalizar, enquanto o usuário edita, que a proposição não tem justificação, com o mesmo texto da pendência registrada ao salvar ("Não foi informado um texto de justificação."). Hoje o alerta existe, mas com outro texto ("A proposição não possui uma justificação"). Ele não aparece ao abrir o documento e não some quando o usuário digita a justificação, porque o editor da justificação não avisa o componente raiz de que o texto mudou. Só uma edição na articulação reavalia o alerta. É a issue #1011, modelada no comportamento do lexml-emenda.

## What Changes

- O alerta de justificação da aba Avisos passa a usar o texto "Não foi informado um texto de justificação.", igual ao da pendência de preenchimento. Continua sendo um alerta crítico que o usuário não pode fechar.
- O alerta passa a seguir a mesma condição da pendência: justificação obrigatória e sem texto. Hoje o alerta e a pendência usam verificações de vazio diferentes.
- Ao terminar a inicialização da edição, o alerta é reavaliado de forma explícita, tanto para documento novo quanto para documento aberto. Com isso, ele já aparece ao abrir quando a justificação está vazia.
- O editor da justificação passa a emitir `onchange` 1 segundo depois da última alteração no texto, como no lexml-emenda. O alerta some ao preencher a justificação e volta ao esvaziá-la. Edições na articulação continuam reavaliando o alerta.
- Quando a justificação não é obrigatória (anexo de parecer ou `justificacaoObrigatoria = false`), o alerta nunca aparece. O comportamento atual se mantém.

## Capabilities

### New Capabilities

- `pendencias-proposicao`: condições do documento que impedem o protocolamento da proposição, sinalizadas ao usuário na aba Avisos durante a edição. Nesta change, só a justificação não informada. As próximas pendências (remissões inválidas, marcas de revisão, gravação em `lexedit:Pendencias` na #992) podem crescer aqui.

### Modified Capabilities

(nenhuma)

## Impact

- Código: `src/components/lexml-eta.component.ts` (texto e condição do alerta, reavaliação ao fim de `inicializarEdicao`) e `src/components/editor-texto-rico/editor-texto-rico.component.ts` (emissão de `onchange` com espera de 1s).
- Comportamento externo: o evento `onchange`, que já atravessa o Shadow DOM (`bubbles`/`composed`), passa a ser disparado também por edições na justificação. Quem integra o componente (`lexeditweb-editor`) passa a recebê-lo nesse caso.
- UX: um documento novo, ou aberto de arquivo, passa a abrir com o contador de Avisos em 1 enquanto a justificação estiver vazia. Isso inclui todo documento aberto de `documento-articulado.json` até a #991, que é quando a justificação passa a ser gravada.
- Testes: unitários do componente raiz (`test/componente/lexml-eta/lexml-eta.component.test.ts`) e um novo spec Cypress.
- Fora do escopo: gravar a pendência em `lexedit:Pendencias` (#992) e salvar e abrir a justificação (#991).
