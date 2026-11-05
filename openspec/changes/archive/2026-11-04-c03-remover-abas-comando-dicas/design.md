# Design

## Context

- **Painel da direita** (`lexml-eta.component.ts`, `#tabs-direita`):
  - declara quatro `<sl-tab>` filtrados por `tabIsVisible`, que só deixa passar "Notas" (fora do anexo de parecer) e "Atalhos";
  - monta sempre o painel "Dicas" (`<lexml-eta-ajuda>`), mesmo sem a aba.
- **Barra do editor** (`editor.component.ts`): em telas de até 768px, os botões `.mobile-buttons` abrem "Dicas" (`lexml-eta-ajuda-modal`) e "Atalhos" (`lexml-eta-atalhos-modal`). O CSS `.btn-dicas` esconde o primeiro abaixo de 398px.
- **Componentes de dicas:** `lexml-eta-ajuda` só é usado pelo painel e pelo modal, e `lexml-eta-ajuda-modal` só pela barra. Os dois são exportados em `src/index.ts`.
- **`exibirAjuda`:** é uma `@property` sem nenhum leitor.

A motivação está em `proposal.md`, e o requisito, em `specs/interface-lexml-eta`.

## Goals / Non-Goals

**Goals:**

- Não sobrar nenhuma referência a "Comando", "Dicas" ou ao componente de dicas em `src`, `test`, `cypress` e na documentação da API.
- Manter "Notas" e "Atalhos" exatamente como estão.

**Non-Goals:**

- Mudar os atalhos (`lexml-eta-atalhos`, `lexml-eta-atalhos-modal`) ou o comportamento das abas que ficam.
- Reaproveitar o conteúdo das dicas em outro lugar.

## Decisions

### D1. `tabIsVisible` continua, só com "Notas" e "Atalhos"

O método também decide "Notas" no modo anexo de parecer. Ele fica, e as abas removidas saem do template, sem nenhuma condição no lugar.

- **Alternativa descartada:** eliminar `tabIsVisible` e escrever as condições direto no template. Mudaria mais do que a issue pede.

### D2. Remover os arquivos dos componentes de dicas

`ajuda.component.ts` e `ajuda.modal.component.ts` saem do projeto, junto das exportações e do `@query`/import em `editor.component.ts`.

O `rollup` da distribuição parte de `src/index.ts`, então basta a exportação sair. A verificação de que nada mais os importa é o `tsc`, mais um `grep` final.

Achado ao implementar: `scripts/validate-package.mjs` (último passo do `prepublish`) compara as exportações, os tipos e as tags registradas com listas fixas.

- Além das entradas de dicas, as listas já estavam desatualizadas pela #1050 e anteriores, e o `prepublish` falhava na `develop`.
- Com a autorização do usuário, elas foram alinhadas ao `src/index.ts` e a `registros-entrypoint.test.ts`:
  - saíram `DestinoComponent`, `LexmlEtaParametrosEdicao` e `lexml-eta-destino`;
  - entraram `NovaProposicaoComponent`, `AutocompleteListaComponent`, `lexml-nova-proposicao`, `lexml-eta-autocomplete-lista` e quatro tipos da nova proposição.

### D3. O botão "Atalhos" fica sozinho na barra

Sai o botão "Dicas" e o CSS `.btn-dicas`. O `.mobile-buttons` e o botão "Atalhos" ficam como estão.

O CSS já ocultava o último botão (`.mobile-button:last-child`, que é o "Atalhos") até 640 px. O comportamento do "Atalhos" não muda: ele aparece entre 641 e 768 px.

Achado ao implementar: entre 399 e 640 px, antes só aparecia o "Dicas", e agora a barra fica sem botões nessa faixa. Isso é consequência direta da remoção decidida, e a spec registra o cenário.

### D4. Testes

- **Componente:** confere que o painel da direita tem só "Notas" e "Atalhos" (e só "Atalhos" no anexo de parecer), que não há painel "dicas" nem `lexml-eta-ajuda`, e que a barra tem só o botão "Atalhos".
- **`registros-entrypoint`:** perde as duas tags.
- **E2E:** confere as abas da direita na nova proposição e, com `cy.viewport` estreito, a barra só com "Atalhos". É viável: a regra é de CSS (`max-width: 768px`), e as abas estão no light DOM do componente.

## Risks / Trade-offs

- **[Risco]** O host usa `exibirAjuda` ou as classes exportadas. → **Mitigação:** a propriedade nunca teve efeito, e atribuí-la a um elemento não dá erro. A importação das classes quebraria a compilação do host, então o aviso entra na coordenação com o `lexeditweb-editor`.
- **[Trade-off]** O conteúdo das dicas deixa de existir também em telas estreitas. Foi uma decisão do usuário.
