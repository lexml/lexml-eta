## Context

O processamento de revisões é central: `elementoReducer` chama `atualizaRevisao` depois de toda ação, e ela cria ou atualiza as revisões a partir dos eventos de `state.ui.events`. Três premissas dessa função não valem sempre (motivação em proposal.md, "Why"):

1. **O `past` guarda a ação corrente.** `getElementoAntesModificacao` tira o estado anterior do último item do `past`. Mas `atualizaTextoElemento` não grava no `past` a sincronização que só muda a marcação das remissões (`somenteMarcacaoRemissao`), para não virar passo de desfazer, e emite `ElementoModificado` assim mesmo. Desfazer a primeira ação feita em revisão também deixa o `past` vazio.
2. **Todo revisado é dispositivo da articulação com elemento anterior.** `atualizarLexmlIdEmElementosDeRevisoes`, chamada quando o lote tem inclusão ou exclusão, faz `JSON.parse(JSON.stringify(e.elementoAnteriorNaSequenciaDeLeitura))`, que lança para a ementa (a primeira linha editável). A ementa é criada à parte da articulação (`buildDispositivoEmenta`), e `getDispositivoFromElemento` a devolve por tipo.
3. **O pai registrado é o pai real.** `existeFilhoExcluidoOuAlteradoDuranteRevisao` compara `elementoAntesRevisao.hierarquia.pai.uuid`. No primeiro nível de um bloco de alteração, esse pai é a articulação de alteração, e o hospedeiro está em `pai.uuidAlteracao` (invariante do item 17 do CLAUDE.md; `getUuidPaiEfetivoDoElemento` já resolve isso).

Os reducers de revisão mutam a articulação no lugar antes de `atualizaRevisao`. Quando ela lança, o Redux fica com a versão anterior de `revisoes` e de `ui`, mas a árvore já mudou. Isso explica a revisão órfã da #1107.

No editor, `removerLinhaQuill` mantém a linha do excluído na tela quando a revisão é de exclusão (`linha.atualizarElemento` + `montarMenuContexto`). Em seguida, ele leva o cursor à linha seguinte por `cursorNaLinhaSeguinte` (#1075), daí a alternância descrita na #1105.

Tudo foi reproduzido na demo (MPV 885 e MPV 905), observando a store pelo módulo `/out-tsc/src/redux/store.js`.

## Goals / Non-Goals

**Goals:**
- Corrigir as três premissas nos pontos únicos onde são usadas, sem espalhar correções pelos reducers de edição.
- Uma só regra de "remoção impedida em revisão", consultada pelo reducer e pelo menu.

**Non-Goals:**
- Tornar atômicos os reducers de revisão (ver Riscos).
- Mudar o comportamento do cursor fora do modo de revisão ou o do Backspace.

## Decisions

### D1. A sincronização só de marcação é sinalizada no evento, e `atualizaRevisao` a ignora

`atualizaTextoElemento` marca o evento `ElementoModificado` que emite quando `somenteMarcacaoRemissao` é verdadeiro (campo opcional em `StateEvent`, como o `cursorNaLinhaSeguinte` da #1075). A marca fica só em `ui.events`, porque nesse caso o `past` não é gravado. `processaEventosDeModificacao` não cria revisão para elemento de evento marcado. Se o elemento já tem revisão, só atualiza o estado posterior (`elementoAposRevisao`), sem tocar nas operações, na descrição, no usuário nem na data.

Alternativas descartadas:
- *Não emitir `ElementoModificado` nesse caso.* O editor e a sincronização de remissões dependem do evento para atualizar a linha e o registro.
- *Gravar a sincronização no `past`.* Criaria um passo de desfazer que o usuário não fez, que é justamente o que `somenteMarcacaoRemissao` evita.
- *Comparar, em `atualizaRevisao`, o texto sem marcação com o anterior.* O anterior é justamente o que falta.

### D2. Sem estado anterior, não se cria revisão de modificação

`getElementoAntesModificacao` devolve `undefined` quando o `past` está vazio ou o último item não traz modificação do elemento. Em `processaEventosDeModificacao`, um elemento sem revisão existente e sem estado anterior não gera revisão. A guarda de `UNDO` (`past.length < numEventosPassadosAntesDaRevisao`) continua com `<`. Com `<=`, desfazer a primeira ação da sessão retornaria antes de processar os eventos, e a marca não seria removida, o que contradiz o requisito "Desfazer a primeira ação feita em revisão".

Alternativa descartada: *criar a revisão com o estado posterior como anterior.* Recusar não teria efeito e a marca mentiria.

### D3. Dispositivos da parte inicial ficam fora da atualização de id e posição

`atualizarLexmlIdEmElementosDeRevisoes` pula as revisões de dispositivos da parte inicial (a ementa; o preâmbulo não tem ações, mas entra pelo mesmo critério). Esses dispositivos têm id fixo e não têm posição na articulação, então nada a recalcular. A verificação é pelo tipo, no início do laço.

Alternativa descartada: *proteger só o `JSON.parse` contra `undefined`.* O erro sumiria, mas a função continuaria gravando na revisão da ementa o id do pai da articulação temporária em que ela foi criada, um dado sem sentido.

### D4. A regra de remoção impedida usa o pai efetivo e é consultada também pelo menu

`existeFilhoExcluidoOuAlteradoDuranteRevisao` passa a considerar `getUuidPaiEfetivoDoElemento(r.elementoAntesRevisao)`, além do `uuid` do próprio revisado. Com isso, um dispositivo de primeiro nível de bloco de alteração removido em revisão é reconhecido como subordinado do artigo hospedeiro, cujo `uuid` está na lista de `getDispositivoAndFilhosAsLista`. Nos níveis abaixo, o pai registrado já é o real.

O menu é montado a partir de `acoesPossiveis` dos elementos dos eventos, calculadas pelas regras de cada tipo, que não conhecem as revisões. Um passo do `elementoReducer`, no molde de `adicionaDiffMenuOpcoes`, retira `removerElementoAction` dos elementos dos eventos quando a revisão está ativa e a regra impede a remoção. Ele roda depois de `atualizaRevisao` e altera os elementos dos eventos como `adicionarOpcoesAoMenu` já faz. Isso vale para qualquer ação, inclusive os retornos antecipados de `atualizaRevisao` (desfazer, refazer).

Alternativa descartada: *calcular nas regras de tipo.* Elas recebem só o dispositivo, sem o estado de revisão.

### D5. O Ctrl+D continua chegando ao reducer, que recusa com a mensagem

O editor não passa a consultar o menu antes de despachar o Ctrl+D. A remoção é impedida pela guarda do reducer (D4), que já devolve a mensagem "Não é possível remover dispositivo que possua dispositivo subordinado já removido ou alterado em modo de revisão.". Assim o usuário sabe por que nada aconteceu.

Alternativa descartada: *ignorar o Ctrl+D em silêncio quando o menu não tem "Remover".* O elemento guardado na linha pode estar desatualizado em relação ao último menu montado, e um atalho mudo confunde.

### D6. O editor decide o cursor depois da exclusão, porque só ele sabe se a linha ficou

Em `removerLinhaQuill`, quando a linha do primeiro elemento do lote é mantida (revisão de exclusão), o cursor vai para o início do texto dela, que passa a ser a linha atual (`desmarcarLinhaAtual` + `marcarLinhaAtual`), e o menu montado é o dela. `cursorNaLinhaSeguinte` só vale quando essa linha sai da tela. Assim um dispositivo adicionado na própria revisão e depois excluído segue a regra da #1075. Um `ElementoMarcado` do mesmo lote que levaria o cursor a outro dispositivo, como o primeiro filho de um agrupador excluído (`removeElemento`), é ignorado quando a linha do excluído ficou na tela.

Alternativa descartada: *o reducer não marcar `cursorNaLinhaSeguinte` em revisão.* O reducer não sabe, no ponto em que marca o evento, se a linha vai ficar, porque isso depende da revisão de inclusão desfeita por `atualizaRevisao`. E a regra da #1075 deixaria de valer para o dispositivo adicionado na própria revisão.

## Risks / Trade-offs

- [Erro em `atualizaRevisao` deixa o estado parcial, porque o reducer já mutou a articulação] → Esta change remove as causas conhecidas (D1 a D3) e cobre os cenários com testes de reducer. A atomicidade fica registrada como risco, para uma change futura (clonar a articulação ou envolver `atualizaRevisao` num tratamento que desfaça a ação).
- [D2 pode deixar de criar revisão num caminho legítimo que emita `ElementoModificado` sem o item correspondente no `past`] → Rodar toda a suíte `test/redux/revisao/` e `test/redux/remissao/reducer-*revisao*`. Se algum teste depender de revisão sem estado anterior, isso é sinal de outro caminho que precisa gravar o `past`, e não de relaxar D2.
- [D4 altera elementos dos eventos, que fazem parte do estado e do histórico] → Mesmo padrão já usado por `adicionarOpcoesAoMenu` e `adicionaDiffMenuOpcoes`. A ação retirada é recalculada a cada evento, então não se perpetua no histórico.
- [D6 muda a expectativa do E2E `cursor-apos-remover.cy.ts` e do teste de componente da #1075 no caso de revisão] → A expectativa é atualizada nas tarefas, e a mudança está declarada na proposta.

## Migration Plan

Não há migração: nada muda no formato do arquivo nem na API pública.
