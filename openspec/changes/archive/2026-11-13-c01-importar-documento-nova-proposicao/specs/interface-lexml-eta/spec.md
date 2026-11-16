# Spec Delta

## MODIFIED Requirements

### Requirement: Dados da nova proposição
`novaProposicao` SHALL exigir URN, epígrafe e preâmbulo. SHALL aceitar, opcionalmente, URN do documento referenciado, colegiado de destino, autoria, opções de impressão, outros metadados, documento articulado de modelo, documento importado e indicativo de modo de anexo de parecer. Documento de modelo e documento importado MUST NOT ser informados juntos. O colegiado de destino SHALL ser informado apenas por esta chamada (ou pelo arquivo aberto), pois o `lexml-eta` não tem formulário de destino. Dado obrigatório ausente ou combinação inválida SHALL rejeitar a chamada com erro descritivo, sem alterar o documento em edição.

#### Scenario: Obrigatório ausente
- **WHEN** o host chama `novaProposicao` sem epígrafe
- **THEN** a chamada é rejeitada com erro que nomeia o dado ausente, e o documento em edição permanece como estava

#### Scenario: Opcionais ausentes
- **WHEN** o host chama `novaProposicao` apenas com URN, epígrafe e preâmbulo
- **THEN** o documento é criado sem colegiado e com os valores padrão para autoria, opções de impressão e outros metadados

#### Scenario: Colegiado informado
- **WHEN** o host chama `novaProposicao` com colegiado de destino Comissão e sigla `CCJ`
- **THEN** o documento é criado com esse colegiado, que é gravado ao salvar

#### Scenario: Modelo e importado juntos
- **WHEN** o host chama `novaProposicao` com documento de modelo e documento importado
- **THEN** a chamada é rejeitada com erro descritivo, e o documento em edição permanece como estava

## ADDED Requirements

### Requirement: Documento importado
Quando `novaProposicao` recebe um documento importado, o sistema SHALL aproveitar dele o conteúdo como na abertura de documento (`abrirDocumentoArticulado`): ementa, articulação, justificação (com notas de rodapé e revisões de texto), revisões da hierarquia, situação na norma vigente, autoria, data do fecho, opções de impressão e outros metadados. URN, URN do documento referenciado, epígrafe, preâmbulo, colegiado de destino e anexo de parecer SHALL vir dos parâmetros ou do padrão, nunca do documento; o local do fecho SHALL ser derivado do colegiado de destino, como ao alterar os dados básicos. A URN do documento importado MUST NOT ser validada contra a casa do editor; a URN validada é a dos parâmetros. Quando a casa da URN do documento importado difere da casa da URN informada, a autoria do documento SHALL ser descartada, como ao alterar os dados básicos. Autoria, opções de impressão e outros metadados informados nos parâmetros SHALL valer apenas quando o documento importado não traz o grupo correspondente; os padrões da sessão SHALL valer para autoria e opções de impressão quando nem o documento nem os parâmetros as trazem. Em modo de anexo de parecer, a justificação do documento não é carregada, como na abertura. A data da última modificação do documento importado MUST NOT ser aproveitada. Documento importado que não seja um documento articulado válido SHALL rejeitar a chamada como entrada inválida.

#### Scenario: Conteúdo aproveitado
- **WHEN** o documento importado traz articulação, ementa, justificação, revisões e autoria
- **THEN** o documento criado contém essa articulação, essa ementa, essa justificação, essas revisões e essa autoria

#### Scenario: Identidade dos parâmetros
- **WHEN** o documento importado traz URN, epígrafe, preâmbulo e colegiado diferentes dos informados
- **THEN** o documento criado usa os informados

#### Scenario: URN do documento de outra casa
- **WHEN** o editor do Senado recebe um documento importado cuja URN é da Câmara, com URN de parâmetro do Senado
- **THEN** a proposição é criada, sem a recusa de documento da outra casa

#### Scenario: Autoria de documento de outra casa
- **WHEN** o documento importado é da Câmara, traz autoria, e a URN informada é do Senado
- **THEN** o documento criado não tem a autoria do documento importado

#### Scenario: Autoria do parâmetro sem autoria no documento
- **WHEN** o documento importado não traz autoria e o host informa uma autoria nos parâmetros
- **THEN** o documento criado tem a autoria dos parâmetros

#### Scenario: Documento importado inválido
- **WHEN** o documento importado não é um documento articulado válido
- **THEN** a chamada é rejeitada com o erro fatal de entrada inválida, e o documento em edição permanece como estava

### Requirement: Anexos do documento importado
Os anexos do documento importado SHALL ser descartados: o documento criado MUST NOT conter anexos vindos dele. Quando o documento importado traz ao menos um anexo, o editor SHALL exibir a mensagem "Não foi possível recuperar os anexos do documento importado. A proposição foi criada sem eles; se necessário, inclua-os novamente na aba Anexos." de duas formas: numa notificação passageira de aviso (amarela), no canto superior da tela, que some sozinha depois de 8 segundos, e como alerta de aviso, com botão de fechar, na aba Avisos, que permanece para consulta. O alerta MUST NOT ser gravado como pendência ao salvar.

#### Scenario: Documento com anexos
- **WHEN** o documento importado traz dois anexos
- **THEN** o documento criado não tem anexos, a notificação amarela de anexos não recuperados aparece no canto superior e a aba Avisos exibe o mesmo alerta

#### Scenario: Notificação passageira
- **WHEN** a notificação de anexos não recuperados é exibida
- **THEN** ela some sozinha depois de 8 segundos, e o alerta continua na aba Avisos

#### Scenario: Documento sem anexos
- **WHEN** o documento importado não traz anexos
- **THEN** nem a notificação nem o alerta de anexos são exibidos

#### Scenario: Alerta não vira pendência
- **WHEN** o usuário salva a proposição criada com o alerta de anexos exibido
- **THEN** o arquivo salvo não contém pendência sobre anexos
