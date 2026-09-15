## 1. Validação estrutural e leitura

- [x] 1.1 Reaproveitar `validarDocumentoArticulado` e implementar `lerDocumentoArticulado`, incluindo verificação de JSON, raiz, URN e IDs repetidos — `documentoArticulado.ts` (commit `05c4392c`) — verificado por `test/model/documento/documentoArticulado.test.ts`
- [x] 1.2 Exercitar `buildProjetoNormaFromJsonix` dentro de `lerDocumentoArticulado` antes de liberar a substituição do documento em edição

## 2. Preservação de identificação e conteúdo

- [x] 2.1 Preservar a URN recebida (inclusive provisória) ao interpretar o documento aberto — `getMetadado` em `buildProjetoNormaFromJsonix.ts`
- [x] 2.2 Recuperar epígrafe, ementa e todos os parágrafos do preâmbulo (`getParteInicial`) — corrige leitura que antes só recuperava o primeiro item de conteúdo/parágrafo

## 3. Preservação literal e caminho legado

- [x] 3.1 Implementar `preservarTexto` / `escaparTextoJsonix`, propagado por toda a cadeia de `buildProjetoNormaFromJsonix`, sem afetar o caminho legado de inicialização (que mantém `substituiAspasRetasPorCurvas`)

## 4. APIs de abertura

- [x] 4.1 Implementar `abrirDocumentoArticulado()` em `lexml-eta.component.ts`, aceitando o objeto Jsonix ou seu texto JSON
- [x] 4.2 Adicionar o parâmetro `preservarTextoDocumento` em `inicializarEdicao`/`loadProjetoNorma` (`lexml-eta.component.ts`, `lexml-eta-proposicao.component.ts`) para ativar a preservação literal apenas neste caminho

## 5. Seletores de arquivo para abrir

- [x] 5.1 Implementar `abrirArquivoDocumentoArticulado` com fallback (`showOpenFilePicker` nativo / input de arquivo oculto) em `arquivoDocumentoArticulado.ts`
- [x] 5.2 Tratar cancelamento (retorno `undefined`) e propagação de erros de leitura/estrutura — verificado por `test/util/arquivoDocumentoArticulado.test.ts`

## 6. Demonstração

- [x] 6.1 Adaptar os comandos Abrir da demonstração (`abrir()`, `selecionaArquivo()`) para usar `abrirArquivoDocumentoArticulado`/`lerArquivoDocumentoArticulado`, com tratamento de erro via `window.alert` (commit `2833facd`)

## 7. Verificação e validação

- [x] 7.1 Cobrir casos de leitura (entrada inválida, raiz incorreta, IDs repetidos, cancelamento) com testes automatizados — `test/util/arquivoDocumentoArticulado.test.ts`, `test/componente/lexml-eta/documentoArticulado.component.test.ts` (commit `05c4392c`). Reexecutar localmente com `npm run test:documento-articulado` para confirmar — não reexecutado nesta sessão (Chromium do Playwright não instalado neste ambiente).
- [x] 7.2 Validar o ciclo completo Jsonix → XML → Jsonix (mesma suíte de integração de c01), reabrindo e comparando o resultado — `test/integracao/documentoArticulado.integration.ts` (commit `8a1c3945`). Reexecutar localmente com `npm run test:documento-articulado:xml` — não reexecutado nesta sessão.

## 8. Encerramento da documentação solta

- [x] 8.1 Excluir `docs/extensao-formato-lexml/analise-plano-00-01.md` e `implementacao-00-01.md` (raiz) — conteúdo absorvido por `proposal.md`/`design.md` desta change e de `2026-09-15-c01-salvar-documento-articulado`
