## Why

Em proposições longas, com vários títulos, capítulos e seções, o usuário perde a referência de em que parte do texto está: o rótulo do agrupador fica acima, fora da tela, e é preciso rolar de volta para descobri-lo (issue #1080). A issue sugere um indicador discreto que acompanhe a rolagem, como a data fixa no topo de uma conversa do WhatsApp.

## What Changes

- A área do texto articulado ganha um indicador flutuante do agrupador atual, centralizado sobre o topo do texto e fora do conteúdo do Quill.
- O indicador mostra a cadeia de agrupadores do trecho que está no topo da área de texto, com os rótulos como aparecem no texto (ex.: "TÍTULO II › CAPÍTULO II › Seção I"), e muda conforme o usuário rola.
- Ele aparece só quando o usuário rola o texto e some suavemente 3 segundos depois da última rolagem. Não aparece ao abrir o documento, ao trocar de página nem ao editar.
- É só informativo: os níveis não são links e o clique passa para o texto embaixo.
- O indicador fica oculto quando o trecho do topo não está sob nenhum agrupador (ementa, preâmbulo, artigos antes do primeiro agrupador ou texto sem agrupadores). Agrupadores de bloco de alteração (texto da norma alterada) não entram na cadeia.
- Mostra todos os níveis em qualquer largura, inclusive no celular, quebrando a linha quando não couber.
- A opção da linha lateral (imagem da issue) fica fora do escopo; a maquete com as opções está registrada no design.

## Capabilities

### New Capabilities

- `indicador-agrupador-atual`: indicador flutuante, sobre a área do texto articulado, da cadeia de agrupadores do trecho exibido no topo, exibido por alguns segundos depois da rolagem.

### Modified Capabilities

(nenhuma)

## Impact

- `src/components/editor/editor.component.ts` (marcação fora do container do Quill, cálculo na rolagem e após eventos do estado, exibição temporária) e `src/assets/css/editor.css.ts` (estilos).
- Função pura nova para montar a cadeia de agrupadores de um dispositivo, em `src/model/lexml/hierarquia/`.
- Testes: unitário da função, teste de componente e E2E Cypress.
- Sem mudança no estado Redux, no formato do arquivo nem na API pública; sem coordenação com o `lexeditweb-editor`.
