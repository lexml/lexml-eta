# Design

## Context

Hoje o componente `lexml-nova-proposicao` (`nova-proposicao.component.ts`) identifica qualquer documento externo por `{sigla, numero, ano}` (`onVerificarProposicao`, `onObterTexto`). Na `CD` isso não é único para substitutivos e subemendas substitutivas. O `detail` de conclusão (`texto`) não muda; muda só a escolha do documento e o contrato do host. Ver proposal.md - Why.

## Goals / Non-Goals

**Goals:**
- Tela 2b com lista de documentos de uma matéria, só na `CD` em substitutivo/subemenda substitutiva.
- Contrato novo e independente do `onObterTexto`, por `id` do documento.

**Non-Goals:**
- Alterar o `SF`, as demais espécies da `CD` ou a opção "Texto do(a) Projeto de Lei…" (mantida na Tela 2).
- "Mostrar todos", tipo, hierarquia ("trecho de parecer") e `oculto`: fora do contrato.
- Árvore de matérias apensadas: o host devolve a lista já achatada.

## Decisions

1. **Dois serviços novos, `onListarDocumentos`/`urlDocumentosMateria` e `onObterTextoDocumento`/`urlTextoDocumento`**, no padrão URL-ou-callback de `ORIGENS_OBRIGATORIAS`. Alternativa descartada: reaproveitar `onObterTexto` aceitando `id`, que misturaria dois contratos. A obrigatoriedade só na `CD` exige que `validarConfigNovaProposicao` leve em conta `casaLegislativaEditor`.
2. **Objeto `DocumentoMateria`**: `id`, `titulo`, `sigla`, `numero`, `ano?`, `urlInteiroTeor`, `textoEstruturadoDisponivel?`, `nomeAutor`, `papelAutor`, `indSexoAutor`, `dataApresentacao` (AAAA-MM-DD), `siglaComissao?`. O host entrega `papelAutor` flexionado e `nomeAutor` sem tratamento; o componente acrescenta "Dep." fixo (a tela só existe na `CD`), então `indSexoAutor` não altera o texto exibido.
3. **Filtro 100% no cliente**, sobre o texto exibido de cada linha (inclusive a data em DD/MM/AAAA), normalizado sem acentos e caixa. Sem serviço de busca.
4. **"Outra matéria"** reaproveita a lista de siglas da Tela 1 (`getSiglasProposicaoReferenciada`) e a verificação de `onVerificarProposicao`; a lista só carrega depois da verificação.
5. **Estado e navegação**: nova tela (`tela = '2b'`, ou valor equivalente) entre a 2 e a conclusão. A opção `'outra'` da Tela 2 passa a ser renderizada sem inputs quando `casa === 'CD'` e a espécie é substitutivo/subemenda (hoje já existe o getter da linha 359, `casa === 'CD' && especie !== 'proposicao'`). **Continuar** na 2b obtém o texto por `id` e chama `concluir({ texto })`.
6. **Texto indisponível/falha** na 2b: permanece na tela, com o mesmo padrão de alerta (`aviso`) do componente; o documento com `textoEstruturadoDisponivel=false` nem é selecionável.
7. **Demo**: o mock fica fora do componente, no fake server da demo (`demo/server/handlers.mjs`, testado em `handlers.test.mjs`), com as duas rotas (`/demo-api/materias/{sigla}/{numero}/{ano}/documentos` e `/demo-api/documentos/{id}/texto`) e massa cobrindo lista cheia (PL 4/2025), documento sem texto estruturado, lista vazia e matéria inexistente. Serve ao teste manual e ao E2E; `demoview.ts` só informa as URLs.

## Risks / Trade-offs

- [Configuração da `CD` passa a falhar sem as duas origens, **BREAKING**] → avisar o host Infoleg Editor (o `lexeditweb-editor`, do `SF`, não é afetado) e documentar em `docs/api-componente-lexml-eta.md`.
- [Lista grande de documentos] → rolagem com altura fixa e filtro; sem paginação (o host limita).
- [Duplicidade com "Texto do(a) PL…", que leva ao mesmo texto do primeiro item da lista] → aceita; o host controla se devolve o original.
- [Abreviação "Dep." fixa] → coerente com a tela só na `CD`; se surgir autor senador, `indSexoAutor` e um novo campo de tratamento serão necessários.
- [Bug anterior, fora do escopo: `hasRotuloPendente` (`numeracaoUtil.ts`, commit `a24bb736`) lança `TypeError` em documento com agrupador sem tipo próprio, como o "SUBTÍTULO" de `demo/doc/pl_4_2025.json`] → não tratado aqui; o mock da Tela 2b evita esse arquivo, mas a opção "Texto do(a) PL…" do demo (que usa o PL 4/2025) continua falhando até o bug ser corrigido.
