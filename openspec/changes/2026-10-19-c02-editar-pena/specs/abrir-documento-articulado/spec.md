## ADDED Requirements

### Requirement: Recuperação da pena ao abrir
Ao abrir um documento, o sistema SHALL recuperar a pena de cada dispositivo que a tiver (inclusive o `Caput` e dispositivos de bloco de alteração) como último filho desse dispositivo, com o texto e o rótulo gravados. O separador do rótulo SHALL ser normalizado: o rótulo é o texto antes do separador (hífen, meia-risca, travessão ou o caractere de controle U+0096), sem espaços nas pontas, seguido de " –". A normalização SHALL NOT gerar revisão. Uma pena com mais de um parágrafo SHALL ter os parágrafos unidos num único texto.

#### Scenario: Abrir documento com pena
- **WHEN** o usuário abre um arquivo em que o `Paragrafo` `art2_par2` tem incisos e a `Pena` `art2_par2_pena`
- **THEN** o editor exibe a pena depois dos incisos do § 2º, com o rótulo e o texto gravados

#### Scenario: Rótulo com hífen
- **WHEN** o arquivo traz uma pena com o `Rotulo` "Pena -"
- **THEN** a pena é exibida com o rótulo "Pena –", e o próximo salvamento grava "Pena –"

#### Scenario: Rótulo fora da lista
- **WHEN** o arquivo traz uma pena com o `Rotulo` "Sanção -"
- **THEN** a pena é exibida com o rótulo "Sanção –", e o modal de rótulo abre com "Outro" e "Sanção"

#### Scenario: Ida e volta
- **WHEN** o usuário abre um arquivo com penas, salva sem editar e abre o novo arquivo
- **THEN** as penas têm os mesmos identificadores, rótulos e textos

### Requirement: Reconstrução do rótulo anterior da pena ao abrir
Ao abrir um documento com uma revisão `alterado` de uma pena cujo estado anterior traz um `Rotulo`, o sistema SHALL reconstruir o rótulo anterior, de modo que a marca tenha a mesma descrição da sessão em que foi criada e que rejeitar a revisão restaure o rótulo anterior. Sem `Rotulo` no estado anterior, o rótulo anterior SHALL ser considerado igual ao atual.

#### Scenario: Rejeitar a troca de rótulo reaberta
- **WHEN** o usuário abre um documento com a pena "Infração –" e uma revisão `alterado` cujo estado anterior tem o `Rotulo` "Pena –", e rejeita a revisão
- **THEN** a pena volta a exibir "Pena –"

#### Scenario: Estado anterior sem rótulo
- **WHEN** o usuário abre um documento com uma revisão `alterado` de uma pena cujo estado anterior não tem `Rotulo`
- **THEN** a revisão é tratada como alteração só do texto, com o rótulo anterior igual ao atual
