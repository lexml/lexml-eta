# Spec Delta

## MODIFIED Requirements

### Requirement: Reconstrução das operações de cada revisão
Ao abrir um documento, o sistema SHALL reconstruir, a partir do atributo `revisao` e do conteúdo filho de cada `RevisaoArticulacao`, as operações registradas (`adicionado`, `excluido`, `alterado`, `movido`, `transformado`, `alteracaoRotulo`), inclusive combinadas, de modo que as marcas exibidas descrevam todas as operações e o conteúdo, a posição, o tipo e o rótulo anteriores possam ser restaurados. Operações desconhecidas SHALL ser ignoradas, sem impedir a leitura das demais.

#### Scenario: Revisão combinada
- **WHEN** o usuário abre um documento com uma revisão `movido;3,alterado` e o texto original como filho
- **THEN** o dispositivo é exibido com a marca da revisão, e rejeitá-la devolve o dispositivo à posição 3 com o texto original

#### Scenario: Operação desconhecida
- **WHEN** o usuário abre um documento com uma revisão cuja operação não é reconhecida, como `operacaoFutura;x`
- **THEN** o documento abre normalmente, sem erro, e as demais revisões são reconstruídas

## ADDED Requirements

### Requirement: Reconstrução da revisão de alteração de rótulo
Ao abrir um documento com uma revisão `alteracaoRotulo;<idOriginal>`, o sistema SHALL reconstruir o rótulo anterior a partir de `<idOriginal>`, usando o formato de rótulo do tipo do dispositivo e letras como sufixo de encaixe em alteração de norma (por exemplo, `art1_cpt_alt1_art4_par4-1` corresponde a "§ 4º-A"), de modo que a revisão possa ser aceita e rejeitada com o mesmo resultado de uma revisão criada na sessão de edição.

#### Scenario: Rejeitar a revisão reaberta
- **WHEN** o usuário abre um documento com um parágrafo `§ 4º-B` e a revisão `alteracaoRotulo;art1_cpt_alt1_art4_par4-1`, e rejeita a revisão
- **THEN** o parágrafo volta a `§ 4º-A`, com o identificador `art1_cpt_alt1_art4_par4-1`, e os identificadores dos seus descendentes acompanham

#### Scenario: Aceitar a revisão reaberta
- **WHEN** o usuário abre o mesmo documento e aceita a revisão
- **THEN** o parágrafo permanece `§ 4º-B` e deixa de ter marca

#### Scenario: Identificador original inválido
- **WHEN** o usuário abre um documento com `alteracaoRotulo` cujo argumento não corresponde a um identificador do tipo do dispositivo
- **THEN** o documento abre normalmente e a revisão é descartada, sem impedir a leitura das demais

### Requirement: Ida e volta da revisão de alteração de rótulo
O sistema SHALL preservar a operação `alteracaoRotulo`, com seu argumento, na sequência salvar, abrir e salvar de novo, inclusive combinada com outras operações.

#### Scenario: Salvar, abrir e salvar de novo
- **WHEN** o usuário salva um documento com a revisão `alteracaoRotulo;<idOriginal>,alterado`, abre o arquivo e salva de novo
- **THEN** o novo arquivo tem a mesma revisão, com os mesmos `revisao`, `refIdDispositivo`, usuário e conteúdo anterior
