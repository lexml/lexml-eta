## ADDED Requirements

### Requirement: Reconstrução de remissões internas inválidas ao abrir
Ao abrir um documento, para cada identificador listado no grupo de remissões internas inválidas dos metadados do LexEdit, o sistema SHALL reconstruir no dispositivo de origem correspondente o mesmo estado inválido existente no momento em que a remissão foi salva — incluindo mensagem de erro associada ao dispositivo e alerta global —, tratando esse identificador como autoritativo mesmo que o destino textual do link volte a resolver para algum dispositivo existente no documento aberto.

#### Scenario: Abertura reconstrói mensagem e alerta de remissão inválida
- **WHEN** um documento salvo com uma remissão interna inválida é reaberto
- **THEN** o dispositivo de origem exibe a mesma mensagem de erro associada à remissão inválida, e o alerta global correspondente é exibido

#### Scenario: Identificador listado prevalece sobre destino textual reaproveitado
- **WHEN** um documento é reaberto e o identificador de uma remissão consta na lista de remissões internas inválidas, mas o texto do link aponta para um identificador de dispositivo que passou a existir novamente no documento (reaproveitado por um dispositivo diferente do original)
- **THEN** a remissão permanece reconstruída como inválida, sem ser tratada como um link válido para esse dispositivo diferente

#### Scenario: Documento sem metadados do LexEdit continua detectando remissões inválidas
- **WHEN** um documento sem o ponto de extensão de metadados do LexEdit é aberto e contém um link de remissão interna cujo destino não existe na articulação
- **THEN** o sistema ainda reconstrói o estado inválido correspondente, sem depender da lista de remissões internas inválidas
