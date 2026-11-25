# barra-ferramentas-justificacao Specification

## Purpose

Garantir que cada controle da barra de ferramentas do editor da justificação diga, ao passar o mouse, o que faz, e que o cursor mostrado sobre cada botão corresponda ao estado dele, habilitado ou não.

## Requirements

### Requirement: Todo controle da barra de ferramentas tem dica
Cada botão e cada menu da barra de ferramentas do editor da justificação SHALL exibir uma dica (tooltip) não vazia ao passar o mouse, descrevendo a ação. Num menu suspenso, a dica SHALL ficar no controle que abre o menu, sem se repetir sobre os itens do menu aberto.

#### Scenario: Inserir link
- **WHEN** o usuário passa o mouse sobre o botão de inserir link
- **THEN** a dica "Inserir link" é exibida

#### Scenario: Inserir tabela
- **WHEN** o usuário passa o mouse sobre o menu de inserir tabela
- **THEN** a dica "Inserir tabela" é exibida

#### Scenario: Formatar tabela
- **WHEN** o usuário passa o mouse sobre o menu de formatar tabela
- **THEN** a dica "Formatar tabela" é exibida

#### Scenario: Alinhamento e estilo
- **WHEN** o usuário passa o mouse sobre o menu de alinhamento ou sobre o seletor de estilo do parágrafo
- **THEN** são exibidas as dicas "Alinhamento" e "Estilo do parágrafo", respectivamente

#### Scenario: Barra inteira
- **WHEN** a barra de ferramentas da justificação é montada
- **THEN** nenhum botão nem controle de abrir menu fica sem dica

### Requirement: Botão desabilitado não mostra o cursor de clique
Na barra de ferramentas do editor da justificação, um botão desabilitado SHALL mostrar a seta comum ao passar o mouse, e não o cursor de mão. Um botão habilitado SHALL continuar mostrando o cursor de mão. Os botões "Aceitar revisões" e "Rejeitar revisões" desabilitados SHALL manter o cursor de proibido do componente.

#### Scenario: Adicionar comentário sem texto selecionado
- **WHEN** não há texto selecionado e o usuário passa o mouse sobre o botão "Adicionar comentário", desabilitado
- **THEN** o cursor é a seta comum

#### Scenario: Qualquer botão desabilitado
- **WHEN** um botão da barra, como negrito ou nota de rodapé, fica desabilitado
- **THEN** o cursor sobre ele é a seta comum

#### Scenario: Aceitar e rejeitar revisões sem revisão
- **WHEN** não há revisão na justificação e o usuário passa o mouse sobre "Aceitar revisões" ou "Rejeitar revisões"
- **THEN** o cursor é o de proibido, como hoje
