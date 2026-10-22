# Design

## Context

Ver `proposal.md` (Why) e `specs/pena-dispositivo/spec.md` (comportamento). Estado atual e restrições que moldam o desenho:

- **LexML.** `Pena` é um `DispositivoType` próprio (`schemas/lexml-simples.xsd:20`), declarado como último elemento opcional (0..1) de qualquer `DispositivoType`, **depois** do grupo `LXcontainersOmissis` (`:581`). No JSONIX ele não é item de `lXcontainersOmissis`: é a propriedade irmã `value.pena`.
- **Código.** Não há nenhum suporte. `buildProjetoNormaFromJsonix.ts` ignora `value.pena`, então a pena é descartada ao abrir e ao colar.
- **Árvore.** `Artigo.filhos` é calculado como `caput.filhos + paragrafos` (`hierarquiaArtigo.ts:17`); o caput nunca está em `artigo.filhos` (invariante n do CLAUDE.md). As linhas do editor saem de uma travessia recursiva de `filhos` (`createElementos`, `elementoUtil.ts:172`).
- **Precedente.** O título de dispositivo (change `2026-10-06-c01-editar-titulo-dispositivo` e seguintes) serve de molde para as ações de menu, o diálogo, a validação e a revisão `alterado` com estado anterior, mas **não** para a exibição: o título fica na linha do próprio dispositivo, e a pena fica depois da subárvore.

### Evidência de uso real (corpus)

Foram analisadas 6 leis (Leis 10.826/2003, 9.605/1998, 8.072/1990, 11.343/2006, 11.340/2006 e DL 3.688/1941), baixadas do Planalto, sem os trechos tachados, num total de **116 linhas de pena**:

| Padrão | Ocorrências | Exemplo |
|---|---|---|
| Pena do caput, seguida de parágrafo, artigo ou epígrafe | ~90 | Lei 9.605, art. 38-A |
| Pena de parágrafo | ~10 | Lei 11.340, art. 129 § 9º (em alteração) |
| Pena depois dos incisos do dono; último inciso termina em ":" | 6 de 6 | DL 3.688, art. 42, IV; Lei 9.605, art. 54 § 2º, V |
| Caput omissis + pena, em bloco de alteração | 8 | Lei 8.072: "Art. 213. ...... / Pena – reclusão, de seis a dez anos." |
| Pena seguida de omissis (no nível do dono ou acima) | 6 | Lei 8.072; Lei 11.340 § 9º |
| Texto da pena começando com minúscula | 116 de 116 | "Pena – reclusão…", "– detenção…", "– prisão simples…", "– multa…" |
| Rótulo diferente de "Pena" | 0 | separadores "-", "–" e U+0096 |
| Pena por inciso, alínea ou item | 0 | só no CP, art. 197 (fora do corpus) |

Exceções: DL 3.688, arts. 40 (";") e 46 ("."), texto de 1941. Como as 6 penas depois de incisos têm ":" sem exceção, as duas exceções são penas que seguem outro dispositivo (o total dessas não foi recontado). Duas penas no art. 24-A da Lei 11.340 são artefato do Planalto (redação antiga sem tachado), não um caso real.

## Goals / Non-Goals

**Goals:**
- Pena completa para todos os donos previstos no XSD, dentro e fora de alteração, com undo/redo, revisão e ida e volta pelo arquivo e pelo CLI real.
- Nenhuma operação existente consegue deixar a pena fora da última posição.

**Non-Goals:**
- Pena como destino de remissão interna e texto canônico "pena do inciso I" (ver decisão 11).
- Casos especiais do colar sobre a pena ou colar substituindo um dono com pena: ficam na pendência "Rever colar dispositivos" de `docs/requisitos/pendencias.md`.
- Revisão `alteracaoRotulo` para a pena (ver decisão 7).

## Decisions

### 1. Exibição abaixo da subárvore do dono
Como na lei impressa. Mostrar a pena junto do dono, como o título, deixaria visualmente errado um § 2º com incisos.

### 2. Escopo: todos os donos, inclusive em alteração
Caput, Parágrafo, Inciso, Alínea e Item, dentro e fora de bloco de alteração. Um subconjunto só existe como etapa validável (task 2).

### 3. Pena como último filho (opção B)
A pena é um `Dispositivo` do tipo `Pena` na lista `filhos` do dono, sempre na última posição. A invariante é garantida num ponto único: `addFilho`/`addFilhoOnPosition` de `HierarquiaDispositivo` e `HierarquiaArtigo` limitam a posição de inserção a antes da pena, e `HierarquiaArtigo` encaminha a pena para o Caput.

Alternativas consideradas:
- **A. Campo `pena?: string` com exibição "pendurada"**: modelo simples, mas a linha do último descendente teria de desenhar a pena de um ancestral, e mudaria a cada inclusão ou movimentação de filho.
- **C. `Dispositivo` fora de `filhos`** (molde do preâmbulo, `projetoNorma.preambulo`): espelha o JSONIX e não afeta as regras de "último filho", mas exigiria código próprio para ordem das linhas, pena do caput, undo/redo, revisão, bloco de alteração e eventos.

Escolhida a **B** porque vem de graça: a ordem das linhas (travessia de `filhos`), a pena do caput entre incisos e parágrafos (`Artigo.filhos` calculado), undo/redo, revisão, alteração e eventos de inclusão e remoção. A numeração dos irmãos não é afetada, porque `irmaosMesmoTipo` filtra por tipo. O custo são guardas pontuais. A conversão para JSONIX tem o mesmo caso especial nas três opções, então o formato do arquivo não diferencia as alternativas.

### 4. Pontuação: regra única e estrita
O dispositivo imediatamente anterior à pena, na ordem de leitura (`getDispositivoAnteriorNaSequenciaDeLeitura`), termina em ":", fora e dentro de alteração, exceto quando é omissis. Isso cobre o dono sem outros filhos (o que já sai de `hasFilhos`) e o último descendente antes da pena de um ancestral. É preciso **isentar** esse dispositivo das exigências de "." de último de enumeração (`conteudoValidator.ts:137` e `:280`) e acrescentar a exigência de ":". A pena em si não tem regra de pontuação.

Alternativa descartada: aceitar "." ou ":" no último inciso. O corpus é 6 de 6 com ":", e o exemplo XML da issue ("segundo inciso.") é dado de teste.

### 5. Inicial minúscula na pena
Mesma regra e mensagem dos incisos, alíneas e itens (`conteudoValidator.ts:79`), com a exceção de nome próprio. Diverge do texto da issue ("iniciar com maiúscula"), que contradiz 116 de 116 casos reais e o próprio exemplo XML. A divergência deve ser comentada na issue #1019.

### 6. Rótulo
- `dispositivo.rotulo` guarda o rótulo completo ("Pena –").
- A **identidade** é o texto antes do separador, sem espaços nas pontas, comparada sem diferenciar maiúsculas com a lista Pena, Penalidade, Medida Administrativa e Infração; o que não bater é "Outro".
- Na leitura (arquivo e colar), o separador aceito é hífen, "–", "—" ou U+0096, sempre regravado como " –", sem gerar revisão.
- "Alterar rótulo" vale só para a pena escolhida. O "rótulo da primeira pena do documento" é só o valor padrão ao adicionar (pela identidade, na ordem de leitura).
- A pena usa uma numeração própria que preserva o rótulo: `createRotulo` não o recalcula, ao contrário de `NumeracaoIndisponivel`, que o apagaria. `buildHref` devolve `<id do pai>_pena`.

### 7. Revisão do rótulo como `alterado`
A troca de rótulo vira `alterado`, e o estado anterior (`buildJsonixEstadoAnterior` / `lerEstadoAnterior`) passa a carregar o `Rotulo` quando o dispositivo é pena. O que entra:
- `isMesmoTextoETitulo` (`revisaoUtil.ts:642`) passa a comparar também o rótulo da pena, senão a troca não gera revisão.
- A descrição segue o padrão do título (`revisaoUtil.ts:112-116`), comparando o `antes` com o `apos`: "Rótulo do dispositivo foi alterado" ou "Texto e rótulo do dispositivo foram alterados". O `antes` existe na sessão e é reconstruído ao reabrir, então a descrição fica igual nos dois casos (invariante aa).
- `rejeitaRevisao` restaura o rótulo.
- **Formato (6.3):** o estado anterior da pena vai em `<Pena>` filho de `RevisaoArticulacao`, sem `id`, com o `Rotulo` só quando mudou (ausente = igual ao atual) e o texto em `p`. A revisão `excluido` da pena grava a própria `<Pena id="_<base>-exc<n>">` no mesmo lugar. Nada disso cabia no `schemas/lexedit.xsd`: o `choice` de `RevisaoArticulacao` não listava `Pena`, e o validador rejeitava (exit 1). Acrescentados `lexml:Pena` ao `choice` e `pena` a `NOMES_DISPOSITIVO_NA_REVISAO` (`buildProjetoNormaFromJsonix.ts`); sem o segundo, a revisão `excluido` da pena era descartada na leitura.
- **Dependência do CLI:** o `jsonix-lexml` 2.1.0 **descarta sem erro** o `Pena` direto em `RevisaoArticulacao` (testado: na volta não há pena). Perde-se o estado anterior inteiro da revisão `alterado` da pena (texto também, não só o rótulo) e a revisão `excluido` da pena. Pena dentro de um artigo excluído passa normalmente. A correção é o `jsonix-lexml` 2.2.0 com o `choice` atualizado, e o CLI novo no `lexeditweb-editor`. Até lá, revisões de pena se perdem em silêncio no salvamento.
- Não se usa `DispositivoGenerico` como contorno.

Alternativas descartadas:
- `alteracaoRotulo;<arg>`: o argumento é o id anterior, e o id da pena não muda com o rótulo. Sobrecarregar o argumento mudaria uma semântica que já é gravada em arquivo.
- Não revisar o rótulo: deixaria uma lacuna conhecida.

### 8. Bloco de alteração
- A pena tem Existente/Novo, como os demais dispositivos do bloco, e entra em `SituacaoNaNormaVigente` pelo id `<pai>_pena`.
- É aceita depois do caput omissis ("Art. 213. ..... / Pena – ..."), o padrão de alteração mais comum no corpus.
- Aspas e "(NR)" ficam na linha da pena quando ela é a última (`isUltimaAlteracao`).
- **Sem** "Converter em omissis" e "Adicionar omissis depois" na pena. O omissis que no corpus vem depois da pena é irmão do dono, e o caminho é: Enter no fim da pena cria o irmão do dono e "Linha pontilhada" o converte em omissis (não existe "Adicionar omissis depois" no menu do dono).
- A última pena do bloco sai dele como os demais dispositivos: com o texto terminando em ” (NR), o Enter cria o artigo seguinte fora do bloco (`podeSerUltimaalteracao`); com ação de bloco, segue o caminho comum; nos demais casos o Enter cria o irmão do dono (decisão 13). O menu da pena oferece "Adicionar alteração de norma" quando ela é a última do artigo.

### 9. Pena imóvel
Sem mover, TAB/Shift-TAB, renumerar nem omissis. A pena acompanha o dono ao mover, transformar e remover. A transformação Parágrafo ↔ Artigo tem de levar a pena para o caput e de volta (`transformaTipoElemento.ts` redistribui os filhos), e isso precisa de teste.

### 10. Artigo que carrega bloco de alteração
Sem pena própria. `getUltimoFilho` e `buildListaDispositivos` olham `alteracoes` quando ela existe, então a ambiguidade é eliminada na regra do menu e na guarda do reducer.

### 11. Remissão interna
A pena fica fora dos destinos do diálogo e da detecção, pelo nome do tipo, no molde do preâmbulo (invariante ag). Não existe texto canônico para "pena do inciso I", nem regra de atualização (D4). O texto da pena tem remissões internas e externas normalmente.

### 12. Colar: só o mínimo
`buildDispositivoFromJsonix` lê `value.pena`. A pena entra na posição correta pela invariante da decisão 3. O parser externo (`colarUtil.ts:244`) já reconhece "Pena –".

### 13. Teclado
- **Enter no fim da pena**: cria um irmão do dono, logo depois dele; na pena do caput, cria o primeiro parágrafo. A tecla é tratada no reducer de adicionar, com a referência ajustada para o dono, e não em `eta-keyboard.ts`.
- **Enter antes do fim**: não faz nada, porque não há desmembramento.
- **Vazio + Backspace/Delete e Ctrl+D**: removem, como já acontece.
- **TAB e Alt+setas**: não fazem nada.

### 14. Paginação
É segura por construção. As páginas quebram em fronteira de artigo, e `getUltimoFilho(artigo)` já devolve a pena quando ela é o último descendente (ela está em `caput.filhos` ou nos `filhos` do parágrafo). O teste de prefixo `id.startsWith('art')` (`paginacaoUtil.ts:75`) funciona porque `<pai>_pena` herda o prefixo `art…`. A inserção incremental e os excluídos em revisão usam a ordem de leitura. Fica coberta por teste unitário de fronteira.

### Pontos de guarda conhecidos (inventário inicial)

| Ponto | Problema | Local |
|---|---|---|
| `addFilho` sem referência | `push` iria para depois da pena | `hierarquiaDispositivo.ts:13`, `hierarquiaArtigo.ts:62` |
| Adicionar "filho" | usa o último de `filhos` como referência | `adicionaElemento.ts:42` |
| Posição da linha no Quill | `getUltimoFilho` / referência do evento | `eventosUtil.ts:167`, `autoFixElemento.ts:89` |
| Pena do artigo | o que não é inciso vai para `paragrafos` | `hierarquiaArtigo.ts:41-47` |
| Validação | 26 chamadas de `hasFilhos`, sobretudo as regras de pontuação | `conteudoValidator.ts:90-277` |
| Menus | mover, transformar, omissis e renumerar na pena e no penúltimo | `src/model/lexml/regras/` |
| Id | `buildHref` geraria `pena[sn:uuid]` | `idUtil.ts:7` |

A primeira tarefa da implementação completa esse inventário varrendo as 205 leituras de `.filhos`.

## Risks / Trade-offs

- [O CLI `jsonix-lexml` 2.1.0 não converter `Pena`, ou falhar em silêncio, porque já saiu com código 0 em erro antes (item 13 do CLAUDE.md)] → A primeira subtask é uma prova de ida e volta real, que confere se o arquivo de saída existe e se a pena está nele, antes de qualquer outro código.
- [Leitura de `filhos` fora das guardas conhecidas trata a pena como uma subdivisão comum] → Inventário completo na task 1; testes de cada operação "com e sem pena" na task 4, como a issue pede.
- [O exemplo da issue e os textos antigos passam a mostrar aviso de pontuação] → Aceito: o aviso não bloqueia. A divergência é comentada na issue.
- [Enter na pena do caput cria o § 1º, e um usuário que esperava um artigo novo se surpreende] → Segue o padrão mais comum do corpus (43 contra 17) e o que fica logo abaixo na tela. Fica registrado no cenário da spec.
- [Pena com vários `p` no arquivo] → O leitor já concatena os `p` de um dispositivo num texto único (`buildContentDispositivo`). Nenhum caso no corpus.
- [Transformação Parágrafo ↔ Artigo perder a pena ou deixá-la fora do caput] → Cenário explícito na spec e teste de reducer.
- [A linha da pena no Quill ficar com o `lexmlId` desatualizado quando o dono é renumerado, porque o evento `ElementoRenumerado` só leva os irmãos do mesmo tipo, como já ocorre com alíneas e itens] → Aceito: as ações localizam a pena pelo uuid e o arquivo é gravado a partir do modelo, cujos ids acompanham o dono (testado). Se aparecer efeito visível, reavaliar.

- [O `jsonix-lexml` 2.1.0 descarta, sem erro, `Pena` como filho direto de `RevisaoArticulacao`] → Dependência do `jsonix-lexml` 2.2.0 (com `lexml:Pena` no `choice` de `RevisaoArticulacao`, como em `schemas/lexedit.xsd` já ajustado aqui) e da atualização do CLI no `lexeditweb-editor`. Até lá, as revisões `alterado` e `excluido` de pena se perdem em silêncio ao salvar; o editor e os testes locais (ida e volta pelo JSONIX e `npm run verify:xsd-lexedit`) já cobrem o formato. O cenário de revisão de pena da task 8.4 fica marcado como dependente do CLI novo.
- [Revisão `excluido` de dispositivo que não seja artigo dentro de bloco de alteração não é reconstruída ao abrir] → Limitação anterior a esta change, vista na 6.3 com a pena em bloco: o id do excluído sai com o artigo hospedeiro sem número (`_art1_cpt_alt1_art[sn:13]_cpt_pena-exc1`) e a leitura não acha o lugar. Vale igual para parágrafo (`..._art[sn:27]_par1-exc1`). Não corrigida aqui; fica para outra issue.
- [Arquivo que já aponte uma remissão para um id terminado em `_pena`] → Ao abrir, a remissão resolve por id e viraria link para a pena. O filtro (`podeSerDestinoDeRemissaoInterna`) só protege o diálogo e a detecção, e o editor não produz esse arquivo. Aceito, sem tratamento nesta change; se um arquivo externo aparecer assim, tratar na abertura.

## Migration Plan

Não há migração de dados. Arquivos antigos sem pena abrem como hoje. Arquivos com pena, que antes perdiam a pena em silêncio, passam a preservá-la. Os rótulos com hífen são regravados com " –" no próximo salvamento. Não há quebra de API do componente.

## Resultado da task 1.1 (ida e volta de `Pena` pelo CLI real)

Executada em 19/10/2026 com o `jsonix-lexml` **2.1.0** (`jsonix-lexml-win.exe --version`), `schemas/lexedit.xsd` e `scripts/ValidarDocumentoLexml.java`. O arquivo de saída foi conferido em cada conversão (o CLI sai com código 0 em erro).

- **XML montado** a partir do exemplo do formato, com pena no Caput, em Inciso, em Parágrafo (depois dos incisos), rótulo "Infração -" e pena em bloco de alteração depois de caput omissis, com `fechaAspas`/`notaAlteracao`: válido no XSD; `tojson` e `toxml` de volta geram as quatro penas com os mesmos atributos, rótulo e texto, e o XML de volta também é válido. Controle negativo: uma `Pena` antes do `Rotulo`/`p` é rejeitada pelo validador (exit 1), então a validação é real.
- **Forma no JSON:** `pena` é irmã de `lXcontainersOmissis` (`value.pena`), com `rotulo` em **texto simples** (não objeto), `id`, `href`, `fechaAspas`, `notaAlteracao` e `p: [{ content: [...] }]`. Em Parágrafo, Inciso, Caput e dentro de `alteracao`.
- **Amostras reais** de `jsonix-lexml/samples` (PLC 110/2017, PLS 312, 324 e 457/2017: 1, 2, 1 e 9 penas, em bloco de alteração): todas as penas voltam idênticas (atributos, rótulo, texto); só muda o espaço em branco entre `Rotulo` e `p`. Três das quatro voltam válidas no XSD; a PLC 110 já é inválida no original (ID duplicado, sem relação com `Pena`).
- **Limitação:** a prova partiu de XML (`tojson` → `toxml`), não de um JSON escrito à mão; o `toxml` foi exercitado com o JSON que o próprio CLI gerou. A conferência do JSON que o editor produz fica para a task 8.4.

### Onde estão o CLI e as amostras (para as tasks 8.2 e 8.4)

- **CLI `jsonix-lexml` 2.1.0:** `C:\desenv\arquivos\jsonix-lexml-win.exe` (valor de `JSONIX_LEXML_CLI` para `npm run test:documento-articulado:xml`). O do `lexeditweb-editor` é o 0.0.1, anterior ao 2.0.0, e não serve.
- **Amostras reais de XML LexML:** `C:\desenv\workspace\jsonix-lexml\samples` (1059 arquivos). Têm `Pena` (todas em bloco de alteração): `senado.federal#projeto.lei=plc#2017=110.xml`, `...=pls#2017=312@...`, `...=pls#2017=324@...` e `...=pls#2017=457@...`. Úteis como fixtures de leitura e para a integração com o CLI real.

## Inventário completo de guardas (task 1.2)

Varredura de `.filhos`, `hasFilhos`, `getUltimoFilho`, `isLastFilho`, `getDispositivoAnterior/Posterior`, `isUltimaEnumeracao`, `isUltimoMesmoTipo`, `getIrmao*IndependenteDeTipo` e `tiposPermitidos*` em `src/` (205 leituras de `.filhos` e 36 de `hasFilhos`, mais as da validação). A pena é um filho do tipo `Pena` na lista `filhos` do dono (Caput, Parágrafo, Inciso, Alínea ou Item).

### Precisa de guarda

| # | Ponto | Problema | Guarda |
|---|---|---|---|
| G1 | `hierarquiaDispositivo.ts` `addFilho`/`addFilhoOnPosition` | `push` e `splice` com posição além do fim põem o filho depois da pena | Limitar a posição de inserção a antes da pena (ponto único; cobre `criaDispositivo` com e sem referência/posição) |
| G2 | `hierarquiaArtigo.ts` `addFilho`/`addFilhoOnPosition`/`removeFilho`/`addParagrafo`/`indexOf` | O que não é inciso vai para `paragrafos`; a pena iria para depois dos parágrafos | Encaminhar `Pena` ao Caput (`caput.addFilho`/`removeFilho`) |
| G3 | `tipoDispositivo.ts` `tiposPermitidosFilhos`, lido em `regrasArtigo:135`, `regrasParagrafo:110`, `regrasInciso:139`, `regrasAlinea:104`, `regrasItem:84` (`getAcaoPossivelTab`: `map(...)[0]`) | Esses `map` procuram uma ação `transformar<Dono>Em<Tipo>`; a `Pena` não gera ação de Tab porque **não existe** nenhuma `transformar<X>EmPena` (para o Item, `['Pena']` é o primeiro e único tipo, e o resultado é `undefined`; nos demais a pena está por último e o `[0]` é outro tipo) | Incluir `Pena` em `tiposPermitidosFilhos` (necessário a `hierarquiaValidator:23,64`, colar e `eventosUtil:175`) **sem** criar ação de transformação em pena; teste na 2.1 afirmando que Tab em Inciso, Alínea e Item não oferece transformação em pena |
| G4 | `hierarquiaValidator.ts:23,53,64` | Pena como filho inválido; Item hoje tem `tiposPermitidosFilhos: []` | Coberto por G3 e por `tiposPermitidosPai` da pena (os cinco donos) |
| G5 | `hierarquiaUtil.ts` `getDispositivoPosterior` (:405), `getIrmaoPosteriorIndependenteDeTipo` (:441), `getDispositivoPosteriorMesmoTipoInclusiveOmissis` (:430) | O "posterior" do último inciso ou parágrafo passa a ser a pena | Manter as funções; regras de menu e `moveElementoAbaixo:37` tratam posterior do tipo `Pena` como "não há posterior" (mover para baixo não é oferecido) |
| G6 | `hierarquiaUtil.ts` `isUltimaEnumeracao` (:597) | `getDispositivoPosterior` devolve a pena, então o último inciso antes da pena deixa de ser "último da enumeração" e cai na regra de ";" | Tratar a pena como ausente aqui e aplicar a regra de ":" da decisão 4 |
| G7 | `conteudoValidator.ts` :86-95, :129-140, :269-283 | Exigência de ";" e "." no dispositivo anterior à pena; `hasFilhos(dono)` com só a pena já exige ":" (correto) | Decisão 4: exigir ":" e isentar das duas regras, inclusive nos ancestrais (último descendente antes da pena do ancestral) |
| G8 | `conteudoValidator.ts` :69-84 | Inicial minúscula vale só para `isDispositivoDeArtigo` | Incluir a pena na mesma regra (decisão 5); a pena **não** entra em `isDispositivoDeArtigo` (isso também mantém `buscaDispositivoDeArtigoPosterior:588` ignorando a pena) |
| G9 | `adicionaElemento.ts:42` | Posição "filho" usa o último de `filhos` como referência | Usar o último filho que não é pena |
| G10 | `adicionaElemento.ts:33,61` e `dispositivoLexmlFactory.ts` `createFromReferencia*` (:248-296) | "Posição seguinte", `referencia.pai.filhos.length > 0` e `isLastFilho` contam a pena; Enter no fim do dono com ":" deve criar o filho antes da pena | Revisar os três; Enter na pena: decisão 13 |
| G11 | `eventosUtil.ts:123,154-171,204-209` | `posNoPaiNovo = pai.filhos.length` e referência com `getUltimoFilho` | Posição calculada sobre os filhos que não são pena |
| G12 | `undoRedoReducerUtil.ts:160,318-321`, `reconstroiRevisoes.ts:97-99,221-227`, `rejeitaRevisao.ts:301`, `revisaoUtil.ts:460,665-716` | Reinclusão por posição ou referência | Cobertos por G1; testar desfazer, refazer e rejeitar com pena |
| G13 | `adicionaElementosFromClipboard.ts:73,90-91`, `adicionaElementosNaProposicaoFromClipboard.ts:181,308-310`, `colarUtil.ts:352-359,467` | `referencia = getUltimoFilho(atual)` pode ser a pena; usam `tiposPermitidosFilhos` | Cobertos por G1 e G3; a pena colada entra pelo leitor (1.6) |
| G14 | `transformaTipoElemento.ts` (:40, :99), `moveElementoAcima.ts:101`, `moveElementoAbaixo.ts:69-76` | A pena deve acompanhar o dono e, no Parágrafo ↔ Artigo, ficar no Caput | Teste de reducer. Só G1/G2 não bastaram: `converteFilhos` (Tab, Shift+Tab e Parágrafo ↔ Artigo) convertia a pena em outro tipo e a perdia quando o destino não tem tipo provável de filho (Item); corrigido na 4.2 recriando a pena sem mudar de tipo |
| G15 | `regrasUtil.ts:36-39,63` e `regras*.ts` | `filhos.length === 0` (:36, omissis) e `filhos.some(!bloqueado)` (:63) contam a pena; `isUltimoMesmoTipo`/`isUnicoMesmoTipo` filtram por tipo e não contam | Ajustar :36 e :63; regras próprias da pena (2.1) |
| G16 | `buildJsonixFromProjetoNorma.ts:295,303` | A pena entraria em `lXcontainersOmissis` | Emitir em `value.pena` (1.5) |
| G17 | `elementoUtil.ts:152,300-302,345`, `getFilhosArtigoEstiloLexML`/`getParagrafosEOmissis` | `createElementos` segue `filhos` (correto) | Só confirmar a ordem das linhas (1.7) |
| G18 | `BlocoAlteracaoPermitido.ts:8`, `regrasArtigo.ts:93` | Artigo com bloco de alteração não aceita pena própria | Decisão 10 (5.1) |
| G19 | `dispositivoLexmlUtil.ts:23-37,114-125` e `isUltimaAlteracao` | A pena pode ser o último dispositivo do bloco (aspas e "(NR)") | Sem código em `isUltimaAlteracao`: a pena, último filho do dono, já é o último da lista e fecha as aspas do artigo do bloco; o caput antes dela deixa de fechar (task 5.1). O menu da pena ganhou Existente/Novo e a nota de alteração (`podeEditarNotaAlteracao`) |
| G20 | `paginacaoUtil.ts:77,128,167` | Usa `getUltimoFilho`, que já devolve a pena | Sem código (decisão 14); só teste de fronteira (7.2). Antes estava na lista "não afetado", sem número, e o G20 sumiu da tabela por engano |
| G21 | `idUtil.ts` `buildHref` | Sem `numero` devolveria `pena[sn:uuid]` | Tratar `Pena` como o Caput (sem `numero`), sufixo `pena` (1.3) |
| G22 | `hierarquiaDispositivo.ts:52-60` `renumeraFilhos` e `NumeracaoIndisponivel` | `renumeraFilhos` chama `calculaNumeracao`/`createRotulo` em **todos** os filhos; `NumeracaoIndisponivel` apagaria o rótulo | Numeração própria da pena que preserva o rótulo e `calculaNumeracao` sem efeito para a pena (1.3) |
| G23 | `hierarquiaValidator.ts:65-68` ("somente poderia possuir Alinea, Pena") e `colarUtil.ts:359` (lista de `tiposPermitidosFilhos` mostrada ao usuário) | A mensagem passaria a citar "Pena" | Tirar a pena dessas listas na task 4.1 |

### Não afetado

- `hierarquiaUtil.ts`: `getUltimoFilho`, `getDispositivoAndFilhosAsLista`/`buildListaDispositivos`, `percorreHierarquiaDispositivos`, `buscaNaHierarquiaDispositivos`, `getDispositivo`/`findDispositivoByUuid` (a pena é filha e é percorrida; no artigo, via `caput`), `getDispositivoAnteriorNaSequenciaDeLeitura`/`PosteriorNaSequenciaDeLeitura` (a pena entra na ordem de leitura, como a decisão 4 quer), `irmaosMesmoTipo` e os `*MesmoTipo*` (filtram por tipo).
- Agrupadores: `hierarquiaAgrupador.ts`, `agrupaElemento.ts`, `informaExistenciaDoElementoNaNorma.ts:116`, `getAgrupadores*`, `hasAgrupador*`, `colarUtil.ts:343`.
- `adicionaRemissaoInterna.ts:331-643` (a pena fica fora dos destinos, decisão 11, task 7.1), `aplicaRevisoes.ts:79` (`par1u`), `reducerUtil.ts:34-35` (reset de uuid percorre a árvore), `removeElemento.ts:97,133` (a captura recursiva leva a pena), `removeElementoSemTexto.ts:35`, `paginacaoUtil.ts` (decisão 14).
- `numeracaoValidator.ts:104,122-152`: compara pelo anterior e por `isLastFilho`; conferir na task 4 que a pena não gera aviso de numeração.
- `parserReferenciaDispositivo.ts:23`: só vale para referências escritas pelo usuário.

### Riscos novos da varredura

- **G3**: a pena só não gera ação de Tab porque não há `transformar<X>EmPena`; criar uma ação assim quebraria isso.
- **G22**: sem numeração própria da pena, o rótulo seria apagado ao incluir ou remover um irmão.
- `buildListaDispositivosParaUltimaAlteracao` (`hierarquiaUtil.ts:511-515`) já visita os incisos do caput duas vezes (`artigo.filhos` os inclui). Com a pena no caput ela também seria visitada duas vezes; sem efeito esperado, mas conferido na 5.1: sem efeito, `isUltimaAlteracao` só olha o último da lista.
- **Bloco de alteração (5.1), achados fora do inventário:** (1) `existeDispositivoSemNumeroNaoOmissis` (`informaExistenciaDoElementoNaNorma.ts`) tratava a pena, sem `numero`, como dispositivo sem numeração e impedia o dono de passar de Existente para Novo; a pena ficou fora da regra. (2) O Enter na pena de bloco criava o irmão sem o preparo de dispositivo de alteração (rótulo a informar, aviso, situação); `adicionaAposPena` passou a fazer o mesmo que `adicionaElemento`. (3) A pena nova nasce existente ou nova como o dono (`!podeRenumerarFilhosAutomaticamente(dono)`). (4) Aspas e nota na troca da última linha do artigo (achado do teste manual): `buildEventoAdicionarElemento` não levava a linha anterior (a pena do caput) nos eventos, que ficava com as aspas duplicadas; e `EtaContainerTable.atualizarAtributos` só atualizava os blots de aspas/nota criados com a linha, então quem passava a ser a última (a pena, ao remover o parágrafo) não as exibia. A linha anterior em ordem de leitura entra em `SituacaoElementoModificada` e o container cria os blots quando faltam.
