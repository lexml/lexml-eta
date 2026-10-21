# Vocabulário de URN: conceitos, estrutura e requisitos

Rascunho para definir a estrutura e os requisitos do vocabulário (issue #1026). Parte do que o código faz hoje (`src/model/lexml/documento/vocabulario/` e `urnUtil.ts`) e registra as **decisões já tomadas** e os **pontos ainda em aberto**.

> Leitura de 21/10/2026, com os módulos do vocabulário modificados e ainda não commitados (tipos desnecessários removidos, tipos de norma mantidos). `fakeUrns` e `siglas` ainda existem no código; a seção 4 descreve o modelo-alvo que os substitui.

## 1. Para que serve

O vocabulário responde a perguntas sobre a **identificação de documentos legislativos** (URN LexML) para o editor:

- Dada uma **sigla** informada pelo host (PL, PEC, MPV...), qual tipo e qual URN provisória criar para uma proposição nova? (`buildUrnProposicao`)
- Dada uma **URN**, qual é o tipo, o gênero, a sigla, a autoridade e o nome por extenso? (`getTipo`, `getSigla`, `getAutoridade`, `getNomeExtenso`)
- Qual **texto padrão de preâmbulo** o documento recebe? (`getPreambuloPadrao`)
- Quais tipos podem ser a **referência de um substitutivo**?
- Quais **normas notórias** têm nome próprio (Constituição, CLT, regimentos)? (`atalhosUrn`)

## 2. Anatomia de uma URN

```
urn:lex:br:senado.federal:projeto.lei;pl:2026;12@apresentacao.substitutivo
           └ autoridade ┘ └─ tipo ───┘ └sigla┘ └ano┘└nº┘ └ evento ┘
```

| Parte | Exemplo | Observação |
|---|---|---|
| Autoridade | `senado.federal` | Quem edita o ato. |
| Tipo do documento | `projeto.lei` | Sem a sigla. |
| Sigla do tipo | `;pl` | Parte do segmento de tipo (`projeto.lei;pl`); a sigla no vocabulário é maiúscula, na URN é minúscula. |
| Data/ano e número | `2026;12` | Proposição nova usa o ano corrente e `999999`. |
| Evento | `@apresentacao.substitutivo` | Versão do texto no processo legislativo (substitutivo do SF). |

## 3. Conceitos

### 3.1 Casa legislativa do editor e vocabulário

O editor trabalha em **um** de dois modos, definido pelo host na inicialização pela propriedade **`casaLegislativaEditor`** (`SF`, padrão, ou `CD`). Ela seleciona o vocabulário e diferencia as regras do Senado e da Câmara. Não confundir com `casaLegislativa`, que continua como está e representa a casa legislativa **do documento** (colegiado apreciador; admite `CN`).

| `casaLegislativaEditor` | Editor | Autoridades do vocabulário |
|---|---|---|
| `SF` (padrão) | LexEdit | `senado.federal`, `congresso.nacional`, `federal` |
| `CD` | Infoleg Editor | `camara.deputados`, `congresso.nacional`, `federal` |

O **vocabulário mesclado é um por casa**: o do SF não contém nada da CD, e vice-versa. O editor admite **uma só instância do componente por página**, então o vocabulário mesclado fica em uma **variável estática**, inicializada pelo `LexmlEtaComponent` a partir de `LexmlEtaConfig.casaLegislativaEditor`; as funções de `urnUtil` o consultam sem recebê-lo por parâmetro. A casa vem só do host, nunca da URN (a sigla da URN depende do vocabulário). Os módulos por autoridade continuam sendo as peças (`congresso` e `federal` entram nas duas casas).

### 3.2 Autoridade

Quem emite o documento. Cada autoridade é um módulo (`federal.ts`, `senado.ts`, `camara.ts`, `congresso.ts`) cujos itens são carimbados com `urnAutoridade` na mesclagem.

| URN | Descrição | Uso típico |
|---|---|---|
| `federal` | Federal | MPV |
| `senado.federal` | Senado Federal | Projetos do SF |
| `camara.deputados` | Câmara dos Deputados | Projetos da CD |
| `congresso.nacional` | Congresso Nacional | PDN, PRN, PLV |

### 3.3 Tipo de documento (`tiposDocumento`)

Cadastro dos tipos de documento: **proposições** (têm sigla) e **normas** (`lei`, `decreto`, `constituicao`...; sem sigla, usadas para referenciar). Sigla, `ativo`, `tipoRelacaoSubstitutivo` e `tiposReferenciaveis` só se aplicam a proposições. **Chave** no vocabulário mesclado: `urnAutoridade` + `urnTipoDocumento` + `sigla` (sigla opcional). A URN do tipo (`projeto.lei;pl`) é **calculada**, nunca digitada: `urnTipoDocumento` + `;` + `sigla` em minúsculas.

| Atributo | Descrição |
|---|---|
| `urnTipoDocumento` | Tipo sem sigla (`projeto.lei`). |
| `sigla` | Sigla em maiúsculas (`PL`); opcional. |
| `descricao` | Usada no nome por extenso e na epígrafe. |
| `genero` | `M`/`F`, para concordância. |
| `ativo` | Booleano, padrão `true` (proposições). Inativos (PLS, PLC...) só servem para referenciar, nunca para criar documento novo. |
| `tipoRelacaoSubstitutivo` | `aceita substitutivo` \| `não aceita substitutivo` \| `é substitutivo` \| `é subemenda substitutiva`. |
| `tiposReferenciaveis` | Chaves dos tipos que podem ser a referência do substitutivo (ver 3.5). |

Invariantes: **sigla única entre os tipos ativos**; sigla pode se repetir entre inativos; toda referência de `tiposReferenciaveis` aponta para um tipo existente.

### 3.4 Sigla

Não há mais tabelas de sigla à parte: a sigla é atributo do tipo.

- **Sigla → tipo** (nova proposição, C2): procura-se o tipo **ativo** com aquela sigla; a URN nova sai da autoridade e do tipo dele. Substitui `fakeUrns`.
- **URN → sigla**: identifica-se o segmento de tipo da URN (`projeto.lei;pl`) no vocabulário. Substitui `siglas` (cujas quatro entradas nunca casavam por causa da convenção de chave).

### 3.5 Substitutivo e tipos de referência

Só o tipo **ativo** é "selecionado" na criação; os tipos de referência podem ser ativos ou inativos.

| Tipo selecionado | Candidatos a referência | Fonte |
|---|---|---|
| `aceita substitutivo` (SF) | As siglas que ele pode substituir (ex.: PL → PL, PLS, PLC) | Lista declarada em `tiposReferenciaveis` (RN-00a) |
| `aceita substitutivo` (CD) | Todos os tipos que aceitam substitutivo | Derivável |
| `é substitutivo` (CD, `sbt`) | Tipos que aceitam substitutivo | RN-12 |
| `é subemenda substitutiva` (CD, `pep`) | Tipos que são substitutivos — **a confirmar** | Seção 5 do caso de uso |
| `não aceita substitutivo` | Nenhum | RN-01 |
| PLV | MPV, fixa (RN-03) | Fora de C3 |

Regra de modelagem proposta: `tiposReferenciaveis` é a fonte declarada no tipo; a mesclagem preenche o que é derivável (CD) e **valida** que toda referência existe e aceita substitutivo.

### 3.6 Preâmbulo padrão (`preambulosPadrao`)

Texto inicial do preâmbulo, escolhido por **tipo (sem sigla) + autoridade da URN**, sem fallback: URN fora da tabela fica sem texto padrão. Os textos estão no código; a distribuição por autoridade está na D4 da change.

### 3.7 Atalhos de URN (`atalhosUrn`) e eventos (`eventos`)

- `atalhosUrn`: normas notórias com URN fixa e nome próprio (Constituição, ADCT, CLT, Regimento Interno do SF, Regimento Comum). Alimenta o nome por extenso e o autocomplete.
- `eventos`: versão do texto no processo legislativo (`@apresentacao.substitutivo`...), com gênero.

Ambos são hoje do vocabulário **comum** (válidos nas duas casas); ver ponto em aberto 7.

## 4. Modelo-alvo e consultas

### 4.1 Estrutura

```ts
interface TipoDocumento {            // item de uma autoridade
  urnTipoDocumento: string;          // 'projeto.lei'
  sigla?: string;                    // 'PL'
  descricao: string;
  genero: string;
  ativo?: boolean;                   // padrão true
  tipoRelacaoSubstitutivo?: ...;
  tiposReferenciaveis?: ChaveTipo[];
}
// Mesclado (por casa), calculado em mesclar():
//   tiposDocumento:        TipoDocumento + urnAutoridade + urn
//   tiposDocumentoAtivos:  só os ativos, já com tiposReferenciaveis resolvidos
```

Removidos: `fakeUrns`, `siglas`. Mantidos: `autoridades`, `preambulosPadrao`, `atalhosUrn`, `eventos`. `tiposDocumentoAtivos` é **derivado** na mesclagem (a fonte única continua sendo `tiposDocumento` + `ativo`).

### 4.2 Consultas

| # | Consulta | Entrada | Saída |
|---|---|---|---|
| C1 | Listar tipos ativos (ou inativos) | vocabulário, filtro `ativo` | tipos de documento |
| C2 | Identificar o tipo pela sigla | vocabulário, sigla | o tipo **ativo** com a sigla; vazio se não houver |
| C3 | Tipos de referência do substitutivo | vocabulário, tipo ativo selecionado | tipos (ativos e inativos); vazio para `não aceita substitutivo` |
| C4 | Identificar o tipo pela URN | vocabulário, URN | tipo (autoridade + segmento de tipo, incluindo inativos) |

## 5. Divergências do código atual

1. `fakeUrns` e `siglas` ainda existem; `fakeUrns` do Senado ainda cita `SCD` e `ECD`, cujos tipos já foram removidos. Somem com o modelo-alvo.
2. As tabelas hoje usam `urn` (com sigla) em `tiposDocumento` e tipo sem sigla em `siglas`/`preambulosPadrao`; no modelo-alvo, `urnTipoDocumento` + `sigla` separados.
3. `getTipo`, `getTipoDocumentoUrn` e `getSigla` usam o helper `procurarPorAutoridade` (fallback por autoridade). Com a chave incluindo a autoridade, o fallback sai (RV-16).
4. `VOCABULARIO` é uma constante de módulo; o alvo é uma variável estática inicializada por `casaLegislativaEditor`.

## 6. Requisitos (rascunho)

- **RV-01** O vocabulário SHALL ser declarado por autoridade e mesclado **por casa legislativa** (`SF`, `CD`); o vocabulário de uma casa SHALL NOT conter tipos exclusivos da outra.
- **RV-02** O vocabulário mesclado SHALL ficar em uma variável estática, inicializada uma vez com `casaLegislativaEditor` (uma instância do componente por página); a casa SHALL vir só do host.
- **RV-03** Todo tipo SHALL ter `urnAutoridade` após a mesclagem; a chave é `urnAutoridade` + `urnTipoDocumento` + `sigla` (opcional).
- **RV-04** A URN do tipo SHALL ser calculada (`urnTipoDocumento;sigla` em minúsculas), nunca declarada.
- **RV-05** A sigla SHALL ser única entre os tipos ativos do vocabulário mesclado; a mesclagem SHALL falhar quando violada.
- **RV-06** Cada tipo SHALL declarar `ativo` (padrão `true`); só tipos ativos criam documento novo (C2).
- **RV-07** O vocabulário SHALL listar os tipos ativos e, separadamente, os inativos (C1).
- **RV-08** O vocabulário SHALL identificar o tipo pela sigla (C2) e pela URN (C4), devolvendo o tipo e não só a URN.
- **RV-09** Dado um tipo ativo, o vocabulário SHALL devolver os tipos (ativos e inativos) que podem ser a referência do substitutivo, segundo a tabela 3.5 (C3); a lista é vazia para `não aceita substitutivo`.
- **RV-10** A mesclagem SHALL validar que toda referência de `tiposReferenciaveis` existe e aceita substitutivo.
- **RV-11** O preâmbulo padrão SHALL ser escolhido por tipo (sem sigla) + autoridade da URN, sem fallback.
- **RV-12** A nova proposição de MPV SHALL ter autoridade `federal` e a de PLV, `congresso.nacional`; a URN antiga de MPV (`senado.federal`) deixa de ser gerada.
- **RV-13** Os testes de vocabulário e de `urnUtil` SHALL rodar para as duas casas (SF e CD), reinicializando o vocabulário estático a cada caso.
- **RV-16** `getTipo`, `getTipoDocumentoUrn` e `getSigla` SHALL resolver pela autoridade exata da URN, sem fallback para outra autoridade; URN cuja autoridade+tipo não esteja no vocabulário da casa não resolve.
- **RV-14** A sigla SHALL existir apenas em tipos de proposição.
- **RV-15** `casaLegislativaEditor` (em `LexmlEtaConfig`) SHALL ser `SF` ou `CD`; ausente ou inválida, assume `SF` com aviso; `casaLegislativa` (casa do documento) permanece independente dela.

## 7. Decisões tomadas e pontos em aberto

**Decididos:**

- `casaLegislativaEditor` (`SF`/`CD`, padrão `SF`) seleciona o vocabulário; `casaLegislativa` segue como casa do documento, inclusive com `CN`.
- A casa vem do host, não da URN (resolve a dependência circular com `getSigla`).
- Uma instância do componente por página; vocabulário em variável estática (sem parâmetro nas ~20 chamadas de `urnUtil` fora do módulo).
- Tipos de norma permanecem no vocabulário; sigla só para proposições.
- MPV tem autoridade `federal` (`caso-de-uso-nova-proposicao.md` e `pendencias.md` já ajustados).
- Referência da subemenda substitutiva (`pep`): tipos substitutivos (inferência aceita).
- `atalhosUrn` permanecem no vocabulário comum.
- `tiposReferenciaveis` do SF serão preenchidos depois pelo negócio.

- Resolução de tipos **sempre pela autoridade exata** da URN, sem fallback para outra autoridade (vale para proposições e normas). Cada norma referenciável precisa estar declarada na autoridade correspondente; `camara.deputados:lei` não existe e `camara.deputados:resolucao` foi adicionada.
- `decreto.legislativo` e `resolucao` permanecem duplicados entre autoridades (cópias com descrição e gênero idênticos).
- `casaLegislativaEditor` ausente ou inválida cai em `SF`, com aviso.
- Inicialização: o `LexmlEtaComponent` lê `LexmlEtaConfig.casaLegislativaEditor` e inicializa o vocabulário estático.

- O vocabulário estático é (re)inicializado sempre que `LexmlEtaComponent.lexmlEtaConfig` é atribuída.
- Norma citada com autoridade ausente do vocabulário da casa fica **sem resolver** (sem tratamento especial).

**Fora do escopo desta change:**

- Concordância de gênero do preâmbulo da MPV (fica sem concordância) e tipos sem texto padrão (herdado da change anterior).
- "Sigla da casa legislativa" no vocabulário (item da #1026): coberta por `casaLegislativaEditor`.

**Em aberto:** nenhum.

## 8. Referências

- `src/model/lexml/documento/vocabulario/` e `src/model/lexml/documento/urnUtil.ts`
- `src/components/lexml-eta.component.ts` (`casaLegislativa`, `inicializaCasaLegislativa`; ponto de entrada de `casaLegislativaEditor`)
- `openspec/changes/2026-10-19-c02-separar-vocabulario-por-autoridade/`
- `docs/requisitos/caso-de-uso-nova-proposicao.md` (seções 1, 4, 5 e 6) e `docs/requisitos/pendencias.md`
- `docs/estrutura-lexml.md` (formato da URN LexML)
