# Design

## Context

Ver `proposal.md`. O contexto é montado por `montaContextoDocumento(dados, urns)` (`contextoDocumento.ts`) a partir de `DadosIdentificacao`, que não tem o destino nem a forma de apresentação. O resultado do fluxo calcula o destino em `montarResultado` (`nova-proposicao.component.ts`): `{ tipoColegiado, siglaComissao }` quando a comissão está visível (destino Comissão ou comissão obrigatória da `CD` em substitutivo e subemenda substitutiva) e `{ tipoColegiado: 'Plenário' }` nos demais casos; `anexoParecer` vem direto do estado. A chave da lista da Tela 2b (`carregarDocumentos`) já inclui `JSON.stringify(contexto)`.

## Goals / Non-Goals

**Goals:**
- Uma única regra para o destino, compartilhada entre o contexto e o resultado, para que nunca divirjam.
- Placeholders com valores estáveis e simples para o host comparar.

**Non-Goals:**
- Ementa no contexto: vem da verificação (fonte do host), não do usuário.
- Contexto no modo de edição de dados básicos: esse modo não importa arquivo nem passa pela Tela 2b.
- Levar o contexto a `onObterTextoDocumento`/`urlTextoDocumento` (decisão mantida da c01).
- Placeholder para `siglaCasaLegislativa` da comissão: a casa já está em `{casa}`.

## Decisions

**Destino num getter do componente, usado pelo contexto e pelo resultado.** A expressão de `montarResultado` passa a ser um getter (`colegiadoDestino`), e `montaContextoDocumento` recebe um terceiro parâmetro, `{ colegiadoDestino, anexoParecer }`. Assim o contexto tem exatamente o que o resultado teria. Alternativa descartada: acrescentar o destino a `DadosIdentificacao`, que é usado também para URN e epígrafe e não precisa dele.

**Campos com o mesmo formato do resultado.** `colegiadoDestino` (`Readonly<ColegiadoDestino>`, congelado) e `anexoParecer: boolean` são obrigatórios no tipo, como no `detail`; o host reaproveita o mesmo código para os dois. Alternativa descartada: campos planos (`tipoColegiado`, `siglaComissao`), que diferenciariam o contexto do resultado.

**Placeholders.** `{tipoColegiado}` leva o valor como está (`Plenário`/`Comissão`, codificado), `{siglaComissao}` vira vazio sem comissão e `{anexoParecer}` vira `true`/`false` (`String(boolean)`). `montaUrlContexto` ganha esses três nomes na mesma substituição única, sem colisão com `{sigla}`, `{numero}`, `{ano}` e `{id}`.

**Recarga sem código novo.** Como a chave já serializa o contexto inteiro, o destino e a forma entram nela automaticamente: trocar qualquer um refaz a lista ao voltar à Tela 2b (decisão do usuário, coerente com a regra da c01). A ordem das chaves do objeto é estável, então a serialização também é.

**Demo.** `demoview.ts` acrescenta os três placeholders à `urlImportacaoArquivo` (o backend simulado os ignora), para servir de exemplo. A listagem da demo não muda.

## Risks / Trade-offs

- [Trocar só a caixa de parecer descarta a seleção da Tela 2b] → uma chamada e uma seleção a refazer; aceito para manter a regra simples (o host pode filtrar por esses campos).
- [`Plenário`/`Comissão` com acento na URL] → codificados como componente de URL (`Plen%C3%A1rio`); documentado.
