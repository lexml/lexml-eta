# Design

## Context

Ver proposal.md (Why) e as specs da change para o comportamento esperado.

Estado atual relevante:

- A unicidade de ids é verificada num ponto único, `validarDocumentoArticulado` (`documentoArticulado.ts`). Ele é chamado por `lerDocumentoArticulado` (abrir, modelo da nova proposição e reabertura de "Alterar dados básicos"), por `criarDocumentoArticulado` (salvar) e por `serializarDocumentoArticulado`. `lerDocumentoArticulado` é exportado pelo pacote.
- O id de um dispositivo é calculado pelo `buildId` a partir do `href` dele (tipo + número) e dos ancestrais, sem os agrupadores no caso dos artigos. Ao salvar, `buildJsonixFromProjetoNorma` grava sempre o `buildId`, e não o id lido do arquivo. Ao abrir, o número vem do rótulo do arquivo.
- Renumeração automática:
  - `renumeraArtigos` renumera todos os artigos da articulação, menos os de bloco de alteração;
  - `renumeraFilhos` renumera os filhos de um pai quando `podeRenumerarFilhosAutomaticamente` permite (texto principal ou pai "Novo").
- As mensagens de um dispositivo vêm de `validaDispositivo`, chamado por dezenas de reducers. `elementoReducer` já tem passagens centrais depois de toda ação (`atualizaMensagemCritical`, que valida todos os dispositivos, `atualizaRevisao` e `sincronizarRemissoesPosAcao`).
- Teste com o CLI `jsonix-lexml` 2.2.0 durante a exploração: um JSON com ids repetidos vira XML e volta a JSON sem perda, mas o XML não valida pelo esquema (`cvc-id.2`). O host não valida o esquema.

## Goals / Non-Goals

**Goals:**
- Não haver custo nem mudança de comportamento no modo rígido.
- Calcular a condição de numeração repetida num ponto único. O alerta, a pendência e o erro usam o mesmo cálculo.
- O erro de um dispositivo não ficar desatualizado quando a ação alterou outro dispositivo.

**Non-Goals:**
- Desambiguar ids no arquivo ou em memória.
- Resolver referências ambíguas para uma ocorrência diferente da primeira.
- Mudar a validação do modo rígido para checar numeração em vez de ids do arquivo (ver Riscos).
- Impedir no diálogo "Renumerar" um número já usado.

## Decisions

### D1. O modo vale por documento e é lido da configuração no início de cada documento

`LexmlEtaConfig.validacaoNumeracao?: 'rigida' | 'flexivel'`. `novaProposicao`, `abrirDocumentoArticulado` e `alterarDadosBasicos` leem o valor da configuração ao começar e o passam explicitamente à leitura (`lerDocumentoArticulado(entrada, { validacaoNumeracao })`). Valor ausente ou desconhecido vira `'rigida'`. Só depois de a leitura dar certo, e antes de `inicializarEdicao`, o modo é registrado num estado de módulo do modelo (`model/lexml/numeracao/validacaoNumeracao.ts`), que valida e salva o documento até a próxima inicialização.

- **Por que não no setter de `lexmlEtaConfig`** (como `inicializarVocabulario`): a demo altera o objeto de configuração diretamente (`this.etaConfig.x = ...`), e o setter não roda. Além disso, mudar o modo no meio da edição faria o documento aberto passar a valer em outro modo.
- **Por que registrar só depois da leitura**: uma chamada recusada não pode mudar o modo do documento que continua em edição (spec "Entrada inválida preserva o documento").
- **Por que um estado de módulo, e não o Redux**: o erro precisa sair de `validaDispositivo`, que é chamado sem acesso ao estado por dezenas de reducers. Se o erro fosse acrescentado só em alguns pontos, cada revalidação de outro reducer o apagaria. É o problema registrado para a remissão inválida, copiada em 8 lugares e com lacunas. O padrão de estado de módulo já existe no vocabulário (item 19 do CLAUDE.md), com o mesmo cuidado nos testes: restaurar `'rigida'` no `afterEach`.
- `lerDocumentoArticulado`, `criarDocumentoArticulado` e `validarDocumentoArticulado` recebem o modo por opção, com padrão `'rigida'`. A API pública continua determinística e compatível. `lexml-eta-proposicao.component.ts#getDocumentoArticulado` passa o modo registrado.

### D2. Tolerância só nos ids montados pela hierarquia

`validarDocumentoArticulado` passa a separar os ids em dois conjuntos:
- os de nós de hierarquia: itens de `lXhier`/`lXcontainersOmissis` (inclusive `Caput`), `pena` e `alteracao`. No modo flexível, esses podem se repetir entre si;
- os demais (`Remissao` `_ri`, ids de tabela, notas e outros). Esses continuam únicos e não podem coincidir com um id de hierarquia.

Assim, um artigo repetido, que repete caput, incisos, pena e alteração por herança, é aceito, e um `_ri` repetido continua sendo recusado. A mensagem de erro do modo rígido não muda.

Alternativa descartada: relaxar todos os ids. Ids de remissão, revisão e comentário não vêm da numeração, e a repetição deles corrompe a reconstrução desses metadados.

### D3. A causa da repetição é detectada localmente, comparando com os anteriores do mesmo grupo

`isNumeracaoRepetida(dispositivo)` (pura, em `model/lexml/numeracao/`) é verdadeira quando algum dispositivo **anterior do mesmo grupo** tem o mesmo `href` (`buildHref`):
- o grupo de um artigo são os artigos da sua articulação (`getArticulacao(d).artigos`), já em ordem de leitura;
- o grupo dos demais dispositivos são os filhos do mesmo pai.

Comparar só dentro do grupo atende à regra "só na causa" sem nenhum teste extra. Os incisos do segundo "Art. 5º" ficam no caput desse artigo, e os artigos de um bloco de alteração herdado ficam em outra articulação de alteração. Nenhum deles é comparado com a primeira ocorrência, embora o `buildId` dos dois se repita. Mesmo grupo e mesmo `href` é exatamente mesmo `buildId`, que é o id gravado ao salvar, então a detecção casa com o que vai para o arquivo. Omissis, pena e dispositivo sem número têm `href` próprio e não repetem.

Desempenho: `atualizaMensagemCritical` já valida todos os dispositivos a cada ação. Para não ficar quadrático em documentos grandes (o Código Civil tem mais de 2.000 artigos), a passagem central (D5) calcula o conjunto de uma vez, por mapa de `href` por grupo, numa passada linear. `validaNumeracao` consulta esse resultado em cache quando ele existe e só faz a comparação local quando é chamado isoladamente. No modo rígido nada disso é calculado.

### D4. O erro sai de `validaNumeracao`, com uma entrada nova em `AutoFix`

`AutoFix.NUMERACAO_REPETIDA = 'Dispositivo com numeração repetida'`, no mesmo padrão de `OMISSIS_ANTES`, em que a descrição é o texto exibido. A mensagem é do tipo `ERROR` e é acrescentada em `validaNumeracaoDispositivo` e em `validaNumeracaoDispositivoAlteracao`, só no modo flexível. O `fix` é verdadeiro quando:
- o dispositivo não é artigo e `podeRenumerarFilhosAutomaticamente(pai)`; ou
- o dispositivo é artigo e não é de bloco de alteração (`renumeraArtigos` não renumera os artigos de alteração).

A mensagem existente "O dispositivo tem número igual ao de outro dispositivo" não muda.

### D5. Uma passagem central depois de toda ação mantém erros e alerta em dia

`sincronizarNumeracaoRepetida(state, anteriores)` roda em `elementoReducer` depois de `atualizaMensagemCritical`, e só no modo flexível:

1. calcula o conjunto de `uuid` com numeração repetida (D3);
2. grava o conjunto em `state.numeracaoRepetida`. O conjunto anterior é capturado no início do `elementoReducer`, como já acontece com `revisoes` e `remissoes`, porque muitos reducers devolvem um objeto de estado novo, sem campos que não conhecem;
3. para cada `uuid` que entrou ou saiu do conjunto, acrescenta um `ElementoValidado` com `createElementoValidado`. Isso atualiza a linha de um dispositivo que a ação não tocou, como o primeiro "Art. 5º" quando o segundo é corrigido;
4. inclui ou retira o alerta `alerta-global-numeracao-repetida` (crítico, `podeFechar: false`) de `state.ui.alertas`, sem duplicar, e emite `AtualizacaoAlertas` quando o alerta muda.

O conjunto não entra no histórico. Depois de desfazer ou refazer, ele é recalculado a partir da articulação, e a diferença em relação ao anterior atualiza o que mudou. Em `ABRIR_ARTICULACAO` o anterior é vazio, então o alerta já nasce na abertura. Como `ABRIR_ARTICULACAO` é a última chamada de `inicializarEdicao` (item 11 do CLAUDE.md), o alerta sobrevive às limpezas. `RESETAR_DOCUMENTO` zera o conjunto.

Alternativas descartadas:
- avaliar o alerta no componente raiz, como o de justificação: haveria um segundo cálculo, fora do ciclo de desfazer e refazer;
- acrescentar o erro em cada reducer: tem lacunas e não alcança a outra ocorrência.

### D6. A pendência lê o mesmo conjunto

`PENDENCIA_NUMERACAO_REPETIDA = 'Existem dispositivos com numeração repetida.'` é a mesma constante usada no alerta. Ela é incluída:
- em `getDocumentoArticulado` (`DadosLexEdit.pendencias`), logo depois da de justificação, o que dá a ordem da spec, porque o montador acrescenta as suas depois das recebidas;
- em `getPendenciasPreenchimento`.

Nos dois casos a condição é `state.numeracaoRepetida.length > 0`, lida depois de `flushEdicaoPendente`. A pendência gravada no arquivo não é lida ao abrir.

### D7. "Corrigir agora" renumera o grupo e guarda o estado anterior no histórico

Novo caso em `autoFixElemento` para `AutoFix.NUMERACAO_REPETIDA`. Para artigo, chama `getArticulacao(atual).renumeraArtigos()`; para os demais, `atual.pai.renumeraFilhos()`. Esses métodos já recalculam os ids dos descendentes. Os eventos seguem `renumeraElemento.ts`:
- `buildUpdateEvent(dispositivo, original)` para cada dispositivo do grupo cujo número mudou;
- `SituacaoElementoModificada` para os descendentes deles.

O `past` guarda o par antes/depois, e `processarModificados` restaura número, rótulo e ids ao desfazer. Isso é necessário porque a renumeração automática não sabe recriar dois números iguais. O evento do histórico leva a marca `renumeracaoAutomatica`: `undo` e `redo` o reemitem como `ElementoRenumerado` em vez de `ElementoModificado`, para que desfazer e refazer a correção não gerem revisão `alterado` em modo de revisão (a correção em si já emite `ElementoRenumerado`). `AUTO_FIX` entra em `ACOES_ESTRUTURAIS` para as remissões acompanharem a renumeração. As outras correções automáticas não mudam números, e a sincronização é idempotente. No texto principal a numeração é pela posição (1, 2, 3...), então a correção não preserva um número original como "Art. 5º".

### D8. Referências resolvem para a 1ª ocorrência, sem código novo

`buscaDispositivoById` usa `articulacao.artigos.find(...)` e `remissaoDialog` usa `find` por `lexmlId`, então os dois já devolvem a 1ª ocorrência na ordem de leitura. A situação na norma vigente e o ref de comentário também passam por eles. A change só documenta a limitação e a cobre com teste.

## Risks / Trade-offs

- [XML inválido pelo esquema com ids repetidos] → Decisão explícita do usuário (o host não valida). Fica documentado em `docs/api-componente-lexml-eta.md` e na coordenação com o `lexeditweb-editor`.
- [Algum ponto não mapeado usa o id como chave única e sobrescreve um valor sem erro] → Na busca da exploração só apareceram `find` (1ª ocorrência). Mitigação: um teste de reducer abre o documento com artigos repetidos e exercita incluir, remover, mover, desfazer e salvar.
- [A 2ª ocorrência de bloco de alteração perde o selo Existente/Novo na ida e volta, porque a situação é reaplicada por id] → Limitação documentada (D8), sem correção nesta change.
- [Id do arquivo diferente do `buildId`, por exemplo um arquivo legado com ids quebrados] → A validação de abertura olha os ids do arquivo, e a detecção e o salvamento olham o `buildId`. No modo rígido, um arquivo com rótulos repetidos e ids distintos abre, mas não salva. Esse comportamento já existe hoje e fica registrado, fora do escopo.
- [Em modo de revisão, o `ElementoModificado` da correção gera uma revisão `alterado` indevida] → Confirmado pelo teste: desfazer e refazer geravam duas marcas. Mitigado com a marca `renumeracaoAutomatica` no evento do histórico, que `undo` e `redo` reemitem como `ElementoRenumerado`. Observado e não tratado: em modo de revisão, desfazer até esvaziar o histórico lança exceção em `getElementoAntesModificacao` (já existe, independe desta change).
- [Custo da passagem central em documentos grandes] → O cálculo é linear e só roda no modo flexível (D3).
- [Estado de módulo compartilhado entre testes] → Os testes restauram `'rigida'` no `afterEach`, como no vocabulário.

## Migration Plan

Sem migração: o padrão é rígido. O host passa a usar o modo flexível informando `validacaoNumeracao: 'flexivel'`. Para voltar atrás, basta remover a configuração. Os arquivos salvos no modo flexível com numeração repetida são recusados no modo rígido, que é o comportamento esperado.
