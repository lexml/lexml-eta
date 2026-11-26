## Context

- **Menu:** `RegrasArtigo` oferece `adicionarAgrupadorArtigoAntesAction` ("… e outros antes"), e `RegrasAgrupadores`/`RegrasEmenta` oferecem `adicionarAgrupadorArtigoAction` (sem sufixo). As duas são instâncias de `AdicionarAgrupadorArtigo`; o editor reconhece a classe (`processarEscolhaMenu`) e abre o mesmo `adicionarAgrupadorArtigoDialog`. A posição da instância não é usada: o diálogo passa a posição ao `execute`.
- **Modal:** quando o elemento é artigo, `adicionarAgrupadorArtigoDialog.ts` esconde o `#rdgPosicao`, só considera `tiposAgrupadoresQuePodemSerInseridosAntes`, ignora o clique no tipo e fixa `posicao = 'antes'`. No agrupador, o clique no tipo habilita cada posição pela lista do elemento e, com as duas habilitadas, marca "Depois"; o padrão vem de um `elTipoAgrupadorDefault.click()` agendado.
- **Reducer:** `agrupaElemento` já trata `depois` a partir de artigo (o guarda que o proibia está comentado; há testes de reducer, como "Parte depois do Art. 1"): a referência da linha é o último descendente do artigo, e `getDispositivosASeremCopiadosParaOutroPai` leva os dispositivos seguintes. No artigo, `getTiposAgrupadoresQuePodemSerInseridosAntes` devolve a mesma lista de `…Depois`.
- **Desfazer/refazer:** o refazer da inclusão (`redo.ts`) e o desfazer da remoção (`undo.ts`) recriam o agrupador com `agrupaElemento(..., 'antes')` a partir do `ElementoReferenciado` do lote.
  - Na inclusão, esse evento é o dispositivo seguinte na leitura. Sem dispositivo seguinte, `Eventos.build` descarta o evento vazio e o `find(...)!` lança `TypeError`.
  - Na remoção (`removeElemento.ts`), ele é `filhos[0] || getDispositivoPosterior || getDispositivoAnterior`. Num agrupador vazio que é o último filho do seu pai, cai no irmão anterior, e "antes" dele leva o anterior para dentro do agrupador restaurado.
  - O `referencia` do lote de remoção não serve de fallback: `removeAgrupadorAndBuildEvents` o grava no evento `ElementoIncluido`, que fica vazio e é descartado. O elemento removido, por outro lado, é criado com `procurarElementoAnterior` e traz `elementoAnteriorNaSequenciaDeLeitura`.

## Goals / Non-Goals

**Goals:**
- Um só item de menu e um só comportamento de modal para artigo e agrupador; só o padrão da posição muda.
- Restaurar no mesmo lugar, pelo desfazer e pelo refazer, o agrupador sem dispositivo depois dele.

**Non-Goals:**
- Mudar as listas de tipos permitidos (`getTiposAgrupadoresQuePodemSerInseridos*`) ou a regra de quais dispositivos vão para o novo agrupador.
- Mudar a regra do "Manter no mesmo grupo de aspas" ou o desfazer de agrupador vazio seguido de artigo no mesmo pai (situação que a inclusão não produz).
- Rejeitar a revisão de exclusão de agrupador (`rejeitaRevisao.ts`, que já usa `depois` do elemento anterior na leitura).

## Decisions

1. **Menu: o artigo passa a usar `adicionarAgrupadorArtigoAction`, e `adicionarAgrupadorArtigoAntesAction` é removida** (com o parâmetro `posicao` do construtor, que só existia para ela, e o registro em `acoesMenu`). Alternativa descartada: manter a instância "antes" com outra descrição, sem consumidor que a distinga. A ação não é exportada pelo pacote.

2. **Modal: tirar os casos especiais de artigo e parametrizar o padrão.** O "Posicionamento" passa a aparecer para todo elemento, como hoje no agrupador e na ementa (na ementa, "Antes" já fica desabilitado porque a lista de "antes" é vazia). `tiposPermitidos` passa a ser a união das duas listas para todo elemento, o clique no tipo atualiza as posições também no artigo, e a posição lida é sempre a do rádio. Uma constante `posicaoPadrao` (`'antes'` no artigo, `'depois'` nos demais) substitui o "Depois" fixo, tanto no `checked` inicial quanto no ramo "duas posições habilitadas" do clique no tipo. Esse ramo precisa da constante porque o clique agendado no tipo padrão roda depois da montagem e sobrescreveria um `checked` só no HTML.

3. **Desfazer/refazer: uma função comum de reinclusão do agrupador** em `undoRedoReducerUtil.ts`, usada no refazer da inclusão e no desfazer da remoção:
   - com `ElementoReferenciado` no lote, mantém o caminho atual (`antes` dele);
   - sem ele, chama `agrupaElemento(..., 'depois')` a partir da **unidade** que contém a linha anterior ao agrupador: sobe dessa linha até o primeiro artigo, agrupador ou ementa. No bloco de alteração, quando o agrupador não fica no mesmo grupo de aspas (`manterNoMesmoGrupoDeAspas` falso), a unidade é a cabeça de alteração da linha anterior, porque `agrupaElemento` só cria cabeça nova a partir de outra cabeça.
   - A linha anterior vem do lote: no refazer, o `referencia` do `ElementoIncluido` (onde `agrupaElemento` põe a linha depois da qual o agrupador entra); no desfazer da remoção, o `elementoAnteriorNaSequenciaDeLeitura` do elemento removido.

   Por que a unidade e `depois`: o agrupador sem dispositivo depois dele no seu pai é, por construção, o último filho, e `depois` da unidade anterior o põe ali sem levar nada, inclusive nos desdobramentos (capítulo depois de artigo de capítulo). No refazer, a unidade é o próprio `atual` da inclusão original, então a chamada se repete. Alternativas descartadas: gravar no evento a ação original (`atual`/`posicao`), que muda o formato de `StateEvent` e não existe no lote de remoção; usar `antes` do dispositivo seguinte fora do pai (por exemplo, o Capítulo II para a seção no fim do Capítulo I), que depende de `getTiposAgrupadoresQuePodemSerInseridosAntes` do agrupador seguinte e não cobre o fim do documento.

4. **Remoção: o `ElementoReferenciado` de agrupador vazio deixa de cair no irmão anterior.** Em `removeElemento.ts`, o evento passa a vir só de `filhos[0] || getDispositivoPosterior(...)`; sem nenhum dos dois, o lote não o tem e o desfazer usa o fallback da decisão 3. O `ElementoMarcado` (onde fica o cursor depois de remover) continua com o irmão anterior. Alternativa descartada: trocar também o caso com irmão posterior, que já funciona.
5. **Atalho Ctrl+Alt+G removido** (pedido do usuário depois da aplicação, porque conflita com atalhos do navegador). Saem o ramo da tecla `g` em `EtaKeyboard` (Ctrl+Alt/Meta), o observável `adicionaAgrupador` e seu tratamento em `editor.component.ts`, e o `hotkey` de `AdicionarAgrupadorArtigo`, que só servia ao rótulo do menu. A aba de Atalhos não o listava. Alternativa descartada: trocar por outra combinação, sem pedido e com o mesmo risco de conflito.

## Risks / Trade-offs

- [Quem abria o modal no artigo e confirmava direto] → o padrão "Antes" mantém o resultado de hoje (cenário "Confirmar sem mudar a posição a partir de artigo").
- [Quem usava Ctrl+Alt+G] → o atalho deixou de existir (decisão 5); a opção continua no menu de contexto.
- [Agrupador vazio no fim de capítulo ou do documento passa a ser comum] → a numeração depois de agrupador vazio já foi corrigida (#1076); o desfazer e o refazer são cobertos pela decisão 3.
- [O fallback do desfazer recusar a reinclusão (`agrupaElemento` devolve mensagem de erro) num caso de lista de tipos que a inclusão original não teve] → só no desfazer da remoção, cuja origem pode ser outra; os testes de reducer cobrem os casos da spec e o caso de bloco de alteração. Um caso não coberto mostraria a mensagem de erro em vez de lançar exceção.
- [O teste E2E do #1076 (`numeracao-apos-agrupador-vazio.cy.ts`) cria o capítulo a partir de artigo confirmando direto] → continua válido com "Antes" como padrão.
- [Desfazer a remoção de agrupador vazio que não é cabeça, último filho do pai, dentro de bloco de alteração] → o elemento removido não traz `manterNoMesmoGrupoDeAspas`, e o agrupador volta como cabeça de alteração nova, o mesmo caminho que o desfazer já seguia com irmão posterior. Não coberto por teste; fica registrado.
- [E2E: clicar em desfazer logo depois de incluir o agrupador] → a linha nova entra no histórico de texto do Quill, limpo num `setTimeout` (`limparHistory`); antes disso, o botão desfaz só o texto do Quill, sem passar pelo Redux, e o refazer seguinte não encontra o que refazer. O spec espera o histórico do Quill vazio antes de cada clique. Pelo usuário, o intervalo não é perceptível.
