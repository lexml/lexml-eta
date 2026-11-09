# Spec Delta

## MODIFIED Requirements

### Requirement: Métodos de ciclo de vida do documento
O componente SHALL expor `novaProposicao(dados)`, `abrirDocumentoArticulado(entrada)` e `fecharDocumento()` como únicas formas de iniciar, trocar ou encerrar a edição de um documento, e `alterarDadosBasicos(dados)` como única forma de alterar os dados básicos do documento em edição. O componente SHALL NOT expor `inicializarEdicao` como método público.

#### Scenario: Nova proposição
- **WHEN** o host chama `novaProposicao` com dados válidos
- **THEN** o editor passa a editar o documento novo, com os dados informados

#### Scenario: Abrir proposição existente
- **WHEN** o host chama `abrirDocumentoArticulado` com um documento válido
- **THEN** o editor passa a editar o documento aberto

#### Scenario: Alterar dados básicos
- **WHEN** o host chama `alterarDadosBasicos` com dados válidos e um documento em edição
- **THEN** o editor continua editando o mesmo documento, com os dados básicos novos

#### Scenario: Método antigo não exposto
- **WHEN** o host tenta chamar `inicializarEdicao`
- **THEN** o componente não oferece esse método na interface pública

## ADDED Requirements

### Requirement: Dados da alteração de dados básicos
`alterarDadosBasicos` SHALL exigir URN, epígrafe e preâmbulo, e SHALL aceitar, opcionalmente, URN do documento referenciado, colegiado apreciador, outros metadados e indicativo de anexo de parecer. Os dados informados SHALL substituir todos os dados básicos do documento; opcional ausente SHALL assumir o mesmo valor que assume em `novaProposicao`. A URN SHALL seguir as regras de "Tipos permitidos para criação".

#### Scenario: Obrigatório ausente
- **WHEN** o host chama `alterarDadosBasicos` sem preâmbulo
- **THEN** a chamada é rejeitada com erro que nomeia o dado ausente, e o documento em edição permanece como estava

#### Scenario: URN não permitida
- **WHEN** o host chama `alterarDadosBasicos` com URN de norma
- **THEN** a chamada é rejeitada e o documento em edição permanece como estava

#### Scenario: Documento referenciado removido
- **WHEN** um substitutivo tem os dados básicos alterados para uma proposição, sem URN do documento referenciado
- **THEN** o documento deixa de ter documento referenciado

### Requirement: Alteração de dados básicos recusada
`alterarDadosBasicos` SHALL rejeitar a chamada com erro descritivo, emitir o erro fatal ao host e deixar o documento em edição intacto quando não houver documento em edição, quando o editor estiver em modo de revisão ou quando o documento em edição for de tipo não suportado para criação.

#### Scenario: Modo de revisão
- **WHEN** o host chama `alterarDadosBasicos` com o editor em modo de revisão
- **THEN** a chamada é rejeitada com erro informando que os dados básicos não podem ser alterados em modo de revisão, e o documento permanece como estava

#### Scenario: Sem documento
- **WHEN** o host chama `alterarDadosBasicos` com o componente em estado neutro
- **THEN** a chamada é rejeitada e o componente continua em estado neutro
