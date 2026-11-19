## Why

↓ e ↑ pulam dispositivos sem texto quando o cursor não está no fim (↓) ou no início (↑) do texto (issue #1072). Com o cursor no meio do texto do Art. 2º e os Arts. 3º e 4º vazios, ↓ leva ao Art. 5º. O usuário espera ir sempre ao dispositivo imediatamente abaixo ou acima.

O editor só trata ↓ no fim do texto e ↑ no início (`onTeclaArrowDown`/`onTeclaArrowUp` em `eta-keyboard.ts`); nas demais posições a tecla fica com o navegador, que procura a linha seguinte com texto editável na mesma posição horizontal. O rótulo e as mensagens não são editáveis, e um texto vazio não alcança aquela posição, então o navegador pula esses dispositivos.

## What Changes

- Com o cursor na última linha do texto na tela, ↓ leva ao dispositivo editável imediatamente abaixo; com o cursor na primeira linha, ↑ leva ao imediatamente acima. O cursor vai à mesma posição horizontal no texto do destino (primeira linha dele para ↓, última para ↑); se o texto do destino não alcança essa posição, vai ao fim dele, e se está vazio, ao início.
- Dentro de um texto com várias linhas na tela, ↓ e ↑ continuam movendo o cursor entre as linhas do mesmo texto, pelo navegador.
- Continuam como hoje: ↓ no fim do texto (início do seguinte), ↑ no início do texto (fim do anterior), o tratamento sobre omissis, o salto das linhas não editáveis (epígrafe, preâmbulo) e Shift+↓/Shift+↑ (seleção).

## Capabilities

### New Capabilities

(nenhuma)

### Modified Capabilities

- `navegacao-cursor-editor`: novo requisito sobre o destino de ↓ e ↑ fora do fim e do início do texto.

## Impact

- `src/util/eta-quill/eta-keyboard.ts` (`onTeclaArrowDown`/`onTeclaArrowUp`): novo caminho para a última/primeira linha visual.
- `cypress/support/eventos-nativos.ts`: teclas ↓ e ↑.
- Sem mudança de API pública nem de formato de arquivo.
