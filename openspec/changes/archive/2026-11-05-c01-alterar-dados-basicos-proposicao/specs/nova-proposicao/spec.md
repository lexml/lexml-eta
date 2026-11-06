# Spec Delta

## ADDED Requirements

### Requirement: Modo de edição de dados básicos
O componente SHALL oferecer um modo de edição de dados básicos, ativado pelo host por `iniciarModoEdicao`, junto com os dados iniciais: `urn` (obrigatória), `urnDocumentoReferenciado`, `colegiadoApreciador` e `anexoParecer`. Nesse modo, o componente SHALL exibir só a Tela 1, com o título "Alterar dados básicos" e os botões **Continuar** e **Cancelar**.

#### Scenario: Abrir em modo de edição
- **WHEN** o host ativa o modo de edição com os dados de um PL do Senado
- **THEN** o componente exibe a Tela 1 com o título "Alterar dados básicos", sem acesso às Telas 2 e 3

#### Scenario: Cancelar a edição
- **WHEN** o usuário clica em **Cancelar** no modo de edição
- **THEN** o componente emite o evento de cancelamento, sem resultado

### Requirement: Tela 1 preenchida a partir dos dados iniciais
No modo de edição, a Tela 1 SHALL ser preenchida a partir dos dados iniciais: espécie, siglas, número e ano lidos da URN e da URN do documento referenciado; destino lido do colegiado; forma de apresentação lida de `anexoParecer`. O PLV SHALL ser reconhecido pela sigla do tipo da própria URN, e a medida provisória lida da URN do documento referenciado.

#### Scenario: Substitutivo do Senado
- **WHEN** a URN inicial é de substitutivo do Senado ao PL nº 10, de 2025
- **THEN** a espécie é Substitutivo e a proposição identificada é o PL nº 10, de 2025

#### Scenario: PLV
- **WHEN** a URN inicial é de PLV e a URN do documento referenciado é da MPV nº 1200, de 2026
- **THEN** a espécie é Proposição, a sigla é PLV e a medida provisória é a nº 1200, de 2026

#### Scenario: Subemenda substitutiva na Câmara
- **WHEN** a URN inicial é de subemenda substitutiva da Câmara cujo documento referenciado é o PL nº 10, de 2025
- **THEN** a espécie é Subemenda substitutiva, com a sigla e o ano da subemenda e o PL nº 10, de 2025 como proposição

### Requirement: Número do documento preservado
No modo de edição, quando a URN inicial tem número diferente de `999999`, o componente SHALL exibir esse número como texto fixo no lugar de `s/n` e SHALL mantê-lo na URN do resultado enquanto a espécie e a sigla do documento não mudarem. Mudando espécie ou sigla, o número SHALL voltar a `s/n` (`999999`).

#### Scenario: Só o colegiado muda
- **WHEN** a URN inicial é do PL nº 123, de 2026 e o usuário só troca o destino
- **THEN** a URN do resultado mantém o número 123

#### Scenario: Sigla muda
- **WHEN** a URN inicial é do PL nº 123, de 2026 e o usuário troca a sigla para PLP
- **THEN** a URN do resultado tem o número `999999`

### Requirement: Documento referenciado inicial considerado verificado
No modo de edição, o documento referenciado vindo dos dados iniciais (proposição do substitutivo ou da subemenda, ou medida provisória do PLV) SHALL ser considerado verificado e existente, sem consultar a URL de verificação, até o usuário mudar sua sigla, número ou ano.

#### Scenario: Continuar sem verificar
- **WHEN** um substitutivo é aberto em modo de edição e o usuário só troca o destino
- **THEN** **Continuar** fica habilitado sem que o usuário clique em **Verificar**

#### Scenario: Referência alterada
- **WHEN** o usuário muda o número da proposição referenciada
- **THEN** a verificação passa a ser exigida para habilitar **Continuar**

### Requirement: Confirmação de perda de dados na edição
No modo de edição, ao clicar em **Continuar**, o componente SHALL pedir confirmação, num único modal com Sim e Não, quando a alteração causar perda de autoria ou de justificação. **Sim** SHALL emitir o resultado; **Não** SHALL manter a Tela 1 sem emitir resultado.

#### Scenario: Troca de casa confirmada
- **WHEN** um PL do Senado é alterado para PLV e o usuário confirma com Sim
- **THEN** o componente emite o resultado da edição

#### Scenario: Perda de autoria e de justificação juntas
- **WHEN** a alteração troca a casa e passa o documento a anexo de parecer
- **THEN** um único modal exibe as duas mensagens

#### Scenario: Passagem a anexo recusada
- **WHEN** o usuário marca "Este documento será apresentado em parecer" num documento que não era anexo e responde Não
- **THEN** o componente continua na Tela 1 e nenhum resultado é emitido

#### Scenario: Sem perda de dados
- **WHEN** o usuário só troca o destino e clica em **Continuar**
- **THEN** o resultado é emitido sem pedir confirmação

### Requirement: Mensagens de perda de dados
O modal de confirmação SHALL exibir "Ao alterar para um tipo de outra casa legislativa a autoria informada será perdida. Deseja continuar?" quando a casa responsável derivada da URN nova for diferente da derivada da URN inicial, e "Ao apresentar o documento em parecer, a justificação informada será perdida. Deseja continuar?" quando o documento não era anexo de parecer e passa a ser.

#### Scenario: Troca de casa
- **WHEN** um PL do Senado (casa `SF`) é alterado para PLV (casa `CN`)
- **THEN** o modal exibe a mensagem de perda da autoria

#### Scenario: Deixar de ser anexo
- **WHEN** um anexo de parecer deixa de ser apresentado em parecer, sem trocar de casa
- **THEN** nenhum modal é exibido

### Requirement: Resultado do modo de edição
No modo de edição, **Continuar** SHALL emitir o evento `dados-basicos-alterados`, distinto do evento de conclusão da nova proposição, com os mesmos dados deste exceto `texto`; os outros metadados são tratados só pelo host. Epígrafe e preâmbulo SHALL ser obtidos como na criação.

#### Scenario: Evento de edição
- **WHEN** o usuário conclui o modo de edição
- **THEN** o componente emite `dados-basicos-alterados` com `urn`, `epigrafe`, `preambulo`, `colegiadoDestino`, `anexoParecer` e, quando houver, `urnDocumentoReferenciado`, sem `texto`, e não emite o evento de conclusão da nova proposição

### Requirement: Reinício do componente
O componente SHALL expor `reiniciar()`, que volta ao estado original: modo de criação, sem dados iniciais, Tela 1 com os valores padrão e nenhum dado informado pelo usuário. A configuração recebida SHALL ser mantida.

#### Scenario: Reiniciar após edição
- **WHEN** o componente estava em modo de edição com dados preenchidos e o host chama `reiniciar()`
- **THEN** o componente exibe a Tela 1 de nova proposição com os valores padrão

#### Scenario: Reiniciar na Tela 2
- **WHEN** o usuário está na Tela 2 de uma nova proposição e o host chama `reiniciar()`
- **THEN** o componente volta à Tela 1 com os valores padrão
