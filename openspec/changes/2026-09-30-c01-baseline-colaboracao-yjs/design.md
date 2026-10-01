# Design

## Context

A colaboração foi implementada antes do OpenSpec; este documento registra a arquitetura que as 7 specs da change assumem, a partir do plano `docs/planos/PLANO_EDITOR_COLABORATIVO_YJS.md` (§2–§3 e §9) e do código em `src/collab/`. Motivação e escopo estão em `proposal.md`.

Restrições do código que moldam a abordagem:

- O estado do documento vive no Redux (árvore de `Dispositivo`/`Elemento`); o Quill é apenas a visão. A paginação mantém só um trecho da articulação no Quill.
- O `uuid` de dispositivo é um contador local por cliente, então não serve de identidade entre clientes.
- O editor é Light DOM e usa Quill 1.3.7, agora isolado numa cópia privada (`PrivateQuill`).
- O `develop` removeu o conceito de situação do dispositivo (suprimir/restaurar).

```
  Cliente A                                          Cliente B
  +-----------+   estrutura   +-----------+  rede   +-----------+   +-----------+
  | Redux     |<------------->| Y.Array   |<------->| Y.Array   |<->| Redux     |
  | (verdade  |   gid/tipo/   | "articula |  (ws)   | "articula |   |           |
  | nas       |   paiGid/meta | cao"      |         | cao"      |   |           |
  | fronteiras|               +-----------+         +-----------+   +-----------+
  | de commit)|   texto       | Y.Text por dispositivo  (dentro do Y.Map)         |
  +-----+-----+<------------->+---------------------------------------------------+
        |  Quill (visão) <- binding por linha (range do blot <-> Y.Text)
        +-----------------------------------------------------------------------
```

## Goals / Non-Goals

**Goals:**
- Dar uma referência de comportamento verificável para a colaboração já entregue no cliente, para que as próximas changes sejam deltas.
- Separar o comportamento em capabilities coesas, cada uma testável de forma independente.

**Non-Goals:**
- Não altera código de produção.
- Não especifica o sidecar, a ACL, o token, a persistência durável nem a Fase 6; vivem no `lexeditweb` ou são changes futuras.
- Não especifica a detecção de remissão externa (WASM) sob colaboração: ela roda por cliente e não é sincronizada (ver Riscos).

## Decisions

**1. Binding de domínio, com Redux como verdade nas fronteiras de commit.** O documento compartilhado espelha a árvore (um `Y.Array` plano de `Y.Map`, com `Y.Text` por dispositivo), em vez de ligar o Quill a um único texto compartilhado. Alternativas rejeitadas no plano: ligar o Quill inteiro a um `Y.Text` (três fontes de verdade, só a página visível) e tornar o Quill a fonte da verdade (reescreveria `src/model` e os reducers). Consequência: estrutura passa por ações Redux; texto tem um caminho rápido próprio.

**2. Dois caminhos de dados.** Texto (alta frequência) vai do Quill ao `Y.Text` do dispositivo, escopado pelo intervalo do blot; estrutura (baixa frequência) passa pelo Redux e pelos reducers de domínio. Rotear cada tecla pelo Redux seria lento e brigaria com o CRDT.

**3. Identidade global (`gid`) e semente determinística.** Cada dispositivo ganha um `gid`; a semente usa `gid` derivado da posição canônica e uma identidade de edição fixa, o que torna dois seeds independentes byte-idênticos. Depois de semear, o cliente adota uma identidade própria. Sem isso, dois clientes que semeiam o mesmo "Artigo 1" criariam itens distintos e duplicariam.

**4. Anti-eco por marca de origem.** Mudanças vindas do documento compartilhado são aplicadas ao Redux com um indicador síncrono de "aplicando remoto", e cada transação local usa uma origem própria que os observadores ignoram. Foi preferido a acrescentar `origem` aos eventos e reducers, que é mais intrusivo.

**5. Numeração é derivada, nunca sincronizada.** Rótulos, `lexmlId`, validação e paginação são recalculados em cada cliente pelos reducers existentes depois que a estrutura converge. Só viajam `gid`, tipo, pai, texto e metadados não deriváveis (nota de alteração, cabeça de alteração).

**6. Undo por modo.** Com a colaboração ligada, um único gerenciador de desfazer rastreia só as origens locais (estrutura e texto), sem fundir passos por tempo. O desfazer do Redux fica suspenso e o resultado do desfazer volta pela mesma porta das operações remotas. Com a colaboração desligada, o desfazer atual fica intocado. O desvio é feito no próprio `EtaQuill`, antes da história interna do Quill, porque interceptar mais abaixo tornava o refazer inalcançável.

**6a. Guarda contra reconstrução da tela.** Ao reconstruir o DOM depois de uma inclusão ou remoção, o Quill emite uma alteração espúria como se fosse do usuário. Um guarda, ativo só em lotes com inclusão ou remoção, impede que isso polua o texto compartilhado e o histórico.

**7. Degradação por manter o documento local.** Na queda do transporte, desconecta-se só a conexão de rede; o documento compartilhado e os observadores seguem vivos, com persistência local por sala. Isso transforma a reconexão no caso padrão de sincronização do Yjs e dispensa qualquer reprodução Redux para Y.Doc.

**8. Tombstone como único flag de remissão aplicado remotamente.** O corpo do link é derivado do texto e re-detectado em cada cliente. Dos flags não deriváveis, só a exclusão manual precisa viajar, porque a re-detecção a recriaria; a validade se recalcula localmente. A identidade usada entre clientes é a tripla (início, destino, texto de referência), não o identificador local do link.

**9. Cursores via Awareness com `quill-cursors`.** A posição é `{gid, índice local}`, o que a mantém estável quando os clientes têm numerações ou posições absolutas diferentes. Um dispositivo não renderizado não gera cursor.

**10. Quill 1.3.7 mantido.** A migração para Quill 2.x fica fora desta feature (ADR-002 do plano). O editor já é Light DOM, então não há problema de `getSelection` em Shadow DOM.

## Risks / Trade-offs

- **[Cursores e o Quill privado]** O `quill-cursors` é UMD e depende de um `Quill` global, que a cópia privada não expõe. → O E2E de cursores passou depois do merge com o `develop`, mas não foi investigado o porquê; manter o teste e conferir em qualquer upgrade do Quill ou do `quill-cursors`.
- **[Detecção externa de remissão não sincronizada]** O linker WASM roda por cliente, a partir do texto, sem sincronização nem tombstone. Dois clientes podem terminar, por efeito de tempo, com links de tipos diferentes no mesmo trecho (observado no trace de A e B). → Merece uma change própria; não está no escopo desta baseline.
- **[Revisão × colaboração]** O plano define os dois modos como mutuamente exclusivos, mas a exclusão não está imposta no código. → Fica para a Fase 6; até lá, a combinação não é suportada.
- **[Granularidade do desfazer de texto]** O desfazer de texto é por transação, não por trecho digitado. → Aceito; agrupar por blur é evolução futura.
- **[Reordenação detectada por diff]** A reordenação remota deduz o irmão que "desceu" comparando ordens; reordenações múltiplas simultâneas podem não ser reproduzidas fielmente. → Coberto por teste só para um movimento; ampliar quando houver caso real.
- **[Agrupar/desagrupar]** O plano registrava um gap de convergência para esses fluxos. O `develop` removeu `agruparElementoAction`; a situação precisa ser reavaliada. → Verificar na Fase 6.
- **[Detecção de lacunas de teste]** Alguns cenários das specs (token na conexão, persistência local, ordem canônica com bloco de alteração, validade recalculada) não têm teste direto. → Listados em `tasks.md` como tarefas de cobertura.
