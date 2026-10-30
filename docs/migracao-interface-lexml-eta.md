# Nota de migração — nova interface do `<lexml-eta>` (#1016)

Destinatário: quem mantém o `lexeditweb-editor` (LexEdit e Infoleg Editor). Change: `2026-10-27-c01-rever-interface-lexml-eta`. Referência completa da API em `docs/api-componente-lexml-eta.md`.

## 1. Métodos de ciclo de vida (**BREAKING**)

`inicializarEdicao` deixou de ser público. A edição de um documento só começa, troca ou termina por:

| Antes | Agora |
|---|---|
| `inicializarEdicao({ urn })`, `({ sigla, numero, ano })`, `({ proposicao })`, `({ projetoNorma })` | `novaProposicao(dados)` para criar; `abrirDocumentoArticulado(entrada)` para abrir |
| (sem equivalente) | `fecharDocumento()`: volta ao estado neutro |

- `novaProposicao` exige `urn`, `epigrafe` e `preambulo` (este pode ser vazio). Opcionais: `urnDocumentoReferenciado`, `colegiadoApreciador`, `autoria`, `opcoesImpressao`, `outrosMetadados`, `documentoModelo` e `anexoParecer`. O `detail` do evento do componente de nova proposição (`<lexml-nova-proposicao>`, #1050) segue esse contrato (veja a seção 7).
- `documentoModelo` empresta **só** a articulação e a ementa; o resto do modelo é descartado.
- Entrada inválida emite `fatalError`, lança o erro e deixa o documento em edição como estava.
- `LexmlEtaParametrosEdicao` saiu da API pública.

## 2. Configuração da sessão (**BREAKING**)

Passam a ser campos de `lexmlEtaConfig`, definidos **antes** da primeira inicialização, e sobrevivem à troca de documento:

- `usuario`
- `configuracaoPaginacao`
- `autoriaPadrao` e `opcoesImpressaoPadrao`: valem **somente** em `novaProposicao` (e só quando o dado correspondente não é informado). Ao abrir, valem os valores do arquivo.

Um binding antigo (propriedade solta no componente) falha em silêncio: o valor é ignorado, sem erro de console.

## 3. Modo de anexo de parecer (**BREAKING**)

`lexmlEtaConfig.anexoParecer` foi removido. O modo é do **documento**: informe `anexoParecer` em `novaProposicao`; ao abrir, vem de `lexedit:Metadado@anexoParecer` (arquivo sem o atributo abre no modo normal). O mesmo vale para `urnDocumentoReferenciado`, gravada e lida em `lexedit:Metadado`.

## 4. Reset entre documentos

Todo método de inicialização descarta o documento anterior por inteiro (revisões, remissões, anexos, outros metadados, justificação, notas, store Redux), preservando a configuração da sessão. O componente **não** consulta alterações pendentes: **confirmar a perda de dados antes de chamar é do host**.

## 5. Tipos aceitos

- **Criação**: só proposição suportada (tipo com sigla do vocabulário da casa, de autoridade `senado.federal`, `camara.deputados` ou `congresso.nacional`; inativos como PLS/PLC são aceitos, e o alerta fica com o host). **Medida provisória (autoridade `federal`), norma e autoridade da outra casa são rejeitadas** (**BREAKING** para quem criava MPV).
- **Abertura**: documento da casa oposta continua recusado (`fatalError`). MPV ou norma abrem como tipo "não suportado": sem formulário de autoria (gravada vazia) nem colegiado, erro na aba de avisos e `lexedit:Pendencias` com "Este tipo de documento não é completamente suportado pelo editor."; editar e salvar continuam permitidos.
- A casa responsável do documento deriva da autoridade da URN; não é parâmetro. `casaLegislativaEditor` continua sendo informado pelo host.

## 6. Estado neutro

Sem documento inicializado, e depois de `fecharDocumento()`, as abas ficam desabilitadas e a primeira exibe "aguardando inicialização". O host não precisa mais esconder o componente nesse intervalo.

## 7. Destino e componente de nova proposição (#1050) — **BREAKING**

- O formulário de destino (`<lexml-eta-destino>`) **foi removido** do `lexml-eta`, junto da propriedade `comissoes`, dos métodos `getComissoes`/`atualizaListaComissoes`, de `LexmlEtaConfig.urlComissoes` e da exportação `DestinoComponent`. A aba passou a se chamar "Data, Autoria e Impressão".
- O destino agora é coletado pelo `<lexml-nova-proposicao>` (seção 11 de `api-componente-lexml-eta.md`) e entra no editor por `novaProposicao({ colegiadoApreciador })`. O `lexml-eta` o mantém em memória, mostra no `getProposicao()` e grava em `lexedit:ColegiadoApreciador` **se existir**, inclusive no anexo de parecer (que não interfere no colegiado).
- `Proposicao.colegiadoApreciador` é **opcional** (antes nascia como Plenário). Um documento criado sem colegiado fica sem ele e não grava o elemento; um arquivo aberto sem o elemento recebe o padrão (Plenário). O local do fecho continua derivado do colegiado ("Sala da Comissão" para Comissão; "Sala das Sessões" para Plenário ou sem colegiado) e, em documento aberto, vale o local do arquivo.
- O host passa a fornecer ao componente de nova proposição `casaLegislativaEditor` e as três URLs obrigatórias (`urlVerificacaoProposicao`, `urlTextoEstruturado`, `urlComissoes`, esta com o placeholder `{casa}`).

## Checklist para o `lexeditweb-editor`

- [ ] Trocar toda chamada a `inicializarEdicao` por `novaProposicao`/`abrirDocumentoArticulado`.
- [ ] Mover usuário, paginação e padrões para `lexmlEtaConfig` e atribuí-la antes de inicializar.
- [ ] Parar de enviar `anexoParecer` pela configuração; passá-lo em `novaProposicao`.
- [ ] Confirmar com o usuário antes de trocar ou fechar um documento com alterações.
- [ ] Parar de criar MPV pela criação de proposição; tratar o erro de URN não suportada.
- [ ] Tratar o `fatalError` de documento da outra casa ao abrir.
- [ ] Usar `<lexml-nova-proposicao>` para criar proposições e repassar o resultado a `novaProposicao`; fornecer `casaLegislativaEditor` e as três URLs.
- [ ] Remover o uso de `lexml-eta-destino`, de `comissoes` e de `urlComissoes`; tratar `Proposicao.colegiadoApreciador` ausente.
