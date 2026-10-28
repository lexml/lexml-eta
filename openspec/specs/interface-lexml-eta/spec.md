# interface-lexml-eta Specification

## Purpose

Definir o contrato do componente `lexml-eta` com o aplicativo que o hospeda: os métodos que criam, abrem e encerram um documento, o estado neutro de espera, o reset entre documentos e a configuração da sessão.

## Requirements

### Requirement: Métodos de ciclo de vida do documento
O componente SHALL expor `novaProposicao(dados)`, `abrirDocumentoArticulado(entrada)` e `fecharDocumento()` como únicas formas de iniciar, trocar ou encerrar a edição de um documento. O componente SHALL NOT expor `inicializarEdicao` como método público.

#### Scenario: Nova proposição
- **WHEN** o host chama `novaProposicao` com dados válidos
- **THEN** o editor passa a editar o documento novo, com os dados informados

#### Scenario: Abrir proposição existente
- **WHEN** o host chama `abrirDocumentoArticulado` com um documento válido
- **THEN** o editor passa a editar o documento aberto

#### Scenario: Método antigo não exposto
- **WHEN** o host tenta chamar `inicializarEdicao`
- **THEN** o componente não oferece esse método na interface pública

### Requirement: Estado neutro
Enquanto nenhum documento estiver inicializado, e após `fecharDocumento()`, o componente SHALL permanecer em estado neutro: edição desabilitada, todas as abas das duas colunas desabilitadas, e a primeira aba da esquerda exibindo o texto "aguardando inicialização" centralizado na horizontal e na vertical.

#### Scenario: Componente recém-instanciado
- **WHEN** o componente é instanciado e nenhum método de inicialização foi chamado
- **THEN** o componente está em estado neutro, sem aba selecionável e com a mensagem de espera centralizada

#### Scenario: Fechar o documento
- **WHEN** o host chama `fecharDocumento()` com um documento em edição
- **THEN** o componente volta ao estado neutro

#### Scenario: Sair do estado neutro
- **WHEN** o host chama `novaProposicao` ou `abrirDocumentoArticulado` com sucesso
- **THEN** as abas são habilitadas e a primeira aba da esquerda exibe o texto do documento

### Requirement: Reset completo entre documentos
Todo método que inicia ou encerra um documento SHALL descartar o estado do documento anterior, inclusive o estado compartilhado do `rootStore`, de modo que nenhum dado do documento anterior interfira no novo. O componente SHALL NOT bloquear nem consultar alterações pendentes; confirmar a perda de dados é responsabilidade do host. O reset SHALL preservar a configuração da sessão.

#### Scenario: Troca de documento
- **WHEN** o host abre um segundo documento com o primeiro em edição
- **THEN** o segundo documento não contém revisões, remissões, anexos, outros metadados, justificação nem notas do primeiro

#### Scenario: Configuração preservada
- **WHEN** o host fecha o documento e abre outro
- **THEN** o usuário, a paginação e os padrões da configuração continuam valendo

### Requirement: Dados da nova proposição
`novaProposicao` SHALL exigir URN, epígrafe e preâmbulo. SHALL aceitar, opcionalmente, URN do documento referenciado, colegiado de destino, autoria, opções de impressão, outros metadados, documento articulado de modelo e indicativo de modo de anexo de parecer. Dado obrigatório ausente SHALL rejeitar a chamada com erro descritivo, sem alterar o documento em edição.

#### Scenario: Obrigatório ausente
- **WHEN** o host chama `novaProposicao` sem epígrafe
- **THEN** a chamada é rejeitada com erro que nomeia o dado ausente, e o documento em edição permanece como estava

#### Scenario: Opcionais ausentes
- **WHEN** o host chama `novaProposicao` apenas com URN, epígrafe e preâmbulo
- **THEN** o documento é criado com os valores padrão para destino, autoria, opções de impressão e outros metadados

### Requirement: Documento de modelo
Quando `novaProposicao` recebe um documento articulado de modelo, o sistema SHALL aproveitar dele somente a articulação e a ementa. URN, URN referenciada, epígrafe, preâmbulo e os demais dados SHALL vir dos parâmetros ou do padrão, mesmo os opcionais não informados. O que o modelo traz de anexos, revisões, situação na norma vigente, fecho, autoria, opções de impressão, destino e outros metadados SHALL ser descartado.

#### Scenario: Parâmetros sobrescrevem o modelo
- **WHEN** o modelo traz epígrafe, preâmbulo e URN diferentes dos informados
- **THEN** o documento criado usa os informados

#### Scenario: Metadados do modelo descartados
- **WHEN** o modelo traz anexos, revisões, autoria e outros metadados e a nova proposição não os informa
- **THEN** o documento criado não tem anexos nem revisões, e autoria, impressão, destino e outros metadados têm os valores padrão

#### Scenario: Texto aproveitado
- **WHEN** o modelo traz articulação e ementa
- **THEN** o documento criado contém essa articulação e essa ementa

### Requirement: Tipos permitidos para criação
`novaProposicao` SHALL aceitar apenas URN de proposição suportada pelo editor (ver `vocabulario-urn`): tipo com sigla, ativo ou inativo, da visão da casa do editor, de autoridade com sigla de casa (`senado.federal`, `camara.deputados` ou `congresso.nacional`). Qualquer outra URN SHALL rejeitar a chamada com erro descritivo, sem alterar o documento em edição. O alerta ou bloqueio de tipos inativos fica a cargo do host, antes da chamada.

#### Scenario: Proposição permitida
- **WHEN** o editor do Senado recebe uma URN `senado.federal` de proposição do vocabulário
- **THEN** a proposição é criada

#### Scenario: Norma
- **WHEN** o host chama `novaProposicao` com URN `senado.federal:resolucao`
- **THEN** a chamada é rejeitada

#### Scenario: Medida provisória
- **WHEN** o host chama `novaProposicao` com URN de autoridade `federal` (medida provisória)
- **THEN** a chamada é rejeitada

#### Scenario: Autoridade da outra casa
- **WHEN** o editor do Senado recebe URN de autoridade `camara.deputados`
- **THEN** a chamada é rejeitada

### Requirement: Casa responsável derivada da URN
A casa legislativa responsável pela apreciação SHALL ser a sigla de casa da autoridade da URN do documento no vocabulário (`senado.federal` para `SF`, `camara.deputados` para `CD` e `congresso.nacional` para `CN`). A casa SHALL NOT ser informada por parâmetro.

#### Scenario: Congresso Nacional
- **WHEN** o documento tem URN de autoridade `congresso.nacional`
- **THEN** a casa responsável é `CN`

#### Scenario: Casa por autoridade
- **WHEN** o documento tem URN de autoridade `camara.deputados`
- **THEN** a casa responsável é `CD`

### Requirement: Configuração da sessão
O usuário, a configuração de paginação, a autoria padrão e as opções de impressão padrão SHALL ser definidos na configuração do componente (`lexmlEtaConfig`), não nos dados do documento. A autoria padrão e as opções de impressão padrão SHALL valer somente em `novaProposicao`, quando os dados correspondentes não forem informados; ao abrir, valem os valores do arquivo.

#### Scenario: Padrão da sessão em nova proposição
- **WHEN** a configuração define a autoria padrão e `novaProposicao` não informa autoria
- **THEN** o documento criado usa a autoria padrão

#### Scenario: Dado informado vence o padrão
- **WHEN** a configuração define a autoria padrão e `novaProposicao` informa outra autoria
- **THEN** o documento criado usa a informada

#### Scenario: Padrão não se aplica ao abrir
- **WHEN** o host abre um documento cuja autoria foi gravada
- **THEN** o formulário mostra a autoria do arquivo, não a padrão

### Requirement: Entrada inválida preserva o documento
Uma chamada rejeitada de qualquer método de inicialização SHALL deixar intacto o documento em edição e emitir o erro fatal ao host.

#### Scenario: Rejeição não altera o editor
- **WHEN** o host chama `abrirDocumentoArticulado` com um documento inválido durante uma edição
- **THEN** a chamada falha com erro descritivo e o documento em edição continua como estava
