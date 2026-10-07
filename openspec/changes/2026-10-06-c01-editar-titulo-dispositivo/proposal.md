## Why

O título de dispositivo (ex.: o título de um artigo na MPV 1170/2023) já é lido do arquivo LexML, exibido no editor e gravado ao salvar, mas é tratado como somente leitura: o usuário não consegue adicionar, alterar nem remover um título. A issue lexml/lexml-eta#1010 pede essa edição para que o texto articulado possa ser elaborado por completo no editor.

## What Changes

- Novas ações de menu de contexto, por dispositivo: **Adicionar título** (quando não há título), **Editar título** e **Remover título** (quando há). Aplicam-se a Artigo, Parágrafo, Inciso, Alínea e Item, inclusive dentro de bloco de alteração.
- O título também pode ser editado clicando nele, como já ocorre com a nota de alteração "(NR)".
- A edição acontece em um diálogo modal com um mini-editor de texto rico restrito às formatações `i`, `u`, `sub` e `sup`; qualquer outra tag é removida automaticamente (inclusive no reducer, como defesa).
- Título **não** admite remissão (interna ou externa): links são reduzidos a texto na sanitização.
- Validação apenas informativa, sem bloquear: mensagem quando o título está vazio ("Não foi informado um texto para o título do <tipo de dispositivo>.") e quando não começa com letra maiúscula.
- Undo/redo: cada operação de título é um passo atômico do histórico e restaura o título anterior ao desfazer.
- Revisão: com o modo de revisão ativo, alterar, adicionar ou remover o título gera revisão de modificação, com descrição própria; aceitar/rejeitar a revisão e desfazer/refazer restauram o título.
- Renderização: a linha do editor passa a criar, atualizar e remover o título dinamicamente, sem exigir que o título já exista na criação da linha.

## Capabilities

### New Capabilities
- `titulo-dispositivo`: edição (adicionar, alterar, remover) do título de Artigo, Parágrafo, Inciso, Alínea e Item, com formatação restrita, validação informativa, undo/redo, revisão e suporte em bloco de alteração.

### Modified Capabilities
<!-- Nenhuma: salvar/abrir já preservam o título e nenhuma spec existente o menciona. -->

## Impact

- **Modelo/Redux**: nova action `atualizarTituloDispositivoAction` e reducer correspondente; ajustes em `undoRedoReducerUtil` (`processarModificados`) e na rejeição de revisão (`rejeitaRevisao`).
- **Revisão**: `atualizaRevisao.ts` (comparação de duplicidade, descrição própria) e `revisaoUtil.ts`.
- **Regras de menu**: `regrasArtigo`, `regrasParagrafo`, `regrasInciso`, `regrasAlinea`, `regrasItem`.
- **Validação**: `dispositivoValidator` ganha a checagem de título (nível aviso).
- **UI**: novo diálogo de edição de título em `src/components/editor/`, `editor.component.ts` (evento/menu), `EtaBlotTituloDispositivo` e `EtaContainerTable` (ciclo de vida do blot do título), CSS.
- **Serialização**: nenhuma mudança de formato (já grava e lê `tituloDispositivo`); apenas testes adicionais com título formatado e em bloco de alteração.
- **Testes**: unitários dos reducers/validador/sanitização, e E2E Cypress (viabilidade a avaliar em `docs/guia-cypress.md`, ver tasks).
- **Fora de escopo**: remissão no título; título para agrupadores; mudança no formato LexML.
