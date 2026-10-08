# Renumeração de Dispositivo

## Purpose

Define a renumeração manual de dispositivos em alteração de norma: como os identificadores dos dispositivos subordinados acompanham o novo rótulo e como o modo de revisão registra, descreve, aceita e rejeita a mudança de rótulo.

## Requirements

### Requirement: Renumeração de dispositivo existente na norma alterada
Em alteração de norma, o sistema SHALL permitir renumerar manualmente o dispositivo marcado como "Existente", mantendo-o como existente, e SHALL NOT oferecer a renumeração manual a dispositivo cujo pai está marcado como "Novo", a omissis, nem a dispositivo fora de alteração de norma.

#### Scenario: Corrigir o parágrafo indicado por engano
- **WHEN** o usuário adicionou um artigo de alteração e indicou o `§ 1º` do artigo 3º de uma norma, e renumera o `§ 1º` para `§ 2º`
- **THEN** o rótulo passa a `§ 2º`, o dispositivo continua marcado como "Existente" e o editor não exibe o aviso de que não é possível renumerar

#### Scenario: Filho de pai novo
- **WHEN** o usuário seleciona um inciso cujo pai está marcado como "Novo"
- **THEN** a renumeração manual não é oferecida, porque a numeração é automática

#### Scenario: Fora de alteração de norma
- **WHEN** o usuário seleciona um artigo do texto principal da proposição
- **THEN** a renumeração manual não é permitida

#### Scenario: Omissis
- **WHEN** o usuário seleciona um omissis dentro de alteração de norma
- **THEN** a renumeração manual não é permitida

### Requirement: Numeração automática só nos filhos de dispositivo novo
Em alteração de norma, o sistema SHALL calcular automaticamente o rótulo de um dispositivo apenas quando o seu pai está marcado como "Novo". O rótulo de um dispositivo "Novo" cujo pai é "Existente" SHALL seguir o número informado pelo usuário, sem ser substituído por "Parágrafo único" ou por outro valor automático.

#### Scenario: Único parágrafo novo sob artigo existente
- **WHEN** o usuário marca como "Novo" o único parágrafo de um artigo "Existente" e o renumera para `2`
- **THEN** o rótulo passa a `§ 2º`, e não a "Parágrafo único."

#### Scenario: Parágrafo único informado pelo usuário
- **WHEN** o usuário informa "único" como numeração de um parágrafo "Novo" sob artigo "Existente"
- **THEN** o rótulo passa a "Parágrafo único."

#### Scenario: Filho de artigo novo
- **WHEN** o único parágrafo de um artigo marcado como "Novo" é numerado
- **THEN** o rótulo é "Parágrafo único.", calculado automaticamente

### Requirement: Identificadores dos descendentes acompanham a renumeração
Ao renumerar manualmente um dispositivo, o sistema SHALL recalcular o identificador do dispositivo e o de todos os seus descendentes, de modo que cada identificador reflita o novo rótulo do ancestral, com ou sem modo de revisão.

#### Scenario: Parágrafo com inciso renumerado
- **WHEN** o usuário renumera o parágrafo `§ 4º-A` de um artigo de alteração, que contém um inciso, para `§ 4º-B`
- **THEN** o identificador do parágrafo passa a refletir `4-B` e o identificador do inciso passa a ter o identificador do parágrafo como prefixo

#### Scenario: Artigo com caput, parágrafos e incisos
- **WHEN** o usuário renumera um artigo de alteração que contém parágrafos e incisos
- **THEN** o identificador do artigo, o do caput e os de todos os dispositivos subordinados passam a refletir o novo número do artigo

### Requirement: Revisão de alteração de rótulo
Em modo de revisão, ao renumerar manualmente um dispositivo que já existia antes da revisão, existente ou novo na norma alterada, o sistema SHALL registrar a operação `alteracaoRotulo;<idOriginal>`, onde `<idOriginal>` é o identificador do dispositivo imediatamente antes da primeira renumeração. A operação SHALL NOT ser registrada como `alterado` quando o texto não mudou.

#### Scenario: Renumeração isolada
- **WHEN** o usuário, em modo de revisão, renumera o parágrafo `art1_cpt_alt1_art4_par4-1` (`§ 4º-A`) para `§ 4º-B`
- **THEN** o dispositivo tem uma revisão com a operação `alteracaoRotulo;art1_cpt_alt1_art4_par4-1`, e nenhuma operação `alterado`

#### Scenario: Dispositivo existente na norma renumerado
- **WHEN** o usuário, em modo de revisão, renumera o `§ 1º` ("Existente") de um artigo de alteração para `§ 2º`
- **THEN** o dispositivo tem uma revisão com `alteracaoRotulo;<idOriginal>` e continua marcado como "Existente"

#### Scenario: Segunda renumeração mantém o id original
- **WHEN** o usuário, em modo de revisão, renumera o mesmo dispositivo de `§ 4º-A` para `§ 4º-B` e depois para `§ 4º-C`
- **THEN** a revisão continua com um único `alteracaoRotulo`, cujo argumento é o identificador anterior à primeira renumeração

#### Scenario: Dispositivo criado na própria sessão de revisão
- **WHEN** o usuário, em modo de revisão, adiciona um parágrafo em alteração de norma e o renumera
- **THEN** a revisão do dispositivo continua sendo apenas `adicionado`, sem `alteracaoRotulo`

### Requirement: Combinação com as demais operações
A operação `alteracaoRotulo` SHALL poder ser combinada, no mesmo dispositivo, com `alterado`, `movido` e `transformado`, preservando a ordem em que as operações foram aplicadas e sem que uma substitua a outra.

#### Scenario: Renumeração e alteração de texto
- **WHEN** o usuário, em modo de revisão, renumera um parágrafo e depois altera o seu texto
- **THEN** a revisão do dispositivo tem `alteracaoRotulo;<idOriginal>,alterado`

#### Scenario: Dispositivo movido e depois renumerado
- **WHEN** o usuário, em modo de revisão, move um dispositivo de alteração de norma e depois o renumera
- **THEN** a revisão do dispositivo contém `movido;<posicao>` e `alteracaoRotulo;<idOriginal>`

### Requirement: Reversão da renumeração remove a operação
Quando o dispositivo volta ao identificador original por renumeração ou por desfazer, o sistema SHALL descartar a operação `alteracaoRotulo`; se não restar nenhuma operação, a revisão SHALL deixar de existir.

#### Scenario: Renumerar de volta
- **WHEN** o usuário, em modo de revisão, renumera um parágrafo de `§ 4º-A` para `§ 4º-B` e depois de volta para `§ 4º-A`
- **THEN** o dispositivo deixa de ter revisão

#### Scenario: Desfazer a renumeração
- **WHEN** o usuário renumera um dispositivo em modo de revisão e desfaz a ação
- **THEN** o dispositivo deixa de ter revisão e volta ao rótulo anterior

### Requirement: Rejeitar a revisão de alteração de rótulo
Ao rejeitar uma revisão que contém `alteracaoRotulo`, o sistema SHALL devolver ao dispositivo o número, o rótulo e o identificador anteriores, recalcular os identificadores dos seus descendentes e atualizar as remissões internas que o referenciam. Em revisão combinada, as demais operações SHALL ser restauradas como na rejeição isolada de cada uma.

#### Scenario: Rejeição isolada
- **WHEN** o usuário rejeita a revisão de um parágrafo renumerado de `§ 4º-A` para `§ 4º-B`
- **THEN** o parágrafo volta a `§ 4º-A`, com o identificador original, e o identificador do seu inciso volta a ter o prefixo do parágrafo original

#### Scenario: Rejeição de revisão combinada
- **WHEN** o usuário rejeita a revisão `alteracaoRotulo;<idOriginal>,alterado` de um parágrafo
- **THEN** o parágrafo volta ao rótulo e ao texto originais

#### Scenario: Remissão ao dispositivo renumerado
- **WHEN** existe uma remissão interna ao dispositivo renumerado e o usuário rejeita a revisão
- **THEN** o texto e o destino da remissão voltam a se referir ao rótulo original

### Requirement: Aceitar a revisão de alteração de rótulo
Ao aceitar uma revisão que contém `alteracaoRotulo`, o sistema SHALL manter o rótulo, a numeração e os identificadores atuais e remover a marca.

#### Scenario: Aceitação
- **WHEN** o usuário aceita a revisão de um parágrafo renumerado de `§ 4º-A` para `§ 4º-B`
- **THEN** o parágrafo permanece como `§ 4º-B` e deixa de ter marca de revisão

### Requirement: Descrição da marca de revisão de rótulo
A marca de uma revisão que só altera o rótulo SHALL descrevê-la como alteração de rótulo e informar o rótulo anterior, em vez de descrevê-la como alteração de texto.

#### Scenario: Descrição na marca
- **WHEN** o usuário passa o cursor sobre a marca de um parágrafo renumerado de `§ 4º-A` para `§ 4º-B`
- **THEN** a descrição informa que o rótulo foi alterado e que o anterior era `§ 4º-A`
