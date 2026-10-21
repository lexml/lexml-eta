## 1. Esquema e spike com o conversor

- [x] 1.1 Adicionar `OutrosMetadados`/`OutroMetadado` em `schemas/lexedit.xsd` (`chave` obrigatório, conteúdo `xsd:string`, `xsd:unique` na `chave`) e referenciar o grupo no `xsd:all` de `Metadado`
- [x] 1.2 Validar o XSD novo e um XML de exemplo (com e sem chave repetida) pelo script `scripts/validar-exemplos-lexedit.mjs`
- [x] 1.3 **Externa**: copiar o `lexedit.xsd` para o projeto `jsonix-lexml`, gerar o build e a nova versão; rodar `toxml` e `tojson` num documento com o grupo e registrar o formato devolvido (propriedade do valor, objeto único ou lista, aceitação do `xsd:unique`). Pausar e pedir ao usuário a versão/caminho do executável (`JSONIX_LEXML_CLI`)
- [x] 1.4 Se o gerador rejeitar o `xsd:unique`, revisar o requisito de unicidade (design D2/D5) antes de seguir

## 2. Modelo, gravação e leitura

- [ ] 2.1 Adicionar `outrosMetadados` a `DadosLexEdit` e a `MetadadoLexEdit` em `documentoArticulado.ts`
- [ ] 2.2 Criar o montador `montaOutrosMetadados` em `buildJsonixFromProjetoNorma.ts` e compô-lo em `montaMetadadoLexEdit` (omitido quando vazio, sem pendência)
- [ ] 2.3 Criar o leitor `lerOutrosMetadados` em `buildProjetoNormaFromJsonix.ts` e compô-lo em `lerMetadadoLexEdit` (tolerante; primeira chave vence)
- [ ] 2.4 Testes unitários do montador e do leitor: vazio, um e vários pares, caracteres especiais, entrada inválida, chave repetida, objeto único no lugar de lista, convivência com outros grupos

## 3. Componente

- [ ] 3.1 Adicionar a `@property` pública `outrosMetadados` em `lexml-eta.component.ts`, repassada em `getDocumentoArticulado` (inclusive no anexo de parecer)
- [ ] 3.2 Aplicar o valor lido em `abrirDocumentoArticulado`, depois de `inicializarEdicao`, esvaziando a propriedade quando o arquivo não tem o grupo
- [ ] 3.3 Testes de componente: salvar com a propriedade definida, anexo de parecer, abrir com e sem o grupo, abrir um arquivo depois do outro
- [ ] 3.4 Documentar a propriedade em `docs/api-componente-lexml-eta.md`

## 4. Integração com o conversor real

- [ ] 4.1 Adicionar ao `documentoArticulado.integration.ts` o cenário de ida e volta com três pares (inclusive `<`, `&`, aspas e acentos), validando o XML com `schemas/lexedit.xsd` e comparando o segundo salvamento com o primeiro
- [ ] 4.2 Executar `npm run test:documento-articulado:xml` com o `JSONIX_LEXML_CLI` da versão nova

## 5. Teste E2E (Cypress)

- [ ] 5.1 Avaliar a viabilidade à luz de `docs/guia-cypress.md` e do padrão de `cypress/e2e/documento-articulado/abertura-situacao-e-destino.cy.ts`: gerar o fixture `demo/doc/teste_outros_metadados.json` por `criarDocumentoArticulado`, abrir pela UI e conferir a propriedade `outrosMetadados` do componente. Se a leitura da propriedade pelo Cypress não for viável, registrar a decisão e manter a cobertura no teste de componente (3.3), que exercita o mesmo risco
- [ ] 5.2 Escrever e executar o spec `cypress/e2e/documento-articulado/abertura-outros-metadados.cy.ts`, incluindo salvar e reabrir pelo `#fileUpload` se o padrão de captura do blob já existente (`titulo-dispositivo.cy.ts`) se aplicar

## 6. Especificação e documentação

- [ ] 6.1 Criar a especificação do grupo em `docs/extensao-formato-lexml/` (necessidade informacional, representação e exemplo) e registrá-la em `00-especificacao-esquema-lexedit.md`
- [ ] 6.2 Atualizar `99-exemplo-completo.md` e `documento-articulado-exemplo.json`/`.xml` com o grupo, e o `plano-xsd-lexedit.md`
- [ ] 6.3 Rodar a suíte completa (`npm test`), o lint e o `openspec validate`
