## 1. Composição do nome do arquivo

- [x] 1.1 Em `src/model/lexml/documento/documentoArticulado.ts`, remover `NOME_ARQUIVO_DOCUMENTO_ARTICULADO` e adicionar uma função que recebe um `DocumentoArticulado` e retorna `documento-articulado - <sigla> nº <numero>, de <ano>.json`, usando `getSigla`/`getNumero`/`getAno` de `urnUtil.ts` sobre `documento.value.metadado.identificacao.urn`
- [x] 1.2 Adicionar teste unitário cobrindo: URN com sigla/número/ano definitivos gera o nome esperado; URN com sentinelas (`9999`/`999999`) gera o nome com as sentinelas

## 2. Uso no fluxo de salvar

- [x] 2.1 Em `src/util/arquivoDocumentoArticulado.ts`, usar a nova função no `suggestedName` do `showSaveFilePicker`
- [x] 2.2 Usar a mesma função no `link.download` do caminho alternativo (sem File System Access API)
- [x] 2.3 Atualizar `src/index.ts` trocando o export da constante removida pelo export da nova função

## 3. Ajuste de testes existentes

- [x] 3.1 Corrigir a URN de `test/doc/documentoArticulado.ts` para `urn:lex:br:senado.federal:projeto.lei;pls:9999;999999` (sigla `PLS`), alinhando-a ao formato produzido por `buildFakeUrn`, e verificar que `getSigla` sobre essa URN retorna `'PLS'`
- [x] 3.2 Atualizar as asserções de `test/util/arquivoDocumentoArticulado.test.ts` que hoje esperam `'documento-articulado.json'` para o nome composto (`documento-articulado - PLS nº 999999, de 9999.json`, dado o fixture ajustado em 3.1)

## 4. Especificação e verificação final

- [x] 4.1 Rodar a suíte de testes do projeto (`npm test` ou o comando configurado) e confirmar que todos os testes passam, incluindo os ajustados nas seções 2 e 3
- [x] 4.2 Rodar `openspec validate 2026-09-15-c03-nomear-arquivo-documento-articulado --strict` e confirmar que a change passa na validação

## 5. Sempre usar download simples ao salvar (sem seletor nativo)

- [x] 5.1 Em `src/util/arquivoDocumentoArticulado.ts`, remover o branch de `showSaveFilePicker` de `salvarArquivoDocumentoArticulado`; a função passa a sempre criar e clicar o link `<a download>` com o nome composto, e sua assinatura muda de `Promise<boolean>` para `Promise<void>`
- [x] 5.2 Remover do arquivo os tipos/campos que ficam sem uso após 5.1 (`ArquivoParaSalvar`, o campo `showSaveFilePicker` de `SeletoresArquivo`), mantendo intactos `showOpenFilePicker`, `tiposArquivo` e `foiCancelado` (ainda usados por `abrirArquivoDocumentoArticulado`)
- [x] 5.3 Em `test/util/arquivoDocumentoArticulado.test.ts`: substituir o teste que mocka `showSaveFilePicker` por um teste que intercepta `HTMLAnchorElement.prototype.click` e verifica o `download` (nome composto) e o conteúdo do blob gerado (`fetch` do `href` blob:); remover a asserção de cancelamento ao salvar do teste de cancelamento (mantendo apenas a de abrir); remover o teste de abort de escrita (não se aplica mais) e adicionar um teste de propagação de erro ao salvar um documento inválido (ex.: `articulacao.lXhier` vazio)
- [x] 5.4 Confirmar em `demo/components/demoview.ts` que `salvar()` continua funcionando sem alterações (não usa o valor de retorno de `salvarArquivoDocumentoArticulado`) — confirmado por leitura: `await salvarArquivoDocumentoArticulado(...)` descarta o retorno
- [x] 5.5 Rodar a suíte de testes do projeto novamente e `openspec validate 2026-09-15-c03-nomear-arquivo-documento-articulado --strict`, confirmando que tudo passa
