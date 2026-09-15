## Context

Ver proposal.md para a motivação completa (backfill de uma capability já implementada e entregue em várias ondas). Este documento resume as decisões técnicas de cada onda, na ordem em que foram tomadas, com base nos planos originais em `docs/planos/` (não versionados no git) e no histórico em `docs/referencia/REMISSAO_INTERNA.md`.

Cronologia das entregas que compõem esta capability (versões internas do documento de referência):
- **v2.4.0** (27/02–09/04/2026): núcleo — detecção (3 primeiras passagens), registry indexado por uuid de origem, blot Quill customizado, diálogo de criação manual, remoção, atualização por renumeração (mecanismo original por diff de string entre lexmlId antigo/novo), invalidação/restauração, persistência. Seguida de perto (10/04/2026) pelo popup de ações cursor-based, substituindo o antigo botão de toolbar + clique-para-navegar.
- **~11/05/2026**: passagem 4 de detecção (referências "bare" sem qualificador contextual), estendendo a cobertura a parágrafos/incisos/alíneas/itens.
- **~12/06/2026**: correção pontual de absorção do ordinal ("º") em remissões já criadas — corrige `renderizarRemissoesDoState` para estender um blot existente em vez de pulá-lo incondicionalmente.
- **v2.5.0** (08–23/07/2026): substituição do mecanismo de atualização — de "diff de string entre lexmlId antigo/novo, propagado por eventos emitidos por 5 reducers diferentes" para "recálculo por uuid, disparado uma vez por ação estrutural". Inclui a regra dos três estilos (qualificada/enxuta/contextual) e a preservação de uuid na transformação de tipo (pré-requisito para o próprio mecanismo funcionar).
- **v2.6.0** (23–24/07/2026): gatilho de criação muda de "a cada pausa de digitação (debounce) ou troca de linha" para "só ao sair do dispositivo (troca de linha ou foco sai do editor)", com um flush determinístico incondicional antes de serializar.

## Goals / Non-Goals

**Goals:**
- Documentar, como requisitos testáveis, o comportamento observável final de cada uma das ondas acima — não a trajetória interna de cada refactor.
- Registrar as decisões arquiteturais que têm efeito observável duradouro (ex.: por que a atualização recalcula por identidade em vez de diff textual; por que a criação espera o blur).
- Preencher a lacuna real encontrada durante este backfill: o popup de ações (Ir/Editar/Excluir) existe em produção (`popupInline.ts`) mas nunca tinha sido documentado como requisito.

**Non-Goals:**
- Não documenta mecanismos internos descartados no caminho (ex.: o diff de string antigo, a heurística `isTextoCanonico` por varredura de 1 a 150) — só o estado final.
- Não cobre `remissao-externa` (capability irmã, spec própria) além de citar os pontos de acoplamento (diálogo e popup compartilhados).
- Não propõe nenhuma mudança de comportamento — é documentação retroativa.

## Decisions

**Detecção em 4 passagens sequenciais, com deduplicação por posição.** Cada passagem cobre um estilo de referência (absoluta composta, agrupador, contextual, implícita); a implícita foi adicionada por último porque só é segura com um bloqueio por lookahead negativo (`(?!\s+d(?:[ao]\s|este|esta|...))`) que evita colidir com as formas já cobertas pelas passagens anteriores. Alternativa descartada: uma única regex monolítica — rejeitada por ser difícil de testar e estender incrementalmente (a própria adição da 4ª passagem, meses depois, confirmou o valor de manter passagens independentes).

**Criação automática só ao sair do dispositivo (blur), não a cada pausa de digitação.** Substituiu o debounce de 1s por tecla, que causava captura prematura de texto incompleto (ex.: "art. 1" detectado antes do usuário completar "art. 12"). Dois gatilhos complementares são necessários porque nenhum cobre os dois casos sozinho: troca de linha dentro do Quill não dispara eventos de DOM (é uma única região `contenteditable`, tratada via API de seleção do próprio Quill), enquanto cliques em elementos fora da área de texto (menu de outro dispositivo, painel lateral, abas) disparam `focusout` de DOM mas não são visíveis à seleção do Quill. Um terceiro mecanismo — flush determinístico incondicional antes de serializar — cobre o caso do botão Salvar independentemente de o `focusout` ter disparado corretamente, porque esse botão pertence à aplicação hospedeira, fora do controle deste componente.

**Atualização por renumeração resolve o alvo pela identidade estável (uuid), não por diff textual entre lexmlId antigo/novo.** O mecanismo original comparava strings de id antes/depois e propagava eventos por 5 reducers diferentes — frágil (fácil esquecer um reducer, como de fato aconteceu na transformação de tipo) e não lidava com um dispositivo que muda de identidade (uuid) ao mudar de tipo. O mecanismo atual busca reversamente "quem aponta para este uuid" e recalcula o texto canônico a partir do objeto atual — dispensa qualquer captura de estado "antes" nos reducers estruturais.

**Três estilos de atualização de texto (qualificada/enxuta/contextual), não um só.** Uma referência totalmente qualificada ("do art. N") deve sempre refletir a cadeia inteira; mas uma referência "enxuta" (sem qualificador, ex.: "inciso I" entre irmãos do mesmo pai) não deve ganhar uma cadeia de qualificadores que nunca teve, só porque um dispositivo alheio em outra parte da árvore foi renumerado — comportamento reportado como indevido por um usuário e corrigido depois que a v2.5.0 já estava em produção.

**Popup cursor-based (posicionar cursor), não hover.** Hover dispara durante seleção de texto que atravessa o link (experiência ruim); cursor-based é consistente com o comportamento padrão de clique (que já posiciona o cursor) e funciona para navegação por teclado. Alternativa descartada: manter clique = navegação direta — rejeitada porque impedia posicionar o cursor dentro do link para editá-lo.

**Remoção em lote via seleção, sem botão dedicado na toolbar.** Ao introduzir o popup (que só atua sobre um link por vez, o que está sob o cursor), o antigo botão de toolbar que suportava remoção de múltiplos links por seleção foi avaliado para remoção; decisão tomada (documentada no plano original): manter a capacidade de remover todos os links de uma seleção como ação (sem exigir cursor sobre um único link), mas sem um botão de toolbar dedicado à navegação/edição em lote — essas ações (Ir/Editar) só fazem sentido por link individual, via popup.

## Risks / Trade-offs

- [Risco] A detecção implícita (passagem 4) pode gerar falsos positivos em textos ambíguos com múltiplos "§ 1º" em artigos distintos → Mitigação: aceito como limitação conhecida; o usuário pode criar a remissão manualmente nesses casos.
- [Risco] A criação automática só no blur significa que o link não aparece durante uma digitação contínua e prolongada na mesma linha → Mitigação: cobertura ampla de gatilhos de saída (linha, painel, aba, salvar) reduz a janela em que isso é perceptível; o flush determinístico garante que o Salvar nunca perde a remissão, independentemente da percepção visual.
- [Trade-off] Texto editado manualmente pelo usuário é preservado (não sobrescrito) quando diverge do esperado, mas isso depende de disciplina de sincronização do campo que grava o último texto conhecido (`textoRef`) em todo caminho que escreve no link → Mitigação: coberto por testes de regressão dedicados; já foi fonte de bugs reais corrigidos durante a implementação.
- [Trade-off] Referências dentro de blocos de alteração (`<Alteracao>`, texto entre aspas) não têm tratamento especial — podem detectar dispositivos da norma vigente quando a intenção é referenciar o texto entre aspas → Aceito, documentado como limitação conhecida, validação manual recomendada nesses contextos.

## Migration Plan

Não aplicável — este documento formaliza retroativamente uma funcionalidade já em produção, sem nenhuma mudança de comportamento ou dado a migrar.
