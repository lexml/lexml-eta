# Spec Delta

## MODIFIED Requirements

### Requirement: Texto inicial da edição
A Tela 2 SHALL perguntar "Como você quer iniciar?" com seleção única entre: texto vazio; importar documento (PDF, DOCX, TXT ou LexML); texto do documento referenciado (apenas em substitutivo, subemenda substitutiva ou PLV); texto de outra proposição. A opção padrão SHALL ser o texto do documento referenciado em substitutivo, subemenda substitutiva ou PLV e o texto vazio nos demais casos. O texto trazido nas duas últimas opções SHALL ser o texto original da proposição, obtido de um segundo serviço configurável pelo host, por URL com os mesmos placeholders de sigla, número e ano (mesmo formato dos valores da verificação): `200` devolve o texto estruturado em LexML no formato JSONIX, o mesmo usado ao abrir um documento, e `404` indica texto não encontrado (indisponível). Esse serviço SHALL ser consultado apenas quando uma dessas duas opções está escolhida, e MUST NOT ser consultado nas opções de texto vazio ou de importação. A opção de outra proposição SHALL aceitar qualquer sigla, ativa ou inativa. Na `CD`, em substitutivo ou subemenda substitutiva, a opção de outra proposição SHALL NOT exibir sigla, número, ano, verificação nem ementa, e **Continuar** SHALL levar à Tela 2b (requisito "Tela de escolha do documento de origem na CD"), sem consultar o serviço do texto por sigla, número e ano.

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
- **WHEN** o usuário escolhe "Texto de outra proposição" no `SF`, ou na `CD` em espécie que não é substitutivo nem subemenda substitutiva, e informa uma sigla inativa
- **THEN** a sigla é aceita e a verificação segue a regra comum

#### Scenario: Outra proposição em substitutivo da CD
- **WHEN** a casa do editor é `CD`, a espécie é Substitutivo ou Subemenda Substitutiva e o usuário escolhe "Texto de outra proposição"
- **THEN** a Tela 2 não exibe campos de sigla, número, ano, **Verificar** nem ementa, e **Continuar** está habilitado

#### Scenario: Continuar com outra proposição em substitutivo da CD
- **WHEN** o usuário aciona **Continuar** com essa opção
- **THEN** a Tela 2b é exibida

#### Scenario: Voltar
- **WHEN** o usuário aciona **Voltar** na Tela 2
- **THEN** a Tela 1 é exibida com os dados informados preservados

### Requirement: Sigla do texto de outra proposição
Na opção "Texto de outra proposição" (exceto em substitutivo ou subemenda substitutiva da `CD`, que usa a Tela 2b), a sigla SHALL ser escolhida, e não digitada livremente, entre todas as siglas do vocabulário da casa do editor, ativas e inativas, inclusive a MPV, **uma única vez cada** (sigla repetida em mais de um tipo, como PLS e PLC, aparece uma só vez), com as ativas antes das inativas (cada grupo em ordem alfabética) e as inativas em cinza e selecionáveis. Número e ano SHALL ser informados nos campos do grupo, na mesma linha. A verificação e a busca do texto usam apenas sigla, número e ano.

#### Scenario: Lista da outra proposição
- **WHEN** o usuário abre a lista de siglas da outra proposição
- **THEN** a lista contém todas as siglas da casa do editor, ativas e inativas, inclusive a MPV, cada uma uma só vez, com as inativas ao final em cinza

#### Scenario: Sigla repetida no vocabulário
- **WHEN** o usuário abre a lista de siglas da outra proposição no `SF`
- **THEN** PLS e PLC aparecem uma única vez cada

### Requirement: Callbacks opcionais para as origens de dados
A configuração SHALL aceitar os callbacks opcionais `onObterComissoes`, `onVerificarProposicao`, `onObterTexto`, `onImportarArquivo`, `onListarDocumentos` e `onObterTextoDocumento`, que substituem, respectivamente, a URL de comissões, a URL de verificação, a URL do texto estruturado, a URL de importação, a URL `urlDocumentosMateria` e a URL `urlTextoDocumento`. Existindo o callback, o componente SHALL usá-lo e MUST NOT chamar a URL da origem; não existindo, SHALL usar a URL. O callback MUST NOT alterar telas, regras de habilitação nem o resultado emitido. Com `casaLegislativaEditor = 'CD'`, cada uma das duas últimas origens SHALL ser informada por URL ou callback, e a configuração é recusada se faltar; no `SF` elas não são exigidas.

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

#### Scenario: Origens da Tela 2b ausentes na CD
- **WHEN** `casaLegislativaEditor` é `CD` e a configuração não informa `urlDocumentosMateria` nem `onListarDocumentos`
- **THEN** a configuração é recusada com mensagem que nomeia a origem faltante

#### Scenario: Origens da Tela 2b ausentes no SF
- **WHEN** `casaLegislativaEditor` é `SF` ou não informada, e a configuração não informa as origens da Tela 2b
- **THEN** a configuração é aceita

## ADDED Requirements

### Requirement: Tela de escolha do documento de origem na CD
Na `CD`, em substitutivo ou subemenda substitutiva, a Tela 2b SHALL perguntar "Em qual matéria está o documento?" com "Nesta mesma matéria" (padrão, usando a proposição referenciada da Tela 1, já verificada) ou "Em outra matéria" (sigla escolhida entre as da proposição referenciada, número, ano e **Verificar**, com a regra de verificação comum). **Voltar** SHALL levar à Tela 2 com a escolha preservada.

#### Scenario: Matéria padrão
- **WHEN** a Tela 2b é exibida
- **THEN** "Nesta mesma matéria" vem selecionada e a lista é carregada para a proposição referenciada

#### Scenario: Outra matéria verificada
- **WHEN** o usuário escolhe "Em outra matéria", informa sigla, número e ano e a verificação retorna a matéria
- **THEN** a lista é carregada para essa matéria e a seleção anterior é descartada

#### Scenario: Outra matéria inexistente
- **WHEN** a verificação de "Em outra matéria" indica matéria não encontrada
- **THEN** o usuário é informado e a lista não é exibida

### Requirement: Seleção do documento de origem
A Tela 2b SHALL listar em "Documento de origem" todos os documentos devolvidos pelo host para a matéria, sem opção de ocultar documentos. A seleção SHALL ser única, e **Continuar** SHALL ficar habilitado apenas com um documento selecionado cujo texto estruturado esteja disponível.

#### Scenario: Seleção do documento
- **WHEN** o usuário seleciona um documento da lista
- **THEN** a faixa "Fonte selecionada" mostra o documento e a matéria, e **Trocar** devolve a seleção ao estado sem documento escolhido

#### Scenario: Documento sem texto estruturado
- **WHEN** a lista contém um documento com `textoEstruturadoDisponivel` falso
- **THEN** ele aparece desabilitado com o aviso "Texto estruturado não disponível" e não pode ser selecionado

#### Scenario: Matéria sem documentos
- **WHEN** o host devolve lista vazia
- **THEN** a Tela 2b informa que não há documentos e **Continuar** permanece desabilitado

#### Scenario: Concluir
- **WHEN** o usuário aciona **Continuar** com um documento selecionado e o texto é obtido
- **THEN** o resultado é emitido com esse texto em `texto`, como na opção de outra proposição do `SF`

#### Scenario: Texto do documento indisponível ou com falha
- **WHEN** o serviço do texto indica indisponibilidade ou falha
- **THEN** o usuário é informado, permanece na Tela 2b e pode tentar novamente ou escolher outro documento

### Requirement: Apresentação e filtro dos documentos da lista
Cada documento da lista SHALL mostrar o título, a identificação (`sigla número/ano`, e `siglaComissao` quando houver), o autor com o papel e o tratamento "Dep." e a data de apresentação em DD/MM/AAAA, além de um ícone que abre `urlInteiroTeor` em outra aba sem selecionar o documento. O tratamento "Dep." SHALL ser fixo, independentemente de `indSexoAutor`.

#### Scenario: Linha do documento
- **WHEN** o host devolve um documento com `papelAutor` "Relatora", `nomeAutor` "Fulana", `siglaComissao` "CCJC" e `dataApresentacao` "2025-08-12"
- **THEN** a linha mostra "Relatora: Dep. Fulana" e "12/08/2025"

#### Scenario: Inteiro teor
- **WHEN** o usuário aciona o ícone de um documento
- **THEN** `urlInteiroTeor` é aberta em outra aba e a seleção não muda

### Requirement: Filtro dos documentos da lista
O campo de filtro SHALL ser textual e genérico, executado no componente sobre todos os dados exibidos de cada documento (inclusive a data), sem diferenciar maiúsculas, minúsculas e acentos.

#### Scenario: Filtro por texto
- **WHEN** o usuário digita um trecho do título, do autor, da comissão ou da data exibida
- **THEN** a lista mostra só os documentos que o contêm

### Requirement: Objeto documento da Tela 2b
Cada documento devolvido pelo host SHALL ter `id` (único), `titulo`, `sigla`, `numero`, `ano` (inteiro, opcional), `urlInteiroTeor`, `textoEstruturadoDisponivel` (verdadeiro quando ausente), `nomeAutor` (sem tratamento), `papelAutor` (já flexionado), `indSexoAutor`, `dataApresentacao` (AAAA-MM-DD) e `siglaComissao` (opcional).

#### Scenario: Disponibilidade ausente
- **WHEN** o documento não traz `textoEstruturadoDisponivel`
- **THEN** o texto estruturado é considerado disponível

### Requirement: Contrato dos serviços da Tela 2b
`onListarDocumentos` SHALL receber `{ sigla, numero, ano }` normalizados da matéria e devolver a lista de documentos ou `undefined` se a matéria for inexistente; `onObterTextoDocumento` SHALL receber `{ id }` e devolver o JSONIX ou `undefined` se indisponível. Promise rejeitada ou exceção SHALL ser falha de comunicação.

#### Scenario: Listagem pelo callback
- **WHEN** a Tela 2b carrega a matéria PL 4/2025
- **THEN** `onListarDocumentos` recebe `{ sigla: 'PL', numero: '4', ano: '2025' }`

#### Scenario: Matéria inexistente
- **WHEN** a listagem devolve `undefined` ou `404`
- **THEN** a matéria é tratada como não encontrada

#### Scenario: Texto por id
- **WHEN** o usuário continua com o documento de `id` "abc"
- **THEN** o serviço do texto recebe `{ id: 'abc' }` e não recebe sigla, número nem ano

#### Scenario: Falha na listagem
- **WHEN** `onListarDocumentos` rejeita a promise
- **THEN** o usuário é informado do erro e pode tentar novamente

### Requirement: URLs dos serviços da Tela 2b
`urlDocumentosMateria` SHALL usar os placeholders de sigla, número e ano e `urlTextoDocumento` SHALL usar `{id}`, com `200` (JSON) e `404` (inexistente ou indisponível) como nas demais origens; outra resposta ou erro de rede SHALL ser falha de comunicação.

#### Scenario: URL do texto
- **WHEN** o usuário continua com o documento de `id` "abc" e só há `urlTextoDocumento`
- **THEN** a requisição é feita com `{id}` substituído por `abc`
