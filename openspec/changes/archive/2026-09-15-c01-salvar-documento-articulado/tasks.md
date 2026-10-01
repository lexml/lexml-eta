## 1. Contrato e identificação

- [x] 1.1 Definir o contrato do arquivo (raiz Jsonix `LexML`, cinco grupos) e sua validação estrutural em `documentoArticulado.ts` — verificado por `test/model/documento/documentoArticulado.test.ts` (commit `05c4392c`)
- [x] 1.2 Implementar sentinelas de identificação provisória (`ANO_PROVISORIO`, `NUMERO_PROVISORIO`, `buildUrnProposicao`) em `urnUtil.ts` — verificado pelos casos de ano/número desconhecidos em `documentoArticulado.test.ts`
- [x] 1.3 Preservar a URN recebida integralmente (autoridade, data, evento) em vez de reconstruí-la a partir de dados parciais — verificado pelos casos de URN com evento e com data completa em `documentoArticulado.test.ts`

## 2. Serialização da parte inicial e da articulação

- [x] 2.1 Serializar epígrafe, ementa e preâmbulo completos, incluindo múltiplos parágrafos do preâmbulo (`montaParagrafosPreambulo` em `buildJsonixFromProjetoNorma.ts`) — verificado por casos de múltiplos parágrafos em `documentoArticulado.test.ts`
- [x] 2.2 Preservar espaços entre marcações inline (`preservarEspacosJsonix`) e decodificar texto para caracteres literais (`decodificarTextoJsonix`) — verificado por casos de espaçamento e caracteres especiais em `documentoArticulado.test.ts`
- [x] 2.3 Serializar a articulação reaproveitando os conversores e o modelo de dispositivos já existentes no ETA, incluindo alterações de normas

## 3. APIs de obtenção e exportação

- [x] 3.1 Implementar `getDocumentoArticulado()` com sincronização da edição pendente (`flushEdicaoPendente`) e cópia independente do documento — `lexml-eta-proposicao.component.ts` / `lexml-eta.component.ts`
- [x] 3.2 Exportar `getDocumentoArticulado`, `salvarArquivoDocumentoArticulado`, `serializarDocumentoArticulado` e `NOME_ARQUIVO_DOCUMENTO_ARTICULADO` em `src/index.ts`

## 4. Seletores de arquivo para salvar

- [x] 4.1 Implementar `salvarArquivoDocumentoArticulado` com fallback (`showSaveFilePicker` nativo / download via link) em `arquivoDocumentoArticulado.ts`
- [x] 4.2 Tratar cancelamento (retorno `false`) e propagação de erros de escrita — verificado por `test/util/arquivoDocumentoArticulado.test.ts`

## 5. Demonstração

- [x] 5.1 Adaptar o botão Salvar da demonstração (`demoview.ts`) para usar `salvarArquivoDocumentoArticulado` e `getDocumentoArticulado`, com tratamento de erro via `window.alert` (commit `2833facd`)

## 6. Verificação e validação

- [x] 6.1 Cobrir identificação (definitiva, provisória, parcial, com evento), parte inicial e articulação com testes automatizados — `test/model/documento/documentoArticulado.test.ts`, `test/util/arquivoDocumentoArticulado.test.ts`, `test/componente/lexml-eta/documentoArticulado.component.test.ts` (commit `05c4392c`). Reexecutar localmente com `npm run test:documento-articulado` para confirmar — não reexecutado nesta sessão (Chromium do Playwright não instalado neste ambiente).
- [x] 6.2 Validar a conversão Jsonix → XML → Jsonix e o XML contra o XSD LexML, incluindo um teste negativo de identificação ausente — `test/integracao/documentoArticulado.integration.ts`, `scripts/ValidarDocumentoLexml.java`, XSDs em `test/schemas/lexml` (commit `8a1c3945`). Reexecutar localmente com `npm run test:documento-articulado:xml` (requer Java 11+ e o executável `jsonix-lexml`) para confirmar — não reexecutado nesta sessão.
- [x] 6.3 Corrigir o exemplo invertido de URN provisória na especificação 01 (`docs/extensao-formato-lexml/01-identificacao-provisoria-e-urn.md`)

## 7. Encerramento da documentação solta

- [x] 7.1 Excluir `docs/extensao-formato-lexml/analise-plano-00-01.md` e `implementacao-00-01.md` (raiz) — conteúdo absorvido por `proposal.md`/`design.md` desta change e da `2026-09-15-c02-abrir-documento-articulado`
