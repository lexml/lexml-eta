# Bloco de Alteração de Norma

## Purpose

Define as regras estruturais do artigo de alteração de norma — o artigo cujo caput traz um bloco de alteração — e o que o editor permite criar dentro e ao redor dele.

## Requirements

### Requirement: Artigo de alteração não tem incisos nem parágrafos próprios
Um artigo que possui bloco de alteração de norma SHALL ter como único conteúdo subordinado o bloco de alteração. O editor SHALL NOT criar inciso ou parágrafo próprio (fora do bloco) nesse artigo por nenhuma ação.

#### Scenario: Menu do artigo com bloco de alteração
- **WHEN** o usuário abre o menu de um artigo que possui bloco de alteração
- **THEN** as opções "Adicionar inciso" e "Adicionar parágrafo" não são oferecidas

#### Scenario: Menu do artigo sem bloco de alteração
- **WHEN** o usuário abre o menu de um artigo sem bloco de alteração
- **THEN** as opções "Adicionar inciso" e "Adicionar parágrafo" continuam disponíveis, como hoje

#### Scenario: Ação de adicionar inciso chega por outro caminho
- **WHEN** uma ação de adicionar inciso ou parágrafo como filho é aplicada a um artigo com bloco de alteração sem passar pelo menu
- **THEN** nenhum inciso ou parágrafo próprio é criado e a estrutura do artigo permanece inalterada

#### Scenario: Colar sobre artigo com bloco de alteração
- **WHEN** o usuário cola incisos ou parágrafos com o cursor em um artigo que possui bloco de alteração
- **THEN** nenhum inciso ou parágrafo próprio é criado nesse artigo

### Requirement: Novo dispositivo a partir do fim do artigo de alteração vai para o bloco
Ao pressionar Enter no fim do texto de um artigo com bloco de alteração, o sistema SHALL criar o novo dispositivo dentro do bloco de alteração.

#### Scenario: Enter no fim do texto do artigo de alteração
- **WHEN** o cursor está no fim do texto de um artigo com bloco de alteração e o usuário pressiona Enter
- **THEN** um novo artigo é criado no início do bloco de alteração, e o artigo de alteração continua sem incisos ou parágrafos próprios
