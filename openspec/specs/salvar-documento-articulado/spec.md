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

### Requirement: Seletores de arquivo para salvar
O sistema SHALL usar o seletor nativo de salvamento quando disponível no navegador, e um download alternativo quando não estiver disponível; SHALL retornar `false` quando o usuário cancelar a operação, e SHALL propagar qualquer erro de escrita para a aplicação consumidora tratar.

#### Scenario: Navegador com File System Access API
- **WHEN** o navegador suporta `showSaveFilePicker`
- **THEN** o sistema abre o diálogo nativo de salvamento sugerindo o nome `documento-articulado.json`

#### Scenario: Navegador sem seletor nativo
- **WHEN** o navegador não suporta `showSaveFilePicker`
- **THEN** o sistema inicia o download do arquivo com o nome `documento-articulado.json`

#### Scenario: Cancelamento do salvamento
- **WHEN** o usuário cancela o diálogo nativo de salvamento
- **THEN** a operação de salvar retorna `false`, sem lançar erro

#### Scenario: Falha ao escrever o arquivo
- **WHEN** ocorre um erro ao escrever o arquivo, não relacionado a cancelamento
- **THEN** o erro é propagado para a aplicação consumidora tratar

### Requirement: Rejeição de escrita para identificação inválida
O sistema SHALL rejeitar a criação do documento quando a URN informada não seguir o formato `urn:lex:br` com ano ou data seguidos do número, nessa ordem.

#### Scenario: Tentativa de criar documento com URN malformada
- **WHEN** a URN informada não corresponde ao formato esperado (ex.: ordem invertida de número e ano)
- **THEN** o sistema rejeita a operação com um erro descritivo, sem gerar arquivo
