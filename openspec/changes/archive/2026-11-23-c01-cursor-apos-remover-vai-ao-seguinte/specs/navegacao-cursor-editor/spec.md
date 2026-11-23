## MODIFIED Requirements

### Requirement: Cursor depois de excluir um dispositivo
Depois de excluir um dispositivo pelo comando de exclusão ou pela tecla Delete numa linha vazia, o cursor SHALL ir para o início do texto da primeira linha editável abaixo do excluído e dos seus descendentes, que passa a ser a linha atual. Sem linha editável abaixo, o cursor SHALL ir para o início do texto do dispositivo acima; quando essa linha não é editável, como o preâmbulo, SHALL ir para a primeira linha editável abaixo dela. Backspace numa linha vazia SHALL levar o cursor ao fim da linha de cima.

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
- **THEN** a linha do Art. 2º continua na tela marcada como excluída e o cursor vai para o início do texto do Art. 3º
