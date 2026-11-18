## Why

Com o cursor no início do texto de um dispositivo, o Enter cria um dispositivo vazio antes do atual, mas deixa o cursor no dispositivo novo e vazio. Com o cursor no meio ou no fim, o cursor vai para o dispositivo seguinte, que tem a continuação do texto. A diferença confunde o usuário (issue #1086): o Enter no início é o caso-limite da divisão do texto e deveria levar o cursor ao dispositivo seguinte, onde o texto ficou.

## What Changes

- O Enter com o cursor no início do texto de um artigo, parágrafo, inciso, alínea ou item continua criando o dispositivo vazio antes do atual, mas passa a deixar o cursor no início do dispositivo que manteve o texto (o seguinte, já renumerado).
- Refazer essa inclusão também deixa o cursor no dispositivo com o texto. Desfazer continua como hoje.
- As opções "Adicionar … antes" do menu não mudam: o cursor continua indo para o dispositivo novo.
- Fora do escopo: Enter no início de agrupador, ementa e omissis, que não criam o dispositivo antes, e a pena, que não aceita Enter fora do fim do texto.

## Capabilities

### New Capabilities

(nenhuma)

### Modified Capabilities

- `navegacao-cursor-editor`: novo requisito sobre a posição do cursor depois do Enter que cria dispositivo.

## Impact

- `src/components/editor/editor.component.ts` (`adicionarElemento`): indica na ação que o Enter foi no início do texto.
- `src/redux/elemento/reducer/adicionaElemento.ts`: com essa indicação, emite `ElementoMarcado` com o dispositivo atual primeiro.
- Desfazer/refazer (`undo.ts`, `redo.ts`) leem a ordem de `ElementoMarcado` gravada no histórico; o design confirma que o resultado é o esperado sem alterá-los.
- Sem mudança de API pública nem de formato de arquivo.
