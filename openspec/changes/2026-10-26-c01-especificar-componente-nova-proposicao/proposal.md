# Proposal

## Why

A criação de uma nova proposição (tipo do documento, substitutivo, proposição referenciada e texto inicial) ainda não tem especificação aprovada: o comportamento está descrito só em `docs/requisitos/componente-nova-proposicao.md`, com pontos em aberto. A issue #1024 pede a **especificação** do componente, para que a implementação e o contrato com o host (`lexeditweb-editor`/Infoleg Editor) possam ser planejados sobre requisitos testáveis.

## What Changes

- Registra, como spec do OpenSpec, o componente de nova proposição: duas telas (identificação do documento; texto inicial) e a tela de erro de conversão.
- A Tela 1 segue o layout de `docs/requisitos/layout-tela-1-componente-nova-proposicao.txt`, em grupos: espécie (Proposição, Substitutivo, Subemenda substitutiva só na CD), identificação do substitutivo (só CD), identificação da proposição, medida provisória do PLV, destino e forma de apresentação.
- Fecha os pontos em aberto do documento de requisitos com as decisões do #1024:
  - o **destino** (Plenário ou Comissão, sem "Plenário via comissão") é sempre coletado; a lista de comissões vem de uma **URL configurável** com placeholder da casa (`SF`, `CD` ou `CN`); as URLs de verificação, de texto estruturado e de comissões são obrigatórias (sem elas a inicialização falha) e, se a obtenção das comissões falhar, só Plenário. A sigla da comissão resolve a epígrafe do substitutivo do SF;
  - a verificação da proposição usa uma **URL configurável com placeholders** de sigla, número e ano; `200` devolve JSON com ementa e indicador de existência de texto estruturado, `404` indica proposição inexistente;
  - as siglas vêm do **vocabulário** (`tipoRelacaoSubstitutivo` e `ativo`), iguais no SF e na CD; siglas inativas de nova proposição ficam ao fim, em cinza, selecionáveis e com alerta;
  - o arquivo importado tem limite de **5 MB**;
  - a MPV (autoridade `federal`) **não** entra nas listas de siglas; só aparece como referência obrigatória do PLV;
  - a caixa "Este documento será apresentado em parecer" é marcada por padrão em substitutivo e subemenda.
- Define o **contrato do componente**: recebe um objeto de configuração (casa legislativa do editor e URLs de verificação, texto estruturado e comissões) e devolve, por evento, um objeto de resultado com as informações coletadas.
- Decide que o `lexml-eta` deixa de ter o componente de colegiado de destino (a ser implementado em change própria).
- Atualiza `docs/requisitos/componente-nova-proposicao.md` para refletir essas decisões.
- Fora do escopo: implementação do componente; o caso "trocar tipo do documento" (especificação própria); o parser de DOCX/TXT/LexML.

Sem **BREAKING** nesta change: nenhum código é alterado. A retirada do componente de destino do `lexml-eta` é **BREAKING** para quem o usa ou salva e abre o colegiado, e será tratada na change de implementação.

## Capabilities

### New Capabilities
- `nova-proposicao`: fluxo e contrato do componente de nova proposição (telas, regras de negócio, identificação/URN, configuração e evento de resultado).

### Modified Capabilities
<!-- Nenhuma: o vocabulário (`vocabulario-urn`) já provê tipos, `ativo`, `tipoRelacaoSubstitutivo` e `isSubstitutivo` (#1056). -->

## Impact

- Documentação: `docs/requisitos/componente-nova-proposicao.md` (decisões incorporadas, §8 reduzido) e nova spec em `openspec/specs/nova-proposicao/` após o arquivamento.
- Sem impacto em `src/`, testes ou dependências.
- Coordenação futura com o host: ele precisará fornecer as URLs de verificação, de texto estruturado e de comissões (inclusive `CN`) e informar `casaLegislativaEditor`.
