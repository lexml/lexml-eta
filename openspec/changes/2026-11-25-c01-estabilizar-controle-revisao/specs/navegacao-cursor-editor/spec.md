# Spec Delta

## MODIFIED Requirements

### Requirement: Cursor depois de excluir um dispositivo
Depois de excluir um dispositivo pelo comando de exclusão ou pela tecla Delete numa linha vazia, quando a linha dele sai da tela, o cursor SHALL ir para o início do texto da primeira linha editável abaixo do excluído e dos seus descendentes, que passa a ser a linha atual. Sem linha editável abaixo, o cursor SHALL ir para o início do texto do dispositivo acima; quando essa linha não é editável, como o preâmbulo, SHALL ir para a primeira linha editável abaixo dela. Backspace numa linha vazia SHALL levar o cursor ao fim da linha de cima.

#### Scenario: Excluir um artigo do meio
- **WHEN** o documento tem os Arts. 10 a 12 e o usuário exclui o Art. 11
- **THEN** o cursor vai para o início do texto do novo Art. 11 (antigo Art. 12), que fica marcado como linha atual

#### Scenario: Excluir um artigo que não é o primeiro
- **WHEN** o documento tem os Arts. 1º a 4º e o usuário exclui o Art. 4º, o último
- **THEN** o cursor vai para o Art. 3º, que fica marcado como linha atual, porque não há linha editável abaixo

#### Scenario: Excluir o primeiro artigo depois do preâmbulo
- **WHEN** o documento tem preâmbulo e os Arts. 1º a 3º, e o usuário exclui o Art. 1º
- **THEN** o cursor vai para o início do texto do novo Art. 1º (antigo Art. 2º), que fica marcado como linha atual, e não para o preâmbulo

#### Scenario: Excluir um artigo com parágrafos
- **WHEN** o Art. 2º tem parágrafos, é seguido pelo Art. 3º, e o usuário exclui o Art. 2º
- **THEN** o cursor vai para o início do texto do novo Art. 2º (antigo Art. 3º)

#### Scenario: Delete numa linha vazia
- **WHEN** o cursor está num dispositivo sem texto, seguido de outro dispositivo, e o usuário tecla Delete
- **THEN** o dispositivo é excluído e o cursor vai para o início do texto do dispositivo seguinte

#### Scenario: Backspace numa linha vazia
- **WHEN** o cursor está num dispositivo sem texto e o usuário tecla Backspace
- **THEN** o dispositivo é excluído e o cursor vai para o fim do texto do dispositivo acima

#### Scenario: Excluir em modo de revisão
- **WHEN** a revisão está ativa, o documento tem os Arts. 1º a 3º e o usuário exclui o Art. 2º
- **THEN** a linha do Art. 2º continua na tela marcada como excluída e o cursor fica nela, conforme "Cursor depois de excluir em modo de revisão", e não vai para o Art. 3º

#### Scenario: Excluir em revisão um dispositivo adicionado na própria revisão
- **WHEN** a revisão está ativa, o usuário adiciona um artigo depois do Art. 2º e o exclui em seguida
- **THEN** a linha do artigo adicionado sai da tela e o cursor vai para o início do texto do Art. 3º

## ADDED Requirements

### Requirement: Cursor depois de excluir em modo de revisão
Em modo de revisão, depois de excluir um dispositivo pelo comando de exclusão ou pela tecla Delete numa linha vazia, quando a linha dele continua na tela marcada como excluída, o cursor SHALL ficar no início do texto dessa linha, que passa a ser a única marcada como linha atual. O menu da linha SHALL ser o do dispositivo excluído.

#### Scenario: Excluir um artigo em modo de revisão
- **WHEN** a revisão está ativa, o documento tem os Arts. 1º a 3º e o usuário exclui o Art. 2º
- **THEN** a linha do Art. 2º continua na tela marcada como excluída, o cursor fica no início do texto dela e ela é a única linha atual

#### Scenario: Excluir em revisão um parágrafo único
- **WHEN** a revisão está ativa e o usuário exclui o parágrafo único do Art. 1º da MPV 905
- **THEN** a linha do parágrafo continua na tela marcada como excluída, é a linha atual, e o dispositivo seguinte não fica marcado como linha atual

#### Scenario: Excluir em revisão um artigo com parágrafos
- **WHEN** a revisão está ativa, o Art. 2º tem parágrafos e o usuário exclui o Art. 2º
- **THEN** as linhas do Art. 2º e dos parágrafos continuam na tela marcadas como excluídas, e o cursor fica na linha do Art. 2º

#### Scenario: Menu da linha excluída
- **WHEN** a revisão está ativa, o usuário exclui o Art. 2º e abre o menu da linha atual
- **THEN** o menu oferece aceitar e recusar a revisão da exclusão do Art. 2º

#### Scenario: Excluir pela tecla Delete em revisão
- **WHEN** a revisão está ativa, o cursor está num artigo sem texto que já existia no documento e o usuário tecla Delete
- **THEN** a linha do artigo continua na tela marcada como excluída e o cursor fica nela

#### Scenario: Excluir um agrupador em revisão
- **WHEN** a revisão está ativa e o usuário exclui um capítulo que já existia no documento
- **THEN** a linha do capítulo continua na tela marcada como excluída e o cursor fica nela, e não no primeiro dispositivo do capítulo
