# Salvar Documento Articulado

## Purpose

Salvar documento articulado é a geração do arquivo de intercâmbio `documento-articulado.json` a partir do documento em edição no lexml-eta: define o contrato Jsonix LexML do arquivo, gera a identificação (definitiva ou provisória) e serializa os grupos de conteúdo suportados.

## Requirements

### Requirement: Contrato do arquivo de intercâmbio
O sistema SHALL gerar um arquivo cuja raiz é o documento Jsonix LexML (`name.namespaceURI = http://www.lexml.gov.br/1.0`, `name.localPart = LexML`), contendo `Metadado/Identificacao/URN` e `ProjetoNorma/Norma` com `ParteInicial` (Epígrafe, Ementa, Preâmbulo) e Articulação — sem o invólucro `Proposicao` usado pela demonstração anterior.

#### Scenario: Salvamento de documento válido gera a raiz LexML
- **WHEN** o usuário aciona salvar com um documento em edição
- **THEN** o arquivo produzido tem `name.namespaceURI` igual a `http://www.lexml.gov.br/1.0` e `name.localPart` igual a `LexML`, com `value.projetoNorma.norma` presente

### Requirement: Identificação provisória por sentinelas
Quando a proposição não tem número ou ano definidos, o sistema SHALL gerar a URN usando as sentinelas `9999` (ano) e `999999` (número), na ordem `:ano;número`.

#### Scenario: Ano e número desconhecidos
- **WHEN** uma nova proposição é salva sem número nem ano definidos
- **THEN** a URN gerada termina em `:9999;999999`

#### Scenario: Apenas o ano é conhecido
- **WHEN** o ano é conhecido mas o número ainda não
- **THEN** a URN usa o ano informado e a sentinela `999999` para o número

#### Scenario: Apenas o número é conhecido
- **WHEN** o número é conhecido mas o ano ainda não
- **THEN** a URN usa a sentinela `9999` para o ano e o número informado

### Requirement: Preservação da URN recebida
Quando o documento em edição já possui uma URN completa (autoridade, data, evento), o sistema SHALL preservá-la integralmente na serialização, sem reconstruí-la a partir de sigla, número e ano parciais.

#### Scenario: URN com data completa
- **WHEN** um documento com URN definitiva contendo data completa (ex.: `2019-11-11;905`) é salvo
- **THEN** a URN gravada no arquivo é idêntica à recebida

#### Scenario: URN com evento
- **WHEN** um documento com URN contendo um fragmento de evento (ex.: `...;16@data.evento;leitura;2019-03-19t14.00`) é salvo
- **THEN** a URN gravada no arquivo preserva o fragmento de evento integralmente

### Requirement: Serialização completa da parte inicial
O sistema SHALL serializar todo o conteúdo suportado da epígrafe e da ementa, e todos os parágrafos do preâmbulo — não apenas o primeiro item ou parágrafo.

#### Scenario: Preâmbulo com múltiplos parágrafos
- **WHEN** o preâmbulo contém mais de um parágrafo no editor
- **THEN** o arquivo salvo contém um elemento de parágrafo para cada parágrafo do preâmbulo, na mesma ordem

### Requirement: Serialização da articulação com preservação de texto
O sistema SHALL serializar a articulação (dispositivos, hierarquia e alterações de normas) preservando os espaços entre marcações inline e convertendo o texto do editor em caracteres literais compatíveis com o Jsonix.

#### Scenario: Espaço entre duas marcações inline
- **WHEN** o texto de um dispositivo contém duas marcações inline separadas por um espaço
- **THEN** o arquivo salvo preserva o espaço entre as duas palavras

#### Scenario: Caracteres especiais no texto
- **WHEN** o texto de um dispositivo contém caracteres como `<` ou `&`
- **THEN** o arquivo salvo representa esses caracteres literalmente, sem interpretá-los como marcação

### Requirement: Independência de documentos
Cada obtenção do documento para salvar SHALL retornar um objeto independente, sem compartilhar referências com o documento padrão do editor nem com documentos obtidos em chamadas anteriores.

#### Scenario: Duas obtenções sucessivas não compartilham estado
- **WHEN** o documento é obtido duas vezes seguidas, com uma edição realizada entre as chamadas
- **THEN** o objeto retornado na primeira chamada não é afetado pela edição realizada depois da segunda

### Requirement: Sincronização da edição pendente antes de salvar
O sistema SHALL sincronizar qualquer edição pendente no dispositivo em foco antes de obter o documento para salvar.

#### Scenario: Salvar sem sair da linha em edição
- **WHEN** o usuário aciona salvar sem ter saído do dispositivo que estava editando
- **THEN** o texto digitado naquele dispositivo é incluído no documento salvo

### Requirement: Geração do arquivo ao salvar
O sistema SHALL sempre gerar o arquivo por download do navegador, sem usar o seletor nativo de salvamento do sistema operacional, sugerindo o nome de arquivo `documento-articulado - <sigla> nº <número>, de <ano>.json` composto a partir da URN do documento sendo salvo — para que a deduplicação de nomes do próprio navegador evite sobrescrever, sem aviso, um arquivo salvo anteriormente com o mesmo nome; SHALL propagar qualquer erro ocorrido ao gerar o arquivo para a aplicação consumidora tratar.

#### Scenario: Nome do arquivo baixado
- **WHEN** o usuário aciona salvar com um documento em edição
- **THEN** o navegador inicia o download do arquivo com o nome `documento-articulado - <sigla> nº <número>, de <ano>.json`, com sigla, número e ano extraídos da URN do documento

#### Scenario: Número e/ou ano ainda não definidos
- **WHEN** a URN do documento contém as sentinelas de identificação provisória (`9999` para o ano e/ou `999999` para o número)
- **THEN** o nome do arquivo usa essas mesmas sentinelas no lugar do ano e/ou do número

#### Scenario: Falha ao gerar o arquivo
- **WHEN** ocorre um erro ao montar ou serializar o documento para download
- **THEN** o erro é propagado para a aplicação consumidora tratar

### Requirement: Rejeição de escrita para identificação inválida
O sistema SHALL rejeitar a criação do documento quando a URN informada não seguir o formato `urn:lex:br` com ano ou data seguidos do número, nessa ordem.

#### Scenario: Tentativa de criar documento com URN malformada
- **WHEN** a URN informada não corresponde ao formato esperado (ex.: ordem invertida de número e ano)
- **THEN** o sistema rejeita a operação com um erro descritivo, sem gerar arquivo

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
