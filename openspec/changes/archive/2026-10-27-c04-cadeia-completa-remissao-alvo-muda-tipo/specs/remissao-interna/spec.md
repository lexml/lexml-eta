## MODIFIED Requirements

### Requirement: Atualização automática do texto do link em renumeração
Quando um dispositivo referenciado é renumerado por qualquer ação estrutural (adicionar, remover, agrupar, transformar tipo, TAB/SHIFT_TAB, mover para cima/baixo, rejeitar revisão de movimentação, undo/redo), o sistema SHALL recalcular o texto de cada remissão que aponta para ele, resolvendo o alvo pela sua identidade estável — nunca pelo identificador textual antigo.

#### Scenario: Referência qualificada sempre reflete a cadeia completa
- **WHEN** o texto da remissão contém uma cadeia explícita de qualificadores (ex.: "inciso II do art. 2º") e qualquer nível dessa cadeia muda de número, inclusive por renumeração de um dispositivo não relacionado
- **THEN** o texto do link é recalculado por inteiro para refletir a nova cadeia

#### Scenario: Referência "enxuta" só muda se a posição local mudar
- **WHEN** o texto da remissão não tem qualificador explícito (ex.: "inciso I" sozinho, ou "parágrafo único", referindo-se a um irmão do mesmo pai) e o tipo do dispositivo de destino não mudou
- **THEN** o texto só é atualizado se a posição ordinal do alvo dentro do seu pai imediato mudar, ou se a quantidade de irmãos do mesmo tipo mudar de/para um único elemento — nunca ganha uma cadeia de qualificadores que não tinha originalmente, e nunca alterna entre a forma "único" e a forma numerada sem uma mudança real na contagem de irmãos do mesmo tipo

#### Scenario: Destino que muda de tipo recebe a cadeia completa
- **WHEN** o texto da remissão não tem qualificador explícito nem sufixo contextual, e o dispositivo de destino muda de tipo (ex.: a remissão "art. 2º" e o art. 2º vira, por TAB, o parágrafo único do art. 1º)
- **THEN** o texto do link é recalculado por inteiro, com a cadeia completa até o artigo (ex.: "parágrafo único do art. 1º"), mesmo quando a origem está no mesmo artigo do destino

#### Scenario: Destino que volta ao tipo anterior
- **WHEN** a mudança de tipo do destino é desfeita (undo ou SHIFT_TAB) e ele volta a ser um artigo
- **THEN** o texto do link volta à forma do artigo (ex.: "art. 2º")

#### Scenario: "Parágrafo único" permanece único quando nenhum irmão é de fato adicionado
- **WHEN** um dispositivo é o único de seu tipo entre os filhos de seu pai (ex.: o único parágrafo de um artigo) e qualquer ação estrutural em outra parte do documento dispara a sincronização de remissões, sem que um segundo dispositivo do mesmo tipo seja de fato adicionado como irmão
- **THEN** o texto da remissão continua na forma "único" (ex.: "parágrafo único"), nunca sendo convertido para a forma numerada (ex.: "§ 1º")

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
