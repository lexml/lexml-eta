# numeracao-repetida Specification

## Purpose

Define o modo de validação de numeração dos dispositivos e o tratamento, no modo flexível, de proposições com dispositivos de numeração repetida, para que possam ser abertas, editadas e corrigidas no editor.

## Requirements

### Requirement: Modo de validação de numeração

O componente SHALL oferecer dois modos de validação de numeração dos dispositivos: rígido e flexível. Sem modo informado, ou com valor desconhecido, SHALL valer o rígido. No modo rígido, documento com ids repetidos SHALL ser recusado ao abrir e ao salvar, e nenhum alerta, pendência ou erro de numeração repetida SHALL ser produzido. Complemento, lacuna e numeração fora de ordem SHALL ser avaliados nos dois modos.

#### Scenario: Sem modo informado

- **WHEN** o host não informa o modo de validação de numeração e abre um documento com dois artigos de mesmo número
- **THEN** a abertura é recusada com o erro de identificadores repetidos, e o documento em edição continua como estava

#### Scenario: Modo flexível

- **WHEN** o host informa o modo flexível e abre o mesmo documento
- **THEN** o documento é aberto para edição

#### Scenario: Lacuna no modo rígido

- **WHEN** o host não informa o modo de validação de numeração e abre um documento com os artigos 1, 3 e 4
- **THEN** o documento é aberto para edição, o "Art. 3º" exibe o erro de lacuna, e a aba Avisos exibe o alerta de numeração irregular

### Requirement: Numeração repetida

No modo flexível, um dispositivo SHALL ter numeração repetida quando o seu identificador for igual ao de um dispositivo anterior na ordem de leitura, e o identificador do seu pai não se repetir. Um artigo SHALL ser comparado com todos os artigos da mesma articulação, e os demais dispositivos, com os irmãos do mesmo pai. Um descendente cujo identificador só se repete porque o do ancestral se repete SHALL NOT ter numeração repetida.

#### Scenario: Artigos repetidos em capítulos diferentes

- **WHEN** o documento tem um "Art. 5º" no Capítulo I e outro "Art. 5º" no Capítulo II
- **THEN** só o "Art. 5º" do Capítulo II tem numeração repetida

#### Scenario: Descendentes do artigo repetido

- **WHEN** os dois "Art. 5º" têm incisos I e II
- **THEN** os incisos do segundo artigo não têm numeração repetida, embora os seus identificadores se repitam

#### Scenario: Incisos repetidos no mesmo caput

- **WHEN** o caput de um artigo tem três incisos com o rótulo "II"
- **THEN** o segundo e o terceiro desses incisos têm numeração repetida, e o primeiro não

### Requirement: Erro contextualizado de numeração repetida

No modo flexível, todo dispositivo com numeração repetida SHALL exibir, abaixo dele, o erro "Dispositivo com numeração repetida". O erro SHALL deixar de ser exibido assim que o dispositivo não tiver mais numeração repetida.

#### Scenario: Erro na segunda ocorrência

- **WHEN** o documento aberto no modo flexível tem dois "Art. 5º"
- **THEN** o erro "Dispositivo com numeração repetida" é exibido abaixo do segundo "Art. 5º", e não abaixo do primeiro

#### Scenario: Mensagem do bloco de alteração permanece

- **WHEN** dois artigos irmãos de um bloco de alteração têm o mesmo número no modo flexível
- **THEN** os dois exibem "O dispositivo tem número igual ao de outro dispositivo", e o segundo também exibe "Dispositivo com numeração repetida"

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

O sistema SHALL reavaliar depois de cada ação na articulação, inclusive desfazer e refazer, o complemento, a lacuna e a numeração fora de ordem de todo o documento nos dois modos, e a numeração repetida no modo flexível. SHALL atualizar o erro de todo dispositivo cuja situação mudou, mesmo que a ação não o tenha alterado diretamente.

#### Scenario: Renumeração automática corrige a repetição

- **WHEN** o documento tem dois "Art. 5º" e o usuário inclui um artigo, o que renumera todos os artigos
- **THEN** nenhum dispositivo exibe o erro de numeração repetida, e o alerta deixa de ser exibido

#### Scenario: Renumeração manual cria a repetição

- **WHEN** o usuário renumera manualmente um artigo de um bloco de alteração com o número de um irmão
- **THEN** o erro "Dispositivo com numeração repetida" é exibido no segundo deles, e o alerta passa a ser exibido

#### Scenario: Mover dispositivo corrige a ordem

- **WHEN** o texto principal tem os artigos 1, 3, 2 e 4, nessa ordem, e o usuário move o "Art. 2º" para antes do "Art. 3º"
- **THEN** nenhum dispositivo exibe erro de numeração, e o alerta deixa de ser exibido

#### Scenario: Inclusão de artigo no modo rígido

- **WHEN** o documento aberto no modo rígido tem os artigos 1, 3 e 4 e o usuário inclui um artigo, o que renumera todos os artigos
- **THEN** nenhum dispositivo exibe o erro de lacuna, e o alerta deixa de ser exibido

### Requirement: Referências a identificador repetido

Quando uma remissão interna, um comentário da articulação ou a situação na norma vigente gravados no arquivo apontarem para um identificador repetido, o sistema SHALL resolvê-los para a primeira ocorrência na ordem de leitura.

#### Scenario: Remissão para artigo repetido

- **WHEN** o documento aberto no modo flexível tem dois "Art. 5º" e uma remissão interna gravada para `art5`
- **THEN** a remissão aponta para o primeiro "Art. 5º"

### Requirement: Grupo de numeração automática

Complemento, lacuna e numeração fora de ordem SHALL ser avaliados nos dois modos de validação de numeração, só nos grupos de numeração automática: os artigos do texto principal, comparados com todos os artigos da articulação, e os irmãos de mesmo tipo de um pai que pode ser renumerado automaticamente. Artigo de bloco de alteração e filhos de pai "Existente" na norma alterada SHALL NOT ser avaliados. Um grupo que contém omissis SHALL NOT ter esses casos avaliados.

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

Um dispositivo de um grupo de numeração automática SHALL ter complemento na numeração quando o seu número tiver complemento, como "Art. 3º-A", que a numeração automática nunca gera, e ele não tiver numeração repetida. O complemento SHALL prevalecer sobre lacuna e numeração fora de ordem, e o dispositivo com complemento SHALL NOT ser considerado no maior número anterior usado por elas.

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

Um dispositivo de um grupo de numeração automática SHALL ter lacuna na numeração quando o seu número for maior que o maior número dos dispositivos anteriores do grupo mais um e ele não tiver numeração repetida nem complemento. O primeiro do grupo SHALL ser comparado com 1. Só o dispositivo em que a lacuna aparece SHALL ter lacuna; os seguintes, que continuam a sequência a partir dele, SHALL NOT.

#### Scenario: Lacuna no meio da sequência

- **WHEN** o texto principal tem os artigos 1, 3 e 4, nessa ordem
- **THEN** só o "Art. 3º" tem lacuna na numeração

#### Scenario: Primeiro do grupo

- **WHEN** o texto principal começa pelo "Art. 2º"
- **THEN** o "Art. 2º" tem lacuna na numeração

### Requirement: Numeração fora de ordem

Um dispositivo de um grupo de numeração automática SHALL ter numeração fora de ordem quando o seu número for menor que o maior número dos anteriores do grupo mais um e ele não tiver numeração repetida nem complemento. Quando valer também a numeração repetida, SHALL prevalecer a repetida no modo flexível. No modo rígido, em que a repetição não é avaliada, o dispositivo repetido SHALL NOT ter irregularidade. Um dispositivo seguinte que continua a sequência a partir do maior número anterior SHALL NOT ter irregularidade.

#### Scenario: Artigos trocados

- **WHEN** o texto principal tem os artigos 1, 3, 2 e 4, nessa ordem
- **THEN** o "Art. 3º" tem lacuna na numeração, o "Art. 2º" tem numeração fora de ordem e o "Art. 4º" não tem irregularidade

#### Scenario: Repetição prevalece

- **WHEN** o texto principal tem os artigos 1, 2, 3, 2 e 4, nessa ordem
- **THEN** o segundo "Art. 2º" tem numeração repetida, e não numeração fora de ordem, e o "Art. 4º" não tem irregularidade

### Requirement: Erro contextualizado de complemento, lacuna e numeração fora de ordem

Nos dois modos de validação de numeração, todo dispositivo com complemento na numeração SHALL exibir, abaixo dele, o erro "Dispositivo com complemento na numeração"; com lacuna, "Dispositivo com lacuna na numeração"; e com numeração fora de ordem, "Dispositivo com numeração fora de ordem". O erro SHALL deixar de ser exibido assim que a irregularidade deixar de existir.

#### Scenario: Erros nos artigos trocados

- **WHEN** o documento aberto no modo flexível tem os artigos 1, 3, 2 e 4, nessa ordem
- **THEN** o "Art. 3º" exibe "Dispositivo com lacuna na numeração", o "Art. 2º" exibe "Dispositivo com numeração fora de ordem", e o "Art. 1º" e o "Art. 4º" não exibem erro de numeração

#### Scenario: Erro de complemento

- **WHEN** o documento aberto no modo flexível tem os artigos 1, 2, 2-A e 3, nessa ordem
- **THEN** só o "Art. 2º-A" exibe erro de numeração, "Dispositivo com complemento na numeração"

#### Scenario: Modo rígido

- **WHEN** o mesmo documento com os artigos 1, 3, 2 e 4 é aberto no modo rígido
- **THEN** o "Art. 3º" exibe "Dispositivo com lacuna na numeração" e o "Art. 2º" exibe "Dispositivo com numeração fora de ordem", como no modo flexível
