# Spec Delta

## ADDED Requirements

### Requirement: Grupo de numeração automática

Complemento, lacuna e numeração fora de ordem SHALL ser avaliados só nos grupos de numeração automática: os artigos do texto principal, comparados com todos os artigos da articulação, e os irmãos de mesmo tipo de um pai que pode ser renumerado automaticamente. Artigo de bloco de alteração e filhos de pai "Existente" na norma alterada SHALL NOT ser avaliados. Um grupo que contém omissis SHALL ter avaliada só a numeração repetida.

#### Scenario: Incisos do texto principal

- **WHEN** o caput de um artigo do texto principal tem os incisos I e III
- **THEN** o inciso III tem lacuna na numeração

#### Scenario: Pai existente na norma alterada

- **WHEN** um artigo marcado como "Existente" num bloco de alteração tem os parágrafos `§ 1º` e `§ 3º`
- **THEN** nenhum dos dois tem lacuna na numeração, e as mensagens próprias do bloco de alteração continuam como antes

#### Scenario: Artigos em capítulos diferentes

- **WHEN** o Capítulo I termina no "Art. 2º" e o Capítulo II começa no "Art. 4º"
- **THEN** o "Art. 4º" tem lacuna na numeração

#### Scenario: Grupo com omissis

- **WHEN** um artigo marcado como "Novo" num bloco de alteração tem os incisos I, um omissis e III
- **THEN** o inciso III não tem lacuna na numeração

### Requirement: Complemento na numeração

No modo flexível, um dispositivo de um grupo de numeração automática SHALL ter complemento na numeração quando o seu número tiver complemento, como "Art. 3º-A", que a numeração automática nunca gera, e ele não tiver numeração repetida. O complemento SHALL prevalecer sobre lacuna e numeração fora de ordem, e o dispositivo com complemento SHALL NOT ser considerado no maior número anterior usado por elas.

#### Scenario: Complemento entre artigos

- **WHEN** o texto principal tem os artigos 3, 3-A e 4, nessa ordem
- **THEN** só o "Art. 3º-A" tem complemento na numeração, e o "Art. 4º" não tem irregularidade

#### Scenario: Complementos seguidos

- **WHEN** o texto principal tem os artigos 3, 3-A, 3-B e 4, nessa ordem
- **THEN** o "Art. 3º-A" e o "Art. 3º-B" têm complemento na numeração, e o "Art. 4º" não tem irregularidade

#### Scenario: Complemento prevalece sobre lacuna

- **WHEN** o texto principal tem os artigos 1 e 3-A, nessa ordem
- **THEN** o "Art. 3º-A" tem complemento na numeração, e não lacuna

### Requirement: Lacuna na numeração

No modo flexível, um dispositivo de um grupo de numeração automática SHALL ter lacuna na numeração quando o seu número for maior que o maior número dos dispositivos anteriores do grupo mais um e ele não tiver numeração repetida nem complemento. O primeiro do grupo SHALL ser comparado com 1. Só o dispositivo em que a lacuna aparece SHALL ter lacuna; os seguintes, que continuam a sequência a partir dele, SHALL NOT.

#### Scenario: Lacuna no meio da sequência

- **WHEN** o texto principal tem os artigos 1, 3 e 4, nessa ordem
- **THEN** só o "Art. 3º" tem lacuna na numeração

#### Scenario: Primeiro do grupo

- **WHEN** o texto principal começa pelo "Art. 2º"
- **THEN** o "Art. 2º" tem lacuna na numeração

### Requirement: Numeração fora de ordem

No modo flexível, um dispositivo de um grupo de numeração automática SHALL ter numeração fora de ordem quando o seu número for menor que o maior número dos anteriores do grupo mais um e ele não tiver numeração repetida nem complemento. Quando valer também a numeração repetida, SHALL prevalecer a repetida. Um dispositivo seguinte que continua a sequência a partir do maior número anterior SHALL NOT ter irregularidade.

#### Scenario: Artigos trocados

- **WHEN** o texto principal tem os artigos 1, 3, 2 e 4, nessa ordem
- **THEN** o "Art. 3º" tem lacuna na numeração, o "Art. 2º" tem numeração fora de ordem e o "Art. 4º" não tem irregularidade

#### Scenario: Repetição prevalece

- **WHEN** o texto principal tem os artigos 1, 2, 3, 2 e 4, nessa ordem
- **THEN** o segundo "Art. 2º" tem numeração repetida, e não numeração fora de ordem, e o "Art. 4º" não tem irregularidade

### Requirement: Erro contextualizado de complemento, lacuna e numeração fora de ordem

No modo flexível, todo dispositivo com complemento na numeração SHALL exibir, abaixo dele, o erro "Dispositivo com complemento na numeração"; com lacuna, "Dispositivo com lacuna na numeração"; e com numeração fora de ordem, "Dispositivo com numeração fora de ordem". O erro SHALL deixar de ser exibido assim que a irregularidade deixar de existir.

#### Scenario: Erros nos artigos trocados

- **WHEN** o documento aberto no modo flexível tem os artigos 1, 3, 2 e 4, nessa ordem
- **THEN** o "Art. 3º" exibe "Dispositivo com lacuna na numeração", o "Art. 2º" exibe "Dispositivo com numeração fora de ordem", e o "Art. 1º" e o "Art. 4º" não exibem erro de numeração

#### Scenario: Erro de complemento

- **WHEN** o documento aberto no modo flexível tem os artigos 1, 2, 2-A e 3, nessa ordem
- **THEN** só o "Art. 2º-A" exibe erro de numeração, "Dispositivo com complemento na numeração"

#### Scenario: Modo rígido

- **WHEN** o mesmo documento é aberto no modo rígido
- **THEN** nenhum dispositivo exibe erro de complemento, de lacuna ou de numeração fora de ordem

## MODIFIED Requirements

### Requirement: Modo de validação de numeração

O componente SHALL oferecer dois modos de validação de numeração dos dispositivos: rígido e flexível. Sem modo informado, ou com valor desconhecido, SHALL valer o rígido. No modo rígido, o editor SHALL se comportar como antes do modo flexível: documento com ids repetidos é recusado ao abrir e ao salvar, e nenhum alerta, pendência ou erro de numeração repetida, de complemento, de lacuna ou de numeração fora de ordem é produzido.

#### Scenario: Sem modo informado

- **WHEN** o host não informa o modo de validação de numeração e abre um documento com dois artigos de mesmo número
- **THEN** a abertura é recusada com o erro de identificadores repetidos, e o documento em edição continua como estava

#### Scenario: Modo flexível

- **WHEN** o host informa o modo flexível e abre o mesmo documento
- **THEN** o documento é aberto para edição

#### Scenario: Lacuna no modo rígido

- **WHEN** o host não informa o modo de validação de numeração e abre um documento com os artigos 1, 3 e 4
- **THEN** o documento é aberto para edição, sem erro, alerta ou pendência de numeração

### Requirement: Oferta da correção de numeração repetida

O erro de numeração repetida SHALL oferecer "Corrigir agora" quando o editor puder renumerar automaticamente o grupo do dispositivo: no texto principal e, em bloco de alteração, em dispositivo que não seja artigo e cujo pai é "Novo". Artigo de bloco de alteração e dispositivo cujo pai é "Existente" na norma alterada SHALL NOT receber a correção, porque a numeração deles nunca é automática. Os erros de complemento, de lacuna e de numeração fora de ordem SHALL sempre oferecer "Corrigir agora".

#### Scenario: Texto principal

- **WHEN** o documento tem dois "Art. 5º" no texto principal
- **THEN** o erro de numeração repetida do segundo oferece "Corrigir agora"

#### Scenario: Pai existente na norma alterada

- **WHEN** dois parágrafos irmãos de um artigo marcado como "Existente" num bloco de alteração têm o mesmo número
- **THEN** o erro de numeração repetida não oferece "Corrigir agora", e o usuário pode corrigir com "Renumerar"

#### Scenario: Artigo de bloco de alteração

- **WHEN** dois artigos irmãos de um bloco de alteração têm o mesmo número
- **THEN** o erro de numeração repetida do segundo não oferece "Corrigir agora"

#### Scenario: Lacuna e fora de ordem

- **WHEN** o texto principal tem os artigos 1, 3, 2 e 4, nessa ordem
- **THEN** o erro de lacuna do "Art. 3º" e o erro de numeração fora de ordem do "Art. 2º" oferecem "Corrigir agora"

### Requirement: Correção de numeração repetida

"Corrigir agora" SHALL renumerar em sequência o grupo do dispositivo (os artigos da articulação ou os irmãos do mesmo pai), pela posição de cada um, e recalcular os identificadores dos descendentes, corrigindo o dispositivo e as demais irregularidades do grupo. A correção SHALL NOT mudar a ordem dos dispositivos, SHALL atualizar as remissões internas que referenciam os dispositivos renumerados e SHALL poder ser desfeita.

#### Scenario: Corrigir artigo repetido

- **WHEN** o usuário aciona "Corrigir agora" no segundo de dois "Art. 1º" do texto principal, seguidos de um "Art. 2º"
- **THEN** os artigos passam a ser "Art. 1º", "Art. 2º" e "Art. 3º" (o editor numera os artigos do texto principal pela posição), os incisos do antigo segundo "Art. 1º" passam a ter o identificador do "Art. 2º", e nenhum erro de numeração repetida permanece

#### Scenario: Corrigir artigos trocados

- **WHEN** o texto principal tem os artigos 1, 3, 2 e 4, nessa ordem, e o usuário aciona "Corrigir agora" no "Art. 2º"
- **THEN** os artigos, na mesma ordem e com o mesmo texto, passam a ser "Art. 1º", "Art. 2º", "Art. 3º" e "Art. 4º", e nenhum erro de numeração permanece

#### Scenario: Corrigir lacuna

- **WHEN** o texto principal tem os artigos 1, 3 e 4 e o usuário aciona "Corrigir agora" no "Art. 3º"
- **THEN** os artigos passam a ser "Art. 1º", "Art. 2º" e "Art. 3º"

#### Scenario: Corrigir complemento

- **WHEN** o texto principal tem os artigos 1, 2, 2-A e 3 e o usuário aciona "Corrigir agora" no "Art. 2º-A"
- **THEN** os artigos passam a ser "Art. 1º", "Art. 2º", "Art. 3º" e "Art. 4º"

#### Scenario: Remissão acompanha a correção

- **WHEN** o texto de um dispositivo tem uma remissão interna para o "Art. 2º" e o usuário corrige dois "Art. 1º" anteriores a ele
- **THEN** a remissão passa a referir o "Art. 3º"

#### Scenario: Desfazer a correção

- **WHEN** o usuário desfaz a correção
- **THEN** a numeração irregular volta, com o erro, o alerta e a pendência

### Requirement: Reavaliação da numeração repetida a cada ação

No modo flexível, o sistema SHALL reavaliar a numeração repetida, o complemento, a lacuna e a numeração fora de ordem de todo o documento depois de cada ação na articulação, inclusive desfazer e refazer, e SHALL atualizar o erro de todo dispositivo cuja situação mudou, mesmo que a ação não o tenha alterado diretamente.

#### Scenario: Renumeração automática corrige a repetição

- **WHEN** o documento tem dois "Art. 5º" e o usuário inclui um artigo, o que renumera todos os artigos
- **THEN** nenhum dispositivo exibe o erro de numeração repetida, e o alerta deixa de ser exibido

#### Scenario: Renumeração manual cria a repetição

- **WHEN** o usuário renumera manualmente um artigo de um bloco de alteração com o número de um irmão
- **THEN** o erro "Dispositivo com numeração repetida" é exibido no segundo deles, e o alerta passa a ser exibido

#### Scenario: Mover dispositivo corrige a ordem

- **WHEN** o texto principal tem os artigos 1, 3, 2 e 4, nessa ordem, e o usuário move o "Art. 2º" para antes do "Art. 3º"
- **THEN** nenhum dispositivo exibe erro de numeração, e o alerta deixa de ser exibido
