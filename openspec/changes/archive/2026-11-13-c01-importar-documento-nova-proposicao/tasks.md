# Tasks

## 1. Fake do serviço de conversão na demo

- [x] 1.1 Em `demo/server/handlers.mjs`, fazer `tratarRequisicaoDemo` receber `(url, metodo, contentType)` e tratar `POST /demo-api/importacao` pelo `Content-Type` (design, decisão 7: XML → `200` com o JSON da demo; PDF → `500` "Falha interna."; DOCX/`text/plain` → `400` "Conversão de DOCX ou TXT não implementada."; outro → `400` "Tipo de arquivo não suportado."), mantendo o GET como está; verificar com novos casos em `demo/server/handlers.test.mjs` e `npm run test:demo-server`
- [x] 1.2 No middleware de `web-dev-server.config.mjs`, repassar o método e o cabeçalho `Content-Type` ao handler; verificar com `curl -X POST -H "Content-Type: application/pdf" --data-binary @<arquivo> http://localhost:<porta>/demo-api/importacao` (espera `500`) e o mesmo para XML (espera `200` com JSON)

## 2. Importação real na `nova-proposicao`

- [x] 2.1 Em `urlsNovaProposicao.ts`, acrescentar `urlImportacaoArquivo` a `ConfigNovaProposicao` e o par `urlImportacaoArquivo`/`onImportarArquivo` a `ORIGENS_OBRIGATORIAS`; verificar com teste unitário de `validarConfigNovaProposicao` (configuração sem os dois é recusada com erro que nomeia a URL; só o callback é aceita) e ajustar os testes e fixtures de configuração existentes que não informam a importação
- [x] 2.2 Trocar as extensões aceitas para `pdf`, `docx`, `txt`, `xml`, `json` (no `accept` do seletor e na validação) e o rótulo da opção para "Importar documento (PDF, DOCX, TXT ou LexML)", removendo o simulador (`ERRO_PARSER_SIMULADO`); verificar em `novaProposicao.component.test.ts` que `.lexml` é recusado e as cinco extensões são aceitas
- [x] 2.3 Ler o `.json` no componente (`File.text()` + `JSON.parse`) sem chamar a URL nem o callback, com o alerta de aviso para JSON inválido; verificar com teste de componente (sem `fetch` e sem callback chamados; `detail.documentoImportado` igual ao conteúdo; alerta para JSON inválido)
- [x] 2.4 Enviar os demais formatos por `POST` à `urlImportacaoArquivo`, com o corpo do arquivo e o `Content-Type` pela extensão, e tratar `200`/`400`/`500`/rede com os alertas do requisito "Conversão por URL" (que saem ao trocar o arquivo ou a opção); verificar com teste de componente com `fetch` simulado (método, corpo e cabeçalho por extensão; os textos dos dois alertas; corpo do `500` não exibido; `Continuar` disponível depois da falha)
- [x] 2.5 Emitir o documento importado em `detail.documentoImportado` (URL, `.json` e callback), mantendo `texto` só para documento referenciado e outra proposição, e o efeito da rejeição do callback igual ao da falha do serviço; atualizar o tipo `ResultadoNovaProposicao`; verificar com os testes de componente do callback (sucesso em `documentoImportado`, `erros` na Tela 3, rejeição com o alerta de erro, `.json` sem chamar o callback)
- [x] 2.6 Atualizar a seção 11 de `docs/api-componente-lexml-eta.md` (configuração com a quarta origem, contrato da URL de importação, `.json` lido direto, `documentoImportado` no evento) e o exemplo de uso; verificar relendo a seção contra a spec delta `nova-proposicao`

## 3. Documento importado no `lexml-eta`

- [x] 3.1 Permitir que a validação de `lerDocumentoArticulado` pule a checagem de casa da URN do arquivo (opção usada só pela importação; o "Abrir" continua checando); verificar com teste unitário (documento da Câmara aceito com a opção e recusado sem ela)
- [x] 3.2 Acrescentar `documentoImportado` a `DadosNovaProposicao` e, em `novaProposicao`, rejeitar quando vier junto com `documentoModelo`, montar a cópia com a identidade, o colegiado e o anexo de parecer dos parâmetros, sem anexos e sem a data da última modificação, e abri-la pelo corpo de `abrirDocumentoLido` (design, decisão 2); verificar em `test/componente/lexml-eta/novaProposicao.component.test.ts` com um documento com justificação, notas, revisões de texto e de hierarquia, autoria, fecho e outros metadados (todos presentes), e URN/epígrafe/preâmbulo/colegiado divergentes (valem os parâmetros)
- [x] 3.3 Aplicar autoria e opções de impressão dos parâmetros só quando o documento importado não traz o grupo; verificar com teste (com e sem o grupo no documento)
- [x] 3.4 Descartar os anexos e, quando havia algum, adicionar o alerta de anexos na aba Avisos depois das limpezas de alerta de `inicializarEdicao`, sem gerar pendência ao salvar; verificar com teste (alerta presente com anexos e ausente sem eles; documento criado sem anexos; `getDocumentoArticulado()` sem a pendência)
- [x] 3.5 Atualizar a tabela de `novaProposicao` em `docs/api-componente-lexml-eta.md` (`documentoImportado`, exclusivo com `documentoModelo`, e o que é aproveitado) e acrescentar ao CLAUDE.md um item curto com as invariantes (campo próprio, abertura pelo caminho do "Abrir", URN do arquivo não checada, anexos descartados com alerta, coordenação com o `lexeditweb-editor`); verificar relendo contra a spec delta `interface-lexml-eta`

## 4. Demo e E2E

- [x] 4.1 Em `demo/components/demoview.ts`, informar `urlImportacaoArquivo: '/demo-api/importacao'` e repassar `documentoImportado` a `novaProposicao` (a derivação da `CD` fica só para `texto`); verificar manualmente com `npm start`: XML preenche o editor; PDF mostra o alerta de erro; DOCX e TXT mostram o alerta de aviso; um `.json` salvo pelo editor com justificação e revisões abre com elas e com a identidade da Tela 1
- [x] 4.2 E2E Cypress em `cypress/e2e/nova-proposicao/importacao-documento.cy.ts`, seguindo `docs/guia-cypress.md`: seleção do arquivo por `selectFile` no `#np-arquivo`, contra o fake real da demo (sem `cy.intercept`) — XML conclui e o editor exibe a articulação do documento do fake; PDF exibe o alerta de erro; DOCX exibe o alerta de aviso com a mensagem do `400`; `.json` com justificação e um anexo cria o documento com a justificação e exibe o alerta de anexos na aba Avisos. Fixture `.json` gerada por `criarDocumentoArticulado`, não escrita à mão; verificar com `npm run cy:run:local -- --spec cypress/e2e/nova-proposicao/importacao-documento.cy.ts`

## 5. Integração

- [x] 5.1 Rodar `npm test` completo e o spec E2E existente `cypress/e2e/nova-proposicao/nova-proposicao.cy.ts` (configuração da demo com a quarta origem não pode quebrar os fluxos atuais); verificar que tudo passa
- [x] 5.2 Rodar `openspec validate 2026-11-13-c01-importar-documento-nova-proposicao --strict` e corrigir o que for apontado
