## Context

Ver proposal.md (Why). A issue #1080 traz duas ideias: um indicador que acompanha a rolagem (texto da issue) e uma linha lateral por agrupador com dica ao passar o mouse (imagem da issue). As duas foram comparadas numa maquete interativa com a barra real do editor, em três posições e três larguras (`maquete-indicador-agrupador.html`, nesta pasta). O usuário escolheu primeiro o indicador na barra, depois do botão "Adicionar comentário"; depois de testar essa versão na tela e apresentá-la, trocou para o indicador **flutuante sobre o texto**, só informativo, visível por 3 segundos depois da rolagem e igual em qualquer largura.

Situação atual do código:

- `#lx-eta-box` contém a barra (`#lx-eta-barra-ferramenta`) e o `#lx-eta-editor`, que é o container do Quill: seu conteúdo é apagado e recriado a cada carga (`destroiQuill`/`inicializar`).
- Quem rola é o `.ql-editor` (`overflow-y: auto` do tema snow; `#lx-eta-editor` tem a altura `--heightToolbar`).
- Cada linha do Quill (`EtaContainerTable`) tem `uuid`/`elemento`, mas só conhece o pai imediato; a cadeia de agrupadores vem do modelo (`state.elementoReducer.articulacao`).
- Rótulos de agrupador: `CAPÍTULO II`, `TÍTULO I` (maiúsculas), `Seção I`/`Subseção I` (como no texto, `numeracaoAgrupador.ts`).
- Um bloco de alteração tem a própria `Articulacao` com `pai` definido; subir por `pai` a partir de um dispositivo do bloco passa pelos agrupadores da norma alterada antes de chegar ao artigo hospedeiro.
- O editor rola o `.ql-editor` por código em vários pontos (foco inicial na ementa, `ElementoMarcado`, posicionar cursor, carga de página).

## Goals / Non-Goals

**Goals:**
- Indicador sempre coerente com o topo da área de texto e com os rótulos atuais, sem custo perceptível na rolagem.
- Regra da cadeia numa função pura, testável sem DOM.
- Indicador que não interfere na edição: fora do Quill, sem capturar o mouse, visível só durante e logo depois da rolagem.

**Non-Goals:**
- A linha lateral por agrupador (opção B da maquete), que fica registrada para uma eventual change futura.
- Ir ao agrupador pelo indicador (dica com nomes e clique foram retirados a pedido do usuário).
- Mudança no estado Redux, no formato do arquivo ou na API pública.
- Indicador na justificação.

## Decisions

**1. Cadeia por função pura no modelo.** `getCadeiaAgrupadores(dispositivo): Dispositivo[]` em `src/model/lexml/hierarquia/` sobe por `pai` e guarda, do mais externo ao mais interno, os dispositivos com `isAgrupadorNaoArticulacao` que **não** são de bloco de alteração (`isDispositivoAlteracao`); inclui o próprio dispositivo quando ele é agrupador. Subir por `pai` atravessa a articulação de alteração até o artigo hospedeiro, então o artigo de bloco recebe a cadeia do hospedeiro sem tratamento especial.
- Alternativa descartada: guardar a cadeia no `Elemento`. Exigiria recalcular em todos os reducers estruturais por algo só de exibição.

**2. Dispositivo de referência: a primeira linha cuja base passa do topo do `.ql-editor`.** Percorre as linhas comparando `getBoundingClientRect().bottom` com o topo do `.ql-editor`, para na primeira e busca o dispositivo (`getDispositivoFromElemento`). Linha sem dispositivo no modelo (excluída em revisão) usa a linha anterior que tenha; linhas da parte inicial (epígrafe, ementa, preâmbulo) não têm agrupador, então o indicador some.
- Alternativa descartada: `IntersectionObserver` por linha. Teria de ser refeito a cada criação/remoção de linha e não diz qual linha está no topo sem lógica adicional.

**3. Recalcular na rolagem (agrupado por `requestAnimationFrame`) e depois de cada lote de eventos.** Listener de `scroll` no `.ql-editor`, com no máximo um cálculo por quadro; também no fim de `processarPosLoopEventos`, ao carregar documento ou página e num `ResizeObserver` do `.ql-editor` (redimensionamento e editor que volta a ficar visível). O estado da cadeia só muda quando os uuids ou rótulos mudam.

**4. Marcação fora do Quill.** O `#lx-eta-editor` é envolvido por `div.lx-eta-area-texto` (`position: relative`), e o indicador é um irmão dele, renderizado pelo Lit: não entra no delta, no histórico nem na contagem de posições do Quill e sobrevive à recriação do container. Posição absoluta, `top: 8px`, centralizado (`left: 50%` + `translateX(-50%)`), fundo branco, borda `#ccc`, raio de 20px e sombra, como na maquete. `pointer-events: none`: o clique chega à linha coberta. Os níveis são `span` com a cor de antes (`#1f4f8f`, negrito), separados por "›". `max-width: calc(100% - 24px)` com `flex-wrap`: em qualquer largura todos os níveis aparecem, e a cadeia quebra em mais de uma linha quando não cabe. Sem `aria-live`; `aria-hidden` acompanha a visibilidade.

**5. Visível por 3 segundos depois da rolagem do usuário.** Cada `scroll` do usuário mostra o indicador e reinicia um temporizador de 3 s (`TEMPO_INDICADOR_AGRUPADOR_MS`), que o oculta. Some com transição de opacidade de 0,4 s seguida de `visibility: hidden` (sem transição com `prefers-reduced-motion`). Carregar documento ou página oculta o indicador e cancela o temporizador; uma edição só atualiza a cadeia.
- O evento `scroll` não diz quem rolou. Para que a rolagem por código não exiba o indicador, ela conta como do usuário só se ocorrer até 500 ms depois de `wheel`, `touchmove` ou tecla de navegação (setas ↑/↓, PageUp/PageDown, Home/End) no `.ql-editor`, ou com o ponteiro pressionado na barra de rolagem (`pointerdown` cujo alvo é o próprio `.ql-editor`, até o `pointerup`). A seta que leva o cursor para fora da tela rola o texto e conta como rolagem.
- Alternativa descartada: exibir a cada `scroll`. O foco inicial, a carga de página e o cursor levado a um dispositivo depois de cada ação mostrariam o indicador sem o usuário ter rolado.

## Risks / Trade-offs

- [Custo de percorrer as linhas a cada quadro em documento grande] → a busca para na primeira linha que passa do topo e roda no máximo uma vez por quadro; com paginação o número de linhas por página é limitado.
- [Indicador cobre parte da primeira linha] → só fica visível por 3 s e não captura o mouse.
- [Rolagem por código até 500 ms depois de uma interação conta como do usuário] → no máximo exibe o indicador por 3 s, com a cadeia correta.
- [Rolagem por outro meio não detectado (ex.: barra de rolagem em navegador que não emite `pointerdown` nela)] → a cadeia continua atualizada; só não aparece.
