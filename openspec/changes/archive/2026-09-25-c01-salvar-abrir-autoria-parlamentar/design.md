## Context

Ver proposal.md (Why). Segue o padrão por grupo de metadados do LexEdit (`CLAUDE.md`, item 13): campo em `DadosLexEdit`, montador composto em `montaMetadadoLexEdit`, leitor tolerante composto em `lerMetadadoLexEdit`, coleta em `getDocumentoArticulado` e aplicação em `abrirDocumentoArticulado` depois de `inicializarEdicao`. Fatos do estado atual que moldam a abordagem:

- **Modelo:** `Autoria` e `Parlamentar` (`model/proposicao/proposicao.ts`) já têm todos os atributos de `lexedit:Parlamentar`. `Autoria` também tem `quantidadeAssinaturasAdicionaisSenadores/Deputados` e `colegiado`, que ficam fora do escopo.
- **Componente de autoria:** `AutoriaComponent.getAutoriaAtualizada()` devolve a autoria descartando as linhas sem `identificacao`. O setter `autoria` copia o objeto recebido e, sem parlamentares, cria uma linha vazia. Os objetos `Parlamentar` vêm da lista do host (`parlamentares`) por espalhamento (`{ ...parlamentarAutocomplete, cargo }`) e podem trazer campos além dos sete do modelo.
- **Autoria padrão:** `resetaProposicao`, chamado por `inicializarEdicao`, aplica `montarAutoriaPadrao(params)`, que usa o parlamentar do host indicado em `autoriaPadrao`, quando há.
- **Formato jsonix verificado com o CLI real** (`C:\Users\ruan.oliveira\DEV\git\lexeditweb\lexeditweb-editor\jsonix-lexml-win.exe`, 2.0.0) em 25/09/2026. `documento-articulado-exemplo.json` passa por `toxml`, é válido perante `schemas/lexedit.xsd` e, depois do `tojson`, volta com `lexedit.autoria` e `parteFinal` **iguais** ao original. As formas são:
  - `lexedit.autoria = { TYPE_NAME: 'br_gov_lexml_lexedit__1.Autoria', tipo, imprimirPartidoUF, parlamentares: { TYPE_NAME: '...Parlamentares', parlamentar: [{ TYPE_NAME: '...Parlamentar', identificacao, nome, sexo, siglaPartido, siglaUF, siglaCasaLegislativa, cargo }] } }`;
  - `parteFinal.assinaturaTexto = [{ TYPE_NAME: 'br_gov_lexml__1.ParsType', p: [GenInline...] }]`, com o negrito como `{ name: { namespaceURI: LexML, localPart: 'b', prefix: '', key, string }, value: { TYPE_NAME: 'br_gov_lexml__1.GenInline', content: [texto] } }`.
- **Restrições do XSD:** em `lexedit:Autoria`, `tipo` é obrigatório e o `choice` entre `Parlamentares` e `ColegiadoAutor` também; `Parlamentares` exige ao menos um `Parlamentar`; `sexo` ∈ {M, F} e `siglaCasaLegislativa` ∈ {SF, CD, CN}. Em `ParteFinal`, a ordem é `LocalDataFecho?` seguido de `AssinaturaTexto*`.
- **`montaParteFinal`** hoje só existe quando há `local`.

## Goals / Non-Goals

**Goals:**
- Salvar e abrir a autoria de parlamentares, estruturada e em texto, sem perda na ida e volta, inclusive pelo CLI real.

**Non-Goals:**
- Autoria por comissão (`ColegiadoAutor`), tanto ao salvar quanto ao abrir.
- Quantidade de assinaturas adicionais: não consta da especificação nem do `lexedit.xsd`, e estendê-los exigiria uma nova versão do `jsonix-lexml`. Volta a 0 ao abrir o arquivo.
- Ler `AssinaturaTexto` ao abrir.
- Atualizar `ParteFinal`/`MetadadoProprietario` no caminho legado `getProjetoAtualizado()`, como já decidido na change do fecho.
- Mudar o comportamento de revalidação do componente de autoria ao sair do campo de nome (ver Riscos).

## Decisions

### 1. `autoria` como campo de `DadosLexEdit`, filtrado na coleta

`DadosLexEdit` ganha `autoria?: Autoria`; `MetadadoLexEdit` ganha `autoria?` no formato do conversor. O componente raiz repassa `this._lexmlAutoria.getAutoriaAtualizada()`, que já descarta as linhas em branco, e não repassa nada no modo anexo de parecer, como em `removerDadosNaoAplicaveisAoAnexoParecer`.

### 2. Montador `montaAutoria` com atributos explícitos

- Devolve `undefined` quando não há parlamentar com `identificacao`. O XSD não admite `Parlamentares` vazio, e a regra também protege quem chame `criarDocumentoArticulado` sem passar pelo filtro do componente.
- Grava `tipo: 'Parlamentar'` fixo. Com o escopo desta change, o editor só produz autoria de parlamentares, independentemente do valor de `Autoria.tipo`.
- Copia **só os sete atributos** de cada parlamentar, com `cargo ?? ''`. Campos extras vindos do host não vão para o arquivo, o que mantém o JSON igual ao que o `tojson` devolve e evita atributos desconhecidos pelo conversor.
- **Alternativa considerada:** espalhar o objeto `Parlamentar`. Descartada pelo motivo acima.

### 3. `AssinaturaTexto` montado a partir da autoria já montada

`montaParteFinal(dados)` passa a combinar `localDataFecho` (se houver `local`) e `assinaturaTexto` (se houver autoria montada), e devolve `undefined` quando não houver nenhum dos dois. Cada parlamentar gera um `ParsType` com:
1. `p` contendo o elemento `b` com `"<tratamento> <nome>"`;
2. `p` com `"(<siglaPartido> - <siglaUF>)"`, só se `imprimirPartidoUF`;
3. `p` com o cargo, só se `cargo.trim()` não for vazio.

O tratamento vem de uma função pura (`tratamentoParlamentar(sexo, siglaCasaLegislativa)`): `SF` → Senador/Senadora; `CD` → Deputado/Deputada (decisão do usuário). O modelo `Parlamentar` só admite `SF`/`CD`; para qualquer outro valor, usa-se o tratamento de `CD`, e isso fica coberto por teste.

O texto é montado a partir do mesmo objeto usado no `lexedit`, para que as duas representações nunca divirjam.

### 4. Leitor `lerAutoria` tolerante

Composto em `lerMetadadoLexEdit` e seguindo o padrão de `lerOpcoesImpressao`:
- devolve `undefined` se `autoria` não for objeto, se `tipo !== 'Parlamentar'` ou se não sobrar nenhum parlamentar válido;
- aceita `parlamentares.parlamentar` como array ou objeto único, pois o Jsonix pode desembrulhar uma lista de um só elemento;
- um parlamentar é válido com `identificacao` e `nome` em texto não vazio; nos demais atributos, valor ausente ou inválido assume o padrão de `new Parlamentar()` (`sexo` ∈ {M, F}, `siglaCasaLegislativa` ∈ {SF, CD}, os textos como texto);
- `imprimirPartidoUF` só é aceito como booleano; caso contrário, vale o padrão de `new Autoria()`;
- a autoria devolvida é um `new Autoria()` com `parlamentares` e `imprimirPartidoUF` preenchidos, então as assinaturas adicionais ficam em 0.

### 5. Aplicação ao abrir

Em `abrirDocumentoArticulado`, depois de `inicializarEdicao`: `if (dados.autoria) this._lexmlAutoria.autoria = dados.autoria`. Sem autoria válida, fica a autoria padrão aplicada por `resetaProposicao`. Os dados do arquivo não passam pela lista do host. No modo anexo de parecer, a aba de autoria fica oculta e a autoria não é salva, então não é preciso tratamento extra.

### 6. Integração com o CLI real

A change de migração para o 2.0.0 permite comparar o `lexedit` por igualdade na ida e volta. O cenário novo cria o documento com fecho e parlamentares (SF/CD, M/F, com e sem cargo, `imprimirPartidoUF` verdadeiro e falso) e exige `toxml` → XSD `lexedit.xsd` → `tojson` com `lexedit.autoria` e `parteFinal` iguais. A suíte roda com `JSONIX_LEXML_CLI` apontando para `C:\Users\ruan.oliveira\DEV\git\lexeditweb\lexeditweb-editor\jsonix-lexml-win.exe`.

## Risks / Trade-offs

- **[Risco, pré-existente] Revalidação ao sair do campo de nome.** O `AutoriaComponent`, no blur do autocomplete, busca o nome de novo na lista do host e substitui os dados do parlamentar pelos da lista. Se não encontrar, a linha é apagada. Um arquivo com um parlamentar que não está mais na lista do host (fim de mandato, lista de outra casa) abre certo, mas perde o parlamentar se o usuário entrar e sair do campo de nome dele. → Fora do escopo e registrado. Não muda o que é aberto nem o que é salvo sem interação.
- **[Trade-off] Assinaturas adicionais são perdidas na ida e volta.** → Decisão do usuário: fica documentado e depende de uma futura extensão da especificação e do `jsonix-lexml`.
- **[Trade-off] `tipo` gravado sempre como `Parlamentar`.** Uma autoria de tipo `Comissão` na memória seria gravada como autoria de parlamentares. Hoje isso não acontece, porque o seletor de tipo está oculto (`_exibirTemplateTipoAutoria = false`). → A issue de comissão revisita o montador.
- **[Risco] Parlamentar do host com `siglaCasaLegislativa` fora de SF/CD** geraria XML inválido perante o XSD (`CN` é aceito) ou um tratamento inadequado. → O tipo do modelo já restringe a SF/CD, e o tratamento tem padrão definido (Decisão 3).
