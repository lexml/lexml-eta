# Spec Delta

## ADDED Requirements

### Requirement: Reconstrução das revisões da hierarquia ao abrir
Ao abrir um documento com `RevisoesArticulacao` nos metadados do LexEdit, o sistema SHALL reconstruir as revisões da hierarquia e ativar o modo de revisão, exibindo as marcas de cada revisão nos dispositivos correspondentes, com o autor e a data registrados. As revisões do arquivo SHALL prevalecer sobre quaisquer revisões informadas pela aplicação consumidora. Documento sem revisões SHALL ser aberto sem modo de revisão e sem marcas.

#### Scenario: Marca de dispositivo adicionado
- **WHEN** o usuário abre um documento com uma revisão `adicionado` para o artigo 4
- **THEN** o artigo 4 é exibido com a marca de dispositivo adicionado, com o autor e a data da revisão, e o modo de revisão fica ativo

#### Scenario: Documento sem revisões
- **WHEN** o usuário abre um documento sem `RevisoesArticulacao`
- **THEN** o editor abre sem modo de revisão e sem marcas de revisão

#### Scenario: Revisões de documento anterior não são herdadas
- **WHEN** o usuário abre um documento com revisões e, em seguida, abre outro documento sem revisões
- **THEN** o segundo documento é exibido sem marcas de revisão

### Requirement: Reconstrução de dispositivos excluídos ao abrir
Ao abrir um documento com revisões `excluido`, o sistema SHALL exibir cada dispositivo excluído, com sua hierarquia, na posição indicada por seu identificador (`_<id-base>-exc<sequencial>`): depois do dispositivo que antecede o `<id-base>` e antes do dispositivo de identificador `<id-base>`, na ordem do sequencial.

#### Scenario: Excluídos consecutivos
- **WHEN** o usuário abre um documento com `art1`, `art2` e dois dispositivos excluídos, `_art2-exc1` e `_art2-exc2`
- **THEN** o editor exibe, nesta ordem, `art1`, o excluído `_art2-exc1`, o excluído `_art2-exc2` e `art2`

#### Scenario: Excluído com filhos
- **WHEN** o usuário abre um documento cujo artigo excluído tem parágrafo e incisos
- **THEN** o editor exibe o artigo excluído com o parágrafo e os incisos, na hierarquia e na ordem salvas

### Requirement: Reconstrução das operações de cada revisão
Ao abrir um documento, o sistema SHALL reconstruir, a partir do atributo `revisao` e do conteúdo filho de cada `RevisaoArticulacao`, as operações registradas (`adicionado`, `excluido`, `alterado`, `movido`, `transformado`), inclusive combinadas, de modo que as marcas exibidas descrevam todas as operações e o conteúdo, a posição e o tipo anteriores possam ser restaurados. Operações desconhecidas, como `alteracaoRotulo`, SHALL ser ignoradas, sem impedir a leitura das demais.

#### Scenario: Revisão combinada
- **WHEN** o usuário abre um documento com uma revisão `movido;3,alterado` e o texto original como filho
- **THEN** o dispositivo é exibido com a marca da revisão, e rejeitá-la devolve o dispositivo à posição 3 com o texto original

#### Scenario: Operação desconhecida
- **WHEN** o usuário abre um documento com uma revisão `alteracaoRotulo;art2_cpt_alt1_art3`
- **THEN** o documento abre normalmente, sem erro, e as demais revisões são reconstruídas

### Requirement: Revisões reabertas podem ser resolvidas
O sistema SHALL permitir aceitar e rejeitar, após abrir o documento, as revisões reconstruídas, com o mesmo resultado das revisões criadas na sessão de edição.

#### Scenario: Rejeitar uma exclusão
- **WHEN** o usuário abre um documento com um artigo excluído em revisão e rejeita a revisão
- **THEN** o artigo volta à articulação, na posição indicada pelo identificador do excluído

#### Scenario: Rejeitar uma adição
- **WHEN** o usuário abre um documento com um artigo adicionado em revisão e rejeita a revisão
- **THEN** o artigo é removido da articulação

#### Scenario: Aceitar uma alteração de texto
- **WHEN** o usuário abre um documento com uma revisão `alterado` e a aceita
- **THEN** o dispositivo mantém o texto revisado, sem marca de revisão

### Requirement: Recuperação do autor e da data das revisões
Ao abrir um documento, o sistema SHALL identificar o autor de cada revisão pelo registro `Usuarios`, usando `idUsuario`, `nome` e `sigla`, e SHALL exibir a data de cada revisão no horário local. Quando `refIdUsuario` não constar de `Usuarios`, o autor SHALL ter o próprio `refIdUsuario` como identificador e nome.

#### Scenario: Autor registrado
- **WHEN** o usuário abre um documento com uma revisão de `refIdUsuario` igual a `sf:fulano`, registrado em `Usuarios` com nome "Fulano de Tal"
- **THEN** a marca da revisão exibe "Fulano de Tal" como autor

#### Scenario: Autor não registrado
- **WHEN** o usuário abre um documento com uma revisão de `refIdUsuario` igual a `sf:fulano` e sem registro correspondente em `Usuarios`
- **THEN** a revisão é exibida com `sf:fulano` como autor, sem impedir a abertura

### Requirement: Tolerância a revisões inconsistentes
Ao abrir um documento, o sistema SHALL ignorar a revisão que referenciar, em `refIdDispositivo`, um dispositivo inexistente na articulação, ou cujo atributo `revisao` não tenha nenhuma operação reconhecida, sem impedir a abertura nem a reconstrução das demais revisões.

#### Scenario: Revisão de dispositivo inexistente
- **WHEN** o usuário abre um documento com uma revisão cujo `refIdDispositivo` não existe na articulação
- **THEN** o documento abre sem erro, e as demais revisões são exibidas

### Requirement: Ida e volta das revisões da hierarquia
Ao salvar um documento aberto com revisões da hierarquia, sem alterações, o sistema SHALL gerar um arquivo com as mesmas revisões, os mesmos identificadores de excluídos, os mesmos usuários e as mesmas pendências do arquivo aberto.

#### Scenario: Salvar o documento reaberto
- **WHEN** o usuário salva um documento com adição, exclusão, alteração, movimentação e transformação, abre o arquivo salvo e o salva novamente sem alterações
- **THEN** o segundo arquivo registra as mesmas revisões, na mesma ordem, e os mesmos usuários e pendências do primeiro
