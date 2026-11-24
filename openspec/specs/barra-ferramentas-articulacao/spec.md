# barra-ferramentas-articulacao Specification

## Purpose
Definir o comportamento dos controles da barra de ferramentas do editor do texto articulado, como o cursor que cada botão mostra conforme esteja habilitado ou não.

## Requirements

### Requirement: Botão desabilitado não mostra o cursor de clique
Na barra de ferramentas do editor do texto articulado, um botão desabilitado SHALL mostrar a seta comum ao passar o mouse, e não o cursor de mão. Um botão habilitado SHALL continuar mostrando o cursor de mão.

#### Scenario: Adicionar remissão sem texto selecionado
- **WHEN** não há texto selecionado e o usuário passa o mouse sobre o botão "Adicionar remissão", desabilitado
- **THEN** o cursor é a seta comum

#### Scenario: Adicionar remissão com texto selecionado
- **WHEN** há texto selecionado e o usuário passa o mouse sobre o botão "Adicionar remissão", habilitado
- **THEN** o cursor é a mão

#### Scenario: Adicionar comentário desabilitado
- **WHEN** o botão "Adicionar comentário" está desabilitado e o usuário passa o mouse sobre ele
- **THEN** o cursor é a seta comum

#### Scenario: Qualquer botão desabilitado
- **WHEN** um botão da barra, como negrito ou desfazer, fica desabilitado
- **THEN** o cursor sobre ele é a seta comum
