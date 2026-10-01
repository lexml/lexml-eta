## Context

Ver proposal.md (Why). Segue o padrão por grupo de metadados do LexEdit fixado pela change `2026-09-22-c01-salvar-abrir-opcoes-impressao` (`DadosLexEdit` + montador + leitor + coleta/aplicação no componente raiz; `CLAUDE.md`, item 13). Fatos do estado atual que moldam a abordagem:

- **Data:** o campo "Data" (`lexml-eta-data`, `DataComponent`) guarda `data` como `'AAAA-MM-DD'` ou `''` ("Não informar"). O componente raiz o lê em `getProposicao()` para `proposicao.dataUltimaModificacao`, um nome enganoso: é a data do fecho, e a especificação 13 tem um `dataUltimaModificacao` distinto (`xsd:dateTime`, issue 11). No modo anexo de parecer a data é forçada a `''`.
- **Local:** não é editável. `montarLocalFromColegiadoApreciador` o deriva do destino (`_lexmlDestino.colegiadoApreciador`): "Sala da comissão" quando `tipoColegiado === 'Comissão'`, senão "Sala das sessões". **O destino não é salvo por nenhuma issue do roteiro**: ao abrir, `resetaProposicao` o volta ao padrão (Plenário). O `DestinoComponent` declara `emitirEventoOnChange`, mas nunca a chama, então não há evento de mudança de destino.
- **`LocalDataFecho` é LexML** (`HierarchicalStructure > ParteFinal > LocalDataFecho > p+`), fora do wildcard `xsd:any`. Verificado em 22/09/2026 com `jsonix-lexml-win.exe`: `ParteFinal` só com `LocalDataFecho`, sem assinaturas, passa no XSD, e `tojson`/`toxml` preservam o texto nos dois casos (com e sem data). O formato JSON é `norma.parteFinal = { TYPE_NAME: 'br_gov_lexml__1.ParteFinal', localDataFecho: { TYPE_NAME: 'br_gov_lexml__1.ParsType', p: [{ TYPE_NAME: 'br_gov_lexml__1.GenInline', content: [texto] }] } }`.
- **`lexedit.xsd`:** `local` é `xsd:string` e `data` é `xsd:date`; texto vazio não é um `xsd:date` válido.
- **Formatação por extenso:** `getDataPorExtenso` (`urnUtil.ts`) trabalha sobre texto, sem `Date`, mas mantém zero à esquerda e é usado pela epígrafe.

## Goals / Non-Goals

**Goals:**
- Salvar e abrir local e data do fecho, estruturados e em texto, conforme as specs desta change, sem perda na ida e volta.
- Reaproveitar o padrão por grupo sem reestruturar o que a c01 criou.

**Non-Goals:**
- Salvar o destino (`colegiadoApreciador`). É a causa de fundo do tratamento do local (Decisão 2); fica como pendência do roteiro.
- Alinhar a grafia do local com a especificação ("Sala das Sessões"): mudaria o `proposicao.local` que o host já recebe.
- Renomear `proposicao.dataUltimaModificacao` (tema da issue 11).
- Atualizar `ParteFinal`/`MetadadoProprietario` no caminho legado `getProjetoAtualizado()`, que copia o documento aberto e só troca a parte inicial e a articulação. Isso já acontece hoje com `MetadadoProprietario`.
- Ler o texto de `LocalDataFecho` ao abrir.

## Decisions

### 1. `local` e `data` como campos de `DadosLexEdit`, planos em `lexedit`

São atributos do próprio `lexedit:Metadado`, não um subgrupo. `DadosLexEdit` e `MetadadoLexEdit` ganham `local?: string` e `data?: string`, gravados diretamente em `lexedit.local`/`lexedit.data`.

- **Montador (`montaFecho`, composto em `montaMetadadoLexEdit`):** grava `local` sempre que informado, e `data` só quando não vazia.
- **`ParteFinal`:** montado em `montaProjetoNorma` a partir dos mesmos `dados`, que passam a ser repassados a essa função. Sem `local`, não há `ParteFinal`.
- **Leitor (`lerFecho`, composto em `lerMetadadoLexEdit`):** `local` quando for texto não vazio; `data` só quando casar com `^\d{4}-\d{2}-\d{2}$`. Ausente, vazia ou inválida resulta em `undefined`.
- **Alternativa considerada:** um subgrupo `lexedit.fecho: { local, data }`. Descartada porque se afasta do XML da especificação, em que são atributos de `Metadado`, e a migração para o novo executável ficaria mais distante.

### 2. Local lido preservado enquanto o destino não mudar (snapshot do destino)

Em `abrirDocumentoArticulado`, depois de `inicializarEdicao`, o componente raiz guarda:
- `localDoArquivo`: o local lido do arquivo;
- `destinoAoAbrir`: uma cópia de `_lexmlDestino.colegiadoApreciador`.

Ao salvar, o local efetivo é `localDoArquivo` se o destino atual tiver o mesmo `tipoColegiado` e a mesma `siglaComissao` da cópia; caso contrário, é o derivado por `montarLocalFromColegiadoApreciador`. `inicializarEdicao` descarta os dois valores (novo documento ou nova abertura), para não vazar de um documento para outro.

- **Por que snapshot e não evento:** o `DestinoComponent` não emite `onchange` hoje. Comparar com a cópia dá o mesmo comportamento sem mexer em outro componente, e também cobre o usuário que muda o destino e depois volta ao original.
- **Alternativas consideradas** (conversa de exploração): (A) sempre derivar, o que perde "Sala da comissão" na ida e volta; (C) salvar o destino, que amplia o escopo sem especificação.

### 3. Texto do fecho por um formatador próprio

`formatarLocalDataFecho(local, data?)`: com data, `"<local>, <dia> de <mês> de <ano>."`; sem data, `"<local>,"`. O dia 1 vira `1º`, e os demais ficam sem zero à esquerda. Faz a conversão sobre o texto `AAAA-MM-DD`, sem `new Date(...)`, que em UTC-3 transformaria `2026-04-24` em dia 23. Reaproveita apenas a lista de meses; `getDataPorExtenso` não muda, porque tem outro uso (epígrafe).

### 4. Data omitida em vez de vazia

"Não informar" omite o atributo, porque `xsd:date` não aceita `''`. Na leitura, ausente e `''` são equivalentes, como pede a especificação ("podendo também aparecer com valor vazio").

### 5. Modo anexo de parecer

Nenhum dado do fecho é gravado. É coerente com `removerDadosNaoAplicaveisAoAnexoParecer`, que já remove `local`, e com a data forçada a `''` nesse modo. Na leitura, o modo anexo de parecer continua forçando a data a `''`.

### 6. Integração com o CLI real

O cenário novo cria o documento com local e data e faz a ida e volta completa pelo CLI (`toxml` + XSD + `tojson`). `ParteFinal`/`LocalDataFecho` **precisa voltar igual**, e isso é garantido de fato, ao contrário do `lexedit`. Os atributos `lexedit.local`/`lexedit.data` seguem a limitação já registrada na c01, e a comparação os exclui, como no cenário das opções de impressão.

### 7. Normalização da data do campo no caminho de salvar (encontrada na implementação)

O campo "Data" não guarda só `AAAA-MM-DD` ou `''`. `new Proposicao()` tem `dataUltimaModificacao = new Date().toISOString()`, e `setProposicao` copia esse valor para o campo. Assim, em todo documento novo ou aberto, o campo fica com um timestamp **UTC** (ex.: `2026-09-23T01:47:41.174Z` às 22h47 do dia 22 em UTC-3). Verificado por sonda no componente real: a opção "Data" fica marcada, mas o `<input type="date">` nativo, que não aceita timestamp, aparece **em branco**. Gravado direto, o valor seria um `xsd:date` inválido, diferente a cada chamada, e o texto do fecho sairia sem data. O teste de componente que abre, salva, reabre e compara quebrou por isso.

`normalizarDataFecho(valor)`, usada só em `getDocumentoArticulado`: `AAAA-MM-DD` passa como está; um timestamp ISO vira a data **local** (`getFullYear`/`getMonth`/`getDate`), porque a opção "Data" marcada indica data informada, e o "hoje" local é o que o `DataComponent` já assume para o campo vazio; qualquer outro valor vira `undefined`.

- **Alternativas consideradas:** (2) tratar tudo que não é `AAAA-MM-DD` como não informada, o que contradiz a tela, onde "Data" aparece marcada; (3) corrigir a origem em `setProposicao`, o que mudaria `getProposicao().dataUltimaModificacao`, parte do contrato com o host, e invadiria a issue 11.
- **Fora do escopo:** o campo em branco com a opção "Data" marcada (comportamento antigo) e a mistura "última modificação" × "data do fecho" no mesmo campo, que fica para a issue 11.

## Risks / Trade-offs

- **[Trade-off] Documento novo salva a data de hoje sem que ela apareça na tela.** Consequência da Decisão 7: reflete a opção "Data" marcada, mas o campo em branco (comportamento antigo) não mostra o valor. → Registrado; a correção da tela depende de separar "última modificação" e "data do fecho" (issue 11).

- **[Risco] Local divergente do destino exibido.** Se o arquivo veio de uma comissão e o destino, por não ser salvo, aparece como Plenário, o documento salvo mantém "Sala da comissão" enquanto a aba Destino mostra Plenário. → Aceito e documentado: é o comportamento que preserva o dado do usuário até o destino passar a ser salvo; a pendência fica no roteiro.
- **[Trade-off] Snapshot compara só `tipoColegiado` e `siglaComissao`.** Mudanças em outros campos do destino (`siglaCasaLegislativa`) não afetam o local, porque a derivação atual não depende deles.
- **[Risco] Caminho legado `getProjetoAtualizado()`.** Um `ParteFinal` vindo de um arquivo aberto continua desatualizado na `Proposicao` entregue ao host. → Fora do escopo (Non-Goals); o caminho de salvar do documento articulado não usa esse método.
- **[Risco] O formato `lexedit` será migrado** para o do novo executável. → O montador e o leitor isolam o formato, como na c01.
- **[Risco, observado e não confirmado] O "hoje" padrão do `DataComponent` é UTC.** `updated()` preenche o campo vazio com `new Date().toISOString().replace(/T.+$/, '')`, que depois das 21h em UTC-3 é o dia seguinte; o componente tem um `getCurrentDate()` com a data local, sem uso. Um arquivo salvo manualmente pelo demo às 23h08 de 22/09 saiu com `data` `2026-09-23`. O caminho "abrir → marcar Data → salvar", reproduzido por sonda, grava a data local correta (graças à Decisão 7), e a origem exata do dia 23 não foi reproduzida. → Fora do escopo desta change; a correção (usar a data local no `DataComponent`) fica como bug a confirmar.
