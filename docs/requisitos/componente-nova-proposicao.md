# Componente: Nova proposição

Origem: anotações em `pendencias.md` (seções "Casos de uso do LexEdit/Infoleg Editor" e "Componente de criação de novo documento") e layout da Tela 1 em `layout-tela-1-componente-nova-proposicao.txt`. Itens ainda sem resposta das equipes de negócio estão em [Pontos em aberto](#7-pontos-em-aberto). Especificação testável: change `2026-10-26-c01-especificar-componente-nova-proposicao` (OpenSpec).

## 1. Descrição

O usuário cria uma nova proposição no editor. O componente coleta a identificação do documento (espécie, sigla, proposição referenciada, destino e forma de apresentação) e define o texto inicial da edição: vazio, importado de um arquivo (DOCX, TXT ou LexML), copiado da proposição referenciada ou copiado de outra proposição.

- **Ator:** usuário do LexEdit/Infoleg Editor.
- **Gatilho:** ação "Nova proposição".
- **Pré-condições:**
  - A aplicação host informa, na configuração, a casa legislativa do editor (`casaLegislativaEditor`), que define as autoridades permitidas (ver [Casa legislativa e autoridades](#casa-legislativa-e-autoridades)).
  - A aplicação host informa também, para cada uma das três origens de dados (verificação da proposição, texto estruturado e comissões), a URL ou o callback que a substitui (ver [Contrato com o host](#9-contrato-com-o-host)). Sem a URL e sem o callback de qualquer uma delas, a inicialização falha.
  - O vocabulário de tipos de documento não precisa estar carregado: o componente o inicializa para a casa informada, ao ser criado e a cada nova configuração, como faz o `lexml-eta`, e usa em todo o fluxo apenas o vocabulário da casa (`getVocabularioDaCasa()`; ver [Vocabulário](#5-vocabulário-de-tipos-de-documento)). Manter a mesma casa no componente e no `lexml-eta` é responsabilidade do editor (host).
- **Pós-condição (sucesso):** o componente devolve ao host, por evento (`nova-proposicao-concluida`), o resultado com a URN do novo documento, a `urnDocumentoReferenciado` (quando houver), a epígrafe e o preâmbulo, o colegiado de destino, o texto inicial escolhido (quando parte de documento existente) e a forma de apresentação (`anexoParecer`) (ver [Contrato com o host](#9-contrato-com-o-host)). O componente não cria o documento: quem abre a edição é o host.
- **Pós-condição (cancelamento):** o componente emite o evento próprio `nova-proposicao-cancelada`, sem resultado, e descarta os dados informados.

### Casa legislativa e autoridades

A aplicação informa a casa legislativa do editor (`casaLegislativaEditor`); o editor deriva daí as autoridades. O componente trabalha só com o vocabulário da casa (`getVocabularioDaCasa()`), que não contém os tipos específicos da outra casa:

| Casa | Editor | Autoridades |
|---|---|---|
| `SF` | LexEdit | `senado.federal`, `congresso.nacional`, `federal` (só a MPV, e apenas como referência do PLV) |
| `CD` | Infoleg Editor | `camara.deputados`, `congresso.nacional`, `federal` (só a MPV, e apenas como referência do PLV) |

- **RN-00 — Siglas de nova proposição.** Na espécie Proposição, a lista de siglas contém os tipos das autoridades da casa (`senado.federal` ou `camara.deputados`, e `congresso.nacional`) que **não** são substitutivos nem subemendas substitutivas (`tipoRelacaoSubstitutivo` = `aceita substitutivo` ou `não aceita substitutivo`). A MPV (`federal`) não entra. Só tipos **ativos** são oferecidos (ordem alfabética da sigla): sigla inativa não inicia proposição nova.
- **RN-00a — Siglas da proposição referenciada (substitutivo e subemenda).** A lista contém todas as siglas, ativas ou inativas, de tipos do vocabulário da casa com `tipoRelacaoSubstitutivo` = `aceita substitutivo`, independentemente do tipo do substitutivo, **uma única vez cada** (sigla repetida em mais de um tipo, como PLS e PLC, aparece uma só vez), com ativas antes das inativas (cada grupo em ordem alfabética; inativas em cinza). A URN da proposição referenciada usa a autoridade do tipo escolhido e, para sigla que existe como lei ordinária e complementar, o tipo definido pelo atributo `complementar` da verificação (seção 9). Não há atributo de "tipos referenciáveis" no vocabulário (removido na issue #1056).
- **RN-00b — PLV.** A referência é sempre a MPV (RN-03), única utilização da autoridade `federal`.

## 2. Fluxo principal

O fluxo tem duas telas, "Nova proposição" (passo 1) e "Nova proposição — texto inicial" (passo 2). Existe ainda uma terceira, de erro de conversão.

### Tela 1 — Identificação do documento

A tela é organizada em grupos (g1 a g6). Os grupos exibidos dependem da espécie escolhida em g1.

| Grupo | Conteúdo | Exibição |
|---|---|---|
| g1 — Espécie de documento | Seleção única: Proposição (padrão), Substitutivo, Subemenda substitutiva (só `CD`). | Sempre |
| g2 — Identificação do substitutivo (ou subemenda) | **Removido da tela.** Na `CD`, o tipo (SBT ou SSP) e o ano do documento novo são derivados (RN-12); o número é `s/n`. | Nunca |
| g3 — Identificação da proposição | Sigla + número + ano. Em nova proposição: número `s/n`, sem **Verificar** e sem ementa. Em substitutivo ou subemenda: número editável, **Verificar** e ementa (somente leitura). | Sempre |
| g4 — Identificação da medida provisória | MPV (fixa) + número + ano (padrão: ano corrente), **Verificar** e ementa (somente leitura). | Só quando a espécie é Proposição e a sigla de g3 é PLV |
| g5 — Destino | Plenário ou Comissão; em Comissão, a comissão. | Sempre |
| g6 — Forma de apresentação | Caixa "Este documento será apresentado em parecer". | Sempre |

Botões: **Continuar**, **Cancelar**.

Regras da tela:

- **RN-01 — Espécie.** O tipo do documento deixa de ser uma lista própria e o indicativo de substitutivo deixa de existir na tela: a espécie (g1) e, em Proposição e no substitutivo do `SF`, a sigla de g3 determinam o tipo; na `CD`, em Substitutivo e Subemenda substitutiva, o tipo é derivado da espécie, sem escolha do usuário. `tipoRelacaoSubstitutivo` só serve para filtrar as listas de siglas (RN-00, RN-00a e RN-19) e para localizar o tipo do substitutivo na `CD`:

  | Espécie | Origem do tipo do documento |
  |---|---|
  | Proposição | sigla de g3 |
  | Substitutivo, `SF` | proposição de g3 (o substitutivo usa a URN dela com versão; RN-13) |
  | Substitutivo, `CD` | tipo `SBT` (sigla fixa, com `tipoRelacaoSubstitutivo` = `é substitutivo`) |
  | Subemenda substitutiva, `CD` | tipo `SSP` (sigla fixa, com `tipoRelacaoSubstitutivo` = `é subemenda substitutiva`) |

- **RN-02 — Proposição referenciada.** Em Substitutivo e Subemenda substitutiva, g3 identifica a proposição que recebe o documento; em Proposição, g3 identifica o próprio documento novo (sigla e ano; número `s/n`).
- **RN-03 — PLV.** O PLV não aceita substitutivo, mas exige a referência à Medida Provisória: em Proposição com sigla PLV em g3, o grupo g4 identifica a MPV (sigla MPV fixa), que vai em `urnDocumentoReferenciado`.
- **RN-04 — Verificar** (g3 em substitutivo ou subemenda, e g4). O botão é habilitado quando sigla, número e ano estão preenchidos. Ao acionar, verifica a existência do documento e, existindo, preenche a ementa.
- **RN-05 — Ementa.** Somente leitura. É apagada quando qualquer campo de identificação do grupo muda.
- **RN-06 — Continuar.** Só é permitido com a sigla de g3 escolhida, com o destino válido (RN-19) e, quando a espécie exige referência (Substitutivo, Subemenda substitutiva ou PLV), com o documento referenciado verificado e existente.
- **RN-18 — Sigla inativa (removida).** Não há mais alerta de sigla inativa: em nova proposição só há siglas ativas (RN-00). Siglas inativas continuam disponíveis para partir do texto de outra proposição e para a proposição referenciada (RN-00a); abrir e editar documentos de sigla inativa não muda.
- **RN-19 — Destino (g5).** O padrão é Comissão em Substitutivo e Subemenda substitutiva, e Plenário nos demais casos. Não existe "Plenário via comissão". Em Comissão, a comissão é obrigatória e escolhida de uma lista obtida da URL de comissões da configuração; o placeholder de casa da URL é preenchido pela autoridade da URN do novo documento (`SF`, `CD` ou `CN` para `congresso.nacional`). Com falha na obtenção da lista, a opção Comissão fica indisponível (só Plenário), e o padrão em substitutivo passa a ser Plenário. No `SF`, o destino alimenta o sufixo opcional do serviço de epígrafe (5.1). O componente de destino do `lexml-eta` é reaproveitado, com os ajustes necessários; o `lexml-eta` deixa de ter esse componente (ver [Pontos em aberto](#7-pontos-em-aberto)).
- **RN-20 — Forma de apresentação (g6).** A caixa vem marcada em Substitutivo e Subemenda substitutiva e desmarcada em Proposição; o usuário pode alterá-la. O valor vai em `anexoParecer`.

### Tela 2 — Texto inicial para edição

Cabeçalho: "Novo/Nova *\<identificação do novo documento\>*." (ver RN-08).

Pergunta: "Como você quer iniciar?" — opções (seleção única):

| # | Opção | Comportamento ao selecionar |
|---|---|---|
| 1 | Texto vazio | — |
| 2 | Importar documento (DOCX, TXT ou LexML) | Exibe o campo **Arquivo** (seleção de arquivo), que aceita DOCX, TXT e LexML, de até 5 MB. O LexML pode estar em XML ou em JSON (formato JSONIX, o mesmo usado pelo componente ao abrir um documento). |
| 3 | Texto do(a) *\<documento referenciado\>* | Só é oferecida em Substitutivo, Subemenda substitutiva ou PLV. Exibe o alerta "Texto estruturado não disponível para edição" quando for o caso. |
| 4 | Texto de outra proposição | Exibe sigla (escolhida entre todas as siglas do vocabulário da casa do editor, ativas e inativas, inclusive a MPV, uma vez cada) + número + ano, **Verificar**, o alerta de indisponibilidade e a ementa (somente leitura). Aceita qualquer sigla, ativa ou inativa. |

Botões: **Continuar**, **Voltar**, **Cancelar**.

Regras da tela:

- **RN-07 — Opção padrão.** Opção 3 em Substitutivo, Subemenda substitutiva ou PLV; opção 1 nos demais casos.
- **RN-08 — Identificação do novo documento** (usada nos cabeçalhos das telas 2 e 3, precedida de "Novo" ou "Nova" conforme o gênero do documento: o do tipo da proposição; substitutivo sempre "Novo"; subemenda substitutiva sempre "Nova"):
  - Não substitutivo, não subemenda e não PLV: nome do tipo do documento.
  - PLV: "Projeto de Lei de Conversão (Medida Provisória nº *\<número\>* de *\<ano\>*)".
  - Substitutivo: "Substitutivo ao/à *\<tipo da proposição\>* nº *\<número\>* de *\<ano\>*".
  - Subemenda substitutiva (só na `CD`; o `SF` não a tem): "Subemenda Substitutiva ao/à *\<tipo da proposição\>* nº *\<número\>* de *\<ano\>*".
- **RN-09 — Texto estruturado indisponível.** Se o texto da proposição (opção 3 ou 4) não estiver disponível em formato estruturado, exibe-se o alerta e **Continuar** fica desabilitado apenas enquanto essa opção estiver escolhida; ao trocar para a opção 1 ou 2, **Continuar** é reabilitado.
- **RN-09a — Origem do texto (opções 3 e 4).** O texto trazido é o **texto original** da proposição, obtido de um serviço configurável (definido pelo host), e não o texto em tramitação mais recente (ver [Contrato com o host](#9-contrato-com-o-host)). O serviço só é consultado nas opções 3 e 4, ao **Continuar**.
- **RN-10 — Continuar**, conforme a opção:
  - Opção 1: conclui sem texto.
  - Opções 3 e 4: conclui com o texto da proposição escolhida.
  - Opção 2: executa o parser do arquivo (o callback `onImportarArquivo`; sem ele, o tratamento é simulado e termina sempre em erro). Se passar, conclui com o resultado; se falhar, segue para a Tela 3.
- **Voltar** retorna à Tela 1 preservando os dados informados.

### Tela 3 — Erro de conversão

Exibida apenas quando o parser do arquivo importado (DOCX, TXT ou LexML) falha.

Conteúdo:

- Cabeçalho "Novo/Nova *\<identificação do novo documento\>*.".
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
- **RN-12 — Substitutivo e subemenda na `CD`.** A `CD` não usa sufixo de versão: tem tipos de documento específicos, com `tipoRelacaoSubstitutivo` = `é substitutivo` / `é subemenda substitutiva`. O tipo não é escolhido pelo usuário: é `SBT` no substitutivo e `SSP` na subemenda substitutiva, resolvidos pela sigla no vocabulário da casa (o componente falha, nomeando a sigla, se ela não existir). A URN usa esse tipo, o ano corrente, o número `999999` e nenhum sufixo; no modo de edição o ano é o da URN inicial (seção 8).
- **RN-13 — Substitutivo do `SF`.** A URN é a mesma do documento de referência (g3), acrescida do sufixo `@apresentacao.substitutivo`; `urnDocumentoReferenciado` é a URN sem o sufixo.
- **RN-14 — Demais documentos (inclusive substitutivos da `CD` e PLV).** São criados com o ano corrente e o número `999999`, indicando documento ainda não numerado, e não recebem versão na URN (ex.: `urn:lex:br:senado.federal:projeto.lei;pl:2026;999999`). No substitutivo e na subemenda da `CD` e no PLV, o documento referenciado vai em `urnDocumentoReferenciado`.
- **RN-22 — Subemenda substitutiva.** Na `CD`, g3 identifica a proposição original (não o substitutivo); é ela que vai em `urnDocumentoReferenciado` e cujo texto a opção 3 da Tela 2 oferece. A referência ao substitutivo é implícita e não é coletada.
- **RN-21 — Reconhecimento de substitutivo.** `isSubstitutivo(urn)` (vocabulário, issue #1056) é verdadeiro para a URN do substitutivo do `SF` e da `CD`, e falso para a subemenda substitutiva e para os demais tipos. Serve de critério de verificação da URN gerada; a espécie vem de g1.

## 5. Vocabulário de tipos de documento

O componente depende dos seguintes atributos do tipo do documento (`vocabulario/`):

- **`tipoRelacaoSubstitutivo`:** `aceita substitutivo` | `não aceita substitutivo` | `é substitutivo` | `é subemenda substitutiva` (base das listas de siglas, RN-00 e RN-00a, e da busca dos tipos SBT e SSP na `CD`, RN-12).
- **`ativo`** (booleano, padrão `true`): tipos inativos (ex.: PLS, PLC) não são oferecidos em nova proposição; aparecem ao final das listas de proposição referenciada e de outra proposição, em cinza (RN-00a). Deve haver apenas uma entrada ativa por sigla + autoridade na visão de uma casa.
- **Modelo de preâmbulo** associado ao tipo (ver seção 5.2).
- **[backlog]** Permitir parametrizar o complemento do vocabulário.

### 5.1 Epígrafe

Os modelos de epígrafe (por tipo, substitutivo, subemenda substitutiva e PLV) não são listados aqui: pertencem ao serviço de epígrafe do vocabulário, especificado e implementado na issue #1053.

- **Serviço de epígrafe.** O componente usa o serviço do vocabulário (entrada: `urn`, `urnDocumentoReferenciado` e um **sufixo opcional**) quando ele já estiver implementado. No `SF`, o componente sempre informa o sufixo: `- PLEN` quando o destino é Plenário e `- <sigla da comissão>` quando é Comissão (ex.: `- CCJ`); na `CD`, não informa sufixo. Enquanto não estiver, o componente gera a epígrafe do **caso padrão** (sem sufixo), com o número em branco (o documento nasce não numerado, RN-14) e o ano corrente: `<TIPO DO DOCUMENTO POR EXTENSO EM MAIÚSCULAS> Nº   , DE <ANO>` (ex.: PROJETO DE LEI COMPLEMENTAR Nº    , DE 2026). Quando o serviço passar a existir, ele substitui a geração local sem mudar o contrato do evento.
- **RN-16 — Complemento de texto livre.** Em qualquer caso, o usuário pode adicionar um texto livre complementar (opcional), apresentado abaixo da epígrafe. Ele **não é coletado neste componente**: é informado depois, durante a edição da proposição (ex.: PROPOSTA DE EMENDA À CONSTITUIÇÃO Nº    , DE 2015 / TEXTO DESTACADO PARA RETORNAR À CÂMARA DOS DEPUTADOS COMO PROPOSIÇÃO AUTÔNOMA).

### 5.2 Preâmbulo

O preâmbulo é calculado a partir de modelos do vocabulário, usando `getPreambuloPadrao`, que continua devolvendo `undefined` quando não há modelo para o tipo. Nesse caso o **próprio componente** registra um log de erro de preâmbulo não encontrado para a URN e usa `O CONGRESSO NACIONAL decreta:`. A regra fica no componente (decisão da issue #1050, em vez de em `getPreambuloPadrao`) para não alterar a abertura de documentos: um documento aberto de tipo sem modelo continua sem preâmbulo.


## 6. Critérios de aceite (resumo)

1. A espécie padrão é Proposição; Subemenda substitutiva só é oferecida na `CD`; o grupo g2 não é exibido.
2. Em Proposição, o número é `s/n` e não há Verificar; em Substitutivo e Subemenda, o número é editável e há Verificar e ementa.
3. Em Proposição, a lista de siglas traz os tipos não substitutivos da casa e de CN, com os inativos ao final em cinza; a lista só tem tipos ativos.
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
- O serviço de epígrafe está na issue #1053 (ver 5.1).

Decididos (não são mais pontos em aberto): a subemenda substitutiva da `CD` referencia a proposição original, com a referência ao substitutivo implícita (RN-22); formato da lista de comissões (seção 9); colegiado da epígrafe do substitutivo do `SF` (coletado em g5); serviços de verificação, de texto e de comissões (URLs ou callbacks configuráveis, seção 9); limite do arquivo importado (5 MB); siglas referenciáveis e de nova proposição (do vocabulário, RN-00 e RN-00a); inclusão de siglas inativas (sim, ao final, em cinza); MPV fora das listas de siglas, só como referência do PLV; tipos de proposição de cada casa (definidos nos vocabulários, não há mais lista a confirmar).

## 8. Modo de edição: alterar dados básicos do documento (#1051)

O componente também edita os dados básicos de um documento já em edição. O host chama `iniciarModoEdicao(dadosIniciais)` **depois** da `config` (a atribuição de `config` reinicia o componente e descarta o modo e os dados iniciais). O método reinicia o componente e ativa o modo de edição; `iniciar()` reinicia em modo de criação.

`dadosIniciais`: `urn` (obrigatória), `urnDocumentoReferenciado`, `colegiadoApreciador` (`tipoColegiado`, `siglaComissao`) e `anexoParecer`; o `detail` de `alteracao-dados-basicos-solicitada` do `lexml-eta` serve como está.

- Só a Tela 1, com o título "Alterar dados básicos"; **Continuar** e **Cancelar**.
- A Tela 1 é preenchida a partir da URN (módulo `lerDadosIdentificacao`, inverso de `montaUrnNovaProposicao`): espécie, siglas, número e ano; destino e forma de apresentação vêm dos dados iniciais. O PLV é reconhecido pela sigla da URN; a MPV, pela URN do documento referenciado.
- O documento referenciado inicial vale como **verificado** (sem consultar a URL) até o usuário mudar sigla, número ou ano.
- O número real do documento (diferente de `999999`) é exibido como texto fixo e mantido na URN do resultado enquanto espécie e sigla não mudam; senão volta a `s/n`. Na `CD`, em substitutivo e subemenda substitutiva, o número é mantido na URN sem ser exibido (não há g2).
- Na `CD`, o ano do substitutivo ou da subemenda substitutiva é o da URN inicial, mantido ao trocar o destino ou a espécie; se a URN inicial não é de substitutivo nem de subemenda, é o ano corrente.
- As comissões são carregadas ao abrir. Comissão inicial fora da lista (ou lista indisponível) deixa o destino inválido até o usuário escolher outro.
- Ao **Continuar**, um único modal Sim/Não pede confirmação se a casa responsável muda ("Ao alterar para um tipo de outra casa legislativa a autoria informada será perdida. Deseja continuar?") e/ou se o documento passa a anexo de parecer ("Ao apresentar o documento em parecer, a justificação informada será perdida. Deseja continuar?"). **Não** mantém a Tela 1 sem emitir resultado.
- O resultado é o evento `dados-basicos-alterados`, com o `detail` de `nova-proposicao-concluida` **sem `texto`**. **Cancelar** emite `nova-proposicao-cancelada`.
- `reiniciar()` (público) volta ao estado original: modo de criação, sem dados iniciais, Tela 1 com os padrões; a configuração é mantida. O host deve chamá-lo a cada abertura do modal.

Quem aplica o resultado é o host, com `alterarDadosBasicos` do `lexml-eta` (`docs/api-componente-lexml-eta.md`, seção 4.7).

## 9. Contrato com o host

O componente não tem efeito colateral: coleta e devolve um resultado por evento. Quem cria o documento é o host (ou um orquestrador no `lexml-eta`).

### Configuração

```
{
  casaLegislativaEditor: 'SF' | 'CD',  // padrão SF
  urlVerificacaoProposicao?: string,   // placeholders {sigla}, {numero}, {ano}
  urlTextoEstruturado?: string,        // placeholders {sigla}, {numero}, {ano}
  urlComissoes?: string,               // placeholder {casa}: SF | CD | CN
  onVerificarProposicao?: (consulta) => resultado | undefined | Promise<...>,
  onObterTexto?: (consulta) => texto | undefined | Promise<...>,
  onObterComissoes?: (casa) => comissoes | Promise<...>,
  onImportarArquivo?: (arquivo) => { texto?, erros } | Promise<...>
}
```

- Valores dos placeholders `{sigla}`, `{numero}` e `{ano}` (nas duas URLs): sigla em maiúsculas e número sem zeros à esquerda (ex.: `PL`, `12`, `2026`).
- Cada origem de dados (verificação, texto estruturado e comissões) exige a **URL ou o callback** correspondente: se faltar os dois em qualquer uma, a inicialização do componente falha com erro que identifica a URL ausente (e cita o callback alternativo), e nenhuma tela é exibida. `onImportarArquivo` não é exigido. Só a casa tem padrão (`SF`).
- O componente inicializa o vocabulário para a casa informada ao ser criado e a cada nova configuração.

### Callbacks opcionais

O callback substitui a origem correspondente: existindo, é usado e a URL **não** é chamada (mesmo informada); não existindo, vale o comportamento da origem sem callback. Telas, regras de habilitação e resultado não mudam. Os callbacks devolvem resultados de domínio, não respostas HTTP, e podem ser síncronos ou assíncronos. Promise rejeitada ou exceção equivale a erro de rede, com os mesmos estados dos itens abaixo.

| Callback | Recebe | Devolve | Equivalente nas URLs |
|---|---|---|---|
| `onVerificarProposicao` | `{ sigla, numero, ano }` normalizados (como nos placeholders) | `{ ementa, textoEstruturadoDisponivel?, complementar? }`; `undefined` se o documento não existe | `200` / `404` |
| `onObterTexto` | `{ sigla, numero, ano }` normalizados | documento em JSONIX; `undefined` se o texto está indisponível | `200` / `404` |
| `onObterComissoes` | casa (`SF`, `CD` ou `CN`) | lista de `{ siglaCasaLegislativa, sigla, nome }`; só os itens da casa pedida são usados | `200` |
| `onImportarArquivo` | o arquivo, já validado quanto a extensão e tamanho | `{ texto?, erros }` | sem equivalente |

- `onImportarArquivo` não é chamado para arquivo recusado (acima de 5 MB ou de outro formato). Com `erros` não vazio, segue para a Tela 3. Com `erros` vazio, conclui com `texto`; sem `texto`, vai para a Tela 3 com a mensagem "O conversor não devolveu o texto do documento.". Se rejeitar a promise, o componente permanece na Tela 2 com mensagem de erro de comunicação e permite nova tentativa. Não há campo de avisos de conversão.
- Sem `onImportarArquivo`, o tratamento do arquivo continua simulado: o componente valida extensão e tamanho e termina na Tela 3 com um erro de parser simulado, sem chamar URL.

### Verificação (g3, g4 e opção 4 da Tela 2)

Por URL (sem `onVerificarProposicao`):
- `200`: JSON `{ "ementa": string, "textoEstruturadoDisponivel": boolean, "complementar"?: boolean }`; campos extras são ignorados. `complementar` (padrão `false` quando ausente) só tem efeito em PLS e PLC: `true` faz a URN do documento referenciado e a do substitutivo do `SF` usarem `projeto.lei.complementar`; sem ele, `projeto.lei`.
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
  | `preambulo` | De `getPreambuloPadrao` (5.2); o componente aplica o fallback (log de erro e `O CONGRESSO NACIONAL decreta:`) quando o tipo não tem modelo. |
  | `colegiadoDestino` | Sempre presente: tipo (Plenário ou Comissão) e, em Comissão, a sigla da comissão. |
  | `texto` | Documento articulado em JSONIX; só quando o texto vem de documento existente (importação, documento referenciado ou outra proposição). |
  | `anexoParecer` | Booleano (g6). |

- `nova-proposicao-cancelada`, sem `detail`.
- `dados-basicos-alterados` (só no modo de edição, seção 8): mesmos campos de `nova-proposicao-concluida`, exceto `texto`.
