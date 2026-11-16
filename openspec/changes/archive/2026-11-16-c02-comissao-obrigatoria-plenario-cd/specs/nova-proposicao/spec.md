# Spec Delta

## MODIFIED Requirements

### Requirement: Destino do documento
A Tela 1 SHALL exibir sempre o colegiado de destino, com as opções Plenário e Comissão (sem "Plenário via comissão"). O padrão SHALL ser Comissão em Substitutivo e Subemenda substitutiva e Plenário nos demais casos. Em Comissão, a comissão SHALL ser informada, escolhida de uma lista obtida da URL de comissões da configuração, cujo placeholder de casa é preenchido pela autoridade da URN do novo documento: `SF` para `senado.federal`, `CD` para `camara.deputados` e `CN` para `congresso.nacional`. A resposta da URL SHALL ter o mesmo formato da usada pelo componente de destino atual: lista JSON de objetos com `siglaCasaLegislativa`, `sigla` e `nome`, da qual só são usados os itens cuja `siglaCasaLegislativa` é igual à casa pedida. O resultado SHALL informar o tipo do colegiado e, em Comissão, a sigla da comissão. Na `CD`, em Substitutivo e Subemenda substitutiva, uma comissão SHALL ser informada também com o destino Plenário (uma só), e o resultado SHALL informar a sigla da comissão nos dois destinos. No `SF`, o destino alimenta o sufixo opcional do serviço de epígrafe.

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
- **WHEN** o destino é Plenário, exceto em Substitutivo e Subemenda substitutiva da `CD`
- **THEN** o resultado não contém sigla de comissão

#### Scenario: Comissão do Congresso
- **WHEN** o novo documento é de `congresso.nacional`
- **THEN** a lista de comissões é obtida com a casa `CN`

#### Scenario: Falha na obtenção das comissões
- **WHEN** a obtenção da lista de comissões falha por erro de rede ou resposta de erro
- **THEN** o usuário é informado do erro, a opção Comissão fica indisponível, só Plenário é oferecido e o padrão em substitutivo passa a ser Plenário

#### Scenario: Plenário na CD em substitutivo exige comissão
- **WHEN** a casa do editor é `CD`, a espécie é Substitutivo ou Subemenda substitutiva e o destino é Plenário
- **THEN** o seletor de comissão é exibido e **Continuar** está desabilitado enquanto nenhuma comissão for escolhida

#### Scenario: Plenário na CD em substitutivo com comissão
- **WHEN** nesse caso o usuário escolhe a comissão CCJC e conclui
- **THEN** o resultado tem `colegiadoDestino` com `tipoColegiado` Plenário e `siglaComissao` CCJC

#### Scenario: Troca de destino mantém a comissão
- **WHEN** nesse caso o usuário escolheu a comissão CCJC e troca o destino entre Plenário e Comissão
- **THEN** a comissão CCJC continua escolhida

#### Scenario: Proposição na CD não exige comissão no Plenário
- **WHEN** a casa do editor é `CD`, a espécie é Proposição e o destino é Plenário
- **THEN** nenhuma comissão é pedida e o resultado não contém sigla de comissão

#### Scenario: Falha nas comissões na CD em substitutivo
- **WHEN** a casa é `CD`, a espécie é Substitutivo ou Subemenda substitutiva e a lista de comissões falha
- **THEN** o usuário é informado do erro e **Continuar** permanece desabilitado

### Requirement: Tela 1 preenchida a partir dos dados iniciais
No modo de edição, a Tela 1 SHALL ser preenchida a partir dos dados iniciais: espécie, siglas, número e ano lidos da URN e da URN do documento referenciado; destino lido do colegiado; forma de apresentação lida de `anexoParecer`. O PLV SHALL ser reconhecido pela sigla do tipo da própria URN, e a medida provisória lida da URN do documento referenciado. Na `CD`, o ano do substitutivo ou da subemenda substitutiva SHALL ser o da URN inicial, mantido mesmo quando o usuário troca a espécie entre Substitutivo e Subemenda substitutiva; quando a URN inicial não é de substitutivo nem de subemenda substitutiva, o ano SHALL ser o corrente. Na `CD`, em substitutivo e subemenda substitutiva, a comissão do colegiado SHALL ser lida também quando o destino é Plenário.

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

#### Scenario: Comissão lida no Plenário da CD
- **WHEN** a URN inicial é de substitutivo da Câmara e o colegiado inicial é Plenário com a comissão CCJC
- **THEN** o destino é Plenário e a comissão CCJC vem escolhida

#### Scenario: Documento antigo da CD sem comissão no Plenário
- **WHEN** a URN inicial é de substitutivo da Câmara e o colegiado inicial é Plenário sem comissão
- **THEN** a Tela 1 abre com o destino Plenário, sem comissão, e **Continuar** fica desabilitado até uma comissão ser escolhida
