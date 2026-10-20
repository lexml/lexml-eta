# Metadados do LexEdit

## Purpose

Metadados do LexEdit é o ponto de extensão `MetadadoProprietario`/`lexedit:Metadado` do documento articulado, onde o LexEdit registra, sem alterar o esquema LexML, informações próprias que o padrão não contempla.

## Requirements

### Requirement: Emissão condicional do ponto de extensão
O sistema SHALL incluir `MetadadoProprietario` no documento salvo somente quando existir ao menos um grupo de metadados do LexEdit a serializar, com o atributo `fonte` fixo em `http://www.lexml.gov.br/lexedit/1.0`. Como as opções de impressão são sempre serializadas, todo documento salvo pelo editor contém `MetadadoProprietario`. A ausência do elemento só ocorre quando o documento é criado sem dados de nenhum grupo.

#### Scenario: Documento sem nenhum grupo de metadados do LexEdit
- **WHEN** o documento é criado sem opções de impressão e sem nenhum outro dado que dependa de um grupo de metadados do LexEdit (ex.: nenhuma remissão interna inválida)
- **THEN** o arquivo gerado não contém o elemento `MetadadoProprietario`

#### Scenario: Documento com ao menos um grupo de metadados do LexEdit
- **WHEN** o documento em edição possui dado de ao menos um grupo de metadados do LexEdit
- **THEN** o arquivo salvo contém `MetadadoProprietario` com o atributo `fonte` igual a `http://www.lexml.gov.br/lexedit/1.0`

#### Scenario: Documento salvo pelo editor
- **WHEN** o usuário salva um documento pelo editor, com ou sem remissões internas inválidas
- **THEN** o arquivo salvo contém `MetadadoProprietario`, com ao menos o grupo de opções de impressão

### Requirement: Isolamento entre grupos de metadados do LexEdit
A leitura do ponto de extensão SHALL processar cada grupo de metadados do LexEdit de forma independente, sem que a ausência ou a presença de um grupo ainda não suportado pelo sistema impeça a leitura de um grupo suportado.

#### Scenario: Grupo suportado convive com dado de grupo não implementado
- **WHEN** um documento aberto contém, dentro de `MetadadoProprietario`, tanto o grupo de remissões internas inválidas quanto dados de outro grupo do LexEdit ainda não implementado pelo sistema
- **THEN** o sistema reconstrói normalmente o estado correspondente ao grupo de remissões internas inválidas, sem lançar erro por causa do grupo não reconhecido

### Requirement: Coexistência de grupos no mesmo ponto de extensão
Quando houver mais de um grupo de metadados do LexEdit a serializar, o sistema SHALL registrá-los todos no mesmo `MetadadoProprietario`, sem que a presença de um grupo altere o conteúdo registrado de outro.

#### Scenario: Opções de impressão e remissões internas inválidas no mesmo documento
- **WHEN** o usuário salva um documento com remissão interna inválida e opções de impressão alteradas
- **THEN** o arquivo salvo contém um único `MetadadoProprietario` com o grupo de opções de impressão, o grupo de remissões internas inválidas e a pendência correspondente
- **AND** ao abrir esse arquivo, o sistema reconstrói tanto as opções de impressão quanto o estado inválido das remissões

### Requirement: Formato do ponto de extensão compatível com o conversor LexML
O sistema SHALL gravar o conteúdo do LexEdit, dentro de `MetadadoProprietario`, como o elemento nomeado `lexedit:Metadado` (namespace `http://www.lexml.gov.br/lexedit/1.0`), com os grupos tipados conforme `schemas/lexedit.xsd`, no mesmo formato de `docs/extensao-formato-lexml/documento-articulado-exemplo.json`. A lista de identificadores de remissões internas inválidas SHALL ser gravada como um único texto, com os identificadores separados por espaço. A lista de pendências SHALL ser gravada como uma sequência de elementos `Pendencia` dentro de `Pendencias`. O conversor `jsonix-lexml` 2.1.0 SHALL converter o arquivo salvo em XML sem erro e sem descartar nenhum grupo.

#### Scenario: Conversão para XML preserva os grupos do LexEdit
- **WHEN** o usuário salva um documento com local "Sala das sessões", data `2026-04-24` e opções de impressão, e o arquivo é convertido em XML pelo conversor `jsonix-lexml` 2.1.0
- **THEN** o XML contém `MetadadoProprietario` com um `lexedit:Metadado` que tem `local="Sala das sessões"`, `data="2026-04-24"` e o filho `lexedit:OpcoesImpressao` com os quatro atributos

#### Scenario: Documento com mais de uma remissão interna inválida
- **WHEN** o usuário salva um documento com duas remissões internas inválidas, e o arquivo é convertido em XML pelo conversor
- **THEN** a conversão termina sem erro, e o XML contém `lexedit:RemissoesInternasInvalidas` com `refIdsRemissoesInternas` listando os dois identificadores separados por espaço

#### Scenario: Pendências no XML
- **WHEN** o usuário salva um documento com remissão interna inválida, e o arquivo é convertido em XML pelo conversor
- **THEN** o XML contém `lexedit:Pendencias` com um `lexedit:Pendencia` por pendência

#### Scenario: XML gerado é válido pelo esquema do LexEdit
- **WHEN** o XML gerado pelo conversor a partir de um documento salvo pelo editor é validado com `schemas/lexedit.xsd`, que importa o esquema LexML
- **THEN** a validação não aponta erro, nem na parte LexML nem no conteúdo de `lexedit:Metadado`

### Requirement: Ida e volta dos metadados do LexEdit pelo conversor
Ao converter em XML um documento salvo pelo editor e convertê-lo de volta em JSON pelo conversor `jsonix-lexml` 2.1.0, o sistema SHALL abrir o resultado com os mesmos valores de todos os grupos do LexEdit que suporta. Salvar de novo esse documento SHALL gerar um arquivo igual ao original.

#### Scenario: Opções de impressão, fecho e remissão inválida voltam do XML
- **WHEN** um documento com opções de impressão alteradas, local e data do fecho e uma remissão interna inválida é salvo, convertido em XML, convertido de volta em JSON e aberto
- **THEN** o formulário de opções de impressão, o campo "Data" e o local exibem os valores salvos, e a remissão é reconstruída como inválida
- **AND** salvar esse documento aberto gera um arquivo igual ao salvo originalmente

### Requirement: Leitura do formato provisório dos metadados do LexEdit
Ao abrir um documento salvo antes da adoção do conversor `jsonix-lexml` 2.0.0, com os metadados do LexEdit no formato provisório (a chave `lexedit` diretamente em `MetadadoProprietario`, com `refIdsRemissoesInternas` como lista e `pendencias` como lista de textos), o sistema SHALL recuperar os mesmos grupos que recupera do formato novo. O próximo salvamento SHALL gravar somente o formato novo.

#### Scenario: Arquivo antigo com opções de impressão e fecho
- **WHEN** o usuário abre um arquivo salvo no formato provisório, com opções de impressão e com local e data do fecho
- **THEN** o formulário de opções de impressão, o campo "Data" e o local exibem os valores do arquivo

#### Scenario: Arquivo antigo com remissão interna inválida
- **WHEN** o usuário abre um arquivo salvo no formato provisório com uma remissão interna inválida listada
- **THEN** a remissão é reconstruída como inválida, com a mensagem no dispositivo de origem e o alerta global

#### Scenario: Salvar um arquivo antigo converte para o formato novo
- **WHEN** o usuário abre um arquivo salvo no formato provisório e o salva
- **THEN** o arquivo salvo contém os metadados do LexEdit somente no formato novo, sem a chave `lexedit`

#### Scenario: Formato novo prevalece se os dois estiverem presentes
- **WHEN** um arquivo aberto contém, em `MetadadoProprietario`, o `lexedit:Metadado` no formato novo e também a chave `lexedit` do formato provisório, com valores diferentes
- **THEN** o sistema usa os valores do formato novo

### Requirement: Grupo de usuários referenciados
O sistema SHALL gravar o grupo `Usuarios` em `lexedit:Metadado` somente quando houver ao menos uma referência `refIdUsuario` a registrar, sem repetir usuários, e SHALL ler o grupo ao abrir de forma independente dos demais grupos.

#### Scenario: Documento sem referência a usuário
- **WHEN** o usuário salva um documento sem nenhum grupo que referencie usuários
- **THEN** o arquivo salvo não contém `Usuarios`

#### Scenario: Convivência com os demais grupos
- **WHEN** o usuário salva um documento com opções de impressão, autoria, remissão interna inválida e revisões da hierarquia
- **THEN** o arquivo salvo contém um único `MetadadoProprietario` com todos os grupos, e `Usuarios` com os usuários das revisões

### Requirement: Revisões da hierarquia compatíveis com o conversor LexML
O sistema SHALL gravar `RevisoesArticulacao` no formato tipado do conversor `jsonix-lexml` 2.1.0, conforme `schemas/lexedit.xsd`, incluindo o conteúdo filho de cada `RevisaoArticulacao` (dispositivo com o estado anterior, com o texto e o título anteriores, ou dispositivo excluído com sua hierarquia). O conversor SHALL converter o arquivo em XML sem erro e sem descartar nenhum atributo ou conteúdo das revisões.

#### Scenario: Conversão para XML preserva as revisões
- **WHEN** o usuário salva um documento com revisões de adição, exclusão, alteração, movimentação e transformação, e o arquivo é convertido em XML pelo conversor
- **THEN** o XML contém um `lexedit:RevisaoArticulacao` por revisão principal, com `revisao`, `refIdUsuario` e `data`, e o conteúdo filho de cada uma

#### Scenario: XML válido pelo esquema do LexEdit
- **WHEN** o XML gerado a partir de um documento com revisões da hierarquia é validado com `schemas/lexedit.xsd`
- **THEN** a validação não aponta erro, nem na parte LexML nem no conteúdo de `lexedit:Metadado`

#### Scenario: Ida e volta pelo conversor
- **WHEN** um documento com revisões da hierarquia é salvo, convertido em XML, convertido de volta em JSON e aberto
- **THEN** o editor exibe as mesmas revisões, e salvar esse documento gera um arquivo igual ao original

#### Scenario: Conversão preserva o estado anterior com título
- **WHEN** um documento com revisões de texto, e de adição, alteração e remoção de título, uma delas com formatação no título, em inciso e em artigo, é convertido em XML pelo conversor e validado com `schemas/lexedit.xsd`
- **THEN** o XML contém o `TituloDispositivo` anterior, com a formatação, dentro de cada revisão que o tinha, não contém `TituloDispositivo` onde não havia título, a validação não aponta erro, e a conversão de volta reproduz as mesmas revisões

### Requirement: Flag de substitutivo fora do formato salvo
O sistema SHALL NOT gravar nem ler o atributo `substitutivo` em `lexedit:Metadado`, e o esquema `schemas/lexedit.xsd` SHALL NOT declará-lo.

#### Scenario: Documento salvo não contém substitutivo
- **WHEN** o usuário salva um documento, inclusive um criado como texto substitutivo
- **THEN** o `lexedit:Metadado` do arquivo salvo não contém o atributo `substitutivo`

#### Scenario: Arquivo com o atributo substitutivo é aberto
- **WHEN** o usuário abre um arquivo cujo `lexedit:Metadado` traz `substitutivo`
- **THEN** o documento abre normalmente, sem erro, e o atributo é ignorado

### Requirement: Documento referenciado previsto e não preenchido
O esquema do LexEdit SHALL prever o atributo opcional `urnDocumentoReferenciado` (texto) em `lexedit:Metadado`. O sistema SHALL NOT gravar esse atributo ao salvar nem alterar o comportamento ao ler um arquivo que o contenha.

#### Scenario: Salvar não grava a URN do documento referenciado
- **WHEN** o usuário salva qualquer documento
- **THEN** o `lexedit:Metadado` do arquivo salvo não contém `urnDocumentoReferenciado`

#### Scenario: Arquivo com a URN do documento referenciado é aberto
- **WHEN** o usuário abre um arquivo cujo `lexedit:Metadado` traz `urnDocumentoReferenciado`
- **THEN** o documento abre normalmente, sem erro

#### Scenario: Esquema aceita o atributo
- **WHEN** um `lexedit:Metadado` com `urnDocumentoReferenciado` é validado com `schemas/lexedit.xsd`
- **THEN** a validação não aponta erro

### Requirement: Situação dos dispositivos de alteração na norma vigente
O sistema SHALL gravar, em `lexedit:SituacaoNaNormaVigente`, os identificadores dos dispositivos de bloco de alteração de norma que existem na norma vigente em `refIdsDispositivosExistentes` e os que são novos em `refIdsDispositivosNovos`, cada lista como texto com os identificadores separados por espaço. Dispositivos fora de bloco de alteração e dispositivos sem situação informada SHALL NOT constar em nenhuma das listas. O elemento SHALL ser omitido quando as duas listas estiverem vazias, e um atributo com lista vazia SHALL ser omitido.

#### Scenario: Dispositivos existentes e novos
- **WHEN** o usuário salva um documento com um bloco de alteração contendo um artigo marcado como "Existente" e outro marcado como "Novo"
- **THEN** o arquivo contém `lexedit:SituacaoNaNormaVigente` com o id do primeiro em `refIdsDispositivosExistentes` e o id do segundo em `refIdsDispositivosNovos`

#### Scenario: Várias ocorrências na mesma lista
- **WHEN** o documento tem três dispositivos existentes em blocos de alteração
- **THEN** `refIdsDispositivosExistentes` lista os três ids separados por espaço, e `refIdsDispositivosNovos` é omitido

#### Scenario: Documento sem bloco de alteração
- **WHEN** o usuário salva um documento sem nenhum bloco de alteração de norma
- **THEN** o arquivo não contém `lexedit:SituacaoNaNormaVigente`

### Requirement: Situação na norma vigente dos dispositivos de bloco excluído
O sistema SHALL incluir, em `refIdsDispositivosExistentes` e `refIdsDispositivosNovos`, os identificadores dos dispositivos de bloco de alteração contidos em dispositivos excluídos em revisão, com o identificador gravado na revisão `excluido` (prefixo `_` e sufixo `-exc<sequencial>`), segundo a situação que tinham ao serem excluídos. Ao abrir, o sistema SHALL reaplicar essa situação aos dispositivos reconstruídos do excluído.

#### Scenario: Bloco excluído com dispositivos existente e novo
- **WHEN** o usuário, em modo de revisão, exclui um artigo que altera norma, com um artigo "Existente" e um parágrafo "Novo" no bloco, e salva
- **THEN** o id do artigo do bloco excluído consta em `refIdsDispositivosExistentes` e o do parágrafo em `refIdsDispositivosNovos`, ambos com o prefixo do identificador do excluído

#### Scenario: Rejeitar a exclusão devolve a situação
- **WHEN** o usuário abre esse documento e rejeita a revisão de exclusão
- **THEN** o artigo volta exibido como "Existente" e o parágrafo como "Novo", com o rótulo original

#### Scenario: Sem bloco de alteração no excluído
- **WHEN** o usuário exclui, em revisão, um artigo sem bloco de alteração e salva
- **THEN** nenhum id de dispositivo excluído consta nas listas de situação

### Requirement: Colegiado apreciador no arquivo
O sistema SHALL gravar o destino da proposição em `lexedit:ColegiadoApreciador`, com `siglaCasaLegislativa` (`SF`, `CD` ou `CN`) e `tipoColegiado` (`Plenário` ou `Comissão`), e `siglaComissao` somente quando houver comissão informada. Um anexo de parecer SHALL NOT ter o elemento gravado, assim como não tem fecho nem autoria.

#### Scenario: Destino Plenário
- **WHEN** o usuário salva um documento com destino Plenário do Senado
- **THEN** o arquivo contém `lexedit:ColegiadoApreciador` com `siglaCasaLegislativa="SF"` e `tipoColegiado="Plenário"`, sem `siglaComissao`

#### Scenario: Destino Comissão
- **WHEN** o usuário salva um documento com destino a uma comissão
- **THEN** o `lexedit:ColegiadoApreciador` contém `tipoColegiado="Comissão"` e a `siglaComissao` escolhida

### Requirement: Novos grupos na ida e volta pelo conversor
O conversor `jsonix-lexml` 2.1.0 SHALL converter para XML e de volta para JSON um documento com `lexedit:SituacaoNaNormaVigente` e `lexedit:ColegiadoApreciador` sem descartá-los, e o XML gerado SHALL ser válido pelo `schemas/lexedit.xsd`.

#### Scenario: Ida e volta preserva situação e destino
- **WHEN** um documento com bloco de alteração (dispositivos existentes e novos) e destino Comissão é salvo, convertido em XML, convertido de volta em JSON e aberto
- **THEN** a situação dos dispositivos e o destino exibem os valores salvos
- **AND** salvar esse documento aberto gera um arquivo igual ao salvo originalmente
