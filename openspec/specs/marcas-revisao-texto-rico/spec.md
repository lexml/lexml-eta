# marcas-revisao-texto-rico Specification

## Purpose

Define como o editor de texto rico da justificação exibe as marcas de revisão de texto (inclusão e exclusão) e como destaca a revisão sob o cursor, sem usar cor de fundo, que fica reservada ao destaque de comentários.

## Requirements

### Requirement: Exibição do texto incluído

O editor de texto rico SHALL exibir o texto incluído em revisão com a letra verde, sem cor de fundo e sem sublinhado.

#### Scenario: Inclusão exibida em verde

- **WHEN** a justificação contém um trecho incluído em revisão
- **THEN** o trecho é exibido com a letra verde
- **AND** o trecho não tem cor de fundo nem sublinhado

### Requirement: Exibição do texto excluído

O editor de texto rico SHALL exibir o texto excluído em revisão com um traço vermelho sobre o texto, sem cor de fundo. O traço MUST ser contínuo ao longo do trecho, inclusive sobre partes com outra formatação (negrito, itálico) ou com a referência de nota de rodapé. O texto excluído MUST NOT receber a verificação ortográfica do navegador.

#### Scenario: Exclusão exibida tachada em vermelho

- **WHEN** a justificação contém um trecho excluído em revisão
- **THEN** o trecho é exibido com um traço vermelho sobre o texto
- **AND** o trecho não tem cor de fundo

#### Scenario: Exclusão com formatação interna

- **WHEN** um trecho excluído em revisão contém uma parte em negrito
- **THEN** o traço vermelho aparece sobre todo o trecho, inclusive a parte em negrito

#### Scenario: Exclusão sem verificação ortográfica

- **WHEN** um trecho excluído em revisão contém uma palavra com erro de grafia
- **THEN** o navegador não sublinha a palavra como erro de grafia

### Requirement: Moldura da revisão sob o cursor

Quando o cursor estiver numa marca de revisão, o editor SHALL emoldurar todos os trechos dessa revisão: em verde na inclusão e em vermelho na exclusão. Trechos da mesma revisão que se sucedem sem texto entre eles MUST formar uma única moldura. A moldura MUST ser removida quando o cursor sair da marca. Com o cursor fora de qualquer marca, nenhuma revisão é emoldurada.

#### Scenario: Cursor numa inclusão

- **WHEN** o usuário posiciona o cursor dentro de um trecho incluído em revisão
- **THEN** o trecho é emoldurado em verde

#### Scenario: Revisão em vários trechos

- **WHEN** uma exclusão atravessa um negrito e por isso é exibida em vários trechos
- **AND** o usuário posiciona o cursor em um desses trechos
- **THEN** todos os trechos dessa exclusão são emoldurados em vermelho
- **AND** os trechos contíguos aparecem como uma única moldura, sem bordas laterais entre eles

#### Scenario: Substituição

- **WHEN** uma revisão de substituição tem um trecho excluído seguido de um trecho incluído
- **AND** o usuário posiciona o cursor no trecho incluído
- **THEN** só o trecho incluído é emoldurado

#### Scenario: Cursor sai da marca

- **WHEN** o cursor está numa marca de revisão emoldurada
- **AND** o usuário move o cursor para um texto sem revisão
- **THEN** nenhuma revisão fica emoldurada

### Requirement: Destaque restrito à tela

A moldura e a desativação da verificação ortográfica SHALL existir apenas na exibição do editor. O texto da justificação entregue pelo editor (ao host e ao salvar o documento) MUST NOT conter atributos ou classes vindos desse destaque.

#### Scenario: Texto entregue sem marcas de destaque

- **WHEN** o cursor está numa marca de revisão emoldurada
- **AND** o texto da justificação é obtido do editor
- **THEN** o texto não contém a classe da moldura nem o atributo de verificação ortográfica
