## ADDED Requirements

### Requirement: Recuperação das revisões de texto ao abrir
Ao abrir um documento, o sistema SHALL recriar no editor da justificação cada `ins` e `del` como marca de revisão de texto, no mesmo ponto do texto e com o mesmo conteúdo, com o autor identificado pelo registro `Usuarios` e a data do `RevisaoTextual` correspondente no horário local. Marcas gravadas a partir da mesma revisão SHALL voltar agrupadas, para serem aceitas ou rejeitadas juntas. O contador de revisões, os botões de aceitar e rejeitar e o alerta de marcas de revisão SHALL refletir o documento aberto.

#### Scenario: Documento com marcas de revisão
- **WHEN** o usuário abre um documento cuja justificação tem um `ins` e um `del` com `RevisaoTextual` de `refIdUsuario` igual a `sf:fulano`, registrado em `Usuarios` com nome "Fulano de Tal", e data `2026-05-11T15:51:00-03:00`
- **THEN** o editor da justificação exibe o trecho incluído e o trecho excluído com as marcas de revisão
- **AND** a marca exibe "Fulano de Tal" como autor e a data no horário local
- **AND** o contador de revisões da justificação indica as duas marcas, e a aba Avisos exibe o alerta de marcas de revisão

#### Scenario: Revisão em mais de um trecho volta agrupada
- **WHEN** o usuário abre um documento com uma revisão de exclusão gravada em dois `del`, por atravessar um trecho em negrito, e rejeita essa revisão pela marca de um dos trechos
- **THEN** os dois trechos voltam ao texto sem marca

#### Scenario: Marcas reabertas podem ser resolvidas
- **WHEN** o usuário abre um documento com marcas de revisão de texto e aceita todas
- **THEN** o texto incluído fica sem marca, o texto excluído sai do texto, e salvar o documento não grava `ins`, `del`, `RevisoesTextuais` nem a pendência "Resolver marcas de revisão de texto."

#### Scenario: Autor não registrado
- **WHEN** o usuário abre um documento com um `RevisaoTextual` de `refIdUsuario` igual a `sf:fulano` sem registro correspondente em `Usuarios`
- **THEN** a marca é exibida com `sf:fulano` como autor, sem impedir a abertura

#### Scenario: Marca sem metadados de revisão
- **WHEN** o usuário abre um documento cuja justificação tem um `del` sem `RevisaoTextual` correspondente
- **THEN** o trecho excluído é exibido com a marca de revisão, com o autor "Anônimo" e a data e hora da abertura

#### Scenario: Salvar e reabrir preserva as revisões de texto
- **WHEN** o usuário salva um documento com marcas de revisão de texto na justificação, abre o arquivo salvo e o salva novamente sem alterações
- **THEN** o segundo arquivo tem a mesma `Justificacao` e os mesmos `RevisoesTextuais` e `Usuarios` do primeiro
