## Context

Ver proposal.md (Why). Situação atual:

- Botões (`editor.component.ts`, barra `#lx-eta-barra-ferramenta`): dois `button.button-navegacao-marca`, logo depois de desfazer e refazer, sem `disabled`, com os títulos "Ir para o próximo dispositivo alterado" e "Ir para o dispositivo alterado anterior"; o clique despacha `navegarEntreElementosAlteradosAction` a partir da linha atual.
- Modo de revisão: `elementoReducer.emRevisao`. É ligado e desligado pela chave (`ativaDesativaRevisao`, eventos `RevisaoAtivada`/`RevisaoDesativada`), ligado sem evento próprio ao abrir um arquivo com revisões (`aplicaRevisoes`) e desligado no reset do documento. Não se desliga o modo com marcas pendentes ("É necessário resolver todas as marcas de revisão…"), então com o modo desligado a articulação não tem marca para onde navegar.
- Barra: flex com quebra de linha; a chave (`lexml-eta-switch-revisao.revisao-container`) vai para a direita pelo `margin-left: auto` de `.revisao-container`. Os testes acham a chave por seletor de descendente (`lexml-eta-proposicao-editor lexml-eta-switch-revisao.revisao-container`).
- Aparência de desabilitado: a regra geral da #1098 dá o cursor de seta (`#lx-eta-box .ql-snow.ql-toolbar button:disabled`); o "Adicionar comentário" desabilitado usa `color: #b9b9b9; opacity: 0.65`, também no `:hover`. Sem isso, o `:hover` do Quill pinta o ícone de azul.

## Goals / Non-Goals

**Goals:**
- Botões desabilitados, em cinza e com seta, com o modo de revisão desligado.
- Tooltips com "dispositivo revisado".
- Botões logo à esquerda da chave, no lado direito da barra.

**Non-Goals:**
- Mudar a ordem ou o destino da navegação (#1096).
- Desabilitar com o modo ligado e sem marcas (decisão do usuário: só o modo decide).
- Botões em telas de até 768px (continuam ocultos).

## Decisions

**1. A habilitação acompanha `emRevisao` no `stateChanged`.** O editor guarda `emRevisao` num `@state` a cada atualização do store, antes de qualquer outra coisa, e os botões recebem `?disabled` a partir dele. Cobre a chave, a abertura com revisões e o reset, sem depender de eventos.
- Alternativa descartada: reagir só a `RevisaoAtivada`/`RevisaoDesativada`. A abertura com revisões liga o modo sem esses eventos.

**2. O cinza reaproveita a regra do comentário desabilitado.** Os seletores dos botões de navegação desabilitados (inclusive `:hover`) entram na mesma regra de `.button-comentario-articulacao:disabled`, para os dois terem a mesma aparência.

**3. Um agrupador à direita com os botões e a chave.** Os dois botões passam para dentro de um elemento que também contém a chave, alinhado à direita (`margin-left: auto`). Os seletores de teste da chave continuam valendo.
- Alternativa descartada: mover os botões para antes da chave e passar o `margin-left: auto` para o primeiro botão. Dependeria da ordem dos irmãos na barra, que também recebe o seletor de paginação por `insertAdjacentElement`.

## Risks / Trade-offs

- [Teste que clique nos botões sem ligar a revisão] → o E2E da #1096 já liga (`cy.ativarRevisaoDispositivo()`); rodar de novo.
- [Teste da #1098 que desabilita cada botão à força e restaura] → continua valendo: mede o cursor de cada botão no estado desabilitado; rodar de novo.
- [Barra estreita] → com quebra de linha, o agrupador desce inteiro, e os botões ficam junto da chave.
