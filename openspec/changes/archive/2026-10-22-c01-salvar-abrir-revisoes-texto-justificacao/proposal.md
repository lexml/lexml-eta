## Why

Desde a #991 a justificação é gravada no arquivo, mas as marcas de revisão de texto ficam de fora (exceção temporária): o texto incluído perde a marca e o texto excluído é descartado, junto com as notas de rodapé que tiver. Quem abre um arquivo salvo perde as revisões e o trecho excluído. A issue #994 grava as marcas com `ins`/`del` do LexML e os dados de autor e data em `lexedit:RevisoesTextuais`, conforme as especificações `09-revisao-de-texto.md`, `12-registro-usuarios.md` e `13-outros-metadados-do-lexedit.md`.

## What Changes

- Ao salvar, cada marca de revisão de texto da justificação é gravada como `ins` ou `del` no ponto do texto, com `id` de prefixo `_rt` único no documento, e ganha um `lexedit:RevisaoTextual` com `refIdRevisao`, `refIdUsuario` e `data` com fuso horário.
- O texto excluído em revisão passa a ser gravado, com as notas de rodapé que tiver. Acaba a exceção temporária da #991 em `salvar-documento-articulado` e na ida e volta de `metadados-lexedit`.
- A marca passa a guardar também o identificador e a sigla do usuário (hoje guarda só o nome), para que `refIdUsuario` aponte para o mesmo usuário das revisões da hierarquia. Marca sem identificador usa o nome, como as revisões da hierarquia.
- `lexedit:Usuarios` passa a reunir, sem repetir, os usuários das revisões da hierarquia e das revisões de texto.
- Enquanto houver marca de revisão de texto na justificação, o arquivo salvo tem a pendência "Resolver marcas de revisão de texto.", entre a de remissões internas inválidas e a de revisões da hierarquia (ordem da especificação 13).
- Ao abrir, as marcas são recriadas no editor da justificação com autor, data e agrupamento, e podem ser aceitas ou rejeitadas. Contador, botões e alerta de revisão refletem o documento aberto. `ins`/`del` sem `RevisaoTextual` correspondente vira marca do usuário "Anônimo" com a data e hora da abertura.
- O nome do cenário "Exceção temporária com nota de rodapé ou revisão de texto", que o MODIFIED da #993 não pôde corrigir, deixa de existir com a exceção.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `salvar-documento-articulado`: o requisito "Revisões de texto na justificação gravada" passa a gravar as marcas; "Registro de usuários das revisões" passa a cobrir as revisões de texto; nova pendência de revisões de texto e nova ordem das pendências.
- `abrir-documento-articulado`: novo requisito para a recuperação das marcas de revisão de texto ao abrir.
- `metadados-lexedit`: "Ida e volta do documento salvo pelo conversor" é substituído por "Ida e volta do documento salvo pelo conversor jsonix-lexml", sem a exceção das revisões de texto e com cenário de marcas (o MODIFIED não remove o cenário da exceção); novo requisito de compatibilidade de `RevisoesTextuais` com o conversor; "Grupo de usuários referenciados" passa a reunir os usuários dos dois tipos de revisão.

## Impact

- `src/model/lexml/documento/conversor/justificacao.ts`: gravação e leitura de `ins`/`del`; fim do descarte de `del`.
- `src/model/lexml/documento/conversor/buildJsonixFromProjetoNorma.ts` e `buildProjetoNormaFromJsonix.ts`: `RevisoesTextuais`, união de `Usuarios` e a pendência.
- `src/components/editor-texto-rico/moduloRevisao.ts` e `editor-texto-rico.component.ts`: identificador e sigla do usuário na marca; atualização do estado de revisão depois de abrir.
- `src/components/lexml-eta.component.ts` (`abrirDocumentoArticulado`).
- Testes unitários do conversor e do componente, integração com o CLI `jsonix-lexml` 2.1.0 e o `lexedit.xsd`, e E2E Cypress com um fixture novo.
- Documentação: `docs/extensao-formato-lexml/09-revisao-de-texto.md`, `plano-xsd-lexedit.md` e `CLAUDE.md`.
- O HTML entregue ao host (`getProposicao().justificativa`) ganha os atributos de identificador e sigla do usuário nas marcas novas; o restante não muda.
