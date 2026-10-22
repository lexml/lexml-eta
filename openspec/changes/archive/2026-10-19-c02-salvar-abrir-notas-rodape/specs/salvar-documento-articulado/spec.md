## REMOVED Requirements

### Requirement: Notas de rodapé e revisões na justificação gravada
**Reason**: As notas de rodapé passam a ser gravadas (issue #993). A exceção temporária continua só para as revisões de texto, e por isso o requisito foi substituído por "Revisões de texto na justificação gravada" e "Notas de rodapé na justificação gravada".
**Migration**: O cenário "Justificação com marcas de revisão" continua em "Revisões de texto na justificação gravada". O cenário "Justificação com nota de rodapé" é substituído pelos cenários de "Notas de rodapé na justificação gravada".

## ADDED Requirements

### Requirement: Revisões de texto na justificação gravada
Enquanto as marcas de revisão de texto não forem gravadas no arquivo (issue #994), o sistema SHALL gravar a justificação sem elas: o texto incluído em revisão fica sem a marca, e o texto excluído em revisão é descartado, junto com as notas de rodapé que estiverem nele. O restante da justificação SHALL ser gravado normalmente.

#### Scenario: Justificação com marcas de revisão
- **WHEN** o usuário salva uma justificação com um trecho incluído e um trecho excluído em revisão de texto
- **THEN** o texto gravado contém o trecho incluído, sem marca, e não contém o trecho excluído

### Requirement: Notas de rodapé na justificação gravada
Ao gravar a justificação, o sistema SHALL gravar cada nota de rodapé como `NotaDeRodape` no ponto do texto em que está a referência, com o texto da nota inline e com negrito, itálico, sublinhado e link. O sistema SHALL NOT gravar o número nem o identificador interno da nota. Uma nota com mais de um parágrafo SHALL ser gravada num só, com os parágrafos unidos por um espaço. O arquivo salvo SHALL ser válido pelo esquema LexML.

#### Scenario: Nota no meio de um parágrafo
- **WHEN** o usuário salva uma justificação com o parágrafo "O conceito é definido em regulamento" seguido de uma nota de rodapé com o texto "Texto formatado da nota.", com "formatado" em negrito, e de um ponto final
- **THEN** o parágrafo gravado tem o texto "O conceito é definido em regulamento", um `NotaDeRodape` com "Texto ", um `b` com "formatado" e " da nota.", e depois o ponto final
- **AND** o `NotaDeRodape` não contém o número da nota

#### Scenario: Nota com link
- **WHEN** o usuário salva uma justificação com uma nota de rodapé que tem um link para `https://www.congressonacional.leg.br`
- **THEN** o `NotaDeRodape` gravado contém um `a` com `xlink:href` igual a esse endereço e sem `rel`

#### Scenario: Nota com dois parágrafos
- **WHEN** o usuário salva uma justificação com uma nota de rodapé de dois parágrafos, "Primeiro." e "Segundo."
- **THEN** o `NotaDeRodape` gravado tem o texto "Primeiro. Segundo.", sem `p` nem `span` de parágrafo

#### Scenario: Notas em lista e em célula de tabela
- **WHEN** o usuário salva uma justificação com uma nota de rodapé num item de lista e outra num parágrafo de célula de tabela
- **THEN** cada `NotaDeRodape` é gravado dentro do item de lista e do `span` da célula em que está a referência
