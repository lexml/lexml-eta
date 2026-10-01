## ADDED Requirements

### Requirement: Recuperação do local e da data do fecho ao abrir
Ao abrir um documento, o sistema SHALL aplicar ao campo "Data" a data do fecho registrada nos metadados do LexEdit. Data ausente, vazia ou fora do formato `AAAA-MM-DD` SHALL corresponder a "Não informar". O local registrado SHALL ser preservado para o próximo salvamento enquanto o destino não for alterado. O texto de `LocalDataFecho` não SHALL ser interpretado: os dados estruturados são a fonte, e o texto é gerado novamente ao salvar.

#### Scenario: Documento com data
- **WHEN** o usuário abre um documento cuja data do fecho é `2026-04-24`
- **THEN** o campo "Data" exibe 24/04/2026 como data informada

#### Scenario: Documento sem data ou com data vazia
- **WHEN** o usuário abre um documento sem o atributo de data, ou com ele vazio
- **THEN** o campo "Data" exibe a opção "Não informar" selecionada

#### Scenario: Documento com data inválida
- **WHEN** o usuário abre um documento cuja data do fecho é "24/04/2026"
- **THEN** o campo "Data" exibe a opção "Não informar" selecionada, sem impedir a abertura do documento

#### Scenario: Documento sem metadados do LexEdit
- **WHEN** o usuário abre um documento sem `MetadadoProprietario`, mesmo que contenha `LocalDataFecho`
- **THEN** o campo "Data" exibe "Não informar", e o local passa a ser derivado do destino

#### Scenario: Salvar e reabrir preserva o fecho
- **WHEN** o usuário salva um documento com data informada, abre o arquivo salvo e o salva novamente sem alterações
- **THEN** o segundo arquivo registra o mesmo local, a mesma data e o mesmo texto de `LocalDataFecho` do primeiro
