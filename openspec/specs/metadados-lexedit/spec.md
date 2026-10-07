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

### Requirement: Formato do ponto de extensão compatível com o conversor LexML
O sistema SHALL gravar o conteúdo do LexEdit, dentro de `MetadadoProprietario`, como o elemento nomeado `lexedit:Metadado` (namespace `http://www.lexml.gov.br/lexedit/1.0`), com os grupos tipados conforme `schemas/lexedit.xsd`, no mesmo formato de `docs/extensao-formato-lexml/documento-articulado-exemplo.json`. A lista de identificadores de remissões internas inválidas SHALL ser gravada como um único texto, com os identificadores separados por espaço. A lista de pendências SHALL ser gravada como uma sequência de elementos `Pendencia` dentro de `Pendencias`. O conversor `jsonix-lexml` 2.0.0 SHALL converter o arquivo salvo em XML sem erro e sem descartar nenhum grupo.

#### Scenario: Conversão para XML preserva os grupos do LexEdit
- **WHEN** o usuário salva um documento com local "Sala das sessões", data `2026-04-24` e opções de impressão, e o arquivo é convertido em XML pelo conversor `jsonix-lexml` 2.0.0
- **THEN** o XML contém `MetadadoProprietario` com um `lexedit:Metadado` que tem `local="Sala das sessões"`, `data="2026-04-24"` e o filho `lexedit:OpcoesImpressao` com os quatro atributos

#### Scenario: Documento com mais de uma remissão interna inválida
- **WHEN** o usuário salva um documento com duas remissões internas inválidas, e o arquivo é convertido em XML pelo conversor
- **THEN** a conversão termina sem erro, e o XML contém `lexedit:RemissoesInternasInvalidas` com `refIdsRemissoesInternas` listando os dois identificadores separados por espaço

#### Scenario: Pendências no XML
- **WHEN** o usuário salva um documento com remissão interna inválida, e o arquivo é convertido em XML pelo conversor
- **THEN** o XML contém `lexedit:Pendencias` com um `lexedit:Pendencia` por pendência

#### Scenario: XML gerado é válido pelo esquema do LexEdit
- **WHEN** o XML gerado pelo conversor a partir de um documento salvo pelo editor é validado com `schemas/lexedit.xsd`, que importa o esquema LexML
- **THEN** a validação não aponta erro, nem na parte LexML nem no conteúdo de `lexedit:Metadado`

### Requirement: Ida e volta dos metadados do LexEdit pelo conversor
Ao converter em XML um documento salvo pelo editor e convertê-lo de volta em JSON pelo conversor `jsonix-lexml` 2.0.0, o sistema SHALL abrir o resultado com os mesmos valores de todos os grupos do LexEdit que suporta. Salvar de novo esse documento SHALL gerar um arquivo igual ao original.

#### Scenario: Opções de impressão, fecho e remissão inválida voltam do XML
- **WHEN** um documento com opções de impressão alteradas, local e data do fecho e uma remissão interna inválida é salvo, convertido em XML, convertido de volta em JSON e aberto
- **THEN** o formulário de opções de impressão, o campo "Data" e o local exibem os valores salvos, e a remissão é reconstruída como inválida
- **AND** salvar esse documento aberto gera um arquivo igual ao salvo originalmente

### Requirement: Leitura do formato provisório dos metadados do LexEdit
Ao abrir um documento salvo antes da adoção do conversor `jsonix-lexml` 2.0.0, com os metadados do LexEdit no formato provisório (a chave `lexedit` diretamente em `MetadadoProprietario`, com `refIdsRemissoesInternas` como lista e `pendencias` como lista de textos), o sistema SHALL recuperar os mesmos grupos que recupera do formato novo. O próximo salvamento SHALL gravar somente o formato novo.

#### Scenario: Arquivo antigo com opções de impressão e fecho
- **WHEN** o usuário abre um arquivo salvo no formato provisório, com opções de impressão e com local e data do fecho
- **THEN** o formulário de opções de impressão, o campo "Data" e o local exibem os valores do arquivo

#### Scenario: Arquivo antigo com remissão interna inválida
- **WHEN** o usuário abre um arquivo salvo no formato provisório com uma remissão interna inválida listada
- **THEN** a remissão é reconstruída como inválida, com a mensagem no dispositivo de origem e o alerta global

#### Scenario: Salvar um arquivo antigo converte para o formato novo
- **WHEN** o usuário abre um arquivo salvo no formato provisório e o salva
- **THEN** o arquivo salvo contém os metadados do LexEdit somente no formato novo, sem a chave `lexedit`

#### Scenario: Formato novo prevalece se os dois estiverem presentes
- **WHEN** um arquivo aberto contém, em `MetadadoProprietario`, o `lexedit:Metadado` no formato novo e também a chave `lexedit` do formato provisório, com valores diferentes
- **THEN** o sistema usa os valores do formato novo

### Requirement: Grupo de usuários referenciados
O sistema SHALL gravar o grupo `Usuarios` em `lexedit:Metadado` somente quando houver ao menos uma referência `refIdUsuario` a registrar, sem repetir usuários, e SHALL ler o grupo ao abrir de forma independente dos demais grupos.

#### Scenario: Documento sem referência a usuário
- **WHEN** o usuário salva um documento sem nenhum grupo que referencie usuários
- **THEN** o arquivo salvo não contém `Usuarios`

#### Scenario: Convivência com os demais grupos
- **WHEN** o usuário salva um documento com opções de impressão, autoria, remissão interna inválida e revisões da hierarquia
- **THEN** o arquivo salvo contém um único `MetadadoProprietario` com todos os grupos, e `Usuarios` com os usuários das revisões

### Requirement: Revisões da hierarquia compatíveis com o conversor LexML
O sistema SHALL gravar `RevisoesArticulacao` no formato tipado do conversor `jsonix-lexml` 2.0.0, conforme `schemas/lexedit.xsd`, incluindo o conteúdo filho de cada `RevisaoArticulacao` (parágrafo do texto anterior ou dispositivo excluído com sua hierarquia). O conversor SHALL converter o arquivo em XML sem erro e sem descartar nenhum atributo ou conteúdo das revisões.

#### Scenario: Conversão para XML preserva as revisões
- **WHEN** o usuário salva um documento com revisões de adição, exclusão, alteração, movimentação e transformação, e o arquivo é convertido em XML pelo conversor
- **THEN** o XML contém um `lexedit:RevisaoArticulacao` por revisão principal, com `revisao`, `refIdUsuario` e `data`, e o conteúdo filho de cada uma

#### Scenario: XML válido pelo esquema do LexEdit
- **WHEN** o XML gerado a partir de um documento com revisões da hierarquia é validado com `schemas/lexedit.xsd`
- **THEN** a validação não aponta erro, nem na parte LexML nem no conteúdo de `lexedit:Metadado`

#### Scenario: Ida e volta pelo conversor
- **WHEN** um documento com revisões da hierarquia é salvo, convertido em XML, convertido de volta em JSON e aberto
- **THEN** o editor exibe as mesmas revisões, e salvar esse documento gera um arquivo igual ao original
