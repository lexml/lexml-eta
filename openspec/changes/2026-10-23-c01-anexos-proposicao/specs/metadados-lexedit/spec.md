## ADDED Requirements

### Requirement: Grupo de anexos no arquivo
O sistema SHALL gravar o grupo `Anexos` em `lexedit:Metadado` somente quando houver ao menos um anexo, com um `lexedit:Anexo` por anexo, na ordem de exibição, e os atributos `idArquivo`, `nomeArquivo`, `nomeDocumento`, `tipo` e `mimeType`. O conteúdo do arquivo anexado SHALL NOT ser gravado. Sem anexos, o grupo SHALL ser omitido, e o grupo SHALL NOT gerar pendência. O sistema SHALL gravar o grupo também no modo anexo de parecer.

#### Scenario: Documento com dois anexos
- **WHEN** o usuário salva um documento com dois anexos, o primeiro DOCX do tipo `substitutivo` e o segundo PDF do tipo `outro`
- **THEN** o arquivo contém `lexedit:Anexos` com dois `lexedit:Anexo`, na mesma ordem, cada um com os cinco atributos

#### Scenario: Conteúdo não é gravado
- **WHEN** o usuário salva um documento com anexos
- **THEN** o arquivo não contém o conteúdo dos arquivos anexados, apenas o `idArquivo` de cada um

#### Scenario: Documento sem anexos
- **WHEN** o usuário salva um documento sem anexos
- **THEN** o arquivo não contém `lexedit:Anexos`

#### Scenario: Grupo não gera pendência
- **WHEN** o usuário salva um documento apenas com anexos
- **THEN** o arquivo não contém `lexedit:Pendencias` por causa do grupo

#### Scenario: Modo anexo de parecer
- **WHEN** o usuário salva, no modo anexo de parecer, um documento com um anexo
- **THEN** o arquivo contém o grupo `Anexos`

#### Scenario: Convivência com os demais grupos
- **WHEN** o usuário salva um documento com opções de impressão, autoria e anexos
- **THEN** o arquivo contém um único `MetadadoProprietario` com todos os grupos, e o conteúdo de cada um não é alterado pelos outros

### Requirement: Leitura tolerante dos anexos
Ao abrir um documento, o sistema SHALL recuperar do grupo `Anexos` os anexos válidos, na ordem do arquivo, descartando o `Anexo` sem `idArquivo` ou sem `nomeArquivo` textuais não vazios, ou com `mimeType` diferente de PDF e DOCX, sem impedir a leitura dos demais anexos nem dos demais grupos. `nomeDocumento` ausente SHALL assumir o nome do arquivo sem extensão, e `tipo` ausente ou vazio SHALL assumir `outro`.

#### Scenario: Arquivo com anexos válidos e inválidos
- **WHEN** o usuário abre um arquivo cujo `Anexos` tem um anexo válido, um sem `idArquivo` e um com `mimeType` `image/png`
- **THEN** o documento abre normalmente e a aba lista somente o anexo válido

#### Scenario: Atributos opcionais ausentes
- **WHEN** o usuário abre um arquivo com um anexo `parecer.pdf` sem `nomeDocumento` e sem `tipo`
- **THEN** a aba mostra o nome do documento `parecer` e o tipo "Outro"

#### Scenario: Um único anexo
- **WHEN** o usuário abre um arquivo cujo `Anexos` tem um único `Anexo`, entregue pelo conversor como objeto em vez de lista
- **THEN** a aba lista esse anexo

#### Scenario: Convive com os demais grupos
- **WHEN** o usuário abre um arquivo com `Anexos` inválido e opções de impressão válidas
- **THEN** o formulário de opções de impressão exibe os valores do arquivo

### Requirement: Anexos na ida e volta pelo conversor
O conversor `jsonix-lexml` SHALL converter para XML e de volta para JSON um documento com `lexedit:Anexos` sem descartá-lo, e o XML gerado SHALL ser válido pelo `schemas/lexedit.xsd`. Salvar de novo o documento aberto SHALL gerar um arquivo igual ao original.

#### Scenario: Ida e volta preserva os anexos
- **WHEN** um documento com três anexos, um deles com acentos e `&` no nome do documento, é salvo, convertido em XML, convertido de volta em JSON e aberto
- **THEN** a aba lista os três anexos, na mesma ordem, com os mesmos valores
- **AND** salvar esse documento aberto gera um arquivo igual ao salvo originalmente

#### Scenario: XML válido pelo esquema
- **WHEN** o XML gerado a partir de um documento com anexos é validado com `schemas/lexedit.xsd`
- **THEN** a validação não aponta erro
