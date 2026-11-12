## ADDED Requirements

### Requirement: Sequência atual ao trocar de aba

Exibir no painel da esquerda outra aba, ou no painel da direita uma aba diferente de "Comentários", SHALL desfazer a seleção da sequência atual e retirar o destaque do trecho comentado. Isso MUST NOT acontecer quando a troca de aba resulta de clicar numa sequência, que exibe a aba da justificação.

#### Scenario: Trocar a aba da direita

- **WHEN** uma sequência está destacada e o usuário exibe a aba "Notas"
- **THEN** nenhuma sequência fica destacada e o trecho comentado perde o destaque de selecionado

#### Scenario: Trocar a aba da esquerda

- **WHEN** uma sequência está destacada e o usuário exibe a aba "Avisos"
- **THEN** nenhuma sequência fica destacada

#### Scenario: Clicar numa sequência com outra aba à esquerda

- **WHEN** a aba "Texto" está exibida e o usuário clica numa sequência
- **THEN** a aba da justificação é exibida e a sequência continua destacada

### Requirement: Rolagem até a sequência atual

Exibir a aba "Comentários" com uma sequência atual SHALL rolar a lista até essa sequência. Depois de criar um comentário, o sistema SHALL posicionar o cursor no início do trecho comentado e rolar a lista até a nova sequência. A rolagem SHALL deixar o início da sequência a cerca de um quarto da altura visível da lista.

#### Scenario: Voltar à aba de comentários

- **WHEN** o cursor está num trecho comentado cuja sequência fica fora da área visível da lista e o usuário exibe a aba "Comentários"
- **THEN** a sequência do trecho fica visível na lista

#### Scenario: Criar comentário com muitas sequências

- **WHEN** a lista tem sequências suficientes para rolar e o usuário cria um comentário num trecho do fim da justificação
- **THEN** a nova sequência fica destacada e visível na lista
- **AND** o cursor fica no início do trecho comentado

### Requirement: Comentários em telas pequenas

Com a janela de até 992px de largura, a barra da justificação SHALL exibir o botão "Comentários", que abre um modal com a lista de comentários (mesmo conteúdo da aba e botão "Fechar"). Nessa largura, criar um comentário e clicar no ícone de um trecho comentado SHALL abrir esse modal, no lugar de só exibir a aba "Comentários". Clicar numa sequência do modal SHALL fechá-lo e seguir a seleção da sequência na aba. Acima de 992px o botão MUST NOT ser exibido. Com a janela de até 768px de largura, o painel da direita MUST NOT ser exibido.

#### Scenario: Botão em tela pequena

- **WHEN** a janela tem 900px de largura
- **THEN** a barra da justificação exibe o botão "Comentários"
- **AND** clicar nele abre o modal com a lista de comentários

#### Scenario: Botão em tela grande

- **WHEN** a janela tem 1280px de largura
- **THEN** a barra da justificação não exibe o botão "Comentários"

#### Scenario: Ícone do trecho em tela pequena

- **WHEN** a janela tem 900px de largura e o usuário clica no ícone ao fim de um trecho comentado
- **THEN** o modal com a lista de comentários é aberto, com a sequência do trecho destacada

#### Scenario: Criar comentário em tela pequena

- **WHEN** a janela tem 900px de largura e o usuário cria um comentário
- **THEN** o modal com a lista de comentários é aberto, com a nova sequência destacada

#### Scenario: Selecionar sequência no modal

- **WHEN** o modal da lista está aberto e o usuário clica numa sequência
- **THEN** o modal é fechado e o cursor fica no início do trecho comentado

#### Scenario: Painel da direita em tela de celular

- **WHEN** a janela tem 700px de largura
- **THEN** o painel da direita não é exibido e a lista de comentários continua acessível pelo botão "Comentários"

## MODIFIED Requirements

### Requirement: Destaque do trecho comentado

O trecho comentado SHALL ser exibido com fundo amarelo claro e, com o cursor sobre ele, com fundo amarelo escuro, inclusive quando estiver dentro de um texto excluído em revisão. Ao fim do trecho SHALL haver um ícone que, ao ser clicado, exibe a aba "Comentários" (em telas pequenas, o modal da lista) e destaca a sequência do trecho. O destaque MUST NOT esconder as marcas de revisão contidas no trecho.

#### Scenario: Cursor no trecho comentado

- **WHEN** o usuário posiciona o cursor dentro de um trecho comentado
- **THEN** o trecho passa a ter fundo amarelo escuro

#### Scenario: Cursor no trecho comentado dentro de exclusão

- **WHEN** um trecho comentado está dentro de um texto excluído em revisão e o usuário posiciona o cursor nele
- **THEN** o trecho passa a ter fundo amarelo escuro e o traço vermelho da exclusão continua visível

#### Scenario: Ícone do comentário

- **WHEN** a janela tem mais de 992px de largura e o usuário clica no ícone ao fim de um trecho comentado
- **THEN** a aba "Comentários" é exibida e a sequência do trecho fica destacada

#### Scenario: Revisão dentro do trecho

- **WHEN** um trecho comentado contém um texto excluído em revisão
- **THEN** o traço vermelho da exclusão continua visível sobre o fundo amarelo

### Requirement: Excluir sequência de comentários

Qualquer usuário SHALL poder excluir uma sequência. O sistema SHALL pedir confirmação ("Excluir esta sequência de comentários?", com o aviso "Esta ação removerá todos os comentários e respostas associados ao trecho. Essa operação não poderá ser desfeita." e os botões "Excluir" e "Cancelar") e, ao confirmar, remover a sequência da aba e o destaque do trecho.

#### Scenario: Excluir sequência

- **WHEN** o usuário clica no botão de excluir sequência e confirma
- **THEN** a sequência some da aba e o trecho deixa de estar destacado, sem alteração no texto

#### Scenario: Aviso da confirmação

- **WHEN** o usuário clica no botão de excluir sequência
- **THEN** a confirmação exibe "Esta ação removerá todos os comentários e respostas associados ao trecho. Essa operação não poderá ser desfeita."

#### Scenario: Cancelar exclusão

- **WHEN** o usuário clica no botão de excluir sequência e cancela
- **THEN** a sequência e o destaque continuam

### Requirement: Excluir comentário

O botão "Excluir" de um comentário SHALL pedir confirmação ("Excluir este comentário?", com o aviso "Esta ação removerá apenas este comentário da sequência. O trecho comentado e as demais respostas serão mantidos." e os botões "Excluir" e "Cancelar") e, ao confirmar, remover só esse comentário da sequência.

#### Scenario: Excluir uma resposta

- **WHEN** a sequência tem dois comentários e o autor do segundo o exclui, confirmando
- **THEN** a sequência continua na aba apenas com o primeiro comentário

#### Scenario: Aviso da confirmação

- **WHEN** o usuário clica em "Excluir" num comentário
- **THEN** a confirmação exibe "Esta ação removerá apenas este comentário da sequência. O trecho comentado e as demais respostas serão mantidos."
