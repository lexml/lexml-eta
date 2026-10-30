# Proposal

## Why

A especificação do componente de nova proposição (`nova-proposicao`, issue #1024) foi aprovada, mas o componente ainda não existe: a demo cria a proposição com URN, epígrafe e preâmbulo fixos e o destino é coletado por um formulário do próprio `lexml-eta`. A issue #1050 implementa o componente, o integra à demo e, como o destino passa a ser definido por ele, retira o formulário de destino do editor.

## What Changes

- **Novo componente de nova proposição** (`src/components/nova-proposicao/`), com as Telas 1 (identificação), 2 (texto inicial) e 3 (erro de conversão), a montagem da URN, o cabeçalho de identificação, a epígrafe do caso padrão e o preâmbulo, e os eventos `nova-proposicao-concluida` e `nova-proposicao-cancelada`, conforme a spec `nova-proposicao`.
- **Importação de arquivo simulada**: o tratamento real do upload (DOCX, TXT, LexML) fica para outra issue. Nesta change o componente apenas simula o upload e responde com um erro de parser simulado, que leva à Tela 3, sem chamar nenhuma URL.
- **Fallback do preâmbulo no componente**: sem modelo para o tipo, o componente registra log de erro de preâmbulo não encontrado para a URN e usa `O CONGRESSO NACIONAL decreta:`. `getPreambuloPadrao` e a abertura de documentos não mudam.
- **Backend Node da demo** (`demo/server/`), ligado ao middleware do `web-dev-server.config.mjs`, com URLs simuladas de comissões por casa, verificação de proposição e texto estruturado, alimentadas pelos documentos de teste da combo da demo (PL, PLP e MPV).
- **Integração na demo**: "Nova proposição" abre o componente em um `sl-dialog` modal; ao concluir, a demo chama `novaProposicao()` com os dados coletados; ao cancelar, só fecha o modal.
- **Retirada do formulário de destino do `lexml-eta`** (**BREAKING** para o `lexeditweb-editor`): o colegiado apreciador deixa de ser editável no editor e passa a ser tratado como o `anexoParecer`: vem do `novaProposicao` (ou do arquivo aberto) e é gravado e lido dos metadados do LexEdit **somente se existir**; se não existir, não é lido nem gravado.
- **E2E Cypress** do fluxo das três telas e da integração na demo.

## Capabilities

### New Capabilities

Nenhuma. O componente já tem capability própria.

### Modified Capabilities

- `nova-proposicao`: o upload de arquivo da Tela 2 passa a ser simulado nesta etapa (erro de parser simulado, sem chamada a URL) e o fallback do preâmbulo fica no componente.
- `metadados-lexedit`: `lexedit:ColegiadoApreciador` só é gravado e lido quando o colegiado existe; não há mais valor padrão gravado.
- `abrir-documento-articulado`: o destino deixa de ser aplicado a um formulário; arquivo sem `ColegiadoApreciador` abre sem colegiado (substitui o cenário de "Plenário" padrão).
- `salvar-documento-articulado`: o local do fecho passa a derivar do colegiado existente (ou "Sala das Sessões" na ausência dele), e o arquivo não registra `ColegiadoApreciador` quando não há colegiado.
- `modo-anexo-parecer`: a aba deixa de exibir o formulário de destino (rótulo e cenários ajustados).
- `interface-lexml-eta`: `novaProposicao` mantém o colegiado opcional, que agora é o único meio de informá-lo.

## Impact

- **Código novo**: `src/components/nova-proposicao/`, `demo/server/` (handlers e dados simulados), ajustes em `demo/components/demoview.ts` e `web-dev-server.config.mjs`.
- **Código alterado**: `src/components/lexml-eta.component.ts` (remoção de `_lexmlDestino`, `destinoAoAbrir` e do aplicar/coletar destino), `src/components/destino/` (removido), `buildProjetoNormaFromJsonix.ts`/`buildJsonixFromProjetoNorma.ts` (colegiado condicional), `Proposicao.colegiadoApreciador` (passa a opcional) e `src/index.ts` (exportação do componente).
- **Host `lexeditweb-editor`** (**BREAKING**): o formulário de destino some do editor; o host precisa fornecer `urlVerificacaoProposicao`, `urlTextoEstruturado` e `urlComissoes` ao componente de nova proposição, informar `casaLegislativaEditor` e tratar o `colegiadoApreciador` ausente em `Proposicao`. O renome `lexmlEtaConfig` já foi tratado na issue #1000.
- **Dependência**: o serviço de epígrafe (#1053) segue aberto; o componente usa a epígrafe do caso padrão sem alterar o contrato do evento.
- **Fora do escopo**: tratamento real do upload de arquivo; serviço de epígrafe; diálogo "Alterar dados básicos do documento".
