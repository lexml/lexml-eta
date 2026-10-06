## Purpose

Define como o usuário adiciona, altera e remove o título de um dispositivo (Artigo, Parágrafo, Inciso, Alínea e Item) no editor, inclusive dentro de bloco de alteração, e como essa edição interage com validação, desfazer/refazer, revisão e persistência.

## ADDED Requirements

### Requirement: Ações de título no menu do dispositivo
O editor SHALL oferecer, no menu de contexto de Artigo, Parágrafo, Inciso, Alínea e Item, a ação "Adicionar título" quando o dispositivo não possui título, e as ações "Editar título" e "Remover título" quando possui. O editor SHALL oferecer essas ações também para dispositivos dentro de bloco de alteração. O editor SHALL NOT oferecer essas ações em agrupadores, caput, omissis, dispositivos bloqueados nem em dispositivos marcados como removidos em revisão.

#### Scenario: Dispositivo sem título
- **WHEN** o usuário abre o menu de um artigo sem título
- **THEN** a opção "Adicionar título" é oferecida e as opções "Editar título" e "Remover título" não são

#### Scenario: Dispositivo com título
- **WHEN** o usuário abre o menu de um parágrafo que possui título
- **THEN** as opções "Editar título" e "Remover título" são oferecidas e "Adicionar título" não é

#### Scenario: Dispositivo dentro de bloco de alteração
- **WHEN** o usuário abre o menu de um inciso que está dentro de um bloco de alteração de norma e não é bloqueado
- **THEN** as opções de título aplicáveis são oferecidas, como em um dispositivo fora do bloco

#### Scenario: Dispositivo que não admite título
- **WHEN** o usuário abre o menu de um agrupador (ex.: Capítulo) ou de um dispositivo bloqueado
- **THEN** nenhuma opção de título é oferecida

### Requirement: Diálogo de edição do título
Ao escolher "Adicionar título" ou "Editar título", ou ao clicar no título exibido, o editor SHALL abrir um diálogo modal com um editor de texto contendo o título atual (vazio ao adicionar) e as ações Cancelar e Ok. O diálogo SHALL oferecer apenas as formatações itálico, sublinhado, subscrito e sobrescrito.

#### Scenario: Adicionar título
- **WHEN** o usuário escolhe "Adicionar título", digita "Plano de Carreira" e confirma com Ok
- **THEN** o título "Plano de Carreira" passa a ser exibido acima do rótulo do dispositivo

#### Scenario: Editar título pelo clique
- **WHEN** o usuário clica no título exibido de um dispositivo
- **THEN** o diálogo abre preenchido com o título atual, e ao confirmar um novo texto o título exibido é atualizado

#### Scenario: Cancelar
- **WHEN** o usuário abre o diálogo, altera o texto e clica em Cancelar
- **THEN** o título do dispositivo permanece inalterado e nenhum passo é registrado no histórico

#### Scenario: Confirmar sem alterar
- **WHEN** o usuário abre o diálogo e confirma sem mudar o texto
- **THEN** nenhum passo é registrado no histórico nem gerada revisão

### Requirement: Formatação do título restrita
O título SHALL conter apenas texto e as formatações `i`, `u`, `sub` e `sup`. O sistema SHALL remover automaticamente qualquer outra tag ao confirmar a edição, preservando o texto interno. O título SHALL NOT conter remissão interna nem externa.

#### Scenario: Tags não permitidas
- **WHEN** o texto confirmado contém negrito, links ou outras tags além de `i`, `u`, `sub` e `sup`
- **THEN** o título salvo mantém o texto e apenas as formatações permitidas

#### Scenario: Remissão no título
- **WHEN** o texto confirmado contém uma remissão (link) ou uma citação que seria detectada como remissão
- **THEN** nenhuma remissão é criada para o título e o link, se existir, é reduzido a texto simples

### Requirement: Validação informativa do título
O sistema SHALL exibir mensagem de aviso, sem bloquear a edição, quando o título de um dispositivo está vazio ("Não foi informado um texto para o título do <tipo de dispositivo>.") ou não começa com letra maiúscula. A verificação da maiúscula SHALL ignorar as tags de formatação e espaços iniciais.

#### Scenario: Título vazio
- **WHEN** o usuário confirma o diálogo de um artigo com o texto vazio
- **THEN** a edição é aceita e o dispositivo exibe o aviso "Não foi informado um texto para o título do Artigo."

#### Scenario: Título iniciando em minúscula
- **WHEN** o usuário confirma o título "plano de carreira"
- **THEN** a edição é aceita e o dispositivo exibe aviso de que o título deve iniciar com letra maiúscula

#### Scenario: Título com formatação inicial
- **WHEN** o usuário confirma o título "<i>Plano</i> de carreira"
- **THEN** nenhum aviso de maiúscula é exibido, pois o primeiro caractere de texto é maiúsculo

#### Scenario: Título válido
- **WHEN** o título começa com letra maiúscula e não é vazio
- **THEN** nenhum aviso de título é exibido

### Requirement: Remover título
A ação "Remover título" SHALL eliminar o título do dispositivo, que deixa de ser exibido e de ser gravado. O texto e a numeração do dispositivo SHALL permanecer inalterados.

#### Scenario: Remoção
- **WHEN** o usuário escolhe "Remover título" em um artigo com título
- **THEN** o título deixa de ser exibido, o menu volta a oferecer "Adicionar título" e o restante do dispositivo permanece igual

### Requirement: Desfazer e refazer do título
Cada operação de adicionar, alterar ou remover título SHALL ser um único passo do histórico. Desfazer SHALL restaurar o título anterior (inclusive ausência de título) e refazer SHALL reaplicá-lo, com a exibição da linha refletindo o resultado.

#### Scenario: Desfazer adição
- **WHEN** o usuário adiciona um título e executa desfazer
- **THEN** o dispositivo volta a não ter título

#### Scenario: Desfazer alteração
- **WHEN** o usuário altera o título de "A" para "B" e executa desfazer
- **THEN** o título volta a ser "A"; ao executar refazer, volta a ser "B"

#### Scenario: Desfazer remoção
- **WHEN** o usuário remove o título "A" e executa desfazer
- **THEN** o título "A" é exibido novamente

### Requirement: Revisão da alteração de título
Com o modo de revisão ativo, adicionar, alterar ou remover o título SHALL gerar uma revisão de modificação do dispositivo, com descrição própria para o título. Aceitar a revisão SHALL manter o novo título e rejeitá-la SHALL restaurar o título anterior. Se o título voltar ao valor original, a revisão SHALL ser descartada.

#### Scenario: Gerar revisão
- **WHEN** o modo de revisão está ativo e o usuário altera o título de um dispositivo
- **THEN** o dispositivo passa a ter uma revisão cuja descrição indica que o título foi alterado

#### Scenario: Rejeitar revisão
- **WHEN** o usuário rejeita a revisão da alteração de título
- **THEN** o título anterior é restaurado, inclusive a ausência de título quando ele havia sido adicionado

#### Scenario: Aceitar revisão
- **WHEN** o usuário aceita a revisão da alteração de título
- **THEN** o novo título é mantido e a revisão deixa de existir

#### Scenario: Voltar ao valor original
- **WHEN** o usuário altera o título e depois o restaura ao valor original durante a revisão
- **THEN** a revisão de modificação é descartada

### Requirement: Persistência do título
O título de cada dispositivo, com suas formatações permitidas, SHALL ser gravado ao salvar o documento e restaurado ao abri-lo, inclusive em dispositivos dentro de bloco de alteração. Um título vazio SHALL NOT ser gravado.

#### Scenario: Salvar e abrir
- **WHEN** o usuário adiciona o título "Plano <i>Especial</i>" a um artigo, salva e reabre o documento
- **THEN** o artigo exibe o título "Plano *Especial*" com o itálico preservado

#### Scenario: Título em bloco de alteração
- **WHEN** o usuário adiciona um título a um dispositivo dentro de bloco de alteração, salva e reabre o documento
- **THEN** o título é exibido nesse dispositivo
