# Spec Delta

## MODIFIED Requirements

### Requirement: Serialização da autoria de parlamentares
Ao salvar, o sistema SHALL registrar nos metadados do LexEdit a autoria com tipo `Parlamentar`, a opção de imprimir partido e UF e, na ordem da tela, um registro para cada parlamentar incluído com identificação, nome, sexo, sigla do partido, sigla da UF, sigla da casa legislativa e cargo. O cargo SHALL ser registrado mesmo quando vazio. Parlamentares sem identificação (linhas em branco da tela) SHALL ser desconsiderados. Quando não houver nenhum parlamentar identificado, a autoria SHALL ser omitida.

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
