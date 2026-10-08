## Context

O alerta `alerta-global-justificativa` já existe em `src/components/lexml-eta.component.ts` (`buildAlertaJustificativa`/`disparaAlerta`). Hoje ele tem quatro problemas:

- **Texto diferente da pendência.** Usa "A proposição não possui uma justificação", enquanto `getPendenciasPreenchimento` grava "Não foi informado um texto de justificação.".
- **Verificação de vazio diferente.** O alerta usa `_lexmlJustificativa.isEditorVazio()`, que percorre o delta do Quill e chama `insert.trim()`. Esse método quebra com um embed, como uma imagem, e não trata o editor da mesma forma que a pendência. A pendência usa `isHtmlSemTexto(justificativa)`.
- **Não é avaliado ao abrir.** `onChange()` é o único caminho até o alerta. `inicializarEdicao` chama `limparAlertas()` e nunca o reavalia. Também não há nenhum evento ao abrir que o dispare, porque o `setContent` do editor de texto rico é totalmente `'silent'`: tanto o `setContents` quanto o `formatLine` usam essa origem.
- **Não reage à justificação.** O `updateTexto` do editor de texto rico (ligado ao `text-change` do Quill) não emite `onchange`. No lexml-emenda, a mesma função chama `agendarEmissaoEventoOnChange()`, que emite o evento com espera de 1s. Os campos `onChange` (Observable) e `timerOnChange` sobraram dessa versão e estão sem uso no lexml-eta.

O modelo é o lexml-emenda (`D:\Projetos\lexml-emenda`). Lá o alerta também depende de "a emenda já tem comando", e essa condição não tem equivalente numa proposição.

## Goals / Non-Goals

**Goals:**

- Uma única condição, a "justificação não informada", decide o alerta e a pendência.
- O alerta fica correto logo ao terminar `inicializarEdicao` e se mantém correto durante a edição da justificação e da articulação.

**Non-Goals:**

- Mudar `getPendenciasPreenchimento` além de fazê-lo usar a condição compartilhada. As `mensagensCritical` continuam como estão.
- Mudar a visualização da aba Avisos (`lexml-eta-alertas`) ou o contador.
- Reproduzir no lexml-eta a condição "tem comando" do lexml-emenda.

## Decisions

### D1. Uma condição compartilhada, baseada no HTML da justificação

Criar no componente raiz o método privado `isJustificacaoNaoInformada(justificativa)`, que retorna `isJustificacaoObrigatoria() && isHtmlSemTexto(justificativa)`. Os dois pontos chamam esse método: `buildAlertaJustificativa` passa `this._lexmlJustificativa.texto`, e `getPendenciasPreenchimento` passa `proposicao.justificativa`, que é o mesmo `_lexmlJustificativa.texto` atribuído em `getProposicao`. Assim, as duas verificações aplicam a mesma regra sobre o mesmo valor. O texto vai como parâmetro, e não é lido de dentro do método, porque a pendência é calculada sobre a proposição montada para salvar.

- **Por que `texto` e não o Quill:** `texto` é atualizado de forma síncrona por `setContent` (ao abrir) e por `updateTexto` (a cada alteração). É também o mesmo valor que vai para a pendência e, depois da #991, para o arquivo.
- **Alternativa descartada:** manter `isEditorVazio()`. Ela diverge de `isHtmlSemTexto` e quebra com embed. `isEditorVazio` continua existindo, porque é um método público do editor, mas deixa de ser usado pelo alerta.

### D2. Reavaliação explícita no fim de `inicializarEdicao`

Chamar `buildAlertaJustificativa()` logo depois de `this._lexmlEta!.inicializarEdicao(...)`, dentro do `try`. Essa chamada já é a última depois das limpezas de alerta (`setProposicao`/`resetaProposicao`/`limparAlertas`), conforme o comentário do invariante da remissão inválida. Se a reavaliação viesse antes, o alerta seria apagado no mesmo ciclo, que foi o bug encontrado na change `2026-09-16-c01`.

- **Alternativa descartada:** depender do `onchange` emitido ao carregar o texto, que é o comportamento implícito do lexml-emenda via `format('align')`. No lexml-eta o carregamento é `'silent'` e não emite nada. Mesmo que emitisse, o alerta só apareceria 1s depois e ficaria dependente de um efeito colateral de formatação.
- **Precisa ser verificado ao implementar:** se `_lexmlEta.inicializarEdicao` não limpa alertas de forma assíncrona depois de retornar. Hoje o alerta de remissão inválida sobrevive nesse ponto, o que indica que não limpa.

### D3. `onchange` com espera de 1s no editor de texto rico, como no lexml-emenda

Reintroduzir `agendarEmissaoEventoOnChange()` no `editor-texto-rico.component.ts`, reaproveitando `timerOnChange`/`onChange`. A função faz `clearTimeout` e um `setTimeout` de 1000 ms que despacha `CustomEvent('onchange', { bubbles: true, composed: true, detail: { origemEvento: this.registroEvento } })` e chama `this.onChange.notify(this.registroEvento)`. Ela é chamada em `updateTexto`. O timer é cancelado em `disconnectedCallback`, junto do `off('text-change')`. O `@onchange=${this.onChange}` do componente raiz já está ligado ao editor da justificação, então não muda nada lá.

- **Sem filtro por `source`:** como no lexml-emenda, qualquer `text-change` conta, incluindo aceitar ou rejeitar revisão e a barra de ferramentas. O carregamento não conta, porque é `'silent'`.
- **`updateNotasRodape` fica de fora:** no lexml-emenda essa chamada está comentada, e nota de rodapé não altera se a justificação tem texto.
- **Alternativa descartada:** reavaliar o alerta direto no `updateTexto`, via Observable, sem emitir `onchange`. Evitaria a mudança no evento público, mas ficaria diferente do lexml-emenda, e o `lexeditweb-editor` já trata `onchange` dos outros formulários (autoria, data, destino, impressão) como sinal de edição.

### D4. Corrigir o atributo `registro-evento` no template

O componente raiz passa `registroEvento="justificativa"`, mas a propriedade declara `attribute: 'registro-evento'`. Hoje `origemEvento` chega vazio. Como o evento passa a ser emitido para fora, trocar para `registro-evento="justificativa"` faz o `detail.origemEvento` trazer `'justificativa'`, como no lexml-emenda.

### D5. Texto do alerta

`disparaAlerta` passa a usar "Não foi informado um texto de justificação.". O `id`, o `tipo` (`TipoMensagem.CRITICAL`) e `podeFechar: false` não mudam. O reducer `adicionarAlerta` já ignora um alerta cujo id já está na lista (`src/redux/elemento/reducer/adicionarAlerta.ts`), então reavaliar várias vezes não duplica o alerta.

## Risks / Trade-offs

- [O `lexeditweb-editor` passa a receber `onchange` ao editar a justificação] → É o comportamento esperado (edição real) e o mesmo do lexml-emenda. Registrar em `docs/sessao/TODO.md` como ponto de coordenação com o outro repositório, assim como foi feito com `lexmlEtaConfig`.
- [Todo documento aberto de `documento-articulado.json` abre com o alerta até a #991, porque a justificação ainda não é gravada] → É consequente com a regra, já que a pendência também é gravada. Fica documentado no proposal.
- [Specs Cypress que esperam zero alertas ou um único `sl-alert`] → Os specs atuais usam `contain.text` sobre os `sl-alert`, e o alerta extra não os quebra. Rodar as suítes `documento-articulado` e `remissao-interna/abertura-*` para confirmar.
- [Espera de 1s faz testes depender de tempo] → Usar `sinon.useFakeTimers` nos unitários. No Cypress, usar a espera implícita do `should`, que é de 4s por padrão, sem `cy.wait` fixo.
