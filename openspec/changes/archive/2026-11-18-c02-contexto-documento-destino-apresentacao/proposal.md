# Proposal

## Why

O contexto do documento (`ContextoDocumento`), entregue ao host na importação de arquivo e na listagem da Tela 2b, deveria reunir tudo o que o usuário informa na Tela 1, mas leva só a espécie e a identificação (URN, sigla e documento referenciado). Ficam de fora o **Destino** (Plenário ou Comissão e a comissão escolhida) e a **Forma de apresentação** ("Este documento será apresentado em parecer"). O host pode precisar deles, por exemplo para filtrar os documentos de uma comissão ou tratar de outra forma um texto que será anexo de parecer, e hoje só os recebe no fim do fluxo.

## What Changes

- `ContextoDocumento` ganha `colegiadoDestino` (`{ tipoColegiado, siglaComissao? }`) e `anexoParecer` (`boolean`), com os mesmos valores que o resultado (`nova-proposicao-concluida`) teria naquele momento, inclusive a comissão no destino Plenário em substitutivo e subemenda substitutiva da `CD`.
- `urlImportacaoArquivo` e `urlDocumentosMateria` aceitam os novos placeholders opcionais `{tipoColegiado}` (`Plenário` ou `Comissão`), `{siglaComissao}` (vazio sem comissão) e `{anexoParecer}` (`true` ou `false`). Uma URL sem esses placeholders não muda.
- Como a lista da Tela 2b já depende do contexto inteiro, trocar o destino, a comissão ou a forma de apresentação na Tela 1 passa a recarregar a lista ao voltar à Tela 2b, descartando a seleção.
- A ementa não entra no contexto, porque vem da verificação e não é digitada pelo usuário. Os demais campos da identificação já estão no contexto.
- Documentação, demo e testes acompanham. Não é **BREAKING**: o contexto só ganha campos.

## Capabilities

### New Capabilities

### Modified Capabilities
- `nova-proposicao`: novos requisitos "Destino e forma de apresentação no contexto do documento" e "Placeholders do destino e da forma de apresentação", que complementam "Contexto do documento" e "Entrega do contexto do documento ao host"; "Recarga da lista ao mudar o contexto" ganha um cenário com a troca de destino ou de forma de apresentação.

## Impact

- `src/components/nova-proposicao/` (`urlsNovaProposicao.ts`, `contextoDocumento.ts`, `nova-proposicao.component.ts`).
- `docs/api-componente-lexml-eta.md` (tabela do contexto do documento).
- Demo (`demo/components/demoview.ts`, que passa a enviar os novos placeholders na URL de importação, ignorados pelo backend simulado), testes de componente e o E2E `cypress/e2e/nova-proposicao/callbacks.cy.ts`.
- Hosts: o Infoleg Editor e o `lexeditweb-editor` podem ler os novos campos; nada muda para quem não os usa. É preciso gerar um novo `.tgz` para quem consome o pacote.
