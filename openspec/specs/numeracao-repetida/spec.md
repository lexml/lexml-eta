# numeracao-repetida Specification

## Purpose

Define o modo de validação de numeração dos dispositivos e o tratamento, no modo flexível, de proposições com dispositivos de numeração repetida, para que possam ser abertas, editadas e corrigidas no editor.

## Requirements

### Requirement: Modo de validação de numeração

O componente SHALL oferecer dois modos de validação de numeração dos dispositivos: rígido e flexível. Sem modo informado, ou com valor desconhecido, SHALL valer o rígido. No modo rígido, o editor SHALL se comportar como antes desta mudança: documento com ids repetidos é recusado ao abrir e ao salvar, e nenhum alerta, pendência ou erro de numeração repetida é produzido.

#### Scenario: Sem modo informado

- **WHEN** o host não informa o modo de validação de numeração e abre um documento com dois artigos de mesmo número
- **THEN** a abertura é recusada com o erro de identificadores repetidos, e o documento em edição continua como estava

#### Scenario: Modo flexível

- **WHEN** o host informa o modo flexível e abre o mesmo documento
- **THEN** o documento é aberto para edição

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

O erro de numeração repetida SHALL oferecer "Corrigir agora" quando o editor puder renumerar automaticamente o grupo do dispositivo: no texto principal e, em bloco de alteração, em dispositivo que não seja artigo e cujo pai é "Novo". Artigo de bloco de alteração e dispositivo cujo pai é "Existente" na norma alterada SHALL NOT receber a correção, porque a numeração deles nunca é automática.

#### Scenario: Texto principal

- **WHEN** o documento tem dois "Art. 5º" no texto principal
- **THEN** o erro de numeração repetida do segundo oferece "Corrigir agora"

#### Scenario: Pai existente na norma alterada

- **WHEN** dois parágrafos irmãos de um artigo marcado como "Existente" num bloco de alteração têm o mesmo número
- **THEN** o erro de numeração repetida não oferece "Corrigir agora", e o usuário pode corrigir com "Renumerar"

#### Scenario: Artigo de bloco de alteração

- **WHEN** dois artigos irmãos de um bloco de alteração têm o mesmo número
- **THEN** o erro de numeração repetida do segundo não oferece "Corrigir agora"

### Requirement: Correção de numeração repetida

"Corrigir agora" SHALL renumerar em sequência o grupo do dispositivo (os artigos da articulação ou os irmãos do mesmo pai) e recalcular os identificadores dos descendentes, corrigindo o dispositivo e as demais ocorrências do grupo. A correção SHALL atualizar as remissões internas que referenciam os dispositivos renumerados e SHALL poder ser desfeita.

#### Scenario: Corrigir artigo repetido

- **WHEN** o usuário aciona "Corrigir agora" no segundo de dois "Art. 1º" do texto principal, seguidos de um "Art. 2º"
- **THEN** os artigos passam a ser "Art. 1º", "Art. 2º" e "Art. 3º" (o editor numera os artigos do texto principal pela posição), os incisos do antigo segundo "Art. 1º" passam a ter o identificador do "Art. 2º", e nenhum erro de numeração repetida permanece

#### Scenario: Remissão acompanha a correção

- **WHEN** o texto de um dispositivo tem uma remissão interna para o "Art. 2º" e o usuário corrige dois "Art. 1º" anteriores a ele
- **THEN** a remissão passa a referir o "Art. 3º"

#### Scenario: Desfazer a correção

- **WHEN** o usuário desfaz a correção
- **THEN** a numeração repetida volta, com o erro, o alerta e a pendência

### Requirement: Reavaliação da numeração repetida a cada ação

No modo flexível, o sistema SHALL reavaliar a numeração repetida de todo o documento depois de cada ação na articulação, inclusive desfazer e refazer, e SHALL atualizar o erro de todo dispositivo cuja situação mudou, mesmo que a ação não o tenha alterado diretamente.

#### Scenario: Renumeração automática corrige a repetição

- **WHEN** o documento tem dois "Art. 5º" e o usuário inclui um artigo, o que renumera todos os artigos
- **THEN** nenhum dispositivo exibe o erro de numeração repetida, e o alerta deixa de ser exibido

#### Scenario: Renumeração manual cria a repetição

- **WHEN** o usuário renumera manualmente um artigo de um bloco de alteração com o número de um irmão
- **THEN** o erro "Dispositivo com numeração repetida" é exibido no segundo deles, e o alerta passa a ser exibido

### Requirement: Referências a identificador repetido

Quando uma remissão interna, um comentário da articulação ou a situação na norma vigente gravados no arquivo apontarem para um identificador repetido, o sistema SHALL resolvê-los para a primeira ocorrência na ordem de leitura.

#### Scenario: Remissão para artigo repetido

- **WHEN** o documento aberto no modo flexível tem dois "Art. 5º" e uma remissão interna gravada para `art5`
- **THEN** a remissão aponta para o primeiro "Art. 5º"
