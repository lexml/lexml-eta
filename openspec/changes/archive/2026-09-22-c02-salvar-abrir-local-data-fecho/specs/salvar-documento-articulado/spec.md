## ADDED Requirements

### Requirement: Serialização do local e da data do fecho
Ao salvar, o sistema SHALL registrar nos metadados do LexEdit o local do fecho e, quando informada, a data do fecho no formato `AAAA-MM-DD`. Quando a data não for informada, o atributo de data SHALL ser omitido, nunca gravado vazio. O local registrado SHALL ser o lido do documento aberto, enquanto o destino não for alterado pelo usuário; nos demais casos, SHALL ser o derivado do destino ("Sala da comissão" para comissão, "Sala das sessões" para os demais).

#### Scenario: Data informada
- **WHEN** o usuário informa a data 24/04/2026, com destino Plenário, e salva o documento
- **THEN** o arquivo salvo registra o local "Sala das sessões" e a data `2026-04-24`

#### Scenario: Data não informada
- **WHEN** o usuário escolhe "Não informar" na data e salva o documento
- **THEN** o arquivo salvo registra o local e não contém o atributo de data

#### Scenario: Local preservado de documento aberto
- **WHEN** o usuário abre um documento cujo local registrado é "Sala da comissão" e o salva sem alterar o destino
- **THEN** o arquivo salvo registra o local "Sala da comissão"

#### Scenario: Local derivado após mudança de destino
- **WHEN** o usuário abre um documento cujo local registrado é "Sala da comissão", altera o destino exibido após a abertura (ex.: para "Plenário via Comissão") e salva
- **THEN** o arquivo salvo registra o local "Sala das sessões"

### Requirement: Representação textual do local e da data do fecho
Ao salvar, o sistema SHALL gerar o elemento LexML `ParteFinal/LocalDataFecho` com um parágrafo contendo o local seguido de vírgula e, quando houver data, a data por extenso seguida de ponto final. O dia SHALL ser escrito sem zero à esquerda, e o primeiro dia do mês como `1º`. A geração SHALL independer do fuso horário do navegador.

#### Scenario: Texto com data
- **WHEN** o documento é salvo com local "Sala das sessões" e data `2026-04-24`
- **THEN** `LocalDataFecho` contém o parágrafo "Sala das sessões, 24 de abril de 2026."

#### Scenario: Texto com o primeiro dia do mês
- **WHEN** o documento é salvo com local "Sala das sessões" e data `2026-05-01`
- **THEN** `LocalDataFecho` contém o parágrafo "Sala das sessões, 1º de maio de 2026."

#### Scenario: Texto com dia de um dígito
- **WHEN** o documento é salvo com local "Sala da comissão" e data `2026-03-05`
- **THEN** `LocalDataFecho` contém o parágrafo "Sala da comissão, 5 de março de 2026."

#### Scenario: Texto sem data
- **WHEN** o documento é salvo com local "Sala das sessões" e sem data
- **THEN** `LocalDataFecho` contém o parágrafo "Sala das sessões,"

### Requirement: Fecho no modo anexo de parecer
No modo anexo de parecer, o sistema SHALL salvar o documento sem local, sem data e sem `ParteFinal`.

#### Scenario: Documento em modo anexo de parecer
- **WHEN** o usuário salva um documento no modo anexo de parecer
- **THEN** o arquivo salvo não contém local nem data nos metadados do LexEdit, nem o elemento `ParteFinal`
