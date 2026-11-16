# Spec Delta

## MODIFIED Requirements

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

### Requirement: Sigla do texto de outra proposição
Na opção "Texto de outra proposição", a sigla SHALL ser escolhida, e não digitada livremente, entre todas as siglas do vocabulário da casa do editor, ativas e inativas, inclusive a MPV, **uma única vez cada** (sigla repetida em mais de um tipo, como PLS e PLC, aparece uma só vez), com as ativas antes das inativas (cada grupo em ordem alfabética) e as inativas em cinza e selecionáveis. Número e ano SHALL ser informados nos campos do grupo, na mesma linha. A verificação e a busca do texto usam apenas sigla, número e ano.

#### Scenario: Lista da outra proposição
- **WHEN** o usuário abre a lista de siglas da outra proposição
- **THEN** a lista contém todas as siglas da casa do editor, ativas e inativas, inclusive a MPV, cada uma uma só vez, com as inativas ao final em cinza

#### Scenario: Sigla repetida no vocabulário
- **WHEN** o usuário abre a lista de siglas da outra proposição no `SF`
- **THEN** PLS e PLC aparecem uma única vez cada

## REMOVED Requirements

### Requirement: Sigla inativa em nova proposição
**Reason**: a lista de siglas da nova proposição passa a oferecer só tipos ativos; não há como escolher uma sigla inativa para iniciar um texto novo, então o alerta perde o objeto.

**Migration**: nenhuma. A abertura e a edição de documentos de sigla inativa não mudam. Partir do texto de uma proposição de sigla inativa continua possível na opção "Texto de outra proposição", e apresentar substitutivo a ela, na espécie Substitutivo ou Subemenda substitutiva.
