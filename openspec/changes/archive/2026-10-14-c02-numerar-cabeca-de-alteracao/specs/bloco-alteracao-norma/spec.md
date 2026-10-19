## ADDED Requirements

### Requirement: Cabeça do bloco de alteração pode ser numerada
A cabeça de um bloco de alteração de norma (o artigo da norma alterada) cujo rótulo ainda não foi informado SHALL poder ser numerada pelo usuário, pela ação "Numerar dispositivo" e pelo "Corrigir agora" do alerta de numeração. O número informado SHALL passar a compor o rótulo da cabeça.

#### Scenario: Corrigir agora numera a cabeça recém-criada
- **WHEN** o usuário cria um artigo de alteração, a cabeça do bloco aparece com o alerta "Numere o dispositivo" e o usuário aciona "Corrigir agora" e informa o número 5
- **THEN** o diálogo de numeração é exibido, o rótulo da cabeça passa a ser "Art. 5º", o alerta de numeração desaparece e nenhuma mensagem de erro é exibida

#### Scenario: Ação do menu numera a cabeça
- **WHEN** o usuário aciona "Numerar dispositivo" no menu da cabeça de um bloco de alteração com rótulo pendente e informa um número
- **THEN** o rótulo da cabeça passa a refletir o número informado

#### Scenario: Numeração inválida em alteração
- **WHEN** o usuário informa para um dispositivo de alteração um número iniciado em zero
- **THEN** a numeração não é aplicada e o sistema informa que não pode haver dispositivo com esse rótulo em alteração de norma, como já ocorre hoje

### Requirement: Alerta de numeração só oferece correção disponível
O alerta "Numere o dispositivo" SHALL oferecer a ação "Corrigir agora" somente quando a renumeração estiver disponível para aquele dispositivo, usando a mesma regra que autoriza a ação de numerar. O sistema SHALL NOT exibir a mensagem "Nessa situação, não é possível renumerar o dispositivo" em resposta a um "Corrigir agora" que ele mesmo ofereceu.

#### Scenario: Correção oferecida é sempre executável
- **WHEN** um dispositivo exibe o alerta "Numere o dispositivo" com a ação "Corrigir agora" e o usuário aciona essa ação
- **THEN** o diálogo de numeração é exibido

#### Scenario: Dispositivo que não pode ser renumerado não oferece correção
- **WHEN** um dispositivo de alteração marcado como existente na norma alterada, com rótulo informado, não pode ser renumerado
- **THEN** o alerta de numeração, se exibido, não oferece "Corrigir agora"

#### Scenario: Renumeração indisponível por outro caminho
- **WHEN** a ação de renumerar chega a um dispositivo que não pode ser renumerado sem passar pelo alerta (atalho de teclado ou menu)
- **THEN** o sistema informa "Nessa situação, não é possível renumerar o dispositivo" e o rótulo permanece inalterado
