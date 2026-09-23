# Metadados do LexEdit

## Purpose

Metadados do LexEdit é o ponto de extensão `MetadadoProprietario`/`lexedit:Metadado` do documento articulado, onde o LexEdit registra, sem alterar o esquema LexML, informações próprias que o padrão não contempla.

## Requirements

### Requirement: Emissão condicional do ponto de extensão
O sistema SHALL incluir `MetadadoProprietario` no documento salvo somente quando existir ao menos um grupo de metadados do LexEdit a serializar, com o atributo `fonte` fixo em `http://www.lexml.gov.br/lexedit/1.0`. Como as opções de impressão são sempre serializadas, todo documento salvo pelo editor contém `MetadadoProprietario`. A ausência do elemento só ocorre quando o documento é criado sem dados de nenhum grupo.

#### Scenario: Documento sem nenhum grupo de metadados do LexEdit
- **WHEN** o documento é criado sem opções de impressão e sem nenhum outro dado que dependa de um grupo de metadados do LexEdit (ex.: nenhuma remissão interna inválida)
- **THEN** o arquivo gerado não contém o elemento `MetadadoProprietario`

#### Scenario: Documento com ao menos um grupo de metadados do LexEdit
- **WHEN** o documento em edição possui dado de ao menos um grupo de metadados do LexEdit
- **THEN** o arquivo salvo contém `MetadadoProprietario` com o atributo `fonte` igual a `http://www.lexml.gov.br/lexedit/1.0`

#### Scenario: Documento salvo pelo editor
- **WHEN** o usuário salva um documento pelo editor, com ou sem remissões internas inválidas
- **THEN** o arquivo salvo contém `MetadadoProprietario`, com ao menos o grupo de opções de impressão

### Requirement: Isolamento entre grupos de metadados do LexEdit
A leitura do ponto de extensão SHALL processar cada grupo de metadados do LexEdit de forma independente, sem que a ausência ou a presença de um grupo ainda não suportado pelo sistema impeça a leitura de um grupo suportado.

#### Scenario: Grupo suportado convive com dado de grupo não implementado
- **WHEN** um documento aberto contém, dentro de `MetadadoProprietario`, tanto o grupo de remissões internas inválidas quanto dados de outro grupo do LexEdit ainda não implementado pelo sistema
- **THEN** o sistema reconstrói normalmente o estado correspondente ao grupo de remissões internas inválidas, sem lançar erro por causa do grupo não reconhecido

### Requirement: Coexistência de grupos no mesmo ponto de extensão
Quando houver mais de um grupo de metadados do LexEdit a serializar, o sistema SHALL registrá-los todos no mesmo `MetadadoProprietario`, sem que a presença de um grupo altere o conteúdo registrado de outro.

#### Scenario: Opções de impressão e remissões internas inválidas no mesmo documento
- **WHEN** o usuário salva um documento com remissão interna inválida e opções de impressão alteradas
- **THEN** o arquivo salvo contém um único `MetadadoProprietario` com o grupo de opções de impressão, o grupo de remissões internas inválidas e a pendência correspondente
- **AND** ao abrir esse arquivo, o sistema reconstrói tanto as opções de impressão quanto o estado inválido das remissões
