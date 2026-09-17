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
