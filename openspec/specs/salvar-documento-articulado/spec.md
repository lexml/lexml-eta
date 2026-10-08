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
- **WHEN** o usuário abre um documento cujo local registrado é "Sala da comissão", altera o destino exibido após a abertura (ex.: para "Plenário via Comissão") e salva
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

### Requirement: Fecho no modo anexo de parecer
No modo anexo de parecer, o sistema SHALL salvar o documento sem local, sem data e sem `ParteFinal`.

#### Scenario: Documento em modo anexo de parecer
- **WHEN** o usuário salva um documento no modo anexo de parecer
- **THEN** o arquivo salvo não contém local nem data nos metadados do LexEdit, nem o elemento `ParteFinal`

### Requirement: Serialização da autoria de parlamentares
Ao salvar, o sistema SHALL registrar nos metadados do LexEdit a autoria com tipo `Parlamentar`, a opção de imprimir partido e UF e, na ordem da tela, um registro para cada parlamentar incluído com identificação, nome, sexo, sigla do partido, sigla da UF, sigla da casa legislativa e cargo. O cargo SHALL ser registrado mesmo quando vazio. Parlamentares sem identificação (linhas em branco da tela) SHALL ser desconsiderados. Quando não houver nenhum parlamentar identificado, a autoria SHALL ser omitida. A quantidade de assinaturas adicionais não SHALL ser registrada.

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
- **WHEN** o documento salvo com autoria de parlamentares é convertido em XML pelo conversor `jsonix-lexml` 2.0.0
- **THEN** o XML é válido perante o esquema LexML e o esquema do LexEdit, e a conversão de volta para JSON reproduz a mesma autoria e a mesma `ParteFinal`

### Requirement: Autoria no modo anexo de parecer
No modo anexo de parecer, o sistema SHALL salvar o documento sem autoria nos metadados do LexEdit e sem `AssinaturaTexto`.

#### Scenario: Documento em modo anexo de parecer
- **WHEN** o usuário salva um documento no modo anexo de parecer
- **THEN** o arquivo salvo não contém a autoria nos metadados do LexEdit nem o elemento `AssinaturaTexto`

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
Quando o texto de um dispositivo é alterado em revisão, o sistema SHALL gravar na articulação o texto revisado e, na revisão `alterado`, o conteúdo anterior como parágrafo filho de `RevisaoArticulacao`.

#### Scenario: Texto de inciso alterado
- **WHEN** o usuário, em modo de revisão, altera o texto do inciso II do artigo 4 e salva
- **THEN** a articulação contém o novo texto, e a revisão com `refIdDispositivo` do inciso e `revisao` igual a `alterado` contém o texto original em um parágrafo filho

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
Quando o rótulo de um dispositivo de alteração de norma é alterado em revisão, o sistema SHALL gravar na articulação o dispositivo com o rótulo e o identificador finais e registrar `alteracaoRotulo;<idOriginal>` em `revisao`, onde `<idOriginal>` é o identificador anterior à alteração, do qual se deriva o rótulo anterior. O parágrafo filho com o conteúdo anterior SHALL ser gravado somente quando a revisão também contém `alterado`.

#### Scenario: Parágrafo renumerado
- **WHEN** o usuário, em modo de revisão, renumera o parágrafo `art2_cpt_alt1_art3_par3-1` (`§ 3º-A`) para `§ 3º-B` e salva
- **THEN** a articulação contém o parágrafo `§ 3º-B` com o identificador final, e a revisão com `refIdDispositivo` igual ao identificador final tem `revisao` igual a `alteracaoRotulo;art2_cpt_alt1_art3_par3-1`, sem parágrafo filho

#### Scenario: Renumeração combinada com alteração de texto
- **WHEN** o usuário, em modo de revisão, renumera um parágrafo, altera o seu texto e salva
- **THEN** a revisão tem `alteracaoRotulo;<idOriginal>,alterado` e contém o texto anterior como parágrafo filho

#### Scenario: Conversão pelo conversor LexML
- **WHEN** o arquivo com a revisão `alteracaoRotulo` é convertido em XML pelo conversor e validado com `schemas/lexedit.xsd`
- **THEN** o XML contém o atributo `revisao` com a operação e o argumento, e a validação não aponta erro

### Requirement: Operações combinadas em ordem
Quando um mesmo dispositivo sofre mais de uma operação de revisão, o sistema SHALL registrar todas no atributo `revisao`, separadas por vírgula, na ordem em que ocorreram. Uma operação já registrada SHALL NOT ser repetida, e o argumento SHALL ser o da primeira ocorrência.

#### Scenario: Movido e depois alterado
- **WHEN** o usuário, em modo de revisão, move o inciso III e depois altera o seu texto
- **THEN** a revisão tem `revisao` igual a `movido;3,alterado`, com o conteúdo original como parágrafo filho

#### Scenario: Transformado e depois alterado
- **WHEN** o usuário, em modo de revisão, transforma um inciso em alínea e depois altera o texto
- **THEN** a revisão tem `revisao` igual a `transformado;inciso,alterado`

#### Scenario: Movido duas vezes
- **WHEN** o usuário, em modo de revisão, move o mesmo dispositivo duas vezes para posições diferentes da original
- **THEN** a revisão tem uma única operação `movido`, com a posição de antes da primeira movimentação

#### Scenario: Adicionado e depois alterado
- **WHEN** o usuário, em modo de revisão, adiciona um dispositivo e depois altera o seu texto
- **THEN** a revisão tem `revisao` igual a `adicionado`, sem conteúdo anterior

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

### Requirement: Data da revisão com fuso horário
O sistema SHALL gravar a data de cada revisão no formato ISO 8601 com fuso horário (por exemplo, `2026-05-11T15:51:00-03:00`), representando o mesmo instante registrado pelo editor.

#### Scenario: Data gravada com fuso
- **WHEN** uma revisão feita em 11/05/2026 às 15:51:00 no fuso UTC-03:00 é salva
- **THEN** o atributo `data` da revisão é `2026-05-11T15:51:00-03:00`

### Requirement: Registro de usuários das revisões
O sistema SHALL registrar em `Usuarios` dos metadados do LexEdit cada usuário referenciado por alguma revisão, uma única vez, com `idUsuario` igual ao identificador fornecido pelo host, `nome` e, quando houver, `sigla`. Sem identificador, `idUsuario` SHALL ser o nome. `refIdUsuario` de cada revisão SHALL referenciar um `idUsuario` registrado.

#### Scenario: Dois usuários revisando
- **WHEN** duas revisões feitas pelo usuário `sf:fulano` e uma pelo usuário `sf:ciclana` são salvas
- **THEN** `Usuarios` contém um registro para cada um, e cada `refIdUsuario` referencia um deles

#### Scenario: Usuário sem identificador
- **WHEN** uma revisão é feita por um usuário sem identificador, de nome "Anônimo"
- **THEN** o registro em `Usuarios` e o `refIdUsuario` correspondente usam `Anônimo` como identificador

### Requirement: Pendência de revisões da hierarquia
Enquanto houver ao menos uma revisão da hierarquia não resolvida, o sistema SHALL incluir na lista de pendências dos metadados do LexEdit o item "Resolver marcas de revisão na articulação.".

#### Scenario: Pendência presente com revisão
- **WHEN** o usuário salva um documento com ao menos uma revisão da hierarquia
- **THEN** a lista de pendências contém "Resolver marcas de revisão na articulação."

#### Scenario: Pendência ausente após resolver as revisões
- **WHEN** o usuário aceita ou rejeita todas as revisões da hierarquia e salva
- **THEN** a lista de pendências não contém esse item
