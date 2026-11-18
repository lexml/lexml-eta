# Spec Delta

## MODIFIED Requirements

### Requirement: Callback de importação de arquivo
`onImportarArquivo` SHALL receber o arquivo selecionado, já validado quanto a extensão e tamanho (o callback MUST NOT ser chamado para arquivo recusado nem para arquivo `.json`), e o contexto da importação (requisito "Contexto da importação de arquivo") como segundo parâmetro, e devolver `{ texto?, erros }`, com `texto` o documento articulado e `erros` lista de mensagens. Com `erros` não vazio, o componente SHALL levar à Tela 3; com `erros` vazio, SHALL concluir com `texto` como documento importado. Promise rejeitada ou exceção SHALL ter o efeito da falha do serviço de conversão (requisito "Conversão por URL").

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
Sem o callback `onImportarArquivo`, o componente SHALL enviar o arquivo à URL de importação (`urlImportacaoArquivo`) por `POST`, com o conteúdo do arquivo no corpo (não multipart) e o cabeçalho `Content-Type` determinado pela extensão: `application/pdf` (`.pdf`), `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (`.docx`), `text/plain` (`.txt`) e `application/xml` (`.xml`). A URL SHALL aceitar os placeholders do requisito "Entrega do contexto da importação ao host". A resposta `200` SHALL trazer no corpo o documento articulado em JSONIX, que conclui o fluxo como documento importado. A resposta `400` SHALL exibir na Tela 2 um alerta de aviso com o título "O arquivo não pôde ser importado", o corpo da resposta como texto puro (ou "O serviço de conversão recusou o arquivo.", se vazio) e a orientação "Selecione outro arquivo ou escolha outra forma de iniciar o texto.". Qualquer outra resposta, corpo `200` que não seja JSON ou falha de rede SHALL exibir na Tela 2 um alerta de erro "Não foi possível converter o arquivo "<nome do arquivo>": o serviço de conversão apresentou uma falha. Tente novamente em alguns instantes.", sem exibir o corpo da resposta. Nos dois alertas, o usuário SHALL permanecer na Tela 2, podendo trocar o arquivo ou acionar **Continuar** novamente, e o alerta SHALL sair ao trocar o arquivo ou a opção de texto inicial.

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

## ADDED Requirements

### Requirement: Contexto da importação de arquivo
O contexto da importação SHALL ser montado ao acionar **Continuar** com a opção "Importar documento", a partir da Tela 1, com: `casa`, `especie`, `urn` do documento a criar, `siglaDocumento` (no substitutivo do `SF`, a da proposição referenciada) e, havendo URN de documento referenciado (substitutivo, subemenda substitutiva e PLV), `documentoReferenciado` com `urn`, `sigla`, `numero` e `ano`.

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

### Requirement: Entrega do contexto da importação ao host
Com o callback, o contexto SHALL ser o segundo parâmetro, somente leitura. Com a URL, o componente SHALL preencher os placeholders `{casa}`, `{especie}`, `{urn}`, `{siglaDocumento}`, `{urnDocumentoReferenciado}`, `{siglaReferenciada}`, `{numeroReferenciado}` e `{anoReferenciado}`, codificados como componente de URL. Valor ausente SHALL virar texto vazio, e URL sem placeholders MUST NOT ser alterada.

#### Scenario: Callback recebe o contexto
- **WHEN** o usuário importa um arquivo para um substitutivo e o host informa `onImportarArquivo`
- **THEN** o callback recebe o arquivo e, como segundo parâmetro, o contexto desse substitutivo

#### Scenario: Placeholders na URL
- **WHEN** `urlImportacaoArquivo` é `/api/importacao?urn={urn}&especie={especie}` e o usuário importa um arquivo para um substitutivo
- **THEN** o `POST` vai para a URL com `urn` e `especie` preenchidos e codificados

#### Scenario: Placeholder sem valor
- **WHEN** a URL tem `{siglaReferenciada}` e o documento não tem referência
- **THEN** o parâmetro é enviado vazio

#### Scenario: URL sem placeholders
- **WHEN** `urlImportacaoArquivo` não tem placeholders
- **THEN** o `POST` vai para a URL como foi informada

### Requirement: Bloqueio da navegação durante o processamento
Enquanto o componente aguarda o host (importação de arquivo ou obtenção de texto), os botões **Voltar** e **Cancelar** das Telas 2 e 2b SHALL ficar desabilitados, para que o resultado não seja combinado com dados da Tela 1 diferentes dos usados na chamada.

#### Scenario: Importação em andamento
- **WHEN** o usuário aciona **Continuar** com um arquivo e o host ainda não respondeu
- **THEN** **Voltar** e **Cancelar** ficam desabilitados e voltam a ficar habilitados quando a resposta chega

#### Scenario: Obtenção de texto na Tela 2b
- **WHEN** o usuário confirma um documento da lista e o texto ainda não chegou
- **THEN** **Voltar** e **Cancelar** ficam desabilitados até a resposta
