# Spec Delta

## MODIFIED Requirements

### Requirement: Grupo de dados básicos
A aba "Dados da proposição" SHALL exibir, antes dos demais grupos, o grupo "Dados básicos" com: a descrição do documento, sem rótulo; o ano do documento, exceto no substitutivo do Senado; o colegiado apreciador, com a sigla da comissão entre parênteses quando houver, inclusive no Plenário; "Apresentado em parecer" (Sim ou Não); e o botão "Alterar dados básicos".

#### Scenario: Proposição em Plenário
- **WHEN** o documento em edição é um PL do Senado de 2026, com colegiado Plenário e sem anexo de parecer
- **THEN** o grupo exibe "Projeto de Lei (PL)", ano 2026, colegiado "Plenário", "Apresentado em parecer: Não" e o botão habilitado

#### Scenario: Colegiado em comissão
- **WHEN** o colegiado apreciador é Comissão com sigla `CCJ`
- **THEN** o grupo exibe o colegiado como "Comissão (CCJ)"

#### Scenario: Plenário com comissão
- **WHEN** o colegiado apreciador é Plenário com sigla de comissão `CCJC`
- **THEN** o grupo exibe o colegiado como "Plenário (CCJC)"

#### Scenario: Substitutivo do Senado sem ano
- **WHEN** o documento em edição é substitutivo do Senado
- **THEN** o grupo não exibe o ano do documento

#### Scenario: Grupo atualizado após a alteração
- **WHEN** os dados básicos são alterados com sucesso
- **THEN** o grupo passa a exibir os dados novos
