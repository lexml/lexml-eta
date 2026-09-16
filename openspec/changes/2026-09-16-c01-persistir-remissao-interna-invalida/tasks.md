## 1. Infraestrutura de metadados do LexEdit (`MetadadoProprietario`)

- [ ] 1.1 Definir os tipos TypeScript do campo `metadadoProprietario`/`lexedit` no contrato de `documento-articulado.json` (`documentoArticulado.ts`) e verificar que `npm run build` compila sem erros.
- [ ] 1.2 Implementar a construção condicional de `metadadoProprietario` em `montaCabecalho`/`montaProjetoNorma` (`buildJsonixFromProjetoNorma.ts`) — emitido só quando houver ao menos um grupo `lexedit` a serializar, com `fonte` fixo em `http://www.lexml.gov.br/lexedit/1.0` — e verificar com teste unitário que um documento sem remissão inválida não inclui o campo, e um documento com inclui.
- [ ] 1.3 Implementar a leitura de `metadadoProprietario`/`lexedit`, tolerante a grupos ainda não implementados, e verificar com teste unitário que um documento com um grupo suportado e um grupo desconhecido convivendo não lança erro e reconstrói o grupo suportado normalmente.

## 2. Salvar remissões internas inválidas

- [ ] 2.1 Adicionar o campo opcional de cache de identificador estável em `RemissaoInternaValue` (`remissao.ts`) e verificar que `npm run build` compila sem erros.
- [ ] 2.2 Implementar o gerador de identificador no formato `_ri` + `Date.now()` e verificar com teste unitário o formato do identificador gerado.
- [ ] 2.3 Alterar `injetarLinksRemissaoNoTexto` (`buildJsonixFromProjetoNorma.ts`) para usar `entry.targetLexmlId` em vez do sentinela `@invalido`, reaproveitando o identificador em cache ou gerando um novo na primeira serialização; propagar o identificador para o nó `Remissao` via novo parâmetro opcional em `buildRemissao`/`buildInlineElement`. Atualizar os testes existentes que hoje fixam `@invalido` como esperado — os dois casos em `buildJsonixFromProjetoNorma.content.test.ts` ("deve injetar sentinel @invalido..." e o de `corrigirLexmlRefsObsoletosNoTexto`) e as três asserções em `reducer-save-remissao-pos-renumeracao.test.ts` (`describe('Bug: assimetria no sentinela @invalido...')`) — para o novo comportamento, e verificar que a suíte de testes do documento articulado passa.
- [ ] 2.4 Popular `metadadoProprietario.lexedit.remissoesInternasInvalidas.refIdsRemissoesInternas` com os identificadores de todas as remissões inválidas do documento ao salvar, e verificar com teste unitário que um documento com múltiplas remissões inválidas produz a lista completa e correta.
- [ ] 2.5 Popular `metadadoProprietario.lexedit.pendencias` com o item "Corrigir remissões internas inválidas." quando houver ao menos uma remissão inválida, e verificar com teste unitário a presença e a ausência do item nos dois cenários (com e sem remissão inválida).

## 3. Abrir remissões internas inválidas

- [ ] 3.1 Alterar `montaTag` (`buildProjetoNormaFromJsonix.ts`) para ler o `id` de um nó `Remissao` e emitir o atributo `data-ri-id` no `<a>` gerado, e verificar com teste unitário que o HTML produzido contém o atributo com o identificador correto.
- [ ] 3.2 Alterar `loadArticulacao.ts#detectarRemissoesInvalidasAoCarregar` para receber a lista de identificadores lida de `metadadoProprietario.lexedit.remissoesInternasInvalidas` (repassada via `abreArticulacao.ts`) e tratá-la como autoritativa — um link cujo `data-ri-id` conste na lista é reconstruído como inválido mesmo que seu `data-lexml-ref` volte a resolver para um dispositivo existente — e verificar com teste em `reducer-bootstrap-remissoes.test.ts` cobrindo o caso de identificador de destino reaproveitado por outro dispositivo.
- [ ] 3.3 Propagar o identificador lido de volta para o campo de cache adicionado em 2.1, e verificar com teste que abrir um documento e salvá-lo novamente sem editar a remissão inválida produz o mesmo identificador `_ri` do arquivo original.
- [ ] 3.4 Verificar com teste que documentos sem `metadadoProprietario` continuam tendo suas remissões inválidas detectadas somente pela heurística já existente (resolução de destino falha), sem regressão de comportamento.

## 4. Suíte de integração com o XSD real

- [ ] 4.1 Adicionar um cenário em `documentoArticulado.integration.ts` para documento com remissão interna inválida, verificando `toxml` + validação XSD (`scripts/ValidarDocumentoLexml.java` contra `test/schemas/lexml/lexml-simples.xsd`) e a presença textual dos fragmentos esperados (`MetadadoProprietario fonte="..."`, `Remissao xlink:href="..." id="_ri..."`, `RemissoesInternasInvalidas refIdsRemissoesInternas="..."`) na string XML retornada — sem exigir o round-trip completo via `tojson` para esse campo (ver design.md, Decisão 5). Verificar rodando a suíte com `JSONIX_LEXML_CLI` configurado.

## 5. Regressão e fechamento

- [ ] 5.1 Rodar a suíte completa de remissão interna (`npm test` e specs Cypress relevantes de remissão) e confirmar que nenhum fluxo existente de invalidação em tempo de edição (`removeElemento.ts`, `atualizaTextoElemento.ts`, undo/redo) regrediu.
- [ ] 5.2 Atualizar o item de remissão interna em `CLAUDE.md` com o resumo desta entrega, seguindo a convenção já estabelecida de registrar achados críticos nessa mesma entrada.
