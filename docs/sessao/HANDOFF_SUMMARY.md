# Handoff — issue #1026 (vocabulário de URN)

Branch: `feat/1026-refatorar-vocabulario`. Change OpenSpec: `openspec/changes/2026-10-19-c02-separar-vocabulario-por-autoridade/`.

## Como retomar

1. `git pull`, `npm install`.
2. `/opsx:apply 2026-10-19-c02-separar-vocabulario-por-autoridade` e seguir de `tasks.md`. **Próximo: grupo 4** (4.1 a 4.4).
3. Pausar após cada grupo numerado para validação do usuário. Nunca commitar sem pedido explícito; mensagens com sufixo `(#1026)`.

## Estado

- Grupos 1, 2 e 3 concluídos; 8.1 dispensada (decisão registrada em `tasks.md`).
- Modelo e requisitos: `docs/requisitos/vocabulario.md`. Decisões de implementação: `design.md` (D1–D8).
- **O build está quebrado de propósito** em `src/model/lexml/documento/urnUtil.ts` (ainda usa `siglas`/`fakeUrns`/`procurarPorAutoridade`) e em `test/model/documento/vocabulario.caracterizacao.test.ts`. O grupo 4 conserta o `urnUtil.ts`; o grupo 7 reescreve os testes.
- `test/model/documento/vocabulario.lookup.test.ts` descreve o modelo antigo; será reescrito no grupo 7.
- `vocabulario/index.ts` tem `VOCABULARIO = montarVocabulario('SF')` provisório, a ser trocado pelo estado estático (4.1).

## Decisões do usuário (não reabrir)

- `LexmlEtaConfig.casaLegislativaEditor` (`SF` padrão | `CD`) escolhe o vocabulário; `casaLegislativa` segue sendo a casa do documento (admite `CN`).
- `SF` = federal + senado + congresso; `CD` = federal + camara + congresso. Sem `fakeUrns` e sem `siglas`.
- Resolução sempre pela autoridade exata, **sem fallback**; URN não declarada simplesmente não resolve.
- Vocabulário em variável estática (uma instância do componente por página), reinicializado pelo `LexmlEtaComponent` a cada atribuição de `lexmlEtaConfig`, antes de `inicializarEdicao`. Casa ausente ou inválida: `SF` com `console.warn`.
- MPV com autoridade `federal`; PLV com `congresso.nacional`. Duplicatas de `decreto.legislativo`/`resolucao` entre autoridades são mantidas.
- Siglas só em proposições; sigla única entre as ativas. `atalhosUrn` e `eventos` ficam no comum.
- `tiposReferenciaveis` do SF será preenchido pelo usuário depois. Concordância de gênero do preâmbulo e texto padrão de SCD/ECD ficam fora do escopo.
- 9.1 = só `npm run build` e `npm test` (sem lint e sem E2E completo); 8.2 (rodar `abertura-preambulo.cy.ts`) permanece.

## Dicas

- Testes: `npx tsc --noEmitOnError false` e depois `npx wtr out-tsc/test/<arquivo>.js --coverage=false` (o `tsc` não emite com erro de tipo, e o `out-tsc` fica velho).
- Formatação: `npx prettier --write` nos arquivos alterados.
- Os enums `TipoRelacaoSubstitutivo` e `TextoPreambuloPadrao` estão em `vocabulario/tipos.ts`; não usar string literal para esses valores.
