# Como usar o componente `<lexml-eta>` — referência da API

O `<lexml-eta>` é o web component raiz do editor de texto articulado (LitElement + Redux + Quill + Shoelace). Ele reúne, em abas, o editor do texto, a justificação, as notas de rodapé e o formulário de destino, data, autoria e opções de impressão.

Este documento descreve a API pública do componente: instalação, propriedades, métodos, eventos e os tipos usados. Os trechos foram conferidos com `src/components/lexml-eta.component.ts` e `src/model/lexmlEtaConfig.ts` (versão do pacote: 1.8.8).

## 1. Instalação e importação

### 1.1 Como a biblioteca chega ao editor

O `@lexml/lexml-eta` **não é publicado em nenhum registro** (npm ou outro). Cada editor consumidor (o `lexedit` está previsto) mantém um script que:

1. entra no repositório do `lexml-eta` (caminho irmão `../lexml-eta`, sobrescrevível por variável de ambiente);
2. grava uma versão *snapshot* temporária (`<versão>-dev.<timestamp>`) com `npm version --no-git-tag-version`;
3. gera o `dist/` com `npm run prepublish`;
4. empacota com `npm pack`, gerando um `.tgz`;
5. copia o `.tgz` para uma pasta do repositório do consumidor (apagando o anterior);
6. aponta o `package.json` do consumidor para ele (`"@lexml/lexml-eta": "file:<pasta>/<arquivo>.tgz"`) e roda `npm install --ignore-scripts`;
7. restaura a versão original no `lexml-eta`.

> O script do `lexedit` ainda não existe. A descrição acima segue o padrão do `update-lexml-ui-commons.sh` do `lexml-parecer`, que usa o mesmo fluxo. Quando o script do `lexedit` for criado, confira os nomes e as pastas reais e ajuste esta seção.

Consequências práticas:

- O consumidor referencia um **arquivo local**, então atualizar o editor exige rodar o script de novo; não há `npm update`.
- O build deve passar por `npm run prepublish`: ele já encadeia a compilação do Worker da detecção de remissão externa (`build:lexml-linker-worker-dist`). Um `tsc` ou `rollup` avulso gera um `dist/` incompleto.
- Os assets estáticos (CSS, fontes) saem de `npm run copy:assets`, que não faz parte do `prepublish`. Confirme que o script do consumidor os copia, se o editor depender deles.

### 1.2 Importação

Depois de instalado como dependência `file:`, a importação é a de qualquer pacote:

```ts
import '@lexml/lexml-eta'; // registra <lexml-eta> e os componentes filhos
import { LexmlEtaComponent, LexmlEtaConfig, Usuario, Proposicao } from '@lexml/lexml-eta';
import type { DadosNovaProposicao } from '@lexml/lexml-eta';
```

Pontos de atenção:

- O componente **não usa Shadow DOM** (`createRenderRoot()` retorna `this`). O CSS global da página (e o CSS do editor, em `assets/`) vale para ele.
- Existe **um único store Redux global** (`rootStore`) compartilhado por todo o pacote. Não monte duas instâncias de `<lexml-eta>` na mesma página.
- O Redux assume que `process.env` existe. Em apps sem bundler que o defina, declare antes de carregar o módulo:
  ```html
  <script>window.process = { env: { NODE_ENV: 'production' } };</script>
  ```
- O Worker/WASM da detecção automática de remissão externa tem scripts próprios (`build:lexml-linker-worker-dist`, `copy:lexml-linker-wasm`). Veja o `package.json` e `docs/planos/PLANO_INTEGRACAO_LEXML_LINKER_WASM.md`.

## 2. Exemplo mínimo

```html
<lexml-eta id="editor"></lexml-eta>
```

```ts
import { LexmlEtaComponent, LexmlEtaConfig, Usuario } from '@lexml/lexml-eta';

const editor = document.querySelector('#editor') as LexmlEtaComponent;

// 1. Configuração da sessão (antes de iniciar um documento)
const config = new LexmlEtaConfig();
config.urlConsultaParlamentares = '/parlamentares';
config.urlComissoes = '/comissoes';
config.usuario = new Usuario('Maria da Silva', 123, 'MSILVA'); // usado nas marcas de revisão
editor.lexmlEtaConfig = config;

// 2. Sem documento, o componente fica em estado neutro ("aguardando inicialização").
//    Criar uma proposição nova...
await editor.novaProposicao({
  urn: 'urn:lex:br:senado.federal:projeto.lei;pl:2026;123',
  epigrafe: 'PROJETO DE LEI Nº 123, DE 2026',
  preambulo: 'O CONGRESSO NACIONAL decreta:',
});
// ...ou abrir um documento salvo: await editor.abrirDocumentoArticulado(arquivoJson);

// 4. Escutar eventos
editor.addEventListener('onrevisao', e => console.log('em revisão?', (e as CustomEvent).detail.emRevisao));
editor.addEventListener('fatalError', e => console.error((e as CustomEvent).detail.err));

// 5. Salvar
const documento = editor.getDocumentoArticulado();
```

Em Lit, a configuração pode ser passada por binding de propriedade: `<lexml-eta .lexmlEtaConfig=${config}></lexml-eta>`.

## 3. Propriedades

| Propriedade | Tipo | Padrão | Descrição |
|---|---|---|---|
| `lexmlEtaConfig` | `LexmlEtaConfig` | `new LexmlEtaConfig()` | URLs de serviços e limites. Veja a seção 5. |
| `parlamentares` | `Parlamentar[]` | `[]` | Lista usada na autoria. É **preenchida pelo próprio componente** ao iniciar um documento, a partir de `urlConsultaParlamentares`. |
| `comissoes` | `Comissao[]` | `[]` | Lista de comissões da casa legislativa. Também preenchida pelo componente, a partir de `urlComissoes`. |
| `exibirAjuda` | `boolean` | `true` | Exibe o conteúdo de ajuda. |
| `outrosMetadados` | `Record<string, string>` | `{}` | Pares chave/valor do host gravados no documento (`lexedit:OutrosMetadados`), também no modo `anexoParecer`. Os valores são sempre texto: para dados estruturados, grave um JSON serializado. `abrirDocumentoArticulado` substitui o valor pelos pares do arquivo (vazio se o arquivo não tiver o grupo), então o host deve lê-lo depois de abrir. |
| `dataUltimaModificacaoDocumento` | `string \| undefined` | `undefined` | **Somente leitura.** Data e hora do último salvamento do documento aberto, como gravada em `lexedit:Metadado@dataUltimaModificacao` (`xsd:dateTime` com fuso, ex.: `2026-05-12T10:15:00-03:00`). Fica `undefined` quando o arquivo não tem o atributo ou ele é inválido, numa nova proposição e depois de `fecharDocumento()`. `getDocumentoArticulado()` não a altera: o documento devolvido traz o instante do novo salvamento. Não confundir com `Proposicao.dataUltimaModificacao` (seção 4.2), que é o campo "Data" do fecho. |
| `totalAlertas` | `number` | `0` | Quantidade de alertas (somente leitura na prática; atualizada pelo componente). |

## 4. Métodos

### 4.1 Ciclo de vida do documento: `novaProposicao`, `abrirDocumentoArticulado` e `fecharDocumento`

São as **únicas** formas de iniciar, trocar ou encerrar a edição. Defina `lexmlEtaConfig` antes. Enquanto nenhum documento estiver iniciado, e depois de `fecharDocumento()`, o componente fica em **estado neutro**: todas as abas desabilitadas e a mensagem "aguardando inicialização".

Todo método valida a entrada **antes de alterar o editor**: entrada inválida emite o evento `fatalError`, lança o erro e deixa o documento em edição como estava. Ao iniciar um documento, o estado do anterior (revisões, remissões, anexos, outros metadados, justificação, notas, o store Redux) é descartado por inteiro; a configuração da sessão é preservada. O componente **não** rastreia alterações pendentes: confirmar a perda de dados é responsabilidade do host.

#### `novaProposicao(dados: DadosNovaProposicao): Promise<void>`

| Campo | Tipo | Descrição |
|---|---|---|
| `urn` | `string` | **Obrigatório.** URN da nova proposição. Só proposições suportadas: tipo com sigla do vocabulário da casa do editor, de autoridade `senado.federal`, `camara.deputados` ou `congresso.nacional`. Normas, medidas provisórias (autoridade `federal`) e autoridade da outra casa são rejeitadas. Tipos inativos (PLS, PLC) são aceitos: o alerta fica a cargo do host. |
| `epigrafe` | `string` | **Obrigatório.** Texto da epígrafe. |
| `preambulo` | `string` | **Obrigatório** (pode ser vazio; então vale o texto padrão do tipo, se houver). |
| `urnDocumentoReferenciado` | `string?` | URN do documento referenciado (substitutivo, PLV); gravada em `lexedit:Metadado@urnDocumentoReferenciado`. |
| `colegiadoApreciador` | `ColegiadoApreciador?` | Destino. Padrão: Plenário. Ignorado no modo anexo de parecer. |
| `autoria` | `Autoria?` | Padrão: `lexmlEtaConfig.autoriaPadrao`, se houver. |
| `opcoesImpressao` | `OpcoesImpressao?` | Padrão: `lexmlEtaConfig.opcoesImpressaoPadrao`, se houver. |
| `outrosMetadados` | `Record<string, string>?` | Pares gravados no documento. |
| `documentoModelo` | `DocumentoArticulado?` | Documento de modelo: dele só a articulação e a ementa são aproveitadas. URN, epígrafe, preâmbulo e demais dados vêm dos parâmetros ou do padrão; anexos, revisões, situação na norma vigente, fecho, autoria, impressão, destino e outros metadados do modelo são descartados. |
| `anexoParecer` | `boolean?` | Modo de anexo de parecer (propriedade do documento; veja a seção 9). Padrão: `false`. |

A casa responsável pela apreciação deriva da autoridade da URN (`senado.federal` → `SF`, `camara.deputados` → `CD`, `congresso.nacional` → `CN`) e não é um parâmetro.

```ts
await editor.novaProposicao({
  urn: 'urn:lex:br:senado.federal:projeto.lei;pl:2026;123',
  epigrafe: 'PROJETO DE LEI Nº 123, DE 2026',
  preambulo: 'O CONGRESSO NACIONAL decreta:',
  documentoModelo: modeloJson, // opcional
});
```

#### `fecharDocumento(): void`

Descarta o documento atual e volta ao estado neutro.

### 4.2 `getProposicao(): Proposicao`

Devolve o estado completo da edição, para o host persistir como quiser (por exemplo, no seu backend). Chama internamente `getProjetoAtualizado()`, o que também aplica as edições pendentes (como a detecção de remissões da linha corrente). Sem documento inicializado, devolve uma `Proposicao` vazia.

Campos preenchidos: `projetoNorma`, `justificativa`, `notasRodape`, `autoria`, `opcoesImpressao`, `ementa`, `epigrafe`, `revisoes`, `justificativaAntesRevisao`, `pendenciasPreenchimento`, `colegiadoApreciador`, `anexos`, `substitutivo`, `local`, `urn`, `sigla`, `numero`, `ano` e `dataUltimaModificacao`.

`pendenciasPreenchimento` lista o que impede considerar o texto pronto: justificação vazia (sempre obrigatória, exceto em `anexoParecer`) e as mensagens de nível crítico da validação. No modo `anexoParecer`, os campos `justificativa`, `justificativaAntesRevisao` e `notasRodape` são removidos do objeto; `local`, `autoria` e `dataUltimaModificacao` continuam sendo entregues.

`dataUltimaModificacao` traz a data escolhida no campo "Data" (`AAAA-MM-DD`) e fica `undefined` quando o usuário mantém "Não informar", que é o padrão de um documento novo. Apesar do nome, não é a data do último salvamento: essa está na propriedade `dataUltimaModificacaoDocumento` (seção 3).

### 4.3 `getDocumentoArticulado(): DocumentoArticulado`

Exporta o documento no formato de intercâmbio LexML (JSON Jsonix), incluindo os grupos de metadados do LexEdit já implementados: data e hora do salvamento (`dataUltimaModificacao`, gravada a cada chamada), opções de impressão, local e data do fecho, autoria de parlamentares, anexos (só os metadados, veja a seção 5.1) e remissões internas inválidas. Lança `Error('Inicialize um documento antes de salvar.')` se nada foi aberto.

Diferença em relação a `getProposicao()`: aqui o resultado é **um arquivo LexML autocontido**, que o próprio editor sabe reabrir; `getProposicao()` é o modelo interno do editor (inclui revisões, notas de rodapé, justificação etc.), que não passa pelo formato LexML.

### 4.4 `abrirDocumentoArticulado(entrada): Promise<void>`

Abre um documento exportado por `getDocumentoArticulado()`. Aceita o objeto Jsonix ou o seu texto JSON. O documento é **validado antes de alterar o editor**: se for inválido, emite `fatalError`, lança `Error` (por exemplo, URN sem ano e número, documento de outra casa legislativa, articulação ausente, ids repetidos) e o editor segue intacto. Documento de outra casa legislativa é recusado com `Error("Documento de outra casa legislativa não é suportado neste editor (autoridade '...').")`; as autoridades aceitas por casa são as do vocabulário (`SF` aceita `senado.federal`, `congresso.nacional` e `federal`; `CD`, `camara.deputados`, `congresso.nacional` e `federal`). Depois da abertura, aplica ao formulário os metadados do arquivo (modo de anexo de parecer, URN do documento referenciado, opções de impressão, data, local, destino, autoria), preenche `outrosMetadados` e `dataUltimaModificacaoDocumento` e exibe na aba "Anexos" os anexos do arquivo. Os padrões da sessão (`autoriaPadrao`, `opcoesImpressaoPadrao`) **não** se aplicam: valem os valores do arquivo.

**Tipo "não suportado".** Se a URN não for de proposição suportada (por exemplo, uma medida provisória ou uma norma), o documento abre normalmente, mas sem os formulários de destino e de autoria (os valores do arquivo são ignorados e gravados vazios ao salvar), com um erro na aba de avisos ("Este tipo de documento não é completamente suportado pelo editor.") e a pendência correspondente em `lexedit:Pendencias`. O erro não impede a edição nem o salvamento.

```ts
await editor.abrirDocumentoArticulado(await arquivo.text());
```

### 4.5 `setUsuario(usuario = new Usuario()): void`

Define quem autora as marcas de revisão.

```ts
class Usuario { nome = 'Anônimo'; id?: any; sigla?: string; constructor(nome?, id?, sigla?) }
```

### 4.6 Métodos auxiliares

| Método | Descrição |
|---|---|
| `getJustificativa(): string` | Texto (HTML) atual da justificação. |
| `getEpigrafe(projetoNorma): Epigrafe` | Epígrafe extraída de um `projetoNorma`. |
| `getEmentaFromProjetoNorma(projetoNorma): string` | Ementa extraída de um `projetoNorma`. |
| `getParlamentares(): Promise<Parlamentar[]>` / `getComissoes(sigla): Promise<Comissao[]>` | Consultas aos serviços configurados. Em geral não precisam ser chamadas diretamente. |
| `limparAlertas(): void` | Zera os alertas globais. |
| `focusOnTab(nome: string): void` | Seleciona uma aba (por exemplo, `'lexml-eta-proposicao'`, `'justificativa'`, `'autoria'`). |

## 5. Configuração — `LexmlEtaConfig`

| Campo | Tipo | Padrão | Descrição |
|---|---|---|---|
| `casaLegislativaEditor` | `'SF' \| 'CD'` | `'SF'` | Casa do editor: define o vocabulário de tipos de documento e URNs (`SF` = LexEdit; `CD` = Infoleg Editor). Valor ausente ou inválido assume `SF` e registra um aviso. Distinta de `casaLegislativa` (casa do documento, que admite `CN`); uma não influencia a outra. |
| `urlConsultaParlamentares` | `string` | `'api/parlamentares'` | Endpoint (GET) que devolve a lista de parlamentares. |
| `urlAutocomplete` | `string` | `'api/autocomplete-norma'` | Endpoint (GET `?query=`) de busca de normas, usado nos diálogos de alteração de norma e de remissão externa. |
| `urlPortalNormas` | `string` | `'https://normas.leg.br'` | Base dos links para abrir uma norma referenciada. |
| `urlComissoes` | `string?` | — | Endpoint (GET `?siglaCasaLegislativa=`) de comissões. Se ausente, a lista de comissões fica vazia. |
| `usuario` | `Usuario?` | — | Usuário das marcas de revisão. Se omitido, mantém o usuário atual do store. |
| `configuracaoPaginacao` | `ConfiguracaoPaginacao?` | — | Paginação dos dispositivos em textos grandes: `{ maxItensPorPagina?: number; rangeArtigos?: { numInicial: number; numFinal: number }[] }`. **Opcional**: sem ela, o texto é paginado automaticamente em blocos de até **1250 dispositivos**. Veja a seção 9. |
| `autoriaPadrao` | `{ identificacao: string; siglaCasaLegislativa: 'SF' \| 'CD' }?` | — | Parlamentar pré-selecionado na autoria de uma **nova proposição** (só funciona se o parlamentar existir na lista carregada; o dado `autoria` de `novaProposicao` vence). Não se aplica ao abrir. |
| `opcoesImpressaoPadrao` | `{ imprimirBrasao: boolean; textoCabecalho: string; tamanhoFonte: number }?` | — | Valores iniciais das opções de impressão de uma **nova proposição**; não se aplica ao abrir. |
| `tamanhoMaximoAnexo` | `number?` | — | Tamanho máximo de um anexo, em KB. Sem valor (ou não positivo), o tamanho não é limitado. Veja a seção 5.1. |
| `tiposAnexos` | `{ codigo: string; nome: string }[]?` | — | Tipos que o campo de tipo do anexo aceita; "Não informado" (`nao.informado`) é sempre acrescentado. O campo está oculto por enquanto. Veja a seção 5.1. |
| `onUploadAnexo`, `onDeleteAnexo`, `onObterAnexoBlob`, `onVisualizarAnexo` | funções? | — | Callbacks com os quais o host armazena e entrega os arquivos anexados. Veja a seção 5.1. |
| `tamanhoMaximoImagem` | `number` | `2048` | Tamanho máximo de uma imagem inserida, em KB (2 MB). |

O vocabulário da casa é (re)montado quando `lexmlEtaConfig` é atribuída com outra casa, portanto atribua a configuração **antes** de `novaProposicao`/`abrirDocumentoArticulado`. O vocabulário é estático (uma instância do componente por página). A casa restringe as siglas de proposição nova e as listas de tipos; URNs de normas citadas ou alteradas resolvem em qualquer autoridade (inclusive da outra casa), mas o documento em edição precisa ser da casa do editor (seção 4.1).

O usuário, a paginação e os padrões ficam na configuração da sessão e **sobrevivem** à troca de documento. O modo de anexo de parecer, ao contrário, é do **documento** (seção 9).

### Serviços esperados

**Parlamentares** — `GET {urlConsultaParlamentares}` devolve um array JSON:

```json
[{ "id": 6335, "nome": "Fulano de Tal", "sexo": "M", "siglaPartido": "XX", "siglaUF": "DF", "siglaCasa": "SF" }]
```

A lista é filtrada pela casa legislativa corrente (`CN` aceita ambas). Erros de rede ou de parse são tratados em silêncio (lista vazia).

**Comissões** — `GET {urlComissoes}?siglaCasaLegislativa=SF` devolve:

```json
[{ "siglaCasaLegislativa": "SF", "sigla": "CCJ", "nome": "Comissão de Constituição, Justiça e Cidadania" }]
```

**Autocomplete de normas** — `GET {urlAutocomplete}?query=<texto>`, resposta no formato consumido por `autocomplete-norma` (`src/components/autocomplete/autocomplete-norma.ts`).

### 5.1 Anexos da proposição

A aba "Anexos", antes de "Avisos" (também no modo `anexoParecer`), permite importar, visualizar, baixar, reordenar, renomear e excluir anexos em PDF ou DOCX. O editor **não guarda o conteúdo dos arquivos**: o host os armazena e o editor só registra os metadados (`idArquivo`, `nomeArquivo`, `nomeDocumento`, `tipo`, `mimeType`), na ordem de exibição. Os metadados vão no documento articulado (`getDocumentoArticulado()`) e são lidos por `abrirDocumentoArticulado()`; o host **não informa a lista de anexos**.

| Callback | Assinatura | Quando é chamado |
|---|---|---|
| `onUploadAnexo` | `(file: File) => string \| Promise<string>` | Ao importar. O host guarda o arquivo e devolve o `idArquivo`; texto vazio ou erro cancela a importação. |
| `onDeleteAnexo` | `(anexo: Anexo) => void \| Promise<void>` | Ao excluir. O anexo só sai da lista se o callback concluir sem erro. |
| `onObterAnexoBlob` | `(anexo: Anexo) => { blob: Blob; contentType: string \| null } \| Promise<...>` | Ao baixar, e ao visualizar quando não há `onVisualizarAnexo`. |
| `onVisualizarAnexo` | `(anexo: Anexo) => void \| Promise<void>` | Ao visualizar um PDF. Se ausente, o editor abre o conteúdo de `onObterAnexoBlob` em outra aba. |

Sem o callback correspondente, a operação mostra um aviso de erro e a lista não muda.

`onDeleteAnexo` é um **aviso de exclusão**, não uma ordem de apagar: ele é chamado na hora, antes de o documento ser salvo, e cabe ao host decidir se e quando remove o conteúdo. O documento salvo antes da exclusão ainda referencia o anexo, então o host pode, por exemplo, adiar a remoção física até o salvamento.

`tiposAnexos` define os códigos que o campo de tipo aceita (entradas sem código ou nome, ou com código repetido, são ignoradas). **O campo de tipo está oculto por enquanto**: todo anexo adicionado recebe o tipo fixo `nao.informado`. Um anexo cujo tipo não está na lista (host + `nao.informado`) é exibido e gravado como `nao.informado`, então mantenha a lista estável entre as edições. `tamanhoMaximoAnexo` só vale quando tem valor; um arquivo maior é recusado antes do upload, com um aviso que informa o limite.

```ts
editor.lexmlEtaConfig = Object.assign(new LexmlEtaConfig(), {
  tiposAnexos: [{ codigo: 'substitutivo', nome: 'Substitutivo' }],
  tamanhoMaximoAnexo: 10240, // opcional: 10 MB
  onUploadAnexo: async file => (await meuBackend.enviar(file)).id,
  onDeleteAnexo: async anexo => meuBackend.marcarParaRemocao(anexo.idArquivo),
  onObterAnexoBlob: async anexo => ({ blob: await meuBackend.baixar(anexo.idArquivo), contentType: null }),
});
```

## 6. Eventos

Todos são `CustomEvent` com `bubbles: true` e `composed: true`, emitidos no próprio `<lexml-eta>`.

| Evento | `detail` | Quando |
|---|---|---|
| `onrevisao` | `{ emRevisao: boolean }` | O usuário ativa ou desativa o modo de marcas de revisão. |
| `fatalError` | `{ err: any }` | `novaProposicao` ou `abrirDocumentoArticulado` rejeitou a entrada ou falhou. |
| `onchange` | `{ origemEvento: 'anexo' }` | O usuário importa, exclui, reordena ou altera o nome de um anexo. Alterar a lista ao abrir um arquivo não emite o evento. Outros formulários emitem `onchange` com outra `origemEvento`. |

## 7. Utilitários de arquivo

Exportados por `@lexml/lexml-eta` para o fluxo "salvar/abrir arquivo" (usados pela demo):

| Função | Descrição |
|---|---|
| `salvarArquivoDocumentoArticulado(documento)` | Baixa o documento como `.json` pelo navegador. |
| `abrirArquivoDocumentoArticulado()` | Abre o seletor de arquivos e devolve o `DocumentoArticulado` lido (ou `undefined` se cancelado). |
| `lerArquivoDocumentoArticulado(blob)` | Lê e valida um `Blob`/`File`. |
| `lerDocumentoArticulado(entrada)` | Valida um objeto ou texto JSON. |
| `serializarDocumentoArticulado(documento)` | Serializa para texto JSON. |
| `nomeArquivoDocumentoArticulado(documento)` | Nome sugerido para o arquivo. |

Fluxo típico:

```ts
// Salvar
await salvarArquivoDocumentoArticulado(editor.getDocumentoArticulado());

// Abrir
const doc = await abrirArquivoDocumentoArticulado();
if (doc) await editor.abrirDocumentoArticulado(doc);
```

## 8. Modelos principais

```ts
class Proposicao {
  dataUltimaModificacao: string;      // data do campo "Data" (AAAA-MM-DD); vazio = "Não informar"; o padrão da classe é o momento da criação, mas um documento novo nasce sem data
  urn; sigla; numero; ano; ementa: string;
  epigrafe: { texto: string; complemento: string };
  projetoNorma?: ProjetoNorma;
  justificativa: string;
  notasRodape: NotaRodape[];
  autoria: Autoria;
  opcoesImpressao: OpcoesImpressao;
  colegiadoApreciador: ColegiadoApreciador;
  revisoes: Revisao[];
  anexos: Anexo[];
  pendenciasPreenchimento: string[];
  substitutivo: boolean;
  local: string;
  // ... demais metadados (aplicacao, versaoAplicacao, metadados)
}

interface Anexo {
  idArquivo: string;     // devolvido pelo host no upload; único elo para recuperar o conteúdo
  nomeArquivo: string;   // nome do arquivo original, com extensão
  nomeDocumento: string; // nome exibido; por padrão, o nome do arquivo sem extensão
  tipo: string;          // código do tipo (`nao.informado` em todo anexo adicionado, por enquanto)
  mimeType: MimeType;    // 'application/pdf' ou o tipo MIME do DOCX
}

class ColegiadoApreciador {
  siglaCasaLegislativa?: 'CN' | 'SF' | 'CD'; // padrão 'CN'
  tipoColegiado: 'Plenário' | 'Comissão'; // padrão 'Plenário'; outro valor assume o padrão
  siglaComissao?: string;
}

class Autoria {
  tipo: 'Parlamentar' | 'Comissão' | 'Casa Legislativa' | 'Não identificado';
  imprimirPartidoUF: boolean;                      // padrão true
  parlamentares: Parlamentar[];
  colegiado?: { identificacao: string; nome: string; sigla: string };
}

class Parlamentar {
  identificacao: string; nome: string; sexo: 'M' | 'F';
  siglaPartido: string; siglaUF: string;
  siglaCasaLegislativa: 'SF' | 'CD'; cargo: string;
}

class OpcoesImpressao {
  imprimirBrasao = true; textoCabecalho = '';
  reduzirEspacoEntreLinhas = false; tamanhoFonte = 14;
}
```

Fonte: `src/model/proposicao/proposicao.ts`.

## 9. Receitas

### Salvar e retomar depois

```ts
// Salvar: o arquivo LexML é autocontido (texto, revisões, anexos, destino, autoria...).
const documento = editor.getDocumentoArticulado();
await fetch('/minhas-edicoes', { method: 'POST', body: JSON.stringify(documento) });

// Retomar
await editor.abrirDocumentoArticulado(await (await fetch('/minhas-edicoes/1')).text());
```

`getProposicao()` serve para consultar o estado (por exemplo, `pendenciasPreenchimento`); o editor é reiniciado a partir do arquivo, não de uma `Proposicao`.

### Modo anexo de parecer

O modo é do documento: defina-o na criação ou deixe que o arquivo aberto o traga (`lexedit:Metadado@anexoParecer`).

```ts
await editor.novaProposicao({ urn, epigrafe, preambulo, anexoParecer: true });
```

Nesse modo só as abas de justificação e de notas de rodapé ficam ocultas. O campo "Data" e a autoria continuam disponíveis, e `getDocumentoArticulado()` grava local, data e assinaturas como no modo normal. Arquivo sem o atributo abre no modo normal.

### Texto grande com paginação

A paginação é sempre aplicada, mesmo sem `configuracaoPaginacao`. Regras (`src/redux/elemento/util/paginacaoUtil.ts`):

- **Padrão:** blocos de até **1250 dispositivos** (`maxItensPorPagina`). Um texto menor que isso fica em página única.
- **`maxItensPorPagina`:** substitui o 1250. A página nunca corta um artigo ao meio: o limite é ajustado para terminar no último dispositivo do artigo, então uma página pode passar um pouco do valor informado.
- **`rangeArtigos`:** define as páginas manualmente, por número de artigo. Tem **precedência** sobre `maxItensPorPagina`, que é ignorado se ambos forem informados.
- Cada faixa deve referenciar artigos que existam no texto (`numInicial` e `numFinal` viram os ids `art<N>`). Uma faixa com artigo inexistente causa erro na abertura.
- Os dispositivos entre dois artigos (como agrupadores) vão para a página do artigo seguinte. A primeira página também recebe a ementa e os agrupadores pai do primeiro artigo.
- Texto sem artigos ou emenda "onde couber" resulta em uma única página vazia, "Página única".

```ts
config.configuracaoPaginacao = { maxItensPorPagina: 200 };
// ou por faixas de artigos:
config.configuracaoPaginacao = { rangeArtigos: [{ numInicial: 1, numFinal: 100 }, { numInicial: 101, numFinal: 250 }] };
```

### Detecção de remissões

Remissões internas e externas são detectadas quando o usuário **sai** do dispositivo ou do editor. Chamar `getProposicao()` ou `getDocumentoArticulado()` aplica a detecção pendente antes de serializar, então o Salvar sempre devolve os links atualizados.

## 10. Armadilhas conhecidas

- Chamar `getDocumentoArticulado()` sem documento iniciado (ou depois de `fecharDocumento()`) lança erro.
- Chamar `novaProposicao()`/`abrirDocumentoArticulado()` antes de o elemento estar no DOM e renderizado falha (os filhos internos ainda não existem). Aguarde `await editor.updateComplete` se acabou de criá-lo.
- `autoriaPadrao` e `opcoesImpressaoPadrao` só valem em `novaProposicao`; ao abrir um arquivo valem os valores gravados nele.
- Um parlamentar vindo de um arquivo aberto e que não esteja mais na lista do host pode ser removido da autoria se o usuário entrar e sair do campo do nome.
- O estado do store Redux é global ao pacote: reutilize a mesma instância ao trocar de documento, chamando `novaProposicao`/`abrirDocumentoArticulado` novamente, em vez de criar outra.

## 11. Referências

- Demo completa: `demo/components/demoview.ts`.
- Formato LexML: `docs/estrutura-lexml.md`.
- Metadados do LexEdit: `docs/extensao-formato-lexml/`.
- Código-fonte do componente: `src/components/lexml-eta.component.ts`.
