## ADDED Requirements

### Requirement: Recuperação das notas de rodapé ao abrir
Ao abrir um documento, o sistema SHALL recriar no editor da justificação cada `NotaDeRodape` como nota de rodapé, no mesmo ponto do texto e com o mesmo texto e formatação. As notas SHALL ser numeradas pela ordem em que aparecem na justificação, sem usar nenhum número gravado no arquivo. A lista de notas de rodapé da aba "Notas" SHALL refletir as notas do documento aberto.

#### Scenario: Documento com notas de rodapé
- **WHEN** o usuário abre um documento cuja justificação tem duas notas de rodapé, a primeira com texto em negrito
- **THEN** o editor da justificação exibe as referências numeradas 1 e 2, na ordem do texto
- **AND** a nota 1 tem o texto com o negrito
- **AND** a aba "Notas" lista as duas notas

#### Scenario: Documento sem notas de rodapé
- **WHEN** o usuário abre um documento sem `NotaDeRodape` na justificação, depois de ter adicionado uma nota de rodapé no editor
- **THEN** o editor da justificação não exibe nenhuma nota, e a aba "Notas" informa que não há notas de rodapé

#### Scenario: Nota editada depois de abrir
- **WHEN** o usuário abre um documento com uma nota de rodapé e altera o texto dessa nota
- **THEN** salvar o documento grava o `NotaDeRodape` com o texto alterado, no mesmo ponto do texto

#### Scenario: Salvar e reabrir preserva as notas de rodapé
- **WHEN** o usuário salva um documento com notas de rodapé na justificação, abre o arquivo salvo e o salva novamente sem alterações
- **THEN** o segundo arquivo tem a mesma `Justificacao` do primeiro, com os mesmos `NotaDeRodape`
