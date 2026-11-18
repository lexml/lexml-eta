# Proposal

## Why

Na Tela 2b (CD), `onListarDocumentos(consulta)` recebe só a matéria cujos documentos serão listados. O host precisa devolver listas diferentes conforme a espécie escolhida na Tela 1: no substitutivo, o texto original da matéria mais proposições e substitutivos da árvore; na subemenda substitutiva, apenas substitutivos, subemendas substitutivas e pareceres. Sem o contexto, o host não distingue os dois casos. A mesma lacuna da importação de arquivo foi resolvida com o contexto do documento; este contrato deve seguir o mesmo padrão.

Além disso, a lista da Tela 2b é guardada por matéria (`sigla|numero|ano`) e não é refeita ao trocar a espécie na Tela 1 com a mesma matéria. Com a lista dependendo da espécie, o usuário veria a lista do substitutivo numa subemenda.

## What Changes

- `ContextoImportacaoArquivo` é renomeado para `ContextoDocumento` (e `ReferenciaImportacaoArquivo` para `ReferenciaDocumento`), usado pelos callbacks de importação e de listagem. **BREAKING** só para quem já usasse o nome anterior (ainda não consumido por nenhum host). Sem alias.
- `onListarDocumentos(consulta, contexto)` passa a receber o contexto (somente leitura, congelado) como segundo parâmetro. Hosts que declaram só o primeiro continuam funcionando.
- `urlDocumentosMateria` aceita, além de `{sigla}`, `{numero}` e `{ano}` (a matéria consultada), os placeholders opcionais do contexto: `{casa}`, `{especie}`, `{urn}`, `{siglaDocumento}`, `{urnDocumentoReferenciado}`, `{siglaReferenciada}`, `{numeroReferenciado}` e `{anoReferenciado}`. URL sem placeholders do contexto se comporta como hoje.
- A lista da Tela 2b passa a depender também do contexto: ao entrar na Tela 2b com contexto diferente do da lista carregada, a lista e a seleção são descartadas e a lista é recarregada; resposta de uma carga antiga é descartada.
- `onObterTextoDocumento({ id })` e `urlTextoDocumento` não mudam: o `id` já é único e vem da lista filtrada.
- Documentação (incluindo a diferença entre `consulta` e `documentoReferenciado`), demo, testes e spec acompanham.

## Capabilities

### New Capabilities

### Modified Capabilities
- `nova-proposicao`: requisitos "Callback de importação de arquivo", "Conversão por URL", "Contexto da importação de arquivo" (renomeado), "Entrega do contexto da importação ao host" (renomeado), "Contrato dos serviços da Tela 2b" e "URLs dos serviços da Tela 2b"; novo requisito sobre a recarga da lista ao mudar o contexto.

## Impact

- `src/components/nova-proposicao/` (`urlsNovaProposicao.ts`, `contextoImportacaoArquivo.ts` renomeado para `contextoDocumento.ts`, `nova-proposicao.component.ts`), `src/index.ts` e `scripts/validate-package.mjs`.
- `docs/api-componente-lexml-eta.md` e `openspec/specs/nova-proposicao/spec.md`.
- Demo (`demo/components/demoview.ts` e `demo/server/handlers.mjs`, com a espécie na listagem), testes de componente e E2E da Tela 2b.
- Hosts: o Infoleg Editor (CD, callback) passa a ler o segundo parâmetro de `onListarDocumentos`; quem usar `urlDocumentosMateria` pode acrescentar os placeholders. É preciso gerar um novo `.tgz` para o `editor-legislativo-fe`.
