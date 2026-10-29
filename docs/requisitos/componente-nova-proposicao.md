# Componente: Nova proposição

Origem: anotações em `pendencias.md` (seções "Casos de uso do LexEdit/Infoleg Editor" e "Componente de criação de novo documento") e layout da Tela 1 em `layout-tela-1-componente-nova-proposicao.txt`. Itens ainda sem resposta das equipes de negócio estão em [Pontos em aberto](#7-pontos-em-aberto). Especificação testável: change `2026-10-26-c01-especificar-componente-nova-proposicao` (OpenSpec).

## 1. Descrição

O usuário cria uma nova proposição no editor. O componente coleta a identificação do documento (espécie, sigla, proposição referenciada, destino e forma de apresentação) e define o texto inicial da edição: vazio, importado de um arquivo (DOCX, TXT ou LexML), copiado da proposição referenciada ou copiado de outra proposição.

- **Ator:** usuário do LexEdit/Infoleg Editor.
- **Gatilho:** ação "Nova proposição".
- **Pré-condições:**
  - A aplicação host informa, na configuração, a casa legislativa do editor (`casaLegislativaEditor`), que define as autoridades permitidas (ver [Casa legislativa e autoridades](#casa-legislativa-e-autoridades)).
  - A aplicação host informa também as três URLs obrigatórias: de verificação da proposição, do texto estruturado e das comissões (ver [Contrato com o host](#9-contrato-com-o-host)). Sem qualquer uma delas, a inicialização falha.
  - O vocabulário de tipos de documento não precisa estar carregado: o componente o inicializa para a casa informada, ao ser criado e a cada nova configuração, como faz o `lexml-eta`, e usa em todo o fluxo apenas o vocabulário da casa (`getVocabularioDaCasa()`; ver [Vocabulário](#5-vocabulário-de-tipos-de-documento)). Manter a mesma casa no componente e no `lexml-eta` é responsabilidade do editor (host).
- **Pós-condição (sucesso):** o componente devolve ao host, por evento (`nova-proposicao-concluida`), o resultado com a URN do novo documento, a `urnDocumentoReferenciado` (quando houver), a epígrafe e o preâmbulo, o colegiado de destino, o texto inicial escolhido (quando parte de documento existente) e a forma de apresentação (`anexoParecer`) (ver [Contrato com o host](#9-contrato-com-o-host)). O componente não cria o documento: quem abre a edição é o host.
- **Pós-condição (cancelamento):** o componente emite o evento próprio `nova-proposicao-cancelada`, sem resultado, e descarta os dados informados.

### Casa legislativa e autoridades

A aplicação informa a casa legislativa do editor (`casaLegislativaEditor`); o editor deriva daí as autoridades. O componente trabalha só com o vocabulário da casa (`getVocabularioDaCasa()`), que não contém os tipos específicos da outra casa:

| Casa | Editor | Autoridades |
|---|---|---|
| `SF` | LexEdit | `senado.federal`, `congresso.nacional`, `federal` (só a MPV, e apenas como referência do PLV) |
| `CD` | Infoleg Editor | `camara.deputados`, `congresso.nacional`, `federal` (só a MPV, e apenas como referência do PLV) |

- **RN-00 — Siglas de nova proposição.** Na espécie Proposição, a lista de siglas contém os tipos das autoridades da casa (`senado.federal` ou `camara.deputados`, e `congresso.nacional`) que **não** são substitutivos nem subemendas substitutivas (`tipoRelacaoSubstitutivo` = `aceita substitutivo` ou `não aceita substitutivo`). A MPV (`federal`) não entra. Ordenação: tipos **ativos** primeiro e **inativos** depois, cada grupo em ordem alfabética da sigla. Os inativos aparecem em cinza e têm o tratamento da RN-18.
- **RN-00a — Siglas da proposição referenciada (substitutivo e subemenda).** A lista contém todas as siglas, ativas ou inativas, de tipos do vocabulário da casa com `tipoRelacaoSubstitutivo` = `aceita substitutivo`, independentemente do tipo do substitutivo, com a mesma ordenação e o mesmo destaque da RN-00 (ativas e inativas, cada grupo em ordem alfabética; inativas em cinza). A URN da proposição referenciada usa a autoridade do tipo escolhido. Não há atributo de "tipos referenciáveis" no vocabulário (removido na issue #1056).
- **RN-00b — PLV.** A referência é sempre a MPV (RN-03), única utilização da autoridade `federal`.

## 2. Fluxo principal

O fluxo tem duas telas, "Nova proposição" (passo 1) e "Nova proposição — texto inicial" (passo 2). Existe ainda uma terceira, de erro de conversão.

### Tela 1 — Identificação do documento

A tela é organizada em grupos (g1 a g6). Os grupos exibidos dependem da espécie escolhida em g1.

| Grupo | Conteúdo | Exibição |
|---|---|---|
| g1 — Espécie de documento | Seleção única: Proposição (padrão), Substitutivo, Subemenda substitutiva (só `CD`). | Sempre |
| g2 — Identificação do substitutivo (ou subemenda) | Sigla + `s/n` + ano (padrão: ano corrente). | Só `CD`, nas espécies Substitutivo e Subemenda substitutiva |
| g3 — Identificação da proposição | Sigla + número + ano. Em nova proposição: número `s/n`, sem **Verificar** e sem ementa. Em substitutivo ou subemenda: número editável, **Verificar** e ementa (somente leitura). | Sempre |
| g4 — Identificação da medida provisória | MPV (fixa) + número + ano (padrão: ano corrente), **Verificar** e ementa (somente leitura). | Só quando a espécie é Proposição e a sigla de g3 é PLV |
| g5 — Destino | Plenário ou Comissão; em Comissão, a comissão. | Sempre |
| g6 — Forma de apresentação | Caixa "Este documento será apresentado em parecer". | Sempre |

Botões: **Continuar**, **Cancelar**.

Regras da tela:

- **RN-01 — Espécie.** O tipo do documento deixa de ser uma lista própria e o indicativo de substitutivo deixa de existir na tela: a espécie (g1) e a sigla (g2 na `CD`; g3 nas demais situações) determinam o tipo. `tipoRelacaoSubstitutivo` só serve para filtrar as listas de siglas (RN-00, RN-00a e RN-19):

  | Espécie | Origem do tipo do documento |
  |---|---|
  | Proposição | sigla de g3 |
  | Substitutivo, `SF` | proposição de g3 (o substitutivo usa a URN dela com versão; RN-13) |
  | Substitutivo, `CD` | sigla de g2 (tipo com `tipoRelacaoSubstitutivo` = `é substitutivo`) |
  | Subemenda substitutiva, `CD` | sigla de g2 (tipo com `tipoRelacaoSubstitutivo` = `é subemenda substitutiva`) |

- **RN-02 — Proposição referenciada.** Em Substitutivo e Subemenda substitutiva, g3 identifica a proposição que recebe o documento; em Proposição, g3 identifica o próprio documento novo (sigla e ano; número `s/n`).
- **RN-03 — PLV.** O PLV não aceita substitutivo, mas exige a referência à Medida Provisória: em Proposição com sigla PLV em g3, o grupo g4 identifica a MPV (sigla MPV fixa), que vai em `urnDocumentoReferenciado`.
- **RN-04 — Verificar** (g3 em substitutivo ou subemenda, e g4). O botão é habilitado quando sigla, número e ano estão preenchidos. Ao acionar, verifica a existência do documento e, existindo, preenche a ementa.
- **RN-05 — Ementa.** Somente leitura. É apagada quando qualquer campo de identificação do grupo muda.
- **RN-06 — Continuar.** Só é permitido com a sigla escolhida (g3 e, na `CD` em substitutivo ou subemenda, também g2), com o destino válido (RN-19) e, quando a espécie exige referência (Substitutivo, Subemenda substitutiva ou PLV), com o documento referenciado verificado e existente.
- **RN-18 — Sigla inativa em nova proposição.** A sigla inativa é selecionável. Ao escolhê-la, exibe-se um alerta abaixo da seleção informando que a sigla está inativa e não deve ser usada para iniciar um texto novo. O alerta não bloqueia **Continuar** nem restringe as opções da Tela 2.
- **RN-19 — Destino (g5).** O padrão é Comissão em Substitutivo e Subemenda substitutiva, e Plenário nos demais casos. Não existe "Plenário via comissão". Em Comissão, a comissão é obrigatória e escolhida de uma lista obtida da URL de comissões da configuração; o placeholder de casa da URL é preenchido pela autoridade da URN do novo documento (`SF`, `CD` ou `CN` para `congresso.nacional`). Com falha na obtenção da lista, a opção Comissão fica indisponível (só Plenário), e o padrão em substitutivo passa a ser Plenário. No `SF`, o destino alimenta o sufixo opcional do serviço de epígrafe (5.1). O componente de destino do `lexml-eta` é reaproveitado, com os ajustes necessários; o `lexml-eta` deixa de ter esse componente (ver [Pontos em aberto](#7-pontos-em-aberto)).
- **RN-20 — Forma de apresentação (g6).** A caixa vem marcada em Substitutivo e Subemenda substitutiva e desmarcada em Proposição; o usuário pode alterá-la. O valor vai em `anexoParecer`.

### Tela 2 — Texto inicial para edição

Cabeçalho: "Novo(a) *\<identificação do novo documento\>*." (ver RN-08).

Pergunta: "Como você quer iniciar?" — opções (seleção única):

| # | Opção | Comportamento ao selecionar |
|---|---|---|
| 1 | Texto vazio | — |
| 2 | Importar documento (DOCX, TXT ou LexML) | Exibe o campo **Arquivo** (seleção de arquivo), que aceita DOCX, TXT e LexML, de até 5 MB. O LexML pode estar em XML ou em JSON (formato JSONIX, o mesmo usado pelo componente ao abrir um documento). |
| 3 | Texto do(a) *\<documento referenciado\>* | Só é oferecida em Substitutivo, Subemenda substitutiva ou PLV. Exibe o alerta "Texto estruturado não disponível para edição" quando for o caso. |
| 4 | Texto de outra proposição | Exibe sigla + número + ano, **Verificar**, o alerta de indisponibilidade e a ementa (somente leitura). Aceita qualquer sigla, ativa ou inativa. |

Botões: **Continuar**, **Voltar**, **Cancelar**.

Regras da tela:

- **RN-07 — Opção padrão.** Opção 3 em Substitutivo, Subemenda substitutiva ou PLV; opção 1 nos demais casos.
- **RN-08 — Identificação do novo documento** (usada nos cabeçalhos das telas 2 e 3):
  - Não substitutivo, não subemenda e não PLV: nome do tipo do documento.
  - PLV: "Projeto de Lei de Conversão (Medida Provisória nº *\<número\>* de *\<ano\>*)".
  - Substitutivo: "Substitutivo ao/à *\<tipo da proposição\>* nº *\<número\>* de *\<ano\>*".
  - Subemenda substitutiva (só na `CD`; o `SF` não a tem): "Subemenda Substitutiva ao/à *\<tipo da proposição\>* nº *\<número\>* de *\<ano\>*".
- **RN-09 — Texto estruturado indisponível.** Se o texto da proposição (opção 3 ou 4) não estiver disponível em formato estruturado, exibe-se o alerta e **Continuar** fica desabilitado apenas enquanto essa opção estiver escolhida; ao trocar para a opção 1 ou 2, **Continuar** é reabilitado.
- **RN-09a — Origem do texto (opções 3 e 4).** O texto trazido é o **texto original** da proposição, obtido de um serviço configurável (definido pelo host), e não o texto em tramitação mais recente (ver [Contrato com o host](#9-contrato-com-o-host)). O serviço só é consultado nas opções 3 e 4, ao **Continuar**.
- **RN-10 — Continuar**, conforme a opção:
  - Opção 1: conclui sem texto.
  - Opções 3 e 4: conclui com o texto da proposição escolhida.
  - Opção 2: executa o parser do arquivo. Se passar, conclui com o resultado; se falhar, segue para a Tela 3.
- **Voltar** retorna à Tela 1 preservando os dados informados.

### Tela 3 — Erro de conversão

Exibida apenas quando o parser do arquivo importado (DOCX, TXT ou LexML) falha.

Conteúdo:

- Cabeçalho "Novo(a) *\<identificação do novo documento\>*.".
- Mensagem "Ocorreram os seguintes erros na tentativa de conversão do *\<nome do arquivo\>*." seguida da lista de erros do parser.
- Orientação: "Você pode corrigi-los no documento e tentar novamente ou continuar para iniciar com um documento vazio."

Botões:

- **Continuar:** conclui com documento vazio.
- **Voltar:** retorna à Tela 2.
- **Cancelar:** fecha o componente sem resultado.

## 3. Fluxos alternativos

- **FA-01 — Cancelar** (em qualquer tela): descarta os dados informados e emite o evento de cancelamento, sem resultado.
- **FA-02 — Documento inexistente** (Verificar, telas 1 ou 2): informa que o documento não foi encontrado, mantém a ementa vazia e **Continuar** permanece desabilitado.
- **FA-03 — Arquivo com erros de conversão:** ver Tela 3.
- **FA-04 — Falha de comunicação** (verificação, texto ou comissões): informa o erro; a verificação e o texto permitem nova tentativa; a falha das comissões deixa só o Plenário (RN-19).

## 4. Identificação do documento (URN)

A identificação é composta por: autoridade, tipo do documento, data (ou apenas ano), número e versão. Em substitutivo, subemenda substitutiva e PLV o documento guarda também `urnDocumentoReferenciado` (a URN da proposição que recebe o documento ou da MPV).

Exemplos:

```
urn:lex:br:senado.federal:projeto.lei;pl:2026;999999
urn:lex:br:congresso.nacional:projeto.lei.conversao;plv:2026;999999
  urnDocumentoReferenciado: urn:lex:br:federal:medida.provisoria;mpv:2026;4321

urn:lex:br:senado.federal:projeto.lei;pl:2026;12@apresentacao.substitutivo
  urnDocumentoReferenciado: urn:lex:br:senado.federal:projeto.lei;pl:2026;12

urn:lex:br:camara.deputados:substitutivo;sbt:2026;999999
  urnDocumentoReferenciado: urn:lex:br:camara.deputados:projeto.lei;pl:2026;12
```

Sufixos de versão previstos: `@apresentacao.substitutivo`, `@aprovacao.substitutivo`, `@aprovacao.substitutivo.decisao.terminativa`.

- **RN-11 — Versão do substitutivo.** A identificação de substitutivo por sufixo de versão vale apenas para o `SF`: um substitutivo novo é sempre criado com `@apresentacao.substitutivo`. Os demais sufixos não são atribuídos por este componente.
- **RN-12 — Substitutivo e subemenda na `CD`.** A `CD` não usa sufixo de versão: tem tipos de documento específicos (ex.: `sbt`, subemenda substitutiva), com `tipoRelacaoSubstitutivo` = `é substitutivo` / `é subemenda substitutiva`, escolhidos em g2. A URN usa o tipo e o ano de g2, o número `999999` e nenhum sufixo.
- **RN-13 — Substitutivo do `SF`.** A URN é a mesma do documento de referência (g3), acrescida do sufixo `@apresentacao.substitutivo`; `urnDocumentoReferenciado` é a URN sem o sufixo.
- **RN-14 — Demais documentos (inclusive substitutivos da `CD` e PLV).** São criados com o ano corrente e o número `999999`, indicando documento ainda não numerado, e não recebem versão na URN (ex.: `urn:lex:br:senado.federal:projeto.lei;pl:2026;999999`). No substitutivo e na subemenda da `CD` e no PLV, o documento referenciado vai em `urnDocumentoReferenciado`.
- **RN-22 — Subemenda substitutiva.** Na `CD`, g3 identifica a proposição original (não o substitutivo); é ela que vai em `urnDocumentoReferenciado` e cujo texto a opção 3 da Tela 2 oferece. A referência ao substitutivo é implícita e não é coletada.
- **RN-21 — Reconhecimento de substitutivo.** `isSubstitutivo(urn)` (vocabulário, issue #1056) é verdadeiro para a URN do substitutivo do `SF` e da `CD`, e falso para a subemenda substitutiva e para os demais tipos. Serve de critério de verificação da URN gerada; a espécie vem de g1.

## 5. Vocabulário de tipos de documento

O componente depende dos seguintes atributos do tipo do documento (`vocabulario/`):

- **`tipoRelacaoSubstitutivo`:** `aceita substitutivo` | `não aceita substitutivo` | `é substitutivo` | `é subemenda substitutiva` (base das listas de siglas, RN-00, RN-00a e g2).
- **`ativo`** (booleano, padrão `true`): tipos inativos (ex.: PLS, PLC) aparecem ao final das listas, em cinza; em nova proposição são selecionáveis, com alerta (RN-18). Deve haver apenas uma entrada ativa por sigla + autoridade na visão de uma casa.
- **Modelo de preâmbulo** associado ao tipo (ver seção 5.2).
- **[backlog]** Permitir parametrizar o complemento do vocabulário.

### 5.1 Epígrafe

Os modelos de epígrafe (por tipo, substitutivo, subemenda substitutiva e PLV) não são listados aqui: pertencem ao serviço de epígrafe do vocabulário, especificado e implementado na issue #1053.

- **Serviço de epígrafe.** O componente usa o serviço do vocabulário (entrada: `urn`, `urnDocumentoReferenciado` e um **sufixo opcional**) quando ele já estiver implementado. No `SF`, o componente sempre informa o sufixo: `- PLEN` quando o destino é Plenário e `- <sigla da comissão>` quando é Comissão (ex.: `- CCJ`); na `CD`, não informa sufixo. Enquanto não estiver, o componente gera a epígrafe do **caso padrão** (sem sufixo), com o número em branco (o documento nasce não numerado, RN-14) e o ano corrente: `<TIPO DO DOCUMENTO POR EXTENSO EM MAIÚSCULAS> Nº   , DE <ANO>` (ex.: PROJETO DE LEI COMPLEMENTAR Nº    , DE 2026). Quando o serviço passar a existir, ele substitui a geração local sem mudar o contrato do evento.
- **RN-16 — Complemento de texto livre.** Em qualquer caso, o usuário pode adicionar um texto livre complementar (opcional), apresentado abaixo da epígrafe. Ele **não é coletado neste componente**: é informado depois, durante a edição da proposição (ex.: PROPOSTA DE EMENDA À CONSTITUIÇÃO Nº    , DE 2015 / TEXTO DESTACADO PARA RETORNAR À CÂMARA DOS DEPUTADOS COMO PROPOSIÇÃO AUTÔNOMA).

### 5.2 Preâmbulo

O preâmbulo é calculado a partir de modelos do vocabulário, usando `getPreambuloPadrao`. Os modelos não são listados aqui. Sem modelo para o tipo, `getPreambuloPadrao` registra um log de erro de preâmbulo não encontrado para a URN e devolve `O CONGRESSO NACIONAL decreta:`. **Essa regra de fallback (log e texto padrão) deve ser implementada em `getPreambuloPadrao`** (hoje ela devolve `undefined`), e não no componente, que apenas a usa. A mudança afeta os demais consumidores, como a abertura de documento (`buildProjetoNormaFromJsonix`), em que o tipo sem modelo passará a ter preâmbulo; deve ser tratada na change de implementação.


## 6. Critérios de aceite (resumo)

1. A espécie padrão é Proposição; Subemenda substitutiva só é oferecida na `CD`; g2 só aparece na `CD`.
2. Em Proposição, o número é `s/n` e não há Verificar; em Substitutivo e Subemenda, o número é editável e há Verificar e ementa.
3. Em Proposição, a lista de siglas traz os tipos não substitutivos da casa e de CN, com os inativos ao final em cinza; a sigla inativa é selecionável e exibe alerta sem bloquear.
4. Em PLV, g4 identifica a MPV (sigla fixa) e a referência é obrigatória.
5. O botão Verificar só habilita com sigla, número e ano preenchidos, e a ementa é apagada ao mudar qualquer um deles.
6. O destino é sempre coletado: padrão Comissão em substitutivo/subemenda e Plenário nos demais; se a obtenção das comissões falhar, só Plenário.
7. "Este documento será apresentado em parecer" vem marcada em substitutivo/subemenda e desmarcada em proposição.
8. A opção padrão da Tela 2 é a 3 em substitutivo/subemenda/PLV e a 1 nos demais casos.
9. Texto estruturado indisponível desabilita Continuar apenas quando está escolhida uma opção que seleciona texto existente (3 ou 4); nas opções 1 e 2 não interfere.
10. Falha no parser do arquivo importado leva à Tela 3, e Continuar conclui com documento vazio.
11. A identificação exibida segue a RN-08 para os quatro casos.

## 7. Pontos em aberto

- **Destino no `lexml-eta`:** o `lexml-eta` deixa de ter o componente de colegiado de destino, porque o destino passa a ser definido aqui. Definir, na change de implementação, de onde o editor lê o destino ao abrir um documento e como fica o `ColegiadoApreciador` hoje salvo e aberto (change `2026-10-19-c01-metadados-lexedit-situacao-colegiado`); **BREAKING** para o host.
- Implementar em `getPreambuloPadrao` o fallback do preâmbulo (log de erro e `O CONGRESSO NACIONAL decreta:`) e avaliar o impacto na abertura de documentos com tipo sem modelo (ver 5.2).
- O serviço de epígrafe está na issue #1053 (ver 5.1).

Decididos (não são mais pontos em aberto): a subemenda substitutiva da `CD` referencia a proposição original, com a referência ao substitutivo implícita (RN-22); formato da lista de comissões (seção 9); colegiado da epígrafe do substitutivo do `SF` (coletado em g5); serviços de verificação, de texto e de comissões (URLs configuráveis, seção 9); limite do arquivo importado (5 MB); siglas referenciáveis e de nova proposição (do vocabulário, RN-00 e RN-00a); inclusão de siglas inativas (sim, ao final, em cinza); MPV fora das listas de siglas, só como referência do PLV; tipos de proposição de cada casa (definidos nos vocabulários, não há mais lista a confirmar).

## 8. Caso relacionado: alterar dados básicos do documento

Tem **especificação própria** e está fora do escopo deste componente. Diálogo "Alterar dados básicos do documento" com campos análogos aos da Tela 1 e botões **Ok** / **Cancelar**. Os efeitos sobre o texto já editado (preâmbulo, epígrafe, fecho) ainda precisam ser definidos.

## 9. Contrato com o host

O componente não tem efeito colateral: coleta e devolve um resultado por evento. Quem cria o documento é o host (ou um orquestrador no `lexml-eta`).

### Configuração

```
{
  casaLegislativaEditor: 'SF' | 'CD',  // padrão SF
  urlVerificacaoProposicao: string,    // placeholders {sigla}, {numero}, {ano}
  urlTextoEstruturado: string,         // placeholders {sigla}, {numero}, {ano}
  urlComissoes: string                 // placeholder {casa}: SF | CD | CN
}
```

- Valores dos placeholders `{sigla}`, `{numero}` e `{ano}` (nas duas URLs): sigla em maiúsculas e número sem zeros à esquerda (ex.: `PL`, `12`, `2026`).
- `urlVerificacaoProposicao`, `urlTextoEstruturado` e `urlComissoes` são **obrigatórias**: se faltar qualquer uma, a inicialização do componente falha com erro que identifica a URL ausente, e nenhuma tela é exibida. Só a casa tem padrão (`SF`).
- O componente inicializa o vocabulário para a casa informada ao ser criado e a cada nova configuração.

### Verificação (g3, g4 e opção 4 da Tela 2)

- `200`: JSON `{ "ementa": string, "textoEstruturadoDisponivel": boolean }`; campos extras são ignorados.
- `404`: documento inexistente.
- Qualquer outro resultado (inclusive erro de rede): erro, documento não verificado, nova tentativa permitida.

### Texto estruturado (opções 3 e 4 da Tela 2)

- Consultado ao **Continuar**, só nessas opções.
- `200`: JSON do texto estruturado em LexML no formato JSONIX, o mesmo usado ao abrir um documento.
- `404`: texto indisponível (alerta da RN-09; prevalece sobre o indicador da verificação).
- Outro resultado: erro, com nova tentativa de **Continuar**.

### Comissões (g5)

- Consultada quando o destino Comissão é oferecido; o `{casa}` vem da autoridade da URN do novo documento (`senado.federal` → `SF`, `camara.deputados` → `CD`, `congresso.nacional` → `CN`).
- Resposta: lista JSON no mesmo formato da URL usada hoje pelo componente de destino (`getComissoes` do `lexml-eta`): `[{ "siglaCasaLegislativa": "SF", "sigla": "CCJ", "nome": "Comissão de Constituição, Justiça e Cidadania" }]`; só os itens cuja `siglaCasaLegislativa` é a casa pedida são usados. Diferença: a casa vai no placeholder `{casa}` da URL, não em `?siglaCasaLegislativa=`.

### Eventos

- `nova-proposicao-concluida`, com `detail`:

  | Campo | Descrição |
  |---|---|
  | `urn` | URN do novo documento (seção 4). |
  | `urnDocumentoReferenciado` | Em substitutivo, subemenda substitutiva e PLV. No substitutivo do `SF`, sem o sufixo de versão. |
  | `epigrafe` | Do serviço de epígrafe do vocabulário (#1053, com o sufixo do destino no `SF`), quando implementado; senão, a epígrafe do caso padrão (5.1). |
  | `preambulo` | De `getPreambuloPadrao` (5.2), que aplica o fallback (log de erro e `O CONGRESSO NACIONAL decreta:`) quando o tipo não tem modelo. |
  | `colegiadoDestino` | Sempre presente: tipo (Plenário ou Comissão) e, em Comissão, a sigla da comissão. |
  | `texto` | Documento articulado em JSONIX; só quando o texto vem de documento existente (importação, documento referenciado ou outra proposição). |
  | `anexoParecer` | Booleano (g6). |

- `nova-proposicao-cancelada`, sem `detail`.
