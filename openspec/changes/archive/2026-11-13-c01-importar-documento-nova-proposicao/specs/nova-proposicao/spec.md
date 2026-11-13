# Spec Delta

## MODIFIED Requirements

### Requirement: Configuração e resultado do componente
O componente SHALL receber um objeto de configuração com a casa legislativa do editor (`casaLegislativaEditor`: `SF` ou `CD`) e, para cada uma das quatro origens de dados (verificação de proposição, texto estruturado, listagem das comissões e conversão de arquivo importado), a URL correspondente ou o callback opcional que a substitui (requisito "Callbacks opcionais para as origens de dados"), e SHALL devolver ao host, por evento, um objeto de resultado com as informações coletadas. O componente MUST NOT criar o documento nem abrir a edição por conta própria.

#### Scenario: Conclusão do fluxo
- **WHEN** o usuário aciona **Continuar** na última tela aplicável
- **THEN** o componente emite um evento cujo `detail` contém: `urn`, `urnDocumentoReferenciado` (quando houver), `epigrafe`, `preambulo`, `colegiadoDestino`, `texto` (quando parte do documento referenciado ou de outra proposição), `documentoImportado` (quando parte de arquivo importado) e `anexoParecer`

#### Scenario: Vocabulário inicializado pelo componente
- **WHEN** o componente é criado ou recebe uma nova configuração
- **THEN** ele inicializa o vocabulário para a casa legislativa da configuração, como o `lexml-eta`, sem depender de inicialização prévia pelo host, e usa em todo o fluxo apenas o vocabulário da casa (`getVocabularioDaCasa()`), que inclui a autoridade `federal` e não inclui os tipos específicos da outra casa

#### Scenario: Coerência de casa com o lexml-eta
- **WHEN** o componente e o `lexml-eta` coexistem na mesma página
- **THEN** manter a mesma casa nos dois é responsabilidade do editor (host); o componente não valida essa coerência

#### Scenario: Campos condicionais ausentes
- **WHEN** o documento não é substitutivo, subemenda substitutiva nem PLV, e o texto inicial é vazio
- **THEN** o `detail` não contém `urnDocumentoReferenciado`, `texto` nem `documentoImportado`

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
O `detail` do evento de conclusão SHALL conter: `urn` (URN do novo documento); `urnDocumentoReferenciado` (URN do documento referenciado, em substitutivo, subemenda substitutiva e PLV; no substitutivo do `SF` é a URN do documento referenciado sem o sufixo de versão do substitutivo); `epigrafe`, montada pelo serviço do vocabulário a partir de `urn` e `urnDocumentoReferenciado`; `preambulo`, obtido do vocabulário; `colegiadoDestino` (tipo e, em Comissão, a sigla da comissão), sempre presente; `texto`, o documento articulado, apenas quando o texto inicial vem do documento referenciado ou de outra proposição; `documentoImportado`, o documento articulado, apenas quando o texto inicial vem de arquivo importado; e `anexoParecer`, booleano. `texto` e `documentoImportado` MUST NOT estar presentes ao mesmo tempo.

#### Scenario: Substitutivo da CD a partir do texto referenciado
- **WHEN** o usuário conclui um substitutivo da `CD` com a opção do documento referenciado
- **THEN** o `detail` contém `urn`, `urnDocumentoReferenciado`, `epigrafe`, `preambulo`, `colegiadoDestino`, `texto` e `anexoParecer`

#### Scenario: Texto importado
- **WHEN** o usuário conclui com a opção de importação e a conversão tem sucesso
- **THEN** `documentoImportado` contém o documento articulado resultante, e o `detail` não contém `texto`

### Requirement: Texto inicial da edição
A Tela 2 SHALL perguntar "Como você quer iniciar?" com seleção única entre: texto vazio; importar documento (PDF, DOCX, TXT ou LexML); texto do documento referenciado (apenas em substitutivo, subemenda substitutiva ou PLV); texto de outra proposição. A opção padrão SHALL ser o texto do documento referenciado em substitutivo, subemenda substitutiva ou PLV e o texto vazio nos demais casos. O texto trazido nas duas últimas opções SHALL ser o texto original da proposição, obtido de um segundo serviço configurável pelo host, por URL com os mesmos placeholders de sigla, número e ano (mesmo formato dos valores da verificação): `200` devolve o texto estruturado em LexML no formato JSONIX, o mesmo usado ao abrir um documento, e `404` indica texto não encontrado (indisponível). Esse serviço SHALL ser consultado apenas quando uma dessas duas opções está escolhida, e MUST NOT ser consultado nas opções de texto vazio ou de importação. A opção de outra proposição SHALL aceitar qualquer sigla, ativa ou inativa.

#### Scenario: Texto obtido
- **WHEN** o usuário continua com a opção do documento referenciado ou de outra proposição e o serviço do texto retorna `200`
- **THEN** o JSON do texto estruturado é incluído no resultado como texto inicial

#### Scenario: Texto não encontrado
- **WHEN** o serviço do texto retorna `404`
- **THEN** o texto é tratado como indisponível, com o alerta e o bloqueio de **Continuar** do requisito "Texto estruturado indisponível"

#### Scenario: Falha na obtenção do texto
- **WHEN** o serviço do texto falha por erro de rede ou resposta diferente de `200` e `404`
- **THEN** o usuário é informado do erro e pode tentar **Continuar** novamente

#### Scenario: Opção padrão em substitutivo
- **WHEN** a Tela 2 é exibida para um substitutivo, subemenda substitutiva ou PLV
- **THEN** a opção "Texto do documento referenciado" vem selecionada

#### Scenario: Opção padrão nos demais casos
- **WHEN** a Tela 2 é exibida para um documento que não é substitutivo, subemenda substitutiva nem PLV
- **THEN** a opção "Texto vazio" vem selecionada e a opção do documento referenciado não é oferecida

#### Scenario: Outra proposição com sigla inativa
- **WHEN** o usuário escolhe "Texto de outra proposição" e informa uma sigla inativa
- **THEN** a sigla é aceita e a verificação segue a regra comum

#### Scenario: Voltar
- **WHEN** o usuário aciona **Voltar** na Tela 2
- **THEN** a Tela 1 é exibida com os dados informados preservados

### Requirement: Importação de arquivo
A opção de importação SHALL aceitar arquivos PDF, DOCX, TXT, XML ou JSON (extensões `.pdf`, `.docx`, `.txt`, `.xml` e `.json`) de até 5 MB, e o seletor de arquivo SHALL oferecer só essas extensões. Arquivo acima do limite ou de outra extensão MUST ser recusado com mensagem ao usuário, sem ser enviado à conversão. O arquivo `.json` SHALL ser lido pelo próprio componente (requisito "Importação de JSON"); os demais SHALL ser convertidos pela URL de importação (requisito "Conversão por URL") ou, quando informado, pelo callback `onImportarArquivo` (requisito "Callback de importação de arquivo").

#### Scenario: Formatos aceitos
- **WHEN** o usuário seleciona um arquivo `.pdf`, `.docx`, `.txt`, `.xml` ou `.json` de até 5 MB
- **THEN** o arquivo é aceito e **Continuar** é habilitado

#### Scenario: Importação simulada
- **WHEN** o callback `onImportarArquivo` não foi informado e o usuário importa um arquivo DOCX, TXT, PDF ou XML
- **THEN** o arquivo é enviado à URL de importação, e não há mais erro de parser simulado

#### Scenario: LexML em XML ou JSON
- **WHEN** o usuário seleciona um arquivo LexML em XML ou em JSON (JSONIX) de até 5 MB
- **THEN** o arquivo é aceito; o XML segue para a conversão e o JSON é lido pelo próprio componente

#### Scenario: Falha na conversão
- **WHEN** a conversão do arquivo importado pela URL falha (resposta `400`, `500` ou falha de rede)
- **THEN** a Tela 2 permanece com o alerta correspondente do requisito "Conversão por URL", sem ir à Tela 3

#### Scenario: Extensão não aceita
- **WHEN** o usuário seleciona um arquivo `.lexml` ou de outra extensão não aceita
- **THEN** o arquivo é recusado com mensagem, **Continuar** permanece desabilitado e nada é enviado à conversão

#### Scenario: Arquivo acima do limite
- **WHEN** o usuário seleciona um arquivo maior que 5 MB
- **THEN** o arquivo é recusado com mensagem e **Continuar** permanece desabilitado

### Requirement: Callbacks opcionais para as origens de dados
A configuração SHALL aceitar os callbacks opcionais `onObterComissoes`, `onVerificarProposicao`, `onObterTexto` e `onImportarArquivo`, que substituem, respectivamente, a URL de comissões, a URL de verificação, a URL do texto estruturado e a URL de importação. Existindo o callback, o componente SHALL usá-lo e MUST NOT chamar a URL da origem; não existindo, SHALL usar a URL. O callback MUST NOT alterar telas, regras de habilitação nem o resultado emitido.

#### Scenario: Callback existente
- **WHEN** a configuração informa `onVerificarProposicao` e o usuário aciona **Verificar**
- **THEN** o componente chama o callback e não faz requisição à URL de verificação

#### Scenario: Callback e URL informados
- **WHEN** a configuração informa a URL de comissões e o callback `onObterComissoes`
- **THEN** a lista de comissões vem do callback e a URL não é chamada

#### Scenario: Callback ausente
- **WHEN** a configuração informa só a URL de verificação
- **THEN** a verificação é feita pela URL, como antes

#### Scenario: Origens independentes
- **WHEN** a configuração informa o callback de uma origem e a URL das demais
- **THEN** cada origem usa o seu próprio mecanismo

#### Scenario: Callback de importação e URL informados
- **WHEN** a configuração informa `urlImportacaoArquivo` e `onImportarArquivo`, e o usuário importa um arquivo `.pdf`
- **THEN** o arquivo é tratado pelo callback e a URL de importação não é chamada

### Requirement: Callback de importação de arquivo
`onImportarArquivo` SHALL receber o arquivo selecionado, já validado quanto a extensão e tamanho (o callback MUST NOT ser chamado para arquivo recusado nem para arquivo `.json`), e devolver `{ texto?, erros }`, com `texto` o documento articulado e `erros` lista de mensagens. Com `erros` não vazio, o componente SHALL levar à Tela 3; com `erros` vazio, SHALL concluir com `texto` como documento importado. Promise rejeitada ou exceção SHALL ter o efeito da falha do serviço de conversão (requisito "Conversão por URL").

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

## ADDED Requirements

### Requirement: Conversão por URL
Sem o callback `onImportarArquivo`, o componente SHALL enviar o arquivo à URL de importação (`urlImportacaoArquivo`, sem placeholders) por `POST`, com o conteúdo do arquivo no corpo (não multipart) e o cabeçalho `Content-Type` determinado pela extensão: `application/pdf` (`.pdf`), `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (`.docx`), `text/plain` (`.txt`) e `application/xml` (`.xml`). A resposta `200` SHALL trazer no corpo o documento articulado em JSONIX, que conclui o fluxo como documento importado. A resposta `400` SHALL exibir na Tela 2 um alerta de aviso com o título "O arquivo não pôde ser importado", o corpo da resposta como texto puro (ou "O serviço de conversão recusou o arquivo.", se vazio) e a orientação "Selecione outro arquivo ou escolha outra forma de iniciar o texto.". Qualquer outra resposta, corpo `200` que não seja JSON ou falha de rede SHALL exibir na Tela 2 um alerta de erro "Não foi possível converter o arquivo "<nome do arquivo>": o serviço de conversão apresentou uma falha. Tente novamente em alguns instantes.", sem exibir o corpo da resposta. Nos dois alertas, o usuário SHALL permanecer na Tela 2, podendo trocar o arquivo ou acionar **Continuar** novamente, e o alerta SHALL sair ao trocar o arquivo ou a opção de texto inicial.

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

### Requirement: Importação de JSON
O arquivo `.json` SHALL ser lido pelo próprio componente como documento articulado em JSONIX, sem chamar a URL de importação nem o callback `onImportarArquivo`, e o conteúdo SHALL concluir o fluxo como documento importado. Conteúdo que não seja um JSON válido SHALL exibir na Tela 2 um alerta de aviso "O arquivo JSON não pôde ser lido: o conteúdo não é um JSON válido.", mantendo o usuário na Tela 2. O componente MUST NOT validar a estrutura do documento além de ser um JSON; essa validação é do `lexml-eta`.

#### Scenario: JSON lido direto
- **WHEN** o usuário importa um arquivo `.json` com um documento articulado
- **THEN** nenhuma requisição é feita, nenhum callback é chamado, e o `detail` contém o documento em `documentoImportado`

#### Scenario: JSON inválido
- **WHEN** o usuário importa um arquivo `.json` cujo conteúdo não é um JSON válido
- **THEN** a Tela 2 exibe o alerta de aviso de JSON inválido e o fluxo não é concluído
