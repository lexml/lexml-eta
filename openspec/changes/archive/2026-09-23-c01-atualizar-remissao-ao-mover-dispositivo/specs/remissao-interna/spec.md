## MODIFIED Requirements

### Requirement: Atualização automática do texto do link em renumeração
Quando um dispositivo referenciado é renumerado por qualquer ação estrutural (adicionar, remover, agrupar, transformar tipo, TAB/SHIFT_TAB, mover para cima/baixo, rejeitar revisão de movimentação, undo/redo), o sistema SHALL recalcular o texto de cada remissão que aponta para ele, resolvendo o alvo pela sua identidade estável — nunca pelo identificador textual antigo.

#### Scenario: Referência qualificada sempre reflete a cadeia completa
- **WHEN** o texto da remissão contém uma cadeia explícita de qualificadores (ex.: "inciso II do art. 2º") e qualquer nível dessa cadeia muda de número, inclusive por renumeração de um dispositivo não relacionado
- **THEN** o texto do link é recalculado por inteiro para refletir a nova cadeia

#### Scenario: Referência "enxuta" só muda se a posição local mudar
- **WHEN** o texto da remissão não tem qualificador explícito (ex.: "inciso I" sozinho, referindo-se a um irmão do mesmo pai)
- **THEN** o texto só é atualizado se a posição do alvo dentro do seu pai imediato mudar — nunca ganha uma cadeia de qualificadores que não tinha originalmente

#### Scenario: Referência contextual só muda se a posição relativa ao ancestral compartilhado mudar
- **WHEN** o texto da remissão usa um sufixo contextual (ex.: "deste artigo", "desta Seção")
- **THEN** o sufixo literal nunca muda; só o segmento antes dele é recalculado, e só se a posição do alvo relativa a esse ancestral compartilhado mudar

#### Scenario: Texto editado manualmente pelo usuário é preservado
- **WHEN** o texto atual do link diverge do que o sistema gravou por último e não corresponde à forma canônica esperada do alvo antes da renumeração
- **THEN** o sistema preserva o texto como está e marca a entrada para revisão do usuário, em vez de sobrescrevê-la

#### Scenario: Texto livre nunca é regenerado
- **WHEN** o texto do link não corresponde a nenhuma forma reconhecível de referência legal (ex.: "o dispositivo mencionado acima")
- **THEN** o sistema nunca tenta recalculá-lo, independentemente de qualquer renumeração

#### Scenario: Origem manual ou automática não influencia a atualização
- **WHEN** uma remissão foi criada manualmente via diálogo, e seu texto atual corresponde a uma forma de referência reconhecível e ainda bate com a forma canônica esperada do alvo
- **THEN** ela é atualizada na renumeração pelas mesmas regras (qualificada/enxuta/contextual) aplicadas a uma remissão detectada automaticamente — não existe tratamento diferenciado por origem

#### Scenario: Mover o dispositivo referenciado
- **WHEN** o usuário move para cima ou para baixo um dispositivo que é alvo de uma remissão (ex.: o art. 3º referenciado como "art. 3º" é movido para cima e passa a ser o art. 2º)
- **THEN** o texto e o destino do link são atualizados para o novo número ("art. 2º"), pelas mesmas regras dos demais cenários deste requisito

#### Scenario: Mover um dispositivo desloca o irmão referenciado
- **WHEN** o usuário move um dispositivo e, com isso, um irmão que é alvo de uma remissão muda de número
- **THEN** o texto e o destino do link para esse irmão são atualizados para o novo número

#### Scenario: Mover um dispositivo com descendentes referenciados
- **WHEN** o usuário move um dispositivo cujo caput, inciso, parágrafo ou outro descendente é alvo de uma remissão
- **THEN** o link continua apontando para o mesmo descendente, com o texto atualizado conforme a nova cadeia de numeração

#### Scenario: Artigo movido para outro agrupador
- **WHEN** o usuário move um artigo referenciado de forma que ele passe para outro agrupador (ex.: de um Capítulo para o seguinte)
- **THEN** o link continua apontando para o mesmo artigo e o texto é recalculado pelas regras qualificada/enxuta/contextual considerando a nova posição

#### Scenario: Desfazer e refazer o movimento
- **WHEN** o usuário desfaz (undo) um movimento que atualizou remissões, e depois o refaz (redo)
- **THEN** a cada passo o texto e o destino dos links refletem a posição corrente do dispositivo referenciado

## ADDED Requirements

### Requirement: Preservação do vínculo de remissões ao mover dispositivos
Mover um dispositivo para cima ou para baixo SHALL preservar o vínculo de toda remissão interna relacionada à subárvore movida: tanto as que têm como destino o dispositivo movido ou seus descendentes quanto as contidas no texto desses dispositivos. Nenhuma remissão válida pode deixar de ser atualizada, deixar de ser exibida como link ou ser marcada como inválida apenas por causa de um movimento.

#### Scenario: Remissão contida no dispositivo movido
- **WHEN** o usuário move um dispositivo cujo texto contém uma remissão interna para outro dispositivo
- **THEN** após o movimento o link continua presente, com popup de ações funcional, e continua sendo atualizado em renumerações posteriores do seu destino

#### Scenario: Remissão contida no dispositivo movido após salvar
- **WHEN** o usuário move um dispositivo cujo texto contém uma remissão interna e em seguida salva o documento
- **THEN** a remissão é persistida uma única vez, apontando para o destino correto

### Requirement: Rejeição de revisão de movimentação não invalida remissões
Em modo de revisão, rejeitar uma revisão de movimentação de dispositivo SHALL restaurar as remissões relacionadas à posição restaurada, sem marcá-las como inválidas, já que o dispositivo de destino continua existindo.

#### Scenario: Rejeitar a movimentação do dispositivo referenciado
- **WHEN** com revisão ativa o usuário move um dispositivo referenciado por uma remissão e depois rejeita essa revisão de movimentação
- **THEN** o texto e o destino do link voltam a refletir a posição original do dispositivo, o link não recebe marcação de inválido e nenhuma mensagem de remissão inválida é exibida no dispositivo de origem

#### Scenario: Mover em modo revisão
- **WHEN** com revisão ativa o usuário move um dispositivo referenciado por uma remissão
- **THEN** o texto e o destino do link são atualizados como fora do modo revisão, sem gerar uma revisão própria para essa atualização
