# Design

## Context

Ver `proposal.md` (Why) e `specs/pena-dispositivo/spec.md` (comportamento). Estado atual e restrições que moldam o desenho:

- **LexML.** `Pena` é um `DispositivoType` próprio (`schemas/lexml-simples.xsd:20`), declarado como último elemento opcional (0..1) de qualquer `DispositivoType`, **depois** do grupo `LXcontainersOmissis` (`:581`). No JSONIX ele não é item de `lXcontainersOmissis`: é a propriedade irmã `value.pena`.
- **Código.** Não há nenhum suporte. `buildProjetoNormaFromJsonix.ts` ignora `value.pena`, então a pena é descartada ao abrir e ao colar.
- **Árvore.** `Artigo.filhos` é calculado como `caput.filhos + paragrafos` (`hierarquiaArtigo.ts:17`); o caput nunca está em `artigo.filhos` (invariante n do CLAUDE.md). As linhas do editor saem de uma travessia recursiva de `filhos` (`createElementos`, `elementoUtil.ts:172`).
- **Esquema do LexEdit.** O choice de `lexedit:RevisaoArticulacao` não aceitava `Pena`, o que impediria gravar a pena excluída e o estado anterior da pena alterada. A issue #1040 acrescentou `lexml:Pena` em `schemas/lexedit.xsd`, que é o original copiado para o `jsonix-lexml`.
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

Exceções: DL 3.688, arts. 40 (";") e 46 ("."), texto de 1941. Duas penas no art. 24-A da Lei 11.340 são artefato do Planalto (redação antiga sem tachado), não um caso real.

### Conversão da pena pelo CLI

Verificado em 23/10/2026 com o `jsonix-lexml` 2.3.0 (revisão `d6aa790`), cujos esquemas são idênticos aos de `schemas/`. Um XML com três penas fez a ida e volta XML → JSON → XML. A primeira era a pena de um parágrafo na articulação, com id. A segunda era o estado anterior de uma revisão `alterado`, sem id e com o rótulo anterior. A terceira era uma pena excluída, com id `_<base>-exc1`. Os dois arquivos de saída foram gerados. No JSON, cada pena é a propriedade `pena` (`br_gov_lexml__1.DispositivoType`, com `rotulo` como texto), e as três voltaram iguais no XML, que é válido pelo `schemas/lexedit.xsd`. Falta conferir a pena do `Caput`.

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

Alternativas descartadas:
- `alteracaoRotulo;<arg>`: o argumento é o id anterior, e o id da pena não muda com o rótulo. Sobrecarregar o argumento mudaria uma semântica que já é gravada em arquivo.
- Não revisar o rótulo: deixaria uma lacuna conhecida.

### 8. Bloco de alteração
- A pena tem Existente/Novo, como os demais dispositivos do bloco, e entra em `SituacaoNaNormaVigente` pelo id `<pai>_pena`.
- É aceita depois do caput omissis ("Art. 213. ..... / Pena – ..."), o padrão de alteração mais comum no corpus.
- Aspas e "(NR)" ficam na linha da pena quando ela é a última (`isUltimaAlteracao`).
- **Sem** "Converter em omissis" e "Adicionar omissis depois" na pena. O omissis que no corpus vem depois da pena é irmão do dono, e é criado pelo menu do dono ("Adicionar omissis depois" do dono, que já insere depois da subárvore).

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

- [O CLI `jsonix-lexml` não converter `Pena`, ou falhar em silêncio, porque já saiu com código 0 em erro antes (item 13 do CLAUDE.md)] → Mitigado: o CLI 2.3.0 converte a pena na articulação e em `RevisaoArticulacao` (ver "Conversão da pena pelo CLI"). A task 1.1 completa a prova com a pena do `Caput`, e a task 8.4 cobre a conversão na integração.
- [Leitura de `filhos` fora das guardas conhecidas trata a pena como uma subdivisão comum] → Inventário completo na task 1; testes de cada operação "com e sem pena" na task 4, como a issue pede.
- [O exemplo da issue e os textos antigos passam a mostrar aviso de pontuação] → Aceito: o aviso não bloqueia. A divergência é comentada na issue.
- [Enter na pena do caput cria o § 1º, e um usuário que esperava um artigo novo se surpreende] → Segue o padrão mais comum do corpus (43 contra 17) e o que fica logo abaixo na tela. Fica registrado no cenário da spec.
- [Pena com vários `p` no arquivo] → O leitor já concatena os `p` de um dispositivo num texto único (`buildContentDispositivo`). Nenhum caso no corpus.
- [Transformação Parágrafo ↔ Artigo perder a pena ou deixá-la fora do caput] → Cenário explícito na spec e teste de reducer.

## Migration Plan

Não há migração de dados. Arquivos antigos sem pena abrem como hoje. Arquivos com pena, que antes perdiam a pena em silêncio, passam a preservá-la. Os rótulos com hífen são regravados com " –" no próximo salvamento. Não há quebra de API do componente.
