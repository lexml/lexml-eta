# Proposal

## Why

O contrato da lista de documentos da Tela 2b (CD) está sendo fechado com a área de negócio antes de o host Infoleg Editor consumi-lo. O campo `urlInteiroTeor` é obrigatório e promete um "inteiro teor", mas nem todo documento tem um endereço desse tipo, e a lista não mostra a ementa, que ajuda o usuário a escolher o documento de origem.

## What Changes

- **BREAKING** (só no contrato ainda não consumido pelo host): `DocumentoMateria.urlInteiroTeor` é renomeado para `urlDocumento` e passa a ser **opcional**. Sem ele, a linha não mostra o ícone.
- `DocumentoMateria` ganha `ementa?: string`, exibida abaixo do título, limitada a 2 linhas, com o texto completo ao passar o mouse. Sem ementa, a linha não muda. O filtro da lista passa a incluir a ementa.
- `DocumentoMateria` ganha `tooltipDocumento?: string`, o texto do tooltip do ícone. Sem ele (ou vazio), o texto é "Abrir o documento em outra aba". O mesmo texto vale para o `aria-label`.
- Os textos fixos que citam "inteiro teor" passam a falar em "documento".
- O mock da demo, os testes, a documentação e as specs acompanham.

## Capabilities

### New Capabilities

### Modified Capabilities
- `nova-proposicao`: requisitos "Apresentação e filtro dos documentos da lista", "Filtro dos documentos da lista" e "Objeto documento da Tela 2b".

## Impact

- `src/components/nova-proposicao/` (`urlsNovaProposicao.ts`, `documentosMateria.ts`, `nova-proposicao.component.ts`).
- `demo/server/dados/documentos-materia.json` e `handlers.test.mjs`.
- `docs/api-componente-lexml-eta.md` e `openspec/specs/nova-proposicao/spec.md`.
- Testes de componente, unitários e E2E da Tela 2b.
- Host Infoleg Editor: usar `urlDocumento` no lugar de `urlInteiroTeor`; se já tiver implementado o serviço com o nome antigo, a renomeação o quebra.
