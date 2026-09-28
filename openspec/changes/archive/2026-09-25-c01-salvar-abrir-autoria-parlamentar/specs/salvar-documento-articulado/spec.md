## ADDED Requirements

### Requirement: Serialização da autoria de parlamentares
Ao salvar, o sistema SHALL registrar nos metadados do LexEdit a autoria com tipo `Parlamentar`, a opção de imprimir partido e UF e, na ordem da tela, um registro para cada parlamentar incluído com identificação, nome, sexo, sigla do partido, sigla da UF, sigla da casa legislativa e cargo. O cargo SHALL ser registrado mesmo quando vazio. Parlamentares sem identificação (linhas em branco da tela) SHALL ser desconsiderados. Quando não houver nenhum parlamentar identificado, a autoria SHALL ser omitida. A quantidade de assinaturas adicionais não SHALL ser registrada.

#### Scenario: Dois parlamentares
- **WHEN** o usuário inclui como autores os senadores Davi Alcolumbre (UNIÃO-AP, cargo "Presidente do Senado Federal") e Soraya Thronicke (PSB-MS, sem cargo), com a impressão de partido e UF marcada, e salva o documento
- **THEN** o arquivo salvo registra a autoria de tipo `Parlamentar`, com imprimir partido e UF verdadeiro e os dois parlamentares nessa ordem, cada um com seus sete atributos, e o cargo da segunda como texto vazio

#### Scenario: Impressão de partido e UF desmarcada
- **WHEN** o usuário desmarca "Imprimir partido e UF para os signatários" e salva o documento
- **THEN** o arquivo salvo registra imprimir partido e UF como falso

#### Scenario: Nenhum parlamentar identificado
- **WHEN** o usuário salva o documento sem nenhum parlamentar identificado na autoria
- **THEN** o arquivo salvo não contém a autoria nos metadados do LexEdit

#### Scenario: Linha de parlamentar em branco
- **WHEN** o usuário inclui um parlamentar identificado e deixa uma segunda linha de parlamentar em branco, e salva
- **THEN** o arquivo salvo registra apenas o parlamentar identificado

### Requirement: Representação textual das assinaturas de parlamentares
Ao salvar, o sistema SHALL gerar em `ParteFinal`, depois de `LocalDataFecho`, um elemento LexML `AssinaturaTexto` para cada parlamentar registrado na autoria, na mesma ordem. Cada `AssinaturaTexto` SHALL conter: um parágrafo com o tratamento e o nome em negrito; um parágrafo `(<partido> - <UF>)`, somente quando a impressão de partido e UF estiver marcada; e um parágrafo com o cargo, somente quando o cargo não for vazio. O tratamento SHALL ser "Senador" ou "Senadora" para a casa legislativa `SF`, e "Deputado" ou "Deputada" para `CD`, conforme o sexo `M` ou `F`. Sem parlamentar registrado, nenhum `AssinaturaTexto` SHALL ser gerado.

#### Scenario: Senador com cargo
- **WHEN** o documento é salvo com o parlamentar Davi Alcolumbre, sexo `M`, casa `SF`, partido UNIÃO, UF AP, cargo "Presidente do Senado Federal", e a impressão de partido e UF marcada
- **THEN** `ParteFinal` contém um `AssinaturaTexto` com os parágrafos "**Senador Davi Alcolumbre**", "(UNIÃO - AP)" e "Presidente do Senado Federal"

#### Scenario: Senadora sem cargo
- **WHEN** o documento é salvo com a parlamentar Soraya Thronicke, sexo `F`, casa `SF`, partido PSB, UF MS, sem cargo, e a impressão de partido e UF marcada
- **THEN** o `AssinaturaTexto` correspondente contém somente os parágrafos "**Senadora Soraya Thronicke**" e "(PSB - MS)"

#### Scenario: Deputada
- **WHEN** o documento é salvo com uma parlamentar de sexo `F` e casa `CD`
- **THEN** o primeiro parágrafo do `AssinaturaTexto` correspondente começa com "Deputada", em negrito com o nome

#### Scenario: Impressão de partido e UF desmarcada
- **WHEN** o documento é salvo com a impressão de partido e UF desmarcada
- **THEN** nenhum `AssinaturaTexto` contém o parágrafo de partido e UF

#### Scenario: Fecho e assinaturas juntos
- **WHEN** o documento é salvo com local, data e dois parlamentares
- **THEN** `ParteFinal` contém primeiro `LocalDataFecho` e depois os dois `AssinaturaTexto`, na ordem dos parlamentares

#### Scenario: Validação pelo esquema LexML
- **WHEN** o documento salvo com autoria de parlamentares é convertido em XML pelo conversor `jsonix-lexml` 2.0.0
- **THEN** o XML é válido perante o esquema LexML e o esquema do LexEdit, e a conversão de volta para JSON reproduz a mesma autoria e a mesma `ParteFinal`

### Requirement: Autoria no modo anexo de parecer
No modo anexo de parecer, o sistema SHALL salvar o documento sem autoria nos metadados do LexEdit e sem `AssinaturaTexto`.

#### Scenario: Documento em modo anexo de parecer
- **WHEN** o usuário salva um documento no modo anexo de parecer
- **THEN** o arquivo salvo não contém a autoria nos metadados do LexEdit nem o elemento `AssinaturaTexto`
