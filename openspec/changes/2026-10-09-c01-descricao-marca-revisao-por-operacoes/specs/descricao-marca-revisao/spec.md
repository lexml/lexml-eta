# Spec Delta

## Purpose

Define o texto que descreve cada revisão da articulação na marca de revisão do editor: como é composto a partir das operações registradas, que deve ser o mesmo na sessão de edição e no documento reaberto, e quais descrições outros pontos do editor reconhecem literalmente.

## ADDED Requirements

### Requirement: Descrição da marca composta pelas operações da revisão
O sistema SHALL descrever a marca de uma revisão da articulação a partir de todas as operações registradas nela. Para as operações isoladas, a descrição SHALL ser: `adicionado` — "Dispositivo adicionado"; `excluido` — "Dispositivo removido"; `alterado` — "Texto do dispositivo foi alterado"; `transformado;<tipo>` — "Dispositivo transformado (antes era "<tipo>")"; `movido;<n>` — "Dispositivo movido (antes era "<tipo> <rótulo>")", em que o rótulo anterior é o que o dispositivo tinha na posição `<n>` do texto de proposição, e, para dispositivo de alteração de norma, "Dispositivo movido (posição original <n>)". Quando a revisão tem `movido` ou `transformado` combinado com outras operações, a descrição SHALL listar cada operação, na ordem em que foram registradas, ligadas por "e", com o mesmo detalhamento: "movido (...)", "transformado (...)", "texto alterado" e "rótulo alterado".

#### Scenario: Dispositivo movido
- **WHEN** o usuário, em modo de revisão, move o artigo 3 do texto da proposição para a primeira posição
- **THEN** a marca descreve a revisão como "Dispositivo movido (antes era "Artigo Art. 3º")"

#### Scenario: Dispositivo movido e depois alterado
- **WHEN** o usuário, em modo de revisão, move o artigo 3 do texto da proposição e altera o seu texto
- **THEN** a revisão tem `movido;3,alterado` e a marca descreve "Dispositivo movido (antes era "Artigo Art. 3º") e texto alterado"

#### Scenario: Dispositivo de alteração de norma movido
- **WHEN** o usuário, em modo de revisão, move um parágrafo de um artigo de alteração de norma que estava na terceira posição entre os filhos do artigo
- **THEN** a marca descreve "Dispositivo movido (posição original 3)", e não um rótulo anterior, porque o rótulo desse dispositivo não decorre da sua posição

#### Scenario: Dispositivo transformado e depois alterado
- **WHEN** o usuário, em modo de revisão, transforma um inciso em alínea e altera o seu texto
- **THEN** a marca descreve "Dispositivo transformado (antes era "inciso") e texto alterado"

#### Scenario: Operações isoladas mantêm a descrição
- **WHEN** a revisão tem apenas `alterado`, apenas `adicionado` ou apenas `excluido`
- **THEN** a marca descreve, respectivamente, "Texto do dispositivo foi alterado", "Dispositivo adicionado" e "Dispositivo removido"

### Requirement: Descrição da marca acompanha as operações da revisão
O sistema SHALL recalcular a descrição da marca sempre que o conjunto de operações da revisão mudar, inclusive quando uma operação é acrescentada, ou descartada por ter sido revertida.

#### Scenario: Operação acrescentada depois
- **WHEN** o usuário move o artigo 3 do texto da proposição em modo de revisão e, em seguida, altera o seu texto
- **THEN** a descrição da marca passa de "Dispositivo movido (antes era "Artigo Art. 3º")" para "Dispositivo movido (antes era "Artigo Art. 3º") e texto alterado"

#### Scenario: Operação revertida
- **WHEN** o usuário desfaz a alteração de texto de um artigo movido em modo de revisão
- **THEN** a descrição da marca volta a "Dispositivo movido (antes era "Artigo Art. 3º")"

### Requirement: Mesma descrição na sessão de edição e no documento reaberto
Para a mesma revisão, o sistema SHALL exibir a mesma descrição na sessão em que ela foi criada e no documento reaberto a partir do arquivo salvo, sem depender de informação que o arquivo não guarda.

#### Scenario: Salvar e reabrir
- **WHEN** o usuário move um artigo do texto da proposição duas vezes em modo de revisão, altera o seu texto, salva e abre o arquivo
- **THEN** a marca do artigo reaberto tem a mesma descrição que tinha antes de salvar: "Dispositivo movido (antes era "Artigo Art. 3º") e texto alterado"

#### Scenario: Dispositivo de alteração de norma movido, salvo e reaberto
- **WHEN** o usuário move um dispositivo de alteração de norma em modo de revisão, salva e abre o arquivo
- **THEN** a marca do dispositivo reaberto tem a mesma descrição que tinha antes de salvar: "Dispositivo movido (posição original <n>)"

#### Scenario: Revisão de dispositivo adicionado
- **WHEN** o usuário adiciona um dispositivo em modo de revisão, salva e abre o arquivo
- **THEN** a marca do dispositivo reaberto descreve "Dispositivo adicionado"

### Requirement: Descrição de dispositivo removido reconhecida pelo editor
Quando a revisão é de exclusão, a descrição da marca SHALL ser exatamente "Dispositivo removido", porque o editor a usa para decidir quais ações oferecer ao dispositivo excluído.

#### Scenario: Dispositivo excluído
- **WHEN** o usuário, em modo de revisão, exclui um artigo
- **THEN** a descrição da marca é "Dispositivo removido", e o editor continua tratando o dispositivo como excluído
