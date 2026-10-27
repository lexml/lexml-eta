# Spec Delta

## Purpose

Define a tolerância do editor a rotinas assíncronas de seleção, rolagem e notificação que ainda estejam pendentes quando o componente é destruído.

## ADDED Requirements

### Requirement: Tolerância à destruição do editor com rotinas assíncronas pendentes
O editor SHALL NOT lançar exceções não tratadas quando rotinas assíncronas agendadas pela seleção de uma linha (notificação de elemento selecionado e rolagem até a linha) executarem depois que o componente foi desconectado e o Quill destruído.

#### Scenario: Editor destruído logo após o foco inicial
- **WHEN** uma proposição é carregada, a linha da ementa é marcada como atual e o componente é desconectado antes de os timers pendentes dispararem
- **THEN** nenhum erro não capturado é lançado e nenhuma ação de seleção é despachada ao estado

### Requirement: Inscrições canceladas não executam callbacks pendentes
O `Observable` SHALL NOT executar o callback de uma inscrição cancelada, mesmo quando o cancelamento ocorrer depois de a notificação ter sido agendada e antes de ela ser entregue.

#### Scenario: Inscrição cancelada entre o notify e a entrega
- **WHEN** `notify` é chamado, a inscrição é cancelada em seguida e o tempo de entrega transcorre
- **THEN** o callback da inscrição cancelada não é invocado, e callbacks de inscrições ativas continuam sendo invocados
