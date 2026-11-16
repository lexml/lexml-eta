# Design

## Context

Ver proposal.md (Why). Estado atual relevante:

- `getSiglasNovaProposicao`, `getSiglasProposicaoReferenciada` e `getSiglasOutraProposicao` (`siglasNovaProposicao.ts`) devolvem `TipoDocumento[]`; `selectSiglas` (`nova-proposicao.component.ts`) usa `chaveTipo(tipo)` (`urnAutoridade:urn`) como valor e `tipo.sigla` como rótulo. Duas entradas com a mesma sigla têm chaves diferentes e rótulos idênticos.
- O vocabulário do Senado repete PLS e PLC (`projeto.lei` e `projeto.lei.complementar`, inativos). Não se pode removê-los: a visão completa do vocabulário resolve URN de documentos antigos (`vocabulario-urn`).
- A verificação (`consultar`) e a busca do texto usam só `sigla/numero/ano`. A URN, porém, é montada por `montaUrnNovaProposicao` com `tipo.urn` do item escolhido, tanto em `urnDocumentoReferenciado` quanto no substitutivo do `SF` (`urnReferenciada + @apresentacao.substitutivo`).
- Se a sigla deixa de identificar o tipo (distinct), a URN de PLS/PLC fica ambígua.

## Goals / Non-Goals

**Goals:**
- Sem duplicidade de sigla em nenhuma das três listas.
- Nova proposição só com ativas, sem alerta de sigla inativa.
- URN correta de PLS/PLC no substitutivo e no documento referenciado.

**Non-Goals:**
- Texto secundário/descrição no `lexml-eta-autocomplete-lista`, lista mais larga ou ajuste do blur com sigla repetida: deixam de ser necessários com o *distinct*.
- Alterar o vocabulário do Senado ou a abertura/edição de documentos de sigla inativa.
- Tratar o `complementar` fora de PLS/PLC.

## Decisions

**D1. Nova proposição filtra `ativo` em `getSiglasNovaProposicao`.** É o ponto único da lista. O alerta (`siglaInativaSelecionada`, `np-sigla-inativa`) é removido junto, pois nunca mais ocorre. Alternativa descartada: manter a inativa selecionável com alerta (regra de negócio mudou).

**D2. *Distinct* por sigla nas listas de referenciada e de outra proposição, em `siglasNovaProposicao.ts`.** Aplicado depois de `ordenar`, mantendo o primeiro item de cada sigla; como `ordenar` põe ativos antes de inativos, uma sigla com um tipo ativo e outro inativo ficaria com o ativo. A escolha entre PLS ordinário e complementar não depende da posição na lista, porque o tipo final é resolvido na URN (D3). Alternativa descartada: texto secundário e lista larga (exige mudança no autocomplete e não evita a escolha manual entre dois itens iguais para o usuário).

**D3. O tipo de PLS/PLC é resolvido por `complementar` em `resolverTipoComplementar` (`siglasNovaProposicao.ts`), aplicado ao montar `dados` do componente (só nas espécies Substitutivo/Subemenda).** Assim `montaUrnNovaProposicao` e a identificação exibida (descrição do tipo) recebem o tipo certo, sem mudar. O tipo escolhido na lista serve só de ponto de partida (autoridade e sigla); se existir no vocabulário da casa um tipo irmão (mesma autoridade e sigla, `urnTipoDocumento` diferente), a URN usa o de `projeto.lei.complementar` quando `complementar` é `true`, e o de `projeto.lei` caso contrário. A busca do irmão é por dados do vocabulário (sigla + autoridade), sem lista fixa de PLS/PLC no código, de modo que outra sigla repetida no futuro siga a mesma regra. Alternativas: (a) assumir sempre `projeto.lei` — descartada, gera URN errada em silêncio para complementares; (b) manter os itens duplicados e descrever — descartada pelo usuário.

**D4. `consultar` lê `complementar` da resposta `200` com padrão `false`** (`corpo?.complementar === true`) e o guarda no estado da verificação da proposição referenciada (`Verificacao`), apagado junto com a ementa quando sigla, número ou ano mudam. Quando a verificação ainda não ocorreu, o valor é `false`; como **Continuar** exige o documento referenciado verificado, a URN final sempre usa o valor real.

**D5. O vocabulário, a abertura de arquivos e `isSubstitutivo` não mudam.** O substitutivo do `SF` de PLS complementar gera `...projeto.lei.complementar;pls:<ano>;<n>@apresentacao.substitutivo`, já resolvido pela visão completa.

## Risks / Trade-offs

- [Host não devolve `complementar`] → o padrão `false` preserva o comportamento atual; PLS/PLC complementares geram URN com `projeto.lei` até o host atualizar. Mitigação: ponto de coordenação documentado em `docs/api-componente-lexml-eta.md` e na migração.
- [`complementar: true` em sigla sem irmão (ex.: PL)] → ignorado (cenário "Atributo em outra sigla").
- [Estado global do vocabulário nos testes] → usar `inicializarVocabulario('SF')` e restaurar no `afterEach`.
- [Outra proposição só usa sigla] → verificado em `verificarOutra`/`consultar`: nenhuma URN depende do tipo nessa opção, então o *distinct* é seguro ali.

## Migration Plan

Sem migração de dados. No host (`lexeditweb-editor`): opcionalmente passar a devolver `complementar: true` na verificação de PLS/PLC complementares. Rollback: reverter a change; nada persistido muda.
