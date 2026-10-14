# Tasks

## 1. Testes de ida e volta (falham antes da implementação)

- [x] 1.1 Criar `test/model/documento/revisaoTituloDispositivo.test.ts` com o roteiro salvar (`criarDocumentoArticulado` + `montaRevisoesArticulacao`), reabrir (`reconstroiRevisoes` + `aplicarRevisoesAction`) e rejeitar, para: título adicionado, título alterado ("Original" para "Alterado"), título removido e título com itálico e subscrito. Cada caso afirma o título depois de rejeitar e a descrição da marca "Título do dispositivo foi alterado". Verificar rodando o arquivo: os casos falham pelo motivo esperado (título continua o atual), como na reprodução da investigação.
- [x] 1.2 No mesmo arquivo, cobrir a revisão que combina título e texto (descrição "Texto e título do dispositivo foram alterados", rejeição restaura os dois), a revisão só de texto em dispositivo com título (rejeitar restaura o texto e mantém o título), a revisão de texto em artigo (texto no `Caput`) e o `p` solto tolerado na leitura (rejeitar restaura o texto e mantém o título atual). Verificar: os casos de título e texto falham antes da implementação; os de só texto e o do `p` solto já passam e continuam passando depois.

## 2. Escrita do conteúdo anterior

- [x] 2.1 Em `montaRevisaoDeDispositivo` (`src/model/lexml/documento/conversor/revisaoArticulacao.ts`), gravar, em toda revisão cuja operação inclui `alterado`, o dispositivo do mesmo tipo do dispositivo revisado, sem `id`, com o texto anterior (em `p`, ou em `Caput` quando é artigo) e com `tituloDispositivo` quando havia título; não gravar mais o `p` solto. Atualizar o comentário de `RevisaoArticulacaoLexEdit` em `documentoArticulado.ts`. Verificar com testes unitários do montador em `test/model/documento/revisaoArticulacao.test.ts`: formato JSON gerado para texto só, título adicionado, alterado, removido, título e texto, com formatação, em inciso e em artigo, e nas operações combinadas (`movido;N,alterado`, `transformado;tipo,alterado`, `alteracaoRotulo;id,alterado`).
- [x] 2.2 Ajustar os testes existentes que montam ou esperam o `p` solto como filho da revisão (`test/model/documento/revisaoArticulacao.test.ts`, `lerRevisoesArticulacao.test.ts`, `reconstroiRevisoes.test.ts` e `test/componente/lexml-eta/documentoArticulado.component.test.ts`, conforme o caso) e regenerar por `criarDocumentoArticulado` as fixtures `demo/doc/teste_revisao_descricao_operacoes.json`, `demo/doc/teste_revisoes_hierarquia.json` e `demo/doc/teste_revisao_alteracao_rotulo.json`. Verificar rodando `npx wtr` nos testes de `test/model/documento/**` e `test/componente/**` e os specs Cypress `abertura-revisao-alteracao-rotulo.cy.ts` e `abertura-revisoes-hierarquia.cy.ts`.

## 3. Leitura e reconstrução

- [x] 3.1 Em `lerRevisoesArticulacao` (`src/model/lexml/documento/conversor/buildProjetoNormaFromJsonix.ts`), reconhecer o dispositivo filho de uma revisão não excluída e extrair o texto anterior e o título anterior, distinguindo "título ausente" de "sem informação de título" (o `p` solto tolerado); estender `RevisaoArticulacaoLida` em `documentoArticulado.ts`. Verificar com testes em `test/model/documento/lerRevisoesArticulacao.test.ts`: wrapper com título, wrapper sem título, `p` solto tolerado, wrapper de artigo com `Caput`, e wrapper de uma revisão `excluido` inalterado.
- [x] 3.2 Em `reconstroiRevisoes.ts`, aplicar o título anterior ao `antes` da revisão e confirmar que a descrição da marca sai igual à da sessão. Verificar com os testes de `test/model/documento/reconstroiRevisoes.test.ts` (título adicionado, alterado, removido, título e texto) e com a suíte da tarefa 1, que passa a ficar verde.

## 4. Integração com o conversor real

- [x] 4.1 Em `test/integracao/documentoArticulado.integration.ts`, adicionar um cenário com revisão de texto e com título adicionado, alterado, removido e com formatação, em inciso e em artigo: `toxml` + validação com `schemas/lexedit.xsd` + `tojson`, conferindo `TituloDispositivo` no XML, a ausência dele no wrapper de título adicionado, o retorno idêntico das revisões e a rejeição depois de reaberto. Verificar rodando a suíte com `JSONIX_LEXML_CLI=C:\Desenv\jsonix\bin\jsonix-lexml-win.exe` (`npm run test:documento-articulado:xml`).

## 5. E2E (Cypress)

- [ ] 5.1 Em `cypress/e2e/titulo-dispositivo/titulo-dispositivo.cy.ts`, adicionar um teste de revisão com salvar e reabrir: com o modo de revisão ativo, adicionar e editar títulos, salvar capturando o blob de `URL.createObjectURL` (precedente: CT-L-06 em `cypress/e2e/remissao-interna/grupo-l-caput-undo.cy.ts`), reabrir o conteúdo capturado por `#fileUpload` e rejeitar a revisão, verificando que o título anterior (ou a ausência) volta. Avaliação à luz de `docs/guia-cypress.md`: viável, porque o precedente já captura o arquivo salvo sem depender do diretório de downloads. Se a reabertura pelo conteúdo capturado se mostrar instável, usar como alternativa uma fixture em `demo/doc/` gerada por `criarDocumentoArticulado` (como `teste_revisao_descricao_operacoes.json`) aberta por `#fileUpload`, que cobre o mesmo risco do lado de abrir. Verificar rodando o spec com o servidor local.

## 6. Documentação

- [ ] 6.1 Atualizar `docs/extensao-formato-lexml/11-revisao-da-hierarquia.md` com a convenção do estado anterior: o filho de `RevisaoArticulacao` em `alterado` é sempre um dispositivo do mesmo tipo, sem `id`, com o texto anterior e com `TituloDispositivo` quando havia título (sua ausência significa que não havia); atualizar os exemplos de `alterado` e `movido;3,alterado` e acrescentar exemplos de título adicionado, alterado e removido, em XML. Verificar relendo o documento contra os cenários dos deltas de spec desta change.
- [ ] 6.2 Registrar no `CLAUDE.md`, no item "Metadados do LexEdit", a convenção e o invariante de que o estado anterior de `alterado` é sempre gravado como dispositivo, com leitura tolerante ao `p` solto. Verificar que o texto menciona a leitura tolerante.
- [ ] 6.3 Rodar `openspec validate 2026-10-14-c01-persistir-revisao-titulo-dispositivo` e confirmar que não há erros.

## 7. Verificação final

- [ ] 7.1 Rodar `npx tsc`, o lint dos arquivos alterados, a suíte unitária completa (`npm test`), os specs Cypress de `titulo-dispositivo/`, `revisao/` e `documento-articulado/` e a integração com o conversor real; conferir a contagem de testes em relação à de antes da change, sem testes removidos ou ignorados.

## Workflow follow-up

- Não commitar sem pedido explícito do usuário; ao fim de cada tarefa numerada, pausar e pedir validação.
- Arquivar a change (`/opsx-archive`) depois da validação e do commit.
- Informar a convenção a quem mantém a especificação do formato e às aplicações que o leem (por exemplo o `lexeditweb`).
