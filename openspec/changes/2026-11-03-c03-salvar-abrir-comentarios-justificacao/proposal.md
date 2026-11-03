## Why

Com a c02, os comentários na justificação existem só durante a sessão: salvar e reabrir o documento os perde. O formato LexEdit já prevê o grupo `lexedit:Comentarios` (`docs/extensao-formato-lexml/08-comentarios.md`, `schemas/lexedit.xsd`), ainda marcado como "Não implementado". Esta change grava e lê os comentários da justificação no arquivo (#972, atividade Redmine #268613).

## What Changes

- Ao salvar, cada trecho comentado da justificação é gravado como `span` com `id` de prefixo `_tc`, e cada sequência como `lexedit:SequenciaComentario`, com os comentários (autor em `refIdUsuario`, data com fuso e texto em parágrafos).
- Trecho comentado em vários fragmentos (dividido por parágrafos ou por marcas de revisão) recebe ids `_tc<id>_<n>`, únicos no documento, e a sequência referencia o primeiro fragmento. A regra é registrada em `08-comentarios.md`.
- Os autores dos comentários entram em `lexedit:Usuarios`, junto com os das revisões.
- A pendência "Remover comentários." é gravada no arquivo enquanto houver comentário, entre a de remissões internas inválidas e a de revisões de texto.
- Ao abrir, os trechos e as sequências voltam ao editor e à aba "Comentários", com autor e data; `span` `_tc` sem sequência vira texto comum, e sequência sem trecho na justificação é descartada.
- Sequências que referenciam dispositivos da articulação são ignoradas ao abrir até a change dos comentários na articulação.

## Capabilities

### New Capabilities

(nenhuma)

### Modified Capabilities

- `salvar-documento-articulado`: gravação dos trechos comentados e das sequências, pendência de comentários e nova ordem das pendências.
- `abrir-documento-articulado`: recuperação dos trechos comentados e das sequências ao abrir.
- `metadados-lexedit`: autores dos comentários em `Usuarios` e ida e volta de `Comentarios` pelo conversor `jsonix-lexml`.

A capability `comentarios` (criada pela c02, ainda não arquivada) não recebe delta: salvar e abrir ficam nas capabilities de arquivo, como nas revisões de texto e nas notas de rodapé.

## Impact

- `src/model/lexml/documento/conversor/justificacao.ts`: montagem do `span` `_tc` na mesma varredura das revisões de texto e leitura de volta para a marcação do editor.
- `buildJsonixFromProjetoNorma.ts` (`montaMetadadoLexEdit`, `montaUsuarios`) e `buildProjetoNormaFromJsonix.ts` (`lerMetadadoLexEdit`): grupo `Comentarios`.
- `documentoArticulado.ts` (`DadosLexEdit`): sequências ao salvar e lidas ao abrir.
- `lexml-eta.component.ts`: envio das sequências em `getDocumentoArticulado` e aplicação em `abrirDocumentoArticulado`.
- Documentação do formato: `08-comentarios.md` e a tabela de `00-especificacao-esquema-lexedit.md`.
- Depende da c02 (`2026-11-03-c02-comentarios-justificacao`). Sem mudança no `lexedit.xsd`, que já tem o grupo.
