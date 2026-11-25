## Why

Os botões de navegação entre dispositivos revisados não deixam claro quando servem (issue #1097). Ficam sempre habilitados, inclusive com o modo de revisão desligado, quando não há marca para onde ir e o clique não faz nada ("parece que não estão funcionando"). Também falam em "dispositivo alterado", quando o que percorrem são as marcas de revisão, e ficam longe da chave "Marcas de revisão", junto dos botões de formatação.

## What Changes

- Com o modo de revisão desligado, os botões "Ir para o próximo dispositivo revisado" e "Ir para o dispositivo revisado anterior" ficam desabilitados, em cinza e com o cursor de seta; com o modo ligado, ficam habilitados.
- Os tooltips passam de "dispositivo alterado" a "dispositivo revisado".
- Os dois botões passam para o lado direito da barra do texto articulado, logo à esquerda da chave "Marcas de revisão".
- A navegação em si não muda.

## Capabilities

### New Capabilities

(nenhuma)

### Modified Capabilities

- `navegacao-dispositivos-alterados`: requisito novo "Botões de navegação entre dispositivos revisados" (nomes, posição e habilitação) e o requisito existente passa a falar em dispositivos revisados.

## Impact

- `src/components/editor/editor.component.ts` (estado do modo de revisão, `disabled`, tooltips e agrupador dos botões com a chave).
- `src/assets/css/editor.css.ts` (cinza dos botões desabilitados e agrupador à direita).
- Testes: componente e E2E novos; os testes da #1096 (`navegacao-dispositivos-alterados`) e da #1098 (cursor dos botões desabilitados) rodam de novo.
- Sem mudança de API pública nem de formato de arquivo. Em telas de até 768px os botões continuam ocultos.
