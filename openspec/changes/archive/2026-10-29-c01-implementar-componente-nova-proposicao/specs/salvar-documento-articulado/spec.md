## MODIFIED Requirements

### Requirement: Serialização do local e da data do fecho
Ao salvar, o sistema SHALL registrar nos metadados do LexEdit o local do fecho e, quando informada, a data do fecho no formato `AAAA-MM-DD`. Quando a data não for informada, o atributo de data SHALL ser omitido, nunca gravado vazio. O local registrado SHALL ser o lido do documento aberto, enquanto o colegiado do documento for o lido ao abrir; nos demais casos, SHALL ser o derivado do colegiado ("Sala da Comissão" para comissão, "Sala das Sessões" para Plenário ou na ausência de colegiado).

#### Scenario: Data informada
- **WHEN** o usuário informa a data 24/04/2026, em documento com colegiado Plenário, e salva o documento
- **THEN** o arquivo salvo registra o local "Sala das Sessões" e a data `2026-04-24`

#### Scenario: Data não informada
- **WHEN** o usuário escolhe "Não informar" na data e salva o documento
- **THEN** o arquivo salvo registra o local e não contém o atributo de data

#### Scenario: Local preservado de documento aberto
- **WHEN** o usuário abre um documento cujo local registrado é "Sala da Comissão" e o salva
- **THEN** o arquivo salvo registra o local "Sala da Comissão"

#### Scenario: Local derivado após mudança de destino
- **WHEN** o usuário abre um documento sem local registrado e com colegiado Comissão, e o salva
- **THEN** o arquivo salvo registra o local "Sala da Comissão"

#### Scenario: Local sem colegiado
- **WHEN** o usuário salva um documento sem colegiado e sem local lido do arquivo
- **THEN** o arquivo salvo registra o local "Sala das Sessões"
