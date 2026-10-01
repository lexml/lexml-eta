## Context

O `MetadadoProprietario` do LexML é um `xsd:any`. Até o `jsonix-lexml` 1.0.0, o CLI descartava esse conteúdo, e por isso as changes `2026-09-16-c01` (remissão inválida), `2026-09-22-c01` (opções de impressão) e `2026-09-22-c02` (fecho) gravaram um formato provisório: `metadadoProprietario[0].lexedit = { local, data, opcoesImpressao, remissoesInternasInvalidas: { refIdsRemissoesInternas: string[] }, pendencias: string[] }`. O item 13 do `CLAUDE.md` já registrava que esse formato seria migrado quando o CLI passasse a transportar o conteúdo.

O `jsonix-lexml` 2.0.0 (commit `191a545` do repositório irmão, 23/09/2026) passou a incluir os mapeamentos gerados de `schemas/lexedit.xsd`. Fatos verificados nesta sessão com o binário `lexeditweb-editor/jsonix-lexml-win.exe`:

1. `docs/extensao-formato-lexml/documento-articulado-exemplo.json` → `toxml` gera o `lexedit:Metadado` completo, e `tojson` devolve o mesmo conteúdo.
2. O arquivo salvo pelo editor (MPV 905/2019, formato provisório) → `toxml` gera `<MetadadoProprietario fonte="..."/>` vazio, sem erro.
3. Os mesmos dados embrulhados em `any: [{ name: { namespaceURI, localPart: 'Metadado', prefix: 'lexedit' }, value: {...} }]` geram o XML correto, com ou sem `TYPE_NAME` nos objetos internos.
4. `refIdsRemissoesInternas` como array → o CLI falha com `Argument [...] must be a string`, mas **sai com código 0** e não grava o arquivo de saída. Como string separada por espaço, funciona.
5. No `toxml`, `pendencias` é aceito tanto como array quanto como `{ pendencia: [...] }`. O `tojson` sempre devolve `{ TYPE_NAME: 'br_gov_lexml_lexedit__1.Pendencias', pendencia: [...] }`.
6. O `tojson` devolve `TYPE_NAME` em todos os objetos e `name` com `key` e `string`.
7. Validar o XML com `schemas/lexml-simples.xsd` **não** detecta erro dentro do `lexedit:Metadado`: o `xsd:any` é `lax`, e o namespace do LexEdit é desconhecido para esse esquema. Validar com `schemas/lexedit.xsd` como entrada (ele importa `lexml-simples.xsd`) valida o documento inteiro e detectou um `tamanhoFonte="abc"` (`cvc-datatype-valid.1.2.1`).

## Goals / Non-Goals

**Goals:**
- Gravar os grupos já implementados (fecho, opções de impressão, remissões internas inválidas, pendências) no formato do exemplo de referência e do CLI 2.0.0.
- Ler o formato novo e, como legado, o provisório.
- Fazer o teste de integração com o CLI real exigir ida e volta completa, com validação XSD que cubra o `lexedit`.

**Non-Goals:**
- Implementar grupos novos (autoria, anexos, comentários etc.).
- Gravar atributos de `lexedit:Metadado` ainda não suportados (`dataUltimaModificacao`, `aplicacao` etc.; issue 11).
- Corrigir o código de saída do CLI (é do repositório `jsonix-lexml`; fica como recomendação).
- Migrar em lote os arquivos antigos: a conversão acontece quando o usuário abre e salva.

## Decisions

### 1. Objeto idêntico ao que o CLI devolve (`TYPE_NAME` e `name` completos)

O `lexedit:Metadado` é gravado com `name` completo (`namespaceURI`, `localPart`, `prefix`, `key`, `string`) e com `TYPE_NAME` em `value` e em todo objeto interno (`br_gov_lexml_lexedit__1.Metadado`, `.OpcoesImpressao`, `.RemissoesInternasInvalidas`, `.Pendencias`). Assim o arquivo fica igual ao exemplo de referência e ao que o `tojson` devolve, e o teste de integração pode comparar com `deep.equal` o `metadadoProprietario` que volta do CLI com o salvo.
Alternativa descartada: gravar o mínimo que o `toxml` aceita (o fato 3 mostra que funciona). É mais enxuto, mas o objeto salvo e o devolvido pelo CLI passariam a diferir, e a comparação teria de ignorar campos.

### 2. Formas de `refIdsRemissoesInternas` e `pendencias`

`refIdsRemissoesInternas` é gravado como `ids.join(' ')`, porque é `xsd:string` em `lexedit.xsd` e o CLI exige texto (fato 4). `pendencias` é gravado como `{ TYPE_NAME, pendencia: [...] }`, a forma que o `tojson` devolve (fato 5). Ao ler, os ids são obtidos com `split(/\s+/)` descartando vazios. O array continua aceito para o legado.

### 3. Tipos: a estrutura do arquivo separada dos dados do editor

`MetadadoLexEdit` passa a descrever o `value` tipado do `lexedit:Metadado`, com `remissoesInternasInvalidas.refIdsRemissoesInternas: string` e `pendencias: { pendencia: string[] }`. `MetadadoProprietarioLexEdit` passa a ter `any: [{ name, value: MetadadoLexEdit }]` no lugar de `lexedit`. `DadosLexEdit`, os dados de formulário, não muda: montadores e leitores continuam trabalhando com os mesmos valores, e só o invólucro muda. O formato provisório fica representado por um tipo próprio de legado, usado somente pelo leitor.

### 4. Leitura: primeiro o formato novo, depois o provisório

Um único ponto de leitura localiza o conteúdo do LexEdit em `metadadoProprietario[]`:
1. o item cujo `any[]` contém um elemento com `name.namespaceURI` igual a `http://www.lexml.gov.br/lexedit/1.0` e `name.localPart` igual a `Metadado` (usa o `value`);
2. se não houver, o `lexedit` do formato provisório.

`lerMetadadoLexEdit` e `lerIdsRemissoesInvalidas` passam a usar esse ponto, e os leitores de cada grupo (`lerOpcoesImpressao`, `lerFecho`) não mudam. Se o arquivo tiver os dois formatos, vale o novo (cenário da spec). O `TYPE_NAME` não é exigido na leitura, para tolerar JSON gerado à mão ou por outro produtor.

### 5. Integração: ida e volta real e validação com `lexedit.xsd`

- `web-test-runner.documento-articulado.config.mjs` passa a validar com `schemas/lexedit.xsd` como entrada, no lugar de `lexml-simples.xsd` (fato 7). Como ele importa o LexML, os cenários que já existem continuam cobertos.
- Depois do `toxml`, o comando verifica se o arquivo de saída existe e, se não existir, falha com uma mensagem clara, porque o CLI sai com código 0 quando falha (fato 4). A mensagem de erro de `JSONIX_LEXML_CLI` passa a citar a versão 2.0.0.
- Os cenários de opções de impressão e de fecho deixam de fixar a limitação (`lerMetadadoLexEdit(...)` igual a `{}`) e passam a exigir que o JSON devolvido pelo CLI, aberto e salvo de novo, seja `deep.equal` ao salvo, sem remover o `metadadoProprietario`.
- O cenário de remissão inválida passa a usar `validar-documento-lexml` (com `tojson`) e a exigir `refIdsRemissoesInternas` no XML e a lista de ids lida de volta. O comando `toxml-e-validar-lexml` deixa de ter uso e é removido, junto com o comentário sobre o descarte.
- Um cenário novo reúne os quatro grupos no mesmo documento (requisito "Ida e volta").

### 6. Fixtures e E2E

As quatro fixtures de `demo/doc/` são geradas de novo com `criarDocumentoArticulado`, como na c02, e os dois specs Cypress de `documento-articulado/` e o de remissão inválida continuam valendo sem mudança de roteiro. Para cobrir o legado pela UI real, a versão atual (formato provisório) de `teste_opcoes_impressao.json` é preservada como `demo/doc/teste_metadado_lexedit_provisorio.json` antes da regeneração, e um caso novo em `abertura-opcoes-impressao.cy.ts` abre esse arquivo e confere o formulário.

## Risks / Trade-offs

- **[Arquivos salvos no formato provisório por hosts já em uso]** → A leitura legada (Decisão 4) mantém os dados. O risco que sobra é um host converter um arquivo antigo com o CLI 2.0.0 sem antes abri-lo no editor: os metadados se perdem (fato 2). Mitigação: registrar o fato no `CLAUDE.md` para quem mantém o `lexeditweb-editor`.
- **[Mudança de formato para o `lexeditweb-editor`]** → O host não interpreta o conteúdo, só repassa ao CLI, e o binário dele já é o 2.0.0, que espera exatamente esse formato. Não há ajuste de código previsto do lado do host.
- **[Testes de integração dependem da versão do CLI]** → Com o 1.0.0 em `JSONIX_LEXML_CLI`, os cenários novos falham (o conteúdo volta vazio). Isso é intencional, e a mensagem da variável passa a citar 2.0.0.
- **[CLI com código 0 em caso de falha]** → Mitigado nos testes pela checagem do arquivo de saída (Decisão 5). No host o risco continua: recomendar ao repositório `jsonix-lexml` sair com código diferente de 0 quando o `toxml`/`tojson` falhar.
- **[`TYPE_NAME` acoplado aos nomes gerados pelo jsonix]** → Se os mapeamentos forem gerados de novo com outro nome de módulo, o arquivo salvo muda. Aceito: os nomes seguem o mesmo padrão dos `br_gov_lexml__1.*` que o editor já grava.

- **[Rótulo devolvido como objeto pelo CLI 2.0.0 (encontrado na implementação)]** → O commit `78ae45f` do `jsonix-lexml` (ajuste ao esquema LexML, 22/09) mudou `Rotulo` de `xsd:string` para `stringComIdType`. Com isso, o `tojson` passou a devolver `rotulo: { TYPE_NAME: 'br_gov_lexml__1.StringComIdType', value }`, e a abertura do JSON devolvido pelo CLI falha, com ou sem `lexedit`. O `lexml-emenda` lê o rótulo do mesmo jeito e quebraria igual. O `toxml` continua aceitando o rótulo como texto. Isolado por teste: normalizar o `rotulo` na saída do `tojson` faz a suíte de integração inteira passar (10 de 10). Decisão: **não** contornar no editor. **Resolvido na origem** pelo commit `9c02a3d` do `jsonix-lexml` (23/09, mesma versão 2.0.0), que mantém `Rotulo` como `xsd:string` como desvio intencional do esquema oficial (o `id` no rótulo não é usado). Com o binário atualizado, a suíte de integração passou 10 de 10, sem mudança no editor.

## Migration Plan

Não há migração de dados: os arquivos no formato provisório são convertidos quando abertos e salvos de novo. Não há rollback de formato: uma versão anterior do editor não lê o formato novo (a leitura antiga só procura `lexedit`) e abre esses arquivos com os valores padrão, sem erro.

## Open Questions

Nenhuma.
