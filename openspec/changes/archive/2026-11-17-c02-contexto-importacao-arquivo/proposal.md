# Proposal

## Why

Hoje a importação de arquivo (PDF, DOCX, TXT e XML) entrega ao host só o arquivo: `onImportarArquivo(arquivo)` recebe apenas o `File`, e `urlImportacaoArquivo` recebe um `POST` com o corpo e o `Content-Type`. O serviço de conversão do host precisa saber o que o usuário escolheu na Tela 1 (tipo da norma, espécie, documento referenciado): sem isso, importar para PEC, PLP, PDL, PRC, substitutivo ou subemenda substitutiva é convertido como projeto de lei e sem o ajuste do contexto de substitutivo.

## What Changes

- Novo tipo `ContextoImportacaoArquivo`, somente leitura, montado a partir dos dados da Tela 1 no momento em que o usuário aciona **Continuar** com a opção "Importar documento": `casa`, `especie`, `urn`, `siglaDocumento` e, quando o documento tem referência (substitutivo, subemenda substitutiva e PLV), `documentoReferenciado` com `urn`, `sigla`, `numero` e `ano`.
- `onImportarArquivo(arquivo, contexto)` passa a receber o contexto como segundo parâmetro. Hosts que declaram só o primeiro parâmetro continuam funcionando.
- `urlImportacaoArquivo` passa a aceitar placeholders opcionais com o contexto (`{casa}`, `{especie}`, `{urn}`, `{siglaDocumento}`, `{urnDocumentoReferenciado}`, `{siglaReferenciada}`, `{numeroReferenciado}` e `{anoReferenciado}`), no padrão das demais URLs do componente. Valor ausente vira parâmetro vazio. URL sem placeholders se comporta como hoje.
- Durante o processamento da importação (e da obtenção de texto na Tela 2b), os botões **Voltar** e **Cancelar** ficam desabilitados, para que o resultado não conclua com dados da Tela 1 diferentes dos usados na conversão.
- Documentação, demo, testes e spec acompanham.

## Capabilities

### New Capabilities

### Modified Capabilities
- `nova-proposicao`: requisitos "Callback de importação de arquivo" e "Conversão por URL"; novos requisitos sobre o contexto da importação, sua entrega ao host e o bloqueio de **Voltar** e **Cancelar** durante o processamento.

## Impact

- `src/components/nova-proposicao/` (`urlsNovaProposicao.ts`, `nova-proposicao.component.ts`), `src/index.ts` e `scripts/validate-package.mjs` (exportar o tipo novo).
- `docs/api-componente-lexml-eta.md`, `openspec/specs/nova-proposicao/spec.md`.
- Demo (`demo/components/demoview.ts`, `demo/server/handlers.mjs` e seus testes), testes de componente e E2E da importação.
- Hosts: sem **BREAKING**. O `lexeditweb-editor` (SF), que usa a URL, deve acrescentar os placeholders à `urlImportacaoArquivo` e ler os parâmetros no endpoint de conversão para derivar o tipo da norma, a espécie e o contexto de substitutivo; o Infoleg Editor (CD), que usa o callback, passa a ler o segundo parâmetro.
