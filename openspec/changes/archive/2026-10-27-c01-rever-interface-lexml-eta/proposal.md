# Proposal

## Why

A interface do `lexml-eta` com o host cresceu por acréscimos: `inicializarEdicao(params)` aceita a identificação do documento de quatro formas (`urn`, `sigla`/`numero`/`ano`, `proposicao`, `projetoNorma`), mistura dados do documento com preferências da sessão e deixa o reset entre documentos parcial. A issue #1016 pede um contrato explícito: criar uma nova proposição, abrir uma existente e um estado neutro de espera. O host está em desenvolvimento controlado, então o contrato antigo pode ser quebrado agora.

## What Changes

- **BREAKING** `inicializarEdicao` deixa de ser público. A API passa a ter `novaProposicao(dados)`, `abrirDocumentoArticulado(...)` e `fecharDocumento()`.
- `novaProposicao` recebe URN, epígrafe e preâmbulo (obrigatórios) e, opcionais, URN do documento referenciado, colegiado de destino, autoria, opções de impressão, outros metadados, documento articulado de modelo e indicativo de anexo de parecer. O modelo empresta só articulação e ementa; o resto vem dos parâmetros ou do padrão do `lexml-eta`.
- Só se cria proposição de tipo com sigla do vocabulário da casa do editor, de autoridade `senado.federal`, `camara.deputados` ou `congresso.nacional`. As autoridades ganham no vocabulário a sigla da casa responsável (`SF`, `CD`, `CN`), da qual a casa do documento deriva.
- Estado neutro inicial (e após `fecharDocumento()`): abas da esquerda e da direita desabilitadas, a primeira com "aguardando inicialização" centralizado.
- Todo método de inicialização reseta o documento anterior, inclusive o `rootStore`. O host confirma antes; o componente não rastreia alterações pendentes.
- **BREAKING** `usuario`, `configuracaoPaginacao`, `autoriaPadrao` e `opcoesImpressaoPadrao` passam para `lexmlEtaConfig` (sessão). O padrão de autoria e de impressão vale só na nova proposição.
- **BREAKING** `anexoParecer` sai de `lexmlEtaConfig` e vira propriedade do documento, gravada e lida em `lexedit:Metadado@anexoParecer`.
- A URN do documento referenciado passa a ser gravada e lida em `lexedit:Metadado@urnDocumentoReferenciado` (já previsto no `lexedit.xsd`).
- Abrir documento que não seja proposição suportada (ex.: MPV ou norma) é permitido como tipo "não suportado": sem edição de destino e autoria (gravados vazios), erro na aba de avisos recalculado pela URN e gravado como pendência; salvar continua permitido. Documento da casa oposta continua recusado.

## Capabilities

### New Capabilities
- `interface-lexml-eta`: contrato do componente com o host (métodos de inicialização, estado neutro, reset, derivação da casa pela URN, configuração da sessão, modelo de documento).

### Modified Capabilities
- `metadados-lexedit`: grava e lê `anexoParecer` e `urnDocumentoReferenciado`; pendência de documento não suportado.
- `modo-anexo-parecer`: o modo vem do documento, não da configuração.
- `abrir-documento-articulado`: abertura de tipo "não suportado" e aplicação do modo e da referência lidos do arquivo.
- `vocabulario-urn`: sigla da casa responsável nas autoridades e definição de proposição suportada (o complemento é o tipo "não suportado").

## Impact

- Código: `src/components/lexml-eta.component.ts`, `src/model/lexmlEtaConfig.ts`, `LexmlEtaParametrosEdicao`, `lexml-eta-proposicao.component.ts`, montador e leitor de metadados em `src/model/lexml/documento/conversor/`, componentes de destino e autoria, aba de avisos.
- Testes: unitários dos conversores e do componente, integração com o CLI real (`documentoArticulado.integration.ts`) e E2E Cypress da abertura, do estado neutro e do tipo "não suportado".
- Coordenação com o `lexeditweb-editor`: adotar a nova API e mover usuário, paginação e padrões para a configuração.
- Relação com a change `2026-10-26-c01-especificar-componente-nova-proposicao` (#1024): o contrato de entrada de `novaProposicao` deve ser compatível com o `detail` do evento daquele componente.
