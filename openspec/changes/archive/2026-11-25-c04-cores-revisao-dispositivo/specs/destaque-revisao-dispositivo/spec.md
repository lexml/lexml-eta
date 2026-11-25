## ADDED Requirements

### Requirement: Cor da letra conforme o tipo da revisão
Na articulação, o dispositivo com marca de revisão SHALL ter a letra do texto, do rótulo e do título verde (`green`) quando foi incluído, azul (`blue`) quando foi alterado e vermelha (`red`) quando foi excluído, as mesmas cores do editor de emendas para dispositivo adicionado, modificado e suprimido. A exclusão SHALL valer sobre as demais operações, e a inclusão sobre a alteração; movimentação, transformação e alteração de rótulo SHALL contar como alteração. Sem marca de revisão, o dispositivo SHALL manter as cores normais.

#### Scenario: Dispositivo incluído em revisão
- **WHEN** o usuário inclui um artigo com o modo de revisão ligado
- **THEN** o texto e o rótulo do artigo incluído ficam em verde

#### Scenario: Dispositivo alterado em revisão
- **WHEN** o usuário altera o texto de um artigo com o modo de revisão ligado
- **THEN** o texto e o rótulo do artigo ficam em azul

#### Scenario: Dispositivo excluído em revisão
- **WHEN** o usuário exclui um artigo com o modo de revisão ligado
- **THEN** o texto e o rótulo do artigo excluído ficam em vermelho, e o texto continua riscado

#### Scenario: Dispositivo movido ou transformado
- **WHEN** o documento aberto tem revisões de dispositivo movido ou transformado
- **THEN** esses dispositivos ficam em azul

#### Scenario: Revisão aceita ou rejeitada
- **WHEN** o usuário aceita ou rejeita a revisão de um dispositivo
- **THEN** o dispositivo volta às cores normais
