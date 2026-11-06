# Spec Delta

## Purpose

Define como o `lexml-eta` exibe os dados básicos do documento em edição (tipo, documento referenciado, colegiado, forma de apresentação), como solicita ao host a alteração desses dados e como aplica os dados alterados sem perder o restante do documento.

## ADDED Requirements

### Requirement: Grupo de dados básicos
A aba "Data, Autoria e Impressão" SHALL exibir, antes dos demais grupos, o grupo "Dados básicos" com: a descrição do documento, sem rótulo; o ano do documento, exceto no substitutivo do Senado; o colegiado apreciador; "Apresentado em parecer" (Sim ou Não); e o botão "Alterar dados básicos".

#### Scenario: Proposição em Plenário
- **WHEN** o documento em edição é um PL do Senado de 2026, com colegiado Plenário e sem anexo de parecer
- **THEN** o grupo exibe "Novo Projeto de Lei (PL)", ano 2026, colegiado "Plenário", "Apresentado em parecer: Não" e o botão habilitado

#### Scenario: Colegiado em comissão
- **WHEN** o colegiado apreciador é Comissão com sigla `CCJ`
- **THEN** o grupo exibe o colegiado como "Comissão (CCJ)"

#### Scenario: Substitutivo do Senado sem ano
- **WHEN** o documento em edição é substitutivo do Senado
- **THEN** o grupo não exibe o ano do documento

#### Scenario: Grupo atualizado após a alteração
- **WHEN** os dados básicos são alterados com sucesso
- **THEN** o grupo passa a exibir os dados novos

### Requirement: Descrição do documento
A descrição SHALL ser derivada da URN e da URN do documento referenciado, com o nome do tipo por extenso e a flexão de gênero (Novo/Nova, ao/à). Documento sem número (`999999`) SHALL ser descrito como novo; documento com número SHALL ser descrito pela sigla, número e ano.

#### Scenario: Nova proposição
- **WHEN** a URN é de PEC sem número
- **THEN** a descrição é "Nova Proposta de Emenda à Constituição (PEC)"

#### Scenario: Proposição com número
- **WHEN** a URN é de PL número 123 de 2026
- **THEN** a descrição é "Projeto de Lei (PL) nº 123, de 2026"

#### Scenario: Substitutivo do Senado
- **WHEN** a URN é de substitutivo do Senado ao PL nº 10, de 2025
- **THEN** a descrição é "Substitutivo ao Projeto de Lei (PL) nº 10, de 2025"

#### Scenario: Substitutivo da Câmara
- **WHEN** a URN é de substitutivo da Câmara de sigla `SBT` cujo documento referenciado é o PL nº 10, de 2025
- **THEN** a descrição é "Substitutivo (SBT) ao Projeto de Lei (PL) nº 10, de 2025"

#### Scenario: Subemenda substitutiva
- **WHEN** a URN é de subemenda substitutiva de sigla `SSP` cujo documento referenciado é o PL nº 10, de 2025
- **THEN** a descrição é "Subemenda Substitutiva (SSP) ao Projeto de Lei (PL) nº 10, de 2025"

#### Scenario: PLV
- **WHEN** a URN é de PLV sem número cujo documento referenciado é a MPV nº 1.200, de 2026
- **THEN** a descrição é "Novo Projeto de Lei de Conversão (MPV nº 1200, de 2026)"

### Requirement: Solicitação de alteração ao host
O botão "Alterar dados básicos" SHALL emitir ao host o evento `alteracao-dados-basicos-solicitada`, cujo `detail` contém os dados básicos atuais: `urn`, `urnDocumentoReferenciado` (quando houver), `epigrafe`, `preambulo`, `colegiadoApreciador` (quando houver), `outrosMetadados` e `anexoParecer`. O `lexml-eta` MUST NOT alterar o documento ao emitir o evento.

#### Scenario: Clique no botão
- **WHEN** o usuário clica em "Alterar dados básicos" fora do modo de revisão
- **THEN** o evento é emitido com os dados básicos atuais e o documento não muda

### Requirement: Alteração bloqueada em modo de revisão
Em modo de revisão, o botão "Alterar dados básicos" SHALL ficar desabilitado, com uma mensagem informativa abaixo dele explicando que os dados básicos não podem ser alterados em modo de revisão. Ao sair do modo de revisão, o botão SHALL voltar a ficar habilitado e a mensagem SHALL sumir.

#### Scenario: Ativar o modo de revisão
- **WHEN** o usuário ativa o modo de revisão
- **THEN** o botão fica desabilitado e a mensagem é exibida abaixo dele

#### Scenario: Desativar o modo de revisão
- **WHEN** o usuário desativa o modo de revisão
- **THEN** o botão volta a ficar habilitado e a mensagem some

### Requirement: Alteração bloqueada em tipo não suportado
Quando o documento em edição é de tipo não suportado para criação (ver `interface-lexml-eta`), o botão "Alterar dados básicos" SHALL ficar desabilitado, com mensagem informativa de que o tipo do documento não permite a alteração dos dados básicos.

#### Scenario: Documento de tipo não suportado aberto
- **WHEN** o host abre um documento de tipo não suportado
- **THEN** o botão fica desabilitado e a mensagem é exibida abaixo dele

### Requirement: Documento preservado na alteração
Ao aplicar os dados básicos alterados, o sistema SHALL manter o restante do documento em edição: articulação, ementa, remissões, data do fecho, autoria, opções de impressão, anexos, justificação e notas de rodapé, salvo as exclusões previstas nesta spec. O histórico de desfazer e refazer SHALL ser descartado.

#### Scenario: Troca de colegiado
- **WHEN** o documento tem texto, autoria, anexos e justificação, e os dados básicos são alterados só no colegiado
- **THEN** o documento continua com o mesmo texto, autoria, anexos e justificação, e com o colegiado novo

#### Scenario: Desfazer após a alteração
- **WHEN** os dados básicos são alterados e o usuário aciona desfazer
- **THEN** nenhuma edição anterior à alteração é desfeita

### Requirement: Autoria descartada ao mudar de casa
Quando a casa responsável derivada da URN nova é diferente da casa responsável atual, o sistema SHALL descartar a autoria informada, deixando a autoria vazia do editor. Quando a casa não muda, a autoria SHALL ser mantida.

#### Scenario: De PL do Senado para PLV
- **WHEN** um PL do Senado com autoria passa a PLV (casa `CN`)
- **THEN** o documento fica sem autoria

#### Scenario: Mesma casa
- **WHEN** um PL do Senado com autoria passa a PLP do Senado
- **THEN** a autoria é mantida

### Requirement: Justificação descartada ao passar a anexo de parecer
Quando o documento não era anexo de parecer e passa a ser, o sistema SHALL descartar a justificação, com suas notas de rodapé. Quando o documento deixa de ser anexo de parecer, a justificação SHALL ficar vazia.

#### Scenario: Passar a anexo de parecer
- **WHEN** um documento com justificação passa a ser apresentado em parecer
- **THEN** o documento fica sem justificação e sem a aba "Justificação"

#### Scenario: Deixar de ser anexo de parecer
- **WHEN** um anexo de parecer deixa de ser apresentado em parecer
- **THEN** a aba "Justificação" volta a ser exibida, com a justificação vazia

### Requirement: Local do fecho recalculado
Ao aplicar os dados básicos alterados, o local do fecho SHALL ser recalculado a partir do colegiado apreciador, descartando o local lido do arquivo.

#### Scenario: Plenário para Comissão
- **WHEN** um documento aberto com local "Sala das Sessões" passa a ter colegiado Comissão
- **THEN** o local gravado ao salvar é "Sala da Comissão"

#### Scenario: Local do arquivo descartado
- **WHEN** um documento aberto com local diferente do derivado tem os dados básicos alterados sem mudar o colegiado
- **THEN** o local gravado ao salvar é o derivado do colegiado

### Requirement: Data da última modificação mantida
A alteração dos dados básicos MUST NOT alterar a data da última modificação do documento aberto; ela só muda ao salvar.

#### Scenario: Documento aberto de arquivo
- **WHEN** um documento aberto com data da última modificação tem os dados básicos alterados
- **THEN** a data da última modificação exposta pelo componente é a lida do arquivo
