# Design

## Context

O componente `lexml-nova-proposicao` guarda a identificação do substitutivo da `CD` em três estados (`chaveSubstitutivo`, `anoSubstitutivo` e, derivado, `tipoSubstitutivo`), todos alimentados pelo grupo `np-g2`. Esse conjunto entra em `dados` (`DadosIdentificacao`), que `montaUrnNovaProposicao` usa para montar a URN da `CD`, e em `tela1Valida`. Já `lerDadosIdentificacao` e `descricaoDocumento` fazem o caminho inverso, a partir da URN, e não dependem da tela.

O vocabulário da `CD` ([vocabularioCamara.ts](../../../src/model/lexml/documento/vocabulario/vocabularioCamara.ts)) tem um único tipo ativo por relação: `SBT` (`é substitutivo`) e `SSP` (`é subemenda substitutiva`). Motivação e escopo: ver proposal.md.

## Goals / Non-Goals

**Goals:**
- Tirar o grupo g2 da Tela 1 da `CD`, sem alterar a URN gerada nem o contrato do evento de resultado.
- Preservar o ano da URN inicial no modo de edição.

**Non-Goals:**
- Nenhuma mudança no `SF`.
- Nenhuma mudança em `montaUrnNovaProposicao`, `lerDadosIdentificacao`, `descricaoDocumento` e nos tipos de `tiposNovaProposicao.ts`: o contrato de `DadosIdentificacao` (com `tipoSubstitutivo` e `anoSubstitutivo`) continua o mesmo, e só quem o preenche muda.
- Não tratar a virada de ano com a página aberta (o ano corrente já é fixado na criação do componente para os demais campos).

## Decisions

**D1. O tipo é derivado da espécie, não escolhido.** Em `dados`, `tipoSubstitutivo` passa a ser o tipo do vocabulário da casa com a sigla `SBT` (substitutivo) ou `SSP` (subemenda), na `CD`. Somem `chaveSubstitutivo`, `onSiglaSubstitutivo` e a exigência de g2 em `tela1Valida`; `onEspecie` deixa de limpar a chave do substitutivo.
- *Alternativa:* pegar o primeiro item de `getSiglasSubstitutivo(relação)`. Descartada: um tipo ativo novo no vocabulário mudaria a URN em silêncio. Resolver pela sigla mantém a regra "assumir sempre SBT/SSP" explícita.
- A busca pela sigla fica em `siglasNovaProposicao.ts` (junto de `getSiglasSubstitutivo` e `getTipoMpv`, que já resolvem tipos por sigla), e lança erro nomeando a sigla ausente, como `urnMpv` faz com a MPV.

**D2. O ano vem de um estado que sobrevive, sem campo.** `anoSubstitutivo` continua como estado. `reiniciar()` já o põe no ano corrente; `aplicarDadosIniciais()` já o preenche com o ano da URN inicial quando ela é de substitutivo/subemenda, e com o ano corrente nos demais casos (o documento inicial não tem ano de substitutivo). Basta remover o campo, e o comportamento pedido (criação = ano corrente; edição = ano preservado, inclusive na troca de espécie) já decorre disso, porque `onEspecie` não mexe nesse estado.
- *Alternativa:* guardar o tipo e o ano originais e derivar tudo da URN inicial. Descartada: duplica o que `aplicarDadosIniciais` já faz.

**D3. O número do substitutivo da `CD` deixa de ser exibido, mas continua preservado.** `numeroFixoDe(tipoSubstitutivo)` só alimentava o texto cinza do g2. `numeroOriginal` segue sendo lido da URN e aplicado em `montaUrnNovaProposicao`, então a URN do resultado mantém o número real (cenário "Substitutivo da CD com número real"). Efeito aceito: um substitutivo aberto com número real não mostra esse número na Tela 1.

**D4. `grupoSubstitutivoVisivel` muda de significado.** Hoje decide exibir g2 e também se `tipoSubstitutivo` vai para `dados`. Passa a decidir só o segundo (renomear para refletir "documento próprio da `CD`"), de modo que o ramo do `SF` continue com `tipoSubstitutivo` indefinido.

## Risks / Trade-offs

- [Um tipo novo e ativo de substitutivo/subemenda é criado no vocabulário da `CD` e o usuário não consegue escolhê-lo] → aceito: a regra pedida é assumir SBT/SSP; mudar isso exige nova decisão e nova change.
- [Sigla `SBT` ou `SSP` removida ou renomeada no vocabulário] → o componente falha com erro nomeando a sigla, e um teste unitário cobre o cenário "Tipo ausente do vocabulário".
- [Substitutivo da `CD` aberto com número real deixa de mostrar o número na Tela 1] → o número continua na URN do resultado e na descrição do documento (derivada da URN, em `descricaoDocumento`); coberto por cenário da spec.
- [O ano do substitutivo de um documento antigo não pode mais ser corrigido pelo usuário] → aceito: o ano é preservado do que veio na URN, que é o comportamento desejado.
