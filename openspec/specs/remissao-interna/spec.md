# Remissão Interna

## Purpose

Remissão interna é a detecção, criação, atualização e remoção de referências cruzadas entre dispositivos do mesmo documento legislativo (ex.: "conforme o art. 1º"), representadas como links navegáveis no editor. Ver também a capability irmã `remissao-externa` (referências a normas externas ao documento) — mesmo diálogo de criação manual, mesmo gatilho de blur, coordenação mútua na detecção.

## Requirements

### Requirement: Detecção automática de referências a dispositivos do mesmo documento
O sistema SHALL detectar automaticamente, no texto de um dispositivo, referências a outros dispositivos do mesmo documento (artigo, parágrafo, inciso, alínea, item, agrupador) e transformá-las em links de remissão.

#### Scenario: Referência absoluta simples
- **WHEN** o usuário digita um texto contendo "art. 3º" (ou variantes: "artigo 3", "Art. 3", case-insensitive)
- **THEN** o sistema cria uma remissão apontando para o artigo correspondente, se ele existir na articulação

#### Scenario: Referência absoluta composta (múltiplos níveis)
- **WHEN** o texto contém uma referência composta como "inciso I do § 2º do art. 3º" (até 4 níveis: artigo, parágrafo, inciso, alínea)
- **THEN** o sistema cria uma única remissão para o dispositivo mais específico, sem gerar links duplicados para os níveis intermediários

#### Scenario: Referência a agrupador
- **WHEN** o texto contém "Capítulo I", "Seção II do Capítulo I", ou "Capítulo Único"/"Seção Única"
- **THEN** o sistema resolve o agrupador correspondente percorrendo a árvore da articulação; para "único/única", só cria a remissão se existir exatamente um filho daquele tipo

#### Scenario: Referência contextual relativa ao dispositivo de origem
- **WHEN** o texto contém um padrão relativo como "§ 2º deste artigo", "caput deste artigo", "inciso I deste parágrafo", ou "desta Seção"
- **THEN** o sistema resolve o alvo subindo pela cadeia de ancestrais do dispositivo de origem até encontrar o tipo indicado, sem exigir um número de artigo explícito

#### Scenario: Referência implícita sem qualificador
- **WHEN** o texto contém um padrão "bare" como "§ 1º" ou "inciso II", sem sufixo "deste/desta" e sem âncora de artigo explícita
- **THEN** o sistema tenta resolver o alvo pelo contexto estrutural do dispositivo de origem (ex.: um "§ N" sem qualificador é resolvido em relação ao artigo do próprio dispositivo)

#### Scenario: Nenhuma remissão duplicada quando padrões colidem no mesmo trecho
- **WHEN** mais de uma passagem de detecção encontra um match no mesmo intervalo de texto
- **THEN** o sistema mantém apenas o match mais longo, priorizando detecção explícita sobre implícita

#### Scenario: Dispositivo referenciado não existe
- **WHEN** o texto contém um padrão de referência sintaticamente válido, mas o dispositivo apontado não existe na articulação atual
- **THEN** nenhuma remissão é criada para aquele trecho

### Requirement: Criação de remissão só ao sair do dispositivo em edição
A criação automática de remissões SHALL ocorrer apenas quando o usuário sai do dispositivo em edição — nunca a cada pausa de digitação.

#### Scenario: Troca de dispositivo dentro do editor
- **WHEN** o cursor do editor muda de um dispositivo para outro (clique ou navegação por teclado)
- **THEN** o sistema roda a detecção de remissões sobre o texto do dispositivo que acabou de perder o foco

#### Scenario: Foco sai do editor inteiro
- **WHEN** o foco sai do editor (ex.: usuário clica em um painel lateral ou no menu de outro dispositivo)
- **THEN** o sistema roda a detecção pendente da linha atual antes de processar a ação que tirou o foco

#### Scenario: Salvar sem sair da linha
- **WHEN** o usuário aciona a ação de salvar (obter o projeto atualizado) sem ter saído da linha que estava editando
- **THEN** o sistema força a detecção pendente daquela linha antes de serializar o documento

### Requirement: Criação manual de remissão via diálogo
O sistema SHALL permitir que o usuário crie manualmente uma remissão selecionando um trecho de texto não-vazio e escolhendo o dispositivo de destino em um diálogo com busca. Seleção de texto é pré-requisito obrigatório — não há caminho de criação manual sem ela.

#### Scenario: Diálogo compartilhado com remissão externa
- **WHEN** o usuário abre o diálogo de remissão a partir do texto selecionado
- **THEN** o mesmo diálogo oferece abas "Interna" (este requisito) e "Externa" (capability irmã `remissao-externa`, referências a normas fora do documento), a partir da mesma seleção de texto

#### Scenario: Criar remissão com texto selecionado
- **WHEN** o usuário seleciona um trecho de texto, abre o diálogo de remissão e, na aba "Interna", escolhe um dispositivo do próprio documento
- **THEN** o trecho selecionado é substituído por um link de remissão interna para o dispositivo escolhido, mantendo o texto original selecionado como texto do link

#### Scenario: Ação de criação manual indisponível sem seleção
- **WHEN** não há nenhum trecho de texto selecionado no editor (cursor solto ou seleção de comprimento zero)
- **THEN** o botão/ação de abrir o diálogo de remissão (interna ou externa) permanece desabilitado, e não há forma de abri-lo

### Requirement: Popup de ações ao posicionar o cursor sobre o link
O sistema SHALL exibir um popup com ações (navegar, editar, excluir) ao posicionar o cursor sobre um link de remissão interna, sem exigir clique — e SHALL ocultá-lo assim que o cursor sair do link.

#### Scenario: Cursor entra no link
- **WHEN** o usuário posiciona o cursor sobre um link de remissão interna (clique ou navegação por teclado)
- **THEN** um popup aparece com o rótulo do dispositivo de destino e as ações "Ir para dispositivo", "Editar" e "Excluir"

#### Scenario: Cursor sai do link
- **WHEN** o cursor deixa de estar sobre o link (move para outro ponto do texto)
- **THEN** o popup desaparece

#### Scenario: Ação "Ir" navega até o destino
- **WHEN** o usuário aciona "Ir para dispositivo" no popup de um link válido
- **THEN** o editor navega até o dispositivo de destino e o destaca visualmente

#### Scenario: Ação "Editar" reabre o diálogo com o destino atual pré-selecionado
- **WHEN** o usuário aciona "Editar" no popup
- **THEN** o diálogo de remissão reabre na aba Interna, com o dispositivo de destino atual pré-selecionado

#### Scenario: Popup de remissão inválida
- **WHEN** o cursor está sobre um link cujo dispositivo de destino foi excluído
- **THEN** o popup exibe o rótulo em estado de alerta e a ação "Ir para dispositivo" fica desabilitada, mantendo "Editar" e "Excluir" disponíveis

### Requirement: Remoção de remissões preservando o texto
O sistema SHALL permitir remover o link de uma remissão mantendo o texto original como texto simples.

#### Scenario: Remover remissão sob o cursor
- **WHEN** o cursor está posicionado sobre um link de remissão e o usuário aciona a remoção
- **THEN** o formato de link é removido e o texto permanece inalterado

#### Scenario: Remover múltiplas remissões em uma seleção
- **WHEN** o usuário seleciona um trecho contendo mais de um link de remissão e aciona a remoção
- **THEN** todos os links completamente contidos na seleção são removidos, cada um mantendo seu texto

#### Scenario: Remoção sem remissão disponível
- **WHEN** o usuário aciona a remoção sem que o cursor esteja sobre um link e sem seleção contendo links
- **THEN** o sistema exibe uma mensagem informando que não há remissão para remover, e nenhuma alteração é feita

### Requirement: Atualização automática do texto do link em renumeração
Quando um dispositivo referenciado é renumerado por qualquer ação estrutural (adicionar, remover, agrupar, transformar tipo, TAB/SHIFT_TAB, mover para cima/baixo, rejeitar revisão de movimentação, undo/redo), o sistema SHALL recalcular o texto de cada remissão que aponta para ele, resolvendo o alvo pela sua identidade estável — nunca pelo identificador textual antigo.

#### Scenario: Referência qualificada sempre reflete a cadeia completa
- **WHEN** o texto da remissão contém uma cadeia explícita de qualificadores (ex.: "inciso II do art. 2º") e qualquer nível dessa cadeia muda de número, inclusive por renumeração de um dispositivo não relacionado
- **THEN** o texto do link é recalculado por inteiro para refletir a nova cadeia

#### Scenario: Referência "enxuta" só muda se a posição local mudar
- **WHEN** o texto da remissão não tem qualificador explícito (ex.: "inciso I" sozinho, ou "parágrafo único", referindo-se a um irmão do mesmo pai)
- **THEN** o texto só é atualizado se a posição ordinal do alvo dentro do seu pai imediato mudar, ou se a quantidade de irmãos do mesmo tipo mudar de/para um único elemento — nunca ganha uma cadeia de qualificadores que não tinha originalmente, e nunca alterna entre a forma "único" e a forma numerada sem uma mudança real na contagem de irmãos do mesmo tipo

#### Scenario: "Parágrafo único" permanece único quando nenhum irmão é de fato adicionado
- **WHEN** um dispositivo é o único de seu tipo entre os filhos de seu pai (ex.: o único parágrafo de um artigo) e qualquer ação estrutural em outra parte do documento dispara a sincronização de remissões, sem que um segundo dispositivo do mesmo tipo seja de fato adicionado como irmão
- **THEN** o texto da remissão continua na forma "único" (ex.: "parágrafo único"), nunca sendo convertido para a forma numerada (ex.: "§ 1º")

#### Scenario: Referência contextual só muda se a posição relativa ao ancestral compartilhado mudar
- **WHEN** o texto da remissão usa um sufixo contextual (ex.: "deste artigo", "desta Seção")
- **THEN** o sufixo literal nunca muda; só o segmento antes dele é recalculado, e só se a posição do alvo relativa a esse ancestral compartilhado mudar

#### Scenario: Texto editado manualmente pelo usuário é preservado
- **WHEN** o texto atual do link diverge do que o sistema gravou por último e não corresponde à forma canônica esperada do alvo antes da renumeração
- **THEN** o sistema preserva o texto como está e marca a entrada para revisão do usuário, em vez de sobrescrevê-la

#### Scenario: Texto livre nunca é regenerado
- **WHEN** o texto do link não corresponde a nenhuma forma reconhecível de referência legal (ex.: "o dispositivo mencionado acima")
- **THEN** o sistema nunca tenta recalculá-lo, independentemente de qualquer renumeração

#### Scenario: Origem manual ou automática não influencia a atualização
- **WHEN** uma remissão foi criada manualmente via diálogo, e seu texto atual corresponde a uma forma de referência reconhecível e ainda bate com a forma canônica esperada do alvo
- **THEN** ela é atualizada na renumeração pelas mesmas regras (qualificada/enxuta/contextual) aplicadas a uma remissão detectada automaticamente — não existe tratamento diferenciado por origem

#### Scenario: Mover o dispositivo referenciado
- **WHEN** o usuário move para cima ou para baixo um dispositivo que é alvo de uma remissão (ex.: o art. 3º referenciado como "art. 3º" é movido para cima e passa a ser o art. 2º)
- **THEN** o texto e o destino do link são atualizados para o novo número ("art. 2º"), pelas mesmas regras dos demais cenários deste requisito

#### Scenario: Mover um dispositivo desloca o irmão referenciado
- **WHEN** o usuário move um dispositivo e, com isso, um irmão que é alvo de uma remissão muda de número
- **THEN** o texto e o destino do link para esse irmão são atualizados para o novo número

#### Scenario: Mover um dispositivo com descendentes referenciados
- **WHEN** o usuário move um dispositivo cujo caput, inciso, parágrafo ou outro descendente é alvo de uma remissão
- **THEN** o link continua apontando para o mesmo descendente, com o texto atualizado conforme a nova cadeia de numeração

#### Scenario: Artigo movido para outro agrupador
- **WHEN** o usuário move um artigo referenciado de forma que ele passe para outro agrupador (ex.: de um Capítulo para o seguinte)
- **THEN** o link continua apontando para o mesmo artigo e o texto é recalculado pelas regras qualificada/enxuta/contextual considerando a nova posição

#### Scenario: Desfazer e refazer o movimento
- **WHEN** o usuário desfaz (undo) um movimento que atualizou remissões, e depois o refaz (redo)
- **THEN** a cada passo o texto e o destino dos links refletem a posição corrente do dispositivo referenciado

### Requirement: Preservação do vínculo de remissões ao mover dispositivos
Mover um dispositivo para cima ou para baixo SHALL preservar o vínculo de toda remissão interna relacionada à subárvore movida: tanto as que têm como destino o dispositivo movido ou seus descendentes quanto as contidas no texto desses dispositivos. Nenhuma remissão válida pode deixar de ser atualizada, deixar de ser exibida como link ou ser marcada como inválida apenas por causa de um movimento.

#### Scenario: Remissão contida no dispositivo movido
- **WHEN** o usuário move um dispositivo cujo texto contém uma remissão interna para outro dispositivo
- **THEN** após o movimento o link continua presente, com popup de ações funcional, e continua sendo atualizado em renumerações posteriores do seu destino

#### Scenario: Remissão contida no dispositivo movido após salvar
- **WHEN** o usuário move um dispositivo cujo texto contém uma remissão interna e em seguida salva o documento
- **THEN** a remissão é persistida uma única vez, apontando para o destino correto

### Requirement: Rejeição de revisão de movimentação não invalida remissões
Em modo de revisão, rejeitar uma revisão de movimentação de dispositivo SHALL restaurar as remissões relacionadas à posição restaurada, sem marcá-las como inválidas, já que o dispositivo de destino continua existindo.

#### Scenario: Rejeitar a movimentação do dispositivo referenciado
- **WHEN** com revisão ativa o usuário move um dispositivo referenciado por uma remissão e depois rejeita essa revisão de movimentação
- **THEN** o texto e o destino do link voltam a refletir a posição original do dispositivo, o link não recebe marcação de inválido e nenhuma mensagem de remissão inválida é exibida no dispositivo de origem

#### Scenario: Mover em modo revisão
- **WHEN** com revisão ativa o usuário move um dispositivo referenciado por uma remissão
- **THEN** o texto e o destino do link são atualizados como fora do modo revisão, sem gerar uma revisão própria para essa atualização

### Requirement: Invalidação de remissão ao excluir o dispositivo de destino
Quando um dispositivo referenciado por uma remissão é removido, o sistema SHALL marcar visualmente o link como inválido e exibir uma mensagem de erro associada ao dispositivo de origem. A regra vale para o dispositivo removido e para todos os seus descendentes, inclusive o caput de um artigo removido.

#### Scenario: Remoção do dispositivo de destino
- **WHEN** um dispositivo que é alvo de uma ou mais remissões é removido
- **THEN** cada link correspondente recebe uma marcação visual de inválido (vermelho, tachado) e um painel de erro aparece abaixo do texto do dispositivo de origem

#### Scenario: Remoção de artigo cujo caput é referenciado
- **WHEN** um artigo é removido e existe uma remissão cujo destino é o caput desse artigo (ex.: "caput do art. 2º")
- **THEN** essa remissão é marcada como inválida, com a mesma marcação visual e mensagem de erro do cenário anterior

#### Scenario: Remoção de dispositivo com descendentes referenciados
- **WHEN** um dispositivo é removido e existem remissões cujo destino é um de seus descendentes (inciso, parágrafo, alínea etc.)
- **THEN** cada uma dessas remissões é marcada como inválida

#### Scenario: Mensagem de erro persiste até o link ser removido
- **WHEN** uma remissão está marcada como inválida
- **THEN** a mensagem de erro permanece mesmo que o usuário edite outras partes do texto do dispositivo de origem, e só desaparece quando o link inválido é removido

#### Scenario: Undo restaura a remissão
- **WHEN** o usuário desfaz (undo) a remoção do dispositivo de destino
- **THEN** a marcação de inválido e a mensagem de erro são revertidas automaticamente, sem exigir nova detecção

#### Scenario: Undo restaura remissões para descendentes e para o caput
- **WHEN** o usuário desfaz (undo) a remoção de um dispositivo cujos descendentes (inclusive o caput, se for artigo) eram alvo de remissões invalidadas pela remoção
- **THEN** todas essas remissões deixam de estar marcadas como inválidas e voltam a apontar para o descendente restaurado correspondente

#### Scenario: Redo da remoção invalida de novo as remissões
- **WHEN** o usuário remove um dispositivo que é alvo de remissões (ou cujos descendentes são), desfaz (undo) e em seguida refaz (redo) a remoção
- **THEN** as remissões para o dispositivo removido e seus descendentes voltam a ser marcadas como inválidas, com a mesma marcação visual, mensagem de erro e alerta da remoção original, e um novo undo as restaura

#### Scenario: Salvar após o redo da remoção
- **WHEN** após o redo de uma remoção o usuário salva o documento
- **THEN** as remissões para os dispositivos removidos são persistidas como inválidas, e nenhuma é gravada como remissão válida para outro dispositivo que tenha herdado o número do removido

### Requirement: Preservação do vínculo de remissões para o caput em ações que recriam o artigo
Toda ação que recria um artigo a partir do histórico ou de uma revisão — desfazer/refazer a remoção, desfazer/refazer um movimento, rejeitar uma revisão de movimentação — SHALL preservar o vínculo das remissões cujo destino é o caput desse artigo: o link continua apontando para o caput restaurado, continua sendo atualizado em renumerações posteriores e é salvo apontando para ele, nunca como destino excluído.

#### Scenario: Desfazer a remoção de um artigo cujo caput é referenciado
- **WHEN** o usuário remove um artigo cujo caput é alvo de uma remissão e depois desfaz (undo) a remoção
- **THEN** o link volta a apontar para o caput do artigo restaurado, sem marcação de inválido, e o texto do caput é o mesmo de antes da remoção

#### Scenario: Desfazer o movimento de um artigo cujo caput é referenciado
- **WHEN** o usuário move um artigo cujo caput é alvo de uma remissão e depois desfaz (undo) o movimento
- **THEN** o link continua apontando para o caput desse artigo, com o texto refletindo a posição restaurada

#### Scenario: Refazer após desfazer
- **WHEN** o usuário desfaz e em seguida refaz (redo) uma ação que recria um artigo cujo caput é referenciado
- **THEN** a cada passo o link continua apontando para o caput desse artigo

#### Scenario: Rejeitar revisão de movimentação de artigo cujo caput é referenciado
- **WHEN** com revisão ativa o usuário move um artigo cujo caput é alvo de uma remissão e depois rejeita essa revisão de movimentação
- **THEN** o link continua apontando para o caput do artigo na posição restaurada, sem marcação de inválido

#### Scenario: Salvar após desfazer
- **WHEN** após qualquer uma das ações acima o usuário salva o documento
- **THEN** a remissão para o caput é persistida apontando para o caput do artigo, não como remissão para dispositivo excluído

### Requirement: Marcação de links de remissão não cria passos no histórico de desfazer
Mudanças que alteram apenas a marcação de links de remissão no texto de um dispositivo — criação do link por detecção, marcação ou desmarcação de inválido — SHALL NOT criar passos próprios no histórico de desfazer/refazer nem descartar os passos que podem ser refeitos. Cada ação do usuário (ex.: remover um dispositivo) é desfeita com um único comando de desfazer, independentemente de onde estava o foco. Mudanças de formatação feitas pelo usuário (negrito, itálico, sobrescrito) continuam sendo passos desfazíveis.

#### Scenario: Desfazer uma remoção com o foco no dispositivo de origem
- **WHEN** o foco está no dispositivo de origem de uma remissão, o usuário remove o dispositivo de destino (o link passa a ser marcado como inválido) e clica em "Desfazer"
- **THEN** um único "Desfazer" restaura o dispositivo removido e o link volta a ser válido

#### Scenario: Criação de link por detecção não é um passo de desfazer
- **WHEN** o usuário digita uma referência, sai do dispositivo (o link é criado) e em seguida clica em "Desfazer"
- **THEN** o "Desfazer" reverte a digitação, e não apenas a criação do link

#### Scenario: Formatação do usuário continua desfazível
- **WHEN** o usuário aplica negrito a um trecho de um dispositivo e clica em "Desfazer"
- **THEN** o negrito é desfeito

### Requirement: Persistência das remissões ao salvar e abrir o documento
O sistema SHALL serializar as remissões internas no LexML salvo — incluindo remissões inválidas, preservando o último destino conhecido — e reconstruí-las integralmente ao reabrir o documento.

#### Scenario: Salvar preenche remissões de dispositivos não editados na sessão
- **WHEN** o usuário salva um documento que contém dispositivos com remissões que não foram editados durante a sessão atual
- **THEN** o sistema completa o registro de remissões para esses dispositivos antes de serializar, garantindo que nenhuma remissão existente seja perdida

#### Scenario: Abrir documento reconstrói o registro a partir do texto
- **WHEN** um documento salvo é reaberto
- **THEN** o sistema reconstrói o registro de remissões varrendo o texto de cada dispositivo, sem depender de estado em memória de uma sessão anterior

#### Scenario: Texto fixo de remissões manuais sobrevive ao ciclo salvar/abrir
- **WHEN** uma remissão manual com texto fixo é salva e o documento é reaberto
- **THEN** o texto escolhido pelo usuário é restaurado e continua marcado como fixo, não sendo sobrescrito por atualização automática

#### Scenario: Remissão inválida preserva o destino conhecido através do ciclo salvar/abrir
- **WHEN** uma remissão marcada como inválida (dispositivo de destino excluído) é salva e o documento é reaberto
- **THEN** o estado reconstruído aponta para o mesmo destino conhecido de antes da exclusão, com a mesma mensagem de erro e o mesmo alerta associados

#### Scenario: Reabertura não perde a marcação de inválida por reaproveitamento de id
- **WHEN** um documento com remissão inválida é reaberto depois que o identificador do destino original foi reaproveitado por um dispositivo diferente, na reestruturação que gerou a invalidade
- **THEN** a remissão permanece marcada como inválida, sem ser tratada como apontando corretamente para o novo dispositivo que agora tem esse identificador
