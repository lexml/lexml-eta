## Purpose

Definir o gerenciamento dos anexos da proposição na interface do editor: aba própria, importação de arquivos, tipo fixo, ordem, visualização, limite opcional de tamanho e integração com o host, que armazena os arquivos.

## ADDED Requirements

### Requirement: Aba de anexos
O sistema SHALL exibir a aba "Anexos" imediatamente antes da aba "Avisos", com o número de anexos no rótulo quando houver ao menos um. A aba SHALL aparecer também no modo anexo de parecer. O editor SHALL NOT ter nenhum botão de anexo na barra de ferramentas.

#### Scenario: Aba antes de Avisos
- **WHEN** o editor é inicializado
- **THEN** a aba "Anexos" é exibida entre "Destino, Data, Autoria e Impressão" e "Avisos"

#### Scenario: Contador no rótulo
- **WHEN** a lista tem três anexos
- **THEN** o rótulo da aba indica 3 anexos; sem anexos, o rótulo não traz número

#### Scenario: Modo anexo de parecer
- **WHEN** o editor é inicializado com `anexoParecer` ativo
- **THEN** a aba "Anexos" é exibida

#### Scenario: Sem botão na barra de ferramentas
- **WHEN** o editor é inicializado
- **THEN** a barra de ferramentas do texto não tem o botão de anexo

### Requirement: Lista de anexos na ordem do documento
A aba SHALL exibir os anexos na ordem em que estão no documento, e cada anexo SHALL mostrar o nome do documento, o nome do arquivo e as ações de visualizar, baixar, mover para cima, mover para baixo e excluir. Sem anexos, a aba SHALL mostrar somente o botão "Importar anexo" e uma indicação de lista vazia.

#### Scenario: Lista com dois anexos
- **WHEN** o documento tem dois anexos
- **THEN** a aba exibe os dois, na ordem do documento, cada um com nome e as cinco ações

#### Scenario: Lista vazia
- **WHEN** o documento não tem anexos
- **THEN** a aba exibe a indicação de lista vazia e o botão "Importar anexo"

#### Scenario: Limites da ordenação
- **WHEN** a lista tem dois anexos
- **THEN** "mover para cima" do primeiro e "mover para baixo" do último estão desabilitados

### Requirement: Importação de anexos em PDF e DOCX
O usuário SHALL poder importar um anexo escolhendo um arquivo PDF ou DOCX, sem informar o tipo; o nome do documento SHALL ser preenchido com o nome do arquivo sem extensão e SHALL poder ser alterado. O sistema SHALL recusar arquivo de outro formato com um aviso, sem alterar a lista. O anexo importado SHALL ser incluído no fim da lista.

#### Scenario: Importar um PDF
- **WHEN** o usuário importa `parecer.pdf` e confirma
- **THEN** a lista ganha, no fim, um anexo com nome do arquivo `parecer.pdf`, nome do documento `parecer`, tipo MIME de PDF e tipo `nao.informado`

#### Scenario: Importar um DOCX
- **WHEN** o usuário importa `emenda.docx` e confirma
- **THEN** a lista ganha um anexo com o tipo MIME de DOCX

#### Scenario: Formato não aceito
- **WHEN** o usuário escolhe um arquivo `.xlsx`
- **THEN** o sistema mostra o aviso de que só PDF e DOCX são aceitos, e a lista não muda

#### Scenario: Confirmar sem escolher tipo
- **WHEN** o usuário escolheu um arquivo PDF ou DOCX válido
- **THEN** o botão de confirmar está habilitado, sem que o tipo seja solicitado

### Requirement: Nome de arquivo único na lista
O sistema SHALL NOT manter dois anexos com o mesmo nome de arquivo, sem diferenciar maiúsculas de minúsculas: ao importar um arquivo cujo nome já existe, SHALL acrescentar ` (n)` ao nome, antes da extensão, com o menor `n` livre.

#### Scenario: Nome repetido
- **WHEN** a lista já tem `parecer.pdf` e o usuário importa outro arquivo `Parecer.pdf`
- **THEN** o novo anexo tem o nome de arquivo `Parecer (1).pdf`

### Requirement: Edição do nome do documento
O usuário SHALL poder alterar o nome do documento de cada anexo na lista. O nome do arquivo SHALL NOT ser editável. Nome do documento vazio SHALL ser substituído pelo nome do arquivo sem extensão.

#### Scenario: Alterar o nome do documento
- **WHEN** o usuário altera o nome do documento de um anexo para "Parecer da CCJ"
- **THEN** o anexo passa a ter esse nome de documento e o nome do arquivo não muda

#### Scenario: Nome do documento vazio
- **WHEN** o usuário apaga o nome do documento de `parecer.pdf`
- **THEN** o nome do documento volta a ser `parecer`

### Requirement: Tipo fixo do anexo
Todo anexo adicionado SHALL receber o tipo fixo `nao.informado`, e o campo de tipo SHALL permanecer no componente, mas não exibido. Os códigos aceitos pelo campo SHALL ser os da lista informada pelo host (código e nome; entradas sem código ou nome, ou com código repetido, ignoradas) mais `nao.informado`, sempre aceito. Um anexo cujo tipo não está entre esses códigos SHALL ser tratado e gravado como `nao.informado`.

#### Scenario: Anexo adicionado
- **WHEN** o usuário importa um anexo
- **THEN** o anexo tem o tipo `nao.informado`

#### Scenario: Campo de tipo não exibido
- **WHEN** a aba exibe anexos e o diálogo de importação está aberto
- **THEN** nenhum campo de tipo está visível

#### Scenario: Campo aceita o valor fixo
- **WHEN** o host não informa tipos
- **THEN** o campo de tipo de cada anexo aceita `nao.informado` como valor, e é o único código oferecido

#### Scenario: Host com tipos
- **WHEN** o host informa os tipos `substitutivo` e `emenda`
- **THEN** o campo aceita `substitutivo`, `emenda` e `nao.informado`, e um anexo de tipo `emenda` mantém o tipo

#### Scenario: Tipo desconhecido no arquivo
- **WHEN** o usuário abre um arquivo com um anexo de tipo `parecer` que o host não informou
- **THEN** o anexo é tratado e gravado como `nao.informado`

### Requirement: Reordenação dos anexos
O usuário SHALL poder mover cada anexo uma posição para cima ou para baixo, e a nova ordem SHALL ser a ordem gravada no documento.

#### Scenario: Mover para baixo
- **WHEN** o usuário move o primeiro de dois anexos para baixo
- **THEN** a lista exibe os anexos com as posições trocadas

#### Scenario: Ordem salva
- **WHEN** o usuário reordena os anexos e salva
- **THEN** o arquivo salvo traz os anexos na nova ordem

### Requirement: Exclusão de anexo
Ao excluir um anexo, o sistema SHALL chamar o callback de exclusão do host com o anexo e, somente se o host concluir sem erro, remover o anexo da lista.

#### Scenario: Exclusão concluída
- **WHEN** o usuário exclui um anexo e o callback de exclusão conclui
- **THEN** o anexo some da lista

#### Scenario: Exclusão com falha do host
- **WHEN** o usuário exclui um anexo e o callback de exclusão lança erro
- **THEN** o sistema mostra o aviso "Não foi possível excluir o anexo. Tente novamente." e o anexo continua na lista

### Requirement: Visualização e download
O usuário SHALL poder visualizar um anexo em PDF e baixar qualquer anexo. A visualização de anexo DOCX SHALL ser indisponível (ação desabilitada). Para visualizar, o sistema SHALL usar o callback de visualização do host quando existir, e senão abrir o conteúdo obtido pelo callback de obtenção; o download SHALL usar o callback de obtenção.

#### Scenario: Visualizar com callback de visualização
- **WHEN** o usuário visualiza um PDF e o host informou o callback de visualização
- **THEN** o sistema chama o callback com o anexo

#### Scenario: Visualizar sem callback de visualização
- **WHEN** o usuário visualiza um PDF e o host informou só o callback de obtenção
- **THEN** o conteúdo obtido é aberto em outra aba

#### Scenario: DOCX não é visualizável
- **WHEN** a lista tem um anexo DOCX
- **THEN** a ação de visualizar desse anexo está desabilitada e a de baixar está habilitada

#### Scenario: Download
- **WHEN** o usuário baixa um anexo
- **THEN** o navegador baixa o conteúdo obtido pelo callback, com o nome do arquivo do anexo

### Requirement: Armazenamento dos arquivos pelo host
Ao importar, o sistema SHALL chamar o callback de upload do host com o arquivo e SHALL usar o texto devolvido como `idArquivo`; o conteúdo do arquivo SHALL NOT ser mantido pelo editor depois do upload. Enquanto o upload não termina, a importação SHALL ficar desabilitada. Sem callback de upload, ou com resposta sem `idArquivo`, o sistema SHALL mostrar o aviso "Erro ao enviar anexo. Tente novamente mais tarde." e SHALL NOT incluir o anexo na lista.

#### Scenario: Upload concluído
- **WHEN** o usuário confirma a importação e o callback de upload devolve `f669f339`
- **THEN** a lista ganha o anexo com `idArquivo` `f669f339`

#### Scenario: Upload com falha
- **WHEN** o callback de upload lança erro
- **THEN** o sistema mostra o aviso de erro de envio e a lista não muda

#### Scenario: Host sem callback de upload
- **WHEN** o host não informou o callback de upload e o usuário confirma a importação
- **THEN** o sistema mostra o aviso de erro de envio e a lista não muda

#### Scenario: Importação em andamento
- **WHEN** um upload está em andamento
- **THEN** o botão de confirmar está desabilitado até o upload terminar

### Requirement: Limite opcional de tamanho do arquivo
Quando o host informa o tamanho máximo do arquivo (em KB), o sistema SHALL recusar a importação de arquivo maior, com um aviso que informa o limite, sem chamar o callback de upload. Sem valor informado (padrão), o sistema SHALL NOT limitar o tamanho.

#### Scenario: Arquivo acima do limite
- **WHEN** o host definiu o limite de 5120 KB e o usuário escolhe um arquivo de 6 MB
- **THEN** o sistema mostra o aviso de que o arquivo ultrapassa o limite de 5 MB, o callback de upload não é chamado e a lista não muda

#### Scenario: Arquivo dentro do limite
- **WHEN** o host definiu o limite de 5120 KB e o usuário importa um arquivo de 1 MB
- **THEN** o arquivo é aceito

#### Scenario: Sem limite configurado
- **WHEN** o host não definiu o limite e o usuário importa um arquivo de 50 MB
- **THEN** o arquivo é aceito, sem aviso de tamanho

### Requirement: Anexos do documento aberto
Ao abrir um documento articulado, o sistema SHALL exibir na aba somente os anexos gravados no arquivo, na ordem do arquivo, substituindo os do documento anterior. Um documento novo SHALL começar sem anexos. O host SHALL NOT precisar informar a lista de anexos.

#### Scenario: Abrir arquivo com anexos
- **WHEN** o usuário abre um arquivo com dois anexos
- **THEN** a aba lista os dois, na ordem do arquivo

#### Scenario: Abrir outro arquivo
- **WHEN** o usuário abre um arquivo sem anexos depois de ter aberto um com anexos
- **THEN** a aba não lista nenhum anexo

#### Scenario: Documento novo
- **WHEN** o editor é inicializado com uma proposição nova
- **THEN** a aba não lista nenhum anexo

### Requirement: Notificação de alteração dos anexos
O sistema SHALL emitir o evento `onchange`, com `origemEvento` igual a `anexo`, quando o usuário importar, excluir, reordenar ou alterar o nome do documento de um anexo.

#### Scenario: Importar anexo
- **WHEN** o usuário conclui a importação de um anexo
- **THEN** o componente emite `onchange` com `origemEvento` `anexo`

#### Scenario: Reordenar anexo
- **WHEN** o usuário move um anexo
- **THEN** o componente emite `onchange` com `origemEvento` `anexo`
