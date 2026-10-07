# Abrir Documento Articulado

## Purpose

Abrir documento articulado é a leitura e reconstrução, no lexml-eta, de um documento em edição a partir de um arquivo `documento-articulado.json` — o contrato Jsonix LexML definido pela capability irmã `salvar-documento-articulado`. Valida estruturalmente a entrada antes de substituir o documento aberto no editor.

## Requirements

### Requirement: Validação estrutural na abertura
O sistema SHALL validar estruturalmente o documento recebido — raiz Jsonix `LexML`, formato da URN, listas de dispositivos representadas como arrays, e identificadores de elementos únicos e sem espaços — antes de substituir o documento em edição.

#### Scenario: Documento estruturalmente válido é aceito
- **WHEN** um arquivo com a raiz `LexML`, URN válida e articulação bem formada é aberto
- **THEN** o sistema aceita a entrada e prossegue para interpretá-la

#### Scenario: Raiz incorreta é rejeitada
- **WHEN** o arquivo aberto não tem a raiz Jsonix `LexML` (por exemplo, o invólucro `Proposicao` do formato antigo)
- **THEN** o sistema rejeita a abertura com um erro descritivo, sem alterar o documento em edição

#### Scenario: Identificadores repetidos são rejeitados
- **WHEN** o documento contém dois elementos com o mesmo `id`
- **THEN** o sistema rejeita a abertura com um erro descritivo

#### Scenario: JSON malformado é rejeitado
- **WHEN** o conteúdo do arquivo não é um JSON válido
- **THEN** o sistema rejeita a abertura com um erro descritivo, sem tentar interpretar parcialmente o conteúdo

### Requirement: Preservação da URN recebida ao abrir
O sistema SHALL preservar integralmente a URN recebida ao interpretar o documento aberto, inclusive quando provisória.

#### Scenario: Abertura de documento com URN provisória
- **WHEN** um documento com URN terminando em `:9999;999999` é aberto
- **THEN** o documento carregado no editor mantém essa URN provisória, sem substituí-la por outro valor

#### Scenario: Abertura de documento com URN definitiva contendo evento
- **WHEN** um documento com URN definitiva contendo um fragmento de evento é aberto
- **THEN** o documento carregado no editor preserva a URN completa, incluindo o fragmento de evento

### Requirement: Recuperação completa da parte inicial
O sistema SHALL recuperar todo o conteúdo suportado da epígrafe e da ementa, e todos os parágrafos do preâmbulo — não apenas o primeiro item ou parágrafo.

#### Scenario: Preâmbulo com múltiplos parágrafos é recuperado integralmente
- **WHEN** um documento cujo preâmbulo tem mais de um parágrafo é aberto
- **THEN** todos os parágrafos do preâmbulo aparecem no documento carregado no editor, na mesma ordem do arquivo

### Requirement: Preservação literal do texto no caminho de abertura
Ao interpretar o texto de um documento aberto por este caminho, o sistema SHALL preservar caracteres literais (incluindo aspas retas), sem aplicar a normalização tipográfica usada na inicialização de um documento novo.

#### Scenario: Abertura preserva aspas retas
- **WHEN** o texto de um dispositivo no arquivo aberto contém aspas retas
- **THEN** o documento carregado no editor mantém as aspas retas, sem convertê-las em aspas curvas

### Requirement: Verificação do conversor antes de substituir o documento
O sistema SHALL interpretar o documento pelo conversor do ETA antes de permitir a substituição do estado do editor, rejeitando documentos que passam na validação estrutural mas que o conversor não consegue interpretar.

#### Scenario: Falha de interpretação da parte inicial ou da articulação
- **WHEN** um documento passa na validação estrutural mas contém uma combinação que o conversor do ETA não consegue interpretar
- **THEN** o sistema rejeita a abertura com um erro descritivo, sem alterar o documento em edição

### Requirement: Seletores de arquivo para abrir
O sistema SHALL usar o seletor nativo de abertura quando disponível no navegador, e um seletor de arquivo alternativo quando não estiver disponível; SHALL retornar `undefined` quando o usuário cancelar a operação, sem selecionar arquivo; e SHALL propagar qualquer erro de leitura ou de estrutura para a aplicação consumidora tratar.

#### Scenario: Navegador com File System Access API
- **WHEN** o navegador suporta `showOpenFilePicker`
- **THEN** o sistema abre o diálogo nativo de seleção de arquivo, restrito a arquivos `.json`

#### Scenario: Navegador sem seletor nativo
- **WHEN** o navegador não suporta `showOpenFilePicker`
- **THEN** o sistema usa um seletor de arquivo alternativo (input HTML de arquivo)

#### Scenario: Cancelamento da abertura
- **WHEN** o usuário cancela o diálogo de abertura sem selecionar um arquivo
- **THEN** a operação de abrir retorna `undefined`, sem lançar erro

#### Scenario: Falha de leitura ou de estrutura
- **WHEN** o arquivo selecionado não pode ser lido, ou falha na validação estrutural
- **THEN** o erro é propagado para a aplicação consumidora tratar

### Requirement: Rejeição do formato antigo com invólucro Proposicao
O sistema SHALL rejeitar arquivos no formato antigo, com invólucro `Proposicao`, usado pela demonstração antes desta entrega.

#### Scenario: Tentativa de abrir arquivo no formato antigo
- **WHEN** o usuário tenta abrir um arquivo salvo no formato antigo (invólucro `Proposicao`, sem a raiz Jsonix `LexML`)
- **THEN** o sistema rejeita a abertura com um erro descritivo, sem alterar o documento em edição

### Requirement: Reconstrução de remissões internas inválidas ao abrir
Ao abrir um documento, para cada identificador listado no grupo de remissões internas inválidas dos metadados do LexEdit, o sistema SHALL reconstruir no dispositivo de origem correspondente o mesmo estado inválido existente no momento em que a remissão foi salva — incluindo mensagem de erro associada ao dispositivo e alerta global —, tratando esse identificador como autoritativo mesmo que o destino textual do link volte a resolver para algum dispositivo existente no documento aberto.

#### Scenario: Abertura reconstrói mensagem e alerta de remissão inválida
- **WHEN** um documento salvo com uma remissão interna inválida é reaberto
- **THEN** o dispositivo de origem exibe a mesma mensagem de erro associada à remissão inválida, e o alerta global correspondente é exibido

#### Scenario: Identificador listado prevalece sobre destino textual reaproveitado
- **WHEN** um documento é reaberto e o identificador de uma remissão consta na lista de remissões internas inválidas, mas o texto do link aponta para um identificador de dispositivo que passou a existir novamente no documento (reaproveitado por um dispositivo diferente do original)
- **THEN** a remissão permanece reconstruída como inválida, sem ser tratada como um link válido para esse dispositivo diferente

#### Scenario: Documento sem metadados do LexEdit continua detectando remissões inválidas
- **WHEN** um documento sem o ponto de extensão de metadados do LexEdit é aberto e contém um link de remissão interna cujo destino não existe na articulação
- **THEN** o sistema ainda reconstrói o estado inválido correspondente, sem depender da lista de remissões internas inválidas

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

### Requirement: Recuperação do local e da data do fecho ao abrir
Ao abrir um documento, o sistema SHALL aplicar ao campo "Data" a data do fecho registrada nos metadados do LexEdit. Data ausente, vazia ou fora do formato `AAAA-MM-DD` SHALL corresponder a "Não informar". O local registrado SHALL ser preservado para o próximo salvamento enquanto o destino não for alterado. O texto de `LocalDataFecho` não SHALL ser interpretado: os dados estruturados são a fonte, e o texto é gerado novamente ao salvar.

#### Scenario: Documento com data
- **WHEN** o usuário abre um documento cuja data do fecho é `2026-04-24`
- **THEN** o campo "Data" exibe 24/04/2026 como data informada

#### Scenario: Documento sem data ou com data vazia
- **WHEN** o usuário abre um documento sem o atributo de data, ou com ele vazio
- **THEN** o campo "Data" exibe a opção "Não informar" selecionada

#### Scenario: Documento com data inválida
- **WHEN** o usuário abre um documento cuja data do fecho é "24/04/2026"
- **THEN** o campo "Data" exibe a opção "Não informar" selecionada, sem impedir a abertura do documento

#### Scenario: Documento sem metadados do LexEdit
- **WHEN** o usuário abre um documento sem `MetadadoProprietario`, mesmo que contenha `LocalDataFecho`
- **THEN** o campo "Data" exibe "Não informar", e o local passa a ser derivado do destino

#### Scenario: Salvar e reabrir preserva o fecho
- **WHEN** o usuário salva um documento com data informada, abre o arquivo salvo e o salva novamente sem alterações
- **THEN** o segundo arquivo registra o mesmo local, a mesma data e o mesmo texto de `LocalDataFecho` do primeiro

### Requirement: Recuperação da autoria de parlamentares ao abrir
Ao abrir um documento com autoria de tipo `Parlamentar` nos metadados do LexEdit, o sistema SHALL exibir na aba de autoria os parlamentares registrados, na ordem do arquivo, com os dados tal como gravados (sem consultar novamente a lista de parlamentares do host), e a opção de imprimir partido e UF registrada. Parlamentares sem identificação ou sem nome SHALL ser desconsiderados; atributo ausente ou inválido dos demais SHALL assumir o valor padrão do editor, e imprimir partido e UF ausente ou inválido SHALL assumir o valor padrão (marcado). Quando o documento não tiver autoria, tiver autoria de outro tipo ou não tiver nenhum parlamentar válido, SHALL valer a autoria padrão do editor. O texto de `AssinaturaTexto` não SHALL ser interpretado: os dados estruturados são a fonte, e o texto é gerado novamente ao salvar. A quantidade de assinaturas adicionais SHALL assumir o valor padrão.

#### Scenario: Documento com dois parlamentares
- **WHEN** o usuário abre um documento cuja autoria registra Davi Alcolumbre e Soraya Thronicke, nessa ordem
- **THEN** a aba de autoria exibe os dois parlamentares nessa ordem, com o cargo do primeiro preenchido

#### Scenario: Impressão de partido e UF desmarcada
- **WHEN** o usuário abre um documento cuja autoria registra imprimir partido e UF como falso
- **THEN** a opção "Imprimir partido e UF para os signatários" aparece desmarcada

#### Scenario: Documento sem autoria
- **WHEN** o usuário abre um documento sem autoria nos metadados do LexEdit, mesmo que contenha `AssinaturaTexto`
- **THEN** a aba de autoria exibe a autoria padrão do editor

#### Scenario: Autoria de comissão
- **WHEN** o usuário abre um documento cuja autoria é de tipo `Comissão`
- **THEN** a aba de autoria exibe a autoria padrão do editor, sem impedir a abertura do documento

#### Scenario: Dados do arquivo prevalecem sobre a lista do host
- **WHEN** o usuário abre um documento cuja autoria registra para um parlamentar um partido diferente do informado na lista de parlamentares do host
- **THEN** a aba de autoria exibe o partido registrado no arquivo

#### Scenario: Salvar e reabrir preserva a autoria
- **WHEN** o usuário salva um documento com parlamentares, abre o arquivo salvo e o salva novamente sem alterações
- **THEN** o segundo arquivo registra a mesma autoria e os mesmos `AssinaturaTexto` do primeiro

### Requirement: Reconstrução das revisões da hierarquia ao abrir
Ao abrir um documento com `RevisoesArticulacao` nos metadados do LexEdit, o sistema SHALL reconstruir as revisões da hierarquia e ativar o modo de revisão, exibindo as marcas de cada revisão nos dispositivos correspondentes, com o autor e a data registrados. As revisões do arquivo SHALL prevalecer sobre quaisquer revisões informadas pela aplicação consumidora. Documento sem revisões SHALL ser aberto sem modo de revisão e sem marcas.

#### Scenario: Marca de dispositivo adicionado
- **WHEN** o usuário abre um documento com uma revisão `adicionado` para o artigo 4
- **THEN** o artigo 4 é exibido com a marca de dispositivo adicionado, com o autor e a data da revisão, e o modo de revisão fica ativo

#### Scenario: Documento sem revisões
- **WHEN** o usuário abre um documento sem `RevisoesArticulacao`
- **THEN** o editor abre sem modo de revisão e sem marcas de revisão

#### Scenario: Revisões de documento anterior não são herdadas
- **WHEN** o usuário abre um documento com revisões e, em seguida, abre outro documento sem revisões
- **THEN** o segundo documento é exibido sem marcas de revisão

### Requirement: Reconstrução de dispositivos excluídos ao abrir
Ao abrir um documento com revisões `excluido`, o sistema SHALL exibir cada dispositivo excluído, com sua hierarquia, na posição indicada por seu identificador (`_<id-base>-exc<sequencial>`): depois do dispositivo que antecede o `<id-base>` e antes do dispositivo de identificador `<id-base>`, na ordem do sequencial.

#### Scenario: Excluídos consecutivos
- **WHEN** o usuário abre um documento com `art1`, `art2` e dois dispositivos excluídos, `_art2-exc1` e `_art2-exc2`
- **THEN** o editor exibe, nesta ordem, `art1`, o excluído `_art2-exc1`, o excluído `_art2-exc2` e `art2`

#### Scenario: Excluído com filhos
- **WHEN** o usuário abre um documento cujo artigo excluído tem parágrafo e incisos
- **THEN** o editor exibe o artigo excluído com o parágrafo e os incisos, na hierarquia e na ordem salvas

### Requirement: Reconstrução das operações de cada revisão
Ao abrir um documento, o sistema SHALL reconstruir, a partir do atributo `revisao` e do conteúdo filho de cada `RevisaoArticulacao`, as operações registradas (`adicionado`, `excluido`, `alterado`, `movido`, `transformado`), inclusive combinadas, de modo que as marcas exibidas descrevam todas as operações e o conteúdo, a posição e o tipo anteriores possam ser restaurados. Operações desconhecidas, como `alteracaoRotulo`, SHALL ser ignoradas, sem impedir a leitura das demais.

#### Scenario: Revisão combinada
- **WHEN** o usuário abre um documento com uma revisão `movido;3,alterado` e o texto original como filho
- **THEN** o dispositivo é exibido com a marca da revisão, e rejeitá-la devolve o dispositivo à posição 3 com o texto original

#### Scenario: Operação desconhecida
- **WHEN** o usuário abre um documento com uma revisão `alteracaoRotulo;art2_cpt_alt1_art3`
- **THEN** o documento abre normalmente, sem erro, e as demais revisões são reconstruídas

### Requirement: Revisões reabertas podem ser resolvidas
O sistema SHALL permitir aceitar e rejeitar, após abrir o documento, as revisões reconstruídas, com o mesmo resultado das revisões criadas na sessão de edição.

#### Scenario: Rejeitar uma exclusão
- **WHEN** o usuário abre um documento com um artigo excluído em revisão e rejeita a revisão
- **THEN** o artigo volta à articulação, na posição indicada pelo identificador do excluído

#### Scenario: Rejeitar uma adição
- **WHEN** o usuário abre um documento com um artigo adicionado em revisão e rejeita a revisão
- **THEN** o artigo é removido da articulação

#### Scenario: Aceitar uma alteração de texto
- **WHEN** o usuário abre um documento com uma revisão `alterado` e a aceita
- **THEN** o dispositivo mantém o texto revisado, sem marca de revisão

### Requirement: Recuperação do autor e da data das revisões
Ao abrir um documento, o sistema SHALL identificar o autor de cada revisão pelo registro `Usuarios`, usando `idUsuario`, `nome` e `sigla`, e SHALL exibir a data de cada revisão no horário local. Quando `refIdUsuario` não constar de `Usuarios`, o autor SHALL ter o próprio `refIdUsuario` como identificador e nome.

#### Scenario: Autor registrado
- **WHEN** o usuário abre um documento com uma revisão de `refIdUsuario` igual a `sf:fulano`, registrado em `Usuarios` com nome "Fulano de Tal"
- **THEN** a marca da revisão exibe "Fulano de Tal" como autor

#### Scenario: Autor não registrado
- **WHEN** o usuário abre um documento com uma revisão de `refIdUsuario` igual a `sf:fulano` e sem registro correspondente em `Usuarios`
- **THEN** a revisão é exibida com `sf:fulano` como autor, sem impedir a abertura

### Requirement: Tolerância a revisões inconsistentes
Ao abrir um documento, o sistema SHALL ignorar a revisão que referenciar, em `refIdDispositivo`, um dispositivo inexistente na articulação, ou cujo atributo `revisao` não tenha nenhuma operação reconhecida, sem impedir a abertura nem a reconstrução das demais revisões.

#### Scenario: Revisão de dispositivo inexistente
- **WHEN** o usuário abre um documento com uma revisão cujo `refIdDispositivo` não existe na articulação
- **THEN** o documento abre sem erro, e as demais revisões são exibidas

### Requirement: Ida e volta das revisões da hierarquia
Ao salvar um documento aberto com revisões da hierarquia, sem alterações, o sistema SHALL gerar um arquivo com as mesmas revisões, os mesmos identificadores de excluídos, os mesmos usuários e as mesmas pendências do arquivo aberto.

#### Scenario: Salvar o documento reaberto
- **WHEN** o usuário salva um documento com adição, exclusão, alteração, movimentação e transformação, abre o arquivo salvo e o salva novamente sem alterações
- **THEN** o segundo arquivo registra as mesmas revisões, na mesma ordem, e os mesmos usuários e pendências do primeiro
