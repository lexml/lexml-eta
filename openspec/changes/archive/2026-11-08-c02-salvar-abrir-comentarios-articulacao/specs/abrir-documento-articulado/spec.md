## ADDED Requirements

### Requirement: Recuperação dos comentários da articulação ao abrir

Ao abrir um documento, o sistema SHALL ligar cada `SequenciaComentario` cujo `refIdElementoComentado` seja o `id` de um dispositivo ao dispositivo correspondente, exibindo o ícone de comentário na linha e a sequência na aba "Comentários", com o local "No texto", a identificação do dispositivo e os comentários na ordem gravada, com autor e data como na justificação. Um `refIdElementoComentado` igual ao `id` do caput de um artigo SHALL ser ligado ao artigo; o `id` do próprio artigo também SHALL ser aceito. Um `refIdElementoComentado` igual ao `id` de um dispositivo gravado numa revisão de exclusão SHALL ser ligado ao dispositivo excluído reaberto. O alerta e a pendência de comentários SHALL refletir o documento aberto, também no modo anexo de parecer.

#### Scenario: Documento com comentário num dispositivo

- **WHEN** o usuário abre um documento com um `SequenciaComentario` de `refIdElementoComentado` igual a `art3_cpt_inc1`
- **THEN** o inciso I do art. 3º exibe o ícone de comentário
- **AND** a aba "Comentários" exibe a sequência com o local "No texto" e a identificação "inciso I do art. 3º"
- **AND** a aba Avisos exibe o alerta de comentários

#### Scenario: Caput de artigo

- **WHEN** o usuário abre um documento com um `SequenciaComentario` de `refIdElementoComentado` igual a `art2_cpt`
- **THEN** o art. 2º exibe o ícone de comentário e a sequência é identificada como "art. 2º"

#### Scenario: Id do artigo

- **WHEN** o usuário abre um documento com um `SequenciaComentario` de `refIdElementoComentado` igual a `art2`
- **THEN** o art. 2º exibe o ícone de comentário

#### Scenario: Dispositivo excluído em revisão

- **WHEN** o usuário abre um documento com um parágrafo excluído em revisão cuja sequência foi gravada com o `id` do parágrafo na revisão
- **THEN** o parágrafo é exibido como excluído, com o ícone de comentário, e a sequência é exibida na aba
- **AND** rejeitar a revisão mantém a sequência, e aceitá-la remove a sequência

#### Scenario: Comentário acompanha a renumeração depois de abrir

- **WHEN** o usuário abre um documento com um comentário no art. 3º e inclui um artigo antes dele
- **THEN** a sequência continua na aba, identificada como "art. 4º"

#### Scenario: Salvar e reabrir preserva os comentários da articulação

- **WHEN** o usuário salva um documento com comentários na articulação e na justificação, abre o arquivo salvo e o salva novamente sem alterações
- **THEN** o segundo arquivo tem os mesmos `Comentarios` e `Usuarios` do primeiro

## MODIFIED Requirements

### Requirement: Tolerância a comentários inconsistentes ao abrir

A abertura SHALL NOT falhar por causa de comentários inconsistentes. Um `span` `_tc` sem `SequenciaComentario` correspondente SHALL virar texto comum. Um `SequenciaComentario` SHALL ser descartado quando não tiver nenhum `Comentario` ou quando o `refIdElementoComentado` não corresponder nem a um trecho comentado da justificação nem a um dispositivo do documento, inclusive os gravados em revisões de exclusão. Quando mais de um `SequenciaComentario` se referir ao mesmo dispositivo, SHALL valer o primeiro. Um `Comentario` com data inválida SHALL usar a data e a hora da abertura.

#### Scenario: Trecho sem sequência

- **WHEN** o usuário abre um documento cuja justificação tem um `span` `_tc` sem `SequenciaComentario`
- **THEN** o texto do `span` é exibido sem destaque e a aba "Comentários" não exibe sequência para ele

#### Scenario: Sequência sem trecho

- **WHEN** o usuário abre um documento com um `SequenciaComentario` cujo `refIdElementoComentado` tem prefixo `_tc` e não existe na justificação
- **THEN** a sequência não é exibida e o documento é aberto normalmente

#### Scenario: Sequência sobre dispositivo da articulação

- **WHEN** o usuário abre um documento com um `SequenciaComentario` cujo `refIdElementoComentado` é `art99` e o documento não tem esse dispositivo
- **THEN** a sequência não é exibida e o documento é aberto normalmente

#### Scenario: Duas sequências no mesmo dispositivo

- **WHEN** o usuário abre um documento com dois `SequenciaComentario` de `refIdElementoComentado` igual a `art1_cpt`
- **THEN** a aba exibe só a primeira sequência para o art. 1º
