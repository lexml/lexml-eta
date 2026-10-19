# Design

## Context

O ponto de extensão `lexedit:Metadado` já segue um padrão por grupo (CLAUDE.md, item 13): campo em `DadosLexEdit`, montador puro em `buildJsonixFromProjetoNorma.ts` (composto em `montaMetadadoLexEdit`), leitor puro e tolerante em `buildProjetoNormaFromJsonix.ts` (composto em `lerMetadadoLexEdit`), coleta em `lexml-eta.component.ts#getDocumentoArticulado` e aplicação ao abrir **depois** de `inicializarEdicao`. Ver proposal.md para a motivação.

Estado observado:
- `substitutivo` consta só no XSD, na especificação 13 e nos exemplos; o código de salvar/abrir nunca o gravou. `Proposicao.substitutivo` e o parâmetro do componente servem à validação de `sigla`/`numero`/`ano` e ficam.
- O destino (`ColegiadoApreciador`: `siglaCasaLegislativa`, `tipoColegiado`, `siglaComissao`) vive em `DestinoComponent`, preenchido por `setProposicao`. Hoje não é salvo; o local do fecho é derivado dele, com a exceção do invariante (x): `localDoArquivo` vale enquanto o destino for igual a `destinoAoAbrir`.
- `Dispositivo.existeNaNormaAlterada` (`true` existente, `false` novo, `undefined` sem situação) só tem sentido em dispositivos de alteração (`isDispositivoAlteracao`). O carregamento de arquivo não restaura o valor; o fluxo de revisões só o propaga (`reconstroiRevisoes.ts`).
- Remissões inválidas já usam o caminho "lista de ids lida do arquivo, passada até o carregamento da articulação" (`lerIdsRemissoesInvalidas` → `openArticulacaoAction` → `loadArticulacao.ts`).

## Goals / Non-Goals

**Goals:**
- Salvar e abrir `SituacaoNaNormaVigente` e `ColegiadoApreciador` com ida e volta idêntica pelo conversor `jsonix-lexml` 2.0.0.
- Retirar `substitutivo` do formato e prever `urnDocumentoReferenciado` só no esquema.

**Non-Goals:**
- Preencher ou ler `urnDocumentoReferenciado` (outra issue).
- Alterar a validação de `sigla`/`numero`/`ano` ou remover `Proposicao.substitutivo`.
- Salvar `ColegiadoAutor` (autoria de comissão) — grupo distinto, já fora de escopo.
- Mudar a UI de destino ou de "Existente/Novo".

## Decisions

**D1 — `substitutivo` só sai do formato.** Remoção no XSD, na especificação, nos exemplos, nas fixtures e nos planos. O leitor nunca o lia, então nada muda ao abrir. Alternativa descartada: remover também `Proposicao.substitutivo`, que quebraria a validação do componente e a API pública.

**D2 — `urnDocumentoReferenciado` apenas declarado.** Entra como `xsd:string` opcional em `Metadado`; `MetadadoLexEdit`, `DadosLexEdit`, montador e leitor não ganham o campo. A outra issue acrescenta o campo ao padrão sem retrabalho de esquema.

**D3 — `SituacaoNaNormaVigente`: montador por varredura da própria articulação.** `buildJsonixFromProjetoNorma` recebe o `ProjetoNorma` e percorre `projetoNorma.articulacao` (`coletarSituacaoNaNormaVigente`, em `conversor/situacaoNaNormaVigente.ts`), sem passar a situação por `DadosLexEdit`: ela não é dado de formulário, e sim estado do próprio modelo, como as remissões. Regras: só dispositivo com `isDispositivoAlteracao`, com id, que não seja Caput, e com `existeNaNormaAlterada !== undefined`; `true` → existentes, `false` → novos; elemento omitido quando as duas listas estão vazias; atributo de lista vazia omitido. Listas como texto separado por espaço (o conversor rejeita array, como em `refIdsRemissoesInternas`), na ordem da articulação, para a saída ser determinística e a ida e volta idêntica. Alternativa descartada: coletar no componente de proposição e passar em `DadosLexEdit` (exigiria que todo chamador de `criarDocumentoArticulado` lembrasse de coletar).

**D4 — `SituacaoNaNormaVigente`: leitura reaplicada antes de despachar a abertura.** `lerSituacaoNaNormaVigente` devolve duas listas (tolerante: ignora tipos inesperados, divide por espaço, remove duplicados). `lexml-eta-proposicao.component.ts#loadProjetoNorma` chama `aplicarSituacaoNaNormaVigente(documento.articulacao, ...)` entre a leitura do arquivo e o `openArticulacaoAction`, antes de `getElementos` criar os elementos, que já leem a situação do dispositivo. Uma única travessia indexa os ids por mapa; id sem dispositivo, dispositivo fora de bloco de alteração e Caput são ignorados. Alternativas descartadas: propagar as listas pela action até `loadArticulacao.ts` (mais código, sem ganho, pois a articulação é um objeto mutável ainda não publicado no estado) e aplicar via action Redux depois de abrir (geraria histórico de desfazer e eventos de UI indevidos). `buscaDispositivoById` não é usado: trata `art{N}_cpt` como o artigo (CLAUDE.md, item 11) e faria uma busca por id.

**D5 — `ColegiadoApreciador`: grupo de formulário no padrão.** Campo `colegiadoApreciador` em `DadosLexEdit`; `montaColegiadoApreciador` grava `siglaCasaLegislativa` e `tipoColegiado` sempre e `siglaComissao` só se não vazia; `lerColegiadoApreciador` assume o padrão da classe para atributo ausente ou fora da enumeração (como `lerOpcoesImpressao`). Anexo de parecer não grava o grupo, igual a fecho e autoria.

**D6 — Aplicação do destino ao abrir.** Depois de `inicializarEdicao`, `tipoColegiado` e `siglaComissao` do arquivo são aplicados ao `DestinoComponent` (via seu setter `colegiadoApreciador`, que já sincroniza o rádio e o autocomplete). A `siglaCasaLegislativa` do arquivo **não** troca a casa do host: ela governa a lista de comissões carregada (`atualizaListaComissoes`), e o host é a fonte de verdade da casa. O destino é gravado como está no formulário; se a casa do arquivo difere da do host, valem os dados do host ao salvar de novo.

**D7 — Invariante (x) revisado.** O destino passa a ser salvo, mas `destinoAoAbrir` continua sendo a cópia feita **depois** de aplicar o destino do arquivo, e `localDoArquivo` segue valendo só enquanto o destino for igual a ela. A comparação atual (`tipoColegiado` e `siglaComissao`) permanece. O CLAUDE.md deve registrar a mudança ao final.

**D8 — Esquema.** `SituacaoNaNormaVigente` e `ColegiadoApreciador` entram no `xsd:all` de `Metadado` (opcionais). Atributos de `SituacaoNaNormaVigente` como `xsd:string`, sem `xsd:IDREFS` (mesmo motivo das demais referências, ver comentários do XSD). `ColegiadoApreciador`: `siglaCasaLegislativa` reutiliza `SiglaCasaLegislativa`; `tipoColegiado` ganha o tipo simples `TipoColegiado` (`Plenário`, `Comissão`); `siglaComissao` opcional. A especificação da situação entra em `13-outros-metadados-do-lexedit.md`; a do colegiado, em arquivo próprio, `14-colegiado-apreciador.md`.

**D9 — Remoção de "Plenário via Comissão" do editor.** O tipo sai do union `ColegiadoApreciador.tipoColegiado` (`proposicao.ts`), do rádio em `destino.component.ts` (e de qualquer ramo que o trate, como `tipoColegiadoPlenario`), de `docs/api-componente-lexml-eta.md` e do teste que o usa (`documentoArticulado.component.test.ts`). Um valor desconhecido vindo do host ou de arquivo cai no padrão `Plenário`, a mesma regra de atributo inválido do leitor (D5); não há migração para `Comissão`, porque o valor antigo não indica comissão. Alternativa descartada: manter o tipo no editor e omiti-lo só do formato, que deixaria um destino não persistível na UI.

## Risks / Trade-offs

- [Host que ainda envia "Plenário via Comissão"] → o valor passa a ser tratado como `Plenário` e a mudança é **BREAKING** para esse host; registrar no `docs/api-componente-lexml-eta.md` e avisar a coordenação do `lexeditweb-editor`.

- [Casa do arquivo difere da do host] → D6 mantém a casa do host; fica documentado e coberto por teste unitário do leitor.
- [`existeNaNormaAlterada` aplicado cedo demais, antes da criação das linhas] → aplicar no modelo, em `loadArticulacao.ts`, antes da geração de elementos; E2E de abertura confirma o rótulo "Existente/Novo" exibido.
- [Dispositivo renumerado muda de id entre salvar e abrir] → o id gravado é o do momento de salvar e a abertura recria a árvore a partir do mesmo arquivo; ids sem correspondência são ignorados.
- [O CLI real sai com código 0 mesmo falhando (item 13 do CLAUDE.md)] → a integração confere a existência do arquivo de saída e valida com `lexedit.xsd`.
- [Dado novo em arquivo aberto por versão antiga do editor] → leitores antigos ignoram grupos desconhecidos (requisito de isolamento entre grupos).
