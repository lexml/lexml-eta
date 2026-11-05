## ADDED Requirements

### Requirement: Alerta e pendência de comentários

Enquanto houver ao menos uma sequência de comentários no documento, a aba Avisos SHALL exibir o alerta informativo "Este documento contém comentários e não deve ser protocolado até que sejam removidos.", que o usuário pode fechar, e a proposição montada para salvar SHALL conter a pendência "Remover comentários.". Sem sequências, o alerta SHALL ser retirado e a pendência MUST NOT constar. O alerta SHALL aparecer uma única vez, por mais que a condição seja reavaliada, e SHALL ser reavaliado a cada criação ou exclusão de sequência.

#### Scenario: Primeiro comentário

- **WHEN** o documento não tem comentários e o usuário cria uma sequência
- **THEN** a aba Avisos exibe o alerta de comentários
- **AND** a proposição montada para salvar contém a pendência "Remover comentários."

#### Scenario: Última sequência excluída

- **WHEN** o documento tem uma única sequência e o usuário a exclui
- **THEN** a aba Avisos deixa de exibir o alerta de comentários
- **AND** a proposição montada para salvar não contém a pendência "Remover comentários."

#### Scenario: Trecho comentado apagado

- **WHEN** o documento tem uma única sequência e o usuário apaga todo o trecho comentado
- **THEN** a aba Avisos deixa de exibir o alerta de comentários

#### Scenario: Sem duplicação do alerta

- **WHEN** o usuário cria duas sequências
- **THEN** a aba Avisos exibe um único alerta de comentários
