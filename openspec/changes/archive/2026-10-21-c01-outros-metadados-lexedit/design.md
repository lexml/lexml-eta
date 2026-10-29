## Context

O `lexedit:Metadado` ganha um grupo por tipo de dado de formulário (CLAUDE.md, item 13). Os hosts (ex.: `lexeditweb-editor`) precisam registrar dados próprios sem esperar uma nova versão do esquema. O formato é lido por três consumidores: o editor (TypeScript), o conversor `jsonix-lexml` (gerado a partir de `schemas/lexedit.xsd`) e o `eta-backend-services` (que lê o JSON do Jsonix por Jackson e não precisa mudar).

## Goals / Non-Goals

**Goals:**
- Registrar pares chave/valor arbitrários no documento salvo e recuperá-los ao abrir, sem perda.
- Manter o mesmo padrão dos grupos existentes (campo em `DadosLexEdit`, montador e leitor puros e tolerantes).

**Non-Goals:**
- Usar os dados na impressão do PDF ou alterar o `eta-backend-services`.
- Tipar ou validar o valor: ele é sempre texto.
- Limitar tamanho ou conjunto de caracteres de chave e valor.

## Decisions

### D1 — Pares chave/valor em texto, um elemento por par
`OutrosMetadados` contém `OutroMetadado` (`chave` obrigatório, conteúdo `xsd:string`). Alternativas descartadas: um único JSON dentro de `OutrosMetadados` (perde a unicidade pelo esquema e a consulta por chave) e uma árvore XML tipada (esquema recursivo, maior risco no conversor). Valor estruturado é responsabilidade do host: serializa como texto (ex.: JSON na chave `jsonDadosComissao`).

### D2 — Unicidade da chave no esquema
`xsd:unique` com `selector` em `OutroMetadado` e `field` em `@chave`. O leitor, porém, é tolerante: chave repetida mantém a primeira ocorrência, como os demais leitores, para não invalidar o documento inteiro por um grupo auxiliar. O montador parte de um `Record`, que não admite chave repetida.

### D3 — Modelo e API
`DadosLexEdit.outrosMetadados?: Record<string, string>`; `MetadadoLexEdit.outrosMetadados?: { TYPE_NAME; outroMetadado: Array<{ TYPE_NAME; chave; value }> }`, no formato que o `tojson` devolve (o valor do conteúdo de texto vem na propriedade `value`; confirmar no spike da tarefa 1). `LexmlEtaComponent` expõe `@property outrosMetadados` (`Record<string, string>`): ao salvar, `getDocumentoArticulado` a repassa em `DadosLexEdit`; ao abrir, `abrirDocumentoArticulado` a substitui pelo lido, depois de `inicializarEdicao` (que reinicia o estado). Diferente do colegiado, não é omitida no anexo de parecer.

### D4 — Montador e leitor
Montador puro `montaOutrosMetadados`, composto em `montaMetadadoLexEdit` (omitido quando vazio; não adiciona pendência). Leitor puro `lerOutrosMetadados`, composto em `lerMetadadoLexEdit`: aceita lista ou objeto único (o Jsonix entrega lista de um elemento como objeto), descarta entrada sem `chave` textual não vazia ou com valor não textual, e mantém a primeira de chaves repetidas. O formato provisório anterior ao conversor 2.0.0 não tem o grupo, então não é lido.

### D5 — Dependência do `jsonix-lexml`
O conversor é gerado a partir do `lexedit.xsd`; o grupo só sobrevive ao `toxml`/`tojson` com a versão atualizada. A cópia do XSD para o projeto `jsonix-lexml`, o build e a nova versão são externos a este repositório. Os testes unitários e o E2E independem do conversor; a integração real depende dele. Risco: o mapeamento de `simpleContent` com atributo e o `xsd:unique`. Mitigação: spike com o XSD novo logo no início (tarefa 1); se o gerador rejeitar o `xsd:unique`, a unicidade fica só no código (D2) e o requisito do esquema é revisto.

## Risks / Trade-offs

- **Versão do conversor** → sem a nova versão, a integração real falha ou descarta o grupo; sinalizar na tarefa externa e pausar o apply nela.
- **Chaves sem convenção de nomes** → hosts diferentes podem colidir; fora do escopo (sem limites por decisão do produto).
- **Valores grandes** → sem limite imposto; o arquivo cresce na mesma proporção.
- **Eco de formulário** → a propriedade é de dados, sem formulário no editor, portanto sem a corrida do `sl-select` (invariante v).
