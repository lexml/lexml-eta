## ADDED Requirements

### Requirement: Recuperação dos comentários da justificação ao abrir

Ao abrir um documento, o sistema SHALL recriar no editor da justificação cada `span` de `id` com prefixo `_tc` que pertença a uma sequência gravada como trecho comentado, no mesmo ponto do texto e com o mesmo conteúdo, e SHALL exibir na aba "Comentários" cada sequência, com os comentários na ordem gravada, o autor identificado pelo registro `Usuarios` e a data no horário local. Os fragmentos `_tc<id>_<n>` com a mesma parte `<id>` SHALL voltar como um único trecho da mesma sequência; um `id` `_tc<id>` sem sufixo SHALL ser lido como trecho de um só fragmento. O alerta e a pendência de comentários SHALL refletir o documento aberto.

#### Scenario: Documento com comentário

- **WHEN** o usuário abre um documento cuja justificação tem um `span` `_tc` referenciado por um `SequenciaComentario` com dois `Comentario` de `refIdUsuario` igual a `sf:fulano`, registrado em `Usuarios` com nome "Fulano de Tal"
- **THEN** o trecho é exibido destacado como comentado
- **AND** a aba "Comentários" exibe a sequência com os dois comentários, com "Fulano de Tal" como autor e a data no horário local
- **AND** a aba Avisos exibe o alerta de comentários

#### Scenario: Trecho em vários fragmentos

- **WHEN** o usuário abre um documento com um trecho comentado gravado em dois `span`, `_tc<id>_1` e `_tc<id>_2`, em parágrafos diferentes
- **THEN** a aba "Comentários" exibe uma única sequência
- **AND** excluir essa sequência retira o destaque dos dois fragmentos

#### Scenario: Comentário do usuário atual

- **WHEN** o usuário abre um documento com um comentário cujo `refIdUsuario` é o identificador do usuário atual do editor
- **THEN** esse comentário exibe o botão "Editar"

#### Scenario: Comentário em vários parágrafos

- **WHEN** o usuário abre um documento com um `Comentario` de dois `p`
- **THEN** a aba exibe o comentário em duas linhas

#### Scenario: Autor não registrado

- **WHEN** o usuário abre um documento com um `Comentario` de `refIdUsuario` igual a `sf:fulano` sem registro correspondente em `Usuarios`
- **THEN** o comentário é exibido com `sf:fulano` como autor, sem impedir a abertura

#### Scenario: Salvar e reabrir preserva os comentários

- **WHEN** o usuário salva um documento com comentários na justificação, abre o arquivo salvo e o salva novamente sem alterações
- **THEN** o segundo arquivo tem a mesma `Justificacao` e os mesmos `Comentarios` e `Usuarios` do primeiro

### Requirement: Tolerância a comentários inconsistentes ao abrir

A abertura SHALL NOT falhar por causa de comentários inconsistentes. Um `span` `_tc` sem `SequenciaComentario` correspondente SHALL virar texto comum. Um `SequenciaComentario` sem trecho correspondente na justificação, sem nenhum `Comentario` ou que referencie um elemento que não seja um `span` `_tc` (como um dispositivo da articulação) SHALL ser descartado. Um `Comentario` com data inválida SHALL usar a data e a hora da abertura.

#### Scenario: Trecho sem sequência

- **WHEN** o usuário abre um documento cuja justificação tem um `span` `_tc` sem `SequenciaComentario`
- **THEN** o texto do `span` é exibido sem destaque e a aba "Comentários" não exibe sequência para ele

#### Scenario: Sequência sem trecho

- **WHEN** o usuário abre um documento com um `SequenciaComentario` cujo `refIdElementoComentado` não existe na justificação
- **THEN** a sequência não é exibida e o documento é aberto normalmente

#### Scenario: Sequência sobre dispositivo da articulação

- **WHEN** o usuário abre um documento com um `SequenciaComentario` cujo `refIdElementoComentado` é o `id` de um dispositivo
- **THEN** a sequência não é exibida e o documento é aberto normalmente
