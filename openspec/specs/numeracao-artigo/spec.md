# numeracao-artigo Specification

## Purpose
Definir o rótulo dos artigos da articulação conforme a quantidade de artigos, como o "Artigo único." da articulação com um só artigo, inclusive na proposição iniciada com texto vazio.

## Requirements

### Requirement: Rótulo do artigo único
Fora de bloco de alteração, a articulação com um só artigo SHALL rotulá-lo "Artigo único.", inclusive na proposição iniciada com texto vazio; com dois ou mais artigos, SHALL rotulá-los "Art. 1º", "Art. 2º" e assim por diante. O artigo único SHALL ser gravado com o rótulo "Artigo único." e o id `art1`.

#### Scenario: Proposição iniciada com texto vazio
- **WHEN** o usuário inicia uma proposição com texto vazio
- **THEN** o único artigo é exibido como "Artigo único."

#### Scenario: Artigo único gravado ao salvar
- **WHEN** a proposição iniciada com texto vazio é salva sem incluir artigos
- **THEN** o artigo é gravado com o rótulo "Artigo único." e o id `art1`

#### Scenario: Inclusão de um segundo artigo
- **WHEN** o usuário inclui um artigo depois do artigo único
- **THEN** os artigos são exibidos como "Art. 1º" e "Art. 2º"

#### Scenario: Volta a um só artigo
- **WHEN** há dois artigos e o usuário exclui um deles
- **THEN** o artigo restante é exibido como "Artigo único."
