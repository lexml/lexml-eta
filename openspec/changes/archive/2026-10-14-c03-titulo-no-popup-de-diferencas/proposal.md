# Proposal

## Why

O popup "Exibir diferenças", aberto pelo ícone de diferenças da marca de revisão, compara só o texto do dispositivo. Quando o título do dispositivo é adicionado, alterado ou removido em modo de revisão, a marca descreve a mudança ("Título do dispositivo foi alterado"), mas o popup mostra os três cards (antes, diferença, atual) com o mesmo texto, sem nenhuma pista do que mudou. O usuário não consegue ver o título anterior nem a comparação.

## What Changes

- O popup passa a exibir o título do dispositivo acima do texto, em cada um dos três cards: "Texto antes da revisão", "Diferença" e "Texto atual".
- No card "Diferença", o título é comparado com o título anterior da mesma forma que o texto (trechos adicionados e removidos destacados).
- O título aparece sempre que existir em algum dos lados (antes ou atual), mesmo quando só o texto mudou, para dar contexto. Sem título nos dois lados, o popup fica como hoje.
- O lado sem título (título adicionado ou removido) mostra "Sem título" em itálico e cinza; no card "Diferença", título adicionado aparece todo como inserido e título removido todo como removido.
- A aba de revisão do popup passa a existir também quando o texto anterior é vazio, desde que haja revisão do dispositivo ou do título, para não esconder uma mudança de título.
- A aba "Texto original" (texto da norma alterada) não muda: o título não existe na norma vigente.

## Capabilities

### New Capabilities
- `exibir-diferencas-dispositivo`: popup de diferenças de um dispositivo em revisão (abas, cards, comparação do texto e do título anteriores com os atuais). Hoje não há spec para esse comportamento.

### Modified Capabilities

## Impact

- Código: `src/components/editor/exibirDiferencaDialog.ts` (montagem do popup e comparação do título) e `src/components/editor/editor.component.ts#exibirDiferencas` (passa os títulos anterior e atual); a classe `TextoDiff` ganha os campos do título.
- Sem mudança de formato de arquivo, de modelo ou de reducers: o título anterior já está em `elementoAntesRevisao.tituloDispositivo`, inclusive em documento reaberto.
- Testes: unitário do montador do popup e E2E Cypress do popup com título adicionado, alterado e removido.
