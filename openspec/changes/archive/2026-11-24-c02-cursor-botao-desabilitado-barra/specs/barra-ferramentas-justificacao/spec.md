## ADDED Requirements

### Requirement: Botão desabilitado não mostra o cursor de clique
Na barra de ferramentas do editor da justificação, um botão desabilitado SHALL mostrar a seta comum ao passar o mouse, e não o cursor de mão. Um botão habilitado SHALL continuar mostrando o cursor de mão. Os botões "Aceitar revisões" e "Rejeitar revisões" desabilitados SHALL manter o cursor de proibido do componente.

#### Scenario: Adicionar comentário sem texto selecionado
- **WHEN** não há texto selecionado e o usuário passa o mouse sobre o botão "Adicionar comentário", desabilitado
- **THEN** o cursor é a seta comum

#### Scenario: Qualquer botão desabilitado
- **WHEN** um botão da barra, como negrito ou nota de rodapé, fica desabilitado
- **THEN** o cursor sobre ele é a seta comum

#### Scenario: Aceitar e rejeitar revisões sem revisão
- **WHEN** não há revisão na justificação e o usuário passa o mouse sobre "Aceitar revisões" ou "Rejeitar revisões"
- **THEN** o cursor é o de proibido, como hoje
