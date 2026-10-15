# Spec Delta

## MODIFIED Requirements

### Requirement: Reconstrução das operações de cada revisão
Ao abrir um documento, o sistema SHALL reconstruir, a partir do atributo `revisao` e do conteúdo filho de cada `RevisaoArticulacao`, as operações registradas (`adicionado`, `excluido`, `alterado`, `movido`, `transformado`, `alteracaoRotulo`), inclusive combinadas, de modo que as marcas exibidas descrevam todas as operações, com a mesma descrição da sessão de edição em que a revisão foi criada, e o conteúdo, a posição, o tipo e o rótulo anteriores possam ser restaurados. Operações desconhecidas SHALL ser ignoradas, sem impedir a leitura das demais.

#### Scenario: Revisão combinada
- **WHEN** o usuário abre um documento com uma revisão `movido;3,alterado` e o texto original como filho
- **THEN** o dispositivo é exibido com a marca da revisão, e rejeitá-la devolve o dispositivo à posição 3 com o texto original

#### Scenario: Descrição da marca da revisão combinada
- **WHEN** o usuário abre um documento com uma revisão `movido;3,alterado` em um artigo do texto da proposição
- **THEN** a marca descreve "Dispositivo movido (antes era "Artigo Art. 3º") e texto alterado", e não "Dispositivo adicionado"

#### Scenario: Operação desconhecida
- **WHEN** o usuário abre um documento com uma revisão cuja operação não é reconhecida, como `operacaoFutura;x`
- **THEN** o documento abre normalmente, sem erro, e as demais revisões são reconstruídas
