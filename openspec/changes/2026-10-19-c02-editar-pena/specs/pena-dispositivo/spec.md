## Purpose

Define como o editor representa, exibe, edita, valida, revisa e persiste o dispositivo "Pena" da técnica legislativa penal (penas, penalidades, medidas administrativas, infrações), dentro e fora de bloco de alteração de norma, e como ele convive com as operações existentes sobre dispositivos.

## ADDED Requirements

### Requirement: Estrutura da pena
A pena SHALL ser um dispositivo subordinado a um Caput, Parágrafo, Inciso, Alínea ou Item (o dono), com no máximo uma pena por dono, e SHALL ser sempre o último filho do dono, depois de todos os demais filhos, inclusive omissis. O identificador da pena SHALL ser `<identificador do dono>_pena`. A pena do artigo SHALL pertencer ao seu Caput.

#### Scenario: Pena de parágrafo com incisos
- **WHEN** o § 2º do art. 2 tem os incisos I e II e uma pena
- **THEN** a pena é o último filho do § 2º, depois do inciso II, e tem o identificador `art2_par2_pena`

#### Scenario: Pena do artigo
- **WHEN** o usuário adiciona uma pena ao art. 1, que tem incisos no caput e parágrafos
- **THEN** a pena pertence ao caput, tem o identificador `art1_cpt_pena` e fica depois do último inciso do caput e antes do § 1º

#### Scenario: Pena depois de omissis
- **WHEN** um parágrafo de bloco de alteração tem incisos, um omissis e uma pena
- **THEN** a pena fica depois do omissis

### Requirement: Exibição da pena abaixo da subárvore do dono
O editor SHALL exibir a pena em linha própria, imediatamente depois do último descendente do dono na ordem de leitura, com o rótulo seguido do texto, como na lei impressa.

#### Scenario: Pena de inciso
- **WHEN** o art. 197 tem os incisos I e II do caput, cada um com uma pena
- **THEN** o editor exibe, nesta ordem, o inciso I, a pena do inciso I, o inciso II e a pena do inciso II

#### Scenario: Pena de parágrafo com incisos
- **WHEN** o § 2º tem os incisos I a V e uma pena
- **THEN** a linha da pena aparece depois do inciso V e antes do dispositivo seguinte ao § 2º

### Requirement: Adicionar pena
O editor SHALL oferecer, no menu do Caput (pelo menu do artigo), do Parágrafo, do Inciso, da Alínea e do Item que não têm pena, a ação "Adicionar pena, medida administrativa e outros", dentro e fora de bloco de alteração de norma. O editor SHALL NOT oferecer a ação em dispositivo bloqueado, em dispositivo marcado como removido em revisão, em omissis nem no artigo que carrega bloco de alteração. Se o documento já tem alguma pena, a nova pena SHALL usar o rótulo da primeira pena do documento na ordem de leitura; caso contrário, o editor SHALL abrir o modal de rótulo com "Pena" selecionado e só criar a pena ao confirmar. Depois de criada, o cursor SHALL ficar no texto da pena.

#### Scenario: Primeira pena do documento
- **WHEN** o usuário escolhe "Adicionar pena, medida administrativa e outros" no menu de um inciso e o documento não tem pena
- **THEN** o modal de rótulo abre com "Pena" selecionado; ao confirmar, a pena "Pena –" é criada como último filho do inciso e o cursor fica no texto da pena

#### Scenario: Documento que já tem pena
- **WHEN** a primeira pena do documento tem o rótulo "Infração –" e o usuário adiciona uma pena a um parágrafo
- **THEN** a pena é criada com o rótulo "Infração –", sem abrir o modal

#### Scenario: Cancelar o modal
- **WHEN** o documento não tem pena, o usuário escolhe adicionar e cancela o modal
- **THEN** nenhuma pena é criada e nenhum passo é registrado no histórico

#### Scenario: Dono que já tem pena
- **WHEN** o usuário abre o menu de um parágrafo que já tem pena
- **THEN** a ação de adicionar pena não é oferecida

#### Scenario: Pena pelo menu do artigo
- **WHEN** o usuário adiciona uma pena pelo menu de um artigo
- **THEN** a pena é criada no caput do artigo

#### Scenario: Caput omissis em bloco de alteração
- **WHEN** o artigo de um bloco de alteração tem o caput em omissis ("Art. 213. ..........") e o usuário adiciona uma pena pelo menu do artigo
- **THEN** a pena é criada no caput, depois do omissis do caput

### Requirement: Remover pena
O editor SHALL oferecer a ação "Remover" no menu da pena, e também SHALL remover a pena pelas mesmas formas de remoção dos demais dispositivos (Ctrl+D, Backspace ou Delete com o texto vazio). Remover a pena SHALL NOT alterar o dono nem os seus demais filhos.

#### Scenario: Remover pelo menu
- **WHEN** o usuário escolhe "Remover" no menu da pena de um inciso
- **THEN** a pena deixa de existir e o inciso permanece como estava

#### Scenario: Remover com texto vazio
- **WHEN** o texto da pena está vazio e o usuário pressiona Backspace
- **THEN** a pena é removida

### Requirement: Alterar rótulo da pena
O editor SHALL oferecer a ação "Alterar rótulo" no menu da pena e ao clicar no rótulo da pena, dentro e fora de bloco de alteração. A ação SHALL abrir um modal com as opções "Pena", "Penalidade", "Medida Administrativa", "Infração" e "Outro"; com "Outro", uma caixa de texto de preenchimento obrigatório SHALL definir o rótulo, e o modal SHALL NOT permitir confirmar com ela vazia. O modal SHALL abrir com a opção correspondente ao rótulo atual selecionada, comparando sem diferenciar maiúsculas e minúsculas, ou com "Outro" e o texto atual quando o rótulo não estiver na lista. A alteração SHALL valer só para a pena escolhida, e o rótulo SHALL ser sempre exibido e gravado seguido de espaço e travessão ("Pena –").

#### Scenario: Trocar o rótulo
- **WHEN** o usuário clica no rótulo "Pena –" e escolhe "Medida Administrativa"
- **THEN** a pena passa a exibir "Medida Administrativa –" e as demais penas do documento não mudam

#### Scenario: Rótulo livre
- **WHEN** o usuário escolhe "Outro" e informa "Sanção"
- **THEN** a pena passa a exibir "Sanção –"

#### Scenario: Outro sem texto
- **WHEN** o usuário escolhe "Outro" e deixa a caixa de texto vazia
- **THEN** o modal não permite confirmar

#### Scenario: Confirmar sem alterar
- **WHEN** o usuário abre o modal e confirma o mesmo rótulo
- **THEN** nenhum passo é registrado no histórico nem gerada revisão

### Requirement: Edição do texto da pena
O texto da pena SHALL ser editado inline, como o dos demais dispositivos, e SHALL aceitar as mesmas formatações e remissões no texto.

#### Scenario: Digitar o texto
- **WHEN** o usuário digita "reclusão, de seis a vinte anos." na linha da pena
- **THEN** o texto da pena é atualizado e o rótulo permanece inalterado

### Requirement: Validação do texto da pena
O sistema SHALL exibir mensagem de erro, como nos demais dispositivos, quando o texto da pena estiver vazio e quando não começar com letra minúscula, a não ser que se trate de uma situação especial, como nome próprio. A verificação da inicial SHALL ignorar formatação e espaços iniciais. O sistema SHALL NOT exigir pontuação final no texto da pena.

#### Scenario: Pena sem texto
- **WHEN** a pena tem o texto vazio
- **THEN** é exibida a mensagem de que não foi informado o texto do dispositivo

#### Scenario: Pena iniciando em maiúscula
- **WHEN** o texto da pena é "Reclusão, de seis a vinte anos."
- **THEN** é exibida a mensagem de que o texto deveria iniciar com letra minúscula

#### Scenario: Pena válida
- **WHEN** o texto da pena é "detenção, de um mês a um ano, e multa;"
- **THEN** nenhuma mensagem de validação é exibida para a pena

### Requirement: Pontuação do dispositivo anterior à pena
O dispositivo imediatamente anterior à pena na ordem de leitura SHALL terminar com dois-pontos, fora e dentro de bloco de alteração de norma, e o sistema SHALL exibir mensagem de erro quando não terminar. Esse dispositivo SHALL NOT receber a exigência de terminar com ponto ou ponto e vírgula que valeria por ser o último de uma enumeração. A regra SHALL NOT se aplicar quando o texto desse dispositivo é omissis.

#### Scenario: Dono sem outros filhos
- **WHEN** o caput "Matar alguém:" tem só a pena
- **THEN** nenhuma mensagem de pontuação é exibida para o caput

#### Scenario: Último inciso antes da pena do parágrafo
- **WHEN** o § 2º tem os incisos I a V e uma pena, e o inciso V termina com "outro crime:"
- **THEN** nenhuma mensagem de pontuação é exibida para o inciso V

#### Scenario: Último inciso terminado em ponto antes da pena
- **WHEN** o § 2º tem os incisos I e II e uma pena, e o inciso II termina com "segundo inciso."
- **THEN** é exibida a mensagem de que o inciso II deveria terminar com dois-pontos

#### Scenario: Caput omissis antes da pena
- **WHEN** o caput de um artigo de bloco de alteração é omissis e é seguido da pena
- **THEN** nenhuma mensagem de pontuação é exibida para o caput

### Requirement: Pena preservada nas operações sobre dispositivos
O sistema SHALL manter a pena como último filho do dono em todas as operações. Incluir um filho no dono, por qualquer caminho (menu, Enter, colar, desfazer, refazer, rejeitar revisão), SHALL inserir o filho antes da pena. A pena SHALL NOT ser movida, transformada em outro tipo, renumerada, convertida em omissis nem ter um omissis inserido depois dela no mesmo dono. Mover, transformar ou remover o dono SHALL levar a pena junto, e transformar Parágrafo em Artigo ou Artigo em Parágrafo SHALL manter a pena como último filho do novo dono (o Caput do artigo ou o parágrafo).

#### Scenario: Incluir inciso em parágrafo com pena
- **WHEN** o § 2º tem os incisos I e II e uma pena, e o usuário adiciona um inciso depois do inciso II
- **THEN** o inciso III é criado antes da pena

#### Scenario: Mover inciso para baixo
- **WHEN** o inciso II é o último inciso de um parágrafo com pena e o usuário tenta movê-lo para baixo
- **THEN** a ação de mover para baixo não é oferecida e o inciso não passa para depois da pena

#### Scenario: Ações não oferecidas na pena
- **WHEN** o usuário abre o menu da pena
- **THEN** as ações de mover, transformar, renumerar, converter em omissis e adicionar omissis não são oferecidas

#### Scenario: Mover o dono
- **WHEN** o usuário move um inciso que tem pena para outra posição
- **THEN** a pena acompanha o inciso e continua sendo o seu último filho

#### Scenario: Transformar o dono
- **WHEN** o usuário transforma em alínea um inciso que tem pena
- **THEN** a pena passa a ser o último filho da alínea

#### Scenario: Transformar parágrafo em artigo
- **WHEN** o usuário transforma em artigo um parágrafo que tem incisos e pena
- **THEN** a pena passa a ser o último filho do caput do novo artigo

#### Scenario: Remover o dono
- **WHEN** o usuário remove um parágrafo que tem pena
- **THEN** a pena é removida junto

#### Scenario: Desfazer e refazer
- **WHEN** o usuário adiciona uma pena, altera o seu rótulo e o seu texto, e desfaz e refaz cada passo
- **THEN** cada passo é desfeito e refeito isoladamente, e a pena volta a ser exibida na mesma posição

### Requirement: Teclado na linha da pena
Na linha da pena, Enter com o cursor no fim do texto SHALL criar um novo dispositivo do mesmo tipo do dono, logo depois do dono e da sua pena; quando o dono é o Caput, SHALL criar o primeiro parágrafo do artigo, antes dos parágrafos existentes. Enter com o cursor antes do fim do texto SHALL NOT ter efeito. Tab, Shift+Tab e os atalhos de mover SHALL NOT ter efeito na pena. Enter no fim de um dono que tem pena e cujo texto termina com dois-pontos SHALL criar o primeiro filho antes da pena.

#### Scenario: Enter na pena do inciso
- **WHEN** o cursor está no fim do texto da pena do inciso I e o usuário pressiona Enter
- **THEN** o inciso II é criado logo depois da pena do inciso I, e os incisos seguintes são renumerados

#### Scenario: Enter na pena do caput
- **WHEN** o artigo tem pena no caput e o § 1º, o cursor está no fim do texto da pena e o usuário pressiona Enter
- **THEN** um novo § 1º é criado logo depois da pena, e o parágrafo existente passa a ser o § 2º

#### Scenario: Enter no meio do texto da pena
- **WHEN** o cursor está no meio do texto da pena e o usuário pressiona Enter
- **THEN** nada acontece

#### Scenario: Enter no dono terminado em dois-pontos
- **WHEN** o parágrafo "Se o homicídio é cometido:" tem só a pena, o cursor está no fim do texto do parágrafo e o usuário pressiona Enter
- **THEN** o inciso I é criado antes da pena

### Requirement: Pena em bloco de alteração de norma
Dentro de bloco de alteração de norma, a pena SHALL se comportar como os demais dispositivos do bloco quanto à situação na norma alterada (existente ou novo) e, quando for o último dispositivo do bloco, SHALL exibir o fechamento de aspas e a nota de alteração na sua linha.

#### Scenario: Pena como último dispositivo do bloco
- **WHEN** o último dispositivo de um bloco de alteração é a pena do caput de um artigo
- **THEN** o fechamento de aspas e a nota de alteração aparecem na linha da pena

#### Scenario: Situação na norma alterada
- **WHEN** o usuário marca a pena de um dispositivo de alteração como existente na norma alterada, salva e reabre o documento
- **THEN** a pena reaberta continua marcada como existente

### Requirement: Revisão da pena
Com o modo de revisão ativo, adicionar e remover uma pena SHALL gerar as revisões de inclusão e exclusão do dispositivo, e alterar o texto ou o rótulo da pena SHALL gerar uma revisão de alteração do dispositivo. A marca da alteração SHALL descrever o que mudou: "Rótulo do dispositivo foi alterado" quando só o rótulo mudou, "Texto e rótulo do dispositivo foram alterados" quando os dois mudaram e a descrição de texto alterado quando só o texto mudou. Rejeitar a revisão SHALL restaurar o texto e o rótulo anteriores; aceitar SHALL manter os atuais. Se o rótulo e o texto voltarem aos valores originais, a revisão SHALL ser descartada. A descrição SHALL ser a mesma na sessão e no documento reaberto, e rejeitar depois de reaberto SHALL restaurar o rótulo anterior.

#### Scenario: Rótulo alterado em revisão
- **WHEN** o modo de revisão está ativo e o usuário troca o rótulo de "Pena –" para "Infração –"
- **THEN** a pena passa a ter uma revisão de alteração descrita como "Rótulo do dispositivo foi alterado"

#### Scenario: Rejeitar a troca de rótulo
- **WHEN** o usuário rejeita essa revisão
- **THEN** a pena volta a exibir "Pena –"

#### Scenario: Voltar ao rótulo original
- **WHEN** o usuário troca o rótulo e depois volta ao rótulo original durante a revisão
- **THEN** a revisão é descartada

#### Scenario: Salvar, reabrir e rejeitar
- **WHEN** o usuário troca o rótulo em revisão, salva, reabre o documento e rejeita a revisão
- **THEN** a pena volta ao rótulo anterior, e antes de rejeitar a marca tinha a mesma descrição da sessão

#### Scenario: Pena adicionada em revisão
- **WHEN** o modo de revisão está ativo e o usuário adiciona uma pena
- **THEN** a pena recebe a marca de dispositivo adicionado, e rejeitá-la remove a pena

#### Scenario: Pena excluída em revisão
- **WHEN** o modo de revisão está ativo e o usuário exclui uma pena com o rótulo "Penalidade –"
- **THEN** a linha excluída exibe "Penalidade –", e não a descrição do tipo, e rejeitar a exclusão devolve a pena com o mesmo rótulo

### Requirement: Pena não é destino de remissão interna
O sistema SHALL NOT oferecer a pena como destino no diálogo de remissão interna nem a criar como destino por detecção automática. Remissões internas e externas no texto da pena SHALL funcionar como nos demais dispositivos.

#### Scenario: Diálogo de remissão
- **WHEN** o usuário abre o diálogo de remissão interna num documento com penas
- **THEN** nenhuma pena aparece entre os destinos

#### Scenario: Remissão no texto da pena
- **WHEN** o texto da pena cita "art. 121" de um artigo existente e o usuário sai da linha
- **THEN** a remissão interna para o art. 121 é criada no texto da pena

### Requirement: Colar texto com pena
Ao colar texto articulado em que o conversor reconheça uma pena, o sistema SHALL criar a pena como último filho do seu dono, com o rótulo normalizado, em vez de descartá-la.

#### Scenario: Colar inciso com pena
- **WHEN** o usuário cola "I – a exercer arte ou ofício:" seguido de "Pena – detenção, de um mês a um ano." e o conversor devolve o inciso com a pena
- **THEN** o inciso colado tem a pena "Pena –" com esse texto
