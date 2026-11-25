# Spec Delta

## Purpose

Define o controle de revisão da articulação: quais ações do usuário geram revisão, como as revisões se mantêm coerentes com o histórico de desfazer e refazer, como a revisão da ementa convive com as dos dispositivos e quais remoções o modo de revisão impede.

## ADDED Requirements

### Requirement: Sincronizar a marcação de remissão não gera revisão
Quando o texto de um dispositivo muda só na marcação das remissões, como quando o editor desenha ou retira os links de remissão interna ou externa, o sistema SHALL NOT criar revisão nem acrescentar operação a uma revisão existente. A descrição e as ações oferecidas pela marca de revisão do dispositivo SHALL ficar como estavam.

#### Scenario: Visitar um dispositivo com citação de norma
- **WHEN** a revisão está ativa, o usuário entra num artigo que cita uma lei, o editor desenha o link da remissão externa e o usuário sai da linha sem digitar
- **THEN** o artigo não recebe marca de revisão

#### Scenario: Visitar um dispositivo com citação logo depois de outra ação
- **WHEN** a revisão está ativa, o usuário adiciona um artigo e em seguida entra e sai, sem digitar, de outro artigo que cita uma lei
- **THEN** só o artigo adicionado tem marca de revisão

#### Scenario: Primeira ação da sessão de revisão
- **WHEN** a revisão é ativada com o histórico de desfazer vazio e a primeira linha que o usuário deixa é a de um artigo que cita uma lei, sem digitar
- **THEN** nenhum erro ocorre e nenhuma revisão é criada

#### Scenario: Dispositivo que já tem revisão
- **WHEN** um artigo já tem revisão de texto alterado e o editor só redesenha o link de uma remissão nele
- **THEN** a revisão continua com as mesmas operações e a mesma descrição

#### Scenario: Adicionar um dispositivo com o cursor num artigo que tem link de remissão
- **WHEN** a revisão está ativa, o cursor está num artigo cujo texto tem um link de remissão desenhado pelo editor e o usuário adiciona um artigo depois dele pelo menu
- **THEN** só o artigo adicionado tem marca de revisão, e o artigo onde estava o cursor continua sem marca

#### Scenario: Adicionar um dispositivo depois de alterar de fato o texto do atual
- **WHEN** a revisão está ativa, o usuário acrescenta texto a um artigo e adiciona um artigo depois dele
- **THEN** o artigo alterado também tem marca de revisão de texto alterado

### Requirement: Revisão de modificação guarda o estado anterior
Toda revisão de texto alterado SHALL guardar o estado do dispositivo antes da alteração. O sistema SHALL NOT criar uma revisão de modificação sem esse estado, para que recusá-la sempre devolva o dispositivo ao que era.

#### Scenario: Alterar e recusar
- **WHEN** a revisão está ativa, o usuário altera o texto do Art. 2º e recusa a revisão
- **THEN** o Art. 2º volta ao texto anterior e a marca de revisão some

#### Scenario: Alterar depois de outra ação
- **WHEN** a revisão está ativa, o usuário adiciona um artigo, altera o texto do Art. 3º e recusa a revisão do Art. 3º
- **THEN** o Art. 3º volta ao texto anterior, e o artigo adicionado continua com a marca dele

### Requirement: Desfazer a primeira ação feita em revisão
Desfazer uma ação feita em modo de revisão SHALL remover a marca de revisão que ela criou, sem erro, inclusive quando a revisão foi ativada com o histórico de desfazer vazio e a ação desfeita é a primeira da sessão.

#### Scenario: Desfazer a primeira edição de texto
- **WHEN** um documento é aberto, a revisão é ativada sem nenhuma ação anterior, o usuário altera o texto de um artigo e desfaz
- **THEN** o texto volta ao anterior, o artigo fica sem marca de revisão e nenhum erro ocorre

#### Scenario: Desfazer a primeira renumeração
- **WHEN** um documento é aberto, a revisão é ativada sem nenhuma ação anterior, o usuário renumera um artigo e desfaz
- **THEN** o rótulo volta ao anterior, o artigo fica sem marca de revisão e nenhum erro ocorre

### Requirement: Revisão da ementa não impede as demais ações em revisão
Enquanto houver revisão do texto da ementa, o sistema SHALL continuar permitindo, em modo de revisão, adicionar, remover e mover dispositivos e aceitar ou recusar as revisões dos demais dispositivos, com o mesmo resultado que teriam sem a revisão da ementa.

#### Scenario: Recusar um artigo adicionado depois de alterar a ementa
- **WHEN** a revisão está ativa, o usuário adiciona um artigo antes do Art. 1º, altera o texto da ementa e recusa a revisão do artigo adicionado
- **THEN** o artigo adicionado sai do texto, os demais são renumerados e a revisão da ementa continua

#### Scenario: Aceitar um artigo adicionado depois de alterar a ementa
- **WHEN** a revisão está ativa, o usuário adiciona um artigo antes do Art. 1º, altera o texto da ementa e aceita a revisão do artigo adicionado
- **THEN** o artigo continua no texto sem marca de revisão, e a revisão da ementa continua

#### Scenario: Adicionar e remover dispositivos com a ementa alterada
- **WHEN** a revisão está ativa, a ementa tem revisão de texto alterado e o usuário adiciona um artigo e depois remove outro
- **THEN** as duas ações são feitas e ganham as suas marcas de revisão

#### Scenario: Aceitar a ementa e depois recusar o artigo
- **WHEN** a revisão está ativa, o usuário adiciona um artigo antes do Art. 1º, altera o texto da ementa, aceita a revisão da ementa e depois recusa a do artigo adicionado
- **THEN** o artigo adicionado sai do texto e não resta nenhuma marca de revisão

### Requirement: Remoção impedida para dispositivo com subordinado revisado
Em modo de revisão, o sistema SHALL impedir a remoção de um dispositivo que tenha, entre os seus subordinados, algum removido ou alterado durante a revisão. Os subordinados SHALL incluir os dispositivos de bloco de alteração do dispositivo, em qualquer nível.

#### Scenario: Artigo com inciso removido em revisão
- **WHEN** a revisão está ativa, o usuário remove o inciso I do Art. 2º e depois tenta remover o Art. 2º
- **THEN** o Art. 2º não é removido e o editor informa que não é possível remover dispositivo que possua dispositivo subordinado já removido ou alterado em modo de revisão

#### Scenario: Artigo com dispositivo removido no bloco de alteração
- **WHEN** a revisão está ativa, o usuário remove o Art. 1º da norma alterada no bloco de alteração do Art. 1º da proposição e depois tenta remover o Art. 1º da proposição
- **THEN** o Art. 1º da proposição não é removido, e recusar ou aceitar a revisão do dispositivo da norma alterada continua funcionando

#### Scenario: Artigo sem subordinado revisado
- **WHEN** a revisão está ativa e nenhum subordinado do Art. 3º foi removido ou alterado em revisão
- **THEN** o Art. 3º pode ser removido, como antes

### Requirement: Comandos de remoção indisponíveis quando a remoção é impedida
Quando a remoção de um dispositivo está impedida pela regra de subordinado revisado, o menu do dispositivo SHALL NOT oferecer a opção "Remover", e o atalho Ctrl+D SHALL NOT remover o dispositivo.

#### Scenario: Menu de artigo com subordinado removido
- **WHEN** a revisão está ativa, o inciso I do Art. 2º foi removido em revisão e o usuário abre o menu do Art. 2º
- **THEN** o menu não tem a opção "Remover"

#### Scenario: Ctrl+D em artigo com subordinado removido
- **WHEN** a revisão está ativa, o inciso I do Art. 2º foi removido em revisão, o cursor está no Art. 2º e o usuário tecla Ctrl+D
- **THEN** o Art. 2º não é removido

#### Scenario: Remoção volta a ser possível
- **WHEN** a revisão do inciso removido do Art. 2º é aceita ou recusada e o usuário abre o menu do Art. 2º
- **THEN** o menu volta a oferecer "Remover"
