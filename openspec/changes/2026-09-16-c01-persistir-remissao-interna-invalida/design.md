## Context

Ver proposal.md — Why. Fatos do estado atual necessários para justificar as decisões abaixo:

- **Serialização hoje**: `injetarLinksRemissaoNoTexto` (`buildJsonixFromProjetoNorma.ts:550-584`) grava `href="@invalido"`/`data-lexml-ref="@invalido"` para toda entrada com `valida === false`, descartando `entry.targetLexmlId`. Esse comportamento está fixado em dois testes existentes (`buildJsonixFromProjetoNorma.content.test.ts:1000-1027` e `:1190-1196`).
- **Abertura hoje é mais robusta do que uma leitura isolada sugere**: `abreArticulacao.ts` roda dois reducers em sequência e faz merge do resultado — `inicializaRemissoesAoAbrir.ts` (registra remissões cujo alvo resolve, reescrevendo `href` para `#lxEtaId{uuid}`) e `loadArticulacao.ts#detectarRemissoesInvalidasAoCarregar` (varre todo `<a class="lexml-remissao-interna">` cujo `data-lexml-ref` **não** resolve mais e já cria a entrada `valida:false`, a mensagem de erro no dispositivo e o alerta global). Ou seja: **a reconstrução de estado inválido ao abrir já existe hoje**, via heurística "o id não resolve mais" — o que falta é (a) o destino preservado no arquivo (hoje é `@invalido`, um id que nunca existiu, então o destino original se perde) e (b) uma fonte autoritativa independente da heurística, que hoje é vulnerável a falso-negativo quando um id textual reaparece em outro dispositivo após reestruturação (`art4` excluído; depois de reordenar, outro dispositivo é renumerado para `art4` — a heurística passaria a considerar o link "resolvido", silenciosamente apontando para o dispositivo errado).
- **`MetadadoProprietario` não existe em nenhuma parte do código.** `montaCabecalho` (`buildJsonixFromProjetoNorma.ts:38-56`) só produz `metadado.identificacao`.
- **`documento-articulado.json` é inteiramente auto-consumido.** `buildJsonixFromProjetoNorma.ts`/`buildProjetoNormaFromJsonix.ts` são um marshaller próprio que imita a forma do jsonix real (mesma convenção `name`/`value`/`TYPE_NAME`), mas não usa a biblioteca jsonix real em tempo de execução — só a suíte de integração (`documentoArticulado.integration.ts`) invoca o CLI externo `jsonix-lexml` (repositório irmão) via `JSONIX_LEXML_CLI`, para provar que o JSON produzido converte para XML válido contra o XSD real.
- **Achado empírico (verificado com o binário `jsonix-lexml-macos` disponível localmente):** o CLI real não consegue transportar conteúdo de `MetadadoProprietario` em nenhuma direção. `toxml` emite `<MetadadoProprietario fonte="...">` mas descarta silenciosamente qualquer campo de conteúdo que eu tentei (`content`, `any` — nenhum nome de propriedade JSON reconhecido pelo mapping real para o `xsd:any processContents="skip"`); `tojson`, ao processar um XML com `MetadadoProprietario` preenchido, quebra com `TypeError: Converting circular structure to JSON` (o wildcard é desserializado como nó DOM real, com referência circular via `ownerDocument`, que o próprio CLI não sanitiza antes de serializar). Isso é uma lacuna do CLI externo, não do nosso marshaller — mas limita o que a suíte de integração consegue provar (ver Decisions #5).
- **`MetadadoProprietario` exige `fonte` (`xsd:anyURI`, `use="required"`)** em `test/schemas/lexml/lexml-simples.xsd:283` — confirmado empiricamente com o validador Java (`scripts/ValidarDocumentoLexml.java`): documento sem `fonte` é rejeitado.
- **O exemplo de referência da especificação 99** (`docs/extensao-formato-lexml/documento-articulado-exemplo.xml`) tem dois problemas estruturais, achados ao validá-lo contra o XSD durante esta investigação: falta o atributo `fonte` em `MetadadoProprietario`, e `<Articulacao>` está aninhado dentro de `<ParteInicial>` em vez de ser irmão dela (violando `HierarchicalStructure`, que define `ParteInicial`, `Articulacao`, `ParteFinal`, `Anexos` em sequência, não aninhados). O restante do exemplo (incluindo `<Remissao xlink:href='art4' id='_ri13481093417'>`, `RemissoesInternasInvalidas` e `Pendencias`) valida normalmente depois de corrigidos esses dois pontos.
- `id` em elementos LexML (incluindo `Remissao`, via `coreopt` → `xsd:ID`) é único no documento inteiro; `validarDocumentoArticulado` (`documentoArticulado.ts:57-69`) já varre toda a árvore coletando `id`s e rejeitando duplicados — os novos `id="_ri..."` são cobertos por essa validação sem mudança adicional.

## Goals / Non-Goals

**Goals:**
- Definir a forma exata do campo `metadadoProprietario` dentro de `documento-articulado.json` — contrato nosso, não uma tentativa de espelhar a forma (inatingível em JSON puro) que o jsonix real usaria para `xsd:any`.
- Definir onde cada peça de código muda, com o menor raio de alteração possível no lado de abertura, já que a reconstrução de estado inválido já funciona hoje por heurística.
- Definir a geração e a estabilidade do `id` `_ri...` entre saves sucessivos.
- Definir como a lista `RemissoesInternasInvalidas` se torna a fonte autoritativa, sem descartar a heurística existente (que continua servindo de rede de segurança para documentos sem metadados do LexEdit).
- Definir o escopo da verificação de integração diante da limitação do CLI real.

**Non-Goals:**
- Corrigir o CLI `jsonix-lexml` (repositório irmão, fora deste projeto) — a limitação encontrada é documentada como risco conhecido, não corrigida aqui.
- Corrigir os dois problemas estruturais achados no exemplo `documento-articulado-exemplo.xml` — fica registrado aqui para uma correção pontual e avulsa da documentação, não faz parte desta change de código.
- Implementar qualquer outro grupo `lexedit` (specs 02-09, 11-13) além de `RemissoesInternasInvalidas` e do único item computável de `Pendencias`.
- Produzir um XSD formal para o namespace `lexedit` — `MetadadoProprietario` usa `processContents="skip"`, então nenhum XSD auxiliar é necessário para a suíte de teste atual passar.
- Persistir tombstones (`excluidaManualmente`) — decisão já tomada, permanecem artefato de sessão.
- Mexer na corrida de clique/menu de contexto documentada em `docs/analises/ANALISE_CORRIDA_CLIQUE_MENU_CONTEXTO.md` — não relacionada.

## Decisions

### 1. Forma do campo `metadadoProprietario` no contrato JSON

Como o campo é inteiramente auto-consumido (nosso writer, nosso reader — nunca o CLI real, que não sabe lidar com esse wildcard em nenhuma direção), a estrutura é desenhada para legibilidade e extensibilidade, não para imitar uma forma jsonix real inatingível:

```jsonc
"metadado": {
  "TYPE_NAME": "br_gov_lexml__1.Metadado",
  "identificacao": { /* ... já existente ... */ },
  "metadadoProprietario": [{
    "TYPE_NAME": "br_gov_lexml__1.MetadadoProprietario",
    "fonte": "http://www.lexml.gov.br/lexedit/1.0",
    "lexedit": {
      "remissoesInternasInvalidas": { "refIdsRemissoesInternas": ["_ri1758...", "_ri1758..."] },
      "pendencias": ["Corrigir remissões internas inválidas."]
    }
  }]
}
```

- `metadadoProprietario` é array (o XSD permite `maxOccurs="unbounded"`), mas nesta change sempre terá 0 ou 1 item — reserva espaço para múltiplas fontes no futuro sem exigir migração de forma.
- `fonte` fixo em `http://www.lexml.gov.br/lexedit/1.0` (mesma URI do namespace `lexedit`), conforme decidido.
- A chave `lexedit` é um objeto próprio (não um array de conteúdo bruto): cada grupo futuro da especificação 00 ganha sua própria chave aninhada (`autoria`, `anexos`, ...) sem reformar essa estrutura.
- `MetadadoProprietario` só é emitido quando há pelo menos um grupo `lexedit` para serializar (hoje: quando existe ao menos uma remissão inválida) — documento sem remissões inválidas não ganha o elemento, minimizando ruído e mantendo compatibilidade com arquivos já salvos.
- **Alternativas consideradas**: (a) gravar o fragmento XML como string bruta — descartada por perder legibilidade/type-safety sem nenhum ganho de interoperabilidade real, já que o CLI real não processa esse conteúdo de qualquer forma; (b) reproduzir a forma DOM que o jsonix real geraria — descartada, provado inatingível em JSON puro (achado empírico acima).

### 2. Serialização de `<Remissao>` inválida preserva o destino e ganha `id` estável

`injetarLinksRemissaoNoTexto` para de usar `@invalido`: quando `entry.valida === false`, usa `entry.targetLexmlId` (já preservado pelo Redux) como `href`/`data-lexml-ref`. `buildInlineElement`/`buildRemissao` (`buildJsonixFromProjetoNorma.ts:424-439, 732-750`) ganham um parâmetro opcional de `id`, propagado para o nó `<Remissao>` gerado.

O `id` é gerado no formato `_ri` + `Date.now()` (decisão já tomada) **na primeira vez** que uma entrada é serializada como inválida, e cacheado num novo campo opcional em `RemissaoInternaValue` (`idPersistido` ou nome equivalente a definir em tasks.md) — sem isso, cada acionamento de "Salvar" sem nenhuma mudança no documento geraria um `id` novo para o mesmo link, sujando diffs de um arquivo versionado externamente. Ao reabrir um documento (Decision #3), o `id` lido de `<Remissao id="_ri...">` é reidratado nesse mesmo campo, para que reabrir-e-salvar-sem-editar produza um arquivo estável.

### 3. Abertura: a heurística existente passa a ser complementada pela lista autoritativa, com menor raio de mudança que o previsto inicialmente

Como `loadArticulacao.ts#detectarRemissoesInvalidasAoCarregar` já reconstrói `valida:false`/mensagem/alerta para qualquer link cujo alvo não resolve, **a correção da Decision #2 sozinha já corrige o caso comum** (destino real preservado → heurística já funciona hoje sem nenhuma mudança adicional no reducer). O trabalho extra nesta área cobre só o que a heurística sozinha não garante:

- `montaTag` (`buildProjetoNormaFromJsonix.ts:312-344`) passa a ler `value.id` de um nó `Remissao` e emitir um atributo novo (`data-ri-id`, nome a confirmar em tasks.md) no `<a>` gerado, para que o `id` do LexML sobreviva no HTML do dispositivo — sem isso, não há como saber, ao abrir, qual link corresponde a qual entrada de `RemissoesInternasInvalidas`.
- `loadArticulacao.ts#detectarRemissoesInvalidasAoCarregar` passa a receber a lista de `id`s inválidos (lida de `metadadoProprietario` antes de chamar `load()`, repassada via `abreArticulacao.ts`) e a tratá-la como autoritativa: um link cujo `data-ri-id` conste na lista é `valida:false` **mesmo que seu `data-lexml-ref` resolva** para algum dispositivo (caso de id textual reaproveitado) — fechando a lacuna de falso-negativo da heurística pura. Links sem `data-ri-id` (documentos sem metadados do LexEdit, ou de terceiros) continuam cobertos só pela heurística existente, sem regressão.
- O `id` lido é propagado para o novo campo cacheado da Decision #2, fechando o ciclo de estabilidade entre abrir e salvar.

### 4. `Pendencias` é derivado, nunca lido de volta

`lexedit:Pendencias/Pendencia` é recalculado inteiramente a partir do estado reconstruído a cada save (hoje: presente sse existir ao menos uma entrada `valida:false` no registro) — não há necessidade de lê-lo ao abrir, pois o estado do qual ele deriva (`valida:false`) já é reconstruído por outro caminho (Decision #3). Isso evita um segundo mecanismo de sincronização (o que aconteceria se `Pendencias` fosse tratado como dado próprio em vez de projeção) e é consistente com o texto descritivo do item (frase fixa "Corrigir remissões internas inválidas.", não um dado estruturado).

### 5. Suíte de integração: round-trip completo não é exigido para `metadadoProprietario`

Dado o achado empírico de que o CLI real não transporta `xsd:any` em nenhuma direção, `documentoArticulado.integration.ts` ganha um cenário dedicado para documentos com remissão inválida que verifica só o que o CLI real comprovadamente suporta: `toxml` (nosso JSON → XML) seguido da validação XSD (`scripts/ValidarDocumentoLexml.java` contra `test/schemas/lexml/lexml-simples.xsd`) — ambos comprovadamente funcionam — mais uma checagem textual do fragmento esperado (`<MetadadoProprietario fonte="...">`, `<Remissao xlink:href="..." id="_ri...">`, `RemissoesInternasInvalidas`) na string XML retornada. O passo final de round-trip completo (`tojson` + `deep.equal` contra o JSON original), usado pelos demais cenários dessa suíte, não é aplicado a esse cenário — é o único ponto do contrato hoje sem essa garantia extremo-a-extremo, por limitação do CLI externo, não do nosso código.

## Risks / Trade-offs

- **[Risco] Limitação do CLI `jsonix-lexml` real para `xsd:any`** → Mitigação: Decision #5 (escopo reduzido do teste de integração); o comportamento do app em si não depende do CLI (JSON→JSON é auto-consumido), então usuários não são afetados — só a suíte de teste tem uma garantia a menos para este campo específico. Vale reportar a limitação ao mantenedor do repositório `jsonix-lexml`, mas isso é uma decisão do usuário, fora do escopo desta change.
- **[Risco] Documentos salvos por builds intermediárias desta funcionalidade** (ainda não publicada) com o sentinela `@invalido` não são migrados — ao reabrir, o destino original já está perdido no próprio arquivo, então nenhuma migração de código recuperaria essa informação. Aceitável: a funcionalidade nunca foi publicada.
- **[Trade-off] Cache do `id` em `RemissaoInternaValue`** aumenta ligeiramente a forma desse tipo (mais um campo opcional) em troca de estabilidade entre saves — alternativa seria gerar sempre um novo `id` a cada save (mais simples, mas suja diffs de arquivos versionados sem necessidade).
- **[Risco] `data-ri-id` no HTML do dispositivo** é mais um atributo a preservar através de todas as operações que já mexem em `data-lexml-ref`/`data-ref-id` (Quill, undo/redo, renumeração) — mitigado por segui-lo estritamente pelo mesmo padrão já estabelecido para esses dois atributos irmãos (mesmos pontos de código, mesmos testes de regressão).

## Open Questions

- Correção dos dois problemas estruturais achados em `docs/extensao-formato-lexml/documento-articulado-exemplo.xml` (falta `fonte`; `Articulacao` aninhado em `ParteInicial`) — não bloqueia esta change (o exemplo é só documentação ilustrativa, não é lido por nenhum código), mas fica pendente como correção avulsa de documentação.
