# nota-rodape Specification

## Purpose

Editar a nota de rodapé da justificação num modal que aceita um só parágrafo, para que a nota exibida corresponda à gravada no LexML (`NotaDeRodape` inline, sem parágrafos).

## Requirements

### Requirement: Nota de rodapé com um só parágrafo
O editor da nota de rodapé SHALL manter o texto da nota num só parágrafo. Enter e Shift+Enter SHALL NOT criar parágrafo nem quebra de linha. O sistema SHALL exibir no modal o aviso "A nota de rodapé admite um só parágrafo." quando uma dessas teclas for ignorada. Texto colado ou inserido com quebras de linha SHALL entrar no mesmo parágrafo, com cada quebra trocada por um espaço e com o negrito, o itálico, o sublinhado e os links preservados.

#### Scenario: Enter não cria parágrafo
- **WHEN** o usuário digita "Primeira parte" no editor da nota, tecla Enter e digita " segunda parte"
- **THEN** o editor da nota tem um só parágrafo, com o texto "Primeira parte segunda parte"
- **AND** o modal exibe o aviso "A nota de rodapé admite um só parágrafo."

#### Scenario: Shift+Enter não cria quebra
- **WHEN** o usuário tecla Shift+Enter no editor da nota
- **THEN** o editor da nota continua com um só parágrafo e sem quebra de linha
- **AND** o modal exibe o aviso "A nota de rodapé admite um só parágrafo."

#### Scenario: Colar texto com quebras de linha
- **WHEN** o usuário cola no editor da nota um texto com os parágrafos "Primeiro" e "Segundo", com "Segundo" em negrito
- **THEN** o editor da nota tem um só parágrafo, com o texto "Primeiro Segundo", e "Segundo" continua em negrito

#### Scenario: Nota salva com um só parágrafo
- **WHEN** o usuário edita uma nota, tecla Enter no meio do texto e salva
- **THEN** a nota de rodapé da justificação tem o texto num só parágrafo

### Requirement: Nota com mais de um parágrafo aberta no modal
Ao abrir no modal uma nota de rodapé com mais de um parágrafo (criada antes desta regra ou recebida do host), o sistema SHALL exibi-la num só parágrafo, com os parágrafos unidos por um espaço e com a formatação preservada. Fechar o modal sem alterações SHALL NOT pedir confirmação de descarte. Salvar o modal SHALL gravar a nota unida, mesmo sem outra alteração.

#### Scenario: Nota antiga aberta unida
- **WHEN** o usuário edita uma nota de rodapé com os parágrafos "Primeiro." e "Segundo."
- **THEN** o editor da nota exibe um só parágrafo, com o texto "Primeiro. Segundo."

#### Scenario: Fechar sem alterar não pede confirmação
- **WHEN** o usuário abre no modal uma nota com dois parágrafos e o fecha sem alterar o texto
- **THEN** o modal fecha sem pedir confirmação, e a nota da justificação não muda

#### Scenario: Salvar sem alterar grava a nota unida
- **WHEN** o usuário abre no modal uma nota com os parágrafos "Primeiro." e "Segundo." e salva sem alterar o texto
- **THEN** a nota de rodapé da justificação passa a ter um só parágrafo, com o texto "Primeiro. Segundo."

#### Scenario: Nota de um parágrafo aberta sem mudança
- **WHEN** o usuário abre no modal uma nota de um só parágrafo, com negrito e link, e salva sem alterar o texto
- **THEN** a nota de rodapé da justificação não muda
