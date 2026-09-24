## MODIFIED Requirements

### Requirement: Atualização automática do texto do link em renumeração
Quando um dispositivo referenciado é renumerado por qualquer ação estrutural (adicionar, remover, agrupar, transformar tipo, TAB/SHIFT_TAB, undo/redo), o sistema SHALL recalcular o texto de cada remissão que aponta para ele, resolvendo o alvo pela sua identidade estável — nunca pelo identificador textual antigo.

#### Scenario: Referência qualificada sempre reflete a cadeia completa
- **WHEN** o texto da remissão contém uma cadeia explícita de qualificadores (ex.: "inciso II do art. 2º") e qualquer nível dessa cadeia muda de número, inclusive por renumeração de um dispositivo não relacionado
- **THEN** o texto do link é recalculado por inteiro para refletir a nova cadeia

#### Scenario: Referência "enxuta" só muda se a posição local mudar
- **WHEN** o texto da remissão não tem qualificador explícito (ex.: "inciso I" sozinho, ou "parágrafo único", referindo-se a um irmão do mesmo pai)
- **THEN** o texto só é atualizado se a posição ordinal do alvo dentro do seu pai imediato mudar, ou se a quantidade de irmãos do mesmo tipo mudar de/para um único elemento — nunca ganha uma cadeia de qualificadores que não tinha originalmente, e nunca alterna entre a forma "único" e a forma numerada sem uma mudança real na contagem de irmãos do mesmo tipo

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
