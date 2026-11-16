## Why

A issue #972 pede comentários de vários usuários na proposição. A justificação já tem comentários (changes `2026-11-03-c01`, `c02` e `c03`, arquivadas), mas o texto articulado ainda não: quem revisa a proposição não consegue registrar uma observação sobre um dispositivo. O requisito #250358 (demanda #250353) especifica o comportamento, já implementado no lexml-emenda, e `docs/extensao-formato-lexml/08-comentarios.md` define que, na articulação, o comentário se refere ao dispositivo inteiro.

## What Changes

- Botão "Adicionar comentário" na barra de ferramentas do texto articulado, habilitado com um dispositivo selecionado que ainda não tenha comentário. Uma sequência por dispositivo.
- Podem ser comentados todos os dispositivos com identificador, inclusive ementa, preâmbulo, pena, agrupadores e dispositivos de bloco de alteração. Não podem receber comentário novo o omissis e o dispositivo excluído em revisão.
- Ícone de comentário à direita da linha do dispositivo, depois do ícone de diferenças. O clique exibe a aba "Comentários" e destaca a sequência.
- A aba "Comentários" passa a ter uma lista única com as sequências da articulação e da justificação. Cada sequência indica o local ("No texto" ou "Na justificação"). A sequência de dispositivo mostra a identificação dele (ex.: "inciso I do § 2º do art. 3º") no lugar do trecho, e essa identificação acompanha a renumeração. Em "Ordem no texto", a articulação vem antes da justificação.
- Telas pequenas, como no lexml-emenda: botão "Comentários" na barra do texto articulado (até 768px), e o ícone do dispositivo abre o modal da lista até 992px, estendendo os requisitos "Sequência atual ao trocar de aba" e "Comentários em telas pequenas" (change `2026-11-11-c01`).
- O visual do botão, do ícone, do card e do modal segue o lexml-emenda (comparação em `relatorio.md`).
- Sincronização entre o cursor e a aba: cursor num dispositivo comentado destaca a sequência, e clicar na sequência posiciona o cursor no dispositivo.
- Excluir o dispositivo remove a sequência, e desfazer não a recria. Um dispositivo excluído em revisão mantém o comentário até a revisão ser aceita.
- A aba "Comentários" passa a existir também no modo anexo de parecer, só com os comentários da articulação. O alerta e a pendência de comentários continuam os mesmos.
- Gravar e abrir os comentários da articulação no arquivo fica para a change `2026-11-08-c02-salvar-abrir-comentarios-articulacao`.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `comentarios`: requisitos "Sequência atual ao trocar de aba" e "Comentários em telas pequenas" estendidos à articulação; comentários sobre dispositivos da articulação (adicionar, indicador na linha, identificação, sincronização com o cursor, exclusão com o dispositivo e em revisão); aba também no anexo de parecer; local e ordenação na lista única.

## Impact

- `src/components/editor/editor.component.ts`: botão na barra, ícone nas linhas, eventos de seleção e de clique no ícone.
- `src/util/eta-quill/`: blot do ícone de comentário em `EtaContainerOpcoes`/`EtaContainerRevisao`, contêiner só com o comentário e clique sem mover o cursor (`eta-quill.ts`).
- `src/assets/css/editor.css.ts`: CSS do botão, do ícone e dos botões de telas pequenas, vindo do lexml-emenda.
- `src/components/lexml-eta.component.ts`: sequências com a âncora no dispositivo, reconciliação com as remoções, aba no anexo de parecer.
- `src/components/comentarios/`: local, identificação do dispositivo e ordenação da lista única.
- `src/model/comentario/`: âncora da sequência (justificação ou dispositivo).
- `src/model/remissao/lexmlIdUtil.ts`: reaproveitamento de `textoCanonicoDoDispositivo` para a identificação.
- O host (`lexeditweb-editor`) não muda: comentários não entram na proposição entregue a ele.
