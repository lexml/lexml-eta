# Design

## Context

Ver `proposal.md` (Why). Hoje o modo `anexoParecer` é tratado em vários pontos de `lexml-eta.component.ts`: `getDocumentoArticulado` envia `{}` no lugar de `local`/`data`/`autoria`; `abrirDocumentoArticulado` e `setProposicao` forçam a data a `''`; `getProposicao` não copia a data do formulário e `removerDadosNaoAplicaveisAoAnexoParecer` apaga `local` e `autoria`; o `render` oculta o bloco de data e autoria com `display: none` e troca o rótulo da aba. A obrigatoriedade da justificação já depende só de `!anexoParecer` (`isJustificacaoObrigatoria`).

O campo "Data" (`DataComponent`) recebe o valor de `Proposicao.dataUltimaModificacao`, cujo padrão em `new Proposicao()` é o instante atual; por isso um documento novo já nasce com data informada.

## Goals / Non-Goals

**Goals:**
- Restringir a diferença do modo anexo de parecer à ausência da justificação e das notas de rodapé.
- Fazer "Não informar" ser o padrão do campo "Data" em documentos novos, nos dois modos.

**Non-Goals:**
- Alterar o tipo de `justificativa` (já é omitida no anexo via remoção da propriedade; nenhum ramo precisa de `null`).
- Tratar a regra de local por casa legislativa: o local já é derivado do destino e sempre registrado.
- Mudar o formato de serialização do fecho, da autoria ou das assinaturas.

## Decisions

1. **Remover o tratamento especial do anexo, não criar um segundo caminho.** Em `getDocumentoArticulado`, `abrirDocumentoArticulado`, `setProposicao` e `getProposicao`, os ramos `anexoParecer` ligados a data/local/autoria são eliminados e o fluxo do modo normal passa a valer para ambos. Alternativa descartada: manter um ramo do anexo que grava só a data; criaria um terceiro comportamento a documentar e a testar, e contradiz a decisão do P.O. de permitir fecho e assinaturas.
2. **`removerDadosNaoAplicaveisAoAnexoParecer` passa a remover só `justificativa`, `justificativaAntesRevisao` e `notasRodape`.** Mantém o contrato atual para esses três campos; `local` e `autoria` voltam a ser entregues (mudança de contrato aceita pelo P.O.).
3. **"Não informar" como padrão pelo valor de entrada, não pela interface.** `resetaProposicao` passa a zerar `dataUltimaModificacao` do `Proposicao` padrão antes de `setProposicao`. Alternativa descartada: alterar o padrão de `Proposicao.dataUltimaModificacao`, que é o modelo compartilhado com a aplicação consumidora e seria mudança de contrato mais ampla. Proposições recebidas do host (`params.proposicao`) mantêm a data que trazem.
4. **Ordem dos radios por inversão no template.** O `sl-radio` "Não informar" passa a vir antes do radio com o `sl-input` de data. A regra CSS `sl-radio-group > sl-radio:first-child` (que dá folga ao radio da data) é reescrita para mirar o radio da data por classe, em vez de depender da posição.
5. **Rótulo único da aba.** O `render` usa sempre "Destino, Data, Autoria e Impressão" e o bloco de data e autoria deixa de ter `display` condicionado ao modo.
6. **Aba direita no anexo.** A seleção inicial continua `atalhos` quando `anexoParecer` (a aba "Notas" segue oculta); nenhum ajuste.

## Risks / Trade-offs

- [Hosts passam a receber `local`, `autoria` e `dataUltimaModificacao` no anexo] → mudança aceita pelo P.O.; registrar em `docs/api-componente-lexml-eta.md` e avisar o mantenedor do `lexeditweb-editor`.
- [Zerar a data padrão altera o comportamento de documentos novos no modo normal] → decisão explícita do usuário (padrão "Não informar" nos dois modos); cobrir com teste de componente e E2E.
- [Risco pré-existente da autoria: parlamentar aberto do arquivo que não esteja na lista do host pode ser apagado ao entrar e sair do campo do nome] → agora também alcança o anexo; sem tratamento nesta change, já documentado em `docs/api-componente-lexml-eta.md` (seção 10).
- [Eco assíncrono do `sl-change` do Shoelace e valor padrão aplicado em `DataComponent.updated`] → manter o cuidado do invariante (w): a data lida do arquivo não pode ser sobrescrita pelo padrão; validar na E2E de reabertura.
