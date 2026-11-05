## ADDED Requirements

### Requirement: Abas de apoio e botões de telas estreitas
O painel da direita do componente SHALL oferecer somente as abas "Notas" (fora do modo anexo de parecer) e "Atalhos". Em telas estreitas, a barra do editor SHALL oferecer somente o botão "Atalhos". O componente SHALL NOT oferecer aba, botão ou conteúdo de "Comando" ou de "Dicas", nem a propriedade `exibirAjuda`.

#### Scenario: Abas do painel da direita
- **WHEN** um documento é aberto fora do modo anexo de parecer
- **THEN** o painel da direita tem exatamente as abas "Notas" e "Atalhos"

#### Scenario: Abas no modo anexo de parecer
- **WHEN** um documento é aberto no modo anexo de parecer
- **THEN** o painel da direita tem somente a aba "Atalhos"

#### Scenario: Barra em telas estreitas
- **WHEN** o editor é exibido com largura entre 641 e 768 px
- **THEN** a barra do editor oferece o botão "Atalhos", e não há botão "Dicas"

#### Scenario: Tela muito estreita
- **WHEN** o editor é exibido com largura de até 640 px
- **THEN** a barra do editor não oferece botões de apoio (o "Atalhos" já era ocultado nessa faixa)

#### Scenario: Sem conteúdo de dicas
- **WHEN** o componente é renderizado
- **THEN** não há aba nem painel "Comando" ou "Dicas", e os elementos `lexml-eta-ajuda` e `lexml-eta-ajuda-modal` não existem
