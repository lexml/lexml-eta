# Design

## Context

Ver `proposal.md` (Why). Hoje `LexmlEtaComponent` expõe `inicializarEdicao(params, preservarTextoDocumento)` e `abrirDocumentoArticulado(entrada)`, que chama o primeiro por baixo. `LexmlEtaParametrosEdicao` aceita a identificação por `urn`, `sigla`/`numero`/`ano`, `proposicao` ou `projetoNorma` (`getUrnRecebida` escolhe por precedência) e mistura dados do documento com preferências (`usuario`, `autoriaPadrao`, `opcoesImpressaoPadrao`, `configuracaoPaginacao`). A casa vem de `inicializaCasaLegislativa` (MPV/PDN/PRN dão `CN`; o resto vem de `params.casaLegislativa` ou do colegiado). O modo de anexo de parecer é lido de `lexmlEtaConfig.anexoParecer` a cada inicialização. O `render()` sempre desenha as abas. O estado global (`rootStore`) não é limpo pelo componente. A change `2026-10-26-c01-especificar-componente-nova-proposicao` (#1024) define o componente que coleta os dados e dispara `nova-proposicao-concluida`.

## Goals / Non-Goals

**Goals:**
- Uma interface explícita de três métodos, com reset completo e estado neutro.
- O que é do documento viaja com o documento (inclusive no arquivo); o que é da sessão fica na configuração.

**Non-Goals:**
- Implementar o componente de nova proposição (#1024) ou o serviço de epígrafe.
- Suportar a abertura de documento da casa oposta.
- Rastrear alterações pendentes no componente.
- Gravar o rótulo anterior ou outros dados de revisão (outras changes).

## Decisions

- **Três métodos, sem `inicializarEdicao` público.** `novaProposicao(dados)`, `abrirDocumentoArticulado(entrada)` e `fecharDocumento()`; a rotina interna comum fica privada. Alternativa descartada: manter `inicializarEdicao` e só acrescentar o estado neutro, porque preservaria a identificação ambígua. O host é controlado, então a quebra é aceita.
- **Validação antes de qualquer atribuição.** Todo método valida a entrada e a URN antes de tocar no estado, como `verificarUrnDaCasaDoEditor` já faz. Entrada inválida emite o erro fatal e deixa o documento como estava.
- **Casa como sigla da autoridade no vocabulário.** Cada autoridade ganha `sigla` opcional (`senado.federal`→`SF`, `camara.deputados`→`CD`, `congresso.nacional`→`CN`; `federal` sem sigla), e a casa responsável é a sigla da autoridade da URN (`getCasaLegislativaResponsavel`); `casaLegislativa` deixa de ser parâmetro. Alternativa descartada: um mapa fixo no código, que duplicaria o vocabulário. Também descartado: campo por tipo declarando a casa apreciadora, por ser escopo de outra change.
- **Proposição suportada e tipo "não suportado" pelo vocabulário.** Uma URN é de proposição suportada quando o tipo resolvido está em `proposicoes()` (tipos com sigla da visão da casa, ativos ou não) e a autoridade dele tem sigla de casa; `verificarUrnParaNovaProposicao` exige isso, e `isTipoDocumentoNaoSuportado` é a negação — um predicado único consultado por destino, autoria, aba de avisos e montador de pendências. Normas (ex.: `senado.federal:resolucao`) e MPV ficam "outro". Os inativos (PLS, PLC) não são filtrados: barrá-los na criação faria um PLS antigo abrir como "outro"; o alerta ou bloqueio antes da criação fica para o host. A pendência é recalculada pela URN, nunca lida do arquivo, para não haver segunda fonte de verdade.
- **Modo de anexo de parecer e URN referenciada no arquivo.** `montaMetadadoLexEdit` grava os dois atributos; `lerMetadadoLexEdit` os lê com leitor tolerante (ausente/inválido assume `false` e sem referência), no padrão do item 13 do `CLAUDE.md`. `anexoParecer` sempre é gravado (`true` ou `false`); `urnDocumentoReferenciado` só quando há valor. O `lexedit.xsd` já os prevê, então não há mudança de esquema.
- **Configuração da sessão em `lexmlEtaConfig`.** `usuario`, `configuracaoPaginacao`, `autoriaPadrao` e `opcoesImpressaoPadrao` migram para lá; `anexoParecer` sai. O reset não toca a configuração. Alternativa descartada: manter esses itens como parâmetros por documento, porque abrir recebe só o documento e ficariam sem origem ou herdariam estado oculto.
- **Documento de modelo só empresta articulação e ementa.** Reaproveita o caminho de abrir com `preservarTextoDocumento`, mas descarta todo o `lexedit` e a parte inicial/final do modelo e aplica os parâmetros.
- **Estado neutro uniforme.** Um único estado "sem documento" no `render()`: todas as abas das duas colunas desabilitadas, mensagem centralizada na primeira aba da esquerda; o divisor reutiliza o desabilitar já existente. `fecharDocumento()` executa o mesmo reset e entra nesse estado.
- **Reset também do `rootStore`.** O reset despacha `RESETAR_DOCUMENTO`, que devolve o `elementoReducer` ao estado inicial preservando só o usuário (sessão); `ABRIR_ARTICULACAO` já recriava a maior parte do estado, mas não o modo de revisão, e `FECHAR` precisa de um estado sem articulação. Inventário do que sobrevivia de um documento para o outro:
  - **Redux, já recriado por `ABRIR_ARTICULACAO`:** articulação, histórico (`past`/`present`/`future`), revisões, remissões internas e externas, alertas de abertura, paginação e mensagens críticas.
  - **Redux, sobrevivia:** `emRevisao` (o componente só o desligava quando não havia revisões) — agora zerado pelo reset, com o evento `RevisaoDesativada` para a chave da tela.
  - **Componente raiz, sobrevivia:** `outrosMetadados` de uma nova proposição, `notasRodape`, `substitutivo` e o conteúdo dos formulários até o `setProposicao`; agora zerados em `descartarDocumentoAtual()`.
  - **Componente de proposição, sobrevivia:** o carregamento de revisões agendado (1 s) para o documento anterior; agora cancelado em `setRevisoes`.
  - **Timers do editor:** a validação agendada após o carregamento (`VALIDAR_ARTICULACAO`) pode chegar depois do fechamento; `validaArticulacao` ignora o estado sem articulação.
- **Abas do estado neutro com `inert`, não `disabled`.** Com todas as abas `disabled`, o `sl-tab-group` do Shoelace (`2.0.0-beta.73`) não tem aba para ativar quando o `IntersectionObserver` dispara e lança `TypeError` no console. Cada aba fica `inert` com a classe `aba-neutra` (opacidade reduzida): não é clicável nem focável, que é o efeito pedido. O divisor usa `disabled` do `sl-split-panel`.
- **Contrato de entrada e o #1024.** Os dados de `novaProposicao` incluem os do `detail` de `nova-proposicao-concluida` (`urn`, `urnDocumentoDeReferencia`, `epigrafe`, `preambulo`, `colegiadoDestino`, `texto`, `anexoParecer`) com os nomes alinhados ao modelo; o host pode montar o objeto a partir do evento ou dispensar o componente.

## Risks / Trade-offs

- [Estado compartilhado do `rootStore` que escape do reset e contamine o documento seguinte] → inventário explícito na primeira tarefa e teste de reset que abre dois documentos em sequência e compara o estado.
- [Quebra do contrato com o `lexeditweb-editor`, inclusive a migração de usuário, paginação e padrões para a configuração] → registrar como **BREAKING**, listar a migração no resumo da entrega e coordenar com quem mantém o host; um binding antigo falha em silêncio (cai no valor padrão).
- [Arquivos antigos sem `anexoParecer` abrem no modo normal, mesmo que tenham sido salvos como anexo de parecer] → comportamento igual ao de hoje quando a configuração não o ativa; sem regressão, mas o host que dependia da configuração precisa reabri-los conscientemente.
- [Documento de tipo "não suportado" perde destino e autoria ao salvar, pois ambos são gravados vazios] → aceito e coberto pela pendência gravada e pelo erro na aba de avisos.
- [A epígrafe obrigatória depende de serviço ainda não especificado] → fora do escopo; o `lexml-eta` valida só a presença.
- [Aba da direita e divisor desabilitados dependem de código de `render()` espalhado] → um único indicador de estado neutro consultado pelos pontos existentes.
- [A spec `anexos-proposicao` ainda cita a inicialização com `anexoParecer` ativo] → acompanhar o texto na implementação; o comportamento não muda.
