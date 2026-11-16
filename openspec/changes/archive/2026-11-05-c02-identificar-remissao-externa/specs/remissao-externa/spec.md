## ADDED Requirements

### Requirement: Desligar a detecção automática pela configuração
A configuração do componente (`lexmlEtaConfig`) SHALL ter o campo `identificarRemissaoExterna`, booleano, com padrão `true`. Com `true` ou sem o campo, a detecção automática de citação a norma externa SHALL funcionar como descrito nos demais requisitos. Com `false`, o sistema SHALL NOT rodar a detecção automática de remissão externa nem iniciar o parser do navegador (Web Worker) usado por ela; a detecção automática de remissão interna, a criação e a edição manual pelo diálogo, a colagem de link e a exibição e gravação das remissões externas já existentes SHALL continuar funcionando.

#### Scenario: Padrão mantém a detecção ligada
- **WHEN** o hospedeiro não informa `identificarRemissaoExterna` e o usuário digita "art. 5º da Lei nº 8.069, de 13 de julho de 1990" e sai da linha
- **THEN** o link para a norma é criado automaticamente, como antes

#### Scenario: Detecção desligada não cria link nem inicia o parser
- **WHEN** o hospedeiro informa `identificarRemissaoExterna: false` e o usuário digita a mesma citação e sai da linha
- **THEN** nenhum link de remissão externa é criado, o parser do navegador não é iniciado e nenhum erro é registrado no console por causa da detecção

#### Scenario: Remissão interna continua automática
- **WHEN** o hospedeiro informa `identificarRemissaoExterna: false` e o usuário digita "conforme o art. 2º" num documento com art. 2º e sai da linha
- **THEN** a remissão interna é criada automaticamente, como antes

#### Scenario: Remissão externa manual continua disponível
- **WHEN** o hospedeiro informa `identificarRemissaoExterna: false` e o usuário seleciona um trecho e informa a norma pelo diálogo de remissão
- **THEN** o link de remissão externa é criado, como antes

#### Scenario: Remissões do documento aberto são mantidas
- **WHEN** o hospedeiro informa `identificarRemissaoExterna: false` e abre um documento que já tem remissões externas
- **THEN** os links são exibidos e continuam no documento ao salvar
