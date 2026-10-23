# Design

## Context

O anexo atual vive no editor de texto: botão na barra de ferramentas, `uploadAnexoDialog.ts` (um PDF, `FileReader`, `base64`) e a lista `anexos` em `editor.component.ts`, repassada por `lexml-eta-proposicao.component.ts` até `Proposicao.anexos` (`getProposicao`/`setProposicao`). Nada disso toca o documento articulado. Motivação e escopo: ver proposal.md. O comportamento exigido está nas specs `anexos-proposicao` e `metadados-lexedit`.

Restrições do projeto que moldam o desenho:
- Cada grupo do `lexedit:Metadado` segue o mesmo padrão (CLAUDE.md, item 13): campo em `DadosLexEdit`, montador puro composto em `montaMetadadoLexEdit`, leitor puro e tolerante composto em `lerMetadadoLexEdit`, coleta no componente raiz e aplicação ao abrir **depois** de `inicializarEdicao`.
- O `lexedit.xsd` já declara `Anexos`/`Anexo` (cinco atributos obrigatórios). Não há mudança de esquema.
- O formulário da aba de destino/autoria/impressão já mostra o padrão de componente próprio consultado por `@query` no raiz (`lexml-eta.component.ts`).
- O `lexml-parecer` tem a mesma funcionalidade (callbacks do host, tipos, ordem) e serve de referência de comportamento, mas usa Web Awesome; o eta usa Shoelace.

## Goals / Non-Goals

**Goals:**
- Um componente de aba autocontido, que guarda a lista de anexos e fala com o host só por callbacks.
- Reaproveitar o padrão de metadados do LexEdit, sem criar mecanismo novo.
- Paridade de comportamento com o `lexml-parecer` onde a spec não diz o contrário (tipos, nome único, mensagens de erro).

**Non-Goals:**
- Substituir o arquivo de um anexo já importado (o `lexml-parecer` tem "substituir"; o rascunho de tela do eta não tem).
- Guardar, converter ou pré-visualizar o conteúdo dos arquivos no editor.
- Mudar o comportamento do `lexml-parecer`.

## Decisions

### D1 — Componente próprio `lexml-eta-anexos`, dono da lista
Novo `LitElement` em `src/components/anexos/`, na aba "Anexos", com a propriedade `anexos` (lista de `Anexo`) e `lexmlEtaConfig`. O raiz o consulta por `@query` (como `_lexmlOpcoesImpressao`), lê a lista ao salvar e a define ao abrir. A lista **não** passa pelo Redux: é estado de formulário, sem relação com a articulação, como autoria e opções de impressão. Alternativa descartada: manter a lista no `editor.component.ts` (como hoje), que a ligaria ao editor de texto, ao qual o anexo não pertence.

### D2 — Modelo `Anexo` no formato do XSD
`class Anexo` em `proposicao.ts` passa a `{ idArquivo, nomeArquivo, nomeDocumento, tipo, mimeType }`, com `MimeType` (`application/pdf` e o tipo DOCX). `Proposicao.anexos` **permanece**, com o novo modelo: `getProposicao` lê a lista do componente e `setProposicao` a aplica, de modo que o instantâneo da `Proposicao` não perde os anexos. Isto difere em um ponto do texto da issue ("remover `Proposicao.anexos`"): remover o campo faria o caminho `params.proposicao` descartar os anexos em silêncio. Se preferir remover, a mudança é só apagar essas duas linhas e o requisito correspondente.

### D3 — Callbacks, tipos e limite na `LexmlEtaConfig`
A `LexmlEtaConfig` ganha, todos opcionais: `onUploadAnexo(file) => string | Promise<string>`, `onDeleteAnexo(anexo)`, `onObterAnexoBlob(anexo) => { blob, contentType } | Promise<...>`, `onVisualizarAnexo(anexo)`, `tiposAnexos?: TipoAnexo[]` (`{ codigo, nome }`) e `tamanhoMaximoAnexo?: number` (KB, **sem valor padrão**; valor não positivo equivale a sem limite). As assinaturas espelham as do `lexml-parecer` para o host reaproveitar a implementação. A config já é o canal de integração do host e já é repassada aos componentes filhos por `.lexmlEtaConfig`. Alternativa descartada: propriedades soltas no `LexmlEtaComponent`, que espalhariam a configuração.

### D3b — Normalização dos tipos
Função pura `normalizarTiposAnexos(tipos)` no mesmo molde do parecer: ignora entradas inválidas ou com código repetido, descarta `outro` vindo do host e acrescenta `Outro` no fim. Ao definir a lista, um anexo com tipo fora do conjunto passa a `outro`. Isso perde o código original se o host mudar a lista depois, o mesmo trade-off do parecer, aceito por manter paridade.

### D4 — Fluxo de importação
Diálogo Shoelace (`sl-dialog`) com `input type=file` (`accept=".pdf,.docx"`), seleção do tipo (obrigatório) e nome do documento (padrão: nome do arquivo sem extensão). Validação do formato por tipo MIME **ou** extensão (um dos dois basta, como no parecer). Depois da validação de formato e de tamanho (D5), `onUploadAnexo(file)` devolve o `idArquivo`; o `File` não é retido. Nome de arquivo único: sufixo ` (n)` antes da extensão, sem diferenciar maiúsculas. Enquanto o upload corre, o botão de confirmar fica desabilitado.

### D5 — Limite de tamanho antes do upload
A checagem de tamanho acontece no cliente, antes de chamar o callback; sem `tamanhoMaximoAnexo` positivo não há checagem. A validação do host continua necessária (o limite do cliente é só conveniência).

### D6 — Reordenação, exclusão, visualização e download
Mover é troca de posição na lista (sem animação: o parecer a tem, mas não é requisito). Excluir chama `onDeleteAnexo` e **só então** remove da lista; em erro mantém o anexo e avisa. Visualizar (só PDF) usa `onVisualizarAnexo` se existir; senão obtém o blob por `onObterAnexoBlob`, cria uma URL de objeto e abre em outra aba com `noopener`, revogando a URL depois. Baixar usa sempre `onObterAnexoBlob`. Mensagens por `alertarInfo` (`redux/elemento/util/alertaUtil`), com os mesmos textos do parecer.

### D7 — Gravação e leitura no documento articulado
`DadosLexEdit.anexos?: Anexo[]` e `MetadadoLexEdit.anexos?: { TYPE_NAME; anexo: Array<{ TYPE_NAME; idArquivo; nomeArquivo; nomeDocumento; tipo; mimeType }> }`. Montador puro `montaAnexos` (omitido sem anexos; grava só os cinco atributos, ignorando campos extras do objeto) composto em `montaMetadadoLexEdit`. Leitor puro `lerAnexos` composto em `lerMetadadoLexEdit`: aceita lista ou objeto único (o Jsonix entrega lista de um elemento como objeto), descarta entrada sem `idArquivo`/`nomeArquivo` textuais não vazios ou com `mimeType` fora de PDF/DOCX, e aplica os padrões de `nomeDocumento` e `tipo`. O grupo não gera pendência. A normalização do tipo contra a lista do host fica no componente (D3b), porque o leitor não conhece a configuração.

**Resultado do spike (tarefa 1.4, conversor 2.2.0, `jsonix-lexml-win.exe`):** `toxml` e `tojson` preservam `lexedit:Anexos`; o XML valida com `schemas/lexedit.xsd`. O `tojson` devolve `anexos: { TYPE_NAME, anexo: [...] }` com os cinco atributos como texto, na mesma ordem e igual ao JSON de entrada, inclusive com acentos, `&`, `<` e aspas no `nomeDocumento`; um único anexo também volta como lista. O leitor continua tolerante a objeto único, por segurança.

### D8 — Raiz: coleta, aplicação e contador
`getDocumentoArticulado` repassa `anexos: this._lexmlAnexos.anexos` em `DadosLexEdit`, inclusive no modo anexo de parecer. `abrirDocumentoArticulado` define `this._lexmlAnexos.anexos = dados.anexos ?? []` **depois** de `inicializarEdicao`, que já a esvazia por `setProposicao`/`resetaProposicao` (invariante de ordem do item 13). O rótulo da aba usa um `@state` com o total, atualizado pelo `onchange` do componente e ao abrir. A aba e o painel entram antes de "Avisos", com `panel="anexos"`, e `focusOnTab` passa a conhecê-la.

### D9 — Eventos
Toda alteração (importar, excluir, reordenar, mudar tipo ou nome) emite `onchange` (bubbles, composed) com `detail.origemEvento = 'anexo'`, o mesmo contrato do anexo antigo, para o host saber que há alteração a salvar.

### D10 — Remoção do anexo antigo
Apagar `uploadAnexoDialog.ts`; o botão e a lista `anexos`/`atualizaAnexo`/`labelAnexo` de `editor.component.ts` e `editor-texto-rico.component.ts`; `getAnexos`/`atualizaAnexos` de `lexml-eta-proposicao.component.ts`; o valor padrão de `tamanhoMaximoAnexo`; e o CSS `.panel-anexo`. O `editor-texto-rico` também move o `.panel-anexo` para a barra de ferramentas do Quill (linhas 468-473): remover junto. Sem migração, pois nenhum host usa o componente.

### D11 — Demo e testes
O `demoview.ts` implementa os callbacks com um `Map<idArquivo, Blob>` em memória, para a aba funcionar na demo e no E2E. O E2E usa a demo com `cy.selectFile` no `input type=file` do diálogo e, para salvar, o padrão de captura do blob já usado em `abertura-outros-metadados.cy.ts`. Testes de integração com o conversor real e o XSD seguem `documentoArticulado.integration.ts`.

## Risks / Trade-offs

- **Excluir notifica o host na hora, antes de salvar o documento** → se o usuário exclui e não salva, o documento salvo ainda referencia o anexo; se o host remover o conteúdo ao ser notificado, a referência fica sem arquivo. Quem decide se e quando o conteúdo é removido é o host (pode, por exemplo, adiar a remoção até o salvamento). Mesmo contrato do parecer. Documentar na API que o callback é um aviso de exclusão, não uma ordem de apagar.
- **Tipo fora da lista vira `outro`** → perda do código original ao mudar a lista do host (D3b). Mitigação: documentar que a lista de tipos deve ser estável.
- **`sl-select` emite `sl-change` assíncrono ao mudar o valor por código** (invariante v) → o seletor de tipo de cada linha precisa ignorar o eco, senão uma lista reaplicada sobrescreve a escolha do usuário. Mitigação: guardar o valor exibido, como em `OpcoesImpressaoComponent`.
- **Host sem callbacks** → a aba lista os anexos do arquivo, mas importar, excluir, visualizar e baixar avisam erro. Mitigação: mensagens claras e documentação dos callbacks obrigatórios.
- **Conversor `jsonix-lexml`** → o XSD já declara `Anexos`, mas não foi verificado que a versão do conversor em uso (2.2.0) o preserva na ida e volta. Mitigação: spike logo no início (tarefa 1); se o conversor descartar o grupo, a tarefa externa fica registrada, como na change `outros-metadados-lexedit`.
- **Arquivos grandes sem limite** → o editor só repassa o `File` ao host e não o retém; o custo fica no upload do host. O limite é opt-in.
- **Nome "Anexo" e `anexoParecer`** são conceitos distintos (o segundo é um modo do editor) → nomes de código e de documentação os mantêm separados.
