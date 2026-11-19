# Spec Delta

## MODIFIED Requirements

### Requirement: Configuração e resultado do componente
O componente SHALL receber um objeto de configuração com a casa legislativa do editor (`casaLegislativaEditor`: `SF` ou `CD`) e, para cada uma das quatro origens de dados (verificação de proposição, texto estruturado, listagem das comissões e conversão de arquivo importado), a URL correspondente ou o callback opcional que a substitui (requisito "Callbacks opcionais para as origens de dados"), e SHALL devolver ao host, por evento, um objeto de resultado com as informações coletadas. O componente MUST NOT criar o documento nem abrir a edição por conta própria.

#### Scenario: Conclusão do fluxo
- **WHEN** o usuário aciona **Continuar** na última tela aplicável
- **THEN** o componente emite um evento cujo `detail` contém: `urn`, `urnDocumentoReferenciado` (quando houver), `epigrafe`, `preambulo`, `colegiadoDestino`, `texto` (quando parte do documento referenciado, de outra proposição ou de arquivo importado) e `anexoParecer`

#### Scenario: Vocabulário inicializado pelo componente
- **WHEN** o componente é criado ou recebe uma nova configuração
- **THEN** ele inicializa o vocabulário para a casa legislativa da configuração, como o `lexml-eta`, sem depender de inicialização prévia pelo host, e usa em todo o fluxo apenas o vocabulário da casa (`getVocabularioDaCasa()`), que inclui a autoridade `federal` e não inclui os tipos específicos da outra casa

#### Scenario: Coerência de casa com o lexml-eta
- **WHEN** o componente e o `lexml-eta` coexistem na mesma página
- **THEN** manter a mesma casa nos dois é responsabilidade do editor (host); o componente não valida essa coerência

#### Scenario: Campos condicionais ausentes
- **WHEN** o documento não é substitutivo, subemenda substitutiva nem PLV, e o texto inicial é vazio
- **THEN** o `detail` não contém `urnDocumentoReferenciado` nem `texto`

#### Scenario: Cancelamento
- **WHEN** o usuário aciona **Cancelar** em qualquer tela
- **THEN** o componente emite o evento próprio `nova-proposicao-cancelada`, sem `detail`, e descarta os dados informados

#### Scenario: Casa legislativa ausente
- **WHEN** a configuração não informa a casa legislativa
- **THEN** a casa assume o padrão `SF`

#### Scenario: URL de verificação ausente
- **WHEN** a configuração não informa a URL de verificação de proposição nem o callback `onVerificarProposicao`
- **THEN** a inicialização do componente falha com erro que identifica a URL ausente, e nenhuma tela é exibida

#### Scenario: URL de comissões ausente
- **WHEN** a configuração não informa a URL de comissões nem o callback `onObterComissoes`
- **THEN** a inicialização do componente falha com erro que identifica a URL ausente, e nenhuma tela é exibida

#### Scenario: URL do texto estruturado ausente
- **WHEN** a configuração não informa a URL do texto estruturado nem o callback `onObterTexto`
- **THEN** a inicialização do componente falha com erro que identifica a URL ausente, e nenhuma tela é exibida

#### Scenario: Importação sem URL
- **WHEN** a configuração não informa a URL de importação (`urlImportacaoArquivo`) nem o callback `onImportarArquivo`
- **THEN** a inicialização do componente falha com erro que identifica a URL ausente, e nenhuma tela é exibida

#### Scenario: Callback no lugar da URL
- **WHEN** a configuração não informa a URL de uma origem, mas informa o callback correspondente
- **THEN** a configuração é aceita para essa origem e as telas são exibidas

### Requirement: Conteúdo do resultado
O `detail` do evento de conclusão SHALL conter: `urn` (URN do novo documento); `urnDocumentoReferenciado` (URN do documento referenciado, em substitutivo, subemenda substitutiva e PLV; no substitutivo do `SF` é a URN do documento referenciado sem o sufixo de versão do substitutivo); `epigrafe`, montada pelo serviço do vocabulário a partir de `urn` e `urnDocumentoReferenciado`; `preambulo`, obtido do vocabulário; `colegiadoDestino` (tipo e, em Comissão, a sigla da comissão), sempre presente; `texto`, o documento articulado, apenas quando o texto inicial vem do documento referenciado, de outra proposição ou de arquivo importado (nos três casos o host o repassa como documento de modelo, do qual o `lexml-eta` aproveita apenas a ementa e a articulação); e `anexoParecer`, booleano.

#### Scenario: Substitutivo da CD a partir do texto referenciado
- **WHEN** o usuário conclui um substitutivo da `CD` com a opção do documento referenciado
- **THEN** o `detail` contém `urn`, `urnDocumentoReferenciado`, `epigrafe`, `preambulo`, `colegiadoDestino`, `texto` e `anexoParecer`

#### Scenario: Texto importado
- **WHEN** o usuário conclui com a opção de importação e a conversão tem sucesso
- **THEN** `texto` contém o documento articulado resultante

### Requirement: Callback de importação de arquivo
`onImportarArquivo` SHALL receber o arquivo selecionado, já validado quanto a extensão e tamanho (o callback MUST NOT ser chamado para arquivo recusado nem para arquivo `.json`), e o contexto do documento (requisito "Contexto do documento") como segundo parâmetro, e devolver `{ texto?, erros }`, com `texto` o documento articulado e `erros` lista de mensagens. Com `erros` não vazio, o componente SHALL levar à Tela 3; com `erros` vazio, SHALL concluir com o `texto` devolvido como texto inicial. Promise rejeitada ou exceção SHALL ter o efeito da falha do serviço de conversão (requisito "Conversão por URL").

#### Scenario: Importação com sucesso
- **WHEN** `onImportarArquivo` devolve `{ texto, erros: [] }`
- **THEN** o fluxo é concluído e o `detail` contém o `texto` devolvido

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
Sem o callback `onImportarArquivo`, o componente SHALL enviar o arquivo à URL de importação (`urlImportacaoArquivo`) por `POST`, com o conteúdo do arquivo no corpo (não multipart) e o cabeçalho `Content-Type` determinado pela extensão: `application/pdf` (`.pdf`), `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (`.docx`), `text/plain` (`.txt`) e `application/xml` (`.xml`). A URL SHALL aceitar os placeholders do requisito "Entrega do contexto do documento ao host". A resposta `200` SHALL trazer no corpo o documento articulado em JSONIX, que conclui o fluxo como texto inicial. A resposta `400` SHALL exibir na Tela 2 um alerta de aviso com o título "O arquivo não pôde ser importado", o corpo da resposta como texto puro (ou "O serviço de conversão recusou o arquivo.", se vazio) e a orientação "Selecione outro arquivo ou escolha outra forma de iniciar o texto.". Qualquer outra resposta, corpo `200` que não seja JSON ou falha de rede SHALL exibir na Tela 2 um alerta de erro "Não foi possível converter o arquivo "<nome do arquivo>": o serviço de conversão apresentou uma falha. Tente novamente em alguns instantes.", sem exibir o corpo da resposta. Nos dois alertas, o usuário SHALL permanecer na Tela 2, podendo trocar o arquivo ou acionar **Continuar** novamente, e o alerta SHALL sair ao trocar o arquivo ou a opção de texto inicial.

#### Scenario: Envio do arquivo
- **WHEN** o usuário importa `proposicao.pdf` sem o callback `onImportarArquivo`
- **THEN** o componente faz `POST` na URL de importação com o conteúdo do arquivo no corpo e `Content-Type: application/pdf`

#### Scenario: Conversão com sucesso
- **WHEN** a URL de importação responde `200` com um documento articulado em JSONIX
- **THEN** o fluxo é concluído e o `detail` contém esse documento em `texto`

#### Scenario: Arquivo recusado pelo serviço
- **WHEN** a URL de importação responde `400` com o corpo "Conversão de DOCX ou TXT não implementada."
- **THEN** a Tela 2 exibe o alerta de aviso com o título "O arquivo não pôde ser importado", essa mensagem e a orientação para selecionar outro arquivo ou outra forma de iniciar

#### Scenario: Falha do serviço
- **WHEN** a URL de importação responde `500` com o corpo "Falha interna."
- **THEN** a Tela 2 exibe o alerta de erro com o nome do arquivo e a orientação para tentar novamente, sem exibir "Falha interna.", e **Continuar** pode ser acionado novamente

#### Scenario: Troca de arquivo
- **WHEN** um dos alertas da conversão está exibido e o usuário seleciona outro arquivo
- **THEN** o alerta deixa de ser exibido

### Requirement: Importação de JSON
O arquivo `.json` SHALL ser lido pelo próprio componente como documento articulado em JSONIX, sem chamar a URL de importação nem o callback `onImportarArquivo`, e o conteúdo SHALL concluir o fluxo como texto inicial. Conteúdo que não seja um JSON válido SHALL exibir na Tela 2 um alerta de aviso "O arquivo JSON não pôde ser lido: o conteúdo não é um JSON válido.", mantendo o usuário na Tela 2. O componente MUST NOT validar a estrutura do documento além de ser um JSON; essa validação é do `lexml-eta`.

#### Scenario: JSON lido direto
- **WHEN** o usuário importa um arquivo `.json` com um documento articulado
- **THEN** nenhuma requisição é feita, nenhum callback é chamado, e o `detail` contém o documento em `texto`

#### Scenario: JSON inválido
- **WHEN** o usuário importa um arquivo `.json` cujo conteúdo não é um JSON válido
- **THEN** a Tela 2 exibe o alerta de aviso de JSON inválido e o fluxo não é concluído
