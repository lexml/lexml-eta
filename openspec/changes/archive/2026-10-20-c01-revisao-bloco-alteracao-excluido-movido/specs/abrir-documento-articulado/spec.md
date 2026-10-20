## ADDED Requirements

### Requirement: Reconstrução de bloco de alteração em dispositivo excluído ao abrir
Ao abrir um documento com revisão `excluido` cujo dispositivo contém `Alteracao`, o sistema SHALL exibir o dispositivo excluído com o bloco de alteração reconstruído, na hierarquia e na ordem salvas, associando os dispositivos do bloco à revisão do dispositivo excluído, de modo que exista uma única marca de revisão.

#### Scenario: Excluído com bloco de alteração
- **WHEN** o usuário abre um documento cujo artigo excluído altera uma norma e contém um artigo de alteração com parágrafo
- **THEN** o editor exibe o artigo excluído, o artigo e o parágrafo do bloco, com uma única marca de revisão e a contagem de revisões igual a um

#### Scenario: Rejeitar a exclusão restaura o bloco
- **WHEN** o usuário abre esse documento e rejeita a revisão de exclusão
- **THEN** o artigo volta à articulação com a norma alterada e o bloco de alteração completo

#### Scenario: Ida e volta
- **WHEN** o usuário exclui, em revisão, um artigo que altera norma, salva, abre o arquivo e salva novamente
- **THEN** o bloco de alteração do excluído é preservado nos dois arquivos

### Requirement: Reconstrução das operações de dispositivo movido com bloco de alteração
Ao abrir um documento com revisão `movido` ou `transformado` em dispositivo que contém bloco de alteração, o sistema SHALL reconstruir uma única revisão principal, e os dispositivos do bloco SHALL ser associados a ela sem revisões principais próprias.

#### Scenario: Artigo movido reaberto
- **WHEN** o usuário abre um documento com uma revisão `movido;3` em um artigo que altera norma
- **THEN** o editor exibe uma única marca de revisão, e rejeitá-la devolve o artigo e o bloco à posição 3
