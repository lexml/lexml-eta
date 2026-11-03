# Proposal

## Why

A issue #1019 pede o tratamento do dispositivo "Pena" da técnica legislativa penal (elemento `Pena` do LexML). Hoje o editor não tem nenhum suporte a ele, e uma pena vinda de arquivo ou de texto colado **é descartada em silêncio**: some ao abrir e não volta ao salvar. É uma das pendências registradas em `docs/requisitos/pendencias.md` ("Implementar edição de pena") e no mapa de requisitos (pendência 5, "técnica legislativa penal, essencial").

## What Changes

- **Novo** tipo de dispositivo `Pena`, sempre o **último filho** do seu dono (Caput, Parágrafo, Inciso, Alínea ou Item), com id `<id do pai>_pena`, rótulo variável seguido de " –" e texto editado inline. A pena do artigo pertence ao Caput e aparece entre os incisos do caput e o primeiro parágrafo.
- **Novas** ações: "Adicionar pena, medida administrativa e outros" no menu do dono (no artigo, para o caput), "Remover" e "Alterar rótulo" (pelo menu e pelo clique no rótulo), com modal de rótulo (Pena, Penalidade, Medida Administrativa, Infração, Outro). Ao adicionar, a pena usa o rótulo da primeira pena do documento, se houver; senão abre o modal. O foco vai para o texto da pena.
- **Exibição** da pena em linha própria, abaixo de toda a subárvore do dono, como na lei impressa.
- **Validação** da pena: texto não vazio e inicial **minúscula** (com a exceção de nome próprio). **Diverge do texto da issue**, que pedia maiúscula: as 116 penas de 6 leis analisadas começam com minúscula, inclusive o exemplo XML da própria issue.
- **Nova regra de pontuação**: o dispositivo imediatamente anterior à pena, na ordem de leitura, termina em ":" (exceto omissis), fora e dentro de bloco de alteração. **Diverge do exemplo XML da issue** ("segundo inciso."), mas é o uso de 100% das penas analisadas.
- **Operações existentes** passam a respeitar a pena: incluir filho entra antes dela; nada é movido para depois dela; a pena não se move, não se transforma, não é renumerada e não vira omissis; ela acompanha o dono ao mover, transformar e remover.
- **Teclado**: Enter no fim da pena cria um irmão do dono logo depois dela (na pena do caput, o primeiro parágrafo); Enter no meio do texto da pena não faz nada.
- **Bloco de alteração de norma**: pena com Existente/Novo, caput omissis seguido de pena ("Art. 213. ..... / Pena – ..."), aspas e "(NR)" na linha da pena quando ela é a última; sem pena no artigo que carrega o bloco.
- **Revisão**: adicionar, remover e editar a pena geram as marcas de sempre; a troca de rótulo é uma revisão `alterado`, com o rótulo anterior no estado anterior, descrição própria e rejeição que restaura o rótulo. O estado anterior da pena (texto e rótulo) e a pena excluída em revisão são gravados como `Pena` em `RevisaoArticulacao`, o que exige `lexml:Pena` no `choice` do `lexedit.xsd`.
- **Salvar/abrir**: a pena é gravada no elemento `Pena` (fora de `lXcontainersOmissis`) e lida de volta, com o separador do rótulo normalizado para " –". O colar texto articulado também passa a ler a pena (só o mínimo para não perdê-la).

## Capabilities

### New Capabilities
- `pena-dispositivo`: estrutura, ações, edição, rótulo, validação, pontuação, teclado, interação com as operações existentes, bloco de alteração, revisão, remissão e colar da pena.

### Modified Capabilities
- `salvar-documento-articulado`: gravação da pena na articulação e do rótulo anterior no estado anterior da revisão `alterado`.
- `abrir-documento-articulado`: leitura da pena com normalização do separador do rótulo e reconstrução do rótulo anterior da revisão.
- `bloco-alteracao-norma`: o artigo que carrega o bloco de alteração também não recebe pena própria.
- `paginacao-articulacao`: a pena nunca fica separada da subárvore do seu artigo numa quebra de página.

## Impact

- Modelo: `src/model/lexml/tipo/tipoDispositivo.ts`, `src/model/dispositivo/tipo.ts`, `src/model/lexml/hierarquia/hierarquiaDispositivo.ts`, `hierarquiaArtigo.ts`, `hierarquiaUtil.ts`, numeração (`src/model/lexml/numeracao/`), `src/model/lexml/util/idUtil.ts`, fábrica de dispositivos e regras (`src/model/lexml/regras/`).
- Ações e reducers: nova(s) ação(ões) em `src/model/lexml/acao/`, reducers em `src/redux/elemento/reducer/` (adicionar, remover, alterar rótulo, mover, transformar, colar), revisão (`atualizaRevisao.ts`, `revisaoUtil.ts`, `rejeitaRevisao.ts`).
- Validação: `src/model/lexml/conteudo/conteudoValidator.ts`, `dispositivoValidator.ts`.
- UI: `editor.component.ts`, novo diálogo de rótulo (no molde de `editarTituloDispositivoDialog.ts`), `eta-keyboard.ts`, blots/containers do Quill.
- Conversão: `buildJsonixFromProjetoNorma.ts`, `buildProjetoNormaFromJsonix.ts`, `buildDispositivoFromJsonix.ts`, `revisaoArticulacao.ts`, `reconstroiRevisoes.ts`.
- Dependência externa: o CLI `jsonix-lexml` 2.1.0 converte `Pena` em ida e volta (verificado na 1.1), **mas descarta sem erro `Pena` como filho direto de `RevisaoArticulacao`**. As revisões `alterado` e `excluido` de pena só sobrevivem ao salvamento com o `jsonix-lexml` 2.2.0 (`lexml:Pena` no `choice` de `RevisaoArticulacao`, já em `schemas/lexedit.xsd`) e com o CLI atualizado no `lexeditweb-editor`. Até lá, essas revisões se perdem em silêncio ao salvar.
- Comunicação: comentar na issue #1019 as duas divergências (minúscula e ":").
