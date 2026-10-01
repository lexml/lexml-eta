# Spec Delta

## Purpose

Define quando a colaboração liga, como ela se comporta sem rede e como se desliga, garantindo que o editor continue plenamente utilizável e que, com a colaboração desligada, a aplicação seja idêntica à que existia antes dela.

## ADDED Requirements

### Requirement: Colaboração é um overlay opcional
O sistema SHALL tratar a colaboração como camada opcional sobre o editor: sem configuração de colaboração, nenhum documento compartilhado é criado e o comportamento do editor MUST ser idêntico ao da versão sem colaboração.

#### Scenario: Sem parâmetros de colaboração
- **WHEN** o editor é inicializado sem parâmetros de colaboração
- **THEN** nenhuma estrutura de colaboração é criada e o estado é "desligado"

#### Scenario: Transporte carregado só quando necessário
- **WHEN** a colaboração está desligada
- **THEN** os módulos de transporte e de persistência local não são carregados

### Requirement: Critério de ativação
O sistema SHALL ligar a colaboração somente quando receber sala, endereço do servidor e token, e o usuário não for anônimo (sem identificador, ou com nome "Anônimo").

#### Scenario: Parâmetros incompletos
- **WHEN** falta a sala, o endereço ou o token
- **THEN** a colaboração permanece desligada

#### Scenario: Usuário anônimo
- **WHEN** o usuário não tem identificador ou se chama "Anônimo"
- **THEN** a colaboração permanece desligada, mesmo com todos os parâmetros presentes

### Requirement: O cliente não autoriza
O sistema SHALL apenas repassar o token ao servidor no estabelecimento da conexão e MUST NOT decidir, no cliente, quem pode entrar na sala; a decisão de acesso é do servidor.

#### Scenario: Token enviado na conexão
- **WHEN** a colaboração liga com um token
- **THEN** o token é enviado ao servidor como parâmetro da conexão, sem validação local

### Requirement: Estados da colaboração
O sistema SHALL distinguir três estados: desligado (sem documento compartilhado), local (documento compartilhado vivo, sem rede) e conectado (sincronizando com o servidor).

#### Scenario: Início em modo local
- **WHEN** a colaboração liga e a conexão ainda não foi estabelecida
- **THEN** o estado é "local", com o documento compartilhado já semeado

#### Scenario: Conexão estabelecida
- **WHEN** o servidor confirma a conexão
- **THEN** o estado passa a "conectado"

### Requirement: A conexão nunca bloqueia a edição
O sistema SHALL carregar e permitir editar e salvar o documento independentemente da conexão ao servidor, aplicando um tempo máximo de espera à tentativa de conexão.

#### Scenario: Servidor indisponível na abertura
- **WHEN** o servidor não responde dentro do tempo máximo
- **THEN** o documento permanece editável e salvável, no estado "local"

#### Scenario: Falha ao ligar a colaboração
- **WHEN** ocorre um erro ao ligar a colaboração
- **THEN** o editor segue funcionando como single-user e o erro não interrompe o carregamento nem o salvar

### Requirement: Degradação mantém o documento local vivo
O sistema SHALL, quando o transporte cair, desconectar apenas a conexão de rede e manter o documento compartilhado e todos os sincronizadores ativos, sem descartar nem recriar o documento.

#### Scenario: Queda da conexão
- **WHEN** a conexão com o servidor é perdida depois de conectada
- **THEN** o estado volta a "local" e as edições seguintes continuam sendo registradas no documento local

### Requirement: Reconexão mescla edições offline
O sistema SHALL, ao reconectar, mesclar automaticamente as edições feitas por ambos os lados durante a queda, sem lógica específica de reprodução.

#### Scenario: Edições nos dois lados durante a queda
- **WHEN** dois clientes editam sem conexão e depois reconectam
- **THEN** os dois convergem para o mesmo estado, preservando as edições de ambos

### Requirement: Persistência local por sala
O sistema SHALL persistir localmente o documento compartilhado, por sala, para sobreviver a recarga da página durante uma queda.

#### Scenario: Persistência criada com a sala
- **WHEN** a colaboração liga para uma sala
- **THEN** o documento compartilhado é vinculado a uma persistência local identificada pela sala

### Requirement: Encerramento libera os recursos
O sistema SHALL, ao encerrar o editor, liberar a conexão, os sincronizadores, a persistência local e o documento compartilhado, voltando ao estado "desligado".

#### Scenario: Fechar o editor
- **WHEN** o editor é encerrado com a colaboração ativa
- **THEN** o estado passa a "desligado" e nenhum observador permanece ligado
