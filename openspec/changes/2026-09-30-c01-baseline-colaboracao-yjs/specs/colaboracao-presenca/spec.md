# Spec Delta

## Purpose

Define a presença dos usuários na sala e os cursores remotos: quem está conectado, onde cada um está editando e como a posição de cada cursor é representada de forma estável entre clientes.

## ADDED Requirements

### Requirement: Presença do usuário
O sistema SHALL publicar a presença do usuário local (nome, identificador, sigla e cor) para os demais clientes da sala e SHALL expor a presença dos outros, excluindo o próprio cliente.

#### Scenario: Presença remota listada
- **WHEN** outro cliente publica sua presença
- **THEN** a lista de presenças deste cliente inclui esse usuário e não inclui o próprio

### Requirement: Cor determinística por usuário
O sistema SHALL atribuir a cada usuário uma cor derivada de seu identificador, de modo que todos os clientes vejam a mesma cor para o mesmo usuário.

#### Scenario: Mesma cor em todos os clientes
- **WHEN** dois clientes calculam a cor do mesmo usuário
- **THEN** obtêm a mesma cor

### Requirement: Cursor remoto na posição do dispositivo
O sistema SHALL representar a posição de um cursor pelo identificador global do dispositivo e pelo índice local no seu texto, e SHALL exibir o cursor remoto na posição correspondente deste cliente.

#### Scenario: Seleção de um cliente aparece no outro
- **WHEN** um cliente posiciona o cursor em um dispositivo
- **THEN** o outro cliente exibe um cursor remoto naquele dispositivo, com o nome e a cor do usuário

#### Scenario: Posição estável com numeração diferente
- **WHEN** os clientes têm rótulos ou posições absolutas diferentes no editor
- **THEN** o cursor remoto continua no mesmo ponto do mesmo dispositivo

### Requirement: Cursor de dispositivo não renderizado
O sistema SHALL não exibir o cursor remoto cujo dispositivo não esteja renderizado neste cliente.

#### Scenario: Cursor em outra página
- **WHEN** o cursor remoto está em um dispositivo fora da página atual
- **THEN** nenhum cursor é exibido para esse usuário, sem erro

### Requirement: Presença por dispositivo
O sistema SHALL agregar a presença por dispositivo, informando quais usuários estão em cada um.

#### Scenario: Dois usuários no mesmo dispositivo
- **WHEN** dois outros usuários posicionam o cursor no mesmo dispositivo
- **THEN** a agregação lista os dois usuários naquele dispositivo

### Requirement: Presença é efêmera
O sistema SHALL tratar a presença como estado temporário que não faz parte do documento, removendo-a ao encerrar.

#### Scenario: Usuário sai
- **WHEN** um cliente encerra a colaboração
- **THEN** sua presença deixa de ser exibida aos demais e nada é gravado no documento
