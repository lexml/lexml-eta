# Proposal

## Why

Na `CD`, sigla + número + ano não identificam um substitutivo ou subemenda substitutiva de forma única. Por isso a opção "Texto de outra proposição" da Tela 2 (que pede esses três campos) não serve como fonte de texto inicial: o usuário precisa escolher o documento numa lista devolvida pelo host.

## What Changes

- Na `CD`, quando a espécie for Substitutivo ou Subemenda Substitutiva, a opção "Texto de outra proposição" da Tela 2 deixa de exibir sigla, número, ano, verificação e ementa; **Continuar** leva a uma nova **Tela 2b**.
- A Tela 2b pergunta "Em qual matéria está o documento?" ("Nesta mesma matéria", padrão, ou "Em outra matéria" com sigla/número/ano e **Verificar**) e mostra a lista "Documento de origem" com filtro textual, ícone de inteiro teor, item desabilitado quando o texto estruturado não está disponível e a faixa "Fonte selecionada" com **Trocar**.
- Dois serviços novos do host, obrigatórios apenas na `CD`: listagem de documentos de uma matéria e obtenção do texto por `id` do documento.
- Permanecem como estão: opção "Texto do(a) Projeto de Lei…" da Tela 2, `detail` de conclusão (`texto`), `SF` e demais espécies na `CD`.
- **BREAKING** (coordenação com o host Infoleg Editor, que usa o fluxo da `CD`; o `lexeditweb-editor` usa o do `SF` e não é afetado): com `casaLegislativaEditor = 'CD'`, `ConfigNovaProposicao` passa a exigir `urlDocumentosMateria`/`onListarDocumentos` e `urlTextoDocumento`/`onObterTextoDocumento`.

## Capabilities

### New Capabilities

### Modified Capabilities
- `nova-proposicao`: requisitos "Texto inicial da edição", "Sigla do texto de outra proposição" e de configuração/contrato dos callbacks; novo requisito da Tela 2b.

## Impact

- `src/components/nova-proposicao/` (`nova-proposicao.component.ts`, `urlsNovaProposicao.ts` e novos módulos da Tela 2b).
- API pública do componente e `docs/api-componente-lexml-eta.md`; fake da demo (`demo/server/handlers.mjs`).
- Testes unitários e E2E Cypress de nova proposição.
- Host Infoleg Editor (`CD`): implementar os dois serviços e informar a configuração.
