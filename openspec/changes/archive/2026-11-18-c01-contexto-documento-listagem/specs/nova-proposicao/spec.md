# Spec Delta

## RENAMED Requirements

- FROM: `### Requirement: Contexto da importação de arquivo`
- TO: `### Requirement: Contexto do documento`

- FROM: `### Requirement: Entrega do contexto da importação ao host`
- TO: `### Requirement: Entrega do contexto do documento ao host`

## MODIFIED Requirements

### Requirement: Callback de importação de arquivo
`onImportarArquivo` SHALL receber o arquivo selecionado, já validado quanto a extensão e tamanho (o callback MUST NOT ser chamado para arquivo recusado nem para arquivo `.json`), e o contexto do documento (requisito "Contexto do documento") como segundo parâmetro, e devolver `{ texto?, erros }`, com `texto` o documento articulado e `erros` lista de mensagens. Com `erros` não vazio, o componente SHALL levar à Tela 3; com `erros` vazio, SHALL concluir com `texto` como documento importado. Promise rejeitada ou exceção SHALL ter o efeito da falha do serviço de conversão (requisito "Conversão por URL").

#### Scenario: Importação com sucesso
- **WHEN** `onImportarArquivo` devolve `{ texto, erros: [] }`
- **THEN** o fluxo é concluído e o `detail` contém o `texto` devolvido em `documentoImportado`

#### Scenario: Importação com erros
- **WHEN** `onImportarArquivo` devolve `erros` não vazio
- **THEN** a Tela 3 exibe o nome do arquivo e a lista de erros devolvida

#### Scenario: Sem erros e sem texto
- **WHEN** `onImportarArquivo` devolve `{ erros: [] }`
- **THEN** a Tela 3 é exibida com a mensagem de que o conversor não devolveu o texto, e o fluxo não conclui com texto vazio por esse caminho

#### Scenario: Falha de comunicação na importação
- **WHEN** `onImportarArquivo` rejeita a promise
- **THEN** a Tela 2 permanece com o alerta de erro da falha do serviço de conversão e **Continuar** pode ser acionado novamente

#### Scenario: Arquivo recusado
- **WHEN** o arquivo excede 5 MB ou tem extensão não aceita
- **THEN** o callback não é chamado

#### Scenario: Arquivo JSON com callback
- **WHEN** a configuração informa `onImportarArquivo` e o usuário importa um arquivo `.json`
- **THEN** o callback não é chamado e o arquivo é lido pelo próprio componente

#### Scenario: Callback com um só parâmetro
- **WHEN** o host informa um `onImportarArquivo` que declara apenas o parâmetro do arquivo
- **THEN** a importação funciona como antes

### Requirement: Conversão por URL
Sem o callback `onImportarArquivo`, o componente SHALL enviar o arquivo à URL de importação (`urlImportacaoArquivo`) por `POST`, com o conteúdo do arquivo no corpo (não multipart) e o cabeçalho `Content-Type` determinado pela extensão: `application/pdf` (`.pdf`), `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (`.docx`), `text/plain` (`.txt`) e `application/xml` (`.xml`). A URL SHALL aceitar os placeholders do requisito "Entrega do contexto do documento ao host". A resposta `200` SHALL trazer no corpo o documento articulado em JSONIX, que conclui o fluxo como documento importado. A resposta `400` SHALL exibir na Tela 2 um alerta de aviso com o título "O arquivo não pôde ser importado", o corpo da resposta como texto puro (ou "O serviço de conversão recusou o arquivo.", se vazio) e a orientação "Selecione outro arquivo ou escolha outra forma de iniciar o texto.". Qualquer outra resposta, corpo `200` que não seja JSON ou falha de rede SHALL exibir na Tela 2 um alerta de erro "Não foi possível converter o arquivo "<nome do arquivo>": o serviço de conversão apresentou uma falha. Tente novamente em alguns instantes.", sem exibir o corpo da resposta. Nos dois alertas, o usuário SHALL permanecer na Tela 2, podendo trocar o arquivo ou acionar **Continuar** novamente, e o alerta SHALL sair ao trocar o arquivo ou a opção de texto inicial.

#### Scenario: Envio do arquivo
- **WHEN** o usuário importa `proposicao.pdf` sem o callback `onImportarArquivo`
- **THEN** o componente faz `POST` na URL de importação com o conteúdo do arquivo no corpo e `Content-Type: application/pdf`

#### Scenario: Conversão com sucesso
- **WHEN** a URL de importação responde `200` com um documento articulado em JSONIX
- **THEN** o fluxo é concluído e o `detail` contém esse documento em `documentoImportado`

#### Scenario: Arquivo recusado pelo serviço
- **WHEN** a URL de importação responde `400` com o corpo "Conversão de DOCX ou TXT não implementada."
- **THEN** a Tela 2 exibe o alerta de aviso com o título "O arquivo não pôde ser importado", essa mensagem e a orientação para selecionar outro arquivo ou outra forma de iniciar

#### Scenario: Falha do serviço
- **WHEN** a URL de importação responde `500` com o corpo "Falha interna."
- **THEN** a Tela 2 exibe o alerta de erro com o nome do arquivo e a orientação para tentar novamente, sem exibir "Falha interna.", e **Continuar** pode ser acionado novamente

#### Scenario: Troca de arquivo
- **WHEN** um dos alertas da conversão está exibido e o usuário seleciona outro arquivo
- **THEN** o alerta deixa de ser exibido

### Requirement: Contexto do documento
O contexto do documento SHALL ser montado a partir da Tela 1, ao acionar **Continuar** com a opção "Importar documento" e ao carregar a lista da Tela 2b, com: `casa`, `especie`, `urn` do documento a criar, `siglaDocumento` (no substitutivo do `SF`, a da proposição referenciada) e, havendo URN de documento referenciado (substitutivo, subemenda substitutiva e PLV), `documentoReferenciado` com `urn`, `sigla`, `numero` e `ano`. `documentoReferenciado` SHALL ser sempre o documento referenciado na Tela 1, mesmo quando a Tela 2b lista os documentos de outra matéria.

#### Scenario: Proposição sem referência
- **WHEN** o usuário importa um arquivo para uma PEC da `CD`
- **THEN** o contexto traz `especie` `proposicao`, a URN e a sigla da PEC e não traz `documentoReferenciado`

#### Scenario: Substitutivo do SF
- **WHEN** o usuário importa um arquivo para um substitutivo do `SF` a um PL
- **THEN** `urn` é a do substitutivo, `siglaDocumento` é a sigla do PL e `documentoReferenciado` traz a URN, a sigla, o número e o ano do PL

#### Scenario: Substitutivo e subemenda substitutiva da CD
- **WHEN** o usuário importa um arquivo para um substitutivo ou uma subemenda substitutiva da `CD`
- **THEN** `siglaDocumento` é `SBT` ou `SSP`, respectivamente, e `documentoReferenciado` traz a proposição referenciada

#### Scenario: PLV
- **WHEN** o usuário importa um arquivo para um PLV
- **THEN** `documentoReferenciado` traz a medida provisória informada

#### Scenario: Contexto na listagem da Tela 2b
- **WHEN** o usuário cria uma subemenda substitutiva da `CD` referenciando o PL 4/2025 e lista os documentos de outra matéria, o PL 9/2025
- **THEN** a consulta é PL 9/2025, e o contexto traz `especie` `subemenda` e `documentoReferenciado` do PL 4/2025

### Requirement: Entrega do contexto do documento ao host
Com o callback (`onImportarArquivo` e `onListarDocumentos`), o contexto SHALL ser o segundo parâmetro, somente leitura. Com a URL (`urlImportacaoArquivo` e `urlDocumentosMateria`), o componente SHALL preencher os placeholders `{casa}`, `{especie}`, `{urn}`, `{siglaDocumento}`, `{urnDocumentoReferenciado}`, `{siglaReferenciada}`, `{numeroReferenciado}` e `{anoReferenciado}`, codificados como componente de URL. Valor ausente SHALL virar texto vazio, e URL sem placeholders do contexto MUST NOT ser alterada por eles.

#### Scenario: Callback recebe o contexto
- **WHEN** o usuário importa um arquivo para um substitutivo e o host informa `onImportarArquivo`
- **THEN** o callback recebe o arquivo e, como segundo parâmetro, o contexto desse substitutivo

#### Scenario: Callback de listagem recebe o contexto
- **WHEN** a Tela 2b carrega os documentos de uma matéria e o host informa `onListarDocumentos`
- **THEN** o callback recebe a consulta e, como segundo parâmetro, o contexto do novo documento

#### Scenario: Placeholders na URL
- **WHEN** `urlImportacaoArquivo` é `/api/importacao?urn={urn}&especie={especie}` e o usuário importa um arquivo para um substitutivo
- **THEN** o `POST` vai para a URL com `urn` e `especie` preenchidos e codificados

#### Scenario: Placeholders na URL de listagem
- **WHEN** `urlDocumentosMateria` é `/m/{sigla}/{numero}/{ano}?especie={especie}` e a Tela 2b carrega o PL 4/2025 de uma subemenda substitutiva
- **THEN** a requisição é feita para `/m/PL/4/2025?especie=subemenda`

#### Scenario: Placeholder sem valor
- **WHEN** a URL tem `{siglaReferenciada}` e o documento não tem referência
- **THEN** o parâmetro é enviado vazio

#### Scenario: URL sem placeholders
- **WHEN** `urlImportacaoArquivo` ou `urlDocumentosMateria` não tem placeholders do contexto
- **THEN** a requisição é feita como foi informada, com os placeholders próprios da URL

#### Scenario: Callback de listagem com um só parâmetro
- **WHEN** o host informa um `onListarDocumentos` que declara apenas o parâmetro da consulta
- **THEN** a listagem funciona como antes

### Requirement: Contrato dos serviços da Tela 2b
`onListarDocumentos` SHALL receber `{ sigla, numero, ano }` normalizados da matéria consultada e o contexto do documento (requisito "Contexto do documento") como segundo parâmetro, e devolver a lista de documentos ou `undefined` se a matéria for inexistente; `onObterTextoDocumento` SHALL receber `{ id }`, sem o contexto, e devolver o JSONIX ou `undefined` se indisponível. Promise rejeitada ou exceção SHALL ser falha de comunicação.

#### Scenario: Listagem pelo callback
- **WHEN** a Tela 2b carrega a matéria PL 4/2025
- **THEN** `onListarDocumentos` recebe `{ sigla: 'PL', numero: '4', ano: '2025' }` e o contexto

#### Scenario: Matéria inexistente
- **WHEN** a listagem devolve `undefined` ou `404`
- **THEN** a matéria é tratada como não encontrada

#### Scenario: Texto por id
- **WHEN** o usuário continua com o documento de `id` "abc"
- **THEN** o serviço do texto recebe `{ id: 'abc' }` e não recebe sigla, número, ano nem o contexto

#### Scenario: Falha na listagem
- **WHEN** `onListarDocumentos` rejeita a promise
- **THEN** o usuário é informado do erro e pode tentar novamente

### Requirement: URLs dos serviços da Tela 2b
`urlDocumentosMateria` SHALL usar os placeholders de sigla, número e ano da matéria consultada e aceitar os placeholders do requisito "Entrega do contexto do documento ao host"; `urlTextoDocumento` SHALL usar `{id}`, sem os placeholders do contexto. Ambas SHALL ter `200` (JSON) e `404` (inexistente ou indisponível) como nas demais origens; outra resposta ou erro de rede SHALL ser falha de comunicação.

#### Scenario: URL do texto
- **WHEN** o usuário continua com o documento de `id` "abc" e só há `urlTextoDocumento`
- **THEN** a requisição é feita com `{id}` substituído por `abc`

## ADDED Requirements

### Requirement: Recarga da lista ao mudar o contexto
A lista da Tela 2b SHALL depender da matéria consultada e do contexto do documento. Ao entrar na Tela 2b com contexto diferente do da lista carregada, o componente SHALL descartar a lista e a seleção e recarregá-la; resposta de uma carga anterior SHALL ser descartada. Com o mesmo contexto e a mesma matéria, a lista e a seleção SHALL ser preservadas.

#### Scenario: Troca de espécie com a mesma matéria
- **WHEN** o usuário lista os documentos do PL 4/2025 para um substitutivo, volta à Tela 1, muda para subemenda substitutiva com o mesmo PL 4/2025 e chega à Tela 2b
- **THEN** a lista é recarregada com o contexto da subemenda e a seleção anterior é descartada

#### Scenario: Carga em andamento durante a troca
- **WHEN** a lista de um contexto ainda está sendo carregada e o usuário volta, muda a espécie e retorna à Tela 2b
- **THEN** a resposta da carga anterior é descartada e a lista exibida é a do contexto atual

#### Scenario: Voltar sem mudar o contexto
- **WHEN** o usuário volta da Tela 2b à Tela 2 e retorna sem alterar a Tela 1
- **THEN** a lista e a seleção são preservadas e `onListarDocumentos` não é chamado de novo
