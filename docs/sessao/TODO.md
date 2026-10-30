# TODO

Atualizado em 29/10/2026.

## Em andamento

- **#1050 — componente de nova proposição** (OpenSpec `2026-10-29-c01-implementar-componente-nova-proposicao`, branch `feat/1050-componente-nova-proposicao`). Grupos 1 a 3 implementados (componente `lexml-nova-proposicao`, backend simulado da demo em `demo/server/` com modal na demo, retirada do formulário de destino); grupo 4 (E2E `cypress/e2e/nova-proposicao/`, 10 casos) passando; `pena.cy.ts` já falhava antes da change. Nada commitado nesta etapa. Depois: revisar, commitar, arquivar a change (`/opsx:archive`) e avisar o `lexeditweb-editor` do BREAKING (ver `docs/migracao-interface-lexml-eta.md`, seção 7).

## Próximas

- Tratamento real do upload de arquivo (DOCX, TXT, LexML) no componente de nova proposição (hoje simulado, outra issue).
- Serviço de epígrafe do vocabulário (#1053): trocar a epígrafe do caso padrão do componente.

## Concluídas

- #1026 — vocabulário de URN por autoridade e por casa (change arquivada).
