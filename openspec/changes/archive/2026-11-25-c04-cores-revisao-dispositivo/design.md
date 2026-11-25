## Context

Ver proposal.md (Why).

- Referência (`lexml-emenda`, `src/assets/css/editor.css.ts`): `.dispositivo--adicionado { color: green }`, `.dispositivo--modificado { color: blue }`, `.dispositivo--suprimido { color: red }` (e o texto riscado), aplicadas à linha e ao rótulo conforme a situação do dispositivo.
- Marca da linha revisada no lexml-eta: `EtaContainerTable.atualizarAtributoRevisao` (chamado ao criar a linha e em `atualizarAtributos`, a cada atualização do elemento) grava `em-revisao="true"` (fundo `var(--sl-color-blue-100)`) e, quando `revisao.stateType === 'ElementoRemovido'`, `excluido="true"` (texto riscado); sem revisão, tira os dois. Cobre incluir, alterar, excluir, aceitar, rejeitar, desfazer e a abertura de arquivo.
- Tipo da revisão: `RevisaoElemento.revisao` guarda as operações (`adicionado`, `excluido`, `alterado`, `movido;<n>`, `transformado;<tipo>`, `alteracaoRotulo;<id>`), lidas por `getOperacoesRevisao`. A descrição da marca (`buildDescricaoPorOperacoes`) já usa a precedência excluído → adicionado → demais.
- Cores fixas no CSS do editor que não herdariam a da linha: `#lx-eta-editor .ql-editor` (`#646260`, texto), `.texto__rotulo` (`black`) e `.titulo-dispositivo` (`#000`).
- As classes de situação herdadas do emenda ficaram fixas: toda linha e todo rótulo recebem `dispositivo--adicionado`, e a regra de cor está comentada.

## Goals / Non-Goals

**Goals:**
- Letra verde, azul ou vermelha no dispositivo revisado, conforme inclusão, alteração ou exclusão, com as cores do emenda.

**Non-Goals:**
- Mudar o fundo das linhas revisadas, o riscado do excluído ou as marcas de revisão de texto da justificação.
- Reativar ou remover as classes de situação herdadas (`dispositivo--adicionado`).

## Decisions

**1. Classificação pura, pelas operações, com a precedência da descrição.** `getTipoRevisaoElemento(revisao)` (`revisaoUtil.ts`) devolve `exclusao` se há `excluido`, `inclusao` se há `adicionado`, e `alteracao` nos demais; sem operações, usa o `stateType` (`ElementoRemovido` → exclusão, `ElementoIncluido` → inclusão, demais → alteração). Mesma precedência de `buildDescricaoPorOperacoes`, para a cor nunca contradizer a descrição.
- Movido e transformado são alteração (decisão do usuário): o dispositivo não é novo.

**2. Um atributo próprio na linha, gravado em `atualizarAtributoRevisao`.** `tipo-revisao="inclusao|alteracao|exclusao"` ao lado de `em-revisao`, tirado junto com ele. O CSS colore a linha e, explicitamente, `.texto__rotulo` e `.titulo-dispositivo`.
- Alternativa descartada: reaproveitar as classes `dispositivo--*` do emenda. A `dispositivo--adicionado` já vai em toda linha e todo rótulo, sem efeito; reativá-la coloriria o documento inteiro.

## Risks / Trade-offs

- [Cor de partes com cor própria dentro da linha] → mensagens, selo "Novo/Existente", menu, botões da marca e links mantêm as próprias regras, mais específicas ou do próprio componente; conferido por screenshot.
- [Legibilidade sobre o fundo azul-claro] → verde, azul e vermelho são legíveis sobre `--sl-color-blue-100`; conferido por screenshot.
