# Design

## Context

Hoje, no `lexml-nova-proposicao`, o destino Plenário limpa a comissão (`onTipoColegiado`, `limparComissao`), `destinoValido` só exige comissão em Comissão e o resultado só traz `siglaComissao` em Comissão. A cadeia de dados já comporta a comissão com qualquer tipo: `ColegiadoApreciador.siglaComissao` é independente do tipo, o montador grava `siglaComissao` sempre que houver (`buildJsonixFromProjetoNorma.ts`), o leitor a lê sempre (`buildProjetoNormaFromJsonix.ts`) e `lexml-eta.component.ts` a copia. Ver proposal.md - Why.

## Goals / Non-Goals

**Goals:**
- Exigir uma comissão no Plenário, só na `CD` em Substitutivo e Subemenda substitutiva.
- Manter o resto do fluxo e do formato do arquivo como está.

**Non-Goals:**
- Seleção múltipla de comissões (confirmado: uma só).
- Mudar `SF`, Proposição na `CD`, epígrafe (a `CD` não usa sufixo) ou o local do fecho (continua derivado do tipo do colegiado: Plenário = "Sala das Sessões").
- Validar arquivos antigos da `CD` com Plenário e sem comissão ao abrir: eles continuam abrindo.

## Decisions

1. **Um getter único, `comissaoObrigatoria`** (`casa === 'CD' && especie !== 'proposicao'`, o mesmo critério de `documentoProprioCd`), usado nos quatro pontos: exibição do seletor (`tipoColegiado === 'Comissão' || comissaoObrigatoria`), `destinoValido`, `onTipoColegiado` (não limpa a comissão ao ir para Plenário) e `montarResultado`. Alternativa descartada: espalhar `casa === 'CD'` em cada ponto, que repetiria a regra.
2. **Resultado**: `colegiadoDestino` passa a ser `{ tipoColegiado, siglaComissao }` quando há comissão (Comissão sempre; Plenário só com `comissaoObrigatoria`). Sem mudança no tipo `ColegiadoDestino`, que já tem `siglaComissao?`.
3. **Falha na lista de comissões** (`comissaoIndisponivel`): com `comissaoObrigatoria`, o destino volta ao padrão Plenário, como hoje, mas `destinoValido` fica falso e o erro é mostrado, então **Continuar** permanece desabilitado. Alternativa descartada: deixar concluir sem comissão, que contradiz a regra de negócio.
4. **Modo de edição**: `aplicarDadosIniciais` lê `siglaComissao` também para Plenário quando `comissaoObrigatoria`. Arquivo antigo da `CD` com Plenário sem comissão abre com o seletor vazio e **Continuar** desabilitado.
5. **Aba "Dados da proposição"**: `dados-basicos.component.ts` mostra "Plenário (SIGLA)" quando há sigla, sem mudar "Comissão (SIGLA)".
6. **Mudança de espécie**: ao voltar para Proposição, `aplicarPadroesDaEspecie` já limpa a comissão, o que está correto (na Proposição o Plenário não leva comissão).

## Risks / Trade-offs

- [Host recebe `siglaComissao` em colegiado Plenário, antes impossível] → comunicar ao Infoleg Editor; o formato do arquivo e o contrato já aceitam.
- [Documento antigo da `CD` sem comissão no Plenário só é corrigido ao usar "Alterar dados básicos"] → aceito; a abertura não valida.
- [O destino Plenário com comissão pode confundir quem lê o `colegiadoApreciador` esperando comissão só em Comissão] → documentar em `docs/api-componente-lexml-eta.md`.
