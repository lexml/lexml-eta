# Proposal

## Why

A criação de uma nova proposição (tipo do documento, substitutivo, proposição referenciada e texto inicial) ainda não tem especificação aprovada: o comportamento está descrito só em `docs/requisitos/componente-nova-proposicao.md`, com pontos em aberto. A issue #1024 pede a **especificação** do componente, para que a implementação e o contrato com o host (`lexeditweb-editor`/Infoleg Editor) possam ser planejados sobre requisitos testáveis.

## What Changes

- Registra, como spec do OpenSpec, o componente de nova proposição: duas telas (tipo do documento; texto inicial) e a tela de erro de conversão.
- Fecha os pontos em aberto do documento de requisitos com as decisões do #1024:
  - a Tela 1 ganha o componente de **colegiado de destino** quando o documento é substitutivo (resolve a sigla do colegiado da epígrafe do substitutivo do SF);
  - a verificação da proposição usa uma **URL configurável com placeholders** de sigla, número e ano; `200` devolve JSON com ementa e indicador de existência de texto estruturado, `404` indica proposição inexistente;
  - os tipos e as siglas referenciáveis vêm do **vocabulário** (SF e CD);
  - o arquivo importado tem limite de **5 MB**;
  - a MPV (autoridade `federal`) **não** entra nas siglas referenciáveis; só aparece como referência obrigatória do PLV.
- Define o **contrato do componente**: recebe um objeto de configuração (casa legislativa do editor e URL de verificação) e devolve, por evento, um objeto de resultado com as informações coletadas.
- Atualiza `docs/requisitos/componente-nova-proposicao.md` para refletir essas decisões.
- Fora do escopo: implementação do componente; o caso "trocar tipo do documento" (especificação própria); o parser de DOCX/TXT/LexML.

Sem **BREAKING**: nenhum código é alterado.

## Capabilities

### New Capabilities
- `nova-proposicao`: fluxo e contrato do componente de nova proposição (telas, regras de negócio RN-00 a RN-17, identificação/URN, configuração e evento de resultado).

### Modified Capabilities
<!-- Nenhuma: o vocabulário (`vocabulario-urn`) já provê tipos, `ativo`, `tipoRelacaoSubstitutivo` e `tiposReferenciaveis`. -->

## Impact

- Documentação: `docs/requisitos/componente-nova-proposicao.md` (decisões incorporadas, §8 reduzido) e nova spec em `openspec/specs/nova-proposicao/` após o arquivamento.
- Sem impacto em `src/`, testes ou dependências.
- Coordenação futura com o host: ele precisará fornecer a URL de verificação e informar `casaLegislativaEditor`.
