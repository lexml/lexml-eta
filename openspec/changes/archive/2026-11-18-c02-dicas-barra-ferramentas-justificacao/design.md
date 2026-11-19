# Design

## Context

Ver proposal.md (Why). Fatos que moldam a solução:

- `configureTooltip()` aplica `title` por seletor (`setTitle`), uma vez, logo depois de criar o Quill; seletor que não acha nada é ignorado em silêncio, como o `button.ql-table` atual.
- O Quill troca cada `select` da barra por um `span.ql-picker` com um `span.ql-picker-label` (o que abre o menu) e um `span.ql-picker-options` (os itens). Os dois menus de tabela são `span.ql-picker.ql-table`, na ordem inserir/formatar; o código já usa `querySelectorAll('span.ql-table')[1]` para o de formatar.
- O botão de link só existe no modo justificação, que é o único uso do componente hoje.

## Goals / Non-Goals

**Goals:**
- Dica em todos os botões e rótulos de menu da barra, com um teste que impeça um controle novo sem dica.

**Non-Goals:**
- Dicas dos itens dos menus de tabela (grade de tamanhos e opções de formatação).
- Trocar o `title` nativo por um componente de dica próprio.
- O painel de marcas de revisão, que já tem dicas próprias.

## Decisions

**1. Dica no rótulo do menu.** Nos menus (tabela, alinhamento, estilo) o `title` vai no `.ql-picker-label`. No `span.ql-picker`, ele apareceria também sobre os itens do menu aberto, que estão dentro dele; os itens de alinhamento já têm dica própria.

**2. Menus de tabela pela posição.** Inserir tabela é o primeiro `.ql-picker.ql-table` e formatar tabela o segundo, como já faz `elTableManagerButton`. Não há classe que os distinga.

**3. Teste pela barra inteira.** O teste de componente monta o editor no modo justificação e exige `title` não vazio em todo `button` e `.ql-picker-label` da barra, além dos textos dos três controles da issue.

## Risks / Trade-offs

- [O plugin de tabelas muda a ordem dos menus] → o teste confere os textos de inserir e formatar tabela, e falharia.
