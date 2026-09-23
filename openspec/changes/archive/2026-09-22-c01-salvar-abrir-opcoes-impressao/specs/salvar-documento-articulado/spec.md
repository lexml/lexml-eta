## ADDED Requirements

### Requirement: Serialização das opções de impressão
Ao salvar, o sistema SHALL registrar as opções de impressão do documento em edição no grupo `OpcoesImpressao` dos metadados do LexEdit, sempre com os quatro atributos (`imprimirBrasao`, `textoCabecalho`, `reduzirEspacoEntreLinhas` e `tamanhoFonte`), inclusive quando os valores coincidirem com o padrão da aplicação. O valor registrado SHALL ser o do momento em que o documento é obtido, sem compartilhar referência com o formulário de opções de impressão.

#### Scenario: Opções de impressão alteradas pelo usuário
- **WHEN** o usuário desmarca "Imprimir brasão", informa o cabeçalho "Gabinete do Senador", escolhe o tamanho de letra 16, marca "Reduzir espaço entre linhas" e salva o documento
- **THEN** o arquivo salvo contém o grupo `OpcoesImpressao` com `imprimirBrasao` falso, `textoCabecalho` igual a "Gabinete do Senador", `tamanhoFonte` igual a 16 e `reduzirEspacoEntreLinhas` verdadeiro

#### Scenario: Opções de impressão com os valores padrão
- **WHEN** o usuário salva um documento sem ter alterado nenhuma opção de impressão
- **THEN** o arquivo salvo contém o grupo `OpcoesImpressao` com os quatro atributos preenchidos com os valores exibidos no formulário

#### Scenario: Alteração posterior ao salvar
- **WHEN** o usuário obtém o documento para salvar e, em seguida, altera o texto do cabeçalho no formulário
- **THEN** o documento obtido anteriormente mantém o texto do cabeçalho do momento em que foi obtido
