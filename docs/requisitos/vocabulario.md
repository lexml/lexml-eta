# Vocabulário de URN: conceitos, estrutura e requisitos

Estrutura e requisitos do vocabulário de URN (issue #1026), conforme implementado em `src/model/lexml/documento/vocabulario/` e `urnUtil.ts`.

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

Os módulos por autoridade são mesclados em **duas visões**, ambas em variáveis estáticas (o editor admite **uma só instância do componente por página**), consultadas pelas funções de `urnUtil` e de `consultasVocabulario` sem parâmetro:

- **Visão da casa** (`getVocabularioDaCasa()`): as autoridades da tabela acima. O vocabulário do SF não contém nada da CD, e vice-versa. É inicializada pelo `LexmlEtaComponent` a partir de `LexmlEtaConfig.casaLegislativaEditor` (`inicializarVocabulario(casa)`, que reaproveita a visão quando a casa é a mesma). Atende às consultas **sem autoridade**: sigla, listagens e tipos de referência do substitutivo.
- **Visão completa** (`getVocabularioCompleto()`): as quatro autoridades, montada uma vez e independente da casa. Atende às consultas **que partem de uma URN** (`getTipo`, `getSigla`, `getAutoridade`, `getTipoDocumentoUrn`, `getPreambuloPadrao`, nomes por extenso, `validaUrn`, `atalhosUrn`), para que uma norma da outra casa citada ou alterada (ex.: o Regimento Interno da Câmara no editor do SF) resolva e seja válida.

A casa vem só do host, nunca da URN (a sigla da URN depende do vocabulário). `congresso` e `federal` entram nas duas casas.

**Documento da outra casa:** abrir para edição um documento cuja URN seja de autoridade fora da visão da casa é **recusado** (`verificarUrnDaCasaDoEditor`), com a mensagem "Documento de outra casa legislativa não é suportado neste editor", antes de qualquer alteração do editor — em `lerDocumentoArticulado` (abertura de arquivo) e em `novaProposicao` (URN recebida do host), que além disso só aceita proposição suportada (ver a spec `interface-lexml-eta`). A abertura de documento da outra casa fica fora do escopo atual e pode ser retomada oportunamente.

### 3.2 Autoridade

Quem emite o documento. Cada autoridade é um módulo (`vocabularioFederal.ts`, `vocabularioSenado.ts`, `vocabularioCamara.ts`, `vocabularioCongresso.ts`) cujos itens são carimbados com `urnAutoridade` na mesclagem. A `sigla` opcional é a casa responsável pelas proposições da autoridade (`getCasaLegislativaResponsavel`).

| URN | Descrição | Sigla | Uso típico |
|---|---|---|---|
| `federal` | Federal | — | MPV |
| `senado.federal` | Senado Federal | `SF` | Projetos do SF |
| `camara.deputados` | Câmara dos Deputados | `CD` | Projetos da CD |
| `congresso.nacional` | Congresso Nacional | `CN` | PDN, PRN, PLV |

**Proposição suportada:** URN cujo tipo resolvido é uma proposição (com sigla, ativa ou inativa) da visão da casa, de autoridade com sigla. É a única aceita na criação de proposição (`verificarUrnParaNovaProposicao`); as demais (MPV, normas) são do tipo "não suportado" (`isTipoDocumentoNaoSuportado`), abertas sem edição de destino e autoria e salvas com a pendência de documento não suportado.

### 3.3 Tipo de documento (`tiposDocumento`)

Cadastro dos tipos de documento: **proposições** (têm sigla) e **normas** (`lei`, `decreto`, `constituicao`...; sem sigla, usadas para referenciar). Sigla, `ativo`, e `tipoRelacaoSubstitutivo` só se aplicam a proposições. **Chave** no vocabulário mesclado: `urnAutoridade` + `urnTipoDocumento` + `sigla` (sigla opcional). A URN do tipo (`projeto.lei;pl`) é **calculada**, nunca digitada: `urnTipoDocumento` + `;` + `sigla` em minúsculas.

| Atributo | Descrição |
|---|---|
| `urnTipoDocumento` | Tipo sem sigla (`projeto.lei`). |
| `sigla` | Sigla em maiúsculas (`PL`); opcional. |
| `descricao` | Usada no nome por extenso e na epígrafe. |
| `genero` | `M`/`F`, para concordância. |
| `ativo` | Booleano, padrão `true` (proposições). Inativos (PLS, PLC...) só servem para referenciar, nunca para criar documento novo. |
| `tipoRelacaoSubstitutivo` | `aceita substitutivo` \| `não aceita substitutivo` \| `é substitutivo` \| `é subemenda substitutiva`. |

Invariantes: **sigla única entre os tipos ativos de cada casa** (na visão completa, PL, PLP e PEC ativos se repetem entre Senado e Câmara); sigla pode se repetir entre inativos.

### 3.4 Sigla

A sigla é atributo do tipo.

- **Sigla → tipo** (nova proposição, C2): procura-se o tipo **ativo** com aquela sigla; a URN nova sai da autoridade e do tipo dele.
- **URN → tipo/sigla** (C4): casa-se a autoridade e o segmento de tipo da URN. O segmento pode vir **com ou sem sigla** e as duas formas são válidas: `senado.federal:projeto.lei;pl` e `senado.federal:projeto.lei` resolvem para o mesmo tipo ativo (PL); `federal:medida.provisoria` e `federal:medida.provisoria;mpv`, para MPV. Com sigla, vale a entrada exata (inclusive inativa: `projeto.lei;pls`); sem sigla, e quando não for uma norma declarada, vale o tipo **ativo** com sigla da mesma autoridade. A autoridade continua obrigatória.

### 3.5 Substitutivo

O documento é **substitutivo** quando o `tipoRelacaoSubstitutivo` do seu tipo é `é substitutivo` (CD, `sbt`), ou quando é `aceita substitutivo` e a URN apresenta um evento com `substitutivo = 's'` (ex.: `urn:lex:br:senado.federal:projeto.lei;pl:2026;12@apresentacao.substitutivo`). Nos demais casos, inclusive `é subemenda substitutiva` (CD, `pep`) e `não aceita substitutivo`, não é. O evento é o trecho da URN após o `@`, até o primeiro `;`, comparado com a `urn` dos `eventos` do vocabulário comum. A consulta parte da URN (C3, visão completa); tipo não resolvido resulta em falso.

Os tipos de referência de um substitutivo não fazem parte do vocabulário (removidos na issue #1056).

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
}
// Mesclado (visão da casa ou completa), calculado em mesclar():
//   tiposDocumento:        TipoDocumento + urnAutoridade + urn
//   tiposDocumentoAtivos:  só as proposições ativas
```

O vocabulário mesclado também tem `autoridades`, `preambulosPadrao`, `atalhosUrn` e `eventos`. `tiposDocumentoAtivos` é **derivado** na mesclagem (a fonte única é `tiposDocumento` + `ativo`).

### 4.2 Consultas

| # | Consulta | Visão | Entrada | Saída |
|---|---|---|---|---|
| C1 | Listar tipos ativos (ou inativos) | da casa | filtro `ativo` | tipos de documento |
| C2 | Identificar o tipo pela sigla | da casa | sigla | o tipo **ativo** com a sigla; vazio se não houver |
| C3 | Identificar substitutivo pela URN (`isSubstitutivo`) | completa | URN | booleano (seção 3.5) |
| C4 | Identificar o tipo pela URN | completa | URN | tipo (autoridade + segmento de tipo, incluindo inativos) |

## 5. Requisitos

- **RV-01** O vocabulário SHALL ser declarado por autoridade e mesclado em duas visões: a **da casa** (`SF`, `CD`), que SHALL NOT conter tipos exclusivos da outra casa e atende às consultas sem autoridade (C1-C2), e a **completa**, com todas as autoridades, que atende às consultas por URN (C3-C4, preâmbulo, nomes por extenso, `validaUrn`).
- **RV-02** As visões SHALL ficar em variáveis estáticas: a da casa, inicializada com `casaLegislativaEditor` a cada atribuição de `lexmlEtaConfig` (sem remontar quando a casa não muda); a completa, montada uma vez. A casa SHALL vir só do host.
- **RV-03** Todo tipo SHALL ter `urnAutoridade` após a mesclagem; a chave é `urnAutoridade` + `urnTipoDocumento` + `sigla` (opcional).
- **RV-04** A URN do tipo SHALL ser calculada (`urnTipoDocumento;sigla` em minúsculas), nunca declarada.
- **RV-05** A sigla SHALL ser única entre os tipos ativos da visão de cada casa; a mesclagem SHALL falhar quando violada. A visão completa valida só a chave duplicada e dispara a validação das duas casas.
- **RV-06** Cada tipo SHALL declarar `ativo` (padrão `true`); só tipos ativos criam documento novo (C2).
- **RV-07** O vocabulário SHALL listar os tipos ativos e, separadamente, os inativos (C1).
- **RV-08** O vocabulário SHALL identificar o tipo pela sigla (C2) e pela URN (C4), devolvendo o tipo e não só a URN.
- **RV-09** O vocabulário SHALL informar, a partir da URN, se o documento é substitutivo (C3), segundo a seção 3.5; tipo não resolvido, subemenda substitutiva e tipo que não aceita substitutivo resultam em falso.
- **RV-10** (removido na issue #1056) `tiposReferenciaveis` deixou de existir.
- **RV-11** O preâmbulo padrão SHALL ser escolhido por tipo (sem sigla) + autoridade da URN; combinação fora da tabela não tem texto.
- **RV-12** A nova proposição de MPV SHALL ter autoridade `federal` e a de PLV, `congresso.nacional`.
- **RV-13** Os testes de vocabulário e de `urnUtil` SHALL rodar para as duas casas (SF e CD), reinicializando o vocabulário estático a cada caso.
- **RV-14** A sigla SHALL existir apenas em tipos de proposição.
- **RV-15** `casaLegislativaEditor` (em `LexmlEtaConfig`) SHALL ser `SF` ou `CD`; ausente ou inválida, assume `SF` com aviso; `casaLegislativa` (casa do documento) permanece independente dela.
- **RV-16** `getTipo`, `getTipoDocumentoUrn` e `getSigla` SHALL resolver pela autoridade exata da URN na visão completa, sem usar outra autoridade; URN da outra casa resolve, e URN cuja autoridade+tipo não esteja em nenhuma autoridade não resolve.
- **RV-17** O segmento de tipo da URN SHALL poder vir com ou sem sigla: sem sigla, e não sendo norma declarada, resolve para o tipo **ativo** com sigla da mesma autoridade (`senado.federal:projeto.lei` e `senado.federal:projeto.lei;pl` apontam para PL; `federal:medida.provisoria` e `federal:medida.provisoria;mpv`, para MPV).
- **RV-18** Iniciar a edição de um documento com URN recebida (arquivo ou host) de autoridade fora da visão da casa SHALL falhar com a mensagem de documento de outra casa, antes de qualquer alteração do documento em edição; a proposição nova pela sigla SHALL NOT ser afetada.

## 6. Decisões

- `casaLegislativaEditor` (`SF`/`CD`, padrão `SF`) seleciona o vocabulário; `casaLegislativa` é a casa do documento e admite `CN`.
- A casa vem do host, não da URN (a sigla da URN depende do vocabulário).
- Uma instância do componente por página; o vocabulário é estático, sem parâmetro nas chamadas de `urnUtil`.
- Tipos de norma ficam no vocabulário, sem sigla, para referenciar; cada norma referenciável é declarada na autoridade que a emite.
- `decreto.legislativo` e `resolucao` aparecem em mais de uma autoridade, com descrição e gênero idênticos. Senado e Câmara não precisam ter tipos correspondentes.
- MPV tem autoridade `federal`; PLV, `congresso.nacional`.
- Referência da subemenda substitutiva (`pep`): os tipos substitutivos.
- `atalhosUrn` e `eventos` são do vocabulário comum.
- Norma citada ou alterada com autoridade da outra casa resolve pela visão completa; autoridade desconhecida fica sem resolver, sem tratamento especial.
- Documento da outra casa é recusado ao abrir; a abertura para edição fica fora do escopo atual (exigiria definir a casa do documento, as listas de parlamentares e comissões e o tratamento da sigla).
- A Câmara tem PRC (Projeto de Resolução, aceita substitutivo).
- A marcação definitiva de `ativo` dos tipos que aceitam substitutivo depende do negócio.

**Fora do escopo:** concordância de gênero do preâmbulo da MPV e tipos sem texto padrão.
## 7. Referências

- `src/model/lexml/documento/vocabulario/` e `src/model/lexml/documento/urnUtil.ts`
- `src/components/lexml-eta.component.ts` (`casaLegislativa`, `inicializaCasaLegislativa`; ponto de entrada de `casaLegislativaEditor`)
- `openspec/changes/2026-10-19-c02-separar-vocabulario-por-autoridade/` e `openspec/changes/2026-10-22-c01-vocabulario-visao-completa-e-da-casa/`
- `docs/requisitos/componente-nova-proposicao.md` (seções 1, 4, 5 e 6) e `docs/requisitos/pendencias.md`
- `docs/estrutura-lexml.md` (formato da URN LexML)
