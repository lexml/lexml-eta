## MODIFIED Requirements

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

### Requirement: Continuar na Tela 1
**Continuar** na Tela 1 SHALL exigir a sigla da proposição escolhida, o destino válido e, quando o documento referencia outro (Substitutivo, Subemenda substitutiva ou PLV), o documento referenciado verificado e existente. Na `CD`, o tipo e o ano do substitutivo ou da subemenda MUST NOT ser exigidos do usuário.

#### Scenario: Referência exigida e não verificada
- **WHEN** o documento é substitutivo, subemenda substitutiva ou PLV e a referência não foi verificada
- **THEN** **Continuar** está desabilitado

#### Scenario: Substitutivo da CD sem identificação própria
- **WHEN** a casa é `CD`, a espécie é Substitutivo, a proposição referenciada foi verificada e o destino é válido
- **THEN** **Continuar** está habilitado, sem que nenhuma sigla ou ano do substitutivo tenha sido informado

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
