# Caso de uso: Nova proposição

Origem: anotações em `pendencias.md` (seções "Casos de uso do LexEdit/Infoleg Editor" e "Componente de criação de novo documento"). Itens ainda sem resposta das equipes de negócio estão em [Pontos em aberto](#pontos-em-aberto).

## 1. Descrição

O usuário cria uma nova proposição no editor. O caso de uso coleta a identificação do documento (tipo, se é substitutivo e a proposição referenciada) e define o texto inicial da edição: vazio, importado de um arquivo (DOCX, TXT ou LexML), copiado da proposição referenciada ou copiado de outra proposição.

- **Ator:** usuário do LexEdit/Infoleg Editor.
- **Gatilho:** ação "Nova proposição".
- **Pré-condições:**
  - A aplicação host informa a casa legislativa do editor, que define as autoridades permitidas (ver [Casa legislativa e autoridades](#casa-legislativa-e-autoridades)).
  - O vocabulário de tipos de documento está carregado (ver [Vocabulário](#6-vocabulário-de-tipos-de-documento)).
- **Pós-condição (sucesso):** o editor abre com um documento novo, com a identificação (URN do documento e `urnDocumentoDeReferencia`, quando houver) definida e o texto inicial escolhido.

### Casa legislativa e autoridades

A aplicação informa a casa legislativa do editor; o editor deriva daí as autoridades:

| Casa | Editor | Autoridades |
|---|---|---|
| `SF` | LexEdit | `senado.federal`, `congresso.nacional` |
| `CD` | Infoleg Editor | `camara.deputados`, `congresso.nacional` |

- **RN-00 — Filtro por autoridade.** A lista "Tipo do documento" oferece apenas tipos **ativos** das autoridades da casa.
- **RN-00a — Siglas da proposição referenciada (substitutivo).** A lista inclui siglas ativas e inativas (ver seção 6), com a seguinte origem conforme a casa:
  - `SF`: derivada do tipo do documento escolhido (cada tipo de substitutivo define as siglas que ele pode substituir), restrita aos tipos com `tipoRelacaoSubstitutivo` = `aceita substitutivo`.
  - `CD`: todas as siglas, ativas ou inativas, de tipos que aceitam substitutivo (`tipoRelacaoSubstitutivo` = `aceita substitutivo`), independentemente do tipo do documento escolhido.
- **RN-00b — PLV.** A referência é sempre a MPV (RN-03), em ambas as casas.

## 2. Fluxo principal

O fluxo tem duas telas, "Nova proposição" (passo 1) e "Nova proposição — texto inicial" (passo 2). Existe ainda uma terceira, de erro de conversão.

### Tela 1 — Seleção do tipo do documento

Campos:

| Campo | Descrição |
|---|---|
| Tipo do documento | Lista de tipos ativos das autoridades configuradas. |
| Substitutivo | Indicativo de substitutivo (checkbox). |
| Proposição (ou Medida Provisória) | Sigla (lista) + número + ano da proposição referenciada, com o botão **Verificar**. |
| Ementa | Somente leitura; preenchida pela verificação. |

Botões: **Continuar**, **Cancelar**.

Regras da tela:

- **RN-01 — Substitutivo.** O estado do indicativo depende de `tipoRelacaoSubstitutivo` do tipo escolhido:

  | `tipoRelacaoSubstitutivo` | Indicativo de substitutivo |
  |---|---|
  | `é substitutivo` / `é subemenda substitutiva` | Desabilitado e selecionado |
  | `aceita substitutivo` | Habilitado |
  | `não aceita substitutivo` | Desabilitado e não selecionado |

- **RN-02 — Proposição referenciada.** Os campos de identificação da proposição ficam habilitados apenas quando o indicativo de substitutivo está selecionado **ou** o tipo é PLV.
- **RN-03 — PLV.** O PLV não aceita substitutivo, mas exige a referência à Medida Provisória: o rótulo do campo passa a "Medida Provisória" e a sigla fica fixa em MPV (campo desabilitado).
- **RN-04 — Verificar.** O botão é habilitado quando sigla, número e ano estão preenchidos. Ao acionar, verifica a existência da proposição e, existindo, preenche a ementa.
- **RN-05 — Ementa.** Somente leitura. É apagada quando qualquer campo de identificação da proposição muda.
- **RN-06 — Continuar.** Só é permitido com o tipo escolhido e, quando a referência é exigida (RN-02), com a proposição verificada e existente.

### Tela 2 — Texto inicial para edição

Cabeçalho: "Novo(a) *\<identificação do novo documento\>*." (ver RN-08).

Pergunta: "Como você quer iniciar?" — opções (seleção única):

| # | Opção | Comportamento ao selecionar |
|---|---|---|
| 1 | Texto vazio | — |
| 2 | Importar documento (DOCX, TXT ou LexML) | Exibe o campo **Arquivo** (seleção de arquivo), que aceita DOCX, TXT e LexML. |
| 3 | Texto do(a) *\<documento referenciado\>* | Só é oferecida em substitutivo ou PLV. Exibe o alerta "Texto estruturado não disponível para edição" quando for o caso. |
| 4 | Texto de outra proposição | Exibe sigla + número + ano, **Verificar**, o alerta de indisponibilidade e a ementa (somente leitura). |

Botões: **Continuar**, **Voltar**, **Cancelar**.

Regras da tela:

- **RN-07 — Opção padrão.** Opção 3 em substitutivo ou PLV; opção 1 nos demais casos.
- **RN-08 — Identificação do novo documento** (usada nos cabeçalhos das telas 2 e 3):
  - Não substitutivo e não PLV: nome do tipo do documento.
  - PLV: "Projeto de Lei de Conversão (Medida Provisória nº *\<número\>* de *\<ano\>*)".
  - Substitutivo: "Substitutivo ao/à *\<tipo da proposição\>* nº *\<número\>* de *\<ano\>*".
  - Subemenda substitutiva global (só na `CD`; o `SF` não a tem): "Subemenda Substitutiva ao/à *\<tipo da proposição\>* nº *\<número\>* de *\<ano\>*".
- **RN-09 — Texto estruturado indisponível.** Se o texto da proposição (opção 3 ou 4) não estiver disponível em formato estruturado, exibe-se o alerta e **Continuar** fica desabilitado apenas enquanto essa opção estiver escolhida; ao trocar para a opção 1 ou 2, **Continuar** é reabilitado.
- **RN-09a — Origem do texto (opções 3 e 4).** O texto trazido é o **texto original** da proposição, obtido de um serviço configurável (definido pelo host), e não o texto em tramitação mais recente. O mesmo serviço informa a disponibilidade do texto estruturado (RN-09).
- **RN-10 — Continuar**, conforme a opção:
  - Opção 1: abre a edição com documento vazio.
  - Opções 3 e 4: abre a edição com o texto da proposição escolhida.
  - Opção 2: executa o parser do arquivo. Se passar, abre a edição com o resultado; se falhar, segue para a Tela 3.
- **Voltar** retorna à Tela 1 preservando os dados informados.

### Tela 3 — Erro de conversão

Exibida apenas quando o parser do arquivo importado (DOCX, TXT ou LexML) falha.

Conteúdo:

- Cabeçalho "Novo(a) *\<identificação do novo documento\>*.".
- Mensagem "Ocorreram os seguintes erros na tentativa de conversão do *\<nome do arquivo\>*." seguida da lista de erros do parser.
- Orientação: "Você pode corrigi-los no documento e tentar novamente ou continuar para iniciar com um documento vazio."

Botões:

- **Continuar:** abre a edição com documento vazio.
- **Voltar:** retorna à Tela 2.
- **Cancelar:** encerra o caso de uso sem criar o documento.

## 3. Fluxos alternativos

- **FA-01 — Cancelar** (em qualquer tela): descarta os dados informados e retorna ao estado anterior, sem criar documento.
- **FA-02 — Proposição inexistente** (Verificar, telas 1 ou 2): informa que a proposição não foi encontrada, mantém a ementa vazia e **Continuar** permanece desabilitado.
- **FA-03 — Arquivo com erros de conversão:** ver Tela 3.

## 4. Identificação do documento (URN)

A identificação é composta por: autoridade, tipo do documento, data (ou apenas ano), número e versão. Em substitutivo e PLV o documento guarda também `urnDocumentoDeReferencia` (a URN do projeto que recebe o substitutivo ou da MPV).

Exemplos:

```
urn:lex:br:senado.federal:projeto.lei;pl:2026;999999
urn:lex:br:congresso.nacional:projeto.lei.conversao;plv:2026;999999
  urnDocumentoDeReferencia: urn:lex:br:federal:medida.provisoria;mpv:2026;4321

urn:lex:br:senado.federal:projeto.lei;pl:2026;12@apresentacao.substitutivo

urn:lex:br:camara.deputados:substitutivo;sbt:2026;999999
  urnDocumentoDeReferencia: urn:lex:br:camara.deputados:projeto.lei;pl:2026;12
```

Sufixos de versão previstos: `@apresentacao.substitutivo`, `@aprovacao.substitutivo`, `@aprovacao.substitutivo.decisao.terminativa`.

- **RN-11 — Versão do substitutivo.** A identificação de substitutivo por sufixo de versão vale apenas para o `SF`: um substitutivo novo é sempre criado com `@apresentacao.substitutivo`. Os demais sufixos não são atribuídos por este caso de uso.
- **RN-12 — Substitutivo na `CD`.** A `CD` não usa sufixo de versão: tem tipos de documento específicos para substitutivo (ex.: `sbt`, subemenda substitutiva), com `tipoRelacaoSubstitutivo` = `é substitutivo` / `é subemenda substitutiva`. Assim, na `CD` o indicativo de substitutivo aparece sempre selecionado e desabilitado nesses tipos, e a URN não leva sufixo.

- **RN-13 — Substitutivo do `SF`.** A URN é a mesma do documento de referência, acrescida do sufixo `@apresentacao.substitutivo` (ex.: referência `...projeto.lei;pl:2026;12` → `...projeto.lei;pl:2026;12@apresentacao.substitutivo`).
- **RN-14 — Demais documentos (inclusive substitutivos da `CD` e PLV).** São criados com o ano corrente e o número `999999`, indicando documento ainda não numerado, e não recebem versão na URN (ex.: `urn:lex:br:senado.federal:projeto.lei;pl:2026;999999`). No substitutivo da `CD` e no PLV, o documento referenciado vai em `urnDocumentoDeReferencia`.

## 5. Tipos de proposição a confirmar

Congresso e Senado **confirmados** pelas equipes de negócio; Câmara **a confirmar**:

- **Congresso (confirmado):** PRN, PLN, PLV, Substitutivos a PRN.
- **Senado (confirmado):** PL, PLP, PEC, PRS, PDL, Substitutivos a PL, PLP, PRS e PDL.
- **Câmara (a confirmar):** PL, PLP, PEC, outros tipos da CD (a definir), Substitutivos a PL, PLP e outros tipos (a definir), Subemenda Substitutiva aos substitutivos acima.

## 6. Vocabulário de tipos de documento

O caso de uso depende de novos atributos no tipo do documento (`vocabulario.ts`):

- **`tipoRelacaoSubstitutivo`:** `aceita substitutivo` | `não aceita substitutivo` | `é substitutivo` | `é subemenda substitutiva` (base da RN-01).
- **`ativo`** (booleano, padrão `true`): tipos inativos (ex.: PLS, PLC) são oferecidos apenas para referenciar uma proposição (campo sigla), nunca para criar um documento novo. Deve haver apenas uma entrada ativa por sigla + autoridade.
- **Modelo de preâmbulo** associado ao tipo (ver seção 6.2).
- **[backlog]** Permitir parametrizar o complemento do vocabulário.

### 6.1 Modelos de epígrafe

O número da epígrafe fica em branco (o documento nasce não numerado, RN-14) e o ano é o corrente.

| Caso | Modelo | Exemplo |
|---|---|---|
| Padrão | `<TIPO DO DOCUMENTO POR EXTENSO EM MAIÚSCULAS> Nº   , DE <ANO>` | PROJETO DE LEI COMPLEMENTAR Nº    , DE 2026 |
| Substitutivo (`SF`) | `EMENDA Nº     - <SIGLA DO COLEGIADO> (SUBSTITUTIVO)` + linha `(<à/ao> <Tipo da proposição> nº <número>, de <ano>)` | EMENDA Nº     - CCJ (SUBSTITUTIVO)<br>(ao Projeto de Lei nº 1.234, de 2026) |
| Substitutivo (`CD`) | `SUBSTITUTIVO <AO/À> <TIPO DA PROPOSIÇÃO> Nº <NÚMERO>, DE <ANO>` | SUBSTITUTIVO AO PROJETO DE LEI Nº 11 , DE 2025 |
| Subemenda substitutiva (`CD`) | `SUBEMENDA SUBSTITUTIVA <AO/À> <TIPO DA PROPOSIÇÃO> Nº <NÚMERO>, DE <ANO>` | SUBEMENDA SUBSTITUTIVA À PROPOSTA DE EMENDA À CONSTITUIÇÃO Nº 11, DE 2025 |
| PLV | `PROJETO DE LEI DE CONVERSÃO Nº    , DE <ANO>` + linha `(Medida Provisória nº <número>, de <ano>)` | PROJETO DE LEI DE CONVERSÃO Nº    , DE 2026<br>(Medida Provisória nº 1.234, de 2026) |

- **RN-16 — Complemento de texto livre.** Em qualquer caso, o usuário pode adicionar um texto livre complementar (opcional), apresentado abaixo da epígrafe. Ele **não é coletado neste caso de uso**: é informado depois, durante a edição da proposição (ex.: PROPOSTA DE EMENDA À CONSTITUIÇÃO Nº    , DE 2015 / TEXTO DESTACADO PARA RETORNAR À CÂMARA DOS DEPUTADOS COMO PROPOSIÇÃO AUTÔNOMA).
- **RN-17 — Referência no substitutivo.** O tipo, o número e o ano da proposição citada na epígrafe vêm da proposição referenciada informada na Tela 1; no PLV, da Medida Provisória.

### 6.2 Modelos de preâmbulo

Cada tipo de documento é associado a um modelo de preâmbulo no vocabulário. Os modelos abaixo foram identificados junto à consultoria do SF:

| Tipos | Preâmbulo |
|---|---|
| PL, PLP, PLV, PDL, PLN | O CONGRESSO NACIONAL decreta: |
| PRS | O SENADO FEDERAL resolve: |
| PRN | O CONGRESSO NACIONAL resolve: |
| PEC | As Mesas da Câmara dos Deputados e do Senado Federal, nos termos do § 3º do art. 60 da Constituição Federal, promulgam a seguinte Emenda ao texto constitucional: |

- **RN-15 — Substitutivos (`SF` e `CD`).** Usam o modelo de preâmbulo do tipo da URN referenciada. Na `CD` isso decorre de os substitutivos terem tipos próprios (RN-12), com a referência em `urnDocumentoDeReferencia`; no `SF`, o substitutivo mantém a URN do documento de referência (RN-13), cujo tipo define o preâmbulo.
- **A definir:** os modelos de preâmbulo dos novos tipos de documento a identificar para a `CD` (ver seção 5).

## 7. Critérios de aceite (resumo)

1. Em tipos que são sempre substitutivos, o indicativo aparece selecionado e desabilitado; em tipos que não aceitam substitutivo, aparece desmarcado e desabilitado.
2. Em PLV, a sigla fica fixa em MPV e a referência é obrigatória.
3. O botão Verificar só habilita com sigla, número e ano preenchidos, e a ementa é apagada ao mudar qualquer um deles.
4. A opção padrão da Tela 2 é a 3 em substitutivo/PLV e a 1 nos demais casos.
5. Texto estruturado indisponível desabilita Continuar apenas quando está escolhida uma opção que seleciona texto existente (3 ou 4); nas opções 1 e 2 não interfere.
6. Falha no parser do arquivo importado leva à Tela 3, e Continuar abre um documento vazio.
7. A identificação exibida segue a RN-08 para os quatro casos.

## 8. Pontos em aberto

- Substitutivo do `SF`: de onde vem a sigla do colegiado da epígrafe? A Tela 1 não a coleta; é preciso um campo próprio, a edição posterior da epígrafe ou outra fonte (e se o destino for o Plenário, sem sigla)?
- Confirmar a lista de tipos da Câmara (ver seção 5), incluindo os "outros tipos da CD".
- Como o sistema sabe se o texto estruturado de uma proposição está disponível, e de qual serviço vêm a verificação e a ementa?
- Há limite de tamanho para o arquivo importado? (Formatos aceitos: DOCX, TXT e LexML.)
- No `SF`, como o tipo do documento define as siglas referenciáveis? É preciso um atributo no vocabulário (ex.: lista de siglas substituíveis por tipo) ou a derivação é feita por outra regra?
- Nas duas casas, as siglas de tipos inativos que aceitavam substitutivo entram na lista? (A RN-00a assume que sim.)
- Proposições de outras autoridades (ex.: `federal`, para MPV) entram na lista de siglas referenciáveis? A MPV do PLV é de `federal`, fora das autoridades da casa.

## 9. Caso relacionado: trocar tipo do documento

Diálogo "Alterar o tipo do documento" com os mesmos campos da Tela 1 (tipo, indicativo de substitutivo, proposição referenciada, ementa) e botões **Ok** / **Cancelar**, regido pelas regras RN-01 a RN-05. Os efeitos sobre o texto já editado (preâmbulo, epígrafe, fecho) ainda precisam ser definidos.
