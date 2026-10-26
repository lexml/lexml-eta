# Spec Delta

## Purpose

Define o comportamento e o contrato do componente de nova proposição: a coleta da identificação do documento (tipo, substitutivo, proposição referenciada, colegiado de destino) e a escolha do texto inicial, devolvendo o resultado ao host por evento.

## ADDED Requirements

### Requirement: Configuração e resultado do componente
O componente SHALL receber um objeto de configuração com a casa legislativa do editor (`SF` ou `CD`), a URL de verificação de proposição e a URL do texto estruturado, e SHALL devolver ao host, por evento, um objeto de resultado com as informações coletadas. O componente MUST NOT criar o documento nem abrir a edição por conta própria.

#### Scenario: Conclusão do fluxo
- **WHEN** o usuário aciona **Continuar** na última tela aplicável
- **THEN** o componente emite um evento cujo `detail` contém: `urn`, `urnDocumentoDeReferencia` (quando houver), `epigrafe`, `preambulo`, `colegiadoDestino` (quando substitutivo), `texto` (quando parte de documento existente) e `anexoParecer`

#### Scenario: Campos condicionais ausentes
- **WHEN** o documento não é substitutivo, nem PLV, e o texto inicial é vazio
- **THEN** o `detail` não contém `urnDocumentoDeReferencia`, `colegiadoDestino` nem `texto`

### Requirement: Conteúdo do resultado
O `detail` do evento de conclusão SHALL conter: `urn` (URN do novo documento); `urnDocumentoDeReferencia` (URN do documento referenciado, em substitutivo e em PLV, nas duas casas; no substitutivo do `SF` é a URN do documento referenciado sem o sufixo de versão do substitutivo); `epigrafe`, montada pelo serviço do vocabulário a partir de `urn` e `urnDocumentoDeReferencia`; `preambulo`, obtido do vocabulário; `colegiadoDestino` (tipo e, quando houver, sigla da comissão), apenas em substitutivo; `texto`, o documento articulado, apenas quando o texto inicial vem de documento existente (importação, documento referenciado ou outra proposição); e `anexoParecer`, booleano.

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

### Requirement: Documento apresentado como anexo de parecer
A Tela 1 SHALL exibir a caixa de seleção "Documento apresentado como anexo de parecer", desmarcada por padrão, e o resultado SHALL informá-la em `anexoParecer`.

#### Scenario: Marcação
- **WHEN** o usuário marca a caixa e conclui o fluxo
- **THEN** o `detail` contém `anexoParecer` verdadeiro

#### Scenario: Padrão
- **WHEN** o usuário conclui sem tocar na caixa
- **THEN** o `detail` contém `anexoParecer` falso

#### Scenario: Cancelamento
- **WHEN** o usuário aciona **Cancelar** em qualquer tela
- **THEN** o componente emite um evento de cancelamento, sem resultado, e descarta os dados informados

#### Scenario: Configuração ausente
- **WHEN** o componente é usado sem casa legislativa ou sem URL de verificação
- **THEN** a casa assume o padrão `SF` e a verificação de proposição fica indisponível, com **Verificar** desabilitado

### Requirement: Tipos do documento por casa
A lista "Tipo do documento" SHALL oferecer apenas tipos ativos, vindos do vocabulário, das autoridades da casa do editor: `senado.federal` e `congresso.nacional` no `SF`; `camara.deputados` e `congresso.nacional` na `CD`.

#### Scenario: Casa SF
- **WHEN** a casa do editor é `SF`
- **THEN** a lista contém tipos ativos de `senado.federal` e de `congresso.nacional`, e nenhum tipo inativo nem de `camara.deputados`

#### Scenario: Tipo inativo
- **WHEN** um tipo do vocabulário está marcado como inativo (ex.: PLS, PLC)
- **THEN** ele não aparece na lista "Tipo do documento"

### Requirement: Indicativo de substitutivo
O estado do indicativo de substitutivo SHALL depender do `tipoRelacaoSubstitutivo` do tipo escolhido: `é substitutivo` e `é subemenda substitutiva` deixam-no desabilitado e selecionado; `aceita substitutivo` deixa-o habilitado; `não aceita substitutivo` deixa-o desabilitado e não selecionado.

#### Scenario: Tipo que é sempre substitutivo
- **WHEN** o usuário escolhe um tipo com `tipoRelacaoSubstitutivo` igual a `é substitutivo`
- **THEN** o indicativo aparece selecionado e desabilitado

#### Scenario: Tipo que não aceita substitutivo
- **WHEN** o usuário escolhe um tipo com `tipoRelacaoSubstitutivo` igual a `não aceita substitutivo`
- **THEN** o indicativo aparece desmarcado e desabilitado

### Requirement: Proposição referenciada
Os campos sigla, número e ano da proposição referenciada SHALL ficar habilitados apenas quando o indicativo de substitutivo está selecionado ou o tipo é PLV. No PLV, o rótulo SHALL ser "Medida Provisória" e a sigla SHALL ficar fixa em MPV e desabilitada. A lista de siglas SHALL incluir siglas ativas e inativas de tipos com `tipoRelacaoSubstitutivo` igual a `aceita substitutivo`, restrita, no `SF`, às siglas referenciáveis do tipo escolhido e, na `CD`, a todas essas siglas. A MPV (autoridade `federal`) MUST NOT constar da lista de siglas referenciáveis, exceto como referência obrigatória do PLV.

#### Scenario: Substitutivo no SF
- **WHEN** o usuário escolhe, no `SF`, um tipo de substitutivo
- **THEN** a lista de siglas contém apenas as siglas referenciáveis daquele tipo, ativas ou inativas

#### Scenario: PLV
- **WHEN** o usuário escolhe o tipo PLV
- **THEN** o rótulo é "Medida Provisória", a sigla é MPV e está desabilitada, e número e ano estão habilitados

#### Scenario: Tipo sem referência
- **WHEN** o tipo não é PLV e o indicativo de substitutivo está desmarcado
- **THEN** os campos da proposição referenciada ficam desabilitados

### Requirement: Colegiado de destino do substitutivo
Quando o documento é substitutivo, a Tela 1 SHALL exibir o componente de colegiado de destino, e o resultado SHALL incluir o tipo do colegiado e, quando houver, a sigla da comissão. A sigla da comissão alimenta a epígrafe do substitutivo do `SF`.

#### Scenario: Substitutivo
- **WHEN** o indicativo de substitutivo está selecionado
- **THEN** o componente de colegiado de destino é exibido na Tela 1

#### Scenario: Não substitutivo
- **WHEN** o indicativo de substitutivo está desmarcado e o tipo não é substitutivo
- **THEN** o componente de colegiado de destino não é exibido e o resultado não contém colegiado

#### Scenario: Destino Plenário
- **WHEN** o colegiado de destino é o Plenário
- **THEN** o resultado não contém sigla de comissão

### Requirement: Verificação da proposição
O botão **Verificar** SHALL ser habilitado apenas com sigla, número e ano preenchidos e a URL de verificação configurada. A URL SHALL conter placeholders de sigla, número e ano, substituídos pelos valores informados. Resposta `200` SHALL trazer JSON com a ementa e o indicador de existência de texto estruturado; resposta `404` indica proposição inexistente. A ementa SHALL ser somente leitura e apagada quando sigla, número ou ano mudar.

#### Scenario: Proposição existente
- **WHEN** a verificação retorna `200` com ementa e indicador de texto estruturado
- **THEN** a ementa é exibida e a proposição passa a constar como verificada

#### Scenario: Proposição inexistente
- **WHEN** a verificação retorna `404`
- **THEN** o usuário é informado de que a proposição não foi encontrada, a ementa fica vazia e **Continuar** permanece desabilitado

#### Scenario: Alteração dos campos
- **WHEN** o usuário altera sigla, número ou ano após uma verificação
- **THEN** a ementa é apagada e a proposição deixa de constar como verificada

#### Scenario: Falha de comunicação
- **WHEN** a verificação falha por erro de rede ou resposta diferente de `200` e `404`
- **THEN** o usuário é informado do erro, a proposição não fica verificada, **Continuar** permanece desabilitado e **Verificar** continua habilitado para nova tentativa

### Requirement: Continuar na Tela 1
**Continuar** na Tela 1 SHALL exigir o tipo do documento escolhido e, quando a referência é exigida, a proposição verificada e existente.

#### Scenario: Referência exigida e não verificada
- **WHEN** o documento é substitutivo ou PLV e a proposição não foi verificada
- **THEN** **Continuar** está desabilitado

### Requirement: Texto inicial da edição
A Tela 2 SHALL perguntar "Como você quer iniciar?" com seleção única entre: texto vazio; importar documento (DOCX, TXT ou LexML); texto do documento referenciado (apenas em substitutivo ou PLV); texto de outra proposição. A opção padrão SHALL ser o texto do documento referenciado em substitutivo ou PLV e o texto vazio nos demais casos. O texto trazido nas duas últimas opções SHALL ser o texto original da proposição, obtido de um segundo serviço configurável pelo host, por URL com os mesmos placeholders de sigla, número e ano: `200` devolve o texto estruturado em LexML no formato JSONIX, o mesmo usado ao abrir um documento, e `404` indica texto não encontrado (indisponível). Esse serviço SHALL ser consultado apenas quando uma dessas duas opções está escolhida, e MUST NOT ser consultado nas opções de texto vazio ou de importação.

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
- **WHEN** a Tela 2 é exibida para um substitutivo ou PLV
- **THEN** a opção "Texto do documento referenciado" vem selecionada

#### Scenario: Opção padrão nos demais casos
- **WHEN** a Tela 2 é exibida para um documento que não é substitutivo nem PLV
- **THEN** a opção "Texto vazio" vem selecionada e a opção do documento referenciado não é oferecida

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
O cabeçalho das Telas 2 e 3 SHALL identificar o documento por: nome do tipo, quando não é substitutivo nem PLV; "Projeto de Lei de Conversão (Medida Provisória nº N de A)", no PLV; "Substitutivo ao/à <tipo> nº N de A", no substitutivo; "Subemenda Substitutiva ao/à <tipo> nº N de A", na subemenda substitutiva global (só na `CD`).

#### Scenario: Substitutivo
- **WHEN** o documento é substitutivo ao Projeto de Lei nº 12 de 2026
- **THEN** o cabeçalho exibe "Substitutivo ao Projeto de Lei nº 12 de 2026"

### Requirement: URN do novo documento
A URN do novo documento SHALL ser composta por autoridade, tipo, ano, número e versão. Substitutivo do `SF` SHALL usar a URN do documento referenciado acrescida de `@apresentacao.substitutivo`. Os demais documentos, inclusive substitutivos da `CD` e PLV, SHALL usar o ano corrente e o número `999999`, sem versão. Em substitutivo (`SF` e `CD`) e no PLV, o documento referenciado SHALL ir em `urnDocumentoDeReferencia`; no substitutivo do `SF` ela é a URN do documento referenciado sem o sufixo de versão.

#### Scenario: Substitutivo do SF
- **WHEN** o substitutivo referencia `urn:lex:br:senado.federal:projeto.lei;pl:2026;12`
- **THEN** a URN do novo documento é `urn:lex:br:senado.federal:projeto.lei;pl:2026;12@apresentacao.substitutivo` e `urnDocumentoDeReferencia` é `urn:lex:br:senado.federal:projeto.lei;pl:2026;12`

#### Scenario: Documento não numerado
- **WHEN** é criado um PL no `SF` em 2026
- **THEN** a URN é `urn:lex:br:senado.federal:projeto.lei;pl:2026;999999`

#### Scenario: PLV
- **WHEN** é criado um PLV referenciando a MPV nº 4321 de 2026
- **THEN** a URN é `urn:lex:br:congresso.nacional:projeto.lei.conversao;plv:2026;999999` e `urnDocumentoDeReferencia` é `urn:lex:br:federal:medida.provisoria;mpv:2026;4321`
