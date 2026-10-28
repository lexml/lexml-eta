# Spec Delta

## Purpose

Define o comportamento e o contrato do componente de nova proposição: a coleta da identificação do documento (espécie, tipo, proposição referenciada, colegiado de destino, forma de apresentação) e a escolha do texto inicial, devolvendo o resultado ao host por evento.

## ADDED Requirements

### Requirement: Configuração e resultado do componente
O componente SHALL receber um objeto de configuração com a casa legislativa do editor (`SF` ou `CD`), a URL de verificação de proposição, a URL do texto estruturado e a URL de listagem das comissões, e SHALL devolver ao host, por evento, um objeto de resultado com as informações coletadas. O componente MUST NOT criar o documento nem abrir a edição por conta própria.

#### Scenario: Conclusão do fluxo
- **WHEN** o usuário aciona **Continuar** na última tela aplicável
- **THEN** o componente emite um evento cujo `detail` contém: `urn`, `urnDocumentoDeReferencia` (quando houver), `epigrafe`, `preambulo`, `colegiadoDestino`, `texto` (quando parte de documento existente) e `anexoParecer`

#### Scenario: Vocabulário inicializado pelo componente
- **WHEN** o componente é criado ou recebe uma nova configuração
- **THEN** ele inicializa o vocabulário para a casa legislativa da configuração, como o `lexml-eta`, sem depender de inicialização prévia pelo host

#### Scenario: Campos condicionais ausentes
- **WHEN** o documento não é substitutivo, subemenda substitutiva nem PLV, e o texto inicial é vazio
- **THEN** o `detail` não contém `urnDocumentoDeReferencia` nem `texto`

#### Scenario: Cancelamento
- **WHEN** o usuário aciona **Cancelar** em qualquer tela
- **THEN** o componente emite um evento de cancelamento, sem resultado, e descarta os dados informados

#### Scenario: Casa legislativa ausente
- **WHEN** a configuração não informa a casa legislativa
- **THEN** a casa assume o padrão `SF`

#### Scenario: URL de verificação ausente
- **WHEN** a configuração não informa a URL de verificação de proposição
- **THEN** a inicialização do componente falha com erro que identifica a URL ausente, e nenhuma tela é exibida

#### Scenario: URL de comissões ausente
- **WHEN** a configuração não informa a URL de comissões
- **THEN** a inicialização do componente falha com erro que identifica a URL ausente, e nenhuma tela é exibida

#### Scenario: URL do texto estruturado ausente
- **WHEN** a configuração não informa a URL do texto estruturado
- **THEN** a inicialização do componente falha com erro que identifica a URL ausente, e nenhuma tela é exibida

### Requirement: Conteúdo do resultado
O `detail` do evento de conclusão SHALL conter: `urn` (URN do novo documento); `urnDocumentoDeReferencia` (URN do documento referenciado, em substitutivo, subemenda substitutiva e PLV; no substitutivo do `SF` é a URN do documento referenciado sem o sufixo de versão do substitutivo); `epigrafe`, montada pelo serviço do vocabulário a partir de `urn` e `urnDocumentoDeReferencia`; `preambulo`, obtido do vocabulário; `colegiadoDestino` (tipo e, em Comissão, a sigla da comissão), sempre presente; `texto`, o documento articulado, apenas quando o texto inicial vem de documento existente (importação, documento referenciado ou outra proposição); e `anexoParecer`, booleano.

#### Scenario: Substitutivo da CD a partir do texto referenciado
- **WHEN** o usuário conclui um substitutivo da `CD` com a opção do documento referenciado
- **THEN** o `detail` contém `urn`, `urnDocumentoDeReferencia`, `epigrafe`, `preambulo`, `colegiadoDestino`, `texto` e `anexoParecer`

#### Scenario: Texto importado
- **WHEN** o usuário conclui com a opção de importação e o parser tem sucesso
- **THEN** `texto` contém o documento articulado resultante do parser

### Requirement: Epígrafe e preâmbulo fornecidos pelo vocabulário
O componente SHALL obter `epigrafe` e `preambulo` do vocabulário, sem montá-los por conta própria. A montagem da epígrafe a partir de `urn` e `urnDocumentoDeReferencia` é um serviço do vocabulário, especificado em outra issue, e o componente MUST depender apenas dessa interface.

#### Scenario: Epígrafe de substitutivo
- **WHEN** o fluxo é concluído para um substitutivo
- **THEN** a `epigrafe` do `detail` é a devolvida pelo serviço do vocabulário para as duas URNs

#### Scenario: Preâmbulo sem modelo
- **WHEN** o tipo do documento não tem preâmbulo padrão no vocabulário
- **THEN** `preambulo` é vazio

### Requirement: Espécie do documento
A Tela 1 SHALL oferecer, em seleção única, a espécie do documento: Proposição (padrão), Substitutivo e Subemenda substitutiva. A Subemenda substitutiva SHALL ser oferecida apenas na `CD`. A espécie MUST definir quais grupos de campos são exibidos e os padrões de destino e de forma de apresentação.

#### Scenario: Espécie padrão
- **WHEN** a Tela 1 é exibida
- **THEN** a espécie Proposição vem selecionada

#### Scenario: Subemenda substitutiva no SF
- **WHEN** a casa do editor é `SF`
- **THEN** a espécie Subemenda substitutiva não é oferecida

### Requirement: Identificação do substitutivo na CD
Na `CD`, quando a espécie é Substitutivo ou Subemenda substitutiva, a Tela 1 SHALL exibir a identificação do documento novo, com sigla, número `s/n` (não editável) e ano (padrão: ano corrente, editável). A lista de siglas SHALL conter os tipos ativos com `tipoRelacaoSubstitutivo` igual a `é substitutivo`, para Substitutivo, e `é subemenda substitutiva`, para Subemenda substitutiva. No `SF`, esse grupo MUST NOT ser exibido.

#### Scenario: Substitutivo na CD
- **WHEN** a casa é `CD` e a espécie é Substitutivo
- **THEN** a lista de siglas contém os tipos ativos que são substitutivo e nenhum que seja subemenda substitutiva

#### Scenario: Substitutivo no SF
- **WHEN** a casa é `SF` e a espécie é Substitutivo
- **THEN** o grupo de identificação do substitutivo não é exibido

### Requirement: Identificação da proposição
A Tela 1 SHALL exibir o grupo de identificação da proposição com sigla, número e ano, cujo uso depende da espécie:
- **Proposição:** a lista de siglas SHALL conter os tipos das autoridades da casa (`senado.federal` no `SF`; `camara.deputados` na `CD`) e de `congresso.nacional` que não são substitutivos nem subemendas substitutivas, com os inativos ao final, em cinza. A MPV (autoridade `federal`) MUST NOT constar. O número SHALL ser `s/n` (não editável), o ano editável com padrão no ano corrente, e **Verificar** e ementa MUST NOT ser exibidos.
- **Substitutivo ou Subemenda substitutiva:** o grupo identifica a proposição que recebe o documento. A lista de siglas SHALL conter todos os tipos, ativos e inativos, com `tipoRelacaoSubstitutivo` igual a `aceita substitutivo`, nas duas casas. Número e ano SHALL ser editáveis (ano com padrão no ano corrente), e **Verificar** e a ementa SHALL ser exibidos.

#### Scenario: Nova proposição no SF
- **WHEN** a casa é `SF` e a espécie é Proposição
- **THEN** a lista contém tipos de `senado.federal` e de `congresso.nacional` que não são substitutivos, ativos antes dos inativos, e nenhum de `camara.deputados` nem a MPV

#### Scenario: Nova proposição, número e verificação
- **WHEN** a espécie é Proposição
- **THEN** o número aparece como `s/n`, e **Verificar** e a ementa não são exibidos

#### Scenario: Subemenda substitutiva referencia a proposição original
- **WHEN** a espécie é Subemenda substitutiva (`CD`)
- **THEN** o grupo de identificação da proposição identifica a proposição original, e é ela que vai em `urnDocumentoDeReferencia`; a referência ao substitutivo é implícita e não é coletada

#### Scenario: Substitutivo, siglas referenciáveis
- **WHEN** a espécie é Substitutivo ou Subemenda substitutiva
- **THEN** a lista de siglas contém, ativas e inativas, as que aceitam substitutivo, e o número é editável

### Requirement: Sigla inativa em nova proposição
Quando a espécie é Proposição e a sigla escolhida é de um tipo inativo, a Tela 1 SHALL exibir, abaixo da seleção, um alerta de que a sigla está inativa e não deve ser usada para iniciar um texto novo. A sigla inativa MUST continuar selecionável e **Continuar** MUST NOT ser bloqueado por isso. A Tela 2 SHALL oferecer as mesmas opções de texto inicial das demais siglas, inclusive a de outra proposição.

#### Scenario: Sigla inativa selecionada
- **WHEN** o usuário escolhe uma sigla inativa em nova proposição
- **THEN** o alerta é exibido abaixo da seleção e **Continuar** segue habilitado

#### Scenario: Sigla ativa
- **WHEN** o usuário escolhe uma sigla ativa
- **THEN** o alerta não é exibido

### Requirement: Medida provisória do PLV
Quando a espécie é Proposição e a sigla é PLV, a Tela 1 SHALL exibir o grupo de identificação da medida provisória, com sigla MPV fixa, número e ano editáveis (ano com padrão no ano corrente), **Verificar** e a ementa. O grupo MUST NOT ser exibido para as demais siglas e espécies, e seus dados SHALL ir em `urnDocumentoDeReferencia`.

#### Scenario: PLV
- **WHEN** o usuário escolhe a sigla PLV
- **THEN** o grupo da medida provisória é exibido, com MPV fixa, e número e ano habilitados

#### Scenario: Outra sigla
- **WHEN** a sigla não é PLV
- **THEN** o grupo da medida provisória não é exibido

### Requirement: Verificação de proposição e de medida provisória
O botão **Verificar** (grupos da proposição referenciada e da medida provisória) SHALL ser habilitado apenas com sigla, número e ano preenchidos. A URL de verificação é obrigatória na configuração. A URL SHALL conter placeholders de sigla, número e ano, substituídos pelos valores informados: a sigla em maiúsculas e o número sem zeros à esquerda. Resposta `200` SHALL trazer JSON com a ementa e o indicador de existência de texto estruturado; resposta `404` indica documento inexistente. A ementa SHALL ser somente leitura e apagada quando sigla, número ou ano mudar.

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
- **THEN** a ementa é apagada e o documento deixa de constar como verificado

#### Scenario: Falha de comunicação
- **WHEN** a verificação falha por erro de rede ou resposta diferente de `200` e `404`
- **THEN** o usuário é informado do erro, o documento não fica verificado, **Continuar** permanece desabilitado e **Verificar** continua habilitado para nova tentativa

### Requirement: Destino do documento
A Tela 1 SHALL exibir sempre o colegiado de destino, com as opções Plenário e Comissão (sem "Plenário via comissão"). O padrão SHALL ser Comissão em Substitutivo e Subemenda substitutiva e Plenário nos demais casos. Em Comissão, a comissão SHALL ser informada, escolhida de uma lista obtida da URL de comissões da configuração, cujo placeholder de casa é preenchido pela autoridade da URN do novo documento: `SF` para `senado.federal`, `CD` para `camara.deputados` e `CN` para `congresso.nacional`. A resposta da URL SHALL ter o mesmo formato da usada pelo componente de destino atual: lista JSON de objetos com `siglaCasaLegislativa`, `sigla` e `nome`, da qual só são usados os itens cuja `siglaCasaLegislativa` é igual à casa pedida. O resultado SHALL informar o tipo do colegiado e, em Comissão, a sigla da comissão. A sigla da comissão alimenta a epígrafe do substitutivo do `SF`.

#### Scenario: Padrão em substitutivo
- **WHEN** a espécie é Substitutivo ou Subemenda substitutiva
- **THEN** o destino vem em Comissão

#### Scenario: Padrão em proposição
- **WHEN** a espécie é Proposição
- **THEN** o destino vem em Plenário

#### Scenario: Comissão sem sigla
- **WHEN** o destino é Comissão e nenhuma comissão foi escolhida
- **THEN** **Continuar** está desabilitado

#### Scenario: Destino Plenário
- **WHEN** o destino é Plenário
- **THEN** o resultado não contém sigla de comissão

#### Scenario: Comissão do Congresso
- **WHEN** o novo documento é de `congresso.nacional`
- **THEN** a lista de comissões é obtida com a casa `CN`

#### Scenario: Falha na obtenção das comissões
- **WHEN** a obtenção da lista de comissões falha por erro de rede ou resposta de erro
- **THEN** o usuário é informado do erro, a opção Comissão fica indisponível, só Plenário é oferecido e o padrão em substitutivo passa a ser Plenário

### Requirement: Forma de apresentação
A Tela 1 SHALL exibir a caixa de seleção "Este documento será apresentado em parecer", marcada por padrão em Substitutivo e Subemenda substitutiva e desmarcada em Proposição, e o resultado SHALL informá-la em `anexoParecer`.

#### Scenario: Padrão em substitutivo
- **WHEN** a espécie é Substitutivo ou Subemenda substitutiva
- **THEN** a caixa vem marcada

#### Scenario: Padrão em proposição
- **WHEN** a espécie é Proposição
- **THEN** a caixa vem desmarcada

#### Scenario: Alteração pelo usuário
- **WHEN** o usuário altera a caixa e conclui o fluxo
- **THEN** o `detail` contém `anexoParecer` com o valor escolhido

### Requirement: Continuar na Tela 1
**Continuar** na Tela 1 SHALL exigir a sigla da proposição escolhida (e, na `CD`, a do substitutivo ou subemenda), o destino válido e, quando o documento referencia outro (Substitutivo, Subemenda substitutiva ou PLV), o documento referenciado verificado e existente.

#### Scenario: Referência exigida e não verificada
- **WHEN** o documento é substitutivo, subemenda substitutiva ou PLV e a referência não foi verificada
- **THEN** **Continuar** está desabilitado

### Requirement: Texto inicial da edição
A Tela 2 SHALL perguntar "Como você quer iniciar?" com seleção única entre: texto vazio; importar documento (DOCX, TXT ou LexML); texto do documento referenciado (apenas em substitutivo, subemenda substitutiva ou PLV); texto de outra proposição. A opção padrão SHALL ser o texto do documento referenciado em substitutivo, subemenda substitutiva ou PLV e o texto vazio nos demais casos. O texto trazido nas duas últimas opções SHALL ser o texto original da proposição, obtido de um segundo serviço configurável pelo host, por URL com os mesmos placeholders de sigla, número e ano (mesmo formato dos valores da verificação): `200` devolve o texto estruturado em LexML no formato JSONIX, o mesmo usado ao abrir um documento, e `404` indica texto não encontrado (indisponível). Esse serviço SHALL ser consultado apenas quando uma dessas duas opções está escolhida, e MUST NOT ser consultado nas opções de texto vazio ou de importação. A opção de outra proposição SHALL aceitar qualquer sigla, ativa ou inativa.

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

### Requirement: Texto estruturado indisponível
Quando o texto da proposição escolhida (opção do documento referenciado ou de outra proposição) não estiver disponível em formato estruturado, o componente SHALL exibir o alerta "Texto estruturado não disponível para edição" e SHALL desabilitar **Continuar** apenas enquanto essa opção estiver escolhida.

#### Scenario: Indisponibilidade
- **WHEN** a verificação indica texto estruturado indisponível e a opção correspondente está escolhida
- **THEN** o alerta é exibido e **Continuar** está desabilitado

#### Scenario: Troca de opção
- **WHEN** o usuário troca para "Texto vazio" ou "Importar documento"
- **THEN** **Continuar** é habilitado

### Requirement: Importação de arquivo
A opção de importação SHALL aceitar arquivos DOCX, TXT ou LexML de até 5 MB. Arquivo acima do limite ou de outro formato MUST ser recusado com mensagem ao usuário, sem executar o parser. Falha do parser SHALL levar à Tela 3.

#### Scenario: Arquivo acima do limite
- **WHEN** o usuário seleciona um arquivo maior que 5 MB
- **THEN** o arquivo é recusado com mensagem e **Continuar** permanece desabilitado

#### Scenario: Falha na conversão
- **WHEN** o parser do arquivo importado falha
- **THEN** a Tela 3 exibe o nome do arquivo e a lista de erros do parser

### Requirement: Tela de erro de conversão
A Tela 3 SHALL exibir o cabeçalho com a identificação do novo documento, a lista de erros e a orientação para corrigir o arquivo ou iniciar com documento vazio. **Continuar** SHALL concluir o fluxo com texto vazio, **Voltar** SHALL retornar à Tela 2 e **Cancelar** SHALL encerrar sem resultado.

#### Scenario: Continuar com documento vazio
- **WHEN** o usuário aciona **Continuar** na Tela 3
- **THEN** o resultado indica texto inicial vazio

### Requirement: Identificação exibida do novo documento
O cabeçalho das Telas 2 e 3 SHALL identificar o documento por: nome do tipo, quando não é substitutivo, subemenda substitutiva nem PLV; "Projeto de Lei de Conversão (Medida Provisória nº N de A)", no PLV; "Substitutivo ao/à <tipo> nº N de A", no substitutivo; "Subemenda Substitutiva ao/à <tipo> nº N de A", na subemenda substitutiva (só na `CD`).

#### Scenario: Substitutivo
- **WHEN** o documento é substitutivo ao Projeto de Lei nº 12 de 2026
- **THEN** o cabeçalho exibe "Substitutivo ao Projeto de Lei nº 12 de 2026"

### Requirement: URN do novo documento
A URN do novo documento SHALL ser composta por autoridade, tipo, ano, número e versão. Substitutivo do `SF` SHALL usar a URN da proposição identificada acrescida de `@apresentacao.substitutivo`. Na `CD`, substitutivo e subemenda substitutiva SHALL usar o tipo e o ano do grupo de identificação do substitutivo e o número `999999`, sem versão. Os demais documentos, inclusive PLV, SHALL usar a sigla e o ano da proposição, o número `999999` e nenhuma versão. Em substitutivo e subemenda substitutiva (`SF` e `CD`) e no PLV, o documento referenciado SHALL ir em `urnDocumentoDeReferencia` (na subemenda substitutiva, a proposição original, não o substitutivo); no substitutivo do `SF` ela é a URN do documento referenciado sem o sufixo de versão. A URN de substitutivo, nas duas casas, SHALL ser reconhecida por `isSubstitutivo`, e a de subemenda substitutiva MUST NOT.

#### Scenario: Substitutivo do SF
- **WHEN** o substitutivo referencia `urn:lex:br:senado.federal:projeto.lei;pl:2026;12`
- **THEN** a URN do novo documento é `urn:lex:br:senado.federal:projeto.lei;pl:2026;12@apresentacao.substitutivo`, `urnDocumentoDeReferencia` é `urn:lex:br:senado.federal:projeto.lei;pl:2026;12` e `isSubstitutivo(urn)` é verdadeiro

#### Scenario: Substitutivo da CD
- **WHEN** é criado, em 2026, um substitutivo da `CD` de sigla SBT referenciando `urn:lex:br:camara.deputados:projeto.lei;pl:2026;12`
- **THEN** a URN é `urn:lex:br:camara.deputados:substitutivo;sbt:2026;999999`, `urnDocumentoDeReferencia` é a do PL e `isSubstitutivo(urn)` é verdadeiro

#### Scenario: Subemenda substitutiva da CD
- **WHEN** é criada uma subemenda substitutiva da `CD`
- **THEN** a URN usa o tipo da subemenda, o número `999999` e `isSubstitutivo(urn)` é falso

#### Scenario: Documento não numerado
- **WHEN** é criado um PL no `SF` em 2026
- **THEN** a URN é `urn:lex:br:senado.federal:projeto.lei;pl:2026;999999`

#### Scenario: PLV
- **WHEN** é criado um PLV referenciando a MPV nº 4321 de 2026
- **THEN** a URN é `urn:lex:br:congresso.nacional:projeto.lei.conversao;plv:2026;999999` e `urnDocumentoDeReferencia` é `urn:lex:br:federal:medida.provisoria;mpv:2026;4321`
