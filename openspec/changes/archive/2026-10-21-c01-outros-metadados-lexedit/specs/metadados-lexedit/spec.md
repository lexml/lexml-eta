## ADDED Requirements

### Requirement: Grupo de outros metadados genéricos
O sistema SHALL gravar o grupo `OutrosMetadados` em `lexedit:Metadado` somente quando houver ao menos um par chave/valor a registrar, com um `lexedit:OutroMetadado` por par: a chave no atributo `chave` e o valor como conteúdo de texto. Chave e valor SHALL ser gravados como informados, sem interpretação. Sem nenhum par, o grupo SHALL ser omitido, e o grupo SHALL NOT gerar pendência.

#### Scenario: Documento com dois pares
- **WHEN** o usuário salva um documento com os metadados `tituloAntesDaEpigrafe` = "COMISSÃO XPTO" e `jsonDadosComissao` = `{"id":1,"ativa":true}`
- **THEN** o arquivo contém `lexedit:OutrosMetadados` com um `lexedit:OutroMetadado` para cada chave, e o valor do segundo é o texto JSON, sem alteração

#### Scenario: Documento sem outros metadados
- **WHEN** o usuário salva um documento sem nenhum par chave/valor
- **THEN** o arquivo não contém `lexedit:OutrosMetadados`

#### Scenario: Grupo não gera pendência
- **WHEN** o usuário salva um documento apenas com outros metadados
- **THEN** o arquivo não contém `lexedit:Pendencias` por causa do grupo

#### Scenario: Convivência com os demais grupos
- **WHEN** o usuário salva um documento com opções de impressão, autoria e outros metadados
- **THEN** o arquivo contém um único `MetadadoProprietario` com todos os grupos, e o conteúdo de cada um não é alterado pelos outros

### Requirement: Unicidade das chaves
O esquema `schemas/lexedit.xsd` SHALL exigir que a `chave` seja única dentro de `lexedit:OutrosMetadados`. O sistema SHALL NOT gravar duas entradas com a mesma chave, e ao ler um arquivo com chaves repetidas SHALL manter a primeira ocorrência e ignorar as demais, sem invalidar o documento.

#### Scenario: Esquema rejeita chave repetida
- **WHEN** um `lexedit:Metadado` com duas entradas de mesma `chave` é validado com `schemas/lexedit.xsd`
- **THEN** a validação aponta erro de unicidade

#### Scenario: Arquivo com chave repetida é aberto
- **WHEN** o usuário abre um arquivo cujo `OutrosMetadados` repete uma chave com valores diferentes
- **THEN** o documento abre normalmente e a propriedade de outros metadados contém o valor da primeira ocorrência

### Requirement: Leitura tolerante dos outros metadados
Ao abrir um documento, o sistema SHALL recuperar do grupo `OutrosMetadados` todos os pares válidos, descartando as entradas sem `chave`, com `chave` vazia ou com valor que não seja texto, sem impedir a leitura dos demais pares nem dos demais grupos. Valor vazio SHALL ser aceito como texto vazio.

#### Scenario: Arquivo com pares válidos e inválidos
- **WHEN** o usuário abre um arquivo cujo `OutrosMetadados` tem um par válido, uma entrada sem `chave` e uma entrada com valor não textual
- **THEN** o documento abre normalmente e os outros metadados contêm somente o par válido

#### Scenario: Valor vazio
- **WHEN** o usuário abre um arquivo com `<lexedit:OutroMetadado chave="x"></lexedit:OutroMetadado>`
- **THEN** os outros metadados contêm a chave `x` com valor vazio

#### Scenario: Convive com os demais grupos
- **WHEN** o usuário abre um arquivo com `OutrosMetadados` inválido e opções de impressão válidas
- **THEN** o formulário de opções de impressão exibe os valores do arquivo

### Requirement: Propriedade pública para os outros metadados
O componente `LexmlEtaComponent` SHALL expor a propriedade pública `outrosMetadados` (`Record<string, string>`). Ao salvar, o sistema SHALL gravar o valor corrente da propriedade, inclusive em anexo de parecer. Ao abrir um arquivo, o sistema SHALL substituir o valor da propriedade pelos pares lidos, e um arquivo sem o grupo SHALL deixá-la vazia.

#### Scenario: Host define a propriedade e salva
- **WHEN** o host define `outrosMetadados` com `{ tituloAntesDaEpigrafe: "COMISSÃO XPTO" }` e o usuário salva
- **THEN** o arquivo salvo contém o par correspondente

#### Scenario: Anexo de parecer
- **WHEN** o host define `outrosMetadados` com um par e o documento é um anexo de parecer
- **THEN** o arquivo salvo contém o grupo `OutrosMetadados`

#### Scenario: Abrir arquivo com outros metadados
- **WHEN** o usuário abre um arquivo com dois pares em `OutrosMetadados`
- **THEN** a propriedade `outrosMetadados` do componente contém os dois pares

#### Scenario: Abrir arquivo sem o grupo
- **WHEN** o usuário abre um arquivo sem `OutrosMetadados` depois de ter aberto outro que o tinha
- **THEN** a propriedade `outrosMetadados` fica vazia

### Requirement: Outros metadados na ida e volta pelo conversor
O conversor `jsonix-lexml` com o esquema atualizado SHALL converter para XML e de volta para JSON um documento com `lexedit:OutrosMetadados` sem descartá-lo, e o XML gerado SHALL ser válido pelo `schemas/lexedit.xsd`. Salvar de novo o documento aberto SHALL gerar um arquivo igual ao original.

#### Scenario: Ida e volta preserva os pares
- **WHEN** um documento com três pares, um deles com caracteres especiais de XML (`<`, `&`, aspas) e acentos, é salvo, convertido em XML, convertido de volta em JSON e aberto
- **THEN** a propriedade `outrosMetadados` contém os três pares com os valores originais
- **AND** salvar esse documento aberto gera um arquivo igual ao salvo originalmente

#### Scenario: XML válido pelo esquema
- **WHEN** o XML gerado a partir de um documento com outros metadados é validado com `schemas/lexedit.xsd`
- **THEN** a validação não aponta erro
