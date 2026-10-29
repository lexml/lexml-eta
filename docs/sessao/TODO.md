# TODO

Atualizado em 22/10/2026.

## Em andamento

- **#1026 — vocabulário de URN por autoridade e por casa** (OpenSpec `2026-10-19-c02-separar-vocabulario-por-autoridade`, branch `feat/1026-refatorar-vocabulario`). As 30 tarefas estão concluídas e a suíte e o build passam. Falta commitar a documentação simplificada e os `tiposReferenciaveis` do Senado, revisar e arquivar a change (`/opsx:archive`).

- **#997 — salvar e abrir os demais metadados do LexEdit** (OpenSpec `2026-10-29-c01-salvar-abrir-demais-metadados-lexedit`, branch `feat/992-salvar-pendencias-jsonix`, 29/10/2026). Proposta pronta (proposal, delta de `metadados-lexedit`, design D1–D7, tasks em 5 grupos), `openspec validate --strict` ok. Implementada em 29/10/2026: 11/11 tasks, `npm test` completo, integração com o CLI 2.1.0 (cenário novo ok; 2 falhas conhecidas de `OutrosMetadados`, que exigem o 2.3.0) e Cypress `documento-articulado/*` (57/59; as 2 falhas já existem na `develop`). Falta: commit (usuário) e arquivar a change. Decisões do usuário: `substitutivo` fora (retirado do esquema na #1017); `dataUltimaModificacao` = instante do salvamento, lida de forma tolerante e exposta em `dataUltimaModificacaoDocumento` (somente leitura); `aplicacao`/`versaoAplicacao` omitidos.

## Próximas

- Nenhuma pendência desta change. A tela de nova proposição terá outro tíquete e outra change.

## Concluídas

- Vocabulário separado por autoridade (federal, senado, camara, congresso, comum), mesclado por casa e estático.
- Resolução de URN pela autoridade exata, com ou sem sigla.
- PLS, PLC e PDS registrados como inativos no Senado.
- `tiposReferenciaveis` do Senado preenchidos; os da Câmara são calculados.
