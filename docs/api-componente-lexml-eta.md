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
import { LexmlEtaComponent, LexmlEtaParametrosEdicao, LexmlEtaConfig, Usuario, Proposicao } from '@lexml/lexml-eta';
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
import { LexmlEtaComponent, LexmlEtaConfig, LexmlEtaParametrosEdicao, Usuario } from '@lexml/lexml-eta';

const editor = document.querySelector('#editor') as LexmlEtaComponent;

// 1. Configuração (antes de inicializar a edição)
const config = new LexmlEtaConfig();
config.urlConsultaParlamentares = '/parlamentares';
config.urlComissoes = '/comissoes';
editor.lexmlEtaConfig = config;

// 2. Usuário (usado nas marcas de revisão)
editor.setUsuario(new Usuario('Maria da Silva', 123, 'MSILVA'));

// 3. Abrir um texto novo (ou um existente)
const params = new LexmlEtaParametrosEdicao();
params.sigla = 'PL'; // texto novo: número e ano provisórios
await editor.inicializarEdicao(params);

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
| `lexmlEtaConfig` | `LexmlEtaConfig` | `new LexmlEtaConfig()` | URLs de serviços e limites. Veja a seção 5. Renomeada de `lexmlEmendaConfig` — consumidores antigos precisam atualizar o binding, que falha em silêncio. |
| `parlamentares` | `Parlamentar[]` | `[]` | Lista usada na autoria. É **preenchida pelo próprio componente** em `inicializarEdicao`, a partir de `urlConsultaParlamentares`. |
| `comissoes` | `Comissao[]` | `[]` | Lista de comissões da casa legislativa. Também preenchida pelo componente, a partir de `urlComissoes`. |
| `exibirAjuda` | `boolean` | `true` | Exibe o conteúdo de ajuda. |
| `totalAlertas` | `number` | `0` | Quantidade de alertas (somente leitura na prática; atualizada pelo componente). |

## 4. Métodos

### 4.1 `inicializarEdicao(params, preservarTextoDocumento = false): Promise<void>`

Abre um documento para edição. Deve ser chamado depois de definir `lexmlEtaConfig` e antes de qualquer outro método de leitura. Em caso de falha, emite o evento `fatalError`, registra o erro no store e **relança a exceção**.

O segundo argumento é de uso interno (`abrirDocumentoArticulado` passa `true`); chamadores externos normalmente o omitem.

A identificação do documento (a URN) é resolvida nesta ordem:

1. a URN dentro de `params.projetoNorma`;
2. `params.urn`;
3. `params.proposicao.urn`;
4. a URN montada a partir de `params.proposicao.{sigla,numero,ano}`;
5. a URN montada a partir de `params.{sigla,numero,ano}`.

No caso 5, `sigla` é obrigatória. Se `numero`/`ano` faltarem, assumem valores provisórios — **exceto** com `substitutivo = true`, caso em que ambos são obrigatórios (senão lança `Error`).

Casa legislativa: para `MPV`, `PDN` e `PRN` é sempre `CN`; senão vale `proposicao.colegiadoApreciador.siglaCasaLegislativa` ou `params.casaLegislativa`, com `CN` por padrão.

#### `LexmlEtaParametrosEdicao`

| Campo | Tipo | Descrição |
|---|---|---|
| `urn` | `string` | URN LexML da proposição. |
| `sigla`, `numero`, `ano` | `string` | Identificação da proposição, usada quando não há URN. |
| `proposicao` | `Proposicao` | Estado completo de uma edição anterior (veja `getProposicao()`). Restaura justificação, autoria, revisões, destino etc. |
| `projetoNorma` | `ProjetoNorma` | Texto estruturado (JSON LexML/Jsonix) a editar. Opcional: sem ele, abre texto vazio. |
| `substitutivo` | `boolean` | Indica texto substitutivo. Exige `sigla`, `numero` e `ano`. |
| `usuario` | `Usuario` | Usuário das marcas de revisão. Se omitido, mantém o usuário atual do store. |
| `autoriaPadrao` | `{ identificacao: string; siglaCasaLegislativa: 'SF' \| 'CD' }` | Parlamentar pré-selecionado na autoria. Só se aplica quando **não** se passa `proposicao`, e só funciona se o parlamentar existir na lista carregada. |
| `opcoesImpressaoPadrao` | `{ imprimirBrasao: boolean; textoCabecalho: string; tamanhoFonte: number }` | Valores iniciais das opções de impressão (também só sem `proposicao`). |
| `configuracaoPaginacao` | `ConfiguracaoPaginacao` | Paginação dos dispositivos em textos grandes: `{ maxItensPorPagina?: number; rangeArtigos?: { numInicial: number; numFinal: number }[] }`. **Opcional**: sem ela, o texto é paginado automaticamente em blocos de até **1250 dispositivos**. Detalhes na seção 9 ("Texto grande com paginação"). |
| `casaLegislativa` | `'SF' \| 'CD' \| 'CN'` | Casa responsável pela apreciação. |

Exemplos:

```ts
// Texto novo
const p = new LexmlEtaParametrosEdicao();
p.sigla = 'PL';
await editor.inicializarEdicao(p);

// Texto existente (JSON LexML)
const p2 = new LexmlEtaParametrosEdicao();
p2.projetoNorma = jsonDoTexto;
await editor.inicializarEdicao(p2);

// Retomar uma edição salva anteriormente com getProposicao()
const p3 = new LexmlEtaParametrosEdicao();
p3.proposicao = proposicaoSalva;
p3.projetoNorma = proposicaoSalva.projetoNorma;
await editor.inicializarEdicao(p3);
```

### 4.2 `getProposicao(): Proposicao`

Devolve o estado completo da edição, para o host persistir como quiser (por exemplo, no seu backend). Chama internamente `getProjetoAtualizado()`, o que também aplica as edições pendentes (como a detecção de remissões da linha corrente). Sem documento inicializado, devolve uma `Proposicao` vazia.

Campos preenchidos: `projetoNorma`, `justificativa`, `notasRodape`, `autoria`, `opcoesImpressao`, `ementa`, `epigrafe`, `revisoes`, `justificativaAntesRevisao`, `pendenciasPreenchimento`, `colegiadoApreciador`, `anexos`, `substitutivo`, `local`, `urn`, `sigla`, `numero`, `ano` e `dataUltimaModificacao`.

`pendenciasPreenchimento` lista o que impede considerar o texto pronto: justificação vazia (quando obrigatória, ver `justificacaoObrigatoria`) e as mensagens de nível crítico da validação. No modo `anexoParecer`, os campos `justificativa`, `justificativaAntesRevisao`, `notasRodape`, `local` e `autoria` são removidos do objeto.

### 4.3 `getDocumentoArticulado(): DocumentoArticulado`

Exporta o documento no formato de intercâmbio LexML (JSON Jsonix), incluindo os grupos de metadados do LexEdit já implementados: opções de impressão, local e data do fecho, autoria de parlamentares e remissões internas inválidas. Lança `Error('Inicialize um documento antes de salvar.')` se nada foi aberto.

Diferença em relação a `getProposicao()`: aqui o resultado é **um arquivo LexML autocontido**, que o próprio editor sabe reabrir; `getProposicao()` é o modelo interno do editor (inclui revisões, notas de rodapé, justificação etc.), que não passa pelo formato LexML.

### 4.4 `abrirDocumentoArticulado(entrada): Promise<void>`

Abre um documento exportado por `getDocumentoArticulado()`. Aceita o objeto Jsonix ou o seu texto JSON. O documento é **validado antes de alterar o editor**: se for inválido, lança `Error` (por exemplo, URN sem ano e número, articulação ausente, ids repetidos) e o editor segue intacto. Depois da abertura, aplica ao formulário os metadados do arquivo (opções de impressão, data, local, autoria).

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
| `urlConsultaParlamentares` | `string` | `'api/parlamentares'` | Endpoint (GET) que devolve a lista de parlamentares. |
| `urlAutocomplete` | `string` | `'api/autocomplete-norma'` | Endpoint (GET `?query=`) de busca de normas, usado nos diálogos de alteração de norma e de remissão externa. |
| `urlPortalNormas` | `string` | `'https://normas.leg.br'` | Base dos links para abrir uma norma referenciada. |
| `urlComissoes` | `string?` | — | Endpoint (GET `?siglaCasaLegislativa=`) de comissões. Se ausente, a lista de comissões fica vazia. |
| `anexoParecer` | `boolean` | `false` | Modo "anexo de parecer": sem justificação, fecho, data nem autoria; só destino e impressão. |
| `justificacaoObrigatoria` | `boolean` | `true` | Se `true`, justificação vazia gera pendência de preenchimento. Ignorado em `anexoParecer`. |
| `tamanhoMaximoAnexo` | `number` | `5120` | Tamanho máximo de um anexo, em KB (5 MB). |
| `tamanhoMaximoImagem` | `number` | `2048` | Tamanho máximo de uma imagem inserida, em KB (2 MB). |

O valor de `anexoParecer` é lido a cada `inicializarEdicao`. Para trocar de modo, altere a config e chame `inicializarEdicao` de novo.

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

## 6. Eventos

Ambos são `CustomEvent` com `bubbles: true` e `composed: true`, emitidos no próprio `<lexml-eta>`.

| Evento | `detail` | Quando |
|---|---|---|
| `onrevisao` | `{ emRevisao: boolean }` | O usuário ativa ou desativa o modo de marcas de revisão. |
| `fatalError` | `{ err: any }` | `inicializarEdicao` falhou. |

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
  dataUltimaModificacao: string;      // ISO 8601; padrão = momento da criação
  urn; sigla; numero; ano; ementa: string;
  epigrafe: { texto: string; complemento: string };
  projetoNorma?: ProjetoNorma;
  justificativa: string;
  notasRodape: NotaRodape[];
  autoria: Autoria;
  opcoesImpressao: OpcoesImpressao;
  colegiadoApreciador: ColegiadoApreciador;
  revisoes: Revisao[];
  anexos: { nomeArquivo: string; base64: string }[];
  pendenciasPreenchimento: string[];
  substitutivo: boolean;
  local: string;
  // ... demais metadados (aplicacao, versaoAplicacao, metadados)
}

class ColegiadoApreciador {
  siglaCasaLegislativa?: 'CN' | 'SF' | 'CD'; // padrão 'CN'
  tipoColegiado: 'Plenário' | 'Comissão' | 'Plenário via Comissão'; // padrão 'Plenário'
  siglaComissao?: string;
}

class Autoria {
  tipo: 'Parlamentar' | 'Comissão' | 'Casa Legislativa' | 'Não identificado';
  imprimirPartidoUF: boolean;                      // padrão true
  quantidadeAssinaturasAdicionaisSenadores: number;
  quantidadeAssinaturasAdicionaisDeputados: number;
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

### Salvar no backend do host e retomar depois

```ts
// Salvar
const proposicao = editor.getProposicao();
if (proposicao.pendenciasPreenchimento.length) {
  alert(proposicao.pendenciasPreenchimento.join('\n'));
}
await fetch('/minhas-edicoes', { method: 'POST', body: JSON.stringify(proposicao) });

// Retomar
const salva: Proposicao = await (await fetch('/minhas-edicoes/1')).json();
const p = new LexmlEtaParametrosEdicao();
p.proposicao = salva;
p.projetoNorma = salva.projetoNorma;
await editor.inicializarEdicao(p);
```

### Modo anexo de parecer

```ts
editor.lexmlEtaConfig = Object.assign(new LexmlEtaConfig(), { anexoParecer: true });
await editor.inicializarEdicao(params);
```

### Texto grande com paginação

A paginação é sempre aplicada, mesmo sem `configuracaoPaginacao`. Regras (`src/redux/elemento/util/paginacaoUtil.ts`):

- **Padrão:** blocos de até **1250 dispositivos** (`maxItensPorPagina`). Um texto menor que isso fica em página única.
- **`maxItensPorPagina`:** substitui o 1250. A página nunca corta um artigo ao meio: o limite é ajustado para terminar no último dispositivo do artigo, então uma página pode passar um pouco do valor informado.
- **`rangeArtigos`:** define as páginas manualmente, por número de artigo. Tem **precedência** sobre `maxItensPorPagina`, que é ignorado se ambos forem informados.
- Cada faixa deve referenciar artigos que existam no texto (`numInicial` e `numFinal` viram os ids `art<N>`). Uma faixa com artigo inexistente causa erro na abertura.
- Os dispositivos entre dois artigos (como agrupadores) vão para a página do artigo seguinte. A primeira página também recebe a ementa e os agrupadores pai do primeiro artigo.
- Texto sem artigos ou emenda "onde couber" resulta em uma única página vazia, "Página única".

```ts
params.configuracaoPaginacao = { maxItensPorPagina: 200 };
// ou por faixas de artigos:
params.configuracaoPaginacao = { rangeArtigos: [{ numInicial: 1, numFinal: 100 }, { numInicial: 101, numFinal: 250 }] };
```

### Detecção de remissões

Remissões internas e externas são detectadas quando o usuário **sai** do dispositivo ou do editor. Chamar `getProposicao()` ou `getDocumentoArticulado()` aplica a detecção pendente antes de serializar, então o Salvar sempre devolve os links atualizados.

## 10. Armadilhas conhecidas

- Chamar `getDocumentoArticulado()` antes de `inicializarEdicao()` lança erro.
- Chamar `inicializarEdicao()` antes de o elemento estar no DOM e renderizado falha (os filhos internos ainda não existem). Aguarde `await editor.updateComplete` se acabou de criá-lo.
- `autoriaPadrao` e `opcoesImpressaoPadrao` são ignorados quando `proposicao` é informada.
- Um parlamentar vindo de um arquivo aberto e que não esteja mais na lista do host pode ser removido da autoria se o usuário entrar e sair do campo do nome.
- As quantidades de assinaturas adicionais de autoria não fazem parte do formato do arquivo: voltam a 0 ao abrir um documento articulado.
- O estado do store Redux é global ao pacote: reutilize a mesma instância ao trocar de documento, chamando `inicializarEdicao` novamente, em vez de criar outra.

## 11. Referências

- Demo completa: `demo/components/demoview.ts`.
- Formato LexML: `docs/estrutura-lexml.md`.
- Metadados do LexEdit: `docs/extensao-formato-lexml/`.
- Código-fonte do componente: `src/components/lexml-eta.component.ts`.
