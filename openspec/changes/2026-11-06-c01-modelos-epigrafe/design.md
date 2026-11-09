# Design

## Context

- O vocabulário (item 19 do `CLAUDE.md`) tem um módulo de dados por autoridade, mesclados por `mesclar` (`mesclarVocabulario.ts`). A mesclagem carimba `urnAutoridade` nos itens e lança erro de dados em caso de inconsistência. `getVocabularioCompleto()` atende às consultas por URN.
- `urnUtil.ts` já tem o que o serviço precisa: `getTipo`, `getNumero`, `getAno`, `formataNumero`, `isSubstitutivo`, `NUMERO_PROVISORIO` e `ANO_PROVISORIO`.
- A epígrafe percorre quatro pontos, e hoje nenhum trata o `br`:
  1. **Montar a nova proposição:** `montaDocumentoNovaProposicao` grava a epígrafe como string crua em `content: [epigrafe]`, e o `<br/>` sairia como texto escapado no XML.
  2. **Abrir:** `getParteInicial` → `buildContent` → `montaTag`. O `montaTag` descarta elementos desconhecidos, entre eles o `br`. O texto fica em `projetoNorma.epigrafe` e no `texto` da `Articulacao`, que é a linha da epígrafe no Quill.
  3. **Exibir:** `EtaBlotConteudo` atribui o texto a `innerHTML`. O blot `Break` do Quill 1 se remove quando a linha já tem conteúdo (`insertInto`), então um `<br>` cru **some** da tela.
  4. **Salvar:** `montaParteInicial` → `buildStructuredContent(epigrafe, 'texto')` → `parseHTMLTags`. O `br` não é reconhecido e sai como texto.
- `montaTag`, `buildContent` e `parseHTMLTags` são compartilhados com a ementa e os dispositivos.

## Goals / Non-Goals

**Goals:**
- O serviço é puro e determinístico, com testes unitários diretos.
- O `br` tem tratamento confinado à epígrafe, num ponto único de conversão (ida e volta).

**Non-Goals:**
- Placeholders além dos da issue.
- Edição da epígrafe pelo usuário: a linha continua não editável.
- `br` em ementa e dispositivos.

## Decisions

### D1. Dados dos modelos no vocabulário

- `VocabularioAutoridade.modelosEpigrafe?: ModeloEpigrafeItem[]`, com `{ codigo, modelo }`.
- `TipoDocumentoItem` ganha `modeloEpigrafe?` e `modeloEpigrafeSubstitutivo?`.
- `Vocabulario.modelosEpigrafe: ComAutoridade<ModeloEpigrafeItem>[]`, carimbados como `preambulosPadrao`.
- A validação fica em `mesclar`: código duplicado por autoridade e código inexistente na autoridade do tipo. Esses erros de dados já aparecem na montagem da visão completa.
- Alternativa descartada: guardar o texto do modelo direto no tipo. A issue pede uma lista por autoridade com código, que pode ser reaproveitada por vários tipos (os 9 do Senado usam um só modelo).

### D2. Serviço `montaEpigrafe`

- Fica em módulo próprio, `src/model/lexml/documento/epigrafe.ts`, para não inchar `urnUtil.ts`. É reexportado em `src/index.ts`.
- **Passos:**
  1. Resolver o tipo da URN (`getTipo`) e escolher o código: `modeloEpigrafeSubstitutivo`, se `isSubstitutivo(urn)`; senão, `modeloEpigrafe`.
  2. Buscar o modelo em `modelosEpigrafe` pela autoridade do tipo; sem modelo, usar `MODELO_EPIGRAFE_PADRAO`.
  3. Montar o mapa de valores dos placeholders, com cada valor codificado em XML.
  4. Substituir com um único `replace(/\{([\w.]+)\}/g, …)`.
- Placeholder desconhecido é mantido como está. Isso é deliberado: a issue fala de dado inexistente, não de nome desconhecido, e manter o placeholder torna visível um erro de digitação no modelo.
- **Valores:**
  - **Número:** `formataNumero`; `999999` vira 7 espaços.
  - **Ano:** `getAno`; `9999` vira vazio.
  - **Descrição:** descrição do tipo; a forma em maiúsculas usa `toLocaleUpperCase('pt-BR')`.
  - **Preposição:** pelo `genero` do tipo referenciado (`generoFromLetra`): `M` → `ao`, `F` → `à`; sem tipo, vazio.
- A URN de substitutivo do SF tem o evento `@apresentacao.substitutivo`, e `getNumero` já o descarta.
- **Codificação XML:** função local para `&`, `<`, `>`, `"` e `'`. Não reaproveito `encodeHtml`: ela pode ter outro conjunto de caracteres.

### D3. Componente de nova proposição

- `concluir()` passa a chamar `montaEpigrafe(urn, urnDocumentoReferenciado, sufixo)`.
- O sufixo segue a spec já existente: `SF` + Plenário → `- PLEN`; `SF` + Comissão → `- <siglaComissao>`; `CD` → nenhum.
- `epigrafePadrao.ts` é removido.

### D4. `br` só na epígrafe: um conversor dedicado

Crio `conversor/epigrafe.ts` com duas funções puras:

- **`montaConteudoEpigrafe(texto: string): any[]`** — divide o texto em `<br\s*/?>` e intercala elementos `br` Jsonix. Cada trecho de texto passa pelo caminho atual (`buildStructuredContent` para `b`/`i`/links ao salvar). Na nova proposição, cada trecho é decodificado de XML para texto: o Jsonix recebe texto, não XML, e reescaparia `&amp;`. Usado por `montaDocumentoNovaProposicao` e por `montaParteInicial`.
- **`lerConteudoEpigrafe(content): string`** — percorre o `content`, converte o elemento `br` em `<br/>` e delega o resto a `buildContent`. Usado por `getParteInicial` e `buildTextoEpigrafeFromDocument`.

`montaTag` e `parseHTMLTags` **não** são alterados, então ementa e dispositivos ficam intactos.

A forma Jsonix do `br`, confirmada com o `tojson`/`toxml` do CLI real, é `{ name: { namespaceURI: 'http://www.lexml.gov.br/1.0', localPart: 'br', prefix: '' }, value: { TYPE_NAME: 'br_gov_lexml__1.Br' } }`. O texto vizinho vem sem escape (`"LINHA 1 & "`).

**Dependência:** o `jsonix-lexml` 2.1.0 recusa o `br` na `Epigrafe` nas duas direções (`Element [{http://www.lexml.gov.br/1.0}br] … is not known in this context`). Só a partir da **2.4.0** a conversão funciona. Como o CLI sai com código 0 quando falha, um host com versão anterior perde o XML sem erro aparente. O `lexeditweb-editor` precisa do CLI 2.4.0 antes de consumir esta versão.

Para evitar import circular entre os dois conversores, `conversor/epigrafe.ts` oferece só as peças: dividir o texto pelas quebras, criar e reconhecer o elemento `br`, e montar o conteúdo a partir do XML do `montaEpigrafe`. Cada conversor compõe essas peças com o seu próprio `buildContent`/`buildStructuredContent`.

Alternativa descartada: ensinar o `br` a `montaTag`/`parseHTMLTags`. Afetaria todos os textos, e o Quill dos dispositivos editáveis apagaria o `br` (ver Contexto, ponto 3).

### D5. Exibição da quebra no Quill

- Um blot embutido inline próprio, `EtaBlotQuebraLinha` (`Parchment.Embed`, `span.eta-quebra-linha`, com CSS que força a quebra), registrado em `src/util/eta-quill/`.
- `createElemento` converte o `<br>` em `<span class="eta-quebra-linha"></span>` só para a linha da epígrafe, no mesmo ponto em que `textoParaExibicao` já adapta o preâmbulo. O `texto` do dispositivo continua com `<br/>` para salvar.
- **Por que não o `br` cru:** o blot `Break` se remove. **Por que não dividir em duas linhas do Quill:** a epígrafe é um único elemento; duas linhas quebrariam a correspondência um elemento → uma linha, de que dependem o redirecionamento do cursor e a navegação (invariante (au)).
- A primeira task da implementação é um teste de componente que confirma a exibição em duas linhas. Se o embed falhar, a alternativa é um `span` inline com conteúdo e `display: block`, decidida no próprio teste, sem mudar a spec.

## Risks / Trade-offs

- **[Risco]** A linha tem `editavel` falso, mas o embed muda o comprimento da linha no Quill, o que pode afetar cálculos de índice. → O embed tem comprimento 1, a linha não recebe cursor (invariante (au)), e os testes de navegação existentes cobrem as setas pela epígrafe.
- **[Risco]** O CLI `jsonix-lexml` pode rejeitar o `br` vazio na epígrafe. → Haverá um cenário de integração com o CLI real (ida e volta). O XSD aceita `br` em `inlineContent`.
- **[Trade-off]** Placeholders vazios deixam espaços duplos (por exemplo, sem documento referenciado). → Aceito: a issue manda substituir por vazio, e o caso não acontece no fluxo do componente, que sempre informa a referenciada quando o modelo a usa.
- **[Risco]** O host ainda gera a epígrafe por conta própria. → Avisar o `lexeditweb-editor` de que existe o `montaEpigrafe` e de que a epígrafe pode trazer `<br/>`.

## Migration Plan

Sem migração de dados: documentos já salvos não têm `br` na epígrafe, ou o perdiam ao abrir. A partir desta change, arquivos com `br` passam a preservá-lo. O rollback é reverter o código, sem efeito sobre arquivos já salvos, porque o `br` é LexML válido.
