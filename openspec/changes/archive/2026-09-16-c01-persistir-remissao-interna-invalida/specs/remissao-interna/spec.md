## MODIFIED Requirements

### Requirement: Persistência das remissões ao salvar e abrir o documento
O sistema SHALL serializar as remissões internas no LexML salvo — incluindo remissões inválidas, preservando o último destino conhecido — e reconstruí-las integralmente ao reabrir o documento.

#### Scenario: Salvar preenche remissões de dispositivos não editados na sessão
- **WHEN** o usuário salva um documento que contém dispositivos com remissões que não foram editados durante a sessão atual
- **THEN** o sistema completa o registro de remissões para esses dispositivos antes de serializar, garantindo que nenhuma remissão existente seja perdida

#### Scenario: Abrir documento reconstrói o registro a partir do texto
- **WHEN** um documento salvo é reaberto
- **THEN** o sistema reconstrói o registro de remissões varrendo o texto de cada dispositivo, sem depender de estado em memória de uma sessão anterior

#### Scenario: Texto fixo de remissões manuais sobrevive ao ciclo salvar/abrir
- **WHEN** uma remissão manual com texto fixo é salva e o documento é reaberto
- **THEN** o texto escolhido pelo usuário é restaurado e continua marcado como fixo, não sendo sobrescrito por atualização automática

#### Scenario: Remissão inválida preserva o destino conhecido através do ciclo salvar/abrir
- **WHEN** uma remissão marcada como inválida (dispositivo de destino excluído) é salva e o documento é reaberto
- **THEN** o estado reconstruído aponta para o mesmo destino conhecido de antes da exclusão, com a mesma mensagem de erro e o mesmo alerta associados

#### Scenario: Reabertura não perde a marcação de inválida por reaproveitamento de id
- **WHEN** um documento com remissão inválida é reaberto depois que o identificador do destino original foi reaproveitado por um dispositivo diferente, na reestruturação que gerou a invalidade
- **THEN** a remissão permanece marcada como inválida, sem ser tratada como apontando corretamente para o novo dispositivo que agora tem esse identificador
