# Proposal

## Why

O editor só tem hoje um anexo simples: um botão no editor que aceita **um** PDF e guarda o conteúdo em `base64` dentro de `Proposicao.anexos`, sem relação com o documento articulado. Isso não atende ao uso de proposições com vários documentos de apoio (ex.: texto substitutivo, emendas), que o host precisa armazenar à parte e o PDF de apresentação precisa embutir. O formato LexEdit já prevê `lexedit:Anexos` (`docs/extensao-formato-lexml/05-anexos.md`), mas não há interface, montador nem leitor (issue lexml/lexml-eta#1043). A funcionalidade é inspirada na já existente no `lexml-parecer`.

## What Changes

- Nova aba **"Anexos"**, antes da aba "Avisos", com a lista de anexos (nome do documento, visualizar, baixar, mover para cima/baixo, excluir), um botão "Importar anexo" e o contador de anexos no rótulo. A aba também aparece no modo `anexoParecer`.
- Importação de **PDF e DOCX**, com escolha do nome do documento; visualização apenas de PDF.
- Integração com o host por **callbacks** na `LexmlEtaConfig`, como no `lexml-parecer`: upload (devolve o `idArquivo`), exclusão, obtenção do conteúdo e visualização; falha do host mostra um aviso e mantém o estado anterior.
- **Tipo fixo `nao.informado`** em todo anexo adicionado; o campo de tipo (e a lista de tipos do host, `tiposAnexos`) permanece no componente, mas oculto na interface.
- **Tamanho máximo do arquivo opcional**, configurável pelo host: só vale quando tem valor; sem valor (padrão), não há limite.
- Os anexos são gravados no documento articulado em `lexedit:Anexos` (`DadosLexEdit`, montador e leitor tolerante), **somente os metadados** (`idArquivo`, `nomeArquivo`, `nomeDocumento`, `tipo`, `mimeType`) e na ordem de exibição. O conteúdo fica com o host, recuperado pelo `idArquivo`. Sem anexos, o grupo é omitido. A lista vem do arquivo aberto: o host não informa a lista.
- **BREAKING**: o anexo atual é removido por completo (botão do editor, diálogo de PDF único, modelo `Anexo` com `base64`). `Proposicao.anexos` passa a usar o novo modelo, sem `base64`, e `tamanhoMaximoAnexo` deixa de ter 5 MB por padrão. Nenhuma aplicação usa o componente ainda, portanto não há migração.
- Documentação da API em `docs/api-componente-lexml-eta.md` e da especificação do formato em `docs/extensao-formato-lexml/05-anexos.md`.
- Fora do escopo: armazenamento do conteúdo dos arquivos e sua inclusão no PDF (cabem ao host), edição do `lexedit.xsd` (o grupo já existe) e comportamento do `lexml-parecer`.

## Capabilities

### New Capabilities
- `anexos-proposicao`: gerenciamento dos anexos da proposição na interface do editor (aba, importação, ordem, tipos, limite de tamanho, integração com o host por callbacks).

### Modified Capabilities
- `metadados-lexedit`: novos requisitos para o grupo `Anexos` (gravação só dos metadados na ordem de exibição, leitura tolerante, ida e volta pelo conversor e validação pelo esquema).

## Impact

- `src/components/lexml-eta.component.ts` (nova aba, coleta ao salvar e aplicação ao abrir), novo componente da aba, `src/model/lexmlEtaConfig.ts` (callbacks, tipos e limite), `src/model/proposicao/proposicao.ts` (modelo do anexo).
- `src/model/lexml/documento/documentoArticulado.ts`, `conversor/buildJsonixFromProjetoNorma.ts`, `conversor/buildProjetoNormaFromJsonix.ts`.
- Remoção do anexo atual em `editor-texto-rico/uploadAnexoDialog.ts`, `editor-texto-rico.component.ts`, `editor/editor.component.ts` e `lexml-eta-proposicao.component.ts`.
- `docs/api-componente-lexml-eta.md`, `docs/extensao-formato-lexml/`, demo (callbacks de exemplo) e testes (unitários, integração com o conversor real e E2E).
- Hosts: o `lexeditweb-editor` precisa implementar os callbacks para habilitar a importação e o conteúdo dos anexos; sem eles, a aba lista os anexos do arquivo e avisa que a operação não está disponível.
