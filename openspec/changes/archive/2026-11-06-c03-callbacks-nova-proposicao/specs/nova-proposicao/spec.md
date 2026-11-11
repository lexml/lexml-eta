## MODIFIED Requirements

### Requirement: Configuração e resultado do componente
O componente SHALL receber um objeto de configuração com a casa legislativa do editor (`casaLegislativaEditor`: `SF` ou `CD`) e, para cada uma das três origens de dados (verificação de proposição, texto estruturado e listagem das comissões), a URL correspondente ou o callback opcional que a substitui (requisito "Callbacks opcionais para as origens de dados"), e SHALL devolver ao host, por evento, um objeto de resultado com as informações coletadas. O componente MUST NOT criar o documento nem abrir a edição por conta própria.

#### Scenario: Conclusão do fluxo
- **WHEN** o usuário aciona **Continuar** na última tela aplicável
- **THEN** o componente emite um evento cujo `detail` contém: `urn`, `urnDocumentoReferenciado` (quando houver), `epigrafe`, `preambulo`, `colegiadoDestino`, `texto` (quando parte de documento existente) e `anexoParecer`

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

#### Scenario: Callback no lugar da URL
- **WHEN** a configuração não informa a URL de uma origem, mas informa o callback correspondente
- **THEN** a configuração é aceita para essa origem e as telas são exibidas

#### Scenario: Importação sem URL
- **WHEN** a configuração não informa `onImportarArquivo`
- **THEN** a configuração é aceita, pois a importação não depende de URL

### Requirement: Verificação de proposição e de medida provisória
O botão **Verificar** (grupos da proposição referenciada e da medida provisória) SHALL ser habilitado apenas com sigla, número e ano preenchidos. A origem da verificação é a URL de verificação ou, quando informado, o callback `onVerificarProposicao`. A URL SHALL conter placeholders de sigla, número e ano, substituídos pelos valores informados: a sigla em maiúsculas e o número sem zeros à esquerda. Resposta `200` SHALL trazer JSON com a ementa e o indicador de existência de texto estruturado, e MAY trazer o atributo `complementar` (booleano, padrão `false` quando ausente), que indica que o documento é uma proposição complementar; resposta `404` indica documento inexistente. A ementa SHALL ser somente leitura e apagada quando sigla, número ou ano mudar. Quando a sigla da proposição referenciada existe no vocabulário como lei ordinária e como lei complementar (PLS e PLC), a URN do documento referenciado e a do substitutivo do `SF` SHALL usar o tipo `projeto.lei.complementar` se `complementar` for `true` e `projeto.lei` caso contrário; para as demais siglas o atributo MUST NOT alterar a URN.

#### Scenario: Valores no placeholder
- **WHEN** o usuário informa sigla `pl`, número `0012` e ano `2026`
- **THEN** a URL é montada com `PL`, `12` e `2026`

#### Scenario: Existente
- **WHEN** a verificação retorna `200` com ementa e indicador de texto estruturado
- **THEN** a ementa é exibida e o documento passa a constar como verificado

#### Scenario: Inexistente
- **WHEN** a verificação retorna `404`
- **THEN** o usuário é informado de que o documento não foi encontrado, a ementa fica vazia e **Continuar** permanece desabilitado

#### Scenario: Alteração dos campos
- **WHEN** o usuário altera sigla, número ou ano após uma verificação
- **THEN** a ementa é apagada e o documento deixa de constar como verificado, junto com o valor de `complementar` recebido

#### Scenario: Falha de comunicação
- **WHEN** a verificação falha por erro de rede ou resposta diferente de `200` e `404`
- **THEN** o usuário é informado do erro, o documento não fica verificado, **Continuar** permanece desabilitado e **Verificar** continua habilitado para nova tentativa

#### Scenario: PLS complementar
- **WHEN** a sigla é PLS, a verificação retorna `200` com `complementar` igual a `true` e o usuário cria um substitutivo no `SF`
- **THEN** `urnDocumentoReferenciado` usa `projeto.lei.complementar` (`urn:lex:br:senado.federal:projeto.lei.complementar;pls:<ano>;<número>`) e a URN do substitutivo é essa mesma acrescida de `@apresentacao.substitutivo`

#### Scenario: PLS ordinário
- **WHEN** a sigla é PLS e a verificação retorna `200` sem o atributo `complementar`
- **THEN** a URN usa `projeto.lei`

#### Scenario: Atributo em outra sigla
- **WHEN** a sigla é PL e a verificação retorna `complementar` igual a `true`
- **THEN** a URN continua com o tipo de PL

### Requirement: Importação de arquivo
A opção de importação SHALL aceitar arquivos DOCX, TXT ou LexML de até 5 MB; o LexML SHALL poder estar em XML ou em JSON (formato JSONIX, o mesmo usado pelo componente ao abrir um documento). Arquivo acima do limite ou de outro formato MUST ser recusado com mensagem ao usuário, sem executar o parser. Falha do parser SHALL levar à Tela 3. O tratamento do arquivo é feito pelo callback `onImportarArquivo` (requisito "Callback de importação de arquivo"); quando ele não é informado, o tratamento real está fora do escopo e o componente SHALL simular o upload e responder com um erro de parser simulado, levando sempre à Tela 3, sem chamar nenhuma URL.

#### Scenario: Importação simulada
- **WHEN** o callback `onImportarArquivo` não foi informado, o usuário seleciona um arquivo DOCX, TXT ou LexML de até 5 MB e aciona **Continuar**
- **THEN** nenhuma URL é chamada e a Tela 3 exibe o nome do arquivo e um erro de parser simulado

#### Scenario: LexML em XML ou JSON
- **WHEN** o usuário seleciona um arquivo LexML em XML ou em JSON (JSONIX) de até 5 MB
- **THEN** o arquivo é aceito para importação e, sem o callback `onImportarArquivo`, segue o fluxo simulado (Tela 3 com erro de parser simulado)

#### Scenario: Arquivo acima do limite
- **WHEN** o usuário seleciona um arquivo maior que 5 MB
- **THEN** o arquivo é recusado com mensagem e **Continuar** permanece desabilitado

#### Scenario: Falha na conversão
- **WHEN** o parser do arquivo importado falha
- **THEN** a Tela 3 exibe o nome do arquivo e a lista de erros do parser

## ADDED Requirements

### Requirement: Callbacks opcionais para as origens de dados
A configuração SHALL aceitar os callbacks opcionais `onObterComissoes`, `onVerificarProposicao`, `onObterTexto` e `onImportarArquivo`, que substituem, respectivamente, a URL de comissões, a URL de verificação, a URL do texto estruturado e o simulador de importação. Existindo o callback, o componente SHALL usá-lo e MUST NOT chamar a URL da origem; não existindo, SHALL manter o comportamento atual. O callback MUST NOT alterar telas, regras de habilitação nem o resultado emitido.

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

### Requirement: Contrato dos callbacks de verificação e de texto
`onVerificarProposicao` e `onObterTexto` SHALL receber `{ sigla, numero, ano }` com os valores normalizados dos placeholders da URL (sigla em maiúsculas, número sem zeros à esquerda). `onVerificarProposicao` SHALL devolver `{ ementa, textoEstruturadoDisponivel?, complementar? }` (disponível quando ausente) ou `undefined` se inexistente; `onObterTexto` SHALL devolver o JSONIX ou `undefined` se indisponível. Promise rejeitada ou exceção SHALL ser falha de comunicação.

#### Scenario: Valores normalizados
- **WHEN** o usuário informa sigla `pl`, número `0012` e ano `2026` e aciona **Verificar**
- **THEN** o callback recebe `{ sigla: 'PL', numero: '12', ano: '2026' }`

#### Scenario: Verificação existente
- **WHEN** `onVerificarProposicao` devolve `{ ementa }`
- **THEN** a ementa é exibida, o documento consta como verificado e o texto estruturado é considerado disponível

#### Scenario: Verificação inexistente
- **WHEN** `onVerificarProposicao` devolve `undefined`
- **THEN** o resultado é o mesmo de resposta `404`: o usuário é informado de que o documento não foi encontrado e **Continuar** permanece desabilitado

#### Scenario: Verificação com falha
- **WHEN** `onVerificarProposicao` rejeita a promise
- **THEN** o resultado é o mesmo da falha de comunicação da verificação, com nova tentativa permitida

#### Scenario: Texto obtido
- **WHEN** `onObterTexto` devolve o JSONIX do documento
- **THEN** o texto é incluído no resultado como texto inicial

#### Scenario: Texto indisponível
- **WHEN** `onObterTexto` devolve `undefined`
- **THEN** o resultado é o mesmo de resposta `404`: o texto é tratado como indisponível, com o alerta e o bloqueio de **Continuar**

#### Scenario: Texto com falha
- **WHEN** `onObterTexto` rejeita a promise
- **THEN** o usuário é informado do erro e pode tentar **Continuar** novamente

### Requirement: Contrato do callback de comissões
`onObterComissoes` SHALL receber a casa (`SF`, `CD` ou `CN`), determinada pela autoridade da URN do novo documento, e devolver a lista de objetos `{ siglaCasaLegislativa, sigla, nome }`, no mesmo formato da resposta da URL de comissões; só os itens cuja `siglaCasaLegislativa` é igual à casa pedida SHALL ser usados. Promise rejeitada ou exceção SHALL ter o efeito da falha na obtenção das comissões. O callback SHALL valer também no modo de edição de dados básicos.

#### Scenario: Lista devolvida pelo callback
- **WHEN** o destino Comissão é oferecido para um documento do `SF` e `onObterComissoes` devolve comissões
- **THEN** o callback recebe `SF` e a lista de comissões do `SF` é oferecida

#### Scenario: Itens de outra casa
- **WHEN** `onObterComissoes` devolve itens de mais de uma casa
- **THEN** só os da casa pedida são oferecidos

#### Scenario: Falha no callback de comissões
- **WHEN** `onObterComissoes` rejeita a promise
- **THEN** a opção Comissão fica indisponível, só Plenário é oferecido e o padrão em substitutivo passa a ser Plenário

#### Scenario: Modo de edição
- **WHEN** o componente está no modo de edição de dados básicos e `onObterComissoes` foi informado
- **THEN** a lista de comissões vem do callback

### Requirement: Callback de importação de arquivo
`onImportarArquivo` SHALL receber o arquivo selecionado, já validado quanto a extensão e tamanho (o callback MUST NOT ser chamado para arquivo recusado), e devolver `{ texto?, erros }`, com `erros` lista de mensagens. Com `erros` não vazio, o componente SHALL levar à Tela 3; com `erros` vazio, SHALL concluir com o `texto` devolvido. Promise rejeitada ou exceção SHALL manter a Tela 2 com mensagem de erro de comunicação, permitindo novo **Continuar**.

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
- **THEN** a Tela 2 permanece com a mensagem de erro de comunicação da importação e **Continuar** pode ser acionado novamente

#### Scenario: Arquivo recusado
- **WHEN** o arquivo excede 5 MB ou tem extensão não aceita
- **THEN** o callback não é chamado
