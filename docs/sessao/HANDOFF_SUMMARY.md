# Handoff — issue #1026 (vocabulário de URN)

Branch: `feat/1026-refatorar-vocabulario`. Change OpenSpec: `openspec/changes/2026-10-19-c02-separar-vocabulario-por-autoridade/`.

## Como retomar

1. `git pull`, `npm install`.
2. Revisar os commits da branch e arquivar a change com `/opsx:archive`.
3. Nunca commitar sem pedido explícito; mensagens com sufixo `(#1026)`.

## Estado

- As 30 tarefas de `tasks.md` estão concluídas; `npm run build` e a suíte de testes passam.
- Modelo e requisitos: `docs/requisitos/vocabulario.md`. Decisões de implementação: `design.md` (D1–D8). Invariantes: item 16 do `CLAUDE.md`.
- Código: `src/model/lexml/documento/vocabulario/` (dados por autoridade, `mesclarVocabulario.ts`, `montarVocabulario.ts`, `consultasVocabulario.ts`, estado estático em `index.ts`); resolução de URN em `urnUtil.ts`.
- Pendente de commit: documentação simplificada e `tiposReferenciaveis` do Senado.

## Decisões do usuário (não reabrir)

- `LexmlEtaConfig.casaLegislativaEditor` (`SF` padrão | `CD`) escolhe o vocabulário; `casaLegislativa` segue sendo a casa do documento (admite `CN`).
- `SF` = federal + senado + congresso; `CD` = federal + camara + congresso.
- Resolução pela autoridade exata, sem fallback entre autoridades. O tipo da URN vale com ou sem sigla; sem sigla resolve para o tipo ativo da mesma autoridade.
- Vocabulário em variável estática, reinicializado a cada atribuição de `lexmlEtaConfig`. Casa ausente ou inválida: `SF` com `console.warn`.
- MPV com autoridade `federal`; PLV com `congresso.nacional`.
- PRC, SCD e ECD não existem mais e não entram no vocabulário; Senado e Câmara não precisam ter tipos correspondentes.
- Senado: PLS, PLC e PDS inativos; `tiposReferenciaveis` de PL (pl, pls, plc), PLP (plp, pls, plc), PDL e PRS. Os da Câmara são calculados.
- A tela de nova proposição fica para outro tíquete e outra change. Os hosts (`lexeditweb-editor`, Infoleg Editor) não precisam ser avisados agora.

## Dicas

- Testes: `Remove-Item out-tsc -Recurse -Force; npx tsc`, depois `npx wtr <arquivos .js de out-tsc/test>`. O `out-tsc` velho esconde arquivos renomeados.
- Nos testes o vocabulário é global: chame `inicializarVocabulario(casa)` e restaure `'SF'` ao final.
