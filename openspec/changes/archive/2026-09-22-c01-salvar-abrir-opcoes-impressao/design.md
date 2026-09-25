## Context

Ver proposal.md (Why). Fatos do estado atual que moldam a abordagem:

- **`MetadadoProprietario` já existe no contrato**, criado pela change `2026-09-16-c01-persistir-remissao-interna-invalida`. O formato é um JSON próprio, sem `TYPE_NAME` no conteúdo: `metadadoProprietario: [{ TYPE_NAME, fonte, lexedit: { remissoesInternasInvalidas, pendencias } }]`. `montaMetadadoProprietario(idsRemissoesInvalidas)` (`buildJsonixFromProjetoNorma.ts`) foi escrito para um único grupo, e `lerIdsRemissoesInvalidas` (`buildProjetoNormaFromJsonix.ts`) lê só esse grupo.
- **O CLI `jsonix-lexml` atual não transporta o conteúdo de `lexedit`.** O mapping interno declara `MetadadoProprietario.any` como `anyElement` com `allowTypedObject: false`, ou seja, só aceita nó DOM. Verificado em 22/09/2026 com `jsonix-lexml-win.exe` (`lexeditweb-editor`):
  - `toxml` do nosso JSON gera `<MetadadoProprietario fonte="..."/>` vazio, sem erro, e o XML valida contra `schemas/lexml-simples.xsd`;
  - `tojson` desse XML devolve `metadadoProprietario: [{ TYPE_NAME, fonte }]`, sem `lexedit`;
  - `tojson` de um XML com conteúdo real em `MetadadoProprietario` (a fixture 02 embutida) quebra com `TypeError: Converting circular structure to JSON` e ainda sai com código 0.

  O executável será alterado para atender o formato do LexEdit, e o contrato `lexedit` será migrado depois. Esta change não se antecipa a isso.
- **As opções de impressão ficam no componente raiz.** `lexml-eta.component.ts` guarda o formulário em `_lexmlOpcoesImpressao`. O documento para salvar é montado em `lexml-eta-proposicao.component.ts#getDocumentoArticulado()`, que não tem acesso a esse formulário.
- **Ao abrir, o padrão do host se perde.** `abrirDocumentoArticulado` cria `LexmlEtaParametrosEdicao` vazio. Com isso, `resetaProposicao` → `montarOpcoesImpressaoPadrao(params)` sempre cai nos valores da classe `OpcoesImpressao`, e o `opcoesImpressaoPadrao` informado pelo host na inicialização original não é reaproveitado.
- **Import legado.** `OpcoesImpressaoComponent` e `lexml-eta.component.ts` importam `OpcoesImpressao` de `model/emenda/emenda.ts`. A classe de `model/proposicao/proposicao.ts` é idêntica.

## Goals / Non-Goals

**Goals:**
- Fixar um padrão de salvar e abrir por grupo de metadados do LexEdit que os próximos tíquetes (fecho, autoria, anexos...) reaproveitem sem reestruturar o código.
- Serializar e recuperar as opções de impressão conforme as specs desta change.

**Non-Goals:**
- Mudar o formato do contrato `lexedit` (ex.: para a forma tipada que um jsonix com mapping de `lexedit.xsd` produziria). Fica para depois do novo executável, junto com a migração das remissões internas inválidas.
- Ajustar o CLI `jsonix-lexml` (repositório irmão).
- Preservar o `opcoesImpressaoPadrao` do host ao abrir um arquivo (ver Decisão 3).
- Validar o fragmento `lexedit` gerado contra `schemas/lexedit.xsd`. Exigiria um serializador JSON→XML próprio, e o formato ainda vai mudar.

## Decisions

### 1. Composição por grupo: `DadosLexEdit` + montador/leitor por grupo

```
                      DadosLexEdit  (1 campo opcional por grupo)
                      { opcoesImpressao?: OpcoesImpressao   <- model/proposicao
                        /* futuro: fecho?, autoria?, anexos? */ }

SALVAR                                        ABRIR
lexml-eta.component (raiz)                    lexml-eta.component.abrirDocumentoArticulado
  coleta DadosLexEdit dos formulários           lerDocumentoArticulado(entrada)
      v                                          v
lexml-eta-proposicao.getDocumentoArticulado    lerMetadadoLexEdit(doc): DadosLexEdit
      v                                          +-- lerOpcoesImpressao(lexedit)
criarDocumentoArticulado(..., dados?)            |   (futuro: lerFecho, lerAutoria...)
      v                                          v
buildJsonixFromProjetoNorma(..., dados?)       aplica cada grupo no componente dono
      v                                          (após inicializarEdicao)
montaMetadadoLexEdit(dados, idsInvalidas)
  +-- montaOpcoesImpressao
  +-- remissoesInternasInvalidas + pendencias
  -> undefined se vazio => sem MetadadoProprietario
```

- `DadosLexEdit` fica em `documentoArticulado.ts`, ao lado de `MetadadoLexEdit`. `MetadadoLexEdit` ganha `opcoesImpressao?` com os quatro atributos opcionais: é o formato do arquivo, e a ausência de atributos é legítima nele.
- Cada grupo tem um montador puro (dados do editor → fragmento `lexedit`) e um leitor puro e tolerante (fragmento → dados do editor, ou `undefined` se o grupo não existir). Os dois ficam nos conversores já existentes (`buildJsonixFromProjetoNorma.ts`/`buildProjetoNormaFromJsonix.ts`), ao lado dos equivalentes de remissões.
- `montaMetadadoProprietario` passa a receber o `lexedit` já composto e só o embrulha. A composição, que decide também se o elemento é emitido, fica num único ponto. O formato das remissões inválidas não muda.
- As remissões internas inválidas continuam vindo do registro de remissões. São derivadas da articulação, não de formulário, e por isso não entram em `DadosLexEdit`. `lerIdsRemissoesInvalidas` permanece como está.
- `criarDocumentoArticulado`/`buildJsonixFromProjetoNorma` ganham `dados?: DadosLexEdit` como último parâmetro opcional. Os chamadores atuais, e os testes que esperam documento sem `MetadadoProprietario`, continuam valendo.
- **Alternativas consideradas:** (a) um parâmetro `opcoesImpressao` solto. Descartada porque cada grupo futuro acrescentaria outro parâmetro posicional. (b) Levar as opções de impressão ao Redux. Descartada porque o formulário não participa de undo/redo nem é lido por reducers, e o estado vive no componente, como autoria e justificação.

### 2. Salvar sempre os quatro atributos

O montador grava os quatro atributos com o valor atual do formulário, mesmo quando igual ao padrão. O padrão não é universal: vem da classe ou do `opcoesImpressaoPadrao` de cada host. Omitir um valor "igual ao padrão" permitiria que outro host reabrisse o documento com outra opção. A regra "ausência = padrão" da especificação 02 vale só na leitura, para arquivos de outra origem ou editados à mão.

O montador copia os valores (novo objeto), sem guardar referência ao objeto do formulário, para manter a exigência de independência de documentos de `salvar-documento-articulado`.

### 3. Padrão por atributo ao abrir: o da classe `OpcoesImpressao`

`lerOpcoesImpressao` parte de `new OpcoesImpressao()` e sobrepõe cada atributo presente e com o tipo esperado: `boolean` para os dois campos lógicos, `string` para `textoCabecalho`, inteiro positivo para `tamanhoFonte`. É determinístico: o mesmo arquivo abre igual em qualquer host.

- **Alternativa considerada:** usar o `opcoesImpressaoPadrao` do host como base. Descartada por misturar configuração do host com conteúdo do documento, e porque exigiria guardar esse parâmetro, hoje perdido ao abrir. Continua perdido, como comportamento conhecido fora do escopo.
- `tamanhoFonte` fora de 14/16/18 é aceito como lido (o XSD permite qualquer `positiveInteger`). O `sl-select` do formulário não terá item selecionado nesse caso, mas o valor é preservado ao salvar de novo.

### 4. Aplicação ao abrir, depois de `inicializarEdicao`

`abrirDocumentoArticulado` lê `lerMetadadoLexEdit(documento)` antes de `inicializarEdicao` e, depois dela, atribui `opcoesImpressao` ao formulário, se o grupo existir. Se não existir, prevalece o que `resetaProposicao` já aplica. Isso evita misturar os dados do arquivo com `opcoesImpressaoPadrao`/`params` e não altera o caminho de inicialização por parâmetros do host. A ordem importa: `resetaProposicao` sobrescreve o formulário, então a aplicação precisa vir depois dela.

### 5. Troca do import legado

`OpcoesImpressaoComponent` e `lexml-eta.component.ts` passam a importar `OpcoesImpressao` de `model/proposicao/proposicao.ts`, o modelo usado pela `Proposicao` que o componente monta em `getProposicao()`. A classe de `model/emenda/emenda.ts` permanece para o modelo de emenda. Como as duas são estruturalmente idênticas, não há mudança de comportamento.

### 6. Integração com o CLI real

Os três cenários de ida e volta de `documentoArticulado.integration.ts` (`validar-documento-lexml` → `deep.equal`) comparam os documentos sem `metadadoProprietario[].lexedit` dos dois lados, e continuam garantindo a ida e volta de todo o conteúdo LexML. Um cenário dedicado às opções de impressão verifica `toxml` + XSD válido + presença de `<MetadadoProprietario fonte="...">`, com comentário apontando a limitação do CLI (mesmo padrão da Decisão 5 da change de remissões inválidas). A ida e volta das opções de impressão fica coberta pelos testes unitários de montar/ler.

## Risks / Trade-offs

- **[Risco] A ida e volta pelo CLI real perde as opções de impressão sem erro.** Mitigação: a limitação fica isolada e comentada num único ponto da suíte de integração, para ser endurecida quando o novo executável chegar. Para o usuário não há impacto: o editor lê o próprio JSON, sem passar pelo CLI.
- **[Trade-off] Todo documento salvo passa a ter `MetadadoProprietario`.** Aumenta o arquivo e aumenta o contato com a limitação do CLI, mas elimina a ambiguidade descrita na Decisão 2.
- **[Risco] O contrato `lexedit` vai mudar.** Mitigação: montador e leitor por grupo isolam o formato do resto do fluxo (coleta no componente, aplicação ao abrir). A migração vai mexer só nessas funções puras e no ponto de composição.
- **[Trade-off] `tamanhoFonte` fora da lista da UI** fica sem item selecionado no `sl-select`. Aceito: o caso só ocorre com arquivo de outra origem, e o valor é preservado.
- **[Risco, encontrado na implementação] Eco do `sl-select` sobrescrevia o `tamanhoFonte` lido.** O Shoelace `2.0.0-beta.73` emite `sl-change` também quando `value` muda por código, e de forma assíncrona (`handleValueChange` → `await this.updateComplete` → `emit`). O listener `_atualizarTamanhoFonte` de `OpcoesImpressaoComponent` gravava esse valor no objeto que estivesse atribuído no momento. Como a abertura atribui o formulário duas vezes seguidas (o padrão em `resetaProposicao` e depois o valor do arquivo), o eco atrasado de uma atribuição sobrescrevia a outra. O primeiro sintoma apareceu no teste de componente (abrir um arquivo sem o grupo depois de outro com fonte 18 mantinha 18). O E2E confirmou que, na UI real, o bug quebrava já a primeira abertura: a fonte 18 do arquivo aparecia como 14. Brasão, cabeçalho e espaço entre linhas não eram afetados, porque usam `<input>` nativo e `sl-input` com `@input`, que só disparam com ação do usuário. → Mitigação (task 3.4): o componente guarda em `updated()` o último `tamanhoFonte` que exibiu (`tamanhoFonteExibido`) e ignora `sl-change` com esse valor; um valor diferente só pode vir do usuário. Um teste de componente garante que a escolha do usuário continua sendo gravada. Formulários de grupos futuros que usem `sl-select` precisam do mesmo cuidado.
