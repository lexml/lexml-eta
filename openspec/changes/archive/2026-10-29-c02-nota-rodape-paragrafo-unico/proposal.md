# Proposal

## Why

O LexML guarda cada nota de rodapé como `NotaDeRodape` inline, sem parágrafos. Desde a #993, uma nota com mais de um parágrafo é gravada num só, com os parágrafos unidos por espaço, e a quebra se perde ao reabrir (especificação 07). Mesmo assim, o editor da nota ainda deixa o usuário criar parágrafos, o que leva a um resultado diferente do que ele vê. A issue #1030 pede que a edição aceite um só parágrafo, para que a tela corresponda ao que é gravado.

## What Changes

- No modal de edição da nota de rodapé, Enter e Shift+Enter não criam parágrafo. A tecla é ignorada e o modal mostra o aviso "A nota de rodapé admite um só parágrafo.".
- Texto colado ou inserido com quebras de linha entra num só parágrafo, com as quebras trocadas por espaço e a formatação permitida preservada (negrito, itálico, sublinhado e link).
- Uma nota que já tem mais de um parágrafo, criada antes ou vinda do host, abre no modal com os parágrafos unidos por espaço, o mesmo critério da gravação. Salvar no modal grava a nota unida, mesmo sem outra alteração.
- A gravação no LexML continua unindo parágrafos por espaço, como defesa para HTML vindo de fora.
- **Fora do escopo** (decisão do usuário): a altura do editor do modal e o `console.log` de `shouldClose` ficam como estão.

## Capabilities

### New Capabilities

- `nota-rodape`: edição da nota de rodapé da justificação no modal, restrita a um só parágrafo.

### Modified Capabilities

Nenhuma. A regra de gravação ("Notas de rodapé na justificação gravada", em `salvar-documento-articulado`) não muda.

## Impact

- **Código:** `src/components/editor-texto-rico/nota-rodape-modal.ts`, que é o único ponto alterado.
- **API e formato:** sem mudança. O host continua recebendo o HTML da nota no atributo `texto`, agora com um só parágrafo nas notas editadas.
- **Testes:** testes de componente do modal com o Quill real e um spec Cypress de edição pela aba "Notas".
- **Documentação:** especificação 07 e `CLAUDE.md`.
