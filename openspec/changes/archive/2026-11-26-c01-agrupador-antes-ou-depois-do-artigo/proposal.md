## Why

A partir de um artigo, o editor só cria agrupador (Título, Capítulo, Seção e outros) **antes** dele: o menu diz "Adicionar Título, Capítulo, Seção e outros antes" e o modal esconde o "Posicionamento" (issue #1078). Para abrir um capítulo depois do último artigo, o usuário precisa criar um artigo a mais e o agrupador antes dele. A partir de um agrupador, o mesmo modal já oferece Antes e Depois.

## What Changes

- No artigo, o menu passa a ter o mesmo nome do agrupador: "Adicionar Título, Capítulo, Seção e outros".
- O modal aberto a partir de artigo passa a ser o mesmo do agrupador, com o "Posicionamento" (Antes/Depois). No artigo, "Antes" vem marcado, o comportamento de hoje; no agrupador continua "Depois".
- "Depois" cria o agrupador depois do artigo (e de seus dispositivos), e leva para ele os artigos seguintes que hoje iriam com "Antes" do artigo seguinte; depois do último artigo, o agrupador nasce vazio.
- Desfazer e refazer passam a restaurar, no mesmo lugar e sem mover dispositivos, um agrupador sem dispositivo depois dele: refazer a inclusão de um agrupador no fim do documento lançava `TypeError`, e desfazer a remoção de um agrupador vazio que era o último filho do seu pai o recriava antes do dispositivo anterior, levando-o para dentro.
- No bloco de alteração, a regra do "Manter no mesmo grupo de aspas" do artigo não muda e vale para as duas posições.

## Capabilities

### New Capabilities

- `agrupador-artigo`: inclusão de agrupador de artigo (Parte a Subseção) a partir de artigo, agrupador ou ementa, com a escolha do tipo e da posição, e a restauração do agrupador pelo desfazer e pelo refazer.

### Modified Capabilities

(nenhuma)

## Impact

- `src/model/lexml/regras/regrasArtigo.ts`, `src/model/lexml/acao/adicionarAgrupadorArtigoAction.ts` e `src/model/lexml/acao/index.ts` (a ação "antes" deixa de existir).
- `src/components/editor/adicionarAgrupadorArtigoDialog.ts`.
- `src/redux/elemento/reducer/undo.ts`, `redo.ts`, `removeElemento.ts` e `src/redux/elemento/util/undoRedoReducerUtil.ts`.
- Testes: reducer e regras em `test/redux/agrupa/`, E2E em `cypress/e2e/agrupador/`.
- Sem mudança de API pública nem de formato de arquivo.
