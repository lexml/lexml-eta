# Design

## Context

O vocabulário (`src/model/lexml/documento/vocabulario/`, #1026) já oferece `ativo`, `tipoRelacaoSubstitutivo`, preâmbulo padrão, as visões da casa e completa e `isSubstitutivo(urn)` (#1056, que removeu `tiposReferenciaveis`); `LexmlEtaConfig.casaLegislativaEditor` já informa a casa. O `DestinoComponent` já trata tipo de colegiado e sigla da comissão. A descrição completa do componente está em `docs/requisitos/componente-nova-proposicao.md`. Esta change só especifica; nenhum código é alterado.

## Goals / Non-Goals

**Goals:**
- Fixar o contrato do componente com o host (configuração de entrada, evento de saída) e as regras de cada tela.
- Reaproveitar o vocabulário e o componente de destino existentes, sem criar fonte de dados nova.

**Non-Goals:**
- Implementar o componente ou o parser de DOCX/TXT/LexML.
- Trocar o tipo do documento (especificação própria).
- Definir modelos de epígrafe e preâmbulo dos novos tipos da `CD` (seção 5 do documento de requisitos, ainda a confirmar).

## Decisions

- **Componente sem efeito colateral.** Ele coleta e devolve um resultado por evento; quem cria o documento é o host (ou um orquestrador no `lexml-eta`). Alternativa: o componente chamar `inicializarEdicao` direto — descartada porque acopla a coleta ao ciclo de vida do editor e impede reuso no host.
- **Layout da Tela 1 em grupos** (`docs/requisitos/layout-tela-1-componente-nova-proposicao.txt`): espécie (g1: Proposição, Substitutivo, Subemenda substitutiva só na `CD`), identificação do substitutivo (g2, só `CD`), identificação da proposição (g3), medida provisória do PLV (g4), destino (g5) e forma de apresentação (g6). O tipo do documento deixa de ser uma lista separada: sai da sigla de g2 (`CD`) ou de g3. O indicativo de substitutivo e a tabela de `tipoRelacaoSubstitutivo` na UI deixam de existir; `tipoRelacaoSubstitutivo` só filtra as listas de siglas.
- **Configuração obrigatória:** `urlVerificacaoProposicao`, `urlTextoEstruturado` e `urlComissoes` são obrigatórias; se faltar qualquer uma, a inicialização do componente falha com erro que identifica a URL ausente (fail-fast, sem telas degradadas). Só a casa tem padrão (`SF`). O mecanismo do erro (exceção na atribuição da configuração, evento de erro ou outro) fica para a implementação. Alternativa descartada: degradar (Verificar desabilitado, só Plenário), que deixaria o usuário em fluxos sem saída.
- **Configuração mínima:** `{ casaLegislativa: 'SF' | 'CD', urlVerificacaoProposicao: string, urlTextoEstruturado: string, urlComissoes: string }`. As duas primeiras URLs têm placeholders `{sigla}`, `{numero}` e `{ano}`; `urlComissoes` tem o placeholder `{casa}`. A casa segue a mesma semântica de `casaLegislativaEditor`.
- **Vocabulário inicializado pelo componente.** Como o `LexmlEtaComponent`, o componente chama `inicializarVocabulario(casa)` no construtor e a cada atribuição da configuração, então o host não precisa inicializá-lo antes. A visão da casa é global e reaproveitada quando a casa não muda, de modo que o componente e o editor na mesma página, com a mesma casa, não se interferem. Alternativa descartada: exigir o vocabulário carregado como pré-condição, o que obrigaria o host a conhecer um detalhe interno do `lexml-eta`.
- **Contrato da verificação:** `200` com `{ ementa: string, textoEstruturadoDisponivel: boolean }`; `404` = inexistente; qualquer outro resultado é erro, tratado como não verificado e com nova tentativa permitida. O mesmo endpoint serve à Tela 1 e à opção "outra proposição" da Tela 2.
- **Serviço do texto (RN-09a):** segundo endpoint, mesmos placeholders; `200` devolve o JSON do texto estruturado e `404` indica texto indisponível. O indicador da verificação antecipa o alerta; o `404` do texto o confirma no momento da obtenção.
- **Evento de resultado:** `nova-proposicao-concluida` com `detail` = `{ urn, urnDocumentoDeReferencia?, epigrafe, preambulo, colegiadoDestino?, texto?, anexoParecer }`; e `nova-proposicao-cancelada` sem `detail`. O resultado já vem pronto para o host criar o documento, sem ele recalcular epígrafe ou preâmbulo.
- **Epígrafe e preâmbulo vêm do vocabulário.** O preâmbulo já existe (`getPreambuloPadrao`); a epígrafe depende de um serviço novo do vocabulário (entrada: `urn` e `urnDocumentoDeReferencia`), especificado em outra issue. Alternativa descartada: o componente montar a epígrafe — duplicaria regra do vocabulário.
- **`urnDocumentoDeReferencia`** (mesmo nome do modelo atual) é preenchida em substitutivo e PLV nas duas casas; no `SF` é a URN do documento referenciado sem o sufixo `@apresentacao.substitutivo`, que fica só na `urn`.
- **Serviço de epígrafe simulado.** Se o serviço de montagem de epígrafe do vocabulário ainda não existir quando o componente for implementado, a implementação adiciona ao vocabulário um serviço simulado com a mesma interface (entrada: `urn` e `urnDocumentoDeReferencia`), a ser substituído pelo definitivo.
- **Formato do `texto`:** o serviço do texto e o campo `texto` do `detail` usam o LexML em formato JSONIX, o mesmo utilizado ao abrir um documento.
- **Serviço do texto só em texto existente:** é chamado ao **Continuar** quando a opção escolhida é a do documento referenciado ou de outra proposição.
- **Listas de siglas** vêm só de `tipoRelacaoSubstitutivo` e `ativo`, iguais nas duas casas: nova proposição = tipos da casa e de CN que não são substitutivo nem subemenda, inativos ao fim em cinza; referência de substitutivo/subemenda = todos os que `aceita substitutivo`, ativos e inativos; g2 = `é substitutivo` ou `é subemenda substitutiva` ativos. MPV (`federal`) só entra pelo g4 do PLV.
- **Sigla inativa em nova proposição** é selecionável, com alerta abaixo da seleção; não bloqueia **Continuar** nem restringe a Tela 2 (inclusive "outra proposição" aceita sigla inativa). Alternativa descartada: desabilitar a sigla, para manter "tipo inativo nunca cria documento novo" — o usuário pediu que seja selecionável.
- **Subemenda substitutiva da `CD` referencia a proposição original**, não o substitutivo; a referência ao substitutivo é implícita e não é coletada. Por isso a lista de g3 (tipos que `aceita substitutivo`) serve às duas espécies, e `urnDocumentoDeReferencia` e o texto da opção 3 da Tela 2 são os da proposição original.
- **Formato das comissões** igual ao da URL do componente de destino atual (`getComissoes` em `lexml-eta.component.ts`): lista JSON de `{ siglaCasaLegislativa, sigla, nome }`, filtrada pela casa pedida. A casa deixa de ir em query string e passa a ser o placeholder `{casa}` da URL configurada. Confirmado: a URL passa a ser montada por substituição do placeholder (o `?siglaCasaLegislativa=` do `getComissoes` atual sai junto com o componente de destino do `lexml-eta`).
- **`isSubstitutivo(urn)`** (#1056) serve de critério de verificação da URN gerada; o componente não a usa para decidir a espécie, que vem de g1.
- **Destino (g5) sempre exibido.** Reaproveita o `DestinoComponent` existente, com os ajustes necessários a este componente (sem "Plenário via comissão"; lista de comissões obtida de `urlComissoes`, com `{casa}` = `SF`, `CD` ou `CN` conforme a autoridade da URN do novo documento; com falha na obtenção, só Plenário). Em consequência, o `lexml-eta` deixa de ter o componente de colegiado de destino, porque deixa de editar essa informação: o destino passa a ser definido na criação do documento e vem do resultado do componente. A remoção do componente no `lexml-eta` e o ajuste do que hoje salva e abre o `ColegiadoApreciador` (change `2026-10-19-c01-metadados-lexedit-situacao-colegiado`) são trabalho da implementação, em change própria.
- **Limite de 5 MB** validado no cliente antes de qualquer parser.

## Risks / Trade-offs

- [Contrato da verificação fixa só ementa e indicador de texto estruturado] → o evento e a config são versionáveis; campos extras do JSON são ignorados.
- [Indicador de texto estruturado e `404` do serviço do texto podem divergir] → o `404` do texto prevalece no momento de continuar.
- [A epígrafe depende de serviço ainda não especificado] → a implementação adiciona um serviço simulado ao vocabulário, se o definitivo ainda não existir.
- [Tipos da `CD` não confirmados] → o componente lê do vocabulário, então a confirmação vira dado, não código.
- [Epígrafe/preâmbulo de substitutivo dependem do colegiado coletado] → o resultado já carrega a sigla da comissão; a montagem da epígrafe é outra change.
- [Retirar o destino do `lexml-eta` afeta quem hoje o edita, salva e abre] → a implementação precisa definir de onde o editor passa a ler o destino ao abrir um documento (arquivo, metadado ou resultado do componente) ; **BREAKING** a tratar na change de implementação.
- [Host precisa fornecer a lista de comissões, inclusive `CN`] → a URL é obrigatória e a spec trata só a falha na obtenção (só Plenário); o contrato fica registrado para o host, ainda em desenvolvimento, atender.
