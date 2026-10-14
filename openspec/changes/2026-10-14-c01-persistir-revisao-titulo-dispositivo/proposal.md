# Proposal

## Why

Em modo de revisão, adicionar, alterar ou remover o título de um dispositivo gera uma revisão `alterado`, mas o arquivo salvo não registra o que mudou no título: a revisão grava só o texto anterior (um `p` solto), que é igual ao texto atual. Ao reabrir, a marca descreve "Texto do dispositivo foi alterado" e rejeitar a revisão não restaura o título, apenas a descarta, sem aviso. A reprodução com salvar e reabrir (adicionar, editar e remover título) confirmou a perda nos três casos.

## What Changes

- Ao salvar uma revisão `alterado` (isolada ou combinada com `movido`, `transformado` ou `alteracaoRotulo`), o estado anterior passa sempre a ser gravado como um dispositivo do mesmo tipo (wrapper) dentro de `RevisaoArticulacao`, com o texto anterior (no `Caput`, quando é artigo) e com o `TituloDispositivo` anterior quando havia título; a ausência de `TituloDispositivo` significa que não havia título. O wrapper não leva `id`. O `p` solto deixa de ser gravado.
- Ao abrir, o wrapper é lido e reconstrói o texto e o título anteriores no snapshot da revisão; a descrição da marca passa a refletir título, texto ou ambos, e rejeitar a revisão restaura o título (inclusive a ausência). Um `p` solto continua aceito na leitura, como "título anterior igual ao atual", por tolerância.
- Nenhuma mudança em `schemas/lexedit.xsd` nem em `lexml-simples.xsd`: o `xsd:choice` de `RevisaoArticulacao` já aceita um dispositivo com `TituloDispositivo`. A convenção é registrada em `docs/extensao-formato-lexml/11-revisao-da-hierarquia.md`.
- Verificação com o conversor real `jsonix-lexml` 2.0.0 e o esquema do LexEdit, nos casos de título adicionado, alterado, removido e com formatação.

Fora do escopo: reconstituir o título anterior em arquivos de desenvolvimento gerados antes desta change (a informação nunca foi gravada; não há arquivos em produção e nenhum outro sistema lê ou grava `RevisaoArticulacao` com `p` solto) e qualquer mudança de esquema.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `salvar-documento-articulado`: "Revisão de alteração de texto" passa a cobrir o título e a gravar o estado anterior sempre como dispositivo; "Revisão de alteração de rótulo" e "Operações combinadas em ordem" deixam de falar em parágrafo filho.
- `abrir-documento-articulado`: a reconstrução das operações de cada revisão passa a ler o título anterior do wrapper, com descrição da marca correta e rejeição que restaura o título.
- `titulo-dispositivo`: a revisão da alteração de título passa a sobreviver a salvar e reabrir.
- `metadados-lexedit`: o conteúdo filho de `RevisaoArticulacao` compatível com o conversor passa a incluir o dispositivo com o título anterior.

## Impact

- Código: `src/model/lexml/documento/conversor/revisaoArticulacao.ts` (escrita), `buildProjetoNormaFromJsonix.ts` (`lerRevisoesArticulacao`), `reconstroiRevisoes.ts`, `src/model/lexml/documento/documentoArticulado.ts` (tipo de `RevisaoArticulacaoLexEdit`), `src/redux/elemento/util/revisaoUtil.ts` (descrição).
- Formato do arquivo: nova convenção para o conteúdo anterior de `RevisaoArticulacao` (sempre um dispositivo); o formato ainda não foi publicado, e a leitura tolera o `p` solto.
- Testes e fixtures: unitários de ida e volta, ajuste dos testes que esperam o `p` solto, fixtures de `demo/doc/` regeneradas por `criarDocumentoArticulado`, integração com o conversor real e E2E Cypress.
- Documentação: `docs/extensao-formato-lexml/11-revisao-da-hierarquia.md` (exemplos de `alterado` e `movido;3,alterado` passam a mostrar o wrapper).
- Coordenação: outras aplicações que leem o formato (como o `lexeditweb`) precisam ser informadas da convenção; quem ignorar o wrapper continua lendo o restante da revisão normalmente.
