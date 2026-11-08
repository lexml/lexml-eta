## Why

Os comentários nos dispositivos da articulação (change `2026-11-08-c01-comentarios-articulacao`) existem só na sessão. Salvar e reabrir o documento os perde, e hoje a leitura descarta de propósito toda sequência cujo `refIdElementoComentado` não seja um trecho `_tc` da justificação (c03). `docs/extensao-formato-lexml/08-comentarios.md` já define o formato: na articulação, o ref é o `id` do próprio dispositivo, e o do caput no caso do artigo.

## What Changes

- Gravar as sequências da articulação no mesmo `lexedit:Comentarios` da justificação, com `refIdElementoComentado` igual ao `id` do dispositivo calculado ao salvar: o do caput para o artigo, e o `id` gravado na revisão de exclusão para dispositivo excluído em revisão. As sequências da articulação vêm primeiro, na ordem do texto. Os autores vão em `Usuarios`, e a pendência é a mesma.
- Gravar também no modo anexo de parecer as sequências da articulação. A justificação continua sem comentários nesse modo.
- Ao abrir, ligar cada sequência ao dispositivo pelo `id`. O caput é resolvido para o artigo, o `id` do próprio artigo também é aceito, e o dispositivo excluído em revisão é ligado depois que as revisões são reconstruídas. A sequência sem dispositivo é descartada, e em duas para o mesmo dispositivo vale a primeira.
- Documentar em `08-comentarios.md` o caso do dispositivo excluído em revisão e as regras de leitura da articulação.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `salvar-documento-articulado`: gravação das sequências da articulação, inclusive no anexo de parecer; o cenário "Modo anexo de parecer" da justificação passa a valer só para os trechos `_tc`.
- `abrir-documento-articulado`: recuperação dos comentários da articulação; a tolerância deixa de descartar todo ref que não seja `_tc` e passa a descartar só o ref sem trecho nem dispositivo.
- `metadados-lexedit`: compatibilidade com o conversor também para refs de dispositivo.

## Impact

- `src/model/lexml/documento/conversor/buildJsonixFromProjetoNorma.ts`: refs da articulação em `montaMetadadoLexEdit`.
- `src/model/lexml/documento/conversor/revisaoArticulacao.ts`: o `id` gravado de cada dispositivo excluído, devolvido pela própria montagem das revisões.
- `src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix.ts`: `lerComentarios` aceita ref de dispositivo.
- `src/components/lexml-eta.component.ts` e `lexml-eta-proposicao.component.ts`: envio das sequências (também no anexo de parecer) e ligação ao abrir, depois da reconstrução das revisões.
- `docs/extensao-formato-lexml/08-comentarios.md`, `CLAUDE.md` (item 24).
- Sem mudança no `lexedit.xsd`.
