# Design

## Context

O vocabulário (`src/model/lexml/documento/vocabulario/`, #1026) já oferece `ativo`, `tipoRelacaoSubstitutivo`, `tiposReferenciaveis`, preâmbulo padrão e as visões da casa e completa; `LexmlEtaConfig.casaLegislativaEditor` já informa a casa. O `DestinoComponent` já trata tipo de colegiado e sigla da comissão. O caso de uso completo está em `docs/requisitos/caso-de-uso-nova-proposicao.md`. Esta change só especifica; nenhum código é alterado.

## Goals / Non-Goals

**Goals:**
- Fixar o contrato do componente com o host (configuração de entrada, evento de saída) e as regras de cada tela.
- Reaproveitar o vocabulário e o componente de destino existentes, sem criar fonte de dados nova.

**Non-Goals:**
- Implementar o componente ou o parser de DOCX/TXT/LexML.
- Trocar o tipo do documento (especificação própria).
- Definir modelos de epígrafe e preâmbulo dos novos tipos da `CD` (seção 5 do caso de uso, ainda a confirmar).

## Decisions

- **Componente sem efeito colateral.** Ele coleta e devolve um resultado por evento; quem cria o documento é o host (ou um orquestrador no `lexml-eta`). Alternativa: o componente chamar `inicializarEdicao` direto — descartada porque acopla a coleta ao ciclo de vida do editor e impede reuso no host.
- **Configuração mínima:** `{ casaLegislativa: 'SF' | 'CD', urlVerificacaoProposicao: string, urlTextoEstruturado: string }`, com placeholders `{sigla}`, `{numero}` e `{ano}` nas duas URLs. A casa segue a mesma semântica de `casaLegislativaEditor`.
- **Contrato da verificação:** `200` com `{ ementa: string, textoEstruturadoDisponivel: boolean }`; `404` = inexistente; qualquer outro resultado é erro, tratado como não verificado e com nova tentativa permitida. O mesmo endpoint serve à Tela 1 e à opção "outra proposição" da Tela 2.
- **Serviço do texto (RN-09a):** segundo endpoint, mesmos placeholders; `200` devolve o JSON do texto estruturado e `404` indica texto indisponível. O indicador da verificação antecipa o alerta; o `404` do texto o confirma no momento da obtenção.
- **Evento de resultado:** `nova-proposicao-concluida` com `detail` = `{ urn, urnDocumentoDeReferencia?, epigrafe, preambulo, colegiadoDestino?, texto?, anexoParecer }`; e `nova-proposicao-cancelada` sem `detail`. O resultado já vem pronto para o host criar o documento, sem ele recalcular epígrafe ou preâmbulo.
- **Epígrafe e preâmbulo vêm do vocabulário.** O preâmbulo já existe (`getPreambuloPadrao`); a epígrafe depende de um serviço novo do vocabulário (entrada: `urn` e `urnDocumentoDeReferencia`), especificado em outra issue. Alternativa descartada: o componente montar a epígrafe — duplicaria regra do vocabulário.
- **`urnDocumentoDeReferencia`** (mesmo nome do modelo atual) é preenchida em substitutivo e PLV nas duas casas; no `SF` é a URN do documento referenciado sem o sufixo `@apresentacao.substitutivo`, que fica só na `urn`.
- **Serviço de epígrafe simulado.** Se o serviço de montagem de epígrafe do vocabulário ainda não existir quando o componente for implementado, a implementação adiciona ao vocabulário um serviço simulado com a mesma interface (entrada: `urn` e `urnDocumentoDeReferencia`), a ser substituído pelo definitivo.
- **Formato do `texto`:** o serviço do texto e o campo `texto` do `detail` usam o LexML em formato JSONIX, o mesmo utilizado ao abrir um documento.
- **Serviço do texto só em texto existente:** é chamado ao **Continuar** quando a opção escolhida é a do documento referenciado ou de outra proposição.
- **Siglas referenciáveis** vêm de `tiposReferenciaveis` no `SF` e de todos os tipos que `aceita substitutivo` na `CD`; MPV só entra pela via fixa do PLV.
- **Colegiado de destino** reutiliza o componente existente de destino, restrito a tipo de colegiado e sigla da comissão.
- **Limite de 5 MB** validado no cliente antes de qualquer parser.

## Risks / Trade-offs

- [Contrato da verificação fixa só ementa e indicador de texto estruturado] → o evento e a config são versionáveis; campos extras do JSON são ignorados.
- [Indicador de texto estruturado e `404` do serviço do texto podem divergir] → o `404` do texto prevalece no momento de continuar.
- [A epígrafe depende de serviço ainda não especificado] → a implementação adiciona um serviço simulado ao vocabulário, se o definitivo ainda não existir.
- [Tipos da `CD` não confirmados] → o componente lê do vocabulário, então a confirmação vira dado, não código.
- [Epígrafe/preâmbulo de substitutivo dependem do colegiado coletado] → o resultado já carrega a sigla da comissão; a montagem da epígrafe é outra change.
