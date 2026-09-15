# Analise Tecnica da Estrutura LexML Brasil

> Engenharia reversa e analise profunda do padrao LexML com base na documentacao oficial
> (Partes 1, 2 e 3) e nos arquivos JSON de proposicoes do diretorio `data/`.

---

## 1. Mapeamento de Objetos e Tipos

### 1.1 Raiz `br_gov_lexml__1.LexML` e o `namespaceURI`

Todo documento LexML serializado em JSON possui a seguinte estrutura de entrada:

```json
{
  "name": {
    "namespaceURI": "http://www.lexml.gov.br/1.0",
    "localPart": "LexML",
    "prefix": "",
    "key": "{http://www.lexml.gov.br/1.0}LexML",
    "string": "{http://www.lexml.gov.br/1.0}LexML"
  },
  "value": {
    "TYPE_NAME": "br_gov_lexml__1.LexML",
    ...
  }
}
```

**Papel do `namespaceURI`:** O campo `namespaceURI` com valor `http://www.lexml.gov.br/1.0` identifica o espaco de nomes XML do vocabulario LexML. Conforme a **Parte 3 (XML Schema)**, todos os elementos do LexML pertencem a este namespace. No XML original, isso seria declarado como `xmlns="http://www.lexml.gov.br/1.0"`. Na serializacao JSON (via biblioteca PyXB ou similar), o namespace e representado tanto no objeto `name` quanto no prefixo `TYPE_NAME`.

**O campo `name`:** Repete a informacao do namespace de forma explicita (`namespaceURI`, `localPart`, `key`, `string`). E usado para identificar o tipo do elemento XML original. O `localPart` indica o nome local do elemento (ex: "LexML", "Artigo", "Caput", "span").

**O campo `TYPE_NAME`:** Usa a notacao `br_gov_lexml__1.NomeDoTipo`, onde:
- `br_gov_lexml` e o identificador do modulo Python gerado a partir do XSD
- `__1` refere-se a versao 1.0 do namespace (`/1.0`)
- `NomeDoTipo` e o nome do tipo complexo ou elemento no XML Schema (em UpperCamelCase, conforme a Parte 3)

Conforme a **Parte 3, Secao 4**: *"Todos os elementos do LexML utilizam a notacao UpperCamelCase. Os atributos utilizam a notacao lowerCamelCase."*

### 1.2 `ProjetoNorma` vs `Norma` na Hierarquia

A **Parte 3, Secao 5.2** define que o LexML prevê tipos de documentos, dentre eles:

| Tipo | Descricao |
|------|-----------|
| **Norma** | Constituição, Emendas, Leis, Decretos (normas ja promulgadas) |
| **ProjetoNorma** | Proposicoes legislativas (projetos ainda em tramitacao) |
| Jurisprudencia | Sumulas e Acordaos |
| DocumentoGenerico | Outros tipos de documentos |
| Anexo | Anexos dos documentos acima |

Na estrutura JSON observada:

```json
{
  "projetoNorma": {
    "TYPE_NAME": "br_gov_lexml__1.ProjetoNorma",
    "norma": {
      "TYPE_NAME": "br_gov_lexml__1.HierarchicalStructure",
      ...
    }
  }
}
```

**Hierarquia:** `ProjetoNorma` e o container de alto nivel que encapsula uma `Norma` interna. Ambos utilizam o tipo `HierarchicalStructure` para o conteudo, que por sua vez se divide em:
- `parteInicial` (epigrafe, ementa, preambulo)
- `articulacao` (artigos e dispositivos)
- `parteFinal` (quando presente)

Conforme a **Parte 3, Secao 5.2**: *"A Norma e o Projeto de Norma utilizam o tipo HierarchicalStructure."*

### 1.3 Prefixos de Tipo (`br_gov_lexml__1.`)

O prefixo `br_gov_lexml__1.` nos campos `TYPE_NAME` e a representacao Python (gerada por binding como PyXB) do namespace XML `http://www.lexml.gov.br/1.0`. Cada tipo complexo definido no XML Schema recebe este prefixo. Exemplos:

| TYPE_NAME | Elemento XML Original |
|-----------|----------------------|
| `br_gov_lexml__1.LexML` | `LexML` (elemento raiz) |
| `br_gov_lexml__1.Metadado` | `Metadado` |
| `br_gov_lexml__1.Identificacao` | `Identificacao` |
| `br_gov_lexml__1.ProjetoNorma` | `ProjetoNorma` |
| `br_gov_lexml__1.HierarchicalStructure` | Tipo complexo compartilhado |
| `br_gov_lexml__1.ParteInicial` | `ParteInicial` |
| `br_gov_lexml__1.Articulacao` | `Articulacao` |
| `br_gov_lexml__1.DispositivoType` | Tipo base para Artigo, Caput, Inciso etc. |
| `br_gov_lexml__1.GenInline` | Tipo generico inline (para conteudo misto) |
| `br_gov_lexml__1.TextoType` | Tipo para conteudo textual com paragrafos |
| `br_gov_lexml__1.Alteracao` | `Alteracao` (bloco de modificacao de norma) |
| `br_gov_lexml__1.Omissis` | `Omissis` (indicador de texto suprimido) |

---

## 2. Anatomia da Parte Inicial

A Parte Inicial (`ParteInicial`) e o primeiro componente de uma norma/projeto, antes da articulacao. Conforme a **Parte 3, Secao 5.2**, ela e um dos containers referenciados na definicao do tipo de documento.

### 2.1 Epigrafe

```json
"epigrafe": {
  "TYPE_NAME": "br_gov_lexml__1.GenInline",
  "id": "epigrafe",
  "content": [
    "PROJETO DE DECRETO LEGISLATIVO N 00001 de 2023 "
  ]
}
```

**Funcao tecnica:** A epigrafe e o titulo formal do documento, contendo o tipo, numero e ano. Conforme a **Parte 3, Secao 5.5**, identificadores como `epigrafe` sao pre-definidos para rapida localizacao de segmentos de texto.

**Estrutura do conteudo:**
- `TYPE_NAME`: `GenInline` - tipo generico inline que suporta conteudo misto (texto e elementos inline)
- `id`: fixo como `"epigrafe"` - identificador unico dentro do documento
- `content`: array que pode conter strings puras e/ou objetos inline aninhados

**Variacoes por tipo de proposicao:**

| Tipo | Epigrafe |
|------|----------|
| PDL | `PROJETO DE DECRETO LEGISLATIVO No 00001 de 2023` |
| PEC | `PROPOSTA DE EMENDA CONSTITUCIONAL No 00001 de 2023` |
| PL | `PROJETO DE LEI No 00003 de 2023` |
| PLP | `PROJETO DE LEI No 00028 de 2023` |
| PRN | `PROJETO DE RESOLUCAO DO SENADO No 00002 de 2023` |
| PRS | `PROJETO DE RESOLUCAO DO SENADO No 00001 de 2023` |
| MPV | `MEDIDA PROVISORIA No 1.154, DE 1 DE JANEIRO DE 2023` |

**Observacoes sobre os formatos:**

1. **Proposicoes legislativas** (PDL, PEC, PL, PLP, PRN, PRS): Seguem o padrao `TIPO No XXXXX de AAAA`, com numero preenchido com zeros a esquerda (5 digitos) e ano com 4 digitos.
2. **Medida Provisoria** (MPV): Usa formato distinto — numero com separador de milhar (`1.154`) e data completa por extenso (`DE 1 DE JANEIRO DE 2023`), por se tratar de norma ja promulgada.
3. **PRN e PRS**: Compartilham o mesmo formato de epigrafe (`PROJETO DE RESOLUCAO DO SENADO`), apesar de representarem tipos distintos (Resolucao do Congresso e Resolucao do Senado, respectivamente).
4. Os diretorios PDN, PDS, PLC e PLS estao presentes na estrutura de dados mas nao contem arquivos JSON no corpus analisado.

### 2.2 Ementa

```json
"ementa": {
  "TYPE_NAME": "br_gov_lexml__1.GenInline",
  "id": "ementa",
  "content": [
    "Aprova a intervencao federal na area de seguranca publica do Distrito Federal, nos termos do ",
    {
      "name": {
        "namespaceURI": "http://www.lexml.gov.br/1.0",
        "localPart": "span",
        "key": "{http://www.lexml.gov.br/1.0}span"
      },
      "value": {
        "TYPE_NAME": "br_gov_lexml__1.GenInline",
        "href": "urn:lex:br:federal:decreto:2023-01-08;11377",
        "content": [
          "Decreto N 11.377, de 8 de janeiro de 2023"
        ]
      }
    },
    ", com o objetivo de por fim a grave comprometimento da ordem publica.\n"
  ]
}
```

**Funcao tecnica:** A ementa e o resumo/sumario do conteudo normativo. Sua funcao principal e descrever, de forma sintetica, o objeto da proposicao.

**Referencias cruzadas com `span`:** O elemento `span` (do vocabulario LexML, nao HTML) e o mecanismo central de referencias cruzadas no LexML. Funciona assim:

1. **Dentro de `content`:** O array mistura strings literais com objetos que representam elementos XML inline
2. **O objeto `span`:** Possui:
   - `name.localPart`: `"span"` - identifica o elemento XML
   - `value.href`: URN LexML absoluta do documento referenciado (ex: `"urn:lex:br:federal:decreto:2023-01-08;11377"`)
   - `value.content`: texto visivel que sera renderizado como hyperlink

3. **Fragmentos com `!`:** Quando a referencia aponta para um dispositivo especifico, o `href` usa o separador `!`:
   - `"urn:lex:br:federal:constituicao:1988-10-05;1988!art5"` - Art. 5 da CF/88
   - `"urn:lex:br:federal:constituicao:1988-10-05;1988!art49_cpt_inc4"` - Inciso IV do caput do art. 49 da CF/88
   - `"urn:lex:br:federal:lei:2007-05-31;11482!art1"` - Art. 1 da Lei 11.482/2007

Conforme a **Parte 3, Secao 7**: *"Dentro de um elemento <p> e possivel utilizar o elemento inline para criar referencias href para outros documentos do LexML."*

**URN com fragmentos** (Parte 2, Secao 11): O elemento `!` separa o identificador do documento do identificador do fragmento. O mapeamento segue a semantica XPointer.

### 2.3 Preambulo

```json
"preambulo": {
  "TYPE_NAME": "br_gov_lexml__1.TextoType",
  "id": "preambulo",
  "p": [
    {
      "TYPE_NAME": "br_gov_lexml__1.GenInline",
      "content": [
        "\n    O CONGRESSO NACIONAL decreta:\n  "
      ]
    }
  ]
}
```

**Funcao tecnica:** O preambulo e a formula de promulgacao ou enunciado de competencia legislativa que precede a articulacao. Ele estabelece a **autoridade competente** e a **base legal** para a edicao do ato.

**Diferenca estrutural em relacao a epigrafe/ementa:**
- Usa `TextoType` (com array `p`) em vez de `GenInline` (com array `content`)
- Suporta multiplos paragrafos (`p`)
- Cada `p` e um `GenInline` que pode conter texto misto e referencias

**Variacoes por tipo de proposicao:**

| Tipo | Preambulo tipico |
|------|-----------------|
| PDL | `O CONGRESSO NACIONAL decreta:` |
| PEC | `As Mesas da Camara dos Deputados e do Senado Federal, nos termos do 3o do art. 60 da Constituicao Federal, promulgam a seguinte Emenda ao texto constitucional:` |
| PL | `O CONGRESSO NACIONAL decreta:` |
| PLP | `O CONGRESSO NACIONAL decreta:` |
| PRN | `O CONGRESSO NACIONAL resolve:` |
| PRS | `O SENADO FEDERAL resolve:` |
| MPV | `O PRESIDENTE DA REPUBLICA, no uso da atribuicao que lhe confere o art. 62 da Constituicao, adota a seguinte Medida Provisoria, com forca de lei:` |

**Variações textuais observadas no corpus:**

Embora cada tipo possua um padrao canônico, o corpus revela variações ortográficas e estruturais significativas:

**MPV** (179 arquivos):
- Forma canonica: `O PRESIDENTE DA REPUBLICA, no uso da atribuicao que lhe confere o art. 62 da Constituicao, adota a seguinte Medida Provisoria, com forca de lei:`
- Com base orçamentária adicional: `...no uso da atribuicao que lhe confere o art. 62, combinado com o art. 167, 3o, da Constituicao...`
- Com Vice-Presidente: `O VICE-PRESIDENTE DA REPUBLICA, no exercicio do cargo de PRESIDENTE DA REPUBLICA, no uso da atribuicao...`

**PEC** (120 arquivos):
- Forma canonica: `As Mesas da Camara dos Deputados e do Senado Federal, nos termos do 3o do art. 60 da Constituicao Federal, promulgam a seguinte Emenda ao texto constitucional:`
- Variacao no ordinal: `3o` vs `3o` (símbolo de grau vs ordinal) vs `3o` (sem espaco)
- Variacao na palavra: `art.` vs `artigo`
- Variacao de caixa: `Emenda` vs `emenda`, `Federal` vs `federal`, `AS MESAS` vs `As Mesas`
- Variacao no parágrafo constitucional: `3o` (regra) vs `4o` (caso raro, referente a promulgacao por convencao)

**PL** (2.785 arquivos) e **PDL** (856 arquivos):
- Forma canonica: `O CONGRESSO NACIONAL decreta:`
- Variacao de caixa: `O CONGRESSO NACIONAL DECRETA:` (tudo maiusculo), `O Congresso Nacional decreta:` / `O Congresso Nacional Decreta:` (somente inicial maiuscula)
- Caso atípico em PL: `O SENADO FEDERAL resolve:` (quando a proposicao e de competencia exclusiva do Senado)
- Caso atípico em PLP: `O PRESIDENTE DA REPUBLICA Faco saber que o Congresso Nacional decreta e eu sanciono a seguinte Lei Complementar:` (quando já sancionada)

**PRS** (152 arquivos):
- Forma canonica: `O SENADO FEDERAL resolve:`
- Variacao de caixa: `O SENADO FEDERAL RESOLVE:`, `O Senado Federal resolve:`
- Casos atípicos: `O SENADO FEDERAL decreta:` e `O CONGRESSO NACIONAL decreta:` (inconsistência de classificacao)

**PRN** (2 arquivos):
- Forma canonica: `O CONGRESSO NACIONAL resolve:`
- Variacao: `O CONGRESSO NACIONAL RESOLVE:` (tudo maiusculo)

O preambulo e **critico** para a analise porque revela:
1. Quem e a **autoridade emitente** (Congresso, Senado, Presidente)
2. Qual e a **competencia invocada** (artigo constitucional)
3. Qual e a **forma legislativa** (decreta, resolve, adota)

---

## 3. Articulacao e Hierarquia

### 3.1 O Array `lXhier`

```json
"articulacao": {
  "TYPE_NAME": "br_gov_lexml__1.Articulacao",
  "lXhier": [
    { "name": { "localPart": "Artigo" }, "value": { ... } },
    { "name": { "localPart": "Artigo" }, "value": { ... } }
  ]
}
```

**Funcao:** O array `lXhier` (LexML Hierarchy) e o container principal da hierarquia de dispositivos. Cada entrada e um par `{ "name": ..., "value": ... }` onde:
- `name.localPart` identifica o tipo do elemento hierarquico (Artigo, Parte, Livro, Titulo, Capitulo, Secao, Subsecao)
- `value` contem o conteudo do dispositivo

Conforme a **Parte 3, Secao 5.1**, estes elementos seguem o **Design Pattern Hierarchy** - elementos de estrutura hierarquica que podem conter outros elementos hierarquicos recursivamente.

A **Parte 3, Secao 5.3** define os elementos de agrupamento de artigos conforme a LC 95/1998:

| Elemento | Prefixo id | Exemplo |
|----------|-----------|---------|
| Parte | `prtN` | Parte Geral = `prt1` |
| Livro | `livN` | Livro I = `liv1` |
| Titulo | `titN` | Titulo II = `tit2` |
| Capitulo | `capN` | Cap. IV-A = `cap4-1` |
| Secao | `secN` | Secao III = `sec3` |
| Subsecao | `subN` | Subsecao I = `sub1` |

### 3.2 `lXcontainersOmissis` e o `Caput`

```json
{
  "name": { "localPart": "Artigo" },
  "value": {
    "TYPE_NAME": "br_gov_lexml__1.DispositivoType",
    "id": "art1",
    "rotulo": "Art. 1",
    "lXcontainersOmissis": [
      {
        "name": { "localPart": "Caput" },
        "value": {
          "TYPE_NAME": "br_gov_lexml__1.DispositivoType",
          "id": "art1_cpt",
          "p": [ ... ]
        }
      }
    ]
  }
}
```

**O objeto `lXcontainersOmissis`:** E um array que contem os **subdispositivos** de um artigo (ou dispositivo pai). O nome sugere que ele suporta tanto containers (Caput, Paragrafo, Inciso, Alinea, Item) quanto elementos Omissis (indicadores de texto omitido).

**Por que encapsula o Caput?** O Caput e o "corpo" principal de um artigo, obrigatoriamente presente. Conforme a **Parte 3, Tabela 3**, o Caput nao possui sequencial numerico pois e unico e obrigatorio em cada artigo. O `lXcontainersOmissis` pode conter:

| Elemento | Prefixo id | Descricao |
|----------|-----------|-----------|
| **Caput** | `artN_cpt` | Texto principal do artigo (obrigatorio) |
| **Paragrafo** | `artN_parN` | Paragrafos (1, 2...) ou unico (`par1u`) |
| **Inciso** | `artN_cpt_incN` | Incisos em romano (I, II, III...) |
| **Alinea** | `artN_cpt_incN_aliN` | Alíneas (a, b, c...) |
| **Item** | `artN_cpt_incN_aliN_iteN` | Itens numericos |
| **Omissis** | `..._omiN` | Indicador de "..." (texto suprimido) |

### 3.3 Atributos `id` e `rotulo`

**Atributo `id`:** Identificador tecnico unico dentro do documento, usado para:
- Referencias internas (remissoes)
- Ancoragem para alteracoes legislativas
- Navegacao hipertextual

Conforme a **Parte 3, Secoes 5.3 e 5.4**, os IDs sao construidos por concatenacao hierarquica:

```
Exemplos de formacao de id:
art1             -> Art. 1
art1_cpt         -> caput do Art. 1
art1_cpt_inc3    -> Inciso III do caput do Art. 1
art5_par3_ali1   -> Alinea "a" do 3 do Art. 5
art3-1_par1      -> Paragrafo unico do Art. 3-A
art1_cpt_alt1_art5_cpt_inc36  -> Inciso XXXVI do caput do art. 5, dentro da alteracao 1 do caput do art. 1
art2_par1u       -> Paragrafo unico do Art. 2
art1u            -> Artigo unico (norma com artigo unico)
art3_cpt_alt1_art5_par1u  -> Paragrafo unico do art. 5, dentro da alteracao 1 do caput do art. 3
```

**Regras de formacao** (Parte 3, Secao 5.4):
- Algarismos romanos sao convertidos para arabicos: XXXVI -> `inc36`
- Letras de alineas sao convertidas para numeros: "a" -> `ali1`, "b" -> `ali2`
- Letras de sequencial de inclusao (Art. 3-A) viram sufixo numerico: `art3-1`

**Sufixo `u` para dispositivos unicos:**

Na legislacao brasileira, quando um artigo possui apenas um paragrafo, a denominacao e "Paragrafo unico" em vez de "1o". O sistema de IDs LexML representa essa condicao acrescentando o sufixo `u` ao numero sequencial:

- `artN_par1u` — Paragrafo unico do artigo N (o numero e sempre `1` porque ha apenas um)
- `artN_cpt_altM_artX_par1u` — Paragrafo unico dentro de um bloco de alteracao
- `art1u` — Artigo unico (quando a norma contem apenas um artigo)

Exemplo real extraido do corpus (PEC_2025_00024):

```json
{
  "name": { "localPart": "Paragrafo" },
  "value": {
    "TYPE_NAME": "br_gov_lexml__1.DispositivoType",
    "id": "art2_par1u",
    "rotulo": "Paragrafo unico.",
    "p": [...]
  }
}
```

O padrao `par1u` foi identificado em **1.196 arquivos** do corpus (742 com a forma direta `artN_par1u`). O sufixo `u` e exclusivo de dispositivos unicos — nunca ocorre `par2u`, `par3u` etc., pois a condicao de "unico" implica existencia de um so elemento. O padrao `art1u` ("Artigo unico") e mais raro, sendo encontrado em normas de texto curto (ex: PL_2025_06675).

**Atributo `rotulo`:** O rotulo e a **representacao visual** do dispositivo, destinada a renderizacao. Diferente do `id` (tecnico), o `rotulo` e voltado para apresentacao:

```json
"rotulo": "Art. 1"     // Apresentacao: "Art. 1"
"rotulo": "Art. 5"     // Apresentacao: "Art. 5"
"rotulo": "I -"        // Apresentacao: "I -"
"rotulo": "a)"         // Apresentacao: "a)"
"rotulo": " 1."        // Apresentacao: " 1."
"rotulo": " 4"         // Apresentacao: " 4"
```

### 3.4 Sistema de Alteracao

Uma funcionalidade avancada do LexML e o suporte nativo a **alteracoes legislativas**. Quando uma proposicao altera uma norma existente:

```json
"alteracao": {
  "TYPE_NAME": "br_gov_lexml__1.Alteracao",
  "base": "urn:lex:br:federal:lei:2007-05-31;11482",
  "id": "art1_cpt_alt1",
  "content": [
    {
      "name": { "localPart": "Artigo" },
      "value": {
        "TYPE_NAME": "br_gov_lexml__1.DispositivoType",
        "href": "art1",           // referencia ao dispositivo da norma original
        "id": "art1_cpt_alt1_art1",
        "abreAspas": "s",         // indica inicio de citacao (abre aspas)
        "rotulo": "Art. 1",
        "lXcontainersOmissis": [
          {
            "name": { "localPart": "Caput" },
            "value": {
              "textoOmitido": "s", // texto original foi omitido (reticencias)
              "lXcontainersOmissis": [
                { "name": { "localPart": "Omissis" }, "value": { "id": "..._omi1" } },
                { "name": { "localPart": "Inciso" }, "value": { "rotulo": "X -", ... } },
                { "name": { "localPart": "Omissis" }, "value": { "id": "..._omi2" } }
              ]
            }
          },
          {
            "name": { "localPart": "Omissis" },
            "value": {
              "id": "..._omi1",
              "fechaAspas": "s",    // indica fim da citacao (fecha aspas)
              "notaAlteracao": "NR"  // NR = "Nova Redacao"
            }
          }
        ]
      }
    }
  ]
}
```

**Atributos da alteracao:**
- `base`: URN da norma que esta sendo alterada (referencia base)
- `abreAspas`: marca inicio do trecho alterado (indicacao visual de aspas)
- `fechaAspas`: marca fim do trecho alterado
- `notaAlteracao`: tipo da alteracao (`"NR"` = Nova Redacao, `"AC"` = Acrescimo, `"RV"` = Revogacao)
- `textoOmitido`: indica que o texto original foi omitido e substituido por reticencias
- `href`: referencia ao `id` do dispositivo na norma original

Conforme a **Parte 3, Secao 5.5**: *"Os identificadores de dispositivos alvo de uma alteracao sao precedidos pelo prefixo CONT_aspN_, onde CONT representa o id do dispositivo da alteracao e N representa o sequencial das aspas."*

---

## 4. Identificacao e Metadados

### 4.1 Analise do campo `urn`

```json
"identificacao": {
  "TYPE_NAME": "br_gov_lexml__1.Identificacao",
  "urn": "urn:lex:br:senado.federal:projeto.decreto.legislativo;pdl:2023;00001"
}
```

**Logica de construcao conforme a Parte 2 (LexML URN):**

A URN segue o formato geral:

```
urn:lex:<pais>:<localidade>:<autoridade>:<tipo>[;detalhamento]:<data>;<numero>[;componente][!fragmento][@versao][~expressao]
```

**Decomposicao da URN exemplo:**

```
urn:lex:br:senado.federal:projeto.decreto.legislativo;pdl:2023;00001
     |   |          |                           |    |     |
     |   |          |                           |    |     numero (00001)
     |   |          |                           |    data representativa (2023)
     |   |          |                           detalhamento do subtipo (pdl)
     |   |          tipo do documento
     |   autoridade emissora (Senado Federal)
     localidade (Brasil, sem subdivisao)
     namespace "lex"
```

**Regras aplicadas** (Parte 2, Secoes 3-10):

1. **Namespace** (Secao 3): `"urn:lex:"` - fixo para documentos juridicos
2. **Pais** (Secao 3.1): `"br"` - codigo IETF do Brasil
3. **Localidade** (Secao 6): Vazio para normas federais; `"sao.paulo"` para estaduais; `"sao.paulo;sao.paulo"` para municipais
4. **Autoridade** (Secao 8): `"senado.federal"` - indicada por extenso, sem siglas, sem conectivos
5. **Tipo** (Secao 9): `"projeto.decreto.legislativo"` - por extenso, palavras separadas por ponto
6. **Detalhamento** (Secao 9.2): `";pdl"` - sigla do subtipo
7. **Data** (Secao 10.1): `"2023"` - ano da iniciativa (para proposicoes)
8. **Numero** (Secao 10.2): `"00001"` - numero do documento

**Comparacao de URNs por tipo de proposicao:**

| Tipo | URN | Observacoes |
|------|-----|-------------|
| PDL | `urn:lex:br:senado.federal:projeto.decreto.legislativo;pdl:2023;00001` | Autoridade = senado.federal |
| PEC | `urn:lex:br:senado.federal:proposta.emenda.constitucional;pec:2023;00001` | Autoridade = senado.federal |
| PL | `urn:lex:br:senado.federal:projeto.lei;pl:2023;00003` | Autoridade = senado.federal |
| MPV | `urn:lex:br:federal:medida.provisoria:2024-02-06;1206` | Autoridade = federal (Poder Executivo); data completa |

**Nota sobre MPV:** A MPV e emitida pelo Presidente da Republica, entao usa a autoridade convencionada `"federal"` (Secao 8.3.3). Alem disso, a data e completa (`2024-02-06`) em vez de apenas ano, pois normas promulgadas usam data de assinatura.

**Convencao de autoridade** (Parte 2, Secao 8.3.3): *"Normas do tipo constituicao, leis, decretos etc. tem a autoridade indicada apenas com 'federal', 'estadual' ou 'municipal'."* Ja as proposicoes legislativas indicam a Casa Legislativa onde foram apresentadas (`senado.federal`, `camara.deputados`).

---

## 5. Tipos de Documentos no Diretorio `data/`

| Sigla | Nome Completo | Diretorio |
|-------|--------------|-----------|
| PDL | Projeto de Decreto Legislativo | `data/PDL/` |
| PEC | Proposta de Emenda Constitucional | `data/PEC/` |
| PL | Projeto de Lei | `data/PL/` |
| PLC | Projeto de Lei Complementar | `data/PLC/` |
| PLP | Projeto de Lei Parlamentar | `data/PLP/` |
| PLS | Projeto de Lei do Senado | `data/PLS/` |
| PRN | Projeto de Resolucao | `data/PRN/` |
| PRS | Projeto de Resolucao do Senado | `data/PRS/` |
| MPV | Medida Provisoria | `data/MPV/` |
| PDN | Projeto de Decreto Nacional | `data/PDN/` |
| PDS | Projeto de Decreto do Senado | `data/PDS/` |

---

## 6. Modelo de Referencia FRBR OO

Conforme a **Parte 1 (Modelo de Referencia)**, o LexML adota o modelo FRBR OO com os seguintes niveis de abstracao:

```
F15 Complex Work (Documento Complexo)
  |-- representa o conteudo no tempo, sem especificar versao
  |
  +-- F14 Individual Work (Documento Individual)
  |     |-- conteudo abstrato de uma versao especifica
  |     |
  |     +-- F22 Self-Contained Expression (Fragmento/Expressao)
  |           |-- texto efetivo do documento (particao)
  |
  +-- F4 Manifestation Singleton (Manifestacao Unica)
        |-- documento fisico ou digital assinado
```

**Datas fundamentais** (Parte 1, Secao 4):
- **Data Representativa:** assinatura (normas), iniciativa (proposicoes), julgamento (acordaos)
- **Data da Versao:** inicio de vigencia ou validade
- **Data da Visao:** data de evento que gera variante (retificacao, veto, etc.)

---

## 7. Design Patterns do XML Schema

Conforme a **Parte 3, Secao 5.1**, o LexML utiliza cinco patterns de modelo de conteudo:

| Pattern | Descricao | Elementos |
|---------|-----------|-----------|
| **Hierarchy** | Estrutura hierarquica | Artigo, Caput, Inciso, Paragrafo, etc. |
| **Container** | Agrupamento de elementos | Articulacao, ParteInicial, Alteracao |
| **Block** | Sequencia de elementos bloco | `p` (paragrafos) |
| **Inline** | Conteudo misto (texto + elementos) | `span`, `i`, `b`, etc. |
| **Marker** | Elemento de conteudo vazio | Omissis (sem texto, apenas marcacao) |

Alem destes, o LexML adota o pattern **Universal Root**: *"Todos os documentos LexML compartilham o mesmo elemento raiz `<LexML>`, cujo conteudo inicial e obrigatoriamente o elemento `<Metadado>` seguido do elemento que identifica o tipo de documento."* (Parte 3, Secao 5.2)

### 7.1 Grupos de Elementos no XSD Base (`lexml-base.xsd`)

O arquivo **`lexml-base.xsd`** (versao 1.5, setembro 2011) define a fundacao do schema LexML. Ele e incluido tanto pelo schema rigido (`lexml-br-rigido.xsd`) quanto pelo schema flexivel, e esta disponivel em:

- **Schema base:** `https://projeto.lexml.gov.br/esquemas/lexml-base.xsd`
- **Schema rigido (LC 95/1998):** `https://projeto.lexml.gov.br/esquemas/lexml-br-rigido.xsd`

O schema base define grupos de elementos que seguem os cinco patterns. Documentos validos no schema rigido tambem sao validos no schema flexivel.

#### 7.1.1 Grupo `LXhier` — Elementos Hierarquicos

```xml
<xsd:group name="LXhier">
  <xsd:choice>
    <xsd:element ref="_Parte"/>
    <xsd:element ref="_Livro"/>
    <xsd:element ref="_Titulo"/>
    <xsd:element ref="_Capitulo"/>
    <xsd:element ref="_Secao"/>
    <xsd:element ref="_Artigo"/>
  </xsd:choice>
</xsd:group>
```

O grupo `LXhierCompleto` estende `LXhier` adicionando `_Subsecao`.

> **Nota:** Os elementos com prefixo `_` (ex: `_Artigo`, `_Parte`) sao declarados no schema rigido (`lexml-br-rigido.xsd`) via `substitutionGroup`. O schema base define os "slots" com prefixo `_`; o rigido substitui cada um pelo elemento concreto (ex: `Artigo` substitui `_Artigo`).

#### 7.1.2 Grupo `LXcontainers` — Subdispositivos

```xml
<xsd:group name="LXcontainers">
  <xsd:choice>
    <xsd:element ref="_Caput"/>
    <xsd:element ref="_Paragrafo"/>
    <xsd:element ref="_Inciso"/>
    <xsd:element ref="_Alinea"/>
    <xsd:element ref="_Item"/>
  </xsd:choice>
</xsd:group>
```

#### 7.1.3 Grupo `LXinline` — Elementos Inline do LexML

```xml
<xsd:group name="LXinline">
  <xsd:choice>
    <xsd:element ref="Remissao"/>
    <xsd:element ref="RemissaoMultipla"/>
    <xsd:element ref="Alteracao"/>
    <xsd:element ref="Formula"/>
  </xsd:choice>
</xsd:group>
```

O grupo `inlineElements` combina `LXinline` + `HTMLinline` + `EmLinha` (elemento generico):

```xml
<xsd:group name="inlineElements">
  <xsd:choice>
    <xsd:group ref="LXinline"/>
    <xsd:group ref="HTMLinline"/>
    <xsd:element ref="EmLinha"/>
  </xsd:choice>
</xsd:group>
```

#### 7.1.4 Grupo `LXmarker` — Elementos Marcadores

```xml
<xsd:group name="LXmarker">
  <xsd:choice>
    <xsd:element ref="NotaReferenciada"/>
  </xsd:choice>
</xsd:group>
```

#### 7.1.5 Grupo `HTMLinline` — Elementos Inline do HTML

```xml
<xsd:group name="HTMLinline">
  <xsd:choice>
    <xsd:element ref="span"/>
    <xsd:element ref="b"/>
    <xsd:element ref="i"/>
    <xsd:element ref="a"/>
    <xsd:element ref="sub"/>
    <xsd:element ref="sup"/>
    <xsd:element ref="ins"/>
    <xsd:element ref="del"/>
    <xsd:element ref="dfn"/>
  </xsd:choice>
</xsd:group>
```

#### 7.1.6 Grupo `HTMLblock` — Elementos Bloco

```xml
<xsd:group name="HTMLblock">
  <xsd:choice>
    <xsd:element ref="p"/>
    <xsd:element ref="ul"/>
    <xsd:element ref="ol"/>
    <xsd:element ref="table"/>
  </xsd:choice>
</xsd:group>
```

### 7.2 Declaracao XSD dos Elementos de Remissao

O elemento `<Remissao>` e declarado no `lexml-base.xsd` como:

```xml
<xsd:element name="Remissao">
  <xsd:complexType mixed="true">
    <xsd:complexContent>
      <xsd:extension base="inline">
        <xsd:attributeGroup ref="link"/>
      </xsd:extension>
    </xsd:complexContent>
  </xsd:complexType>
</xsd:element>
```

Onde:
- **`inline`** (tipo base): conteudo misto (texto + elementos inline/marcadores) + `coreopt` (atributos opcionais como `id`, `class`)
- **`link`** (attributeGroup): `xlink:href` (obrigatorio)

```xml
<xsd:attributeGroup name="link">
  <xsd:attribute ref="xlink:href" use="required"/>
</xsd:attributeGroup>
```

O tipo base `inline`:

```xml
<xsd:complexType name="inline" mixed="true">
  <xsd:choice minOccurs="0" maxOccurs="unbounded">
    <xsd:group ref="inlineElements"/>
    <xsd:group ref="markerElements"/>
  </xsd:choice>
  <xsd:attributeGroup ref="coreopt"/>
</xsd:complexType>
```

O elemento `<RemissaoMultipla>` segue a mesma estrutura, mas usa `xml:base` (obrigatorio) em vez de `xlink:href`:

```xml
<xsd:element name="RemissaoMultipla">
  <xsd:complexType mixed="true">
    <xsd:complexContent>
      <xsd:extension base="inline">
        <xsd:attribute ref="xml:base" use="required"/>
      </xsd:extension>
    </xsd:complexContent>
  </xsd:complexType>
</xsd:element>
```

### 7.3 Mapeamento Jsonix: XSD para JSON

A biblioteca **Jsonix** converte elementos XML em objetos JSON. O mapeamento de atributos XLink para o objeto JavaScript e:

| Atributo XSD | Campo Jsonix | Observacao |
|--------------|-------------|------------|
| `xlink:href` | `href` | Jsonix remove o prefixo do namespace XLink |
| `xml:base` | `base` | Jsonix remove o prefixo do namespace XML |
| `id` | `id` | Atributo direto, sem namespace |
| `mixed content` | `content[]` | Array com strings e objetos inline aninhados |

**Exemplo completo — Remissao interna serializada pelo LexML-ETA:**

```typescript
// buildJsonixFromProjetoNorma.ts — buildRemissao()
{
  name: {
    namespaceURI: 'http://www.lexml.gov.br/1.0',
    localPart: 'Remissao',
    key: '{http://www.lexml.gov.br/1.0}Remissao',
  },
  value: {
    TYPE_NAME: 'br_gov_lexml__1.GenInline',
    href: 'art5_cpt',        // xlink:href → ID local do dispositivo destino
    content: ['art. 5'],     // conteudo misto (texto visivel)
  },
}
```

**Exemplo completo — Remissao externa no corpus (`span` com URN):**

```json
{
  "name": { "localPart": "span" },
  "value": {
    "TYPE_NAME": "br_gov_lexml__1.GenInline",
    "href": "urn:lex:br:federal:lei:1990-07-13;8069!art5_cpt",
    "content": ["art. 5 do ECA"]
  }
}
```

### 7.4 Remissao vs span: Quando Usar Cada Um

Ambos `Remissao` e `span` pertencem ao grupo `inlineElements` e podem aparecer dentro de `<p>`. A diferenca pratica observada no corpus:

| Aspecto | `Remissao` | `span` |
|---------|-----------|--------|
| **Grupo XSD** | `LXinline` | `HTMLinline` |
| **Atributo obrigatorio** | `xlink:href` | nenhum (href e opcional) |
| **Uso no corpus** | Remissoes internas (ID local) | Remissoes externas (URN) e links genericos |
| **Semantica** | Referencia cruzada explicita | Elemento inline generico com opcionalmente `href` |
| **Tipo base** | `inline` + `link` | `inline` (sem attributeGroup extra) |

> **Nota:** Na pratica, ambos sao intercambiaveis para referencias. A Parte 3, Secao 7, menciona explicitamente o uso de `<Remissao>` para referencias internas com `href` contendo apenas o ID local do dispositivo. O `span` com URN e usado predominantemente para referencias externas.

---

## 8. Sistema de Remissoes

O LexML implementa um sistema sofisticado de remissoes (referencias cruzadas) que permite interligar dispositivos dentro de um mesmo documento e entre documentos distintos. Este sistema e fundamental para a navegabilidade e interoperabilidade do ordenamento juridico.

### 8.1 Mecanismo Geral: `span` com `href`

O elemento basico de remissao e o `span` (do vocabulario LexML, nao HTML), que aparece dentro de arrays `content` em elementos do tipo `GenInline`. O atributo `href` carrega o identificador do destino:

```json
{
  "name": {
    "namespaceURI": "http://www.lexml.gov.br/1.0",
    "localPart": "span",
    "key": "{http://www.lexml.gov.br/1.0}span"
  },
  "value": {
    "TYPE_NAME": "br_gov_lexml__1.GenInline",
    "href": "<destino>",
    "content": ["<texto visivel>"]
  }
}
```

**Papel dos campos:**
- `href`: identificador do destino, que pode ser:
  - **URN completa** — para remissoes externas (ex: `urn:lex:br:federal:lei:1990-07-13;8069`)
  - **URN com fragmento** — para remissoes a dispositivo especifico de outra norma (ex: `urn:lex:br:federal:lei:1990-07-13;8069!art5_cpt`)
  - **ID local puro** — para remissoes internas a propria proposicao (ex: `art5_cpt`, `art10_par1`)
- `content`: texto visivel renderizado como hyperlink

O `span` pode aparecer em tres localizacoes do documento:
1. **Ementa** (`parteInicial.ementa.content[]`) — 3.573 referencias no corpus
2. **Articulacao** (dentro de `p.content[]` dos dispositivos) — 13.842 referencias no corpus
3. **Preâmbulo** — nenhuma referencia encontrada no corpus (o preâmbulo e sempre autocontido)

### 8.2 Remissoes Externas

Remissoes externas apontam para outros documentos normativos. Usam URNs LexML completas no atributo `href`.

#### 8.2.1 Referencia a documento integral

Quando o `href` contem uma URN sem o separador `!`, a remissao aponta para o documento como um todo:

```json
{
  "name": { "localPart": "span" },
  "value": {
    "TYPE_NAME": "br_gov_lexml__1.GenInline",
    "href": "urn:lex:br:federal:decreto.lei:1943-05-01;5452",
    "content": ["Decreto-Lei no 5.452, de 1 de maio de 1943"]
  }
}
```

**Exemplo compacto:** Um mesmo documento pode ser referenciado com diferentes textos visiveis:

| `href` | `content` (texto visivel) |
|--------|--------------------------|
| `urn:lex:br:federal:decreto.lei:1943-05-01;5452` | `"CLT"` |
| `urn:lex:br:federal:decreto.lei:1943-05-01;5452` | `"Decreto-Lei no 5.452, de 1 de maio de 1943"` |
| `urn:lex:br:federal:decreto.lei:1943-05-01;5452` | `"Consolidacao das Leis do Trabalho"` |

#### 8.2.2 Referencia a fragmento de documento

Quando o `href` contem o separador `!`, a remissao aponta para um dispositivo especifico dentro do documento referenciado:

```json
{
  "name": { "localPart": "span" },
  "value": {
    "TYPE_NAME": "br_gov_lexml__1.GenInline",
    "href": "urn:lex:br:federal:decreto.lei:1943-05-01;5452!art578",
    "content": ["art. 578 da Consolidacao das Leis do Trabalho"]
  }
}
```

**Estrutura do fragmento** (Parte 2, Secao 11):

```
urn:lex:br:federal:constituicao:1988-10-05;1988!art49_cpt_inc1
                                        ^                  ^
                                   separador !        ID do fragmento
```

O ID do fragmento segue a mesma regra de formacao dos IDs internos (Secao 3.3):

| Fragmento | Significado |
|-----------|-------------|
| `art49_cpt_inc1` | Inciso I do caput do art. 49 |
| `art49_cpt_inc5` | Inciso V do caput do art. 49 |
| `art150_cpt` | Caput do art. 150 |
| `art26` | Artigo 26 (integral) |
| `cpt` | Caput (sem especificacao de artigo) |

#### 8.2.3 Documentos mais referenciados

O corpus revela a concentracao de remissoes em um nucleo de normas fundamentais:

| Referencias | Documento | URN (base) |
|-------------|-----------|------------|
| 2.126 | Constituicao Federal de 1988 | `urn:lex:br:federal:constituicao:1988-10-05;1988` |
| 723 | Codigo Penal (DL 2.848/1940) | `urn:lex:br:federal:decreto.lei:1940-12-07;2848` |
| 546 | CLT (DL 5.452/1943) | `urn:lex:br:federal:decreto.lei:1943-05-01;5452` |
| 299 | EC 103/2019 | `urn:lex:br:federal:emenda.constitucional:2019-11-12;103` |
| 292 | ECA (Lei 8.069/1990) | `urn:lex:br:federal:lei:1990-07-13;8069` |
| 218 | LDB (Lei 9.394/1996) | `urn:lex:br:federal:lei:1996-12-20;9394` |
| 212 | CPC (Lei 13.105/2015) | `urn:lex:br:federal:lei:2015-03-16;13105` |
| 199 | CPP (DL 3.689/1941) | `urn:lex:br:federal:decreto.lei:1941-10-03;3689` |
| 184 | LC 101/2000 (LRF) | `urn:lex:br:federal:lei.complementar:2000-05-04;101` |
| 154 | Lei 11.340/2006 (Maria da Penha) | `urn:lex:br:federal:lei:2006-08-07;11340` |

**Autoridades referenciadas:**
- `federal` — 94,5% das referencias (normas federais)
- `senado.federal` — 0,97% (Regimento Interno do Senado)
- `congresso.nacional` — 0,08%
- `camara.deputados` — 0,05%

#### 8.2.4 Fragmentos mais referenciados

Os fragmentos mais visados nas remissoes a Constituicao Federal:

| Referencias | Fragmento | Dispositivo |
|-------------|-----------|-------------|
| 183 | `art49_cpt_inc1` | Inciso I do caput do art. 49 (competencia exclusiva do Congresso) |
| 112 | `art49_cpt_inc5` | Inciso V do caput do art. 49 (competencia para sustar atos do Poder Executivo) |
| 59 | `cpt` | Caput (sem especificacao de artigo — referencia generica) |

### 8.3 Remissoes Internas via `Alteracao`

O bloco `Alteracao` (Secao 3.4) implementa um sistema de remissoes internas que conecta o texto da proposicao ao dispositivo da norma que esta sendo modificada.

#### 8.3.1 Arquitetura da referencia interna

```
Proposicao (documento atual)          Norma alterada (documento externo)
===========================          ==================================

Art. 1o (dispositivo da              
  proposicao)                         
  |                                   
  +-- Caput                           
       |                              
       +-- alteracao                  
            |-- base: "urn:...lei;11482"  <-- referencia a norma alterada
            |                              
            +-- Artigo                    
                 |-- href: "art1"         <-- referencia ao art. 1 da norma alterada
                 |-- id: "art1_cpt_alt1_art1"
                 |                                
                 +-- Caput                   
                      |-- href: "art1_cpt"  <-- referencia ao caput do art. 1
                      |   id: "art1_cpt_alt1_art1_cpt"
```

**A logica e:**
1. `base` identifica a **norma alterada** (URN completa)
2. `href` em cada dispositivo interno identifica o **dispositivo-alvo** na norma alterada (ID relativo, sem URN)
3. `id` identifica o **dispositivo no documento da proposicao** (ID absoluto dentro do documento atual)

#### 8.3.2 Exemplo completo de remissao em alteracao

Exemplo real extraido de PEC_2023_00001, que altera a Constituicao Federal:

```json
"alteracao": {
  "TYPE_NAME": "br_gov_lexml__1.Alteracao",
  "base": "urn:lex:br:federal:constituicao:1988-10-05;1988",
  "id": "art1_cpt_alt1",
  "content": [
    {
      "name": { "localPart": "Artigo" },
      "value": {
        "TYPE_NAME": "br_gov_lexml__1.DispositivoType",
        "href": "art5",
        "id": "art1_cpt_alt1_art5",
        "abreAspas": "s",
        "rotulo": "Art. 5o",
        "lXcontainersOmissis": [
          {
            "name": { "localPart": "Caput" },
            "value": {
              "TYPE_NAME": "br_gov_lexml__1.DispositivoType",
              "href": "art5_cpt",
              "id": "art1_cpt_alt1_art5_cpt",
              "textoOmitido": "s",
              "lXcontainersOmissis": [
                {
                  "name": { "localPart": "Omissis" },
                  "value": {
                    "TYPE_NAME": "br_gov_lexml__1.Omissis",
                    "id": "art1_cpt_alt1_art5_cpt_omi1"
                  }
                },
                {
                  "name": { "localPart": "Inciso" },
                  "value": {
                    "TYPE_NAME": "br_gov_lexml__1.DispositivoType",
                    "href": "art5_cpt_inc36",
                    "id": "art1_cpt_alt1_art5_cpt_inc36",
                    "rotulo": "XXXVI -",
                    "p": [...]
                  }
                }
              ]
            }
          }
        ]
      }
    }
  ]
}
```

**Interpretacao:**
- `base` = CF/88 — a norma sendo alterada
- Primeiro `Artigo` com `href: "art5"` — esta modificando o Art. 5 da CF
- `Caput` com `href: "art5_cpt"` e `textoOmitido: "s"` — o texto original do caput foi omitido (reticencias)
- `Inciso` com `href: "art5_cpt_inc36"` — novo conteudo sendo inserido no lugar do Inciso XXXVI
- Os `id`s locais (`art1_cpt_alt1_art5_cpt_inc36`) identificam estes dispositivos dentro da proposicao

#### 8.3.3 Normas mais alteradas

As normas mais frequentemente alvo de alteracoes no corpus:

| Alteracoes | Norma | Descricao |
|------------|-------|-----------|
| 241 | DL 2.848/1940 | Codigo Penal |
| 121 | CF/1988 | Constituicao Federal |
| 81 | Lei 8.069/1990 | ECA |
| 72 | DL 3.689/1941 | Codigo de Processo Penal |
| 71 | DL 5.452/1943 | CLT |
| 68 | Lei 9.394/1996 | LDB |
| 54 | Lei 13.105/2015 | CPC |
| 42 | Regimento Interno do Senado (1970) | Regimento do Senado |

### 8.4 Remissoes Internas a Propria Proposicao

Alem das remissoes externas e das remissoes via alteracao, existe um terceiro tipo: **remissoes internas**, quando um dispositivo referencia outro dispositivo da **mesma proposicao**, sem carater de alteracao.

#### 8.4.1 Exemplo de Uso

Um projeto de lei (PL) que nao altera nenhuma norma existente pode conter referencias internas:

> *"Os valores referidos no **art. 5** desta Lei serao atualizados conforme o **§ 1º do art. 10**."*

Neste caso:
- O Art. 15 referencia o Art. 5 e o § 1º do Art. 10
- Nao ha alteracao de norma externa — apenas referencia cruzada interna

#### 8.4.2 Mecanismo Especificado pelo LexML

Conforme a **Parte 3 - XML Schema (Secao 7)**, o LexML suporta referencias **absolutas ou relativas**:

> *"As referencias poderao ser absolutas ou relativas. Este ultimo caso ocorre quando o elemento `<Remissao>` esta codificado internamente ao elemento `<Alteracao>` ou `<Remissoes>`: no elemento remissao sera codificada a referencia relativa para o id do dispositivo apontado (`href="art1_par1"`), enquanto que no elemento `<Remissoes>` havera a referencia absoluta para a norma (`xml:base="urn:lex:br;sao.paulo:lei:2004-02-11;123:"`)."*

Para remissoes internas a propria proposicao, o mecanismo e:

**Em XML:**
```xml
<Remissao xlink:href="art5_cpt">art. 5</Remissao>
```

**Em JSON (formato do corpus):**
```json
{
  "name": { "localPart": "Remissao" },
  "value": {
    "TYPE_NAME": "br_gov_lexml__1.GenInline",
    "href": "art5_cpt",
    "content": ["art. 5"]
  }
}
```

#### 8.4.3 Exemplo Completo

```json
// Art. 15 de um PL que referencia o Art. 5 da mesma proposicao
{
  "name": { "localPart": "Artigo" },
  "value": {
    "TYPE_NAME": "br_gov_lexml__1.DispositivoType",
    "id": "art15",
    "rotulo": "Art. 15",
    "caput": {
      "id": "art15_cpt",
      "texto": "Os valores referidos no art. 5 serao atualizados conforme o § 1º do art. 10.",
      "p": [
        {
          "content": [
            "Os valores referidos no ",
            {
              "name": { "localPart": "Remissao" },
              "value": {
                "href": "art5_cpt",
                "content": ["art. 5"]
              }
            },
            " serao atualizados conforme o ",
            {
              "name": { "localPart": "Remissao" },
              "value": {
                "href": "art10_par1",
                "content": ["§ 1º do art. 10"]
              }
            },
            "."
          ]
        }
      ]
    }
  }
}
```

#### 8.4.4 Regras de Formacao

| Campo | Valor | Descricao |
|-------|-------|-----------|
| `href` | ID local puro | Identificador do dispositivo destino (ex: `art5_cpt`, `art10_par1`) |
| `content` | Texto visivel | Texto que aparece como hyperlink (ex: `"art. 5"`, `"§ 1º do art. 10"`) |
| `xml:base` | **Omitido ou vazio** | Indica que a referencia e local ao documento corrente |

**Importante:** A remissao interna **nao** deve conter URN no `href` — apenas o ID do dispositivo. Isso diferencia de:
- **Remissao externa:** `href="urn:lex:br:federal:lei:1990-07-13;8069!art5"`
- **Remissao via alteracao:** `base="urn:lex:..."` + `href="art5"`

#### 8.4.5 Comparacao dos Tipos de Remissao

| Tipo | Elemento | `href` | Contexto |
|------|----------|--------|----------|
| **Externa** | `span` / `Remissao` | URN completa | `urn:lex:br:federal:lei:1990-07-13;8069!art5_cpt` |
| **Via Alteracao** | bloco `Alteracao` | ID relativo + `base` | `href="art5"` + `base="urn:lex:..."` |
| **Interna** | `span` / `Remissao` | **ID local puro** | `href="art5_cpt"` (sem URN, sem `base`) |

#### 8.4.6 Vantagens do Mecanismo

1. **Independencia da URN:** Durante a tramitacao, a proposicao ainda nao possui URN definitiva — o ID local funciona independentemente disso.

2. **Compatibilidade:** O mesmo parser que processa remissoes externas pode tratar IDs locais como ancoras internas.

3. **Consistencia:** Usa o mesmo sistema de IDs hierarquicos ja existente (`art5_cpt`, `art10_par1_inc2`).

4. **Validacao:** E possivel validar se o dispositivo referenciado existe no proprio documento.

### 8.5 Distincao entre Remissao e Alteracao

E importante distinguir os mecanismos de referencia:

| Aspecto | Remissao Externa | Remissao Interna | Alteracao |
|---------|------------------|------------------|-----------|
| **Finalidade** | Citar outro documento | Citar dispositivo da mesma proposicao | Modificar outra norma |
| **Elemento** | `span` / `Remissao` | `span` / `Remissao` | Bloco `Alteracao` |
| **`href`** | URN completa | ID local puro | ID relativo |
| **`base`** | Nao usado | Nao usado | URN da norma alterada |
| **Texto visivel** | `content` do span | `content` do span | `rotulo` do dispositivo |
| **Exemplo** | `urn:lex:br:federal:lei;8069!art5` | `art5_cpt` | `base="urn:..."` + `href="art5"` |

### 8.6 Contagem de Remissoes por Tipo de Proposicao

| Tipo | Arquivos com remissoes | Total de `href` |
|------|----------------------|-----------------|
| PL | 2.238 | Majoritario |
| MPV | 111 | Alto |
| PDL | 199 | Moderado |
| PLP | 157 | Moderado |
| PEC | 120 | Alto (CF/88 dominante) |
| PRS | 96 | Moderado |
| PRN | 2 | Baixo |

---

## 9. Resumo: Interoperabilidade de Dados Legislativos

A estrutura LexML facilita a interoperabilidade no ordenamento juridico brasileiro atraves de:

1. **URNs persistentes:** Identificadores univocos independentes de localizacao fisica, que permitem referencias estaveis entre documentos mesmo quando URLs mudam (Parte 2, Secao 1.1).

2. **Hierarquia formalizada:** A articulacao segue a LC 95/1998 com tipos rigidamente definidos, garantindo que qualquer sistema possa parsear e renderizar corretamente a estrutura hierarquica de normas (Parte 3, Secao 5.3-5.4).

3. **Referencias cruzadas semanticas:** O sistema de remissoes suporta tres tipos de referencias:
   - **Externas:** `span` com URN completa para outros documentos (Parte 3, Secao 7)
   - **Internas:** `span` com ID local para dispositivos da mesma proposicao (Parte 3, Secao 7.4)
   - **Via Alteracao:** bloco `Alteracao` com `base` + `href` relativo para modificar normas existentes (Parte 3, Secao 5.5)

4. **Suporte a alteracoes legislativas:** O bloco `Alteracao` com atributos `abreAspas`/`fechaAspas` e `notaAlteracao` permite representar fielmente o texto alterador e seu efeito sobre a norma original, suportando nova redacao, acrescimo e revogacao (Parte 3, Secao 5.5).

5. **Modelo FRBR OO:** A separacao em niveis de abstracao (obra complexa, obra individual, expressao) permite gerenciar versoes, visoes e o ciclo de vida completo de normas no tempo (Parte 1, Secoes 2-3).

6. **Serializacao multi-formato:** O mesmo modelo pode ser expresso em XML (conforme os Schemas XSD), JSON (como nos arquivos analisados) ou JSON-LD (conforme Schema.org/Legislation, mencionado no portal LexML).

---

## Referencias

- **Parte 1** - Modelo de Referencia: `https://projeto.lexml.gov.br/documentacao/Parte-1-Modelo-de-Referencia.pdf`
- **Parte 2** - LexML URN: `https://projeto.lexml.gov.br/documentacao/Parte-2-LexML-URN.pdf`
- **Parte 3** - XML Schema: `https://projeto.lexml.gov.br/documentacao/Parte-3-XML-Schema.pdf`
- **Portal LexML:** `https://projeto.lexml.gov.br`

### Schemas XSD Oficiais

- **Schema base (lexml-base.xsd):** `https://projeto.lexml.gov.br/esquemas/lexml-base.xsd` — Define os grupos de elementos (LXhier, LXcontainers, LXinline, LXmarker, HTMLinline, HTMLblock), tipos complexos (inline, hierarchy, blocksreq, etc.), elementos de remissao (Remissao, RemissaoMultipla) e a estrutura comum de documentos. Versao 1.5 (setembro 2011). Adaptado de Akoma Ntoso 1.0 e Norme in Rete 2.0.
- **Schema rigido (lexml-br-rigido.xsd):** `https://projeto.lexml.gov.br/esquemas/lexml-br-rigido.xsd` — Redefine tipos do base para seguir a LC 95/1998. Declara os elementos concretos (Parte, Livro, Titulo, Capitulo, Secao, Subsecao, Artigo, Caput, Paragrafo, Inciso, Alinea, Item, Omissis) via substitution groups. Documentos validos no rigido tambem sao validos no flexivel.
