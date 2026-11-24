# Spec Delta

## MODIFIED Requirements

### Requirement: Validação estrutural na abertura
O sistema SHALL validar estruturalmente o documento recebido — raiz Jsonix `LexML`, formato da URN, listas de dispositivos representadas como arrays, e identificadores de elementos únicos e sem espaços — antes de substituir o documento em edição. No modo flexível de validação de numeração (ver `numeracao-repetida`), os identificadores de dispositivo, de `Caput`, de `Pena` e de alteração SHALL poder se repetir; os identificadores dos demais elementos SHALL continuar únicos. A regra vale também para o documento de modelo da nova proposição e para a reabertura em "Alterar dados básicos".

#### Scenario: Documento estruturalmente válido é aceito
- **WHEN** um arquivo com a raiz `LexML`, URN válida e articulação bem formada é aberto
- **THEN** o sistema aceita a entrada e prossegue para interpretá-la

#### Scenario: Raiz incorreta é rejeitada
- **WHEN** o arquivo aberto não tem a raiz Jsonix `LexML` (por exemplo, o invólucro `Proposicao` do formato antigo)
- **THEN** o sistema rejeita a abertura com um erro descritivo, sem alterar o documento em edição

#### Scenario: Identificadores repetidos são rejeitados
- **WHEN** o documento contém dois elementos com o mesmo `id`, no modo rígido de validação de numeração
- **THEN** o sistema rejeita a abertura com um erro descritivo

#### Scenario: Identificadores de dispositivo repetidos no modo flexível
- **WHEN** o documento contém dois artigos com o mesmo `id`, e com isso os mesmos ids de caput e de incisos, no modo flexível
- **THEN** o sistema aceita a entrada e prossegue para interpretá-la

#### Scenario: Outros identificadores repetidos no modo flexível
- **WHEN** o documento contém dois elementos `Remissao` com o mesmo `id`, no modo flexível
- **THEN** o sistema rejeita a abertura com um erro descritivo

#### Scenario: Modelo da nova proposição no modo flexível
- **WHEN** o host cria uma nova proposição com um documento de modelo que tem dois artigos com o mesmo `id`, no modo flexível
- **THEN** a nova proposição é criada com a articulação do modelo, inclusive os artigos de mesmo número

#### Scenario: JSON malformado é rejeitado
- **WHEN** o conteúdo do arquivo não é um JSON válido
- **THEN** o sistema rejeita a abertura com um erro descritivo, sem tentar interpretar parcialmente o conteúdo
