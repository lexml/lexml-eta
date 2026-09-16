## ADDED Requirements

### Requirement: Serialização de remissões internas inválidas
Ao salvar uma remissão interna cujo dispositivo de destino foi excluído, o sistema SHALL preservar o último destino conhecido no `xlink:href` do elemento `Remissao` (nunca um valor substituto sem correspondência com um dispositivo real), SHALL atribuir a esse elemento um identificador estável no formato `_ri` seguido de dígitos, e SHALL listar os identificadores de todas as remissões inválidas do documento no grupo `RemissoesInternasInvalidas` do ponto de extensão de metadados do LexEdit.

#### Scenario: Remissão inválida preserva o destino conhecido
- **WHEN** o documento em edição contém uma remissão interna marcada como inválida, com um destino conhecido antes da exclusão
- **THEN** o elemento `Remissao` correspondente no arquivo salvo tem `xlink:href` igual a esse destino conhecido

#### Scenario: Identificador estável entre salvamentos sucessivos
- **WHEN** um documento com uma remissão inválida é salvo duas vezes seguidas sem nenhuma edição nesse dispositivo entre as duas ações
- **THEN** o identificador atribuído ao elemento `Remissao` é o mesmo nos dois arquivos gerados

#### Scenario: Lista de remissões inválidas nos metadados
- **WHEN** o documento em edição contém mais de uma remissão interna inválida
- **THEN** o arquivo salvo lista, no grupo de remissões internas inválidas dos metadados do LexEdit, exatamente os identificadores de todos os elementos `Remissao` inválidos presentes na articulação

#### Scenario: Documento sem remissão inválida não gera a lista
- **WHEN** o documento em edição não contém nenhuma remissão interna inválida
- **THEN** o arquivo salvo não contém o grupo de remissões internas inválidas nos metadados do LexEdit

### Requirement: Pendência de remissões internas inválidas
Quando o documento em edição contém ao menos uma remissão interna inválida, o sistema SHALL incluir, na lista de pendências dos metadados do LexEdit, um item informando que há remissões internas inválidas a corrigir.

#### Scenario: Pendência presente com remissão inválida
- **WHEN** o documento em edição contém ao menos uma remissão interna inválida
- **THEN** o arquivo salvo contém, na lista de pendências, um item referente à correção de remissões internas inválidas

#### Scenario: Pendência ausente sem remissão inválida
- **WHEN** o documento em edição não contém nenhuma remissão interna inválida
- **THEN** o arquivo salvo não contém nenhum item de pendência referente a remissões internas inválidas
