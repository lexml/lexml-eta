## ADDED Requirements

### Requirement: Adicionar comentário a dispositivo

A barra de ferramentas do texto articulado SHALL ter o botão "Adicionar comentário". O botão SHALL estar habilitado só quando o cursor estiver num dispositivo que possa ser comentado e que ainda não tenha comentário. Podem ser comentados todos os dispositivos com identificador: artigos e seus desdobramentos, agrupadores, ementa, preâmbulo, pena e dispositivos de bloco de alteração. O omissis e o dispositivo excluído em revisão MUST NOT receber comentário novo. O título do botão desabilitado SHALL indicar o motivo. O botão SHALL abrir o modal "Adicionar comentário" com a identificação do dispositivo no lugar do trecho selecionado, e o modal SHALL seguir as mesmas regras do comentário na justificação: até 500 caracteres, contador, e "Comentar" desabilitado com o campo vazio. Ao confirmar, o sistema SHALL criar uma sequência com um comentário do usuário atual, com a data e a hora atuais, exibir o ícone de comentário no dispositivo, exibir a aba "Comentários" e destacar a nova sequência.

#### Scenario: Comentar um dispositivo

- **WHEN** o cursor está no inciso I do art. 3º, que não tem comentário, e o usuário clica em "Adicionar comentário", escreve o comentário e clica em "Comentar"
- **THEN** o inciso exibe o ícone de comentário
- **AND** a aba "Comentários" é exibida com a nova sequência destacada, identificada como "inciso I do art. 3º" e com o comentário do usuário atual

#### Scenario: Dispositivo já comentado

- **WHEN** o cursor está num dispositivo que já tem comentário
- **THEN** o botão "Adicionar comentário" está desabilitado, com o título "Este dispositivo já possui comentário"

#### Scenario: Omissis

- **WHEN** o cursor está num omissis
- **THEN** o botão "Adicionar comentário" está desabilitado

#### Scenario: Dispositivo excluído em revisão

- **WHEN** o cursor está num dispositivo excluído em modo de revisão, ainda exibido no texto
- **THEN** o botão "Adicionar comentário" está desabilitado

#### Scenario: Ementa

- **WHEN** o cursor está na ementa, que não tem comentário
- **THEN** o botão "Adicionar comentário" está habilitado e o modal identifica o dispositivo como "Ementa"

#### Scenario: Cancelar

- **WHEN** o usuário abre o modal a partir de um dispositivo e clica em "Cancelar"
- **THEN** nenhuma sequência é criada e o dispositivo não exibe o ícone de comentário

### Requirement: Indicador de comentário no dispositivo

Um dispositivo com comentário SHALL exibir um ícone de comentário à direita da linha, depois dos demais ícones dessa posição (como o de diferenças). Clicar no ícone SHALL posicionar o cursor no dispositivo, exibir a aba "Comentários" e destacar a sequência do dispositivo. Excluir a sequência SHALL retirar o ícone.

#### Scenario: Ícone ao lado do ícone de diferenças

- **WHEN** um dispositivo modificado em revisão também tem comentário
- **THEN** a linha exibe o ícone de diferenças seguido do ícone de comentário

#### Scenario: Clicar no ícone

- **WHEN** a aba "Comentários" não está exibida e o usuário clica no ícone de comentário de um dispositivo
- **THEN** a aba "Comentários" é exibida e a sequência do dispositivo fica destacada

#### Scenario: Excluir a sequência

- **WHEN** o usuário exclui a sequência de um dispositivo, confirmando
- **THEN** o dispositivo deixa de exibir o ícone de comentário, sem alteração no texto

### Requirement: Identificação do dispositivo comentado

A sequência de um dispositivo SHALL exibir a identificação dele, por extenso a partir do artigo (ex.: "inciso I do § 2º do art. 3º"), ou o nome do elemento para ementa, preâmbulo, agrupador e pena. A identificação SHALL corresponder sempre ao rótulo atual do dispositivo: renumerar, mover ou transformar o dispositivo atualiza a identificação e mantém a sequência.

#### Scenario: Renumeração

- **WHEN** o art. 3º tem um inciso comentado e o usuário inclui um artigo antes dele, que passa a ser o art. 4º
- **THEN** a sequência continua na aba, identificada como "inciso I do art. 4º"

#### Scenario: Agrupador

- **WHEN** o usuário comenta o Capítulo II
- **THEN** a sequência é identificada como "Capítulo II"

### Requirement: Destaque da sequência do dispositivo sob o cursor

Com a aba "Comentários" exibida, posicionar o cursor num dispositivo comentado SHALL destacar a sequência desse dispositivo e rolar a lista até ela. Posicionar o cursor num dispositivo sem comentário SHALL retirar o destaque.

#### Scenario: Cursor no dispositivo comentado

- **WHEN** a aba "Comentários" está exibida e o usuário posiciona o cursor num dispositivo comentado
- **THEN** a sequência do dispositivo fica destacada e visível na lista

#### Scenario: Cursor em dispositivo sem comentário

- **WHEN** uma sequência está destacada pelo cursor e o usuário move o cursor para um dispositivo sem comentário
- **THEN** nenhuma sequência fica destacada

### Requirement: Sequência removida com o dispositivo

Quando um dispositivo comentado for excluído do texto, inclusive como descendente de um dispositivo excluído, o sistema SHALL remover a sequência da aba e retirar o ícone. Desfazer a exclusão SHALL restaurar o dispositivo sem comentário e sem recriar a sequência.

#### Scenario: Excluir o dispositivo

- **WHEN** o usuário exclui um parágrafo comentado
- **THEN** a sequência do parágrafo some da aba

#### Scenario: Excluir o pai

- **WHEN** o usuário exclui um artigo que tem um inciso comentado
- **THEN** a sequência do inciso some da aba

#### Scenario: Desfazer depois de excluir

- **WHEN** o usuário exclui um dispositivo comentado e depois desfaz
- **THEN** o dispositivo volta sem o ícone de comentário e a sequência não volta à aba

### Requirement: Comentário em dispositivo excluído em revisão

Excluir em modo de revisão um dispositivo comentado SHALL manter a sequência e o ícone, porque o dispositivo continua no texto como exclusão. Aceitar essa revisão SHALL remover a sequência; rejeitá-la SHALL manter a sequência e o ícone no dispositivo restaurado.

#### Scenario: Excluir em revisão

- **WHEN** o modo de revisão está ativo e o usuário exclui um dispositivo comentado
- **THEN** o dispositivo é exibido como excluído, com o ícone de comentário, e a sequência continua na aba

#### Scenario: Aceitar a exclusão

- **WHEN** um dispositivo comentado foi excluído em revisão e o usuário aceita a revisão
- **THEN** a sequência do dispositivo some da aba

#### Scenario: Rejeitar a exclusão

- **WHEN** um dispositivo comentado foi excluído em revisão e o usuário rejeita a revisão
- **THEN** o dispositivo volta com o ícone de comentário e a sequência continua na aba

## MODIFIED Requirements

### Requirement: Aba de comentários

O painel da direita SHALL ter a aba "Comentários", antes da aba "Notas", em todos os modos de edição. A aba SHALL listar as sequências de comentários e, sem nenhuma, exibir "Não há comentários registrados.". No modo anexo de parecer, que não tem justificação, a aba SHALL listar só as sequências da articulação.

#### Scenario: Aba sem comentários

- **WHEN** a edição de uma proposição é iniciada fora do modo anexo de parecer
- **THEN** o painel da direita exibe a aba "Comentários" antes da aba "Notas"
- **AND** a aba exibe "Não há comentários registrados."

#### Scenario: Anexo de parecer

- **WHEN** a edição é iniciada no modo anexo de parecer
- **THEN** o painel da direita exibe a aba "Comentários"
- **AND** é possível comentar um dispositivo da articulação

### Requirement: Exibição da sequência de comentários

Cada sequência SHALL exibir o local ("No texto", para a articulação, ou "Na justificação"), o objeto comentado (a identificação do dispositivo ou o texto do trecho da justificação), o botão "Responder" e o botão de excluir a sequência. Cada comentário da sequência SHALL exibir o nome do autor, a data e a hora no formato dd/mm/aaaa hh:mm e o texto, preservando as quebras de linha. Os botões "Editar" e "Excluir" de um comentário SHALL aparecer apenas para o autor; "Excluir" só aparece quando a sequência tem mais de um comentário.

#### Scenario: Sequência da articulação

- **WHEN** a aba exibe a sequência de um comentário no inciso I do art. 3º
- **THEN** a sequência exibe o local "No texto" e a identificação "inciso I do art. 3º"

#### Scenario: Sequência da justificação

- **WHEN** a aba exibe a sequência de um trecho comentado da justificação
- **THEN** a sequência exibe o local "Na justificação" e o texto do trecho

#### Scenario: Comentário de outro usuário

- **WHEN** a sequência contém um comentário de outro usuário
- **THEN** esse comentário não exibe os botões "Editar" e "Excluir"

#### Scenario: Único comentário do próprio usuário

- **WHEN** a sequência contém um único comentário, do usuário atual
- **THEN** o comentário exibe "Editar" e não exibe "Excluir"

#### Scenario: Quebras de linha

- **WHEN** um comentário foi escrito em duas linhas
- **THEN** a aba exibe o comentário nas mesmas duas linhas

### Requirement: Ordenação das sequências

A aba SHALL permitir ordenar as sequências pela "Ordem no texto" (padrão) ou pelos "Mais recentes". Em "Ordem no texto", as sequências da articulação SHALL vir primeiro, na ordem dos dispositivos no texto, seguidas das sequências da justificação, na ordem dos trechos. Em "Mais recentes", as sequências dos dois locais SHALL ser ordenadas juntas pela data do último comentário de cada uma, da mais recente para a mais antiga.

#### Scenario: Ordem no texto

- **WHEN** existem dois trechos comentados e o segundo foi comentado primeiro
- **THEN** com "Ordem no texto" a sequência do trecho que aparece antes no texto vem primeiro

#### Scenario: Articulação antes da justificação

- **WHEN** existem uma sequência da justificação e, criada depois, uma sequência do art. 2º
- **THEN** com "Ordem no texto" a sequência do art. 2º vem primeiro

#### Scenario: Ordem dos dispositivos

- **WHEN** o art. 5º foi comentado antes do art. 2º
- **THEN** com "Ordem no texto" a sequência do art. 2º vem primeiro

#### Scenario: Mais recentes considerando respostas

- **WHEN** a sequência mais antiga recebe uma resposta depois da criação da outra
- **THEN** com "Mais recentes" a sequência que recebeu a resposta vem primeiro

### Requirement: Seleção da sequência na aba

Clicar numa sequência SHALL destacá-la e posicionar o cursor no objeto comentado: para a articulação, exibir a aba "Texto" e posicionar o cursor no dispositivo; para a justificação, exibir a aba da justificação e posicionar o cursor no início do trecho comentado. Com o foco numa sequência, as setas para cima e para baixo SHALL selecionar a sequência anterior e a seguinte da lista. Clicar num botão da sequência MUST NOT selecioná-la.

#### Scenario: Clicar numa sequência

- **WHEN** a aba da justificação não está exibida e o usuário clica numa sequência da justificação
- **THEN** a aba da justificação é exibida, com o cursor no início do trecho comentado, e a sequência fica destacada

#### Scenario: Clicar numa sequência da articulação

- **WHEN** a aba da justificação está exibida e o usuário clica na sequência do art. 2º
- **THEN** a aba "Texto" é exibida, com o cursor no art. 2º, e a sequência fica destacada

#### Scenario: Navegar pelo teclado

- **WHEN** o foco está na primeira sequência da lista e o usuário pressiona a seta para baixo
- **THEN** a segunda sequência fica destacada e com o foco
