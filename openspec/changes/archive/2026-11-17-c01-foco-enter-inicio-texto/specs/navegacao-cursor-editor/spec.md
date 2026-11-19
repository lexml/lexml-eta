## ADDED Requirements

### Requirement: Cursor depois do Enter que cria dispositivo
Quando o Enter cria um dispositivo a partir de um artigo, parágrafo, inciso, alínea ou item, o editor SHALL deixar o cursor no dispositivo que ficou com o texto depois do ponto do cursor. Com o cursor no início do texto, o dispositivo vazio é criado antes do atual, e o cursor SHALL ficar no início do dispositivo atual, que manteve o texto e foi renumerado. Refazer essa inclusão SHALL deixar o cursor no mesmo dispositivo. As opções "Adicionar … antes" do menu SHALL continuar levando o cursor ao dispositivo novo.

#### Scenario: Enter no início do texto de um artigo
- **WHEN** o cursor está no início do texto do Art. 4º, que tem texto, e o usuário tecla Enter
- **THEN** um Art. 4º vazio é criado, o artigo com o texto passa a ser o Art. 5º, e o cursor fica no início do texto do Art. 5º, que é a linha atual

#### Scenario: Enter no início do texto de um parágrafo
- **WHEN** o cursor está no início do texto do § 1º, que tem texto, e o usuário tecla Enter
- **THEN** um § 1º vazio é criado, o parágrafo com o texto passa a ser o § 2º, e o cursor fica no início do texto do § 2º

#### Scenario: Enter no meio do texto
- **WHEN** o cursor está no meio do texto do Art. 3º e o usuário tecla Enter
- **THEN** o texto depois do cursor vai para o novo Art. 4º, e o cursor fica no início do Art. 4º, como antes

#### Scenario: Enter no fim do texto
- **WHEN** o cursor está no fim do texto do Art. 4º e o usuário tecla Enter
- **THEN** um Art. 5º vazio é criado e o cursor fica nele, como antes

#### Scenario: Refazer o Enter no início do texto
- **WHEN** o usuário tecla Enter no início do texto do Art. 4º, desfaz e refaz
- **THEN** depois de refazer, o cursor fica no artigo com o texto (Art. 5º)

#### Scenario: Adicionar artigo antes pelo menu
- **WHEN** o usuário escolhe "Adicionar artigo antes" no menu do Art. 4º
- **THEN** um Art. 4º vazio é criado e o cursor fica nele, como antes
