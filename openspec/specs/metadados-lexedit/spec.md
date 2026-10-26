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
O sistema SHALL gravar o conteúdo do LexEdit, dentro de `MetadadoProprietario`, como o elemento nomeado `lexedit:Metadado` (namespace `http://www.lexml.gov.br/lexedit/1.0`), com os grupos tipados conforme `schemas/lexedit.xsd`, no mesmo formato de `docs/extensao-formato-lexml/documento-articulado-exemplo.json`. A lista de identificadores de remissões internas inválidas SHALL ser gravada como um único texto, com os identificadores separados por espaço. A lista de pendências SHALL ser gravada como uma sequência de elementos `Pendencia` dentro de `Pendencias`. O conversor `jsonix-lexml`, na versão indicada em `schemas/README.md`, SHALL converter o arquivo salvo em XML sem erro e sem descartar nenhum grupo.

#### Scenario: Conversão para XML preserva os grupos do LexEdit
- **WHEN** o usuário salva um documento com local "Sala das sessões", data `2026-04-24` e opções de impressão, e o arquivo é convertido em XML pelo conversor `jsonix-lexml`
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
Ao converter em XML um documento salvo pelo editor e convertê-lo de volta em JSON pelo conversor `jsonix-lexml`, o sistema SHALL abrir o resultado com os mesmos valores de todos os grupos do LexEdit que suporta. Salvar de novo esse documento SHALL gerar um arquivo igual ao original.

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
O sistema SHALL gravar `RevisoesArticulacao` no formato tipado do conversor `jsonix-lexml`, conforme `schemas/lexedit.xsd`, incluindo o conteúdo filho de cada `RevisaoArticulacao` (dispositivo com o estado anterior, com o texto e o título anteriores, ou dispositivo excluído com sua hierarquia). O conversor SHALL converter o arquivo em XML sem erro e sem descartar nenhum atributo ou conteúdo das revisões.

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
O conversor `jsonix-lexml` SHALL converter para XML e de volta para JSON um documento com `lexedit:SituacaoNaNormaVigente` e `lexedit:ColegiadoApreciador` sem descartá-los, e o XML gerado SHALL ser válido pelo `schemas/lexedit.xsd`.

#### Scenario: Ida e volta preserva situação e destino
- **WHEN** um documento com bloco de alteração (dispositivos existentes e novos) e destino Comissão é salvo, convertido em XML, convertido de volta em JSON e aberto
- **THEN** a situação dos dispositivos e o destino exibem os valores salvos
- **AND** salvar esse documento aberto gera um arquivo igual ao salvo originalmente

### Requirement: Grupo de outros metadados genéricos
O sistema SHALL gravar o grupo `OutrosMetadados` em `lexedit:Metadado` somente quando houver ao menos um par chave/valor a registrar, com um `lexedit:OutroMetadado` por par: a chave no atributo `chave` e o valor como conteúdo de texto. Chave e valor SHALL ser gravados como informados, sem interpretação. Sem nenhum par, o grupo SHALL ser omitido, e o grupo SHALL NOT gerar pendência.

#### Scenario: Documento com dois pares
- **WHEN** o usuário salva um documento com os metadados `tituloAntesDaEpigrafe` = "COMISSÃO XPTO" e `jsonDadosComissao` = `{"id":1,"ativa":true}`
- **THEN** o arquivo contém `lexedit:OutrosMetadados` com um `lexedit:OutroMetadado` para cada chave, e o valor do segundo é o texto JSON, sem alteração

#### Scenario: Documento sem outros metadados
- **WHEN** o usuário salva um documento sem nenhum par chave/valor
- **THEN** o arquivo não contém `lexedit:OutrosMetadados`

#### Scenario: Grupo não gera pendência
- **WHEN** o usuário salva um documento apenas com outros metadados
- **THEN** o arquivo não contém `lexedit:Pendencias` por causa do grupo

#### Scenario: Convivência com os demais grupos
- **WHEN** o usuário salva um documento com opções de impressão, autoria e outros metadados
- **THEN** o arquivo contém um único `MetadadoProprietario` com todos os grupos, e o conteúdo de cada um não é alterado pelos outros

### Requirement: Unicidade das chaves
O esquema `schemas/lexedit.xsd` SHALL exigir que a `chave` seja única dentro de `lexedit:OutrosMetadados`. O sistema SHALL NOT gravar duas entradas com a mesma chave, e ao ler um arquivo com chaves repetidas SHALL manter a primeira ocorrência e ignorar as demais, sem invalidar o documento.

#### Scenario: Esquema rejeita chave repetida
- **WHEN** um `lexedit:Metadado` com duas entradas de mesma `chave` é validado com `schemas/lexedit.xsd`
- **THEN** a validação aponta erro de unicidade

#### Scenario: Arquivo com chave repetida é aberto
- **WHEN** o usuário abre um arquivo cujo `OutrosMetadados` repete uma chave com valores diferentes
- **THEN** o documento abre normalmente e a propriedade de outros metadados contém o valor da primeira ocorrência

### Requirement: Leitura tolerante dos outros metadados
Ao abrir um documento, o sistema SHALL recuperar do grupo `OutrosMetadados` todos os pares válidos, descartando as entradas sem `chave`, com `chave` vazia ou com valor que não seja texto, sem impedir a leitura dos demais pares nem dos demais grupos. Valor vazio SHALL ser aceito como texto vazio.

#### Scenario: Arquivo com pares válidos e inválidos
- **WHEN** o usuário abre um arquivo cujo `OutrosMetadados` tem um par válido, uma entrada sem `chave` e uma entrada com valor não textual
- **THEN** o documento abre normalmente e os outros metadados contêm somente o par válido

#### Scenario: Valor vazio
- **WHEN** o usuário abre um arquivo com `<lexedit:OutroMetadado chave="x"></lexedit:OutroMetadado>`
- **THEN** os outros metadados contêm a chave `x` com valor vazio

#### Scenario: Convive com os demais grupos
- **WHEN** o usuário abre um arquivo com `OutrosMetadados` inválido e opções de impressão válidas
- **THEN** o formulário de opções de impressão exibe os valores do arquivo

### Requirement: Propriedade pública para os outros metadados
O componente `LexmlEtaComponent` SHALL expor a propriedade pública `outrosMetadados` (`Record<string, string>`). Ao salvar, o sistema SHALL gravar o valor corrente da propriedade, inclusive em anexo de parecer. Ao abrir um arquivo, o sistema SHALL substituir o valor da propriedade pelos pares lidos, e um arquivo sem o grupo SHALL deixá-la vazia.

#### Scenario: Host define a propriedade e salva
- **WHEN** o host define `outrosMetadados` com `{ tituloAntesDaEpigrafe: "COMISSÃO XPTO" }` e o usuário salva
- **THEN** o arquivo salvo contém o par correspondente

#### Scenario: Anexo de parecer
- **WHEN** o host define `outrosMetadados` com um par e o documento é um anexo de parecer
- **THEN** o arquivo salvo contém o grupo `OutrosMetadados`

#### Scenario: Abrir arquivo com outros metadados
- **WHEN** o usuário abre um arquivo com dois pares em `OutrosMetadados`
- **THEN** a propriedade `outrosMetadados` do componente contém os dois pares

#### Scenario: Abrir arquivo sem o grupo
- **WHEN** o usuário abre um arquivo sem `OutrosMetadados` depois de ter aberto outro que o tinha
- **THEN** a propriedade `outrosMetadados` fica vazia

### Requirement: Outros metadados na ida e volta pelo conversor
O conversor `jsonix-lexml` com o esquema atualizado SHALL converter para XML e de volta para JSON um documento com `lexedit:OutrosMetadados` sem descartá-lo, e o XML gerado SHALL ser válido pelo `schemas/lexedit.xsd`. Salvar de novo o documento aberto SHALL gerar um arquivo igual ao original.

#### Scenario: Ida e volta preserva os pares
- **WHEN** um documento com três pares, um deles com caracteres especiais de XML (`<`, `&`, aspas) e acentos, é salvo, convertido em XML, convertido de volta em JSON e aberto
- **THEN** a propriedade `outrosMetadados` contém os três pares com os valores originais
- **AND** salvar esse documento aberto gera um arquivo igual ao salvo originalmente

#### Scenario: XML válido pelo esquema
- **WHEN** o XML gerado a partir de um documento com outros metadados é validado com `schemas/lexedit.xsd`
- **THEN** a validação não aponta erro

### Requirement: Grupo de anexos no arquivo
O sistema SHALL gravar o grupo `Anexos` em `lexedit:Metadado` somente quando houver ao menos um anexo, com um `lexedit:Anexo` por anexo, na ordem de exibição, e os atributos `idArquivo`, `nomeArquivo`, `nomeDocumento`, `tipo` e `mimeType`. O conteúdo do arquivo anexado SHALL NOT ser gravado. Sem anexos, o grupo SHALL ser omitido, e o grupo SHALL NOT gerar pendência. O sistema SHALL gravar o grupo também no modo anexo de parecer.

#### Scenario: Documento com dois anexos
- **WHEN** o usuário salva um documento com dois anexos, o primeiro DOCX do tipo `substitutivo` e o segundo PDF do tipo `nao.informado`
- **THEN** o arquivo contém `lexedit:Anexos` com dois `lexedit:Anexo`, na mesma ordem, cada um com os cinco atributos

#### Scenario: Conteúdo não é gravado
- **WHEN** o usuário salva um documento com anexos
- **THEN** o arquivo não contém o conteúdo dos arquivos anexados, apenas o `idArquivo` de cada um

#### Scenario: Documento sem anexos
- **WHEN** o usuário salva um documento sem anexos
- **THEN** o arquivo não contém `lexedit:Anexos`

#### Scenario: Grupo não gera pendência
- **WHEN** o usuário salva um documento apenas com anexos
- **THEN** o arquivo não contém `lexedit:Pendencias` por causa do grupo

#### Scenario: Modo anexo de parecer
- **WHEN** o usuário salva, no modo anexo de parecer, um documento com um anexo
- **THEN** o arquivo contém o grupo `Anexos`

#### Scenario: Convivência com os demais grupos
- **WHEN** o usuário salva um documento com opções de impressão, autoria e anexos
- **THEN** o arquivo contém um único `MetadadoProprietario` com todos os grupos, e o conteúdo de cada um não é alterado pelos outros

### Requirement: Leitura tolerante dos anexos
Ao abrir um documento, o sistema SHALL recuperar do grupo `Anexos` os anexos válidos, na ordem do arquivo, descartando o `Anexo` sem `idArquivo` ou sem `nomeArquivo` textuais não vazios, ou com `mimeType` diferente de PDF e DOCX, sem impedir a leitura dos demais anexos nem dos demais grupos. `nomeDocumento` ausente SHALL assumir o nome do arquivo sem extensão, e `tipo` ausente ou vazio SHALL assumir `nao.informado`.

#### Scenario: Arquivo com anexos válidos e inválidos
- **WHEN** o usuário abre um arquivo cujo `Anexos` tem um anexo válido, um sem `idArquivo` e um com `mimeType` `image/png`
- **THEN** o documento abre normalmente e a aba lista somente o anexo válido

#### Scenario: Atributos opcionais ausentes
- **WHEN** o usuário abre um arquivo com um anexo `parecer.pdf` sem `nomeDocumento` e sem `tipo`
- **THEN** a aba mostra o nome do documento `parecer` e o anexo tem o tipo `nao.informado`

#### Scenario: Um único anexo
- **WHEN** o usuário abre um arquivo cujo `Anexos` tem um único `Anexo`, entregue pelo conversor como objeto em vez de lista
- **THEN** a aba lista esse anexo

#### Scenario: Convive com os demais grupos
- **WHEN** o usuário abre um arquivo com `Anexos` inválido e opções de impressão válidas
- **THEN** o formulário de opções de impressão exibe os valores do arquivo

### Requirement: Anexos na ida e volta pelo conversor
O conversor `jsonix-lexml` SHALL converter para XML e de volta para JSON um documento com `lexedit:Anexos` sem descartá-lo, e o XML gerado SHALL ser válido pelo `schemas/lexedit.xsd`. Salvar de novo o documento aberto SHALL gerar um arquivo igual ao original.

#### Scenario: Ida e volta preserva os anexos
- **WHEN** um documento com três anexos, um deles com acentos e `&` no nome do documento, é salvo, convertido em XML, convertido de volta em JSON e aberto
- **THEN** a aba lista os três anexos, na mesma ordem, com os mesmos valores
- **AND** salvar esse documento aberto gera um arquivo igual ao salvo originalmente

#### Scenario: XML válido pelo esquema
- **WHEN** o XML gerado a partir de um documento com anexos é validado com `schemas/lexedit.xsd`
- **THEN** a validação não aponta erro
