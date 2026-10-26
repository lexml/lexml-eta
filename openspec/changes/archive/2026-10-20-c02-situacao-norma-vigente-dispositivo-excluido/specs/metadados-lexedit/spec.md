## ADDED Requirements

### Requirement: Situação na norma vigente dos dispositivos de bloco excluído
O sistema SHALL incluir, em `refIdsDispositivosExistentes` e `refIdsDispositivosNovos`, os identificadores dos dispositivos de bloco de alteração contidos em dispositivos excluídos em revisão, com o identificador gravado na revisão `excluido` (prefixo `_` e sufixo `-exc<sequencial>`), segundo a situação que tinham ao serem excluídos. Ao abrir, o sistema SHALL reaplicar essa situação aos dispositivos reconstruídos do excluído.

#### Scenario: Bloco excluído com dispositivos existente e novo
- **WHEN** o usuário, em modo de revisão, exclui um artigo que altera norma, com um artigo "Existente" e um parágrafo "Novo" no bloco, e salva
- **THEN** o id do artigo do bloco excluído consta em `refIdsDispositivosExistentes` e o do parágrafo em `refIdsDispositivosNovos`, ambos com o prefixo do identificador do excluído

#### Scenario: Rejeitar a exclusão devolve a situação
- **WHEN** o usuário abre esse documento e rejeita a revisão de exclusão
- **THEN** o artigo volta exibido como "Existente" e o parágrafo como "Novo", com o rótulo original

#### Scenario: Sem bloco de alteração no excluído
- **WHEN** o usuário exclui, em revisão, um artigo sem bloco de alteração e salva
- **THEN** nenhum id de dispositivo excluído consta nas listas de situação
