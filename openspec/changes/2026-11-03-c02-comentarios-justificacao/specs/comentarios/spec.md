## Purpose

Permite que os usuários do editor comentem trechos da justificação e conversem sobre eles em sequências de comentários (comentário inicial e respostas), sem alterar o texto da proposição. Os comentários ficam visíveis na aba "Comentários".

## ADDED Requirements

### Requirement: Aba de comentários

O painel da direita SHALL ter a aba "Comentários", antes da aba "Notas", sempre que a justificação existir (fora do modo anexo de parecer). A aba SHALL listar as sequências de comentários e, sem nenhuma, exibir "Não há comentários registrados.".

#### Scenario: Aba sem comentários

- **WHEN** a edição de uma proposição é iniciada fora do modo anexo de parecer
- **THEN** o painel da direita exibe a aba "Comentários" antes da aba "Notas"
- **AND** a aba exibe "Não há comentários registrados."

#### Scenario: Anexo de parecer

- **WHEN** a edição é iniciada no modo anexo de parecer
- **THEN** o painel da direita não exibe a aba "Comentários"

### Requirement: Adicionar comentário pela barra de ferramentas

A barra de ferramentas da justificação SHALL ter o botão "Adicionar comentário", habilitado apenas quando houver texto selecionado e nenhuma parte da seleção já estiver comentada. O botão SHALL abrir o modal "Adicionar comentário", com o trecho selecionado, um campo de até 500 caracteres com contador e os botões "Comentar" e "Cancelar". "Comentar" SHALL ficar desabilitado enquanto o campo estiver vazio ou só com espaços. Ao confirmar, o sistema SHALL criar uma sequência com um comentário do usuário atual, com a data e a hora atuais, destacar o trecho, exibir a aba "Comentários" e destacar a nova sequência.

#### Scenario: Botão sem seleção

- **WHEN** o cursor está na justificação sem texto selecionado
- **THEN** o botão "Adicionar comentário" está desabilitado

#### Scenario: Seleção já comentada

- **WHEN** a seleção inclui parte de um trecho já comentado
- **THEN** o botão "Adicionar comentário" está desabilitado

#### Scenario: Comentar um trecho

- **WHEN** o usuário seleciona um trecho sem comentário, clica em "Adicionar comentário", escreve o comentário e clica em "Comentar"
- **THEN** o trecho fica destacado como comentado
- **AND** a aba "Comentários" é exibida com a nova sequência destacada, contendo o comentário com o nome do usuário atual e a data e hora

#### Scenario: Comentário vazio

- **WHEN** o modal está aberto e o campo contém apenas espaços
- **THEN** o botão "Comentar" está desabilitado

#### Scenario: Cancelar

- **WHEN** o usuário abre o modal e clica em "Cancelar"
- **THEN** nenhuma sequência é criada e o trecho não fica destacado

### Requirement: Adicionar comentário a partir de marca de revisão

O quadro de detalhes de uma marca de revisão da justificação SHALL ter o botão "Adicionar comentário" quando nenhuma parte do texto dessa revisão estiver comentada. O botão SHALL selecionar todo o texto da revisão (todos os seus trechos, sem o texto comum entre eles) e seguir o fluxo de adicionar comentário.

#### Scenario: Comentar uma revisão

- **WHEN** o usuário abre o quadro de uma inclusão em revisão e clica em "Adicionar comentário"
- **THEN** o modal "Adicionar comentário" é aberto com o texto incluído como trecho selecionado
- **AND** ao confirmar, o texto incluído fica destacado como comentado

#### Scenario: Revisão já comentada

- **WHEN** parte do texto de uma revisão já está comentada
- **THEN** o quadro de detalhes dessa revisão não exibe o botão "Adicionar comentário"

### Requirement: Destaque do trecho comentado

O trecho comentado SHALL ser exibido com fundo amarelo claro e, com o cursor sobre ele, com fundo amarelo escuro. Ao fim do trecho SHALL haver um ícone que, ao ser clicado, exibe a aba "Comentários" e destaca a sequência do trecho. O destaque MUST NOT esconder as marcas de revisão contidas no trecho.

#### Scenario: Cursor no trecho comentado

- **WHEN** o usuário posiciona o cursor dentro de um trecho comentado
- **THEN** o trecho passa a ter fundo amarelo escuro

#### Scenario: Ícone do comentário

- **WHEN** o usuário clica no ícone ao fim de um trecho comentado
- **THEN** a aba "Comentários" é exibida e a sequência do trecho fica destacada

#### Scenario: Revisão dentro do trecho

- **WHEN** um trecho comentado contém um texto excluído em revisão
- **THEN** o traço vermelho da exclusão continua visível sobre o fundo amarelo

### Requirement: Exibição da sequência de comentários

Cada sequência SHALL exibir o local ("Na justificação"), o texto do trecho comentado, o botão "Responder" e o botão de excluir a sequência. Cada comentário da sequência SHALL exibir o nome do autor, a data e a hora no formato dd/mm/aaaa hh:mm e o texto, preservando as quebras de linha. Os botões "Editar" e "Excluir" de um comentário SHALL aparecer apenas para o autor; "Excluir" só aparece quando a sequência tem mais de um comentário.

#### Scenario: Comentário de outro usuário

- **WHEN** a sequência contém um comentário de outro usuário
- **THEN** esse comentário não exibe os botões "Editar" e "Excluir"

#### Scenario: Único comentário do próprio usuário

- **WHEN** a sequência contém um único comentário, do usuário atual
- **THEN** o comentário exibe "Editar" e não exibe "Excluir"

#### Scenario: Quebras de linha

- **WHEN** um comentário foi escrito em duas linhas
- **THEN** a aba exibe o comentário nas mesmas duas linhas

### Requirement: Autoria do comentário

O autor de um comentário SHALL ser o usuário atual do editor no momento em que o comentário é criado. Um comentário SHALL ser considerado do usuário atual quando o identificador do autor for igual ao do usuário atual ou, sem identificador, quando os nomes forem iguais.

#### Scenario: Usuário identificado pelo host

- **WHEN** o host informou um usuário com identificador e esse usuário cria um comentário
- **THEN** o comentário é exibido com os botões "Editar" para esse usuário

#### Scenario: Outro usuário com o mesmo nome

- **WHEN** um comentário tem autor com identificador diferente do usuário atual, mas com o mesmo nome
- **THEN** o comentário não é considerado do usuário atual

### Requirement: Editar comentário

O botão "Editar" SHALL abrir o modal "Editar comentário" com o texto atual. Ao confirmar, o sistema SHALL substituir o texto do comentário, mantendo o autor e a data.

#### Scenario: Editar o próprio comentário

- **WHEN** o usuário clica em "Editar" no próprio comentário, altera o texto e clica em "Comentar"
- **THEN** a aba exibe o novo texto no mesmo comentário, com o autor e a data originais

### Requirement: Responder comentário

O botão "Responder" SHALL abrir o modal "Responder comentário". Ao confirmar, o sistema SHALL acrescentar à sequência, como último comentário, uma resposta do usuário atual com a data e a hora atuais.

#### Scenario: Responder uma sequência

- **WHEN** o usuário clica em "Responder", escreve a resposta e clica em "Comentar"
- **THEN** a resposta aparece como último comentário da sequência, com o nome do usuário atual

### Requirement: Excluir sequência de comentários

Qualquer usuário SHALL poder excluir uma sequência. O sistema SHALL pedir confirmação ("Excluir esta sequência de comentários?", com "Excluir" e "Cancelar") e, ao confirmar, remover a sequência da aba e o destaque do trecho.

#### Scenario: Excluir sequência

- **WHEN** o usuário clica no botão de excluir sequência e confirma
- **THEN** a sequência some da aba e o trecho deixa de estar destacado, sem alteração no texto

#### Scenario: Cancelar exclusão

- **WHEN** o usuário clica no botão de excluir sequência e cancela
- **THEN** a sequência e o destaque continuam

### Requirement: Excluir comentário

O botão "Excluir" de um comentário SHALL pedir confirmação ("Excluir este comentário?", com "Excluir" e "Cancelar") e, ao confirmar, remover só esse comentário da sequência.

#### Scenario: Excluir uma resposta

- **WHEN** a sequência tem dois comentários e o autor do segundo o exclui, confirmando
- **THEN** a sequência continua na aba apenas com o primeiro comentário

### Requirement: Sequência removida com o trecho

Quando o texto de um trecho comentado for apagado por inteiro, o sistema SHALL remover a sequência da aba. Desfazer a exclusão do texto SHALL restaurar o texto sem o destaque e sem recriar a sequência. Excluir uma sequência e depois desfazer a última edição do texto MUST NOT recriar o destaque.

#### Scenario: Apagar o trecho

- **WHEN** o usuário apaga todo o texto de um trecho comentado
- **THEN** a sequência some da aba

#### Scenario: Desfazer depois de apagar

- **WHEN** o usuário apaga um trecho comentado e depois desfaz
- **THEN** o texto volta sem destaque de comentário e a sequência não volta à aba

#### Scenario: Apagar parte do trecho

- **WHEN** o usuário apaga só parte do texto de um trecho comentado
- **THEN** a sequência continua na aba e o restante do trecho continua destacado

### Requirement: Comentário sobre marcas de revisão

Aceitar ou rejeitar uma revisão contida num trecho comentado SHALL manter o comentário e o destaque do texto que permanecer. Excluir em modo de revisão um trecho comentado SHALL manter o comentário, porque o texto continua no documento como exclusão.

#### Scenario: Aceitar inclusão dentro do trecho

- **WHEN** um trecho comentado contém uma inclusão em revisão e o usuário aceita a revisão
- **THEN** o trecho continua destacado e a sequência continua na aba

#### Scenario: Rejeitar exclusão dentro do trecho

- **WHEN** um trecho comentado contém uma exclusão em revisão e o usuário rejeita a revisão
- **THEN** o trecho continua destacado e a sequência continua na aba

#### Scenario: Excluir trecho comentado em revisão

- **WHEN** o modo de revisão está ativo e o usuário apaga um trecho comentado
- **THEN** o trecho é marcado como excluído, continua destacado e a sequência continua na aba

### Requirement: Ordenação das sequências

A aba SHALL permitir ordenar as sequências pela "Ordem no texto" (padrão), pela posição do trecho na justificação, ou pelos "Mais recentes", pela data do último comentário de cada sequência, da mais recente para a mais antiga.

#### Scenario: Ordem no texto

- **WHEN** existem dois trechos comentados e o segundo foi comentado primeiro
- **THEN** com "Ordem no texto" a sequência do trecho que aparece antes no texto vem primeiro

#### Scenario: Mais recentes considerando respostas

- **WHEN** a sequência mais antiga recebe uma resposta depois da criação da outra
- **THEN** com "Mais recentes" a sequência que recebeu a resposta vem primeiro

### Requirement: Destaque da sequência do trecho sob o cursor

Com a aba "Comentários" exibida, posicionar o cursor num trecho comentado SHALL destacar a sequência desse trecho e rolar a lista até ela. Tirar o cursor de trechos comentados SHALL retirar o destaque.

#### Scenario: Cursor no trecho

- **WHEN** a aba "Comentários" está exibida e o usuário posiciona o cursor num trecho comentado
- **THEN** a sequência do trecho fica destacada e visível na lista

#### Scenario: Cursor fora do trecho

- **WHEN** uma sequência está destacada pelo cursor e o usuário move o cursor para texto sem comentário
- **THEN** nenhuma sequência fica destacada

### Requirement: Seleção da sequência na aba

Clicar numa sequência SHALL destacá-la, exibir a aba da justificação e posicionar o cursor no início do trecho comentado. Com o foco numa sequência, as setas para cima e para baixo SHALL selecionar a sequência anterior e a seguinte da lista. Clicar num botão da sequência MUST NOT selecioná-la.

#### Scenario: Clicar numa sequência

- **WHEN** a aba da justificação não está exibida e o usuário clica numa sequência
- **THEN** a aba da justificação é exibida, com o cursor no início do trecho comentado, e a sequência fica destacada

#### Scenario: Navegar pelo teclado

- **WHEN** o foco está na primeira sequência da lista e o usuário pressiona a seta para baixo
- **THEN** a segunda sequência fica destacada e com o foco

### Requirement: Copiar e colar sem comentário

Copiar um trecho comentado e colá-lo SHALL colar só o texto, sem destaque e sem criar sequência.

#### Scenario: Colar trecho comentado

- **WHEN** o usuário copia um trecho comentado e o cola em outro ponto da justificação
- **THEN** o texto colado não fica destacado e a aba continua com uma única sequência para o trecho original

### Requirement: Texto entregue ao host sem marcação de comentário

O texto da justificação entregue ao host na proposição SHALL NOT conter a marcação de trecho comentado. O texto do trecho MUST ser preservado.

#### Scenario: Proposição com trecho comentado

- **WHEN** a justificação tem um trecho comentado e o host obtém a proposição
- **THEN** o texto da justificação contém o texto do trecho, sem a marcação de comentário

### Requirement: Comentários restritos ao documento em edição

Ao iniciar a edição de outro documento ou fechar o documento, o sistema SHALL descartar as sequências de comentários do documento anterior.

#### Scenario: Abrir outro documento

- **WHEN** há comentários no documento em edição e o usuário abre outro documento
- **THEN** a aba "Comentários" exibe "Não há comentários registrados."
