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
- **Casa derivada da autoridade.** Um único mapa `senado.federal`→`SF`, `camara.deputados`→`CD`, `congresso.nacional`→`CN`; `casaLegislativa` deixa de ser parâmetro. A criação restringe-se a essas autoridades *dentro* do vocabulário da casa do editor (SF: `senado` + `congresso`; CD: `camara` + `congresso`); a autoridade `federal` fica só para reconhecimento. Alternativa descartada: campo no vocabulário declarando a casa apreciadora do tipo, por ser escopo de outra change.
- **Tipo "outro" por autoridade.** Na abertura, URN fora das três autoridades vira "outro" (um predicado único consultado por destino, autoria, aba de avisos e montador de pendências). A pendência é recalculada pela URN, nunca lida do arquivo, para não haver segunda fonte de verdade.
- **Modo de anexo de parecer e URN referenciada no arquivo.** `montaMetadadoLexEdit` grava os dois atributos; `lerMetadadoLexEdit` os lê com leitor tolerante (ausente/inválido assume `false` e sem referência), no padrão do item 13 do `CLAUDE.md`. `anexoParecer` sempre é gravado (`true` ou `false`); `urnDocumentoReferenciado` só quando há valor. O `lexedit.xsd` já os prevê, então não há mudança de esquema.
- **Configuração da sessão em `lexmlEtaConfig`.** `usuario`, `configuracaoPaginacao`, `autoriaPadrao` e `opcoesImpressaoPadrao` migram para lá; `anexoParecer` sai. O reset não toca a configuração. Alternativa descartada: manter esses itens como parâmetros por documento, porque abrir recebe só o documento e ficariam sem origem ou herdariam estado oculto.
- **Documento de modelo só empresta articulação e ementa.** Reaproveita o caminho de abrir com `preservarTextoDocumento`, mas descarta todo o `lexedit` e a parte inicial/final do modelo e aplica os parâmetros.
- **Estado neutro uniforme.** Um único estado "sem documento" no `render()`: todas as abas das duas colunas desabilitadas, mensagem centralizada na primeira aba da esquerda; o divisor reutiliza o desabilitar já existente. `fecharDocumento()` executa o mesmo reset e entra nesse estado.
- **Reset também do `rootStore`.** O reset despacha uma ação que devolve o `elementoReducer` ao estado inicial, preservando o que é da sessão (usuário). O inventário do que sobrevive hoje de um documento para o outro (revisões, remissões internas e externas, alertas, histórico de desfazer, mensagens críticas) é a primeira tarefa de implementação e define o conjunto exato.
- **Contrato de entrada e o #1024.** Os dados de `novaProposicao` incluem os do `detail` de `nova-proposicao-concluida` (`urn`, `urnDocumentoDeReferencia`, `epigrafe`, `preambulo`, `colegiadoDestino`, `texto`, `anexoParecer`) com os nomes alinhados ao modelo; o host pode montar o objeto a partir do evento ou dispensar o componente.

## Risks / Trade-offs

- [Estado compartilhado do `rootStore` que escape do reset e contamine o documento seguinte] → inventário explícito na primeira tarefa e teste de reset que abre dois documentos em sequência e compara o estado.
- [Quebra do contrato com o `lexeditweb-editor`, inclusive a migração de usuário, paginação e padrões para a configuração] → registrar como **BREAKING**, listar a migração no resumo da entrega e coordenar com quem mantém o host; um binding antigo falha em silêncio (cai no valor padrão).
- [Arquivos antigos sem `anexoParecer` abrem no modo normal, mesmo que tenham sido salvos como anexo de parecer] → comportamento igual ao de hoje quando a configuração não o ativa; sem regressão, mas o host que dependia da configuração precisa reabri-los conscientemente.
- [Documento de tipo "outro" perde destino e autoria ao salvar, pois ambos são gravados vazios] → aceito e coberto pela pendência gravada e pelo erro na aba de avisos.
- [A epígrafe obrigatória depende de serviço ainda não especificado] → fora do escopo; o `lexml-eta` valida só a presença.
- [Aba da direita e divisor desabilitados dependem de código de `render()` espalhado] → um único indicador de estado neutro consultado pelos pontos existentes.
- [A spec `anexos-proposicao` ainda cita a inicialização com `anexoParecer` ativo] → acompanhar o texto na implementação; o comportamento não muda.
