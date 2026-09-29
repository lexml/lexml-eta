## Context

Ver proposal.md — Why. Estado atual relevante:

- `regrasArtigo.ts` oferece `adicionarParagrafoFilho` e `adicionarIncisoFilho` a todo artigo não bloqueado (linhas 76-79), sem considerar o bloco de alteração. A ação "Adicionar alteração de norma" já exige artigo sem filhos (`!hasFilhos`, desde 2021) e a transformação de um artigo em parágrafo do anterior já é bloqueada quando o anterior tem bloco (linha 98) — ou seja, o projeto já assume a regra, faltava fechar este caminho.
- Comportamento atual confirmado por teste descartável (28-29/09/2026), com artigo com bloco de alteração:
  - "Adicionar inciso" → o alvo passa a ser o caput (`adicionaElemento.ts:41`), que não tem bloco próprio, e é criado um inciso próprio `art1_cpt_inc1` (estrutura inválida).
  - "Adicionar parágrafo" e Enter no fim do texto → caem no ramo `atual.hasAlteracao()` (`adicionaElemento.ts:95`) e criam um artigo dentro do bloco (estrutura válida, mas o rótulo "Adicionar parágrafo" é enganoso).
  - Colar (`ADICIONAR_ELEMENTOS_FROM_CLIPBOARD`) sobre o artigo com bloco: inconclusivo — em estado montado à mão lançou `TypeError` ao ler `pai`; precisa ser verificado com documento aberto pelo fluxo real.
- As funções de percurso de `hierarquiaUtil.ts` com `hasAlteracao() ? alteracoes.filhos : filhos` já refletem a regra; não são defeito.

## Goals / Non-Goals

**Goals:**
- Nenhuma ação do editor cria inciso ou parágrafo próprio em artigo com bloco de alteração.
- O menu desse artigo não oferece ações cujo resultado contradiz o rótulo.

**Non-Goals:**
- Validar ou corrigir documentos que já contenham a estrutura inválida (o LexML não a produz; nenhum caso no corpus).
- Mudar o que Enter faz no fim do texto do artigo com bloco (cria artigo no bloco — comportamento válido).
- Alterar as funções de percurso de `hierarquiaUtil.ts`.

## Decisions

### D1 — Ocultar as ações no menu, não só rejeitar no reducer

`regrasArtigo.ts` passa a não oferecer `adicionarIncisoFilho` nem `adicionarParagrafoFilho` quando `dispositivo.hasAlteracao()`. O menu é a fonte que a interface consulta e o reducer confere com `isAcaoPermitida` em várias ações; ocultar evita oferecer o que não pode ser feito, no mesmo padrão já usado para "Adicionar alteração de norma" e para a transformação em parágrafo.

Alternativa: manter no menu e recusar no reducer com mensagem — pior experiência (oferece e depois nega) e diverge do padrão das outras regras do artigo.

### D2 — "Adicionar parágrafo" também sai do menu

Hoje ela cria um artigo no bloco. Manter a ação com outro rótulo ("Adicionar artigo na alteração") seria uma funcionalidade nova, fora do escopo; o mesmo resultado já é alcançável por Enter no fim do texto e pelo menu do artigo dentro do bloco.

### D3 — Defesa no reducer para o caso do inciso

Além do menu, `adicionaElemento` deve recusar criar inciso ou parágrafo no caput/artigo quando o artigo tem bloco de alteração, caso a ação chegue por outro caminho (atalho, ação disparada programaticamente). A forma exata (mensagem, retorno do estado) segue `naoPodeCriarFilho`/`retornaEstadoAtualComMensagem`.

## Risks / Trade-offs

- [Colar pode ser um terceiro caminho, ou quebrar por si só] → task dedicada de verificação com documento aberto pelo fluxo real; se criar a estrutura, fechar; se quebrar independentemente disso, registrar como achado separado e decidir com o usuário.
- [Algum teste existente depender de "Adicionar inciso" em artigo com bloco] → a suíte completa da tasks revela; tratar como estrutura inválida.
- [Atalhos de teclado para adicionar inciso/parágrafo] → a defesa do D3 cobre o que não passa pelo menu.

## Migration Plan

Sem migração: nenhum dado persistido muda.
