# Spec Delta

## Purpose

Define a co-edição de texto em tempo real: vários usuários digitando no mesmo dispositivo convergem para o mesmo texto, com formatação inline preservada e sem que a edição de um dispositivo afete o texto de outro.

## ADDED Requirements

### Requirement: Texto co-editado por dispositivo
O sistema SHALL manter o texto de cada dispositivo como um conteúdo compartilhado próprio, de modo que dois usuários digitando no mesmo dispositivo ao mesmo tempo convirjam para o mesmo texto.

#### Scenario: Digitação em um cliente chega ao outro
- **WHEN** um cliente digita em um dispositivo
- **THEN** o outro cliente passa a exibir o mesmo texto naquele dispositivo

#### Scenario: Digitação simultânea no mesmo dispositivo
- **WHEN** dois clientes digitam no mesmo dispositivo ao mesmo tempo
- **THEN** os dois terminam com o mesmo texto, contendo as edições de ambos

### Requirement: Edição escopada por dispositivo
O sistema SHALL aplicar uma edição do editor somente ao texto do dispositivo cujo intervalo a contém, recortando operações que cruzam a fronteira entre dois dispositivos.

#### Scenario: Edição no meio de uma linha
- **WHEN** o usuário insere ou apaga texto no meio do texto de um dispositivo
- **THEN** apenas o texto desse dispositivo é alterado, na posição relativa correta

#### Scenario: Operação que cobre dois dispositivos
- **WHEN** uma operação do editor se estende por dois dispositivos
- **THEN** cada dispositivo recebe só a parte da operação que cai dentro do seu intervalo

### Requirement: Só texto entra na co-edição
O sistema SHALL sincronizar apenas texto e formatação inline; alterações estruturais do editor (rótulo, menu, quebra de linha, elementos incorporados) MUST NOT ser escritas no texto compartilhado.

#### Scenario: Atualização estrutural da linha
- **WHEN** o editor emite uma mudança que altera rótulo, menu ou elemento incorporado
- **THEN** o texto compartilhado do dispositivo não é alterado

### Requirement: Formatação inline é preservada
O sistema SHALL propagar a formatação inline (como negrito e itálico) junto com o texto, como atributos do trecho formatado.

#### Scenario: Trecho em negrito
- **WHEN** um cliente aplica negrito a um trecho
- **THEN** o outro cliente exibe o mesmo trecho em negrito

### Requirement: Texto remoto é aplicado sem eco
O sistema SHALL aplicar o texto recebido de outro cliente de forma silenciosa, sem tratá-lo como digitação local e sem reenviá-lo.

#### Scenario: Texto remoto não retorna ao documento
- **WHEN** o editor aplica texto vindo de outro cliente
- **THEN** nenhuma nova edição é escrita no texto compartilhado em consequência disso

### Requirement: Artigo delega o texto ao caput
O sistema SHALL, na linha de um artigo, ler e escrever o texto do caput do artigo.

#### Scenario: Editar o texto de um artigo
- **WHEN** o usuário edita o texto exibido na linha de um artigo
- **THEN** a edição é registrada no texto compartilhado do caput desse artigo

### Requirement: Dispositivos fora da tela mantêm o texto
O sistema SHALL manter o texto compartilhado de dispositivos que não estão renderizados (por exemplo, em outra página da paginação), exibindo-o quando forem renderizados, e MUST NOT descartar nem desfigurar edições feitas enquanto estavam fora da tela.

#### Scenario: Edição remota em dispositivo fora da página
- **WHEN** outro cliente edita um dispositivo que não está renderizado neste cliente
- **THEN** o texto compartilhado é atualizado sem erro e é exibido quando o dispositivo for renderizado

#### Scenario: Troca de página
- **WHEN** o usuário troca de página
- **THEN** os dispositivos da nova página passam a acompanhar o texto compartilhado
