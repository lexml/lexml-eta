# Spec Delta

## Purpose

Define a identidade global estável dos dispositivos e a conversão determinística entre a articulação local e o documento compartilhado da colaboração, para que clientes independentes partam de uma base idêntica e se refiram aos mesmos dispositivos.

## ADDED Requirements

### Requirement: Identidade global por dispositivo
O sistema SHALL atribuir a cada dispositivo um identificador global (`gid`) que não depende do contador local de `uuid` e não muda quando o dispositivo é renumerado ou movido.

#### Scenario: Dispositivo criado ao vivo recebe identificador único
- **WHEN** dois clientes criam dispositivos ao mesmo tempo
- **THEN** os identificadores globais gerados são distintos entre si, mesmo que os `uuid` locais coincidam

#### Scenario: Identificador é gerado fora de contexto seguro
- **WHEN** o editor roda em um contexto sem suporte a geração criptográfica de UUID (por exemplo, HTTP não seguro)
- **THEN** o identificador global ainda é gerado, sem erro, com a colaboração ligada ou desligada

#### Scenario: Mover preserva o identificador
- **WHEN** um dispositivo é movido entre irmãos
- **THEN** ele mantém o mesmo identificador global, embora receba um novo `uuid` local

### Requirement: Tradução entre identidade global e uuid local
O sistema SHALL manter, no cliente, uma tabela bidirecional entre o identificador global e o `uuid` local do dispositivo, de modo que a camada de colaboração fale em `gid` enquanto o editor continua usando `uuid`.

#### Scenario: Consulta nos dois sentidos
- **WHEN** um dispositivo é registrado com seu `gid` e seu `uuid`
- **THEN** é possível obter o `uuid` a partir do `gid` e o `gid` a partir do `uuid`

### Requirement: Semente determinística do documento compartilhado
O sistema SHALL gerar o estado inicial do documento compartilhado como função pura da articulação: dois clientes que semeiam, de forma independente, o mesmo documento-base MUST obter estados byte-idênticos.

#### Scenario: Duas sementes independentes são idênticas
- **WHEN** dois clientes semeiam, cada um por conta própria, o mesmo documento
- **THEN** a codificação binária do estado compartilhado dos dois clientes é idêntica

#### Scenario: Identificadores da semente seguem a ordem canônica
- **WHEN** o documento é semeado
- **THEN** cada dispositivo recebe um `gid` determinístico derivado de sua posição na ordem canônica, e a articulação local passa a carregar esses mesmos `gid`

### Requirement: Ordem canônica dos dispositivos
O sistema SHALL percorrer a articulação em uma ordem canônica única que inclui o caput dos artigos e desce nos blocos de alteração, a mesma usada na serialização do documento.

#### Scenario: Caput e blocos de alteração entram na ordem
- **WHEN** a articulação contém artigos com caput e um bloco de alteração aninhado
- **THEN** o caput de cada artigo e os dispositivos do bloco de alteração aparecem na ordem canônica, logo após seu pai

### Requirement: Edições ao vivo usam identidade própria
O sistema SHALL fazer com que cada cliente adote, depois de semear, uma identidade de edição própria e distinta da usada pela semente.

#### Scenario: Edições de dois clientes não colidem
- **WHEN** dois clientes, semeados do mesmo documento, editam e depois sincronizam
- **THEN** nenhuma edição é perdida no merge e o estado final é o mesmo nos dois clientes

### Requirement: Reconstrução da articulação a partir do documento compartilhado
O sistema SHALL reconstruir a articulação (tipo, hierarquia, texto, nota de alteração, cabeça de alteração e ementa) a partir do documento compartilhado, e o resultado de semear de novo uma articulação reconstruída MUST ser idêntico ao original.

#### Scenario: Ida e volta preserva a estrutura
- **WHEN** uma articulação com incisos, alíneas, parágrafo com nota de alteração e agrupador é semeada e reconstruída
- **THEN** a articulação reconstruída tem os mesmos tipos, a mesma hierarquia e os mesmos textos

#### Scenario: Ida e volta é idempotente
- **WHEN** a articulação reconstruída é semeada novamente
- **THEN** a codificação binária do novo documento é igual à do documento anterior

### Requirement: Texto do artigo viaja no caput
O sistema SHALL representar o texto de um artigo apenas no seu caput, sem duplicá-lo no próprio artigo.

#### Scenario: Artigo não duplica texto
- **WHEN** o documento é semeado com um artigo que tem texto no caput
- **THEN** o conteúdo textual do artigo no documento compartilhado é vazio e o texto está no caput
