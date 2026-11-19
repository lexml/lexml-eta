# barra-ferramentas-justificacao Specification

## Purpose

Garantir que cada controle da barra de ferramentas do editor da justificação diga, ao passar o mouse, o que faz.

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
