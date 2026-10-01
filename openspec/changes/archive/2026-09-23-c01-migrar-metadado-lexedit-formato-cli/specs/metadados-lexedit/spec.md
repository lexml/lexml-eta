## ADDED Requirements

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
Ao abrir um documento salvo antes desta mudança, com os metadados do LexEdit no formato provisório (a chave `lexedit` diretamente em `MetadadoProprietario`, com `refIdsRemissoesInternas` como lista e `pendencias` como lista de textos), o sistema SHALL recuperar os mesmos grupos que recupera do formato novo. O próximo salvamento SHALL gravar somente o formato novo.

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
