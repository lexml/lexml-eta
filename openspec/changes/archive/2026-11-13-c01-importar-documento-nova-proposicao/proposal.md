# Proposal

## Why

A opção "Importar documento" da Tela 2 da `nova-proposicao` ainda é simulada: sem o callback do host, ela sempre devolve um erro de parser e nenhum arquivo chega a ser convertido (issue lexml/lexml-eta#1059). Além disso, mesmo quando um texto chega, o `lexml-eta` usa o documento só como modelo (articulação e ementa) e descarta a justificação, a autoria, as revisões e os demais dados. Isso inviabiliza importar um PDF ou um LexML gerado pelo próprio LexEdit para começar uma proposição nova a partir dele.

## What Changes

- A `nova-proposicao` ganha a URL de conversão `urlImportacaoArquivo`, alternativa ao callback `onImportarArquivo`, que já existe. O arquivo é enviado por POST, com o conteúdo no corpo e o `Content-Type` do formato, decidido pela extensão.
- **BREAKING**: a importação passa a ser uma origem obrigatória da configuração, como verificação, texto e comissões. Sem a URL e sem o callback, a inicialização falha, e o simulador de erro de parser é removido.
- Formatos aceitos: PDF, DOCX, TXT, XML e JSON. A extensão `.lexml` deixa de ser aceita, e o seletor de arquivo filtra por essas extensões.
- Um `.json` é lido direto como documento articulado (JSONIX), sem chamar a URL nem o callback.
- Resposta `200`: o JSONIX é o documento importado. `400`: alerta de aviso na Tela 2 com a mensagem devolvida, em texto puro. `500` ou falha de rede: alerta de erro na Tela 2 com mensagem própria, sem expor o corpo, e **Continuar** fica disponível para nova tentativa.
- **BREAKING**: o `detail` de conclusão passa a levar o documento importado em `documentoImportado`, e não mais em `texto`. `texto` continua valendo para o documento referenciado e para outra proposição.
- O `lexml-eta` ganha em `novaProposicao` o parâmetro `documentoImportado`. Dele aproveita o conteúdo como no "Abrir": ementa, articulação, justificação (com notas e revisões de texto), revisões da hierarquia, situação na norma vigente, autoria, fecho, opções de impressão e outros metadados. A identidade (URN, URN referenciada, epígrafe e preâmbulo), o destino e o anexo de parecer vêm dos parâmetros, isto é, da Tela 1. A URN do arquivo não é validada contra a casa do editor.
- Os anexos do documento importado são sempre descartados nesta change. Quando o documento trazia algum, o editor exibe na aba Avisos: "Não foi possível recuperar os anexos do documento importado. A proposição foi criada sem eles; se necessário, inclua-os novamente na aba Anexos."
- A demo ganha um fake do serviço de conversão no backend simulado (`demo/server`), como os de comissões e verificação. XML devolve `200` com um documento qualquer da demo; PDF devolve `500` "falha interna"; DOCX e TXT devolvem `400` "Conversão de DOCX ou TXT não implementada.". A demo passa a informar `urlImportacaoArquivo` na configuração e `documentoImportado` ao `lexml-eta`.

Fora do escopo:
- recuperar os anexos do documento importado: a devolução estruturada dos arquivos de anexo pelo host na conversão fica para outra change;
- erro em JSON no corpo do `400`/`500`, adiado na própria issue até a implementação de DOCX e TXT;
- conversão real de DOCX e TXT.

## Capabilities

### New Capabilities

Nenhuma.

### Modified Capabilities

- `nova-proposicao`: importação real por URL ou callback (origem obrigatória), formatos aceitos, `.json` lido direto, tratamento de `200`/`400`/`500`, documento importado em campo próprio do resultado e remoção do simulador.
- `interface-lexml-eta`: `novaProposicao` aceita um documento importado, do qual aproveita o conteúdo como no "Abrir", preservando a identidade e o destino informados e descartando os anexos com alerta.

## Impact

- Código: `src/components/nova-proposicao/` (componente, `urlsNovaProposicao.ts`), `src/components/lexml-eta.component.ts` (`novaProposicao`, `DadosNovaProposicao`), leitura do documento em `src/model/lexml/documento/`, demo (`demo/components/demoview.ts`, `demo/server/handlers.mjs`, `web-dev-server.config.mjs`).
- Testes: unitários da `nova-proposicao` e do `lexml-eta`, `test:demo-server` e E2E Cypress.
- Host `lexeditweb-editor`: precisa informar `urlImportacaoArquivo` ou `onImportarArquivo` (sem isso, a configuração da `nova-proposicao` é recusada) e repassar `documentoImportado` do resultado para `novaProposicao`. Ele não configura importação hoje, então não perde nenhum comportamento existente.
