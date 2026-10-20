## MODIFIED Requirements

### Requirement: Artigo de alteração não tem incisos nem parágrafos próprios
Um artigo que possui bloco de alteração de norma SHALL ter como único conteúdo subordinado o bloco de alteração. O editor SHALL NOT criar inciso, parágrafo ou pena próprios (fora do bloco) nesse artigo por nenhuma ação.

#### Scenario: Menu do artigo com bloco de alteração
- **WHEN** o usuário abre o menu de um artigo que possui bloco de alteração
- **THEN** as opções "Adicionar inciso", "Adicionar parágrafo" e "Adicionar pena, medida administrativa e outros" não são oferecidas

#### Scenario: Menu do artigo sem bloco de alteração
- **WHEN** o usuário abre o menu de um artigo sem bloco de alteração
- **THEN** as opções "Adicionar inciso" e "Adicionar parágrafo" continuam disponíveis, como hoje

#### Scenario: Ação de adicionar inciso chega por outro caminho
- **WHEN** uma ação de adicionar inciso, parágrafo ou pena como filho é aplicada a um artigo com bloco de alteração sem passar pelo menu
- **THEN** nenhum inciso, parágrafo ou pena próprio é criado e a estrutura do artigo permanece inalterada

#### Scenario: Colar sobre artigo com bloco de alteração
- **WHEN** o usuário cola incisos ou parágrafos com o cursor em um artigo que possui bloco de alteração
- **THEN** nenhum inciso ou parágrafo próprio é criado nesse artigo

#### Scenario: Pena dentro do bloco
- **WHEN** o usuário abre o menu de um dispositivo dentro do bloco de alteração que admite pena
- **THEN** a opção "Adicionar pena, medida administrativa e outros" é oferecida, como fora do bloco
