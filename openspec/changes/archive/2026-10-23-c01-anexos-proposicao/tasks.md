# Tasks

## 1. Modelo, configuração e spike com o conversor

- [x] 1.1 Substituir `class Anexo` em `proposicao.ts` por `{ idArquivo, nomeArquivo, nomeDocumento, tipo, mimeType }`, criar `MimeType` (PDF e DOCX) e o tipo `TipoAnexo` (`codigo`, `nome`); manter `Proposicao.anexos` com o novo modelo. Verificar com `npm run build` apontando só os usos do anexo antigo (tratados no grupo 3)
- [x] 1.2 Adicionar à `LexmlEtaConfig` os callbacks opcionais `onUploadAnexo`, `onDeleteAnexo`, `onObterAnexoBlob`, `onVisualizarAnexo`, a lista `tiposAnexos` e `tamanhoMaximoAnexo` sem valor padrão (remover o `5120`); exportar os tipos públicos em `src/index.ts`. Verificar pelo teste de configuração: `new LexmlEtaConfig().tamanhoMaximoAnexo` é `undefined`
- [x] 1.3 Criar `normalizarTiposAnexos` (ignora entrada inválida ou repetida, descarta `outro` do host, acrescenta "Outro") com testes unitários: sem lista, com lista válida, entradas inválidas, `outro` repetido
- [x] 1.4 **Spike**: montar um JSON com `lexedit:Anexos` (um e vários anexos, com acentos e `&`), converter por `toxml`/`tojson` com o `JSONIX_LEXML_CLI` (2.2.0), validar o XML com `schemas/lexedit.xsd` e registrar o formato devolvido (lista ou objeto único, nomes das propriedades). Se o conversor descartar o grupo, registrar a decisão e pedir ao usuário a versão do conversor antes de seguir para o grupo 2

## 2. Gravação e leitura no documento articulado

- [x] 2.1 Adicionar `anexos` a `DadosLexEdit` e `MetadadoLexEdit` em `documentoArticulado.ts`
- [x] 2.2 Criar o montador `montaAnexos` em `buildJsonixFromProjetoNorma.ts` e compô-lo em `montaMetadadoLexEdit` (omitido sem anexos, só os cinco atributos, sem pendência)
- [x] 2.3 Criar o leitor `lerAnexos` em `buildProjetoNormaFromJsonix.ts` e compô-lo em `lerMetadadoLexEdit` (lista ou objeto único, descarta anexo sem `idArquivo`/`nomeArquivo` ou com `mimeType` fora de PDF/DOCX, padrões de `nomeDocumento` e `tipo`)
- [x] 2.4 Testes unitários do montador e do leitor: vazio, um e vários anexos, ordem preservada, campos extras ignorados, entrada inválida, objeto único no lugar de lista, convivência com outros grupos
- [x] 2.5 Adicionar ao `documentoArticulado.integration.ts` o cenário de ida e volta com três anexos (acentos e `&`), validando o XML com `schemas/lexedit.xsd` e comparando o segundo salvamento com o primeiro; executar `npm run test:documento-articulado:xml`
- [x] 2.6 Atualizar `docs/extensao-formato-lexml/05-anexos.md` (só metadados, ordem, `tipo` `outro`, sem conteúdo) e conferir que `99-exemplo-completo.md`, `documento-articulado-exemplo.json`/`.xml` e `plano-xsd-lexedit.md` continuam coerentes; verificar com `scripts/validar-exemplos-lexedit.mjs`

## 3. Remoção do anexo atual

- [x] 3.1 Apagar `editor-texto-rico/uploadAnexoDialog.ts` e remover a lista `anexos`, `atualizaAnexo`, `labelAnexo`, o botão e a movimentação de `.panel-anexo` para a barra do Quill de `editor.component.ts` e `editor-texto-rico.component.ts`, e o CSS associado
- [x] 3.2 Remover `getAnexos`/`atualizaAnexos` de `lexml-eta-proposicao.component.ts` e as chamadas em `lexml-eta.component.ts` (`getProposicao` e `setProposicao`); ajustar os testes e fixtures que citam `anexos` (`test/assets/altera_norma_trava_editor.ts`, `lexml-eta-anexo-parecer.test.ts`). Verificar com `npm run build` sem erros e `npm test` sem regressão

## 4. Componente da aba de anexos

- [x] 4.1 Criar `lexml-eta-anexos` (`src/components/anexos/`) com a propriedade `anexos`, a normalização do tipo contra `tiposAnexos` e a lista na ordem (tipo, nome do documento, nome do arquivo, ações), com indicação de lista vazia; testes de componente da renderização e da normalização do tipo
- [x] 4.2 Edição do tipo (`sl-select`, ignorando o eco de `sl-change` — invariante v) e do nome do documento (vazio volta ao nome do arquivo sem extensão), e reordenação com os botões desabilitados nas pontas; testes de componente, incluindo a lista reaplicada que não sobrescreve a escolha do usuário
- [x] 4.3 Importação: diálogo com arquivo (`.pdf`/`.docx`, por MIME ou extensão), tipo obrigatório e nome do documento, nome de arquivo único com sufixo ` (n)`, limite opcional de tamanho antes do upload, `onUploadAnexo`, confirmar desabilitado durante o upload e aviso em caso de erro ou de host sem callback; testes de componente com callbacks simulados (sucesso, erro, sem callback, formato recusado, acima e abaixo do limite, sem limite)
- [x] 4.4 Exclusão (`onDeleteAnexo` e só então remove), visualização (só PDF; `onVisualizarAnexo` ou blob em nova aba) e download (`onObterAnexoBlob`); testes de componente de cada ação e das falhas do host
- [x] 4.5 Emissão de `onchange` com `origemEvento` `anexo` em toda alteração da lista; teste de componente de cada operação

## 5. Aba no editor e integração com o documento

- [x] 5.1 Adicionar a aba e o painel "Anexos" antes de "Avisos" em `lexml-eta.component.ts` (inclusive no modo anexo de parecer) e o contador no rótulo (`@state` atualizado pelo `onchange` e ao abrir); teste de componente da posição, do contador e do modo anexo de parecer
- [x] 5.2 Coletar `anexos` em `getDocumentoArticulado` (inclusive no anexo de parecer) e aplicá-los em `abrirDocumentoArticulado` depois de `inicializarEdicao`; ligar `getProposicao`/`setProposicao` à lista do componente. Testes de componente: salvar com anexos, anexo de parecer, abrir com e sem o grupo, abrir um arquivo depois do outro, documento novo sem anexos
- [x] 5.3 Documentar em `docs/api-componente-lexml-eta.md` os callbacks, `tiposAnexos`, `tamanhoMaximoAnexo` (sem padrão), a aba, o `onchange` de origem `anexo` e que `onDeleteAnexo` é um aviso de exclusão, cabendo ao host decidir se e quando remove o conteúdo (a referência no documento salvo pode sobreviver até o salvamento); remover o que a seção da config diz do `tamanhoMaximoAnexo` antigo

## 6. Demo e teste E2E (Cypress)

- [x] 6.1 Implementar no `demoview.ts` os callbacks com um `Map<idArquivo, Blob>` em memória e uma lista de tipos de exemplo, para a aba funcionar na demo
- [x] 6.2 Avaliar a viabilidade do E2E à luz de `docs/guia-cypress.md` e do padrão de `abertura-outros-metadados.cy.ts`: importar PDF e DOCX com `cy.selectFile` no `input type=file` do diálogo (light DOM do `sl-dialog`), reordenar, excluir, salvar capturando o blob de `URL.createObjectURL` e reabrir pelo `#fileUpload`. Gerar o fixture `demo/doc/teste_anexos.json` por `criarDocumentoArticulado`. Se algum passo não for viável, registrar a decisão e manter a cobertura nos testes de componente (grupos 4 e 5), que exercitam o mesmo risco. **Decisão:** viável e executado. O `input type=file` do diálogo é light DOM, então `cy.selectFile` com `force` funciona; o tipo era escolhido pelo clique real no `sl-select` e no `sl-menu-item` (removido no grupo 7, quando o tipo passou a ser fixo). O E2E importa só PDF (o DOCX fica nos testes de componente, onde o `mimeType` é conferido). O fixture `demo/doc/teste_anexos.json` foi derivado de `teste_outros_metadados.json` por script, no formato que o montador grava (mesmo precedente de `abertura-outros-metadados.cy.ts`), e não chamando `criarDocumentoArticulado` diretamente; a ida e volta do formato já é coberta pela integração com o conversor real
- [x] 6.3 Escrever e executar `cypress/e2e/documento-articulado/anexos-proposicao.cy.ts`, cobrindo abrir um arquivo com anexos (ordem e tipos), importar, reordenar, excluir, salvar e reabrir

## 7. Ajuste: tipo fixo `nao.informado`

- [x] 7.1 Trocar `TIPO_ANEXO_OUTRO` (`outro`) por `TIPO_ANEXO_NAO_INFORMADO` (`nao.informado`, "Não informado") em `tipoAnexo.ts`, no montador e no leitor; o `sl-select` passa a aceitar o valor porque `normalizarTiposAnexos` o inclui. Verificar com os testes unitários do modelo, do montador e do leitor
- [x] 7.2 No componente, atribuir `nao.informado` a todo anexo adicionado, ocultar os campos de tipo (lista e diálogo, `display: none`), não exigir tipo para confirmar e deixar a linha com uma coluna. Verificar com os testes de componente (campo oculto, tipo fixo na importação, confirmar sem tipo, select que aceita o valor)
- [x] 7.3 Atualizar a integração com o conversor real, o fixture `demo/doc/teste_anexos.json`, o E2E, `05-anexos.md`, os exemplos, a API e os artefatos da change (proposta, specs e design). Verificar com `npm run test:documento-articulado:xml` (26 passando) e o spec Cypress (6 passando)

## 8. Verificação final

- [x] 8.1 Rodar a suíte completa (`npm test`), o lint (`npm run lint`) e `openspec validate 2026-10-23-c01-anexos-proposicao`, e conferir que nenhuma referência ao anexo antigo (`uploadAnexoDialog`, `base64` em anexo, `panel-anexo`) permanece (`grep`). **Resultado:** `npm test` passou (executado pelo usuário); o lint aponta 1950 erros, todos de `prettier/prettier` e de `no-require-imports` em 7 arquivos que esta change não tocou (`demo/doc/codigocivil-eta*.ts`, `demo/doc/pec_48_2023.ts`, `test/doc/exemplo-sem-agrupadores.ts`, `cypress.config.ts` e dois `.d.ts` do quill1-table), nenhum nos arquivos alterados; `openspec validate --strict` válido; o `grep` não acha resíduos do anexo antigo neste repositório

## Workflow follow-up

- Coordenar com o `lexeditweb-editor` a implementação dos callbacks (`onUploadAnexo`, `onDeleteAnexo`, `onObterAnexoBlob`, `onVisualizarAnexo`) antes de consumir uma versão publicada com esta mudança.
- Arquivar a change depois da revisão e verificar o resultado arquivado.
