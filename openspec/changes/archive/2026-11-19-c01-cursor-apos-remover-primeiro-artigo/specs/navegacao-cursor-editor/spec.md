## ADDED Requirements

### Requirement: Cursor depois de excluir um dispositivo
Depois de excluir um dispositivo, o cursor SHALL ir para o início do texto do dispositivo acima do excluído, que passa a ser a linha atual. Quando a linha acima não é editável, como o preâmbulo ou a epígrafe, o cursor SHALL ir para o início do texto da primeira linha editável abaixo dela.

#### Scenario: Excluir um artigo que não é o primeiro
- **WHEN** o documento tem os Arts. 1º a 4º e o usuário exclui o Art. 4º
- **THEN** o cursor vai para o Art. 3º, que fica marcado como linha atual

#### Scenario: Excluir o primeiro artigo depois do preâmbulo
- **WHEN** o documento tem preâmbulo e os Arts. 1º a 3º, e o usuário exclui o Art. 1º
- **THEN** o cursor vai para o início do texto do novo Art. 1º (antigo Art. 2º), que fica marcado como linha atual, e não para o preâmbulo
