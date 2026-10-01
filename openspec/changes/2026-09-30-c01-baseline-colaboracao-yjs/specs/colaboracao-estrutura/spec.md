# Spec Delta

## Purpose

Define como as mudanças estruturais da articulação (incluir, remover, reordenar, transformar tipo e atualizar a nota de alteração) são propagadas entre os clientes, mantendo o estado do editor e o documento compartilhado coerentes e sem eco.

## ADDED Requirements

### Requirement: Inclusão e remoção são propagadas
O sistema SHALL propagar a inclusão e a remoção de dispositivos feitas por um cliente para os demais clientes da sala.

#### Scenario: Dispositivo incluído aparece no outro cliente
- **WHEN** um cliente inclui um dispositivo
- **THEN** o outro cliente passa a exibir o dispositivo, no mesmo pai e na mesma posição relativa

#### Scenario: Dispositivo removido some no outro cliente
- **WHEN** um cliente remove um dispositivo
- **THEN** o outro cliente deixa de exibi-lo

### Requirement: Operações remotas não voltam ao documento
O sistema SHALL aplicar localmente as mudanças recebidas de outro cliente sem reenviá-las ao documento compartilhado.

#### Scenario: Aplicação remota não gera eco
- **WHEN** uma inclusão remota é aplicada ao estado local
- **THEN** nenhuma nova operação é escrita no documento compartilhado em consequência dela

### Requirement: Remoções precedem inclusões no mesmo lote
O sistema SHALL processar as remoções antes das inclusões dentro de um mesmo lote de eventos, para que um dispositivo movido não apareça duplicado em nenhum momento.

#### Scenario: Mover emite remoção e inclusão com o mesmo identificador
- **WHEN** um lote traz a inclusão e a remoção do mesmo dispositivo, nessa ordem
- **THEN** o documento compartilhado termina com uma única ocorrência do identificador, na nova posição

### Requirement: Reordenação de irmãos é propagada
O sistema SHALL propagar a reordenação de dispositivos irmãos (mover para cima e para baixo), preservando a identidade global do dispositivo movido.

#### Scenario: Mover para baixo converge
- **WHEN** um cliente move um dispositivo para baixo entre seus irmãos
- **THEN** o outro cliente passa a exibir a mesma ordem entre os irmãos

### Requirement: Transformação de tipo converge
O sistema SHALL propagar a transformação de tipo de um dispositivo (como a promoção por Shift+Tab, de inciso para parágrafo) de modo que os dois clientes terminem com a mesma articulação.

#### Scenario: Promoção de tipo converge
- **WHEN** um cliente promove um inciso a parágrafo
- **THEN** o outro cliente passa a exibir o parágrafo no novo pai, sem erro e sem perder o dispositivo

### Requirement: Inclusão remota nunca perde o dispositivo
O sistema SHALL, quando a referência de inserção de uma inclusão remota não puder ser resolvida, inserir o dispositivo sob o seu pai real, sem lançar exceção e sem usar omissis como referência de posição.

#### Scenario: Referência de inserção inválida
- **WHEN** a inclusão remota não pode ser reconstruída a partir de um irmão
- **THEN** o dispositivo é inserido como filho do seu pai e a sincronização prossegue

### Requirement: Identidade compartilhada de dispositivos remotos
O sistema SHALL fazer com que um dispositivo criado localmente a partir de uma inclusão remota adote o identificador global remoto.

#### Scenario: Dispositivo remoto adota o gid
- **WHEN** a inclusão remota cria um dispositivo no cliente receptor
- **THEN** esse dispositivo passa a ter o mesmo identificador global do dispositivo original

### Requirement: Nota de alteração é propagada
O sistema SHALL propagar a nota de alteração (como NR, AC, RV) e sua remoção, mantida na cabeça do bloco de alteração.

#### Scenario: Nota alterada em um cliente
- **WHEN** um cliente atualiza a nota de alteração de um bloco
- **THEN** o outro cliente passa a exibir a mesma nota

#### Scenario: Nota removida em um cliente
- **WHEN** um cliente limpa a nota de alteração
- **THEN** o outro cliente também fica sem nota

### Requirement: Numeração e validação não são sincronizadas
O sistema SHALL recalcular localmente, em cada cliente, a numeração, os rótulos, as validações e a paginação depois de aplicar uma mudança estrutural, sem transmiti-los.

#### Scenario: Renumeração após inclusão remota
- **WHEN** uma inclusão remota desloca a numeração dos irmãos
- **THEN** cada cliente recalcula os rótulos a partir da estrutura convergida
