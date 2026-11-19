## Why

Nem todos os controles da barra de ferramentas da justificação mostram dica (tooltip) ao passar o mouse (issue #1091): inserir link, inserir tabela e formatar tabela não têm. Sem a dica, o usuário não sabe o que os ícones fazem.

As dicas vêm do atributo `title`, aplicado por `configureTooltip()` (`editor-texto-rico.component.ts`) depois de criar o Quill. O link não tem entrada na lista, e a entrada `button.ql-table` não acha nada: as duas ferramentas de tabela são menus suspensos (`span.ql-picker.ql-table`), não botões. A leitura do código mostrou mais dois controles sem dica, fora da issue: o rótulo do menu de alinhamento (só as opções têm dica) e o seletor de estilo do parágrafo ("Texto normal").

## What Changes

- Inserir link ganha a dica "Inserir link"; os menus de tabela, "Inserir tabela" e "Formatar tabela", no rótulo do menu (não nos itens abertos).
- O rótulo do menu de alinhamento ganha "Alinhamento" e o seletor de estilo, "Estilo do parágrafo".
- A entrada `button.ql-table`, que não acha nenhum elemento, sai da lista.
- Todo botão e rótulo de menu da barra passa a ter dica, garantido por teste que percorre a barra inteira.

## Capabilities

### New Capabilities

- `barra-ferramentas-justificacao`: dicas dos controles da barra de ferramentas do editor da justificação.

### Modified Capabilities

(nenhuma)

## Impact

- `src/components/editor-texto-rico/editor-texto-rico.component.ts` (`configureTooltip`).
- Teste de componente novo e E2E na aba Justificação.
- Sem mudança de API pública nem de formato de arquivo.
