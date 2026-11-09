# epigrafe-proposicao

## Purpose
Montar a epígrafe de uma proposição a partir dos modelos de epígrafe do vocabulário e preservar a quebra de linha da epígrafe ao criar, abrir, exibir e salvar o documento.

## Requirements

### Requirement: Serviço de montagem da epígrafe
O sistema SHALL oferecer o serviço `montaEpigrafe(urn, urnDocumentoReferenciado?, sufixo?)`, que devolve o texto da epígrafe como string, possivelmente com elementos XML aceitos em `Epigrafe`. O serviço SHALL resolver os tipos na visão completa do vocabulário, sem depender da casa do editor, e SHALL ser exportado pelo ponto de entrada do pacote.

#### Scenario: Serviço exportado
- **WHEN** o pacote é consumido por um host
- **THEN** `montaEpigrafe` está disponível no ponto de entrada do pacote

#### Scenario: Independente da casa do editor
- **WHEN** a casa do editor é `SF` e a URN é de `camara.deputados`
- **THEN** o serviço monta a epígrafe com o modelo da Câmara

### Requirement: Seleção do modelo de epígrafe
O serviço SHALL escolher o modelo pelo tipo da URN, nesta ordem:
1. se a URN for de substitutivo e o tipo tiver `modeloEpigrafeSubstitutivo`, esse modelo;
2. senão, o `modeloEpigrafe` do tipo, se houver;
3. senão, o modelo padrão `{descricaoMaiusculas} Nº {numero}, DE {ano}`.

Tipo não resolvido SHALL usar o modelo padrão.

#### Scenario: Substitutivo do Senado
- **WHEN** a URN é `urn:lex:br:senado.federal:projeto.lei;pl:2026;1234@apresentacao.substitutivo`
- **THEN** o modelo usado é o `substitutivo` de `senado.federal`

#### Scenario: Tipo que aceita substitutivo sem ser substitutivo
- **WHEN** a URN é `urn:lex:br:senado.federal:projeto.lei;pl:2026;999999`
- **THEN** o modelo usado é o padrão

#### Scenario: Modelo do tipo
- **WHEN** a URN é de PLV de `congresso.nacional`
- **THEN** o modelo usado é o `plv`

#### Scenario: Tipo não resolvido
- **WHEN** a URN tem tipo que não existe no vocabulário
- **THEN** o modelo usado é o padrão, com a descrição vazia

### Requirement: Placeholders da URN do documento
O serviço SHALL substituir `{sigla}`, `{numero}`, `{ano}`, `{descricao}` e `{descricaoMaiusculas}` pelos dados da URN e do seu tipo. Quando um dado não existir, o placeholder SHALL ser substituído por string vazia.

#### Scenario: Caso padrão
- **WHEN** a URN é `urn:lex:br:camara.deputados:projeto.lei;pl:2026;12`
- **THEN** a epígrafe é `PROJETO DE LEI Nº 12, DE 2026`

#### Scenario: Sigla sem tipo com sigla
- **WHEN** um modelo usa `{sigla}` e o tipo da URN não tem sigla
- **THEN** `{sigla}` é substituído por string vazia

### Requirement: Placeholders do documento referenciado
O serviço SHALL substituir `{dr.preposicao}`, `{dr.preposicaoMaiusculas}`, `{dr.sigla}`, `{dr.numero}`, `{dr.ano}`, `{dr.descricao}` e `{dr.descricaoMaiusculas}` pelos dados de `urnDocumentoReferenciado`. `{dr.preposicao}` SHALL ser `ao` para tipo de gênero masculino e `à` para feminino, e `{dr.preposicaoMaiusculas}` SHALL ser `AO` ou `À`. Sem URN referenciada, ou com dado inexistente, o placeholder SHALL virar string vazia.

#### Scenario: Substitutivo da Câmara
- **WHEN** a URN é `urn:lex:br:camara.deputados:substitutivo;sbt:2025;999999` e a referenciada é `urn:lex:br:camara.deputados:projeto.lei;pl:2025;11`
- **THEN** a epígrafe é `SUBSTITUTIVO AO PROJETO DE LEI Nº 11, DE 2025`

#### Scenario: Documento referenciado feminino
- **WHEN** a URN é de subemenda substitutiva da Câmara e a referenciada é `urn:lex:br:camara.deputados:proposta.emenda.constitucional;pec:2025;11`
- **THEN** a epígrafe é `SUBEMENDA SUBSTITUTIVA À PROPOSTA DE EMENDA CONSTITUCIONAL Nº 11, DE 2025`

#### Scenario: Sem documento referenciado
- **WHEN** a URN é de substitutivo da Câmara e não há URN referenciada
- **THEN** todos os placeholders `{dr.*}` do modelo são substituídos por string vazia, sem normalizar os espaços do modelo

### Requirement: Sufixo da epígrafe
O serviço SHALL substituir `{sufixo}` pelo sufixo informado, ou por string vazia quando ausente.

#### Scenario: Substitutivo do Senado com sufixo
- **WHEN** a URN é `urn:lex:br:senado.federal:projeto.lei;pl:2026;1234@apresentacao.substitutivo`, a referenciada é `urn:lex:br:senado.federal:projeto.lei;pl:2026;1234` e o sufixo é `- CCJ`
- **THEN** a epígrafe é o modelo do Senado com `- CCJ` no lugar de `{sufixo}`, terminando em `- CCJ (SUBSTITUTIVO)<br/>(ao Projeto de Lei nº 1.234, de 2026)`

#### Scenario: Sem sufixo
- **WHEN** o mesmo substitutivo é montado sem sufixo
- **THEN** `{sufixo}` é substituído por string vazia

### Requirement: Formatação de número e ano
Os números SHALL ser formatados com ponto como separador de milhar. O número provisório (`999999`) SHALL ser substituído por uma sequência de 7 espaços, para preenchimento manual. O ano provisório (`9999`) SHALL ser substituído por string vazia.

#### Scenario: Separador de milhar
- **WHEN** o número da URN referenciada é `1234`
- **THEN** `{dr.numero}` é `1.234`

#### Scenario: PLV não numerado
- **WHEN** a URN é `urn:lex:br:congresso.nacional:projeto.lei.conversao;plv:2026;999999` e a referenciada é `urn:lex:br:federal:medida.provisoria;mpv:2026;1234`
- **THEN** a epígrafe é `PROJETO DE LEI DE CONVERSÃO Nº ` seguido de 7 espaços e de `, DE 2026<br/>(Medida Provisória nº 1.234, de 2026)`

#### Scenario: Ano provisório
- **WHEN** a URN tem o ano `9999`
- **THEN** `{ano}` é substituído por string vazia

### Requirement: Codificação XML dos valores substituídos
Todo valor substituído num placeholder, inclusive a descrição e o sufixo, SHALL ser codificado como texto XML (`&`, `<`, `>`, aspas). O texto do modelo SHALL ser mantido como está, com os elementos XML que ele contiver.

#### Scenario: Sufixo com caractere especial
- **WHEN** o sufixo é `- CCJ & CAE`
- **THEN** a epígrafe contém `- CCJ &amp; CAE`

#### Scenario: Elemento do modelo preservado
- **WHEN** o modelo contém `<br/>`
- **THEN** a epígrafe contém `<br/>` sem codificação

### Requirement: Quebra de linha na epígrafe
A quebra de linha (`br`) da epígrafe SHALL ser preservada no documento criado por `novaProposicao`, ao abrir um documento, na exibição no editor e ao salvar. A epígrafe recebida como string SHALL ter o `<br/>` interpretado como elemento, não como texto. A ementa e os dispositivos MUST NOT ter o tratamento alterado.

#### Scenario: Nova proposição com quebra de linha
- **WHEN** o host chama `novaProposicao` com uma epígrafe que contém `<br/>`
- **THEN** a epígrafe do documento criado tem um elemento `br` nessa posição, e não o texto `<br/>`

#### Scenario: Exibição em duas linhas
- **WHEN** a epígrafe tem um `br`
- **THEN** o editor exibe a epígrafe em duas linhas, com a quebra nessa posição

#### Scenario: Salvar e abrir
- **WHEN** um documento cuja epígrafe tem um `br` é salvo e reaberto
- **THEN** o arquivo salvo tem o elemento `br` na epígrafe, e a epígrafe reaberta tem a quebra na mesma posição

#### Scenario: Arquivo com quebra de linha
- **WHEN** é aberto um arquivo cuja `Epigrafe` contém `br`
- **THEN** a quebra é preservada na exibição e no próximo salvamento
