# Spec Delta

## ADDED Requirements

### Requirement: Destino e forma de apresentação no contexto do documento
Além dos campos do requisito "Contexto do documento", o contexto SHALL trazer `colegiadoDestino` (`tipoColegiado` e, quando há comissão, `siglaComissao`) e `anexoParecer`, com os valores que o resultado do fluxo teria se fosse concluído naquele momento (requisitos "Destino do documento" e "Forma de apresentação").

#### Scenario: Proposição para o Plenário
- **WHEN** o usuário importa um arquivo para uma proposição com destino Plenário e a caixa "Este documento será apresentado em parecer" desmarcada
- **THEN** o contexto traz `colegiadoDestino` com `tipoColegiado` `Plenário` e sem `siglaComissao`, e `anexoParecer` `false`

#### Scenario: Substitutivo para comissão
- **WHEN** o usuário importa um arquivo para um substitutivo do `SF` com destino Comissão, a comissão CCJ escolhida e a caixa marcada
- **THEN** o contexto traz `colegiadoDestino` com `tipoColegiado` `Comissão` e `siglaComissao` `CCJ`, e `anexoParecer` `true`

#### Scenario: Plenário na CD em substitutivo
- **WHEN** a casa é `CD`, a espécie é Substitutivo, o destino é Plenário com a comissão CCJC e a Tela 2b carrega os documentos
- **THEN** o contexto da listagem traz `colegiadoDestino` com `tipoColegiado` `Plenário` e `siglaComissao` `CCJC`

#### Scenario: Forma de apresentação alterada pelo usuário
- **WHEN** o usuário desmarca a caixa num substitutivo e importa um arquivo
- **THEN** o contexto traz `anexoParecer` `false`

### Requirement: Placeholders do destino e da forma de apresentação
`urlImportacaoArquivo` e `urlDocumentosMateria` SHALL aceitar também os placeholders `{tipoColegiado}` (`Plenário` ou `Comissão`), `{siglaComissao}` (vazio sem comissão) e `{anexoParecer}` (`true` ou `false`), preenchidos com os valores do contexto e codificados como componente de URL. URL sem esses placeholders MUST NOT ser alterada por eles.

#### Scenario: Destino na URL de importação
- **WHEN** `urlImportacaoArquivo` é `/api/importacao?destino={tipoColegiado}&comissao={siglaComissao}&parecer={anexoParecer}` e o usuário importa um arquivo para um substitutivo do `SF` com destino Comissão, a comissão CCJ e a caixa marcada
- **THEN** o `POST` vai para `/api/importacao?destino=Comiss%C3%A3o&comissao=CCJ&parecer=true`

#### Scenario: Plenário sem comissão
- **WHEN** a URL tem `{siglaComissao}` e o destino é Plenário sem comissão
- **THEN** o parâmetro é enviado vazio

## MODIFIED Requirements

### Requirement: Recarga da lista ao mudar o contexto
A lista da Tela 2b SHALL depender da matéria consultada e do contexto do documento. Ao entrar na Tela 2b com contexto diferente do da lista carregada, o componente SHALL descartar a lista e a seleção e recarregá-la; resposta de uma carga anterior SHALL ser descartada. Com o mesmo contexto e a mesma matéria, a lista e a seleção SHALL ser preservadas.

#### Scenario: Troca de espécie com a mesma matéria
- **WHEN** o usuário lista os documentos do PL 4/2025 para um substitutivo, volta à Tela 1, muda para subemenda substitutiva com o mesmo PL 4/2025 e chega à Tela 2b
- **THEN** a lista é recarregada com o contexto da subemenda e a seleção anterior é descartada

#### Scenario: Troca de destino ou de forma de apresentação
- **WHEN** o usuário lista os documentos do PL 4/2025 para um substitutivo, volta à Tela 1, troca a comissão, o destino ou a caixa "Este documento será apresentado em parecer" e chega à Tela 2b
- **THEN** a lista é recarregada com o novo contexto e a seleção anterior é descartada

#### Scenario: Carga em andamento durante a troca
- **WHEN** a lista de um contexto ainda está sendo carregada e o usuário volta, muda a espécie e retorna à Tela 2b
- **THEN** a resposta da carga anterior é descartada e a lista exibida é a do contexto atual

#### Scenario: Voltar sem mudar o contexto
- **WHEN** o usuário volta da Tela 2b à Tela 2 e retorna sem alterar a Tela 1
- **THEN** a lista e a seleção são preservadas e `onListarDocumentos` não é chamado de novo
