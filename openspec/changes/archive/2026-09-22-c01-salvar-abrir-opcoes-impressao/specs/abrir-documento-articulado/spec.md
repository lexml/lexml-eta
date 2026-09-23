## ADDED Requirements

### Requirement: Recuperação das opções de impressão ao abrir
Ao abrir um documento, o sistema SHALL aplicar ao formulário de opções de impressão os valores do grupo `OpcoesImpressao` dos metadados do LexEdit. Cada atributo ausente, ou com valor fora do tipo esperado, SHALL assumir o valor padrão da aplicação (brasão impresso, cabeçalho vazio, espaço entre linhas normal e tamanho de letra 14), sem impedir a leitura dos demais atributos. `tamanhoFonte` SHALL aceitar qualquer inteiro positivo. O valor padrão SHALL ser o mesmo independentemente da aplicação consumidora e das opções de impressão padrão informadas por ela na inicialização.

#### Scenario: Documento com todas as opções de impressão
- **WHEN** o usuário abre um documento cujo grupo `OpcoesImpressao` tem `imprimirBrasao` falso, `textoCabecalho` "Gabinete do Senador", `tamanhoFonte` 18 e `reduzirEspacoEntreLinhas` verdadeiro
- **THEN** o formulário de opções de impressão exibe "Imprimir brasão" desmarcado, o cabeçalho "Gabinete do Senador", o tamanho de letra 18 e "Reduzir espaço entre linhas" marcado

#### Scenario: Documento com parte dos atributos
- **WHEN** o usuário abre um documento cujo grupo `OpcoesImpressao` contém somente `textoCabecalho` igual a "Liderança"
- **THEN** o formulário exibe o cabeçalho "Liderança" e os valores padrão nas demais opções

#### Scenario: Atributo com valor inválido
- **WHEN** o usuário abre um documento cujo grupo `OpcoesImpressao` tem `tamanhoFonte` igual a zero ou a um valor não numérico, e `imprimirBrasao` falso
- **THEN** o formulário exibe o tamanho de letra 14 e "Imprimir brasão" desmarcado

#### Scenario: Documento sem o grupo de opções de impressão
- **WHEN** o usuário abre um documento sem `MetadadoProprietario` ou sem o grupo `OpcoesImpressao`
- **THEN** o formulário exibe os valores padrão em todas as opções de impressão

#### Scenario: Salvar e reabrir preserva as opções
- **WHEN** o usuário altera as opções de impressão, salva o documento e abre o arquivo salvo
- **THEN** o formulário exibe as mesmas opções de impressão do momento em que o documento foi salvo
