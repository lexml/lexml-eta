# Spec Delta

## MODIFIED Requirements

### Requirement: Configuração da sessão
O usuário, a configuração de paginação, a autoria padrão, as opções de impressão padrão e o modo de validação de numeração (`validacaoNumeracao`: `'rigida'`, o padrão, ou `'flexivel'`; ver `numeracao-repetida`) SHALL ser definidos na configuração do componente (`lexmlEtaConfig`), não nos dados do documento. A autoria padrão e as opções de impressão padrão SHALL valer somente em `novaProposicao`, quando os dados correspondentes não forem informados; ao abrir, valem os valores do arquivo. O modo de validação de numeração SHALL valer em todos os métodos de inicialização e ao salvar.

#### Scenario: Padrão da sessão em nova proposição
- **WHEN** a configuração define a autoria padrão e `novaProposicao` não informa autoria
- **THEN** o documento criado usa a autoria padrão

#### Scenario: Dado informado vence o padrão
- **WHEN** a configuração define a autoria padrão e `novaProposicao` informa outra autoria
- **THEN** o documento criado usa a informada

#### Scenario: Padrão não se aplica ao abrir
- **WHEN** o host abre um documento cuja autoria foi gravada
- **THEN** o formulário mostra a autoria do arquivo, não a padrão

#### Scenario: Modo de validação de numeração ausente
- **WHEN** a configuração não define `validacaoNumeracao`
- **THEN** o componente usa a validação de numeração rígida

#### Scenario: Modo de validação de numeração flexível
- **WHEN** a configuração define `validacaoNumeracao: 'flexivel'` antes de o host chamar `abrirDocumentoArticulado`
- **THEN** a abertura e os salvamentos seguintes aceitam identificadores de dispositivo repetidos
