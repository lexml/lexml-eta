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

### Requirement: Pendência de justificação não informada
Quando a justificação do documento em edição for obrigatória e não tiver texto, o sistema SHALL incluir, na lista de pendências dos metadados do LexEdit do arquivo salvo, o item "Não foi informado um texto de justificação.". A condição SHALL ser a mesma do alerta de justificação da aba Avisos. Ao abrir um documento, a lista de pendências gravada SHALL NOT ser usada para reconstruir o estado do editor.

#### Scenario: Pendência presente com justificação vazia
- **WHEN** o usuário salva um documento cuja justificação é obrigatória e está vazia
- **THEN** o arquivo salvo contém, na lista de pendências, o item "Não foi informado um texto de justificação."

#### Scenario: Pendência ausente com justificação preenchida
- **WHEN** o usuário salva um documento cuja justificação tem texto
- **THEN** o arquivo salvo não contém o item "Não foi informado um texto de justificação." na lista de pendências

#### Scenario: Pendência ausente quando a justificação não é obrigatória
- **WHEN** o usuário salva um documento no modo anexo de parecer e a justificação está vazia
- **THEN** o arquivo salvo não contém o item "Não foi informado um texto de justificação." na lista de pendências

#### Scenario: Pendência gravada não é lida ao abrir
- **WHEN** o usuário abre um arquivo cuja lista de pendências contém "Não foi informado um texto de justificação."
- **THEN** o editor recalcula a pendência a partir da justificação em edição, sem usar o item gravado

### Requirement: Ordem das pendências no arquivo salvo
Quando houver mais de uma pendência a gravar, o sistema SHALL gravar, nesta ordem, as que existirem: justificação não informada, remissões internas inválidas, revisões de texto e revisões da hierarquia.

#### Scenario: Justificação vazia e remissão inválida
- **WHEN** o usuário salva um documento com a justificação obrigatória vazia e ao menos uma remissão interna inválida
- **THEN** a lista de pendências do arquivo salvo contém exatamente "Não foi informado um texto de justificação." seguido de "Corrigir remissões internas inválidas."

#### Scenario: Remissão inválida e revisões de texto e da hierarquia
- **WHEN** o usuário salva um documento com uma remissão interna inválida, uma marca de revisão de texto na justificação e uma revisão da hierarquia
- **THEN** a lista de pendências do arquivo salvo contém exatamente "Corrigir remissões internas inválidas.", "Resolver marcas de revisão de texto." e "Resolver marcas de revisão na articulação.", nessa ordem

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

### Requirement: Serialização do local e da data do fecho
Ao salvar, o sistema SHALL registrar nos metadados do LexEdit o local do fecho e, quando informada, a data do fecho no formato `AAAA-MM-DD`. Quando a data não for informada, o atributo de data SHALL ser omitido, nunca gravado vazio. O local registrado SHALL ser o lido do documento aberto, enquanto o destino não for alterado pelo usuário; nos demais casos, SHALL ser o derivado do destino ("Sala da comissão" para comissão, "Sala das sessões" para os demais).

#### Scenario: Data informada
- **WHEN** o usuário informa a data 24/04/2026, com destino Plenário, e salva o documento
- **THEN** o arquivo salvo registra o local "Sala das sessões" e a data `2026-04-24`

#### Scenario: Data não informada
- **WHEN** o usuário escolhe "Não informar" na data e salva o documento
- **THEN** o arquivo salvo registra o local e não contém o atributo de data

#### Scenario: Local preservado de documento aberto
- **WHEN** o usuário abre um documento cujo local registrado é "Sala da comissão" e o salva sem alterar o destino
- **THEN** o arquivo salvo registra o local "Sala da comissão"

#### Scenario: Local derivado após mudança de destino
- **WHEN** o usuário abre um documento cujo local registrado é "Sala da comissão", altera o destino exibido após a abertura (ex.: para "Plenário") e salva
- **THEN** o arquivo salvo registra o local "Sala das sessões"

### Requirement: Representação textual do local e da data do fecho
Ao salvar, o sistema SHALL gerar o elemento LexML `ParteFinal/LocalDataFecho` com um parágrafo contendo o local seguido de vírgula e, quando houver data, a data por extenso seguida de ponto final. O dia SHALL ser escrito sem zero à esquerda, e o primeiro dia do mês como `1º`. A geração SHALL independer do fuso horário do navegador.

#### Scenario: Texto com data
- **WHEN** o documento é salvo com local "Sala das sessões" e data `2026-04-24`
- **THEN** `LocalDataFecho` contém o parágrafo "Sala das sessões, 24 de abril de 2026."

#### Scenario: Texto com o primeiro dia do mês
- **WHEN** o documento é salvo com local "Sala das sessões" e data `2026-05-01`
- **THEN** `LocalDataFecho` contém o parágrafo "Sala das sessões, 1º de maio de 2026."

#### Scenario: Texto com dia de um dígito
- **WHEN** o documento é salvo com local "Sala da comissão" e data `2026-03-05`
- **THEN** `LocalDataFecho` contém o parágrafo "Sala da comissão, 5 de março de 2026."

#### Scenario: Texto sem data
- **WHEN** o documento é salvo com local "Sala das sessões" e sem data
- **THEN** `LocalDataFecho` contém o parágrafo "Sala das sessões,"

### Requirement: Serialização da autoria de parlamentares
Ao salvar, o sistema SHALL registrar nos metadados do LexEdit a autoria com tipo `Parlamentar`, a opção de imprimir partido e UF e, na ordem da tela, um registro para cada parlamentar incluído com identificação, nome, sexo, sigla do partido, sigla da UF, sigla da casa legislativa e cargo. O cargo SHALL ser registrado mesmo quando vazio. Parlamentares sem identificação (linhas em branco da tela) SHALL ser desconsiderados. Quando não houver nenhum parlamentar identificado, a autoria SHALL ser omitida.

#### Scenario: Dois parlamentares
- **WHEN** o usuário inclui como autores os senadores Davi Alcolumbre (UNIÃO-AP, cargo "Presidente do Senado Federal") e Soraya Thronicke (PSB-MS, sem cargo), com a impressão de partido e UF marcada, e salva o documento
- **THEN** o arquivo salvo registra a autoria de tipo `Parlamentar`, com imprimir partido e UF verdadeiro e os dois parlamentares nessa ordem, cada um com seus sete atributos, e o cargo da segunda como texto vazio

#### Scenario: Impressão de partido e UF desmarcada
- **WHEN** o usuário desmarca "Imprimir partido e UF para os signatários" e salva o documento
- **THEN** o arquivo salvo registra imprimir partido e UF como falso

#### Scenario: Nenhum parlamentar identificado
- **WHEN** o usuário salva o documento sem nenhum parlamentar identificado na autoria
- **THEN** o arquivo salvo não contém a autoria nos metadados do LexEdit

#### Scenario: Linha de parlamentar em branco
- **WHEN** o usuário inclui um parlamentar identificado e deixa uma segunda linha de parlamentar em branco, e salva
- **THEN** o arquivo salvo registra apenas o parlamentar identificado

### Requirement: Representação textual das assinaturas de parlamentares
Ao salvar, o sistema SHALL gerar em `ParteFinal`, depois de `LocalDataFecho`, um elemento LexML `AssinaturaTexto` para cada parlamentar registrado na autoria, na mesma ordem. Cada `AssinaturaTexto` SHALL conter: um parágrafo com o tratamento e o nome em negrito; um parágrafo `(<partido> - <UF>)`, somente quando a impressão de partido e UF estiver marcada; e um parágrafo com o cargo, somente quando o cargo não for vazio. O tratamento SHALL ser "Senador" ou "Senadora" para a casa legislativa `SF`, e "Deputado" ou "Deputada" para `CD`, conforme o sexo `M` ou `F`. Sem parlamentar registrado, nenhum `AssinaturaTexto` SHALL ser gerado.

#### Scenario: Senador com cargo
- **WHEN** o documento é salvo com o parlamentar Davi Alcolumbre, sexo `M`, casa `SF`, partido UNIÃO, UF AP, cargo "Presidente do Senado Federal", e a impressão de partido e UF marcada
- **THEN** `ParteFinal` contém um `AssinaturaTexto` com os parágrafos "**Senador Davi Alcolumbre**", "(UNIÃO - AP)" e "Presidente do Senado Federal"

#### Scenario: Senadora sem cargo
- **WHEN** o documento é salvo com a parlamentar Soraya Thronicke, sexo `F`, casa `SF`, partido PSB, UF MS, sem cargo, e a impressão de partido e UF marcada
- **THEN** o `AssinaturaTexto` correspondente contém somente os parágrafos "**Senadora Soraya Thronicke**" e "(PSB - MS)"

#### Scenario: Deputada
- **WHEN** o documento é salvo com uma parlamentar de sexo `F` e casa `CD`
- **THEN** o primeiro parágrafo do `AssinaturaTexto` correspondente começa com "Deputada", em negrito com o nome

#### Scenario: Impressão de partido e UF desmarcada
- **WHEN** o documento é salvo com a impressão de partido e UF desmarcada
- **THEN** nenhum `AssinaturaTexto` contém o parágrafo de partido e UF

#### Scenario: Fecho e assinaturas juntos
- **WHEN** o documento é salvo com local, data e dois parlamentares
- **THEN** `ParteFinal` contém primeiro `LocalDataFecho` e depois os dois `AssinaturaTexto`, na ordem dos parlamentares

#### Scenario: Validação pelo esquema LexML
- **WHEN** o documento salvo com autoria de parlamentares é convertido em XML pelo conversor `jsonix-lexml`
- **THEN** o XML é válido perante o esquema LexML e o esquema do LexEdit, e a conversão de volta para JSON reproduz a mesma autoria e a mesma `ParteFinal`

### Requirement: Serialização das revisões da hierarquia
Em modo de revisão, o sistema SHALL manter a articulação do arquivo na versão atual (dispositivos excluídos não aparecem nela) e registrar cada revisão principal em `RevisoesArticulacao` dos metadados do LexEdit, com `revisao`, `refIdUsuario` e `data`. Os atributos `refIdUsuario` e `data` SHALL ser os da última operação registrada. Sem revisão, o grupo SHALL ser omitido.

#### Scenario: Dispositivo adicionado
- **WHEN** o usuário, em modo de revisão, adiciona o artigo 4 e salva
- **THEN** a articulação contém o artigo 4 em sua forma final, e `RevisoesArticulacao` contém uma revisão com `refIdDispositivo` igual a `art4` e `revisao` igual a `adicionado`

#### Scenario: Hierarquia adicionada gera uma revisão
- **WHEN** o usuário, em modo de revisão, adiciona um artigo com parágrafo e incisos e salva
- **THEN** há uma única revisão `adicionado`, referenciando o artigo, e nenhuma revisão própria para o parágrafo e os incisos

#### Scenario: Documento sem revisão
- **WHEN** o usuário salva um documento sem nenhuma revisão da hierarquia
- **THEN** o arquivo salvo não contém `RevisoesArticulacao` nem o registro `Usuarios`

### Requirement: Revisão de alteração de texto
Quando o texto ou o título de um dispositivo é alterado em revisão, o sistema SHALL gravar na articulação o texto e o título revisados e, na revisão `alterado`, o estado anterior do dispositivo como filho de `RevisaoArticulacao`: um dispositivo do mesmo tipo do dispositivo revisado, sem `id`, com o texto anterior e, quando havia título, com o `TituloDispositivo` anterior. A ausência de `TituloDispositivo` nesse filho SHALL significar que o dispositivo não tinha título. O sistema SHALL NOT gravar um parágrafo solto como filho da revisão.

#### Scenario: Texto de inciso alterado
- **WHEN** o usuário, em modo de revisão, altera o texto do inciso II do artigo 4 e salva
- **THEN** a articulação contém o novo texto, e a revisão com `refIdDispositivo` do inciso e `revisao` igual a `alterado` contém como filho um inciso, sem `id`, com o texto original

#### Scenario: Artigo alterado
- **WHEN** o usuário, em modo de revisão, altera o texto de um artigo e salva
- **THEN** o filho da revisão é um artigo, sem `id`, com o texto original no `Caput`

#### Scenario: Texto alterado em dispositivo com título
- **WHEN** o usuário, em modo de revisão, altera apenas o texto de um dispositivo que tem o título "Do objeto" e salva
- **THEN** o filho da revisão contém o texto original e o `TituloDispositivo` "Do objeto"

#### Scenario: Título adicionado
- **WHEN** o usuário, em modo de revisão, adiciona um título a um dispositivo que não tinha título e salva
- **THEN** a articulação contém o dispositivo com o novo título, e o filho da revisão contém o texto do dispositivo, sem `TituloDispositivo`

#### Scenario: Título alterado
- **WHEN** o usuário, em modo de revisão, altera o título de "Do objeto" para "Da finalidade" e salva
- **THEN** a articulação contém o título "Da finalidade", e o filho da revisão contém o `TituloDispositivo` "Do objeto" e o texto do dispositivo

#### Scenario: Título removido
- **WHEN** o usuário, em modo de revisão, remove o título "Do objeto" de um dispositivo e salva
- **THEN** a articulação contém o dispositivo sem título, e o filho da revisão contém o `TituloDispositivo` "Do objeto"

#### Scenario: Título e texto alterados
- **WHEN** o usuário, em modo de revisão, altera o título e o texto de um dispositivo e salva
- **THEN** o filho da revisão contém o título anterior e o texto anterior

#### Scenario: Título com formatação
- **WHEN** o usuário, em modo de revisão, altera um título cujo valor anterior tinha itálico e subscrito e salva
- **THEN** o `TituloDispositivo` do filho da revisão preserva o itálico e o subscrito

#### Scenario: Título restaurado ao valor original
- **WHEN** o usuário, em modo de revisão, altera o título e o restaura ao valor original antes de salvar
- **THEN** o arquivo salvo não contém revisão para esse dispositivo

### Requirement: Revisão de movimentação
Quando um dispositivo é movido em revisão, o sistema SHALL registrar `movido;<posicaoOriginal>`, onde a posição original é o sequencial, iniciando em 1, que o dispositivo ocupava antes da movimentação. Para artigos, o sequencial SHALL contar todos os artigos da articulação; para os demais dispositivos, SHALL contar todos os filhos do pai original, de qualquer tipo.

#### Scenario: Inciso movido
- **WHEN** o usuário, em modo de revisão, move o inciso III do artigo 5 para depois do inciso V e salva
- **THEN** a revisão do dispositivo movido tem `revisao` igual a `movido;3`

#### Scenario: Artigo movido para outro agrupador
- **WHEN** o usuário, em modo de revisão, move o terceiro artigo da articulação para dentro de um agrupador diferente e salva
- **THEN** a revisão tem `revisao` igual a `movido;3`, e o identificador do artigo na articulação não inclui o agrupador

### Requirement: Revisão de transformação de tipo
Quando o tipo de um dispositivo é transformado em revisão, o sistema SHALL registrar `transformado;<tipoOriginal>`, com o tipo original em minúsculas e sem acentuação.

#### Scenario: Inciso transformado em alínea
- **WHEN** o usuário, em modo de revisão, transforma um inciso em alínea e salva
- **THEN** a articulação contém a alínea, e a revisão tem `revisao` igual a `transformado;inciso`

#### Scenario: Alínea transformada em inciso
- **WHEN** o usuário, em modo de revisão, transforma uma alínea em inciso e salva
- **THEN** a revisão tem `revisao` igual a `transformado;alinea`

### Requirement: Revisão de alteração de rótulo
Quando o rótulo de um dispositivo de alteração de norma é alterado em revisão, o sistema SHALL gravar na articulação o dispositivo com o rótulo e o identificador finais e registrar `alteracaoRotulo;<idOriginal>` em `revisao`, onde `<idOriginal>` é o identificador anterior à alteração, do qual se deriva o rótulo anterior. O dispositivo filho com o estado anterior SHALL ser gravado somente quando a revisão também contém `alterado`.

#### Scenario: Parágrafo renumerado
- **WHEN** o usuário, em modo de revisão, renumera o parágrafo `art2_cpt_alt1_art3_par3-1` (`§ 3º-A`) para `§ 3º-B` e salva
- **THEN** a articulação contém o parágrafo `§ 3º-B` com o identificador final, e a revisão com `refIdDispositivo` igual ao identificador final tem `revisao` igual a `alteracaoRotulo;art2_cpt_alt1_art3_par3-1`, sem dispositivo filho

#### Scenario: Renumeração combinada com alteração de texto
- **WHEN** o usuário, em modo de revisão, renumera um parágrafo, altera o seu texto e salva
- **THEN** a revisão tem `alteracaoRotulo;<idOriginal>,alterado` e contém o texto anterior em um dispositivo filho

#### Scenario: Conversão pelo conversor LexML
- **WHEN** o arquivo com a revisão `alteracaoRotulo` é convertido em XML pelo conversor e validado com `schemas/lexedit.xsd`
- **THEN** o XML contém o atributo `revisao` com a operação e o argumento, e a validação não aponta erro

### Requirement: Operações combinadas em ordem
Quando um mesmo dispositivo sofre mais de uma operação de revisão, o sistema SHALL registrar todas no atributo `revisao`, separadas por vírgula, na ordem em que ocorreram. Uma operação já registrada SHALL NOT ser repetida, e o argumento SHALL ser o da primeira ocorrência.

#### Scenario: Movido e depois alterado
- **WHEN** o usuário, em modo de revisão, move o inciso III e depois altera o seu texto
- **THEN** a revisão tem `revisao` igual a `movido;3,alterado`, com o conteúdo original em um dispositivo filho

#### Scenario: Transformado e depois alterado
- **WHEN** o usuário, em modo de revisão, transforma um inciso em alínea e depois altera o texto
- **THEN** a revisão tem `revisao` igual a `transformado;inciso,alterado`

#### Scenario: Movido duas vezes
- **WHEN** o usuário, em modo de revisão, move o mesmo dispositivo duas vezes para posições diferentes da original
- **THEN** a revisão tem uma única operação `movido`, com a posição de antes da primeira movimentação

#### Scenario: Adicionado e depois alterado
- **WHEN** o usuário, em modo de revisão, adiciona um dispositivo e depois altera o seu texto
- **THEN** a revisão tem `revisao` igual a `adicionado`, sem conteúdo anterior

#### Scenario: Revisão sem alterado não grava conteúdo anterior
- **WHEN** o usuário, em modo de revisão, apenas adiciona, move ou transforma um dispositivo, ou apenas renumera um dispositivo de alteração de norma, e salva
- **THEN** a revisão tem apenas os atributos `refIdDispositivo`, `revisao`, `refIdUsuario` e `data`, sem dispositivo filho

### Requirement: Revisão de exclusão
Quando um dispositivo é excluído em revisão, o sistema SHALL removê-lo da articulação e registrá-lo como filho de uma `RevisaoArticulacao` com `revisao` igual a `excluido`, sem `refIdDispositivo`, preservando o dispositivo com toda a sua hierarquia (filhos, rótulos e textos).

#### Scenario: Artigo excluído
- **WHEN** o usuário, em modo de revisão, exclui o artigo 3 e salva
- **THEN** a articulação não contém o artigo excluído, e os artigos seguintes já têm rótulo e identificador finais
- **AND** `RevisoesArticulacao` contém uma revisão `excluido`, sem `refIdDispositivo`, com o artigo e seu caput como filho

#### Scenario: Artigo excluído com filhos
- **WHEN** o usuário, em modo de revisão, exclui um artigo com parágrafo e incisos e salva
- **THEN** a revisão `excluido` contém o artigo com o parágrafo e os incisos, na mesma hierarquia e ordem originais

### Requirement: Identificador dos dispositivos excluídos
O sistema SHALL identificar cada dispositivo excluído, dentro de `RevisaoArticulacao`, com o prefixo `_`, o identificador que o dispositivo ocuparia na posição em que aparece na edição e o sufixo `-exc<sequencial>`, em que o sequencial numera, em ordem de posição, os excluídos com o mesmo identificador-base. O identificador SHALL ser calculado ao salvar, refletindo a posição final.

#### Scenario: Artigo excluído
- **WHEN** o usuário, em modo de revisão, exclui o artigo 2 de um documento com artigos 1, 2 e 3 e salva
- **THEN** o artigo excluído tem o identificador `_art2-exc1`, e o antigo artigo 3 aparece na articulação como `art2`

#### Scenario: Dois artigos excluídos em sequência
- **WHEN** o usuário, em modo de revisão, exclui o artigo 2 e, em seguida, o novo artigo 2 (antigo artigo 3) e salva
- **THEN** os excluídos têm os identificadores `_art2-exc1` e `_art2-exc2`, nessa ordem

#### Scenario: Exclusão anterior à exclusão já registrada
- **WHEN** o usuário, em modo de revisão, exclui o artigo 2 e, depois, o artigo 1 de um documento com artigos 1, 2 e 3 e salva
- **THEN** os excluídos têm os identificadores `_art1-exc1` (antigo artigo 1) e `_art1-exc2` (antigo artigo 2), ambos antes do artigo `art1` (antigo artigo 3)

#### Scenario: Identificador dos filhos do excluído
- **WHEN** o artigo excluído `_art3-exc1` possui caput
- **THEN** o caput recebe o identificador `_art3-exc1_cpt`

### Requirement: Revisão de exclusão de dispositivo com bloco de alteração
Quando um dispositivo que contém bloco de alteração de norma é excluído em revisão, o sistema SHALL registrar uma única revisão principal `excluido` para o dispositivo, associando a ela todos os dispositivos do bloco, e SHALL gravar o bloco de alteração completo (dispositivos, rótulos, textos e hierarquia) dentro do dispositivo excluído, no elemento `Alteracao`. Os dispositivos do bloco SHALL NOT gerar revisões principais próprias.

#### Scenario: Uma única marca na sessão
- **WHEN** o usuário, em modo de revisão, exclui um artigo que altera uma norma, com um artigo de alteração e um parágrafo no bloco
- **THEN** o editor exibe uma única marca de revisão para a exclusão, e a contagem de revisões aumenta em um

#### Scenario: Bloco de alteração gravado
- **WHEN** o usuário, em modo de revisão, exclui o artigo 5 que altera uma norma, com o artigo `Art. 3º` e o parágrafo `§ 2º` no bloco, e salva
- **THEN** a revisão `excluido` contém o artigo excluído com o caput, a norma alterada e o bloco de alteração com o `Art. 3º` e o `§ 2º`, na hierarquia e na ordem originais

#### Scenario: Identificador dos dispositivos do bloco excluído
- **WHEN** o artigo excluído tem identificador `_art4-exc1`
- **THEN** os dispositivos do bloco têm identificadores com esse prefixo, como `_art4-exc1_cpt_alt1_art3`

#### Scenario: Exclusões em sequência
- **WHEN** o usuário, em modo de revisão, exclui um artigo que altera norma e, em seguida, outro artigo anterior a ele, e salva
- **THEN** cada revisão `excluido` contém o bloco de alteração do respectivo artigo, com identificadores calculados pela posição final

### Requirement: Revisão de movimentação de dispositivo com bloco de alteração
Quando um dispositivo que contém bloco de alteração de norma é movido ou transformado em revisão, o sistema SHALL manter uma única revisão principal para o dispositivo, e os dispositivos do bloco SHALL ser tratados como descendentes dele, sem revisões principais próprias.

#### Scenario: Artigo com bloco de alteração movido
- **WHEN** o usuário, em modo de revisão, move um artigo que altera norma para outra posição
- **THEN** o editor exibe uma única marca de revisão de movimentação, e rejeitá-la devolve o artigo e o seu bloco de alteração à posição original

#### Scenario: Movido e salvo
- **WHEN** o usuário, em modo de revisão, move um artigo que altera norma e salva
- **THEN** o arquivo contém uma única revisão `movido;<posicaoOriginal>`, e o bloco de alteração permanece no artigo na articulação

### Requirement: Data da revisão com fuso horário
O sistema SHALL gravar a data de cada revisão no formato ISO 8601 com fuso horário (por exemplo, `2026-05-11T15:51:00-03:00`), representando o mesmo instante registrado pelo editor.

#### Scenario: Data gravada com fuso
- **WHEN** uma revisão feita em 11/05/2026 às 15:51:00 no fuso UTC-03:00 é salva
- **THEN** o atributo `data` da revisão é `2026-05-11T15:51:00-03:00`

### Requirement: Registro de usuários das revisões
O sistema SHALL registrar em `Usuarios` dos metadados do LexEdit cada usuário referenciado por alguma revisão da hierarquia ou de texto, uma única vez, com `idUsuario` igual ao identificador fornecido pelo host, `nome` e, quando houver, `sigla`. Sem identificador, `idUsuario` SHALL ser o nome. `refIdUsuario` de cada revisão SHALL referenciar um `idUsuario` registrado.

#### Scenario: Dois usuários revisando
- **WHEN** duas revisões feitas pelo usuário `sf:fulano` e uma pelo usuário `sf:ciclana` são salvas
- **THEN** `Usuarios` contém um registro para cada um, e cada `refIdUsuario` referencia um deles

#### Scenario: Usuário sem identificador
- **WHEN** uma revisão é feita por um usuário sem identificador, de nome "Anônimo"
- **THEN** o registro em `Usuarios` e o `refIdUsuario` correspondente usam `Anônimo` como identificador

#### Scenario: Mesmo usuário nos dois tipos de revisão
- **WHEN** o usuário `sf:fulano`, de sigla "FT", faz uma revisão da hierarquia e uma revisão de texto na justificação, e o documento é salvo
- **THEN** `Usuarios` contém um único registro de `sf:fulano`, com a sigla "FT", referenciado pelas duas revisões

#### Scenario: Marca de revisão de texto sem identificador do usuário
- **WHEN** a justificação recebida do host tem uma marca de revisão de texto que só informa o nome do autor, "Fulano de Tal", e o documento é salvo
- **THEN** o registro em `Usuarios` e o `refIdUsuario` da marca usam `Fulano de Tal` como identificador

### Requirement: Pendência de revisões da hierarquia
Enquanto houver ao menos uma revisão da hierarquia não resolvida, o sistema SHALL incluir na lista de pendências dos metadados do LexEdit o item "Resolver marcas de revisão na articulação.".

#### Scenario: Pendência presente com revisão
- **WHEN** o usuário salva um documento com ao menos uma revisão da hierarquia
- **THEN** a lista de pendências contém "Resolver marcas de revisão na articulação."

#### Scenario: Pendência ausente após resolver as revisões
- **WHEN** o usuário aceita ou rejeita todas as revisões da hierarquia e salva
- **THEN** a lista de pendências não contém esse item

### Requirement: Serialização da justificação
Ao salvar, o sistema SHALL gravar a justificação do documento em edição em `ProjetoNorma/Justificacao/PartePrincipal`, com o conteúdo rico no subconjunto HTML do LexML. O sistema SHALL NOT gravar `Justificacao` quando a justificação não tiver conteúdo nem no modo anexo de parecer. O arquivo salvo SHALL ser válido pelo esquema LexML.

#### Scenario: Justificação com texto formatado
- **WHEN** o usuário salva um documento cuja justificação tem parágrafos com negrito, itálico, sublinhado, sobrescrito, alinhamento e uma lista
- **THEN** o arquivo salvo contém `Justificacao/PartePrincipal` com esses parágrafos e a lista, com as mesmas marcações e classes de alinhamento

#### Scenario: Justificação vazia
- **WHEN** o usuário salva um documento cuja justificação está vazia ou só tem parágrafos vazios
- **THEN** o arquivo salvo não contém `Justificacao`

#### Scenario: Modo anexo de parecer
- **WHEN** o usuário salva um documento no modo anexo de parecer
- **THEN** o arquivo salvo não contém `Justificacao`

#### Scenario: Valor do momento do salvamento
- **WHEN** o usuário salva o documento e depois altera a justificação
- **THEN** o arquivo já obtido mantém a justificação do momento em que foi salvo

### Requirement: Adaptação do conteúdo rico da justificação ao LexML
Ao gravar a justificação, o sistema SHALL converter o conteúdo do editor para o que o esquema LexML aceita, sem perder texto nem formatação suportada: negrito e itálico como `b` e `i`; link com `xlink:href`, sem `rel`; tabela sem `tbody`, sem atributos de controle do editor e sem células ocultas de mesclagem, com `id` `_tabela<sequencial>` na ordem das tabelas; parágrafo dentro de célula como `span` com a classe `p`; largura em `style`; imagem dentro de parágrafo; sem quebras de linha `br`.

#### Scenario: Tabela com células mescladas e largura
- **WHEN** o usuário salva uma justificação com uma tabela que tem largura de 80%, uma coluna de 40% e uma célula que ocupa duas colunas
- **THEN** a tabela gravada tem `id` `_tabela1` e `style` `width: 80%`, a célula tem `colspan` 2 e a coluna tem `style` `width: 40%`
- **AND** a tabela gravada não tem `tbody`, `table_id`, `row_id`, `cell_id` nem a célula oculta de mesclagem

#### Scenario: Célula com dois parágrafos
- **WHEN** o usuário salva uma justificação com uma célula de tabela que tem dois parágrafos, o primeiro centralizado
- **THEN** a célula gravada contém dois `span`, o primeiro com as classes `p` e de alinhamento centralizado, e o segundo com a classe `p`

#### Scenario: Duas tabelas
- **WHEN** o usuário salva uma justificação com duas tabelas
- **THEN** as tabelas gravadas têm os `id` `_tabela1` e `_tabela2`, na ordem do texto

#### Scenario: Link
- **WHEN** o usuário salva uma justificação com um link para `https://www.congressonacional.leg.br`
- **THEN** o link gravado é um `a` com `xlink:href` igual a esse endereço e sem `rel`

#### Scenario: Imagem com largura
- **WHEN** o usuário salva uma justificação com uma imagem inserida pelo editor, com largura de 50%
- **THEN** a imagem é gravada como `img` dentro de um parágrafo, com o mesmo `src` e `style` `width: 50%`

#### Scenario: Parágrafo vazio
- **WHEN** o usuário salva uma justificação com um parágrafo vazio entre dois parágrafos com texto
- **THEN** o parágrafo vazio é gravado sem conteúdo, sem `br`

### Requirement: Revisões de texto na justificação gravada
Ao gravar a justificação, o sistema SHALL gravar cada marca de revisão de texto como `ins` (texto incluído) ou `del` (texto excluído), no ponto do texto em que está, com o conteúdo e a formatação que tiver, inclusive notas de rodapé. Cada `ins`/`del` SHALL ter um `id` de prefixo `_rt`, único no documento, e um `RevisaoTextual` nos metadados do LexEdit com esse `id` em `refIdRevisao`, o autor em `refIdUsuario` e a data com fuso horário. O arquivo salvo SHALL ser válido pelo esquema LexML.

#### Scenario: Justificação com marcas de revisão
- **WHEN** o usuário salva uma justificação com um trecho incluído e um trecho excluído em revisão de texto
- **THEN** o texto gravado contém o trecho incluído dentro de um `ins` e o trecho excluído dentro de um `del`, cada um com `id` de prefixo `_rt`
- **AND** `RevisoesTextuais` contém um `RevisaoTextual` para cada um, com `refIdRevisao` igual ao `id`, o `refIdUsuario` do autor e a data da revisão

#### Scenario: Revisão em mais de um trecho
- **WHEN** o usuário salva uma justificação com uma revisão que substituiu um trecho (exclusão e inclusão na mesma ação) e outra que excluiu um trecho com parte em negrito
- **THEN** cada `ins` e cada `del` gravado tem um `id` diferente dos demais, e cada um tem o seu `RevisaoTextual`

#### Scenario: Nota de rodapé em trecho excluído
- **WHEN** o usuário salva uma justificação com uma nota de rodapé dentro de um trecho excluído em revisão
- **THEN** o `del` gravado contém o `NotaDeRodape` da nota

#### Scenario: Justificação sem marcas de revisão
- **WHEN** o usuário salva uma justificação sem nenhuma marca de revisão de texto
- **THEN** o arquivo salvo não contém `ins`, `del` nem `RevisoesTextuais`

#### Scenario: Modo anexo de parecer
- **WHEN** o usuário salva, no modo anexo de parecer, um documento com marcas de revisão de texto na justificação
- **THEN** o arquivo salvo não contém `RevisoesTextuais`

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

### Requirement: Pendência de revisões de texto
Enquanto houver ao menos uma marca de revisão de texto na justificação gravada, o sistema SHALL incluir na lista de pendências dos metadados do LexEdit o item "Resolver marcas de revisão de texto.". Ao abrir um documento, o item gravado SHALL NOT ser usado para reconstruir o estado do editor.

#### Scenario: Pendência presente com marca de revisão
- **WHEN** o usuário salva um documento com ao menos uma marca de revisão de texto na justificação
- **THEN** a lista de pendências contém "Resolver marcas de revisão de texto."

#### Scenario: Pendência ausente após resolver as marcas
- **WHEN** o usuário aceita ou rejeita todas as marcas de revisão de texto da justificação e salva
- **THEN** a lista de pendências não contém esse item

#### Scenario: Pendência ausente no modo anexo de parecer
- **WHEN** o usuário salva, no modo anexo de parecer, um documento com marca de revisão de texto na justificação
- **THEN** a lista de pendências não contém esse item
