# Proposal

## Why

As revisões da hierarquia (inclusão, exclusão, alteração de texto, movimentação e transformação de tipo de dispositivos em modo de revisão) existem apenas no estado Redux (`state.revisoes`) e em `Proposicao.revisoes`, um JSON do modelo interno persistido pelo host Java. O arquivo `documento-articulado.json` descarta essas revisões: salvar e abrir um documento em revisão perde quem alterou o quê e quando. A especificação `docs/extensao-formato-lexml/11-revisao-da-hierarquia.md` define como registrá-las em `lexedit:RevisoesArticulacao`, e a issue #10 (`docs/extensao-formato-lexml/issues.md`) pede essa persistência. Com o arquivo passando a conter as revisões, `Proposicao.revisoes` deixa de ser enviado ao backend.

## What Changes

- Salvar: serializar as revisões da hierarquia em `lexedit:RevisoesArticulacao/RevisaoArticulacao` (atributos `revisao`, `refIdDispositivo`, `refIdUsuario`, `data`; conteúdo anterior e dispositivos excluídos como filhos), com a articulação já na versão atual.
- Salvar: gravar o registro `lexedit:Usuarios` com os usuários referenciados e a pendência "Resolver marcas de revisão na articulação." enquanto houver revisão não resolvida.
- Abrir: reconstruir `state.revisoes` (e o modo de revisão) a partir do arquivo, de modo que as revisões possam ser aceitas ou rejeitadas como as criadas na sessão. O arquivo prevalece sobre `Proposicao.revisoes`.
- Modelo: `RevisaoElemento` ganha o atributo `revisao` (operações aplicadas, em ordem), mantido por `atualizaRevisao.ts`, para representar revisões combinadas (`movido;3,alterado`) que o modelo atual não distingue.
- **BREAKING (coordenação com o host):** `Proposicao.revisoes` não é mais enviado ao backend Java; a estrutura é mantida em memória. O host Java passa a obter as revisões do arquivo.

Fora do escopo: a operação `alteracaoRotulo` (hoje não há revisão gerada pela renumeração manual em alteração de norma), o "Problema identificado" ao final de `11-revisao-da-hierarquia.md` (desfazer transformação sem excluir dispositivo subsequente), revisões textuais da justificação (issue #8) e comentários.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `salvar-documento-articulado`: serialização das revisões da hierarquia, operações combinadas, ids dos dispositivos excluídos, usuários e pendência.
- `abrir-documento-articulado`: reconstrução das revisões da hierarquia, dos usuários e do modo de revisão ao abrir.
- `metadados-lexedit`: grupo `Usuarios` e ida e volta das revisões da hierarquia pelo conversor `jsonix-lexml`.

## Impact

- `src/model/revisao/revisao.ts` (atributo `revisao`) e `src/redux/elemento/reducer/atualizaRevisao.ts` (manutenção do atributo).
- `src/model/lexml/documento/documentoArticulado.ts`, `conversor/buildJsonixFromProjetoNorma.ts` e `conversor/buildProjetoNormaFromJsonix.ts` (novos grupos em `DadosLexEdit`/`MetadadoLexEdit`, montador e leitor).
- `src/components/lexml-eta.component.ts` e `lexml-eta-proposicao.component.ts` (coleta das revisões ao salvar; aplicação ao abrir depois de `inicializarEdicao`).
- `src/redux/elemento/reducer/aplicaRevisoes.ts` (reuso do caminho existente de aplicação de revisões).
- Contrato com o host: `Proposicao.revisoes` deixa de ser consumido pelo backend Java; `Revisao.type` e demais campos seguem existindo em memória.
- Testes: unitários, integração com o `jsonix-lexml` real e XSD, e E2E Cypress de abertura (`cypress/e2e/revisao/`).
