# Proposal

## Why

As abas "Comando" e "Dicas" deixaram de aparecer no painel da direita (issue #1049), mas o código delas ficou. Sobraram:

- as abas e o painel "Dicas", que ainda é montado sem nunca ser exibido;
- o componente de dicas e o seu modal;
- o botão "Dicas" das telas estreitas;
- uma propriedade pública (`exibirAjuda`) que não faz nada.

Esse código morto confunde quem mantém o editor e quem o integra, e ainda carrega para o host uma API sem efeito.

## What Changes

- Remover de `lexml-eta.component.ts`:
  - as abas "Comando" e "Dicas";
  - o painel "Dicas";
  - o filtro que as escondia (`tabIsVisible`), que passa a conhecer só "Notas" e "Atalhos".
- Remover o botão "Dicas" da barra do editor em telas estreitas, com o modal e o CSS dele. O botão "Atalhos" continua.
- Remover os componentes `lexml-eta-ajuda` e `lexml-eta-ajuda-modal`.
- **BREAKING:** remover as exportações públicas `AjudaComponent` e `AjudaModalComponent` e a propriedade `exibirAjuda` de `<lexml-eta>`. A propriedade já não tinha efeito; um host que ainda a atribua não recebe erro.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `interface-lexml-eta`: passa a definir as abas de apoio do painel da direita (só "Notas" e "Atalhos") e os botões da barra em telas estreitas (só "Atalhos").

## Impact

- **Código:**
  - `src/components/lexml-eta.component.ts`;
  - `src/components/editor/editor.component.ts`;
  - `src/assets/css/editor.css.ts`;
  - `src/index.ts`;
  - remoção de `src/components/ajuda/ajuda.component.ts` e `ajuda.modal.component.ts`.
- **Testes:**
  - `test/integracao/registros-entrypoint.test.ts`;
  - novo teste de componente das abas e da barra;
  - E2E das abas da direita.
- **Documentação:** `docs/api-componente-lexml-eta.md`.
- **Host (`lexeditweb-editor`):** deixar de atribuir `exibirAjuda` e de importar `AjudaComponent`/`AjudaModalComponent`, se fizer isso.
