## Why

Com a #991 a justificação passou a ser gravada no arquivo, mas as notas de rodapé são retiradas ao salvar (exceção temporária). Quem abre um arquivo salvo perde as notas da justificação. A issue #993 grava as notas com o elemento `NotaDeRodape` do LexML, conforme a especificação `docs/extensao-formato-lexml/07-notas-de-rodape.md`.

## What Changes

- Ao salvar, cada nota de rodapé da justificação é gravada como `NotaDeRodape` no ponto exato do texto em que está a referência, com o texto da nota inline (negrito, itálico, sublinhado e link). O número e o identificador interno da nota não são gravados.
- Uma nota com mais de um parágrafo é gravada num só, com os parágrafos unidos por um espaço (decisão do usuário, seguindo o "segundo momento" da especificação 07). A quebra de parágrafo da nota não volta ao abrir.
- Ao abrir, as notas são recriadas no editor da justificação, numeradas pela ordem em que aparecem no texto, e a aba "Notas" passa a listar as notas do arquivo aberto.
- A exceção temporária da #991 deixa de valer para notas de rodapé e continua só para as revisões de texto (`ins`/`del`, issue #994).
- A especificação 07 é complementada com o tratamento de parágrafos e a posição das notas dentro de tabelas e listas.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `salvar-documento-articulado`: o requisito "Notas de rodapé e revisões na justificação gravada" passa a cobrir só as revisões; novo requisito para a gravação das notas de rodapé.
- `abrir-documento-articulado`: novo requisito para a recuperação das notas de rodapé ao abrir.
- `metadados-lexedit`: o requisito "Ida e volta do documento salvo pelo conversor" deixa de ter a exceção para notas de rodapé e ganha cenário de ida e volta com notas.

## Impact

- `src/model/lexml/documento/conversor/justificacao.ts`: gravação e leitura de `NotaDeRodape`.
- `src/components/lexml-eta.component.ts` (`abrirDocumentoArticulado`): lista de notas passada ao editor e à aba "Notas".
- Testes unitários do conversor, de componente, de integração com o CLI `jsonix-lexml` 2.0.0 e o `lexedit.xsd`, e E2E Cypress com um fixture novo.
- Documentação: `docs/extensao-formato-lexml/07-notas-de-rodape.md`, `plano-xsd-lexedit.md` e `CLAUDE.md`.
- Nenhuma mudança no HTML entregue ao host (`getProposicao().justificativa` e `notasRodape`).
