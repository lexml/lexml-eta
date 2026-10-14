# Spec Delta

## MODIFIED Requirements

### Requirement: Revisão da alteração de título
Com o modo de revisão ativo, adicionar, alterar ou remover o título SHALL gerar uma revisão de modificação do dispositivo, com descrição própria para o título. Aceitar a revisão SHALL manter o novo título e rejeitá-la SHALL restaurar o título anterior. Se o título voltar ao valor original, a revisão SHALL ser descartada. A revisão SHALL ser preservada ao salvar e reabrir o documento, e rejeitá-la depois de reaberto SHALL restaurar o título anterior, inclusive a ausência de título.

#### Scenario: Gerar revisão
- **WHEN** o modo de revisão está ativo e o usuário altera o título de um dispositivo
- **THEN** o dispositivo passa a ter uma revisão cuja descrição indica que o título foi alterado

#### Scenario: Rejeitar revisão
- **WHEN** o usuário rejeita a revisão da alteração de título
- **THEN** o título anterior é restaurado, inclusive a ausência de título quando ele havia sido adicionado

#### Scenario: Aceitar revisão
- **WHEN** o usuário aceita a revisão da alteração de título
- **THEN** o novo título é mantido e a revisão deixa de existir

#### Scenario: Voltar ao valor original
- **WHEN** o usuário altera o título e depois o restaura ao valor original durante a revisão
- **THEN** a revisão de modificação é descartada

#### Scenario: Salvar, reabrir e rejeitar a adição de título
- **WHEN** o usuário, em modo de revisão, adiciona um título, salva, reabre o documento e rejeita a revisão
- **THEN** o dispositivo volta a não ter título

#### Scenario: Salvar, reabrir e rejeitar a alteração de título
- **WHEN** o usuário, em modo de revisão, altera o título de "Do objeto" para "Da finalidade", salva, reabre o documento e rejeita a revisão
- **THEN** o título volta a ser "Do objeto"

#### Scenario: Salvar, reabrir e rejeitar a remoção de título
- **WHEN** o usuário, em modo de revisão, remove o título "Do objeto", salva, reabre o documento e rejeita a revisão
- **THEN** o título "Do objeto" é exibido novamente

#### Scenario: Descrição depois de reaberto
- **WHEN** o usuário reabre um documento com uma revisão da alteração de título
- **THEN** a marca da revisão tem a mesma descrição que tinha na sessão de edição em que foi criada
