# Nova Proposição

## Purpose

Define o comportamento e o contrato do componente de nova proposição: a coleta da identificação do documento (espécie, tipo, proposição referenciada, colegiado de destino, forma de apresentação) e a escolha do texto inicial, devolvendo o resultado ao host por evento.

## Requirements

### Requirement: Configuração e resultado do componente
O componente SHALL receber um objeto de configuração com a casa legislativa do editor (`casaLegislativaEditor`: `SF` ou `CD`), a URL de verificação de proposição, a URL do texto estruturado e a URL de listagem das comissões, e SHALL devolver ao host, por evento, um objeto de resultado com as informações coletadas. O componente MUST NOT criar o documento nem abrir a edição por conta própria.

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
- **WHEN** a configuração não informa a URL de verificação de proposição
- **THEN** a inicialização do componente falha com erro que identifica a URL ausente, e nenhuma tela é exibida

#### Scenario: URL de comissões ausente
- **WHEN** a configuração não informa a URL de comissões
- **THEN** a inicialização do componente falha com erro que identifica a URL ausente, e nenhuma tela é exibida

#### Scenario: URL do texto estruturado ausente
- **WHEN** a configuração não informa a URL do texto estruturado
- **THEN** a inicialização do componente falha com erro que identifica a URL ausente, e nenhuma tela é exibida

### Requirement: Conteúdo do resultado
O `detail` do evento de conclusão SHALL conter: `urn` (URN do novo documento); `urnDocumentoReferenciado` (URN do documento referenciado, em substitutivo, subemenda substitutiva e PLV; no substitutivo do `SF` é a URN do documento referenciado sem o sufixo de versão do substitutivo); `epigrafe`, montada pelo serviço do vocabulário a partir de `urn` e `urnDocumentoReferenciado`; `preambulo`, obtido do vocabulário; `colegiadoDestino` (tipo e, em Comissão, a sigla da comissão), sempre presente; `texto`, o documento articulado, apenas quando o texto inicial vem de documento existente (importação, documento referenciado ou outra proposição); e `anexoParecer`, booleano.

#### Scenario: Substitutivo da CD a partir do texto referenciado
- **WHEN** o usuário conclui um substitutivo da `CD` com a opção do documento referenciado
- **THEN** o `detail` contém `urn`, `urnDocumentoReferenciado`, `epigrafe`, `preambulo`, `colegiadoDestino`, `texto` e `anexoParecer`

#### Scenario: Texto importado
- **WHEN** o usuário conclui com a opção de importação e o parser tem sucesso
- **THEN** `texto` contém o documento articulado resultante do parser

### Requirement: Epígrafe e preâmbulo fornecidos pelo vocabulário
O componente SHALL obter `preambulo` do vocabulário (texto padrão por tipo e autoridade) e `epigrafe` do serviço de epígrafe do vocabulário (issue #1053), a partir de `urn`, `urnDocumentoReferenciado` e um sufixo opcional, e MUST depender apenas dessa interface. No `SF`, o componente SHALL informar o sufixo `- PLEN` quando o destino é Plenário e `- <sigla da comissão>` quando é Comissão; na `CD`, MUST NOT informar sufixo. Enquanto o serviço não estiver implementado, o componente SHALL gerar a epígrafe do caso padrão, sem sufixo, (`<TIPO DO DOCUMENTO POR EXTENSO EM MAIÚSCULAS> Nº   , DE <ANO>`, número em branco e ano corrente), sem alterar o contrato do evento. Quando o tipo não tiver texto padrão, o próprio componente SHALL aplicar o fallback do preâmbulo, sem alterar a função de obtenção do texto padrão nem a abertura de documentos.

#### Scenario: Epígrafe de substitutivo
- **WHEN** o fluxo é concluído para um substitutivo
- **THEN** a `epigrafe` do `detail` é a devolvida pelo serviço do vocabulário para as duas URNs

#### Scenario: Sufixo no SF com destino Plenário
- **WHEN** a casa é `SF` e o destino é Plenário
- **THEN** o componente chama o serviço de epígrafe com o sufixo `- PLEN`

#### Scenario: Sufixo no SF com destino Comissão
- **WHEN** a casa é `SF` e o destino é a comissão de sigla `CCJ`
- **THEN** o componente chama o serviço de epígrafe com o sufixo `- CCJ`

#### Scenario: Sem sufixo na CD
- **WHEN** a casa é `CD`
- **THEN** o componente chama o serviço de epígrafe sem sufixo

#### Scenario: Serviço de epígrafe ainda não implementado
- **WHEN** o fluxo é concluído e o serviço de epígrafe do vocabulário não está disponível
- **THEN** a `epigrafe` do `detail` é a do caso padrão, com o tipo por extenso em maiúsculas, número em branco e o ano corrente

#### Scenario: Preâmbulo sem modelo
- **WHEN** o tipo do documento não tem preâmbulo padrão no vocabulário
- **THEN** o componente registra um log de erro de preâmbulo não encontrado para a URN e usa `O CONGRESSO NACIONAL decreta:` em `preambulo`; a abertura de documentos de tipo sem modelo continua sem preâmbulo e sem log

### Requirement: Espécie do documento
A Tela 1 SHALL oferecer, em seleção única, a espécie do documento: Proposição (padrão), Substitutivo e Subemenda substitutiva. A Subemenda substitutiva SHALL ser oferecida apenas na `CD`. A espécie MUST definir quais grupos de campos são exibidos e os padrões de destino e de forma de apresentação.

#### Scenario: Espécie padrão
- **WHEN** a Tela 1 é exibida
- **THEN** a espécie Proposição vem selecionada

#### Scenario: Subemenda substitutiva no SF
- **WHEN** a casa do editor é `SF`
- **THEN** a espécie Subemenda substitutiva não é oferecida

### Requirement: Identificação do substitutivo na CD
Na `CD`, quando a espécie é Substitutivo ou Subemenda substitutiva, a Tela 1 MUST NOT exibir o grupo de identificação do documento novo. O tipo SHALL ser derivado da espécie, sem escolha do usuário: `SBT` para Substitutivo e `SSP` para Subemenda substitutiva, resolvidos pela sigla no vocabulário da casa; se a sigla não existir no vocabulário, o componente SHALL falhar com erro que a identifica. O número SHALL ser `999999` e o ano SHALL ser o ano corrente, sem campo de edição; no modo de edição, o ano é o da URN inicial (requisito "Tela 1 preenchida a partir dos dados iniciais"). No `SF`, o grupo também MUST NOT ser exibido.

#### Scenario: Substitutivo na CD
- **WHEN** a casa é `CD` e a espécie é Substitutivo
- **THEN** o grupo de identificação do substitutivo não é exibido e o documento novo é do tipo `SBT`, com o ano corrente

#### Scenario: Subemenda substitutiva na CD
- **WHEN** a casa é `CD` e a espécie é Subemenda substitutiva
- **THEN** o grupo de identificação da subemenda não é exibido e o documento novo é do tipo `SSP`, com o ano corrente

#### Scenario: Troca de espécie na CD
- **WHEN** a casa é `CD` e o usuário troca a espécie de Substitutivo para Subemenda substitutiva
- **THEN** o tipo do documento novo passa de `SBT` para `SSP`, sem que o usuário escolha sigla

#### Scenario: Tipo ausente do vocabulário
- **WHEN** a casa é `CD`, a espécie é Substitutivo e o vocabulário não tem o tipo `SBT`
- **THEN** o componente falha com erro que identifica a sigla ausente

#### Scenario: Substitutivo no SF
- **WHEN** a casa é `SF` e a espécie é Substitutivo
- **THEN** o grupo de identificação do substitutivo não é exibido e a URN continua montada a partir da proposição identificada

### Requirement: Identificação da proposição
A Tela 1 SHALL exibir o grupo de identificação da proposição com sigla, número e ano, cujo uso depende da espécie:
- **Proposição:** a lista de siglas SHALL conter apenas os tipos **ativos** das autoridades da casa (`senado.federal` no `SF`; `camara.deputados` na `CD`) e de `congresso.nacional` que não são substitutivos nem subemendas substitutivas, em ordem alfabética da sigla. Tipos inativos MUST NOT ser oferecidos para iniciar uma proposição nova. A MPV (autoridade `federal`) MUST NOT constar. O número SHALL ser `s/n` (não editável), o ano editável com padrão no ano corrente, e **Verificar** e ementa MUST NOT ser exibidos.
- **Substitutivo ou Subemenda substitutiva:** o grupo identifica a proposição que recebe o documento. A lista de siglas SHALL conter as siglas, ativas e inativas, do vocabulário da casa com `tipoRelacaoSubstitutivo` igual a `aceita substitutivo`, **uma única vez cada** (sigla repetida em mais de um tipo, como PLS e PLC, SHALL aparecer uma só vez), com ativas antes das inativas (cada grupo em ordem alfabética) e inativas em cinza e selecionáveis. A URN da proposição referenciada SHALL usar a autoridade do tipo escolhido e, quando a sigla existir como lei ordinária e como lei complementar, o tipo definido pela regra de URN de proposição referenciada (requisito "Verificação de proposição e de medida provisória"). Número e ano SHALL ser editáveis (ano com padrão no ano corrente), e **Verificar** e a ementa SHALL ser exibidos.

#### Scenario: Nova proposição no SF
- **WHEN** a casa é `SF` e a espécie é Proposição
- **THEN** a lista contém apenas tipos ativos de `senado.federal` e de `congresso.nacional` que não são substitutivos, em ordem alfabética, e nenhum de `camara.deputados`, nenhum inativo (como PLS e PLC) nem a MPV

#### Scenario: Nova proposição, número e verificação
- **WHEN** a espécie é Proposição
- **THEN** o número aparece como `s/n`, e **Verificar** e a ementa não são exibidos

#### Scenario: Subemenda substitutiva referencia a proposição original
- **WHEN** a espécie é Subemenda substitutiva (`CD`)
- **THEN** o grupo de identificação da proposição identifica a proposição original, e é ela que vai em `urnDocumentoReferenciado`; a referência ao substitutivo é implícita e não é coletada

#### Scenario: Substitutivo, siglas referenciáveis
- **WHEN** a espécie é Substitutivo ou Subemenda substitutiva
- **THEN** a lista de siglas contém, ativas e inativas, as que aceitam substitutivo, cada sigla uma só vez, e o número é editável

#### Scenario: Sigla repetida no vocabulário
- **WHEN** a espécie é Substitutivo no `SF` e a lista de siglas é aberta
- **THEN** PLS e PLC aparecem uma única vez cada, em cinza

### Requirement: Medida provisória do PLV
Quando a espécie é Proposição e a sigla é PLV, a Tela 1 SHALL exibir o grupo de identificação da medida provisória, com sigla MPV fixa, número e ano editáveis (ano com padrão no ano corrente), **Verificar** e a ementa. O grupo MUST NOT ser exibido para as demais siglas e espécies, e seus dados SHALL ir em `urnDocumentoReferenciado`.

#### Scenario: PLV
- **WHEN** o usuário escolhe a sigla PLV
- **THEN** o grupo da medida provisória é exibido, com MPV fixa, e número e ano habilitados

#### Scenario: Outra sigla
- **WHEN** a sigla não é PLV
- **THEN** o grupo da medida provisória não é exibido

### Requirement: Verificação de proposição e de medida provisória
O botão **Verificar** (grupos da proposição referenciada e da medida provisória) SHALL ser habilitado apenas com sigla, número e ano preenchidos. A URL de verificação é obrigatória na configuração. A URL SHALL conter placeholders de sigla, número e ano, substituídos pelos valores informados: a sigla em maiúsculas e o número sem zeros à esquerda. Resposta `200` SHALL trazer JSON com a ementa e o indicador de existência de texto estruturado, e MAY trazer o atributo `complementar` (booleano, padrão `false` quando ausente), que indica que o documento é uma proposição complementar; resposta `404` indica documento inexistente. A ementa SHALL ser somente leitura e apagada quando sigla, número ou ano mudar. Quando a sigla da proposição referenciada existe no vocabulário como lei ordinária e como lei complementar (PLS e PLC), a URN do documento referenciado e a do substitutivo do `SF` SHALL usar o tipo `projeto.lei.complementar` se `complementar` for `true` e `projeto.lei` caso contrário; para as demais siglas o atributo MUST NOT alterar a URN.

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

### Requirement: Destino do documento
A Tela 1 SHALL exibir sempre o colegiado de destino, com as opções Plenário e Comissão (sem "Plenário via comissão"). O padrão SHALL ser Comissão em Substitutivo e Subemenda substitutiva e Plenário nos demais casos. Em Comissão, a comissão SHALL ser informada, escolhida de uma lista obtida da URL de comissões da configuração, cujo placeholder de casa é preenchido pela autoridade da URN do novo documento: `SF` para `senado.federal`, `CD` para `camara.deputados` e `CN` para `congresso.nacional`. A resposta da URL SHALL ter o mesmo formato da usada pelo componente de destino atual: lista JSON de objetos com `siglaCasaLegislativa`, `sigla` e `nome`, da qual só são usados os itens cuja `siglaCasaLegislativa` é igual à casa pedida. O resultado SHALL informar o tipo do colegiado e, em Comissão, a sigla da comissão. No `SF`, o destino alimenta o sufixo opcional do serviço de epígrafe.

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
**Continuar** na Tela 1 SHALL exigir a sigla da proposição escolhida, o destino válido e, quando o documento referencia outro (Substitutivo, Subemenda substitutiva ou PLV), o documento referenciado verificado e existente. Na `CD`, o tipo e o ano do substitutivo ou da subemenda MUST NOT ser exigidos do usuário.

#### Scenario: Referência exigida e não verificada
- **WHEN** o documento é substitutivo, subemenda substitutiva ou PLV e a referência não foi verificada
- **THEN** **Continuar** está desabilitado

#### Scenario: Substitutivo da CD sem identificação própria
- **WHEN** a casa é `CD`, a espécie é Substitutivo, a proposição referenciada foi verificada e o destino é válido
- **THEN** **Continuar** está habilitado, sem que nenhuma sigla ou ano do substitutivo tenha sido informado

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
A opção de importação SHALL aceitar arquivos DOCX, TXT ou LexML de até 5 MB; o LexML SHALL poder estar em XML ou em JSON (formato JSONIX, o mesmo usado pelo componente ao abrir um documento). Arquivo acima do limite ou de outro formato MUST ser recusado com mensagem ao usuário, sem executar o parser. Falha do parser SHALL levar à Tela 3. Nesta etapa o tratamento real do arquivo está fora do escopo: o componente SHALL simular o upload e SHALL responder com um erro de parser simulado, levando sempre à Tela 3, sem chamar nenhuma URL.

#### Scenario: Importação simulada
- **WHEN** o usuário seleciona um arquivo DOCX, TXT ou LexML de até 5 MB e aciona **Continuar**
- **THEN** nenhuma URL é chamada e a Tela 3 exibe o nome do arquivo e um erro de parser simulado

#### Scenario: LexML em XML ou JSON
- **WHEN** o usuário seleciona um arquivo LexML em XML ou em JSON (JSONIX) de até 5 MB
- **THEN** o arquivo é aceito para importação e, nesta etapa, segue o fluxo simulado (Tela 3 com erro de parser simulado)

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
O cabeçalho das Telas 2 e 3 SHALL identificar o documento por: nome do tipo, quando não é substitutivo, subemenda substitutiva nem PLV; "Projeto de Lei de Conversão (Medida Provisória nº N de A)", no PLV; "Substitutivo ao/à <tipo> nº N de A", no substitutivo; "Subemenda Substitutiva ao/à <tipo> nº N de A", na subemenda substitutiva (só na `CD`). A identificação SHALL ser precedida de "Novo" ou "Nova", concordando com o gênero do documento: o gênero do tipo da proposição; sempre "Novo" no substitutivo; sempre "Nova" na subemenda substitutiva.

#### Scenario: Substitutivo
- **WHEN** o documento é substitutivo ao Projeto de Lei nº 12 de 2026
- **THEN** o cabeçalho exibe "Novo Substitutivo ao Projeto de Lei nº 12 de 2026."

#### Scenario: Tipo masculino
- **WHEN** o documento é um Projeto de Lei
- **THEN** o cabeçalho exibe "Novo Projeto de Lei."

#### Scenario: Tipo feminino
- **WHEN** o documento é uma Proposta de Emenda Constitucional
- **THEN** o cabeçalho exibe "Nova Proposta de Emenda Constitucional."

### Requirement: URN do novo documento
A URN do novo documento SHALL ser composta por autoridade, tipo, ano, número e versão. Substitutivo do `SF` SHALL usar a URN da proposição identificada acrescida de `@apresentacao.substitutivo`. Na `CD`, substitutivo e subemenda substitutiva SHALL usar o tipo derivado da espécie (`SBT` ou `SSP`), o ano definido no requisito "Identificação do substitutivo na CD" e o número `999999`, sem versão. Os demais documentos, inclusive PLV, SHALL usar a sigla e o ano da proposição, o número `999999` e nenhuma versão. Em substitutivo e subemenda substitutiva (`SF` e `CD`) e no PLV, o documento referenciado SHALL ir em `urnDocumentoReferenciado` (na subemenda substitutiva, a proposição original, não o substitutivo); no substitutivo do `SF` ela é a URN do documento referenciado sem o sufixo de versão. A URN de substitutivo, nas duas casas, SHALL ser reconhecida por `isSubstitutivo`, e a de subemenda substitutiva MUST NOT.

#### Scenario: Substitutivo do SF
- **WHEN** o substitutivo referencia `urn:lex:br:senado.federal:projeto.lei;pl:2026;12`
- **THEN** a URN do novo documento é `urn:lex:br:senado.federal:projeto.lei;pl:2026;12@apresentacao.substitutivo`, `urnDocumentoReferenciado` é `urn:lex:br:senado.federal:projeto.lei;pl:2026;12` e `isSubstitutivo(urn)` é verdadeiro

#### Scenario: Substitutivo da CD
- **WHEN** é criado, em 2026, um substitutivo da `CD` referenciando `urn:lex:br:camara.deputados:projeto.lei;pl:2026;12`
- **THEN** a URN é `urn:lex:br:camara.deputados:substitutivo;sbt:2026;999999`, `urnDocumentoReferenciado` é a do PL e `isSubstitutivo(urn)` é verdadeiro

#### Scenario: Subemenda substitutiva da CD
- **WHEN** é criada, em 2026, uma subemenda substitutiva da `CD`
- **THEN** a URN é `urn:lex:br:camara.deputados:subemenda.substitutiva;ssp:2026;999999` e `isSubstitutivo(urn)` é falso

#### Scenario: Documento não numerado
- **WHEN** é criado um PL no `SF` em 2026
- **THEN** a URN é `urn:lex:br:senado.federal:projeto.lei;pl:2026;999999`

#### Scenario: PLV
- **WHEN** é criado um PLV referenciando a MPV nº 4321 de 2026
- **THEN** a URN é `urn:lex:br:congresso.nacional:projeto.lei.conversao;plv:2026;999999` e `urnDocumentoReferenciado` é `urn:lex:br:federal:medida.provisoria;mpv:2026;4321`

### Requirement: Sigla do texto de outra proposição
Na opção "Texto de outra proposição", a sigla SHALL ser escolhida, e não digitada livremente, entre todas as siglas do vocabulário da casa do editor, ativas e inativas, inclusive a MPV, **uma única vez cada** (sigla repetida em mais de um tipo, como PLS e PLC, aparece uma só vez), com as ativas antes das inativas (cada grupo em ordem alfabética) e as inativas em cinza e selecionáveis. Número e ano SHALL ser informados nos campos do grupo, na mesma linha. A verificação e a busca do texto usam apenas sigla, número e ano.

#### Scenario: Lista da outra proposição
- **WHEN** o usuário abre a lista de siglas da outra proposição
- **THEN** a lista contém todas as siglas da casa do editor, ativas e inativas, inclusive a MPV, cada uma uma só vez, com as inativas ao final em cinza

#### Scenario: Sigla repetida no vocabulário
- **WHEN** o usuário abre a lista de siglas da outra proposição no `SF`
- **THEN** PLS e PLC aparecem uma única vez cada

### Requirement: Modo de edição de dados básicos
O componente SHALL oferecer um modo de edição de dados básicos, ativado pelo host por `iniciarModoEdicao`, junto com os dados iniciais: `urn` (obrigatória), `urnDocumentoReferenciado`, `colegiadoApreciador` e `anexoParecer`. Nesse modo, o componente SHALL exibir só a Tela 1, com o título "Alterar dados básicos" e os botões **Continuar** e **Cancelar**.

#### Scenario: Abrir em modo de edição
- **WHEN** o host ativa o modo de edição com os dados de um PL do Senado
- **THEN** o componente exibe a Tela 1 com o título "Alterar dados básicos", sem acesso às Telas 2 e 3

#### Scenario: Cancelar a edição
- **WHEN** o usuário clica em **Cancelar** no modo de edição
- **THEN** o componente emite o evento de cancelamento, sem resultado

### Requirement: Tela 1 preenchida a partir dos dados iniciais
No modo de edição, a Tela 1 SHALL ser preenchida a partir dos dados iniciais: espécie, siglas, número e ano lidos da URN e da URN do documento referenciado; destino lido do colegiado; forma de apresentação lida de `anexoParecer`. O PLV SHALL ser reconhecido pela sigla do tipo da própria URN, e a medida provisória lida da URN do documento referenciado. Na `CD`, o ano do substitutivo ou da subemenda substitutiva SHALL ser o da URN inicial, mantido mesmo quando o usuário troca a espécie entre Substitutivo e Subemenda substitutiva; quando a URN inicial não é de substitutivo nem de subemenda substitutiva, o ano SHALL ser o corrente.

#### Scenario: Substitutivo do Senado
- **WHEN** a URN inicial é de substitutivo do Senado ao PL nº 10, de 2025
- **THEN** a espécie é Substitutivo e a proposição identificada é o PL nº 10, de 2025

#### Scenario: PLV
- **WHEN** a URN inicial é de PLV e a URN do documento referenciado é da MPV nº 1200, de 2026
- **THEN** a espécie é Proposição, a sigla é PLV e a medida provisória é a nº 1200, de 2026

#### Scenario: Subemenda substitutiva na Câmara
- **WHEN** a URN inicial é de subemenda substitutiva da Câmara de 2025 cujo documento referenciado é o PL nº 10, de 2025
- **THEN** a espécie é Subemenda substitutiva, o PL nº 10, de 2025 é a proposição, o grupo de identificação da subemenda não é exibido e o ano do documento é 2025

#### Scenario: Ano preservado na troca de espécie
- **WHEN** a URN inicial é de substitutivo da Câmara de 2025 e o usuário troca a espécie para Subemenda substitutiva
- **THEN** a URN do resultado usa o tipo `SSP` e o ano 2025

#### Scenario: Ano preservado ao alterar o destino
- **WHEN** a URN inicial é de substitutivo da Câmara de 2025 e o usuário só troca o destino
- **THEN** a URN do resultado mantém o ano 2025

### Requirement: Número do documento preservado
No modo de edição, quando a URN inicial tem número diferente de `999999`, o componente SHALL exibir esse número como texto fixo no lugar de `s/n`, quando o documento tem campo de número na Tela 1, e SHALL mantê-lo na URN do resultado enquanto a espécie e a sigla do documento não mudarem. Na `CD`, em substitutivo e subemenda substitutiva, o número SHALL ser mantido na URN sem ser exibido, já que o grupo de identificação do documento não é exibido. Mudando espécie ou sigla, o número SHALL voltar a `s/n` (`999999`).

#### Scenario: Só o colegiado muda
- **WHEN** a URN inicial é do PL nº 123, de 2026 e o usuário só troca o destino
- **THEN** a URN do resultado mantém o número 123

#### Scenario: Sigla muda
- **WHEN** a URN inicial é do PL nº 123, de 2026 e o usuário troca a sigla para PLP
- **THEN** a URN do resultado tem o número `999999`

#### Scenario: Substitutivo da CD com número real
- **WHEN** a URN inicial é de substitutivo da Câmara nº 7, de 2026 e o usuário só troca o destino
- **THEN** a URN do resultado mantém o número 7, embora a Tela 1 não o exiba

### Requirement: Documento referenciado inicial considerado verificado
No modo de edição, o documento referenciado vindo dos dados iniciais (proposição do substitutivo ou da subemenda, ou medida provisória do PLV) SHALL ser considerado verificado e existente, sem consultar a URL de verificação, até o usuário mudar sua sigla, número ou ano.

#### Scenario: Continuar sem verificar
- **WHEN** um substitutivo é aberto em modo de edição e o usuário só troca o destino
- **THEN** **Continuar** fica habilitado sem que o usuário clique em **Verificar**

#### Scenario: Referência alterada
- **WHEN** o usuário muda o número da proposição referenciada
- **THEN** a verificação passa a ser exigida para habilitar **Continuar**

### Requirement: Confirmação de perda de dados na edição
No modo de edição, ao clicar em **Continuar**, o componente SHALL pedir confirmação, num único modal com Sim e Não, quando a alteração causar perda de autoria ou de justificação. **Sim** SHALL emitir o resultado; **Não** SHALL manter a Tela 1 sem emitir resultado.

#### Scenario: Troca de casa confirmada
- **WHEN** um PL do Senado é alterado para PLV e o usuário confirma com Sim
- **THEN** o componente emite o resultado da edição

#### Scenario: Perda de autoria e de justificação juntas
- **WHEN** a alteração troca a casa e passa o documento a anexo de parecer
- **THEN** um único modal exibe as duas mensagens

#### Scenario: Passagem a anexo recusada
- **WHEN** o usuário marca "Este documento será apresentado em parecer" num documento que não era anexo e responde Não
- **THEN** o componente continua na Tela 1 e nenhum resultado é emitido

#### Scenario: Sem perda de dados
- **WHEN** o usuário só troca o destino e clica em **Continuar**
- **THEN** o resultado é emitido sem pedir confirmação

### Requirement: Mensagens de perda de dados
O modal de confirmação SHALL exibir "Ao alterar para um tipo de outra casa legislativa a autoria informada será perdida. Deseja continuar?" quando a casa responsável derivada da URN nova for diferente da derivada da URN inicial, e "Ao apresentar o documento em parecer, a justificação informada será perdida. Deseja continuar?" quando o documento não era anexo de parecer e passa a ser.

#### Scenario: Troca de casa
- **WHEN** um PL do Senado (casa `SF`) é alterado para PLV (casa `CN`)
- **THEN** o modal exibe a mensagem de perda da autoria

#### Scenario: Deixar de ser anexo
- **WHEN** um anexo de parecer deixa de ser apresentado em parecer, sem trocar de casa
- **THEN** nenhum modal é exibido

### Requirement: Resultado do modo de edição
No modo de edição, **Continuar** SHALL emitir o evento `dados-basicos-alterados`, distinto do evento de conclusão da nova proposição, com os mesmos dados deste exceto `texto`; os outros metadados são tratados só pelo host. Epígrafe e preâmbulo SHALL ser obtidos como na criação.

#### Scenario: Evento de edição
- **WHEN** o usuário conclui o modo de edição
- **THEN** o componente emite `dados-basicos-alterados` com `urn`, `epigrafe`, `preambulo`, `colegiadoDestino`, `anexoParecer` e, quando houver, `urnDocumentoReferenciado`, sem `texto`, e não emite o evento de conclusão da nova proposição

### Requirement: Reinício do componente
O componente SHALL expor `reiniciar()`, que volta ao estado original: modo de criação, sem dados iniciais, Tela 1 com os valores padrão e nenhum dado informado pelo usuário. A configuração recebida SHALL ser mantida.

#### Scenario: Reiniciar após edição
- **WHEN** o componente estava em modo de edição com dados preenchidos e o host chama `reiniciar()`
- **THEN** o componente exibe a Tela 1 de nova proposição com os valores padrão

#### Scenario: Reiniciar na Tela 2
- **WHEN** o usuário está na Tela 2 de uma nova proposição e o host chama `reiniciar()`
- **THEN** o componente volta à Tela 1 com os valores padrão
