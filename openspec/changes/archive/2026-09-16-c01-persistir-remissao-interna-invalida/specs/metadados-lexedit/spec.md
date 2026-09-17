## Purpose

Metadados do LexEdit é o ponto de extensão `MetadadoProprietario`/`lexedit:Metadado` do documento articulado, onde o LexEdit registra, sem alterar o esquema LexML, informações próprias que o padrão não contempla.

## ADDED Requirements

### Requirement: Emissão condicional do ponto de extensão
O sistema SHALL incluir `MetadadoProprietario` no documento salvo somente quando existir ao menos um grupo de metadados do LexEdit a serializar, com o atributo `fonte` fixo em `http://www.lexml.gov.br/lexedit/1.0`.

#### Scenario: Documento sem nenhum grupo de metadados do LexEdit
- **WHEN** o documento em edição não possui nenhum dado que dependa de um grupo de metadados do LexEdit (ex.: nenhuma remissão interna inválida)
- **THEN** o arquivo salvo não contém o elemento `MetadadoProprietario`

#### Scenario: Documento com ao menos um grupo de metadados do LexEdit
- **WHEN** o documento em edição possui dado de ao menos um grupo de metadados do LexEdit
- **THEN** o arquivo salvo contém `MetadadoProprietario` com o atributo `fonte` igual a `http://www.lexml.gov.br/lexedit/1.0`

### Requirement: Isolamento entre grupos de metadados do LexEdit
A leitura do ponto de extensão SHALL processar cada grupo de metadados do LexEdit de forma independente, sem que a ausência ou a presença de um grupo ainda não suportado pelo sistema impeça a leitura de um grupo suportado.

#### Scenario: Grupo suportado convive com dado de grupo não implementado
- **WHEN** um documento aberto contém, dentro de `MetadadoProprietario`, tanto o grupo de remissões internas inválidas quanto dados de outro grupo do LexEdit ainda não implementado pelo sistema
- **THEN** o sistema reconstrói normalmente o estado correspondente ao grupo de remissões internas inválidas, sem lançar erro por causa do grupo não reconhecido
