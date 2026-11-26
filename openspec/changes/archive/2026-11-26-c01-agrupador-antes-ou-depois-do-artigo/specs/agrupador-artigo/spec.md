## Purpose

Inclusão de agrupador de artigo (Parte, Livro, Título, Capítulo, Seção e Subseção) a partir de artigo, agrupador ou ementa, com a escolha do tipo e da posição, e a restauração do agrupador incluído ou removido pelo desfazer e pelo refazer.

## ADDED Requirements

### Requirement: Opção única de menu para adicionar agrupador

O editor SHALL oferecer, no menu de contexto de artigo, de agrupador e da ementa, uma só opção para adicionar agrupador, com o nome "Adicionar Título, Capítulo, Seção e outros", sem indicar a posição. O tipo e a posição SHALL ser escolhidos no modal que essa opção abre.

#### Scenario: Menu do artigo
- **WHEN** o usuário abre o menu de contexto de um artigo
- **THEN** o menu oferece "Adicionar Título, Capítulo, Seção e outros" e não oferece "Adicionar Título, Capítulo, Seção e outros antes"

#### Scenario: Menu do agrupador
- **WHEN** o usuário abre o menu de contexto de um capítulo
- **THEN** o menu oferece "Adicionar Título, Capítulo, Seção e outros", com o mesmo nome do menu do artigo

### Requirement: Posicionamento no modal de agrupador

O modal de adicionar agrupador SHALL exibir o "Posicionamento", com as opções Antes e Depois, quando aberto a partir de artigo ou de agrupador. Quando as duas posições forem permitidas para o tipo marcado, SHALL vir marcada "Antes" no artigo e "Depois" no agrupador. Uma posição SHALL ficar desabilitada quando o tipo marcado não puder ser inserido nela.

#### Scenario: Modal aberto a partir de artigo
- **WHEN** o usuário escolhe "Adicionar Título, Capítulo, Seção e outros" no menu de um artigo
- **THEN** o modal exibe o "Posicionamento" com Antes e Depois habilitados e "Antes" marcado

#### Scenario: Modal aberto a partir de agrupador
- **WHEN** o usuário escolhe "Adicionar Título, Capítulo, Seção e outros" no menu de um capítulo, e o tipo marcado pode ser inserido antes e depois dele
- **THEN** o modal exibe o "Posicionamento" com "Depois" marcado

#### Scenario: Confirmar sem mudar a posição a partir de artigo
- **WHEN** o usuário abre o modal a partir de um artigo e confirma sem mudar a posição
- **THEN** o agrupador é criado antes do artigo, como antes desta mudança

### Requirement: Agrupador depois de artigo

Ao confirmar "Depois" a partir de um artigo, o editor SHALL criar o agrupador logo depois do artigo e de todos os seus dispositivos, e SHALL levar para o novo agrupador os artigos que seguem o artigo dentro do mesmo agrupador. Quando nenhum artigo o seguir nesse agrupador, o novo agrupador SHALL nascer vazio. O artigo e os anteriores a ele SHALL permanecer onde estavam.

#### Scenario: Capítulo depois de artigo do meio
- **WHEN** o Capítulo I contém os arts. 1º, 2º e 3º e o usuário adiciona um capítulo depois do art. 2º
- **THEN** o Capítulo I fica com os arts. 1º e 2º, e o novo Capítulo II, logo depois do art. 2º, fica com o art. 3º

#### Scenario: Capítulo depois do último artigo
- **WHEN** o Capítulo I contém os arts. 1º e 2º, nada vem depois dele, e o usuário adiciona um capítulo depois do art. 2º
- **THEN** o novo Capítulo II é criado vazio, no fim do documento, e o Capítulo I mantém os dois artigos

#### Scenario: Seção depois do último artigo de um capítulo
- **WHEN** o Capítulo I contém os arts. 1º e 2º, o Capítulo II vem depois dele, e o usuário adiciona uma seção depois do art. 2º
- **THEN** a nova seção é criada vazia, no fim do Capítulo I, antes do Capítulo II

#### Scenario: Artigo com parágrafos
- **WHEN** o usuário adiciona um capítulo depois de um artigo que tem parágrafos
- **THEN** o capítulo aparece depois do último parágrafo do artigo, e os parágrafos continuam no artigo

#### Scenario: Documento sem agrupadores
- **WHEN** o documento tem os arts. 1º, 2º e 3º sem agrupadores e o usuário adiciona um capítulo depois do art. 1º
- **THEN** o art. 1º continua fora de agrupador e o novo capítulo fica com os arts. 2º e 3º

### Requirement: Grupo de aspas do agrupador criado a partir de artigo de alteração

No bloco de alteração, o agrupador criado a partir de artigo SHALL seguir, nas duas posições, a mesma regra do "Manter no mesmo grupo de aspas": a partir de artigo que abre aspas, o agrupador SHALL ficar em grupo de aspas próprio; a partir de artigo interno a agrupador do bloco, SHALL ficar no mesmo grupo de aspas. A opção SHALL continuar sem edição pelo usuário no artigo.

#### Scenario: Depois de artigo que abre aspas
- **WHEN** o usuário adiciona um capítulo depois de um artigo de alteração que abre aspas
- **THEN** o capítulo é criado depois do artigo, em grupo de aspas próprio

#### Scenario: Depois de artigo dentro de agrupador do bloco
- **WHEN** o usuário adiciona uma seção depois de um artigo de alteração que está dentro de um capítulo do bloco
- **THEN** a seção é criada depois do artigo, no mesmo grupo de aspas do capítulo

### Requirement: Desfazer e refazer de agrupador sem dispositivo depois dele

O desfazer e o refazer SHALL restaurar o agrupador incluído ou removido na mesma posição, com os mesmos filhos, também quando nenhum dispositivo o seguir no seu pai ou no documento. Nesse caso, a restauração SHALL NOT mover para dentro do agrupador nenhum dispositivo que estava fora dele.

#### Scenario: Refazer a inclusão de capítulo vazio no fim do documento
- **WHEN** o usuário adiciona um capítulo depois do último artigo, desfaz e refaz
- **THEN** o capítulo vazio volta ao fim do documento, sem erro, e os artigos continuam no capítulo anterior

#### Scenario: Desfazer a remoção de capítulo vazio no fim do documento
- **WHEN** o Capítulo II, vazio, é o último dispositivo do documento, o usuário o remove e desfaz
- **THEN** o Capítulo II volta vazio ao fim do documento, e o último artigo continua no Capítulo I

#### Scenario: Desfazer a remoção de seção vazia no fim de um capítulo
- **WHEN** uma seção vazia é o último filho do Capítulo I, seguido do Capítulo II, e o usuário a remove e desfaz
- **THEN** a seção volta vazia ao fim do Capítulo I, e os artigos do Capítulo I continuam fora dela
