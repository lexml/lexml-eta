# Spec Delta

## MODIFIED Requirements

### Requirement: Reconstrução das operações de cada revisão
Ao abrir um documento, o sistema SHALL reconstruir, a partir do atributo `revisao` e do conteúdo filho de cada `RevisaoArticulacao`, as operações registradas (`adicionado`, `excluido`, `alterado`, `movido`, `transformado`, `alteracaoRotulo`), inclusive combinadas, de modo que as marcas exibidas descrevam todas as operações, com a mesma descrição da sessão de edição em que a revisão foi criada, e o conteúdo, o título, a posição, o tipo e o rótulo anteriores possam ser restaurados. Quando o filho de uma revisão `alterado` for um dispositivo, o sistema SHALL ler dele o texto anterior e o título anterior, e a ausência de `TituloDispositivo` nesse dispositivo SHALL significar que não havia título. Um parágrafo solto como filho SHALL ser aceito na leitura, com o título anterior igual ao atual. Operações desconhecidas SHALL ser ignoradas, sem impedir a leitura das demais.

#### Scenario: Revisão combinada
- **WHEN** o usuário abre um documento com uma revisão `movido;3,alterado` e o texto original como filho
- **THEN** o dispositivo é exibido com a marca da revisão, e rejeitá-la devolve o dispositivo à posição 3 com o texto original

#### Scenario: Descrição da marca da revisão combinada
- **WHEN** o usuário abre um documento com uma revisão `movido;3,alterado` em um artigo do texto da proposição
- **THEN** a marca descreve "Dispositivo movido (antes era "Artigo Art. 3º") e texto alterado", e não "Dispositivo adicionado"

#### Scenario: Operação desconhecida
- **WHEN** o usuário abre um documento com uma revisão cuja operação não é reconhecida, como `operacaoFutura;x`
- **THEN** o documento abre normalmente, sem erro, e as demais revisões são reconstruídas

#### Scenario: Texto alterado reaberto
- **WHEN** o usuário abre um documento com uma revisão `alterado` cujo filho é um dispositivo com o texto original, em um dispositivo que tem título igual ao do filho
- **THEN** a marca descreve que o texto foi alterado, e rejeitar a revisão restaura o texto e mantém o título

#### Scenario: Artigo alterado reaberto
- **WHEN** o usuário abre um documento com uma revisão `alterado` cujo filho é um artigo com o texto original no `Caput`
- **THEN** rejeitar a revisão restaura o texto original do artigo

#### Scenario: Título adicionado reaberto
- **WHEN** o usuário abre um documento com um dispositivo que tem título e uma revisão `alterado` cujo filho é um dispositivo sem `TituloDispositivo`
- **THEN** a marca descreve que o título foi alterado, e rejeitar a revisão remove o título do dispositivo

#### Scenario: Título alterado reaberto
- **WHEN** o usuário abre um documento com um dispositivo de título "Da finalidade" e uma revisão `alterado` cujo filho é um dispositivo com `TituloDispositivo` "Do objeto"
- **THEN** rejeitar a revisão restaura o título "Do objeto", e aceitá-la mantém "Da finalidade"

#### Scenario: Título removido reaberto
- **WHEN** o usuário abre um documento com um dispositivo sem título e uma revisão `alterado` cujo filho é um dispositivo com `TituloDispositivo` "Do objeto"
- **THEN** a marca descreve que o título foi alterado, e rejeitar a revisão devolve o título "Do objeto"

#### Scenario: Título e texto alterados reabertos
- **WHEN** o usuário abre um documento com uma revisão `alterado` cujo filho é um dispositivo com título anterior e texto anterior diferentes dos atuais
- **THEN** a marca descreve que texto e título foram alterados, e rejeitar a revisão restaura os dois

#### Scenario: Parágrafo solto aceito na leitura
- **WHEN** o usuário abre um documento com uma revisão `alterado` cujo filho é um parágrafo solto, em um dispositivo que tem título
- **THEN** a marca descreve que o texto foi alterado, e rejeitar a revisão restaura o texto e mantém o título atual
