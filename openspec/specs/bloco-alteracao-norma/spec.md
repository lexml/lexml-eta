# Bloco de Alteração de Norma

## Purpose

Define as regras estruturais do artigo de alteração de norma — o artigo cujo caput traz um bloco de alteração — e o que o editor permite criar dentro e ao redor dele.

## Requirements

### Requirement: Artigo de alteração não tem incisos nem parágrafos próprios
Um artigo que possui bloco de alteração de norma SHALL ter como único conteúdo subordinado o bloco de alteração. O editor SHALL NOT criar inciso ou parágrafo próprio (fora do bloco) nesse artigo por nenhuma ação.

#### Scenario: Menu do artigo com bloco de alteração
- **WHEN** o usuário abre o menu de um artigo que possui bloco de alteração
- **THEN** as opções "Adicionar inciso" e "Adicionar parágrafo" não são oferecidas

#### Scenario: Menu do artigo sem bloco de alteração
- **WHEN** o usuário abre o menu de um artigo sem bloco de alteração
- **THEN** as opções "Adicionar inciso" e "Adicionar parágrafo" continuam disponíveis, como hoje

#### Scenario: Ação de adicionar inciso chega por outro caminho
- **WHEN** uma ação de adicionar inciso ou parágrafo como filho é aplicada a um artigo com bloco de alteração sem passar pelo menu
- **THEN** nenhum inciso ou parágrafo próprio é criado e a estrutura do artigo permanece inalterada

#### Scenario: Colar sobre artigo com bloco de alteração
- **WHEN** o usuário cola incisos ou parágrafos com o cursor em um artigo que possui bloco de alteração
- **THEN** nenhum inciso ou parágrafo próprio é criado nesse artigo

### Requirement: Novo dispositivo a partir do fim do artigo de alteração vai para o bloco
Ao pressionar Enter no fim do texto de um artigo com bloco de alteração, o sistema SHALL criar o novo dispositivo dentro do bloco de alteração.

#### Scenario: Enter no fim do texto do artigo de alteração
- **WHEN** o cursor está no fim do texto de um artigo com bloco de alteração e o usuário pressiona Enter
- **THEN** um novo artigo é criado no início do bloco de alteração, e o artigo de alteração continua sem incisos ou parágrafos próprios

### Requirement: Norma alterada preenchida pela única remissão externa do artigo
Quando um artigo com bloco de alteração não tem norma alterada informada e passa a ter exatamente uma remissão externa no próprio texto, o sistema SHALL definir a norma alterada como a norma dessa remissão. O sistema SHALL NOT substituir uma norma alterada já informada, e SHALL NOT definir a norma alterada quando o artigo tiver duas ou mais remissões externas.

#### Scenario: Remissão automática preenche a norma alterada
- **WHEN** o usuário escreve "A Lei nº 14.133, de 1º de abril de 2021, passa a vigorar com as seguintes alterações:", cria o bloco de alteração e sai da linha, e a detecção cria a remissão externa para essa lei
- **THEN** a norma alterada do artigo passa a ser a Lei nº 14.133/2021 e o alerta "É necessário informar a norma a ser alterada" deixa de ser exibido

#### Scenario: Remissão manual preenche a norma alterada
- **WHEN** o artigo de alteração não tem norma alterada e o usuário cria manualmente, pelo diálogo de remissão, uma remissão externa para uma norma
- **THEN** a norma alterada do artigo passa a ser a norma escolhida no diálogo

#### Scenario: Norma alterada já informada é preservada
- **WHEN** o artigo de alteração já tem norma alterada e uma remissão externa para outra norma é criada no texto
- **THEN** a norma alterada permanece a mesma e o aviso de divergência passa a ser exibido

#### Scenario: Duas remissões externas não preenchem a norma alterada
- **WHEN** o artigo de alteração sem norma alterada tem duas remissões externas
- **THEN** a norma alterada continua sem valor e o alerta "É necessário informar a norma a ser alterada" continua exibido

#### Scenario: Remover a remissão não apaga a norma alterada
- **WHEN** a norma alterada foi preenchida a partir da remissão e o usuário remove essa remissão do texto
- **THEN** a norma alterada permanece como estava

#### Scenario: Desfazer o preenchimento
- **WHEN** a norma alterada foi preenchida a partir de uma remissão e o usuário aciona desfazer
- **THEN** o preenchimento é desfeito como um passo próprio do histórico e a norma alterada volta a ficar sem valor

#### Scenario: Duas citações da mesma norma não preenchem a norma alterada
- **WHEN** o artigo de alteração sem norma alterada tem duas remissões externas para a mesma norma
- **THEN** a norma alterada continua sem valor, pois a regra conta remissões e não normas distintas

### Requirement: Aviso permanente quando a norma alterada diverge da norma citada
O sistema SHALL exibir um aviso (WARNING) no artigo com bloco de alteração cuja norma alterada difere da norma da sua única remissão externa. O aviso SHALL informar a norma que o bloco altera e a norma que o artigo referencia, SHALL permanecer visível enquanto a divergência existir e SHALL NOT impedir salvar o documento. O aviso SHALL oferecer a ação "Corrigir agora", que define a norma alterada como a norma citada. O sistema SHALL NOT avaliar a divergência quando o artigo tiver duas ou mais remissões externas, nem quando não tiver norma alterada.

#### Scenario: Norma alterada diferente da norma citada
- **WHEN** o artigo tem norma alterada "Lei nº 8.666/1993" e exatamente uma remissão externa para a "Lei nº 14.133/2021"
- **THEN** o artigo exibe um aviso informando que o bloco altera a Lei nº 8.666/1993 e que o artigo referencia a Lei nº 14.133/2021

#### Scenario: Normas iguais não geram aviso
- **WHEN** a norma alterada e a norma da única remissão externa são a mesma
- **THEN** nenhum aviso de divergência é exibido

#### Scenario: Duas ou mais remissões não geram aviso
- **WHEN** o artigo tem norma alterada e duas remissões externas, ainda que nenhuma seja a norma alterada
- **THEN** nenhum aviso de divergência é exibido

#### Scenario: Corrigir agora alinha a norma alterada
- **WHEN** o usuário aciona "Corrigir agora" no aviso de divergência
- **THEN** a norma alterada passa a ser a norma da remissão, o aviso desaparece e a ação pode ser desfeita

#### Scenario: Aviso não bloqueia salvar
- **WHEN** o artigo tem o aviso de divergência e o usuário salva o documento
- **THEN** o documento é salvo normalmente

#### Scenario: Aviso aparece ao citar outra norma durante a edição
- **WHEN** o artigo tem norma alterada "Lei nº 14.133/2021", o usuário apaga a citação dessa lei, escreve a citação da "Lei nº 8.666/1993" e sai da linha
- **THEN** o artigo exibe o aviso de divergência com as duas normas, sem depender de salvar ou reabrir o documento

#### Scenario: Remissão apagada não conta para o aviso
- **WHEN** o usuário apaga a única citação do artigo e não há mais nenhuma remissão externa no texto
- **THEN** nenhum aviso de divergência é exibido

#### Scenario: Aviso permanece ao navegar entre as linhas
- **WHEN** o artigo exibe o aviso de divergência e o usuário seleciona outra linha e volta ao artigo
- **THEN** o aviso continua exibido no artigo enquanto a divergência existir

#### Scenario: Aviso permanece até a divergência acabar
- **WHEN** o usuário ignora o aviso e continua editando outros dispositivos
- **THEN** o aviso continua exibido no artigo até que a norma alterada e a norma citada passem a coincidir, ou o artigo passe a ter outro número de remissões externas

### Requirement: Abertura do documento valida a divergência sem alterar a norma alterada
Ao abrir um documento, o sistema SHALL avaliar o aviso de divergência de cada artigo com bloco de alteração. O sistema SHALL NOT alterar a norma alterada de nenhum artigo durante a abertura.

#### Scenario: Documento aberto com normas divergentes
- **WHEN** o usuário abre um documento em que um artigo de alteração tem norma alterada diferente da norma da sua única remissão externa
- **THEN** o artigo é exibido com o aviso de divergência e a norma alterada permanece como estava no arquivo

#### Scenario: Documento aberto sem norma alterada e com uma remissão
- **WHEN** o usuário abre um documento em que um artigo de alteração não tem norma alterada e tem uma remissão externa
- **THEN** a norma alterada continua sem valor e o alerta "É necessário informar a norma a ser alterada" é exibido

#### Scenario: Documento coerente abre sem avisos de divergência
- **WHEN** o usuário abre um documento em que a norma alterada de cada artigo de alteração coincide com a norma da sua única remissão externa
- **THEN** nenhum aviso de divergência é exibido

#### Scenario: Corrigir agora o erro de norma não informada com uma remissão
- **WHEN** o artigo de alteração não tem norma alterada, tem exatamente uma remissão externa e o usuário aciona "Corrigir agora"
- **THEN** a norma alterada passa a ser a da remissão, sem abrir o diálogo, e a correção pode ser desfeita

#### Scenario: Corrigir agora o erro de norma não informada sem remissão única
- **WHEN** o artigo de alteração não tem norma alterada, tem nenhuma ou duas ou mais remissões externas e o usuário aciona "Corrigir agora"
- **THEN** o diálogo de identificação da norma é aberto e a norma alterada só muda se o usuário confirmá-lo

### Requirement: Informar a norma alterada preserva a remissão externa do artigo
Ao informar a norma alterada pelo diálogo "Corrigir agora" de um artigo que já tem uma remissão externa, o sistema SHALL manter essa remissão como remissão externa, com seu comportamento de link, popup de ações e persistência, e SHALL NOT substituí-la por um link comum.

#### Scenario: Remissão continua sendo remissão após informar a norma
- **WHEN** o artigo de alteração tem uma remissão externa para uma norma e o usuário informa a norma alterada pelo diálogo "Corrigir agora"
- **THEN** o trecho continua sendo uma remissão externa (o popup de ações aparece ao posicionar o cursor sobre ele) e é gravada como remissão ao salvar

#### Scenario: Informar a norma num artigo sem texto continua gerando a frase
- **WHEN** o artigo de alteração está sem texto e o usuário informa a norma alterada pelo diálogo
- **THEN** o texto "A/O <norma>, passa a vigorar com as seguintes alterações:" é gerado com a norma citada como link, como já ocorre hoje

### Requirement: Nome da norma gerado para números compostos
O texto gerado automaticamente com o nome da norma SHALL exibir números compostos de forma legível (ex.: "Medida Provisória nº 2.158-35, de 2001") e SHALL NOT exibir "NaN".

#### Scenario: Norma com número composto
- **WHEN** a norma alterada é a Medida Provisória de URN "urn:lex:br:federal:medida.provisoria:2001;2158-35" e o sistema gera o texto com o nome dessa norma
- **THEN** o texto exibe "Medida Provisória nº 2.158-35, de 2001"

#### Scenario: Norma com número simples
- **WHEN** a norma alterada é a Lei de URN "urn:lex:br:federal:lei:2021-04-01;14133" e o sistema gera o texto com o nome dessa norma
- **THEN** o número da norma continua exibido com separador de milhar ("Lei nº 14.133")

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
