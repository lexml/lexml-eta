# Spec Delta

## MODIFIED Requirements

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
- **WHEN** o usuário abre um documento cujo local registrado é "Sala da comissão", altera o destino exibido após a abertura (ex.: para "Plenário") e salva
- **THEN** o arquivo salvo registra o local "Sala das sessões"
